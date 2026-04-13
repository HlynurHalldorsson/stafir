import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { words, distractorCount, tileColor, pickDistractors, type WordData } from '../data/words'
import { speakWord, speakText, playCorrectSound, playWrongSound } from '../utils/audio'
import { useGame } from '../store/GameContext'
import CelebrationOverlay from './CelebrationOverlay'

interface Props {
  onHome: () => void
}

// A single letter tile with a stable unique id (handles duplicate letters)
interface Tile {
  id: string
  letter: string
}

type Phase = 'playing' | 'correct' | 'wrong'

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

// Pick the next word, avoiding the last few seen
function pickWord(wordList: WordData[], recentWords: string[]): WordData {
  const pool = wordList.filter(w => !recentWords.includes(w.word))
  const source = pool.length > 0 ? pool : wordList
  return source[Math.floor(Math.random() * source.length)]
}

function buildPool(word: WordData): Tile[] {
  const wordLetters = word.word.split('')
  const distractors = pickDistractors(wordLetters, distractorCount(wordLetters.length))
  const allLetters = [...wordLetters, ...distractors]
  return shuffle(allLetters.map((letter, i) => ({ id: `tile-${letter}-${i}`, letter })))
}

export default function WordBuildMode({ onHome }: Props) {
  // Shuffle word list once on mount
  const shuffledWords = useMemo(() => shuffle(words), [])
  const { markWordLearned, earnStars } = useGame()
  const recentWords = useRef<string[]>([])

  const [current, setCurrent] = useState<WordData>(() => shuffledWords[0])
  const [slots, setSlots] = useState<(Tile | null)[]>([])
  const [pool, setPool] = useState<Tile[]>([])
  const [phase, setPhase] = useState<Phase>('playing')
  const [emojiTapCount, setEmojiTapCount] = useState(0)
  const [hintActive, setHintActive] = useState(false)
  const [score, setScore] = useState(0)
  const [roundsThisMilestone, setRoundsThisMilestone] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  // Index of most recently filled slot, for pop animation
  const [poppedSlot, setPoppedSlot] = useState<number | null>(null)

  // ─── Round initialisation ────────────────────────────────────────────────

  const initRound = useCallback((word: WordData) => {
    setSlots(Array(word.word.length).fill(null))
    setPool(buildPool(word))
    setPhase('playing')
    setEmojiTapCount(0)
    setHintActive(false)
    setPoppedSlot(null)
    // Speak the word after a short settle delay
    setTimeout(() => speakWord(word.spoken), 400)
  }, [])

  useEffect(() => {
    initRound(current)
  }, [current, initRound])

  // ─── Next round ──────────────────────────────────────────────────────────

  const nextRound = useCallback(() => {
    recentWords.current = [...recentWords.current.slice(-5), current.word]
    setCurrent(pickWord(shuffledWords, recentWords.current))
  }, [current, shuffledWords])

  // ─── Emoji tap (listen / hint) ───────────────────────────────────────────

  const handleEmojiTap = useCallback(() => {
    if (phase !== 'playing') return
    const newCount = emojiTapCount + 1
    setEmojiTapCount(newCount)
    speakWord(current.spoken)
    // On third+ tap: activate the hint glow on the next correct tile
    if (newCount >= 3) setHintActive(true)
  }, [phase, emojiTapCount, current])

  // ─── Tap a pool tile → place in next empty slot ──────────────────────────

  const handlePoolTileTap = useCallback((tile: Tile) => {
    if (phase !== 'playing') return
    const nextEmpty = slots.findIndex(s => s === null)
    if (nextEmpty === -1) return  // all slots full (shouldn't happen mid-play)

    const newSlots = [...slots]
    newSlots[nextEmpty] = tile
    setSlots(newSlots)
    setPool(prev => prev.filter(t => t.id !== tile.id))
    setPoppedSlot(nextEmpty)
    setTimeout(() => setPoppedSlot(null), 350)

    // Check completion after this placement
    const allFilled = newSlots.every(s => s !== null)
    if (allFilled) {
      const assembled = newSlots.map(s => s!.letter).join('')
      if (assembled === current.word) {
        handleCorrect(newSlots)
      } else {
        handleWrong(newSlots)
      }
    }
  }, [phase, slots, current]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Tap a filled slot → return letter to pool ───────────────────────────

  const handleSlotTap = useCallback((index: number) => {
    if (phase !== 'playing') return
    const tile = slots[index]
    if (!tile) return
    const newSlots = [...slots]
    newSlots[index] = null
    setSlots(newSlots)
    setPool(prev => shuffle([...prev, tile]))
  }, [phase, slots])

  // ─── Correct ─────────────────────────────────────────────────────────────

  const handleCorrect = useCallback((finalSlots: (Tile | null)[]) => {
    void finalSlots
    setPhase('correct')
    playCorrectSound()
    markWordLearned(current.word)   // awards 2⭐ + 4⭐ if new word
    setScore(s => s + 1)

    const newRounds = roundsThisMilestone + 1
    if (newRounds >= 5) {
      setRoundsThisMilestone(0)
      earnStars(5)                  // 5-streak bonus
      setTimeout(() => setShowCelebration(true), 800)
    } else {
      setRoundsThisMilestone(newRounds)
      setTimeout(() => speakText('Vel gert!'), 200)
      setTimeout(nextRound, 1500)
    }
  }, [current, roundsThisMilestone, nextRound, markWordLearned, earnStars])

  // ─── Wrong ───────────────────────────────────────────────────────────────

  const handleWrong = useCallback((_finalSlots: (Tile | null)[]) => {
    setPhase('wrong')
    playWrongSound()
    // Re-speak the word slowly after a moment
    setTimeout(() => speakWord(current.spoken), 500)
    // Bounce letters back to pool after the shake animation
    setTimeout(() => {
      setSlots(Array(current.word.length).fill(null))
      setPool(buildPool(current))
      setPhase('playing')
    }, 1000)
  }, [current])

  // ─── Celebration close ───────────────────────────────────────────────────

  const handleCelebrationClose = useCallback(() => {
    setShowCelebration(false)
    setTimeout(() => speakText('Vel gert!'), 100)
    setTimeout(nextRound, 600)
  }, [nextRound])

  // ─── Hint: which pool tile should glow? ──────────────────────────────────
  // Find the first unfilled slot position and highlight pool tiles matching that letter.
  const hintLetter = useMemo(() => {
    if (!hintActive) return null
    const firstEmpty = slots.findIndex(s => s === null)
    if (firstEmpty === -1) return null
    return current.word[firstEmpty]
  }, [hintActive, slots, current])

  // ─── Render ──────────────────────────────────────────────────────────────

  const wordLen = current.word.length
  // Slot size scales down a bit for longer words on small screens
  const slotSize = wordLen <= 2 ? 80 : wordLen === 3 ? 76 : 68

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #fff9f0 0%, #e8f4ff 100%)' }}
    >
      {showCelebration && (
        <CelebrationOverlay onClose={handleCelebrationClose} message="Vel gert! 🎉" />
      )}

      {/* Top bar */}
      <div
        className="flex items-center justify-between gap-3 p-4 sticky top-0 z-10"
        style={{ background: 'rgba(255,249,240,0.9)', backdropFilter: 'blur(8px)' }}
      >
        <button
          onClick={onHome}
          className="rounded-2xl flex items-center justify-center shadow-md active:scale-95 transition-transform"
          style={{ width: 56, height: 56, background: '#FF6B6B', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}
          aria-label="Heim"
        >
          🏠
        </button>
        <div className="text-xl font-bold" style={{ fontFamily: 'Fredoka, sans-serif', color: '#54A0FF' }}>
          Settu saman orðið
        </div>
        <div
          className="rounded-2xl px-4 py-2 text-xl font-bold shadow-md flex items-center gap-2"
          style={{ background: '#FECA57', fontFamily: 'Fredoka, sans-serif', color: '#333' }}
        >
          ⭐ {score}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-3 py-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: 16, height: 16,
              background: i < roundsThisMilestone ? '#54A0FF' : '#ddd',
              transform: i < roundsThisMilestone ? 'scale(1.2)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* Emoji (tappable to hear word / get hint) */}
      <div className="flex justify-center pt-4 pb-2">
        <button
          onClick={handleEmojiTap}
          className="rounded-3xl flex items-center justify-center active:scale-90 transition-transform shadow-xl"
          style={{
            width: 140, height: 140,
            background: 'linear-gradient(135deg, #fff, #f0f0ff)',
            border: '3px solid #e0d5f5',
            cursor: 'pointer',
            fontSize: '5rem',
            lineHeight: 1,
          }}
          aria-label={`Hlusta á ${current.spoken}`}
        >
          {current.emoji}
        </button>
      </div>

      {/* Small "tap to hear" icon */}
      <div className="flex justify-center mb-4">
        <span style={{ fontSize: '1.2rem', opacity: 0.5 }}>🔊</span>
      </div>

      {/* Answer slots */}
      <div className="flex justify-center gap-3 px-4 mb-6">
        {slots.map((tile, i) => {
          const isPopped = poppedSlot === i
          const isCorrectFlash = phase === 'correct' && tile !== null
          const isWrongShake = phase === 'wrong' && tile !== null
          const colors = tile ? tileColor(tile.letter) : null

          return (
            <button
              key={i}
              onClick={() => handleSlotTap(i)}
              disabled={!tile || phase !== 'playing'}
              className={`rounded-2xl flex items-center justify-center transition-all
                ${isPopped ? 'animate-bounce-pop' : ''}
                ${isWrongShake ? 'animate-shake' : ''}
              `}
              style={{
                width: slotSize,
                height: slotSize,
                background: isCorrectFlash
                  ? '#1DD1A1'
                  : tile
                  ? colors!.bg
                  : 'transparent',
                border: tile
                  ? 'none'
                  : `3px dashed ${isWrongShake ? '#FF6B6B' : '#ccc'}`,
                cursor: tile ? 'pointer' : 'default',
                transition: 'background 0.2s',
                boxShadow: tile ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              {tile && (
                <span
                  className="font-bold"
                  style={{
                    fontSize: slotSize <= 68 ? '1.9rem' : '2.2rem',
                    color: isCorrectFlash ? '#fff' : colors!.text,
                    fontFamily: 'Fredoka, sans-serif',
                  }}
                >
                  {tile.letter}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Pool tiles */}
      <div className="flex flex-wrap justify-center gap-3 px-6">
        {pool.map(tile => {
          const colors = tileColor(tile.letter)
          const isHint = hintActive && tile.letter === hintLetter

          return (
            <button
              key={tile.id}
              onClick={() => handlePoolTileTap(tile)}
              disabled={phase !== 'playing'}
              className={`rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform
                ${isHint ? 'animate-float' : ''}
              `}
              style={{
                width: 72, height: 72,
                background: colors.bg,
                border: isHint ? '3px solid #FFD700' : 'none',
                cursor: 'pointer',
                boxShadow: isHint
                  ? '0 0 0 4px rgba(255,215,0,0.4), 0 4px 12px rgba(0,0,0,0.15)'
                  : '0 4px 12px rgba(0,0,0,0.15)',
              }}
              aria-label={tile.letter}
            >
              <span
                className="font-bold"
                style={{ fontSize: '2rem', color: colors.text, fontFamily: 'Fredoka, sans-serif' }}
              >
                {tile.letter}
              </span>
            </button>
          )
        })}
      </div>

      <div className="h-10" />
    </div>
  )
}
