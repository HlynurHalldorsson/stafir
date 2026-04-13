import { useState, useCallback, useEffect, useRef } from 'react'
import { letters, type LetterData } from '../data/letters'
import { speakLetterAndWord, preloadAudioCache } from '../utils/audio'
import { getLearnedLetters } from '../utils/storage'
import { useGame } from '../store/GameContext'

interface Props {
  onHome: () => void
}

export default function ExploreMode({ onHome }: Props) {
  const { earnStars } = useGame()
  const [active, setActive] = useState<string | null>(null)
  const [animating, setAnimating] = useState<string | null>(null)
  const learned = getLearnedLetters()
  // Track which letters tapped this session to award "explore all" bonus
  const sessionTapped = useRef<Set<string>>(new Set())
  const awardedAll = useRef(false)

  // Warm the audio file cache on mount so first taps have no delay
  useEffect(() => { preloadAudioCache(letters) }, [])

  const handleCardTap = useCallback((item: LetterData) => {
    // Trigger animation
    setAnimating(item.letter)

    // Track session taps for explore-all bonus
    sessionTapped.current.add(item.letter)
    if (!awardedAll.current && sessionTapped.current.size === letters.length) {
      awardedAll.current = true
      earnStars(2)
    }
    setActive(item.letter)
    setTimeout(() => setAnimating(null), 500)

    // Speak letter then word
    speakLetterAndWord(item.letter, item.word)
  }, [])

  const activeItem = active ? letters.find(l => l.letter === active) : null

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #fff9f0 0%, #ffecd2 100%)' }}
    >
      {/* Top bar */}
      <div className="flex items-center gap-3 p-4 sticky top-0 z-10" style={{ background: 'rgba(255,249,240,0.9)', backdropFilter: 'blur(8px)' }}>
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
          style={{ fontFamily: 'Fredoka, sans-serif', color: '#FF6B6B' }}
        >
          Skoða stafi
        </div>
      </div>

      {/* Active letter spotlight */}
      {activeItem && (
        <div
          className="mx-4 mb-4 rounded-3xl p-5 flex items-center gap-5 shadow-lg"
          style={{ background: activeItem.color }}
        >
          <span className="text-6xl">{activeItem.emoji}</span>
          <div>
            <div
              className="text-5xl font-bold"
              style={{ color: activeItem.textColor, fontFamily: 'Fredoka, sans-serif' }}
            >
              {activeItem.letter}
            </div>
            <div
              className="text-2xl"
              style={{ color: activeItem.textColor, fontFamily: 'Fredoka, sans-serif', opacity: 0.9 }}
            >
              {activeItem.word}
            </div>
          </div>
        </div>
      )}

      {/* Letter grid */}
      <div className="grid gap-3 p-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))' }}>
        {letters.map(item => {
          const isLearned = learned.has(item.letter)
          const isAnimating = animating === item.letter

          return (
            <button
              key={item.letter}
              onClick={() => handleCardTap(item)}
              className={`rounded-3xl flex flex-col items-center justify-center shadow-md active:scale-95 transition-transform relative ${isAnimating ? 'animate-bounce-pop' : ''}`}
              style={{
                background: item.color,
                minHeight: '90px',
                border: 'none',
                cursor: 'pointer',
                padding: '12px 8px',
              }}
            >
              {/* Checkmark badge for learned letters */}
              {isLearned && (
                <div
                  className="absolute top-1 right-1 rounded-full flex items-center justify-center text-xs"
                  style={{ width: '20px', height: '20px', background: 'rgba(255,255,255,0.9)', fontSize: '12px' }}
                >
                  ✓
                </div>
              )}
              <span
                className="font-bold leading-none"
                style={{ fontSize: '2.2rem', color: item.textColor, fontFamily: 'Fredoka, sans-serif' }}
              >
                {item.letter}
              </span>
              <span className="text-xl mt-1">{item.emoji}</span>
            </button>
          )
        })}
      </div>

      {/* Bottom padding */}
      <div className="h-8" />
    </div>
  )
}
