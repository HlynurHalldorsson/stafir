import { useState } from 'react'
import { GameProvider, useGame } from './store/GameContext'
import HomeScreen from './components/HomeScreen'
import ExploreMode from './components/ExploreMode'
import QuizMode from './components/QuizMode'
import FindMode from './components/FindMode'
import WordBuildMode from './components/WordBuildMode'
import ShopScreen from './components/ShopScreen'
import CharacterPicker from './components/CharacterPicker'
import AchievementOverlay from './components/AchievementOverlay'
import StarFloat from './components/StarFloat'

type Screen = 'home' | 'explore' | 'quiz' | 'find' | 'wordbuild' | 'shop'

function AppInner() {
  const { state } = useGame()
  const [screen, setScreen] = useState<Screen>('home')
  const goHome = () => setScreen('home')

  // Show character picker on first launch
  if (!state.character) {
    return <CharacterPicker />
  }

  return (
    <>
      {screen === 'home'      && <HomeScreen onSelectMode={setScreen} />}
      {screen === 'explore'   && <ExploreMode onHome={goHome} />}
      {screen === 'quiz'      && <QuizMode onHome={goHome} />}
      {screen === 'find'      && <FindMode onHome={goHome} />}
      {screen === 'wordbuild' && <WordBuildMode onHome={goHome} />}
      {screen === 'shop'      && <ShopScreen onBack={goHome} />}

      {/* Global overlays */}
      <AchievementOverlay />
      <StarFloat />
    </>
  )
}

export default function App() {
  return (
    <GameProvider>
      <AppInner />
    </GameProvider>
  )
}
