import { useCallback } from 'react'
import { letters } from '../data/letters'
import { words } from '../data/words'
import { getLearnedLetters, getLearnedWords } from '../utils/storage'
import { useGame } from '../store/GameContext'
import CharacterDisplay from './CharacterDisplay'
import { speakText } from '../utils/audio'

type Mode = 'explore' | 'quiz' | 'find' | 'wordbuild' | 'shop'

const PHRASES = ['Halló!', 'Við getum þetta!', 'Lærðu með mér!', 'Þetta er gaman!']

interface Props {
  onSelectMode: (mode: Mode) => void
}

export default function HomeScreen({ onSelectMode }: Props) {
  const { state } = useGame()
  const learned = getLearnedLetters()
  const learnedWords = getLearnedWords()
  const learnedCount = learned.size
  const totalCount = letters.length
  const progressPct = Math.round((learnedCount / totalCount) * 100)
  const learnedWordCount = learnedWords.size

  const handleCharacterTap = useCallback(() => {
    const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)]
    speakText(phrase)
  }, [])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 p-6"
      style={{ background: 'linear-gradient(135deg, #fff9f0 0%, #ffecd2 100%)' }}
    >
      {/* Top row: title + stars + shop */}
      <div className="flex items-center justify-between w-full max-w-sm">
        <div>
          <h1
            className="text-4xl font-bold leading-none"
            style={{ color: '#FF6B6B', fontFamily: 'Fredoka, sans-serif' }}
          >
            Stafir 🌈
          </h1>
          <p className="text-lg" style={{ color: '#FF9F43', fontFamily: 'Fredoka, sans-serif' }}>
            Íslenska stafrófið
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Star balance */}
          <div
            className="rounded-2xl px-4 py-2 flex items-center gap-2 shadow-md font-bold text-xl"
            style={{ background: '#FECA57', fontFamily: 'Fredoka, sans-serif', color: '#333' }}
          >
            ⭐ {state.stars}
          </div>
          {/* Shop button */}
          <button
            onClick={() => onSelectMode('shop')}
            className="rounded-2xl flex items-center justify-center shadow-md active:scale-95 transition-transform"
            style={{ width: 48, height: 48, background: '#FF9F43', border: 'none', cursor: 'pointer', fontSize: '1.4rem' }}
            aria-label="Búð"
          >
            🛒
          </button>
        </div>
      </div>

      {/* Character */}
      <CharacterDisplay state={state} size={120} onClick={handleCharacterTap} />

      {/* Letter progress bar */}
      <div className="w-full max-w-sm">
        <div className="flex justify-between mb-1">
          <span style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1rem', color: '#666' }}>
            {learnedCount} / {totalCount} stafir
          </span>
          <span style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1rem', color: '#888' }}>
            {'⭐'.repeat(Math.min(5, Math.floor(learnedCount / 6)))}
          </span>
        </div>
        <div className="w-full rounded-full overflow-hidden" style={{ height: '14px', background: '#e0d5f5' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #FF6EB4, #A29BFE)',
            }}
          />
        </div>
      </div>

      {/* Mode buttons */}
      <div className="flex flex-col gap-4 w-full max-w-sm">

        <button
          onClick={() => onSelectMode('explore')}
          className="rounded-3xl p-4 flex items-center gap-4 shadow-lg active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #1DD1A1, #48DBFB)', minHeight: '80px', border: 'none', cursor: 'pointer' }}
        >
          <span className="text-4xl">🔤</span>
          <div className="text-left">
            <div className="text-xl font-bold text-white" style={{ fontFamily: 'Fredoka, sans-serif' }}>Skoða stafi</div>
            <div className="text-white opacity-80" style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '0.9rem' }}>Frjáls leikur</div>
          </div>
        </button>

        <button
          onClick={() => onSelectMode('quiz')}
          className="rounded-3xl p-4 flex items-center gap-4 shadow-lg active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF9F43)', minHeight: '80px', border: 'none', cursor: 'pointer' }}
        >
          <span className="text-4xl">❓</span>
          <div className="text-left">
            <div className="text-xl font-bold text-white" style={{ fontFamily: 'Fredoka, sans-serif' }}>Hvaða stafur?</div>
            <div className="text-white opacity-80" style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '0.9rem' }}>Spurningaleikur</div>
          </div>
        </button>

        <button
          onClick={() => onSelectMode('find')}
          className="rounded-3xl p-4 flex items-center gap-4 shadow-lg active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #A29BFE, #FF6EB4)', minHeight: '80px', border: 'none', cursor: 'pointer' }}
        >
          <span className="text-4xl">🔍</span>
          <div className="text-left">
            <div className="text-xl font-bold text-white" style={{ fontFamily: 'Fredoka, sans-serif' }}>Finndu stafinn!</div>
            <div className="text-white opacity-80" style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '0.9rem' }}>Hlustaleikur</div>
          </div>
        </button>

        <button
          onClick={() => onSelectMode('wordbuild')}
          className="rounded-3xl p-4 flex items-center gap-4 shadow-lg active:scale-95 transition-transform relative"
          style={{ background: 'linear-gradient(135deg, #FECA57, #FF9F43)', minHeight: '80px', border: 'none', cursor: 'pointer' }}
        >
          <span className="text-4xl">✏️</span>
          <div className="text-left flex-1">
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold" style={{ fontFamily: 'Fredoka, sans-serif', color: '#333' }}>Settu saman orðið</div>
              <div className="rounded-full px-2 text-xs font-bold" style={{ background: 'rgba(0,0,0,0.15)', color: '#333' }}>★★</div>
            </div>
            <div className="opacity-70" style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '0.9rem', color: '#333' }}>Orðaleikur</div>
          </div>
          {learnedWordCount > 0 && (
            <div
              className="rounded-full flex items-center justify-center font-bold shadow shrink-0"
              style={{ minWidth: 36, height: 36, padding: '0 8px', background: '#fff', color: '#FF9F43', fontFamily: 'Fredoka, sans-serif', fontSize: '0.9rem' }}
            >
              {learnedWordCount}/{words.length}
            </div>
          )}
        </button>

      </div>
    </div>
  )
}
