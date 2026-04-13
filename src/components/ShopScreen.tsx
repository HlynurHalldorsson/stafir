import { useState } from 'react'
import { shopItems, type ShopCategory } from '../data/shopItems'
import { useGame } from '../store/GameContext'
import CharacterDisplay from './CharacterDisplay'
import { speakText } from '../utils/audio'

interface Props {
  onBack: () => void
}

const TABS: { category: ShopCategory; emoji: string }[] = [
  { category: 'hat',        emoji: '🎩' },
  { category: 'color',      emoji: '🎨' },
  { category: 'accessory',  emoji: '✨' },
  { category: 'background', emoji: '🏞️' },
]

export default function ShopScreen({ onBack }: Props) {
  const { state, buyItem, equipItem } = useGame()
  const [activeTab, setActiveTab] = useState<ShopCategory>('hat')
  const [pendingBuy, setPendingBuy] = useState<string | null>(null)

  const tabItems = shopItems.filter(i => i.category === activeTab)

  const handleItemTap = (itemId: string) => {
    const item = shopItems.find(i => i.id === itemId)
    if (!item) return

    if (state.ownedItems.includes(itemId)) {
      // Already owned → equip immediately
      equipItem(item.category, itemId)
      speakText(item.nameIs)
      setPendingBuy(null)
      return
    }

    if (state.stars < item.cost) {
      // Can't afford → just speak
      speakText(item.nameIs)
      return
    }

    // Can afford, not owned → show confirm or toggle pending
    if (pendingBuy === itemId) {
      // Second tap = confirm buy
      buyItem(itemId)
      setPendingBuy(null)
    } else {
      speakText(item.nameIs)
      setPendingBuy(itemId)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #fff9f0 0%, #ffecd2 100%)' }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between gap-3 p-4 sticky top-0 z-10"
        style={{ background: 'rgba(255,249,240,0.9)', backdropFilter: 'blur(8px)' }}
      >
        <button
          onClick={onBack}
          className="rounded-2xl flex items-center justify-center shadow-md active:scale-95 transition-transform"
          style={{ width: 56, height: 56, background: '#FF6B6B', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}
        >
          🏠
        </button>
        <div className="text-2xl font-bold" style={{ fontFamily: 'Fredoka, sans-serif', color: '#FF9F43' }}>
          🛒 Búð
        </div>
        {/* Star balance */}
        <div
          className="rounded-2xl px-4 py-2 flex items-center gap-2 shadow-md font-bold text-xl"
          style={{ background: '#FECA57', fontFamily: 'Fredoka, sans-serif', color: '#333' }}
        >
          ⭐ {state.stars}
        </div>
      </div>

      {/* Character preview */}
      <div className="flex justify-center pt-4 pb-2">
        <CharacterDisplay state={state} size={130} />
      </div>

      {/* Category tabs */}
      <div className="flex justify-center gap-3 px-4 py-3">
        {TABS.map(tab => (
          <button
            key={tab.category}
            onClick={() => { setActiveTab(tab.category); setPendingBuy(null) }}
            className="rounded-2xl flex items-center justify-center transition-all active:scale-95"
            style={{
              width: 60, height: 60,
              fontSize: '1.8rem',
              background: activeTab === tab.category ? '#FF9F43' : '#fff',
              boxShadow: activeTab === tab.category
                ? '0 4px 12px rgba(255,159,67,0.4)'
                : '0 2px 8px rgba(0,0,0,0.1)',
              border: 'none', cursor: 'pointer',
              transform: activeTab === tab.category ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {tab.emoji}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid gap-3 p-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
        {tabItems.map(item => {
          const owned = state.ownedItems.includes(item.id)
          const equipped = state.equippedItems[item.category] === item.id
          const affordable = state.stars >= item.cost
          const isPending = pendingBuy === item.id

          return (
            <button
              key={item.id}
              onClick={() => handleItemTap(item.id)}
              className={`rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 relative
                ${isPending ? 'ring-4 ring-green-400 scale-105' : ''}
              `}
              style={{
                minHeight: 100,
                padding: '10px 6px',
                background: equipped
                  ? '#1DD1A1'
                  : owned
                  ? '#e8f4ff'
                  : affordable
                  ? '#fff'
                  : '#f0f0f0',
                opacity: !owned && !affordable ? 0.6 : 1,
                border: equipped ? '3px solid #1DD1A1' : '2px solid transparent',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
              }}
            >
              {/* Emoji */}
              <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{item.emoji}</span>

              {/* Name */}
              <span
                className="text-center leading-tight"
                style={{
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '0.75rem',
                  color: equipped ? '#fff' : '#444',
                  maxWidth: '90px',
                }}
              >
                {item.nameIs}
              </span>

              {/* Cost / owned badge */}
              {owned ? (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-bold"
                  style={{ background: equipped ? 'rgba(255,255,255,0.3)' : '#1DD1A1', color: '#fff' }}
                >
                  {equipped ? '✓ Klætt' : '✓'}
                </span>
              ) : (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-bold flex items-center gap-0.5"
                  style={{
                    background: affordable ? '#FECA57' : '#ddd',
                    color: '#333',
                  }}
                >
                  ⭐ {item.cost}
                </span>
              )}

              {/* Confirm overlay on pending */}
              {isPending && (
                <div
                  className="absolute inset-0 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(29,209,161,0.15)' }}
                >
                  <span style={{ fontSize: '2rem' }}>✓</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Tap ✓ confirm hint */}
      {pendingBuy && (
        <div
          className="text-center pb-2"
          style={{ fontFamily: 'Fredoka, sans-serif', color: '#888', fontSize: '0.95rem' }}
        >
          Ýttu aftur til að kaupa ✓
        </div>
      )}

      <div className="h-8" />
    </div>
  )
}
