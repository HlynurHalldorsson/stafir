// All shop items. Each item has a stable id used in localStorage.

export type ShopCategory = 'hat' | 'color' | 'accessory' | 'background'

export interface ShopItem {
  id: string
  category: ShopCategory
  cost: number        // 0 = free / default
  emoji: string       // displayed in shop grid
  nameIs: string      // Icelandic name spoken by TTS
  free?: boolean      // always owned without buying
}

export const shopItems: ShopItem[] = [
  // ─── Hats ─────────────────────────────────────────────────────────────────
  { id: 'hat_none',     category: 'hat', cost: 0,  emoji: '❌', nameIs: 'Ekkert húfur',    free: true },
  { id: 'hat_viking',   category: 'hat', cost: 0,  emoji: '🪖', nameIs: 'Víkingahjálmur',  free: true },
  { id: 'hat_umbrella', category: 'hat', cost: 5,  emoji: '🌂', nameIs: 'Regnhlíf'  },
  { id: 'hat_crown',    category: 'hat', cost: 10, emoji: '👑', nameIs: 'Stjörnukóróna' },
  { id: 'hat_flower',   category: 'hat', cost: 15, emoji: '🌸', nameIs: 'Fífillkróna' },
  { id: 'hat_rainbow',  category: 'hat', cost: 25, emoji: '🌈', nameIs: 'Regnbogahattur' },

  // ─── Body colors ──────────────────────────────────────────────────────────
  { id: 'color_default', category: 'color', cost: 0,  emoji: '⚪', nameIs: 'Venjulegur litur', free: true },
  { id: 'color_blue',    category: 'color', cost: 8,  emoji: '🔵', nameIs: 'Blár'    },
  { id: 'color_red',     category: 'color', cost: 8,  emoji: '🔴', nameIs: 'Rauður'  },
  { id: 'color_yellow',  category: 'color', cost: 8,  emoji: '🟡', nameIs: 'Gulur'   },
  { id: 'color_purple',  category: 'color', cost: 12, emoji: '🟣', nameIs: 'Fjólublár' },
  { id: 'color_rainbow', category: 'color', cost: 30, emoji: '🌈', nameIs: 'Regnbogi' },

  // ─── Accessories ──────────────────────────────────────────────────────────
  { id: 'acc_none',   category: 'accessory', cost: 0,  emoji: '❌', nameIs: 'Ekkert',       free: true },
  { id: 'acc_star',   category: 'accessory', cost: 6,  emoji: '⭐', nameIs: 'Stjarna'  },
  { id: 'acc_heart',  category: 'accessory', cost: 6,  emoji: '💛', nameIs: 'Hjarta'   },
  { id: 'acc_book',   category: 'accessory', cost: 10, emoji: '📖', nameIs: 'Bók'      },
  { id: 'acc_moon',   category: 'accessory', cost: 20, emoji: '🌙', nameIs: 'Tungl'    },

  // ─── Backgrounds ──────────────────────────────────────────────────────────
  { id: 'bg_default',   category: 'background', cost: 0,  emoji: '⬜', nameIs: 'Venjulegur',     free: true },
  { id: 'bg_mountain',  category: 'background', cost: 10, emoji: '🏔️', nameIs: 'Fjall'    },
  { id: 'bg_ocean',     category: 'background', cost: 10, emoji: '🌊', nameIs: 'Sjór'     },
  { id: 'bg_space',     category: 'background', cost: 20, emoji: '🌌', nameIs: 'Geimur'   },
  { id: 'bg_lights',    category: 'background', cost: 35, emoji: '🌌', nameIs: 'Norðurljós' },
]

// Lookup by id
export const shopItemMap = new Map<string, ShopItem>(shopItems.map(i => [i.id, i]))

// Items that are free / auto-owned on first load
export const freeItemIds = shopItems.filter(i => i.free).map(i => i.id)

export const DEFAULT_EQUIPPED = {
  hat: 'hat_none',
  color: 'color_default',
  accessory: 'acc_none',
  background: 'bg_default',
}
