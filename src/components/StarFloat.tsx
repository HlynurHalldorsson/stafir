import { createPortal } from 'react-dom'
import { useGame } from '../store/GameContext'

// Renders animated "+N ⭐" floats fixed near the star counter (top-right)
export default function StarFloat() {
  const { starFloats } = useGame()

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 14,
        right: 70,
        zIndex: 9000,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 4,
      }}
    >
      {starFloats.map(f => (
        <div
          key={f.id}
          style={{
            fontFamily: 'Fredoka, sans-serif',
            fontWeight: 700,
            fontSize: '1.3rem',
            color: '#FECA57',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            animation: 'star-float-up 1.3s ease-out forwards',
            whiteSpace: 'nowrap',
          }}
        >
          +{f.amount} ⭐
        </div>
      ))}
    </div>,
    document.body,
  )
}
