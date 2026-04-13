// All 32 letters of the Icelandic alphabet with child-friendly words and emojis
// Colors cycle through a cheerful palette of 8 colors

export interface LetterData {
  letter: string        // The uppercase letter
  word: string          // Icelandic word a 5-year-old would know
  emoji: string         // Emoji representing the word
  color: string         // Tailwind background color class
  textColor: string     // Tailwind text color class
}

// 8-color cheerful palette — each letter gets palette[index % 8]
const palette: { bg: string; text: string }[] = [
  { bg: '#FF6B6B', text: '#fff' }, // coral red
  { bg: '#FF9F43', text: '#fff' }, // orange
  { bg: '#FECA57', text: '#333' }, // yellow
  { bg: '#48DBFB', text: '#333' }, // sky blue
  { bg: '#1DD1A1', text: '#fff' }, // mint green
  { bg: '#FF6EB4', text: '#fff' }, // pink
  { bg: '#A29BFE', text: '#fff' }, // lavender
  { bg: '#54A0FF', text: '#fff' }, // blue
]

const raw: Omit<LetterData, 'color' | 'textColor'>[] = [
  { letter: 'A',  word: 'Appelsína',  emoji: '🍊' },
  { letter: 'Á',  word: 'Ár',         emoji: '🌊' },
  { letter: 'B',  word: 'Bíll',       emoji: '🚗' },
  { letter: 'D',  word: 'Dúfa',       emoji: '🕊️' },
  { letter: 'Ð',  word: 'Ðorinn',      emoji: '🐍' },  // Ðorinn = bold/daring (also a snake name kids know)
  { letter: 'E',  word: 'Epli',       emoji: '🍎' },
  { letter: 'É',  word: 'Éta',        emoji: '😋' },
  { letter: 'F',  word: 'Fiskur',     emoji: '🐟' },
  { letter: 'G',  word: 'Gæsa',       emoji: '🦢' },
  { letter: 'H',  word: 'Hundur',     emoji: '🐶' },
  { letter: 'I',  word: 'Ísbíll',     emoji: '🍦' },  // ice cream truck
  { letter: 'Í',  word: 'Ís',         emoji: '🍨' },
  { letter: 'J',  word: 'Jólasvein',  emoji: '🎅' },
  { letter: 'K',  word: 'Köttur',     emoji: '🐱' },
  { letter: 'L',  word: 'Ljón',       emoji: '🦁' },
  { letter: 'M',  word: 'Maður',      emoji: '🧑' },
  { letter: 'N',  word: 'Nabbi',      emoji: '🐷' },  // nabbi = piglet (affectionate)
  { letter: 'O',  word: 'Omm',        emoji: '🐘' },  // ormur = worm, but omm sounds better — use Ormar
  { letter: 'Ó',  word: 'Óðinn',      emoji: '⚡' },
  { letter: 'P',  word: 'Prinsessa',  emoji: '👸' },
  { letter: 'R',  word: 'Regnbogi',   emoji: '🌈' },
  { letter: 'S',  word: 'Sól',        emoji: '☀️' },
  { letter: 'T',  word: 'Tígur',      emoji: '🐯' },
  { letter: 'U',  word: 'Ugla',       emoji: '🦉' },
  { letter: 'Ú',  word: 'Úlfa',       emoji: '🐺' },
  { letter: 'V',  word: 'Vatn',       emoji: '💧' },
  { letter: 'X',  word: 'Xýlófón',    emoji: '🎵' },
  { letter: 'Y',  word: 'Ysja',       emoji: '🌿' },  // ysja = to rustle/whisper (wind)
  { letter: 'Ý',  word: 'Ýta',        emoji: '👆' },
  { letter: 'Þ',  word: 'Þorskur',    emoji: '🐠' },
  { letter: 'Æ',  word: 'Æðarkóngur', emoji: '🦆' },
  { letter: 'Ö',  word: 'Önd',        emoji: '🦆' },
]

// Fix the O entry — use Ormur (worm)
raw[17] = { letter: 'O', word: 'Ormur', emoji: '🐛' }

export const letters: LetterData[] = raw.map((item, index) => ({
  ...item,
  color: palette[index % palette.length].bg,
  textColor: palette[index % palette.length].text,
}))

// Quick lookup by letter character
export const letterMap = new Map<string, LetterData>(
  letters.map(l => [l.letter, l])
)
