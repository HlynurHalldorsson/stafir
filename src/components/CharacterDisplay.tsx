// Layered emoji character display.
// Layers (bottom to top): background, color glow, body emoji, hat, accessory.

import type { GameState, CharacterType } from '../store/gameState'

interface Props {
  state: GameState
  size?: number     // outer container size in px
  onClick?: () => void
}

// Base emoji for each character
const BODY_EMOJI: Record<CharacterType, string> = {
  puffin: '🐧',
  horse:  '🐴',
  viking: '🧒',
}

// Body color CSS values (circle behind the emoji)
const BODY_COLORS: Record<string, string> = {
  color_default: 'transparent',
  color_blue:    '#54A0FF',
  color_red:     '#FF6B6B',
  color_yellow:  '#FECA57',
  color_purple:  '#A29BFE',
  color_rainbow: 'linear-gradient(135deg, #FF6B6B, #FECA57, #1DD1A1, #54A0FF, #A29BFE)',
}

// Background styles
function bgStyle(bgId: string): React.CSSProperties {
  switch (bgId) {
    case 'bg_mountain':
      return { background: 'linear-gradient(180deg, #87ceeb 0%, #c8e6c9 60%, #a5d6a7 100%)' }
    case 'bg_ocean':
      return { background: 'linear-gradient(180deg, #48DBFB 0%, #54A0FF 100%)' }
    case 'bg_space':
      return { background: 'linear-gradient(180deg, #0d0d2b 0%, #1a1a4e 100%)' }
    case 'bg_lights':
      return { background: 'linear-gradient(180deg, #0d2b1a 0%, #1a4e2b 40%, #2b0d4e 100%)', animation: 'aurora 4s ease-in-out infinite' }
    default:
      return { background: '#fff9f0' }
  }
}

// Hat emoji displayed on top of the character
const HAT_EMOJI: Record<string, string | null> = {
  hat_none:     null,
  hat_viking:   '🪖',
  hat_umbrella: '🌂',
  hat_crown:    '👑',
  hat_flower:   '🌸',
  hat_rainbow:  '🌈',
}

// Accessory emoji displayed beside the character
const ACC_EMOJI: Record<string, string | null> = {
  acc_none:  null,
  acc_star:  '⭐',
  acc_heart: '💛',
  acc_book:  '📖',
  acc_moon:  '🌙',
}

export default function CharacterDisplay({ state, size = 120, onClick }: Props) {
  const { character, equippedItems } = state
  if (!character) return null

  const body    = BODY_EMOJI[character]
  const hat     = HAT_EMOJI[equippedItems.hat] ?? null
  const acc     = ACC_EMOJI[equippedItems.accessory] ?? null
  const bodyBg  = BODY_COLORS[equippedItems.color] ?? 'transparent'
  const bg      = bgStyle(equippedItems.background)

  const emojiSize   = Math.round(size * 0.52)
  const hatSize     = Math.round(size * 0.35)
  const accSize     = Math.round(size * 0.3)
  const discSize    = Math.round(size * 0.65)

  return (
    <div
      onClick={onClick}
      className={onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}
      style={{
        width: size, height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...bg,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}
    >
      {/* Color disc behind body */}
      <div
        style={{
          position: 'absolute',
          width: discSize, height: discSize,
          borderRadius: '50%',
          background: bodyBg,
          opacity: equippedItems.color === 'color_default' ? 0 : 0.55,
          animation: equippedItems.color === 'color_rainbow' ? 'aurora 3s ease-in-out infinite' : undefined,
        }}
      />

      {/* Body emoji */}
      <span
        className="animate-float select-none"
        style={{ fontSize: emojiSize, lineHeight: 1, position: 'relative', zIndex: 1 }}
        role="img"
        aria-label={character}
      >
        {body}
      </span>

      {/* Hat — anchored to top-center */}
      {hat && (
        <span
          style={{
            position: 'absolute',
            top: Math.round(size * 0.04),
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: hatSize,
            lineHeight: 1,
            zIndex: 2,
            pointerEvents: 'none',
          }}
          aria-hidden
        >
          {hat}
        </span>
      )}

      {/* Accessory — bottom-right */}
      {acc && (
        <span
          className="animate-float"
          style={{
            position: 'absolute',
            bottom: Math.round(size * 0.06),
            right: Math.round(size * 0.04),
            fontSize: accSize,
            lineHeight: 1,
            zIndex: 2,
            pointerEvents: 'none',
            animationDelay: '0.4s',
          }}
          aria-hidden
        >
          {acc}
        </span>
      )}
    </div>
  )
}
