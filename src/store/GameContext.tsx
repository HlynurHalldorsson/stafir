import {
  createContext, useContext, useReducer, useEffect, useCallback,
  useRef, type ReactNode,
} from 'react'
import {
  loadGameState, saveGameState, todayString,
  type GameState, type CharacterType,
} from './gameState'
import { shopItemMap, type ShopCategory } from '../data/shopItems'
import { getLearnedLetters, markLetterLearned as storageMarkLetter } from '../utils/storage'
import { markWordLearned as storageMarkWord, getLearnedWords } from '../utils/storage'
import { letters } from '../data/letters'
import { words } from '../data/words'
import { speakText } from '../utils/audio'

// ─── Achievement definitions ──────────────────────────────────────────────────

interface AchievementDef {
  id: string
  nameIs: string
  emoji: string
  bonus: number
  check: (gs: GameState) => boolean
}

const achievements: AchievementDef[] = [
  {
    id: 'first_letter',
    nameIs: 'Fyrsti stafurinn!',
    emoji: '🔤',
    bonus: 5,
    check: () => getLearnedLetters().size >= 1,
  },
  {
    id: 'half_alphabet',
    nameIs: 'Hálfnað!',
    emoji: '🌟',
    bonus: 10,
    check: () => getLearnedLetters().size >= 16,
  },
  {
    id: 'full_alphabet',
    nameIs: 'Allt stafrófið!',
    emoji: '🏆',
    bonus: 25,
    check: () => getLearnedLetters().size >= letters.length,
  },
  {
    id: 'first_word',
    nameIs: 'Fyrsta orðið!',
    emoji: '✏️',
    bonus: 5,
    check: () => getLearnedWords().size >= 1,
  },
  {
    id: 'all_words',
    nameIs: 'Orðameistari!',
    emoji: '📚',
    bonus: 20,
    check: () => getLearnedWords().size >= words.length,
  },
  {
    id: 'streak_10',
    nameIs: '10 dagar í röð!',
    emoji: '🔥',
    bonus: 15,
    check: (gs) => gs.loginStreak >= 10,
  },
]

// ─── Star float entries ───────────────────────────────────────────────────────

export interface StarFloat {
  id: number
  amount: number
}

// ─── Context shape ────────────────────────────────────────────────────────────

interface GameContextValue {
  state: GameState
  starFloats: StarFloat[]
  pendingAchievement: AchievementDef | null
  earnStars: (n: number) => void
  spendStars: (n: number) => boolean
  pickCharacter: (char: CharacterType) => void
  buyItem: (itemId: string) => void
  equipItem: (category: ShopCategory, itemId: string) => void
  markLetterLearned: (letter: string) => void
  markWordLearned: (word: string) => void
  dismissAchievement: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside GameProvider')
  return ctx
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'EARN_STARS'; amount: number }
  | { type: 'SPEND_STARS'; amount: number }
  | { type: 'PICK_CHARACTER'; char: CharacterType }
  | { type: 'BUY_ITEM'; itemId: string }
  | { type: 'EQUIP_ITEM'; category: ShopCategory; itemId: string }
  | { type: 'EARN_ACHIEVEMENT'; id: string }
  | { type: 'SET_LOGIN_STREAK'; streak: number; date: string }

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'EARN_STARS':
      return {
        ...state,
        stars: state.stars + action.amount,
        totalStarsEarned: state.totalStarsEarned + action.amount,
      }
    case 'SPEND_STARS':
      return { ...state, stars: Math.max(0, state.stars - action.amount) }
    case 'PICK_CHARACTER':
      return { ...state, character: action.char }
    case 'BUY_ITEM': {
      const item = shopItemMap.get(action.itemId)
      if (!item || state.ownedItems.includes(action.itemId)) return state
      return {
        ...state,
        stars: state.stars - item.cost,
        ownedItems: [...state.ownedItems, action.itemId],
        equippedItems: { ...state.equippedItems, [item.category]: action.itemId },
      }
    }
    case 'EQUIP_ITEM':
      return {
        ...state,
        equippedItems: { ...state.equippedItems, [action.category]: action.itemId },
      }
    case 'EARN_ACHIEVEMENT':
      if (state.achievements.includes(action.id)) return state
      return { ...state, achievements: [...state.achievements, action.id] }
    case 'SET_LOGIN_STREAK':
      return { ...state, loginStreak: action.streak, lastLoginDate: action.date }
    default:
      return state
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

let floatCounter = 0

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadGameState)
  const [starFloats, setStarFloats] = useReducerPair<StarFloat[]>([])
  const achievementQueue = useRef<AchievementDef[]>([])
  const [pendingAchievement, setPendingAchievement] = useReducerPair<AchievementDef | null>(null)

  // Persist state on every change
  useEffect(() => { saveGameState(state) }, [state])

  // Login streak check on mount
  useEffect(() => {
    const today = todayString()
    if (state.lastLoginDate === today) return

    const last = state.lastLoginDate
    let newStreak = 1
    if (last) {
      const diff = (new Date(today).getTime() - new Date(last).getTime()) / 86400000
      if (diff === 1) newStreak = state.loginStreak + 1
    }
    dispatch({ type: 'SET_LOGIN_STREAK', streak: newStreak, date: today })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Check achievements after any state change
  const checkAchievements = useCallback((gs: GameState) => {
    for (const def of achievements) {
      if (!gs.achievements.includes(def.id) && def.check(gs)) {
        dispatch({ type: 'EARN_ACHIEVEMENT', id: def.id })
        dispatch({ type: 'EARN_STARS', amount: def.bonus })
        achievementQueue.current = [...achievementQueue.current, def]
        if (achievementQueue.current.length === 1) {
          setPendingAchievement(def)
        }
      }
    }
  }, [setPendingAchievement])

  const addFloat = useCallback((amount: number) => {
    const id = ++floatCounter
    setStarFloats(prev => [...prev, { id, amount }])
    setTimeout(() => setStarFloats(prev => prev.filter(f => f.id !== id)), 1400)
  }, [setStarFloats])

  const earnStars = useCallback((n: number) => {
    dispatch({ type: 'EARN_STARS', amount: n })
    addFloat(n)
    // Re-check achievements with updated state (next tick)
    setTimeout(() => {
      checkAchievements({ ...loadGameState() })
    }, 50)
  }, [addFloat, checkAchievements])

  const spendStars = useCallback((n: number): boolean => {
    if (state.stars < n) return false
    dispatch({ type: 'SPEND_STARS', amount: n })
    return true
  }, [state.stars])

  const pickCharacter = useCallback((char: CharacterType) => {
    dispatch({ type: 'PICK_CHARACTER', char })
  }, [])

  const buyItem = useCallback((itemId: string) => {
    const item = shopItemMap.get(itemId)
    if (!item || state.ownedItems.includes(itemId) || state.stars < item.cost) return
    dispatch({ type: 'BUY_ITEM', itemId })
    speakText(item.nameIs)
  }, [state.ownedItems, state.stars])

  const equipItem = useCallback((category: ShopCategory, itemId: string) => {
    dispatch({ type: 'EQUIP_ITEM', category, itemId })
  }, [])

  const markLetterLearned = useCallback((letter: string) => {
    const wasNew = !getLearnedLetters().has(letter)
    storageMarkLetter(letter)
    earnStars(1)                        // correct answer
    if (wasNew) earnStars(3)            // first time bonus
    checkAchievements({ ...state, achievements: state.achievements })
  }, [earnStars, checkAchievements, state])

  const markWordLearned = useCallback((word: string) => {
    const wasNew = !getLearnedWords().has(word)
    storageMarkWord(word)
    earnStars(2)                        // correct word
    if (wasNew) earnStars(4)            // first time bonus
    checkAchievements({ ...state, achievements: state.achievements })
  }, [earnStars, checkAchievements, state])

  const dismissAchievement = useCallback(() => {
    achievementQueue.current = achievementQueue.current.slice(1)
    const next = achievementQueue.current[0] ?? null
    setPendingAchievement(next)
  }, [setPendingAchievement])

  return (
    <GameContext.Provider value={{
      state, starFloats, pendingAchievement,
      earnStars, spendStars, pickCharacter,
      buyItem, equipItem,
      markLetterLearned, markWordLearned,
      dismissAchievement,
    }}>
      {children}
    </GameContext.Provider>
  )
}

// Tiny helper to use useState-like API inside the provider
function useReducerPair<T>(initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [val, setVal] = useReducer(
    (_: T, next: T | ((prev: T) => T)) => typeof next === 'function' ? (next as (p: T) => T)(_) : next,
    initial,
  )
  return [val, setVal as React.Dispatch<React.SetStateAction<T>>]
}
