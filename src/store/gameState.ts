// Persistent game state — everything that lives in localStorage.
// Letters and words learned are still tracked by storage.ts (unchanged).

import { freeItemIds, DEFAULT_EQUIPPED } from '../data/shopItems'

export type CharacterType = 'puffin' | 'horse' | 'viking'

export interface EquippedItems {
  hat: string
  color: string
  accessory: string
  background: string
}

export interface GameState {
  stars: number
  totalStarsEarned: number
  character: CharacterType | null   // null = not yet picked
  ownedItems: string[]
  equippedItems: EquippedItems
  achievements: string[]
  loginStreak: number
  lastLoginDate: string             // 'YYYY-MM-DD' or ''
}

const STORAGE_KEY = 'stafir_game_v1'

export const DEFAULT_STATE: GameState = {
  stars: 0,
  totalStarsEarned: 0,
  character: null,
  ownedItems: [...freeItemIds],
  equippedItems: { ...DEFAULT_EQUIPPED },
  achievements: [],
  loginStreak: 0,
  lastLoginDate: '',
}

export function loadGameState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATE }
    const saved = JSON.parse(raw) as Partial<GameState>
    // Merge with defaults so new fields are always present
    return {
      ...DEFAULT_STATE,
      ...saved,
      equippedItems: { ...DEFAULT_EQUIPPED, ...saved.equippedItems },
      // Always ensure free items are owned
      ownedItems: Array.from(new Set([...freeItemIds, ...(saved.ownedItems ?? [])])),
    }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

// Today as YYYY-MM-DD
export function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}
