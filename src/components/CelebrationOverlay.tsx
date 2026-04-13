import { useEffect, useRef } from 'react'
import { playCelebrationSound } from '../utils/audio'

interface Props {
  onClose: () => void
  message?: string
}

// Generates a set of colorful confetti pieces
function Confetti() {
  const colors = ['#FF6B6B', '#FF9F43', '#FECA57', '#48DBFB', '#1DD1A1', '#FF6EB4', '#A29BFE', '#54A0FF']
  const pieces = Array.from({ length: 40 }, (_, i) => i)

  return (
    <>
      {pieces.map(i => {
        const left = Math.random() * 100
        const delay = Math.random() * 1.5
        const duration = 2 + Math.random() * 2
        const color = colors[Math.floor(Math.random() * colors.length)]
        const size = 8 + Math.random() * 10

        return (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${left}%`,
              top: '-20px',
              width: size,
              height: size,
              backgroundColor: color,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        )
      })}
    </>
  )
}

export default function CelebrationOverlay({ onClose, message = 'Vel gert!' }: Props) {
  const hasPlayed = useRef(false)

  useEffect(() => {
    if (!hasPlayed.current) {
      hasPlayed.current = true
      playCelebrationSound()
    }

    // Auto-close after 3 seconds
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
      style={{ background: 'rgba(255, 249, 240, 0.92)' }}
      onClick={onClose}
    >
      <Confetti />

      <div className="animate-star-pop flex flex-col items-center gap-4 relative z-10">
        {/* Stars */}
        <div className="flex gap-3 text-6xl">
          {'⭐'.repeat(5).split('').map((_s, i) => (
            <span
              key={i}
              className="animate-star-pop"
              style={{ animationDelay: `${i * 0.1}s`, display: 'inline-block' }}
            >
              ⭐
            </span>
          ))}
        </div>

        <div
          className="text-6xl font-bold mt-4 text-center px-8"
          style={{ color: '#FF6B6B', fontFamily: 'Fredoka, sans-serif', textShadow: '2px 2px 0 rgba(0,0,0,0.1)' }}
        >
          {message}
        </div>

        <div className="text-4xl">🎉🎊🎉</div>
      </div>
    </div>
  )
}
