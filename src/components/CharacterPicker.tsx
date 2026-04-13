import { useState } from 'react'
import { useGame } from '../store/GameContext'
import { speakText } from '../utils/audio'
import type { CharacterType } from '../store/gameState'

const CHOICES: { type: CharacterType; emoji: string; nameIs: string; color: string }[] = [
  { type: 'puffin', emoji: '🐧', nameIs: 'Lundi',    color: 'linear-gradient(135deg, #48DBFB, #54A0FF)' },
  { type: 'horse',  emoji: '🐴', nameIs: 'Hestur',   color: 'linear-gradient(135deg, #FF9F43, #FECA57)' },
  { type: 'viking', emoji: '🧒', nameIs: 'Víkingur', color: 'linear-gradient(135deg, #FF6B6B, #FF6EB4)' },
]

export default function CharacterPicker() {
  const { pickCharacter } = useGame()
  const [selected, setSelected] = useState<CharacterType | null>(null)

  const handleSelect = (choice: typeof CHOICES[0]) => {
    setSelected(choice.type)
    speakText(choice.nameIs)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-8 p-6"
      style={{ background: 'linear-gradient(135deg, #fff9f0 0%, #ffecd2 100%)' }}
    >
      <div className="text-center">
        <div className="text-6xl mb-3">✨</div>
        <div
          className="text-3xl font-bold"
          style={{ fontFamily: 'Fredoka, sans-serif', color: '#FF6B6B' }}
        >
          Veldu persónu þína!
        </div>
      </div>

      <div className="flex gap-5 flex-wrap justify-center">
        {CHOICES.map(choice => (
          <button
            key={choice.type}
            onClick={() => handleSelect(choice)}
            className={`rounded-3xl flex flex-col items-center justify-center gap-2 shadow-xl transition-all active:scale-90
              ${selected === choice.type ? 'scale-110 ring-4 ring-white' : 'scale-100'}`}
            style={{
              width: 130, height: 150,
              background: choice.color,
              border: 'none', cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '4rem', lineHeight: 1 }}>{choice.emoji}</span>
            <span
              className="font-bold text-white"
              style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.2rem' }}
            >
              {choice.nameIs}
            </span>
          </button>
        ))}
      </div>

      {/* Confirm button — only visible after selection */}
      {selected && (
        <button
          onClick={() => pickCharacter(selected)}
          className="rounded-3xl px-10 py-4 text-3xl font-bold shadow-xl active:scale-95 transition-transform animate-bounce-pop"
          style={{
            background: 'linear-gradient(135deg, #1DD1A1, #48DBFB)',
            border: 'none', cursor: 'pointer',
            color: '#fff', fontFamily: 'Fredoka, sans-serif',
          }}
        >
          Áfram! 🚀
        </button>
      )}
    </div>
  )
}
