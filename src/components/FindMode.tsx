import { useState, useEffect, useCallback, useRef } from 'react'
import { letters, type LetterData } from '../data/letters'
import { speakLetter, playCorrectSound, playWrongSound } from '../utils/audio'
import { useGame } from '../store/GameContext'
import CelebrationOverlay from './CelebrationOverlay'

interface Props {
  onHome: () => void
}

function pickTarget(recentLetters: string[]): LetterData {
  const pool = letters.filter(l => !recentLetters.includes(l.letter))
  const source = pool.length > 0 ? pool : letters
  return source[Math.floor(Math.random() * source.length)]
}

export default function FindMode({ onHome }: Props) {
  const { markLetterLearned, earnStars } = useGame()
  const [target, setTarget] = useState<LetterData>(() => letters[Math.floor(Math.random() * letters.length)])
  const [shaking, setShaking] = useState<string | null>(null)
  const [found, setFound] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [score, setScore] = useState(0)
  const [roundsThisMilestone, setRoundsThisMilestone] = useState(0)
  const recentLetters = useRef<string[]>([])

  // Speak the target letter when it changes
  useEffect(() => {
    setFound(null)
    const t = setTimeout(() => speakLetter(target.letter), 400)
    return () => clearTimeout(t)
  }, [target])

  const speakTarget = useCallback(() => {
    speakLetter(target.letter)
  }, [target])

  const nextTarget = useCallback(() => {
    recentLetters.current = [...recentLetters.current.slice(-6), target.letter]
    setTarget(pickTarget(recentLetters.current))
  }, [target])

  const handleLetterTap = useCallback((item: LetterData) => {
    if (found) return

    if (item.letter === target.letter) {
      setFound(item.letter)
      playCorrectSound()
      markLetterLearned(item.letter)   // awards 1⭐ + 3⭐ if new letter
      setScore(s => s + 1)

      const newRounds = roundsThisMilestone + 1
      if (newRounds >= 5) {
        setRoundsThisMilestone(0)
        earnStars(3)                   // 5-streak bonus
        setShowCelebration(true)
      } else {
        setRoundsThisMilestone(newRounds)
        setTimeout(nextTarget, 900)
      }
    } else {
      playWrongSound()
      setShaking(item.letter)
      setTimeout(() => setShaking(null), 400)
    }
  }, [found, target, roundsThisMilestone, nextTarget])

  const handleCelebrationClose = useCallback(() => {
    setShowCelebration(false)
    nextTarget()
  }, [nextTarget])

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #fff9f0 0%, #e0f7ff 100%)' }}
    >
      {showCelebration && (
        <CelebrationOverlay onClose={handleCelebrationClose} message="Fant hann! 🎉" />
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 p-4 sticky top-0 z-10" style={{ background: 'rgba(255,249,240,0.9)', backdropFilter: 'blur(8px)' }}>
        <button
          onClick={onHome}
          className="rounded-2xl flex items-center justify-center shadow-md active:scale-95 transition-transform"
          style={{ width: '56px', height: '56px', background: '#FF6B6B', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}
          aria-label="Heim"
        >
          🏠
        </button>
        <div
          className="text-2xl font-bold"
          style={{ fontFamily: 'Fredoka, sans-serif', color: '#54A0FF' }}
        >
          Finndu stafinn!
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
              width: '16px',
              height: '16px',
              background: i < roundsThisMilestone ? '#54A0FF' : '#ddd',
              transform: i < roundsThisMilestone ? 'scale(1.2)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* Listen button + hint */}
      <div className="flex justify-center px-4 pb-3">
        <button
          onClick={speakTarget}
          className="rounded-3xl flex items-center gap-4 px-8 py-4 shadow-xl active:scale-95 transition-transform"
          style={{
            background: 'linear-gradient(135deg, #54A0FF, #48DBFB)',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="Hlusta aftur"
        >
          <span style={{ fontSize: '2.5rem' }}>🔊</span>
          <span
            className="text-white font-bold text-2xl"
            style={{ fontFamily: 'Fredoka, sans-serif' }}
          >
            Hlusta
          </span>
        </button>
      </div>

      {/* Letter grid */}
      <div className="grid gap-3 p-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))' }}>
        {letters.map(item => {
          const isFound = found === item.letter
          const isShaking = shaking === item.letter

          return (
            <button
              key={item.letter}
              onClick={() => handleLetterTap(item)}
              className={`rounded-3xl flex flex-col items-center justify-center shadow-md transition-all ${isShaking ? 'animate-shake' : 'active:scale-95'} ${isFound ? 'scale-110 ring-4 ring-green-400' : ''}`}
              style={{
                background: isFound ? '#1DD1A1' : item.color,
                minHeight: '90px',
                border: 'none',
                cursor: 'pointer',
                padding: '12px 8px',
              }}
            >
              <span
                className="font-bold leading-none"
                style={{ fontSize: '2.2rem', color: isFound ? '#fff' : item.textColor, fontFamily: 'Fredoka, sans-serif' }}
              >
                {item.letter}
              </span>
              {isFound && <span className="text-xl mt-1">✓</span>}
            </button>
          )
        })}
      </div>

      <div className="h-8" />
    </div>
  )
}
