import { useState, useEffect, useCallback, useRef } from 'react'
import { letters, type LetterData } from '../data/letters'
import { speakLetter, playCorrectSound, playWrongSound } from '../utils/audio'
import { useGame } from '../store/GameContext'
import CelebrationOverlay from './CelebrationOverlay'

interface Props {
  onHome: () => void
}

// Pick 4 unique random letters, one of which is the correct answer
function pickChoices(correct: LetterData): LetterData[] {
  const pool = letters.filter(l => l.letter !== correct.letter)
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  const choices = [correct, ...shuffled.slice(0, 3)]
  return choices.sort(() => Math.random() - 0.5)
}

// Pick a random letter that hasn't been used recently (avoids repeats)
function pickQuestion(recentLetters: string[]): LetterData {
  const pool = letters.filter(l => !recentLetters.includes(l.letter))
  const source = pool.length > 0 ? pool : letters
  return source[Math.floor(Math.random() * source.length)]
}

export default function QuizMode({ onHome }: Props) {
  const { markLetterLearned, earnStars } = useGame()
  const [score, setScore] = useState(0)
  const [question, setQuestion] = useState<LetterData>(() => letters[Math.floor(Math.random() * letters.length)])
  const [choices, setChoices] = useState<LetterData[]>([])
  const [shaking, setShaking] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [roundsThisMilestone, setRoundsThisMilestone] = useState(0)
  const [correct, setCorrect] = useState<string | null>(null)
  const recentLetters = useRef<string[]>([])

  // Set up choices whenever question changes
  useEffect(() => {
    setChoices(pickChoices(question))
    setCorrect(null)
    // Speak the question after a short delay
    const t = setTimeout(() => speakLetter(question.letter), 400)
    return () => clearTimeout(t)
  }, [question])

  const speakQuestion = useCallback(() => {
    speakLetter(question.letter)
  }, [question])

  const nextQuestion = useCallback(() => {
    recentLetters.current = [...recentLetters.current.slice(-6), question.letter]
    const next = pickQuestion(recentLetters.current)
    setQuestion(next)
  }, [question])

  const handleAnswer = useCallback((chosen: LetterData) => {
    if (correct) return // Already answered this round

    if (chosen.letter === question.letter) {
      // Correct!
      setCorrect(chosen.letter)
      playCorrectSound()
      markLetterLearned(question.letter)   // awards 1⭐ + 3⭐ if new letter

      const newRounds = roundsThisMilestone + 1
      setScore(s => s + 1)

      if (newRounds >= 5) {
        setRoundsThisMilestone(0)
        earnStars(3)                        // 5-streak bonus
        setShowCelebration(true)
      } else {
        setRoundsThisMilestone(newRounds)
        setTimeout(nextQuestion, 900)
      }
    } else {
      // Wrong — shake the button
      playWrongSound()
      setShaking(chosen.letter)
      setTimeout(() => setShaking(null), 400)
    }
  }, [correct, question, roundsThisMilestone, nextQuestion])

  const handleCelebrationClose = useCallback(() => {
    setShowCelebration(false)
    nextQuestion()
  }, [nextQuestion])

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #fff9f0 0%, #ffe0e0 100%)' }}
    >
      {showCelebration && (
        <CelebrationOverlay onClose={handleCelebrationClose} message="Vel gert! 🌟" />
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
          style={{ fontFamily: 'Fredoka, sans-serif', color: '#FF6B6B' }}
        >
          Hvaða stafur?
        </div>
        {/* Score */}
        <div
          className="rounded-2xl px-4 py-2 text-xl font-bold shadow-md flex items-center gap-2"
          style={{ background: '#FECA57', fontFamily: 'Fredoka, sans-serif', color: '#333' }}
        >
          ⭐ {score}
        </div>
      </div>

      {/* Progress dots for current milestone */}
      <div className="flex justify-center gap-3 py-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: '16px',
              height: '16px',
              background: i < roundsThisMilestone ? '#1DD1A1' : '#ddd',
              transform: i < roundsThisMilestone ? 'scale(1.2)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* Question area — tap to replay */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
        <button
          onClick={speakQuestion}
          className="rounded-3xl flex flex-col items-center justify-center shadow-xl active:scale-95 transition-transform"
          style={{
            width: '180px',
            height: '180px',
            background: 'linear-gradient(135deg, #A29BFE, #FF6EB4)',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="Hlusta aftur"
        >
          <span style={{ fontSize: '4rem' }}>🔊</span>
          <span
            className="text-white font-bold mt-1"
            style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.1rem' }}
          >
            Hlusta
          </span>
        </button>

        {/* 4 answer choices */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {choices.map(choice => {
            const isCorrectAnswer = correct === choice.letter
            const isShaking = shaking === choice.letter

            return (
              <button
                key={choice.letter}
                onClick={() => handleAnswer(choice)}
                className={`rounded-3xl flex items-center justify-center shadow-lg transition-all ${isShaking ? 'animate-shake' : ''} ${isCorrectAnswer ? 'ring-4 ring-green-400 scale-105' : 'active:scale-95'}`}
                style={{
                  background: isCorrectAnswer ? '#1DD1A1' : choice.color,
                  minHeight: '100px',
                  border: 'none',
                  cursor: 'pointer',
                }}
                disabled={!!correct}
              >
                <span
                  className="font-bold"
                  style={{
                    fontSize: '2.8rem',
                    color: isCorrectAnswer ? '#fff' : choice.textColor,
                    fontFamily: 'Fredoka, sans-serif',
                  }}
                >
                  {choice.letter}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="h-8" />
    </div>
  )
}
