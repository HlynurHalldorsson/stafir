// Curated list of short Icelandic words for the "Settu saman orðið" mode.
// All nominative case, concrete nouns a 5-year-old would recognise.
// `spoken` is the lowercase form passed to TTS.

import { letterMap } from './letters'

export interface WordData {
  word: string    // uppercase, used for slot matching
  emoji: string
  spoken: string  // lowercase Icelandic, used for TTS + audio filename
}

export const words: WordData[] = [
  // 2-letter words
  { word: 'ÁR',   emoji: '🏞️',  spoken: 'ár'    },
  { word: 'ÍS',   emoji: '🍦',  spoken: 'ís'    },
  { word: 'KÚ',   emoji: '🐄',  spoken: 'kú'    },
  { word: 'EY',   emoji: '🏝️',  spoken: 'ey'    },
  { word: 'TÁ',   emoji: '🦶',  spoken: 'tá'    },
  { word: 'FÉ',   emoji: '🐑',  spoken: 'fé'    },
  // 3-letter words
  { word: 'HÚS',  emoji: '🏠',  spoken: 'hús'   },
  { word: 'BÆR',  emoji: '🌾',  spoken: 'bær'   },
  { word: 'GÁS',  emoji: '🪿',  spoken: 'gás'   },
  { word: 'SÓL',  emoji: '☀️',  spoken: 'sól'   },
  { word: 'AFI',  emoji: '👴',  spoken: 'afi'   },
  { word: 'MÁR',  emoji: '🐦',  spoken: 'már'   },
  { word: 'LAX',  emoji: '🐟',  spoken: 'lax'   },
  { word: 'MÚS',  emoji: '🐭',  spoken: 'mús'   },
  { word: 'RÓS',  emoji: '🌹',  spoken: 'rós'   },
  { word: 'BÓK',  emoji: '📚',  spoken: 'bók'   },
  { word: 'TRÉ',  emoji: '🌳',  spoken: 'tré'   },
  { word: 'GOS',  emoji: '🥤',  spoken: 'gos'   },
  { word: 'HÁR',  emoji: '💇',  spoken: 'hár'   },
  { word: 'KÁL',  emoji: '🥬',  spoken: 'kál'   },
  { word: 'LÓN',  emoji: '🏞️',  spoken: 'lón'   },
  // 4-letter words
  { word: 'BÍLL', emoji: '🚗',  spoken: 'bíll'  },
  { word: 'FÍLL', emoji: '🐘',  spoken: 'fíll'  },
  { word: 'KISA', emoji: '🐱',  spoken: 'kisa'  },
  { word: 'FUGL', emoji: '🦅',  spoken: 'fugl'  },
  { word: 'GRAS', emoji: '🌿',  spoken: 'gras'  },
  { word: 'LAMB', emoji: '🐑',  spoken: 'lamb'  },
  { word: 'EPLI', emoji: '🍎',  spoken: 'epli'  },
  { word: 'AMMA', emoji: '👵',  spoken: 'amma'  },
  { word: 'KAKA', emoji: '🎂',  spoken: 'kaka'  },
  { word: 'AUGA', emoji: '👁️',  spoken: 'auga'  },
  { word: 'BLÓM', emoji: '🌸',  spoken: 'blóm'  },
  { word: 'HJÓL', emoji: '🚲',  spoken: 'hjól'  },
  { word: 'SKIP', emoji: '🚢',  spoken: 'skip'  },
  { word: 'BARN', emoji: '👶',  spoken: 'barn'  },
  { word: 'GULL', emoji: '🥇',  spoken: 'gull'  },
  { word: 'NÓTT', emoji: '🌙',  spoken: 'nótt'  },
  { word: 'EYRA', emoji: '👂',  spoken: 'eyra'  },
  { word: 'HÖND', emoji: '✋',  spoken: 'hönd'  },
  { word: 'KÓPA', emoji: '🦭',  spoken: 'kópa'  },
  { word: 'TÖNN', emoji: '🦷',  spoken: 'tönn'  },
]

// Number of distractor tiles to add per word length
export function distractorCount(wordLength: number): number {
  if (wordLength <= 2) return 1
  return 2
}

// Get background/text color for a letter tile, falling back to a neutral color
export function tileColor(letter: string): { bg: string; text: string } {
  const entry = letterMap.get(letter)
  if (entry) return { bg: entry.color, text: entry.textColor }
  return { bg: '#A29BFE', text: '#fff' }
}

// All unique letters in the Icelandic alphabet for picking distractors
const allLetters = [
  'A','Á','B','D','Ð','E','É','F','G','H','I','Í','J','K','L',
  'M','N','O','Ó','P','R','S','T','U','Ú','V','X','Y','Ý','Þ','Æ','Ö',
]

/** Return `count` random distractor letters not present in `exclude` */
export function pickDistractors(exclude: string[], count: number): string[] {
  const pool = allLetters.filter(l => !exclude.includes(l))
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
