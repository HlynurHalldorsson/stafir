// Audio utilities
// Primary: pre-generated MP3 files in /public/audio/ (proper Icelandic TTS)
// Fallback: Web Speech API with is-IS (works if the device has an Icelandic voice)

// ─── Audio file helpers ───────────────────────────────────────────────────────

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/á/g, 'a2').replace(/é/g, 'e2').replace(/í/g, 'i2')
    .replace(/ó/g, 'o2').replace(/ú/g, 'u2').replace(/ý/g, 'y2')
    .replace(/ð/g, 'dh').replace(/þ/g, 'th').replace(/æ/g, 'ae')
    .replace(/ö/g, 'o3').replace(/[^a-z0-9]/g, '')
}

function letterAudioPath(letter: string): string {
  return `/audio/letter-${slug(letter)}.mp3`
}

function wordAudioPath(word: string): string {
  return `/audio/word-${slug(word)}.mp3`
}

// Check if a file exists by attempting a HEAD fetch (cached after first check)
const fileExistsCache = new Map<string, boolean>()

async function fileExists(path: string): Promise<boolean> {
  if (fileExistsCache.has(path)) return fileExistsCache.get(path)!
  try {
    const r = await fetch(path, { method: 'HEAD' })
    const exists = r.ok
    fileExistsCache.set(path, exists)
    return exists
  } catch {
    fileExistsCache.set(path, false)
    return false
  }
}

// Warm the cache on startup so first taps have no delay
export async function preloadAudioCache(letters: { letter: string; word: string }[]): Promise<void> {
  await Promise.all(
    letters.flatMap(({ letter, word }) => [
      fileExists(letterAudioPath(letter)),
      fileExists(wordAudioPath(word)),
    ])
  )
}

// ─── Playback ─────────────────────────────────────────────────────────────────

let currentAudio: HTMLAudioElement | null = null

function playMp3(path: string): Promise<void> {
  return new Promise((resolve) => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.src = ''
    }
    const audio = new Audio(path)
    currentAudio = audio
    audio.onended = () => resolve()
    audio.onerror = () => resolve()   // resolve even on error so callers don't hang
    audio.play().catch(() => resolve())
  })
}

function speakFallback(text: string, onEnd?: () => void): void {
  if (!window.speechSynthesis) { onEnd?.(); return }
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'is-IS'
  u.rate = 0.85
  u.pitch = 1.1
  u.volume = 1
  if (onEnd) u.onend = onEnd
  setTimeout(() => window.speechSynthesis.speak(u), 50)
}

/** Speak a letter name */
export async function speakLetter(letter: string): Promise<void> {
  const path = letterAudioPath(letter)
  if (await fileExists(path)) {
    await playMp3(path)
  } else {
    await new Promise<void>(resolve => speakFallback(letter, resolve))
  }
}

/** Speak a word */
export async function speakWord(word: string): Promise<void> {
  const path = wordAudioPath(word)
  if (await fileExists(path)) {
    await playMp3(path)
  } else {
    await new Promise<void>(resolve => speakFallback(word, resolve))
  }
}

/** Speak any Icelandic text — always uses Web Speech fallback (for phrases) */
export async function speakText(text: string): Promise<void> {
  await new Promise<void>(resolve => speakFallback(text, resolve))
}

/** Speak letter name, then after a short pause speak the word */
export async function speakLetterAndWord(letter: string, word: string): Promise<void> {
  await speakLetter(letter)
  await new Promise(r => setTimeout(r, 300))
  await speakWord(word)
}

// ─── AudioContext tone synthesis ──────────────────────────────────────────────

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

function playNote(ctx: AudioContext, freq: number, startTime: number, duration: number, volume = 0.35): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, startTime)
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  osc.start(startTime)
  osc.stop(startTime + duration)
}

/** Pleasant ascending three-note chime for correct answers */
export function playCorrectSound(): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  playNote(ctx, 523.25, now,        0.3)   // C5
  playNote(ctx, 659.25, now + 0.18, 0.4)   // E5
  playNote(ctx, 783.99, now + 0.36, 0.5)   // G5
}

/** Soft low boing for wrong answers — gentle, not scary */
export function playWrongSound(): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(220, now)
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.3)
  gain.gain.setValueAtTime(0.22, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
  osc.start(now)
  osc.stop(now + 0.4)
}

/** Ascending fanfare for milestone celebrations */
export function playCelebrationSound(): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
  notes.forEach((freq, i) => playNote(ctx, freq, now + i * 0.12, 0.5))
}
