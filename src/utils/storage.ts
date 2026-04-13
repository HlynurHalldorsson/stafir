// localStorage-based progress tracking

const STORAGE_KEY = 'stafir_learned'

/** Get the set of letters the child has answered correctly at least once */
export function getLearnedLetters(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

/** Mark a letter as learned */
export function markLetterLearned(letter: string): void {
  const learned = getLearnedLetters()
  learned.add(letter)
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...learned]))
}

/** Reset all progress */
export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// ─── Word-build progress ──────────────────────────────────────────────────────

const WORDS_KEY = 'stafir_learned_words'

/** Get the set of words the child has assembled correctly at least once */
export function getLearnedWords(): Set<string> {
  try {
    const raw = localStorage.getItem(WORDS_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

/** Mark a word as correctly assembled */
export function markWordLearned(word: string): void {
  const learned = getLearnedWords()
  learned.add(word)
  localStorage.setItem(WORDS_KEY, JSON.stringify([...learned]))
}
