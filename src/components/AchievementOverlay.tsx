import { useEffect } from 'react'
import { useGame } from '../store/GameContext'
import { speakText } from '../utils/audio'
import { playCelebrationSound } from '../utils/audio'

export default function AchievementOverlay() {
  const { pendingAchievement, dismissAchievement } = useGame()

  useEffect(() => {
    if (!pendingAchievement) return
    playCelebrationSound()
    speakText(pendingAchievement.nameIs)
    const t = setTimeout(dismissAchievement, 4000)
    return () => clearTimeout(t)
  }, [pendingAchievement, dismissAchievement])

  if (!pendingAchievement) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center cursor-pointer"
      style={{ background: 'rgba(255,249,240,0.95)' }}
      onClick={dismissAchievement}
    >
      <div className="flex flex-col items-center gap-5 animate-star-pop">
        <span style={{ fontSize: '5rem' }}>{pendingAchievement.emoji}</span>

        <div
          className="text-4xl font-bold text-center px-8"
          style={{ color: '#FF9F43', fontFamily: 'Fredoka, sans-serif' }}
        >
          {pendingAchievement.nameIs}
        </div>

        <div
          className="rounded-2xl px-6 py-3 flex items-center gap-2 shadow-lg"
          style={{ background: '#FECA57' }}
        >
          <span style={{ fontSize: '1.8rem' }}>⭐</span>
          <span
            className="text-2xl font-bold"
            style={{ fontFamily: 'Fredoka, sans-serif', color: '#333' }}
          >
            +{pendingAchievement.bonus}
          </span>
        </div>

        <div style={{ fontSize: '2.5rem' }}>🎉🎊🎉</div>
      </div>
    </div>
  )
}
