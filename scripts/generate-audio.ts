/**
 * Generates Icelandic TTS audio files using Google Translate TTS.
 * No API key required. Output: public/audio/*.mp3
 *
 * Run: npx tsx scripts/generate-audio.ts
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const letters = [
  { letter: 'A',  word: 'Appelsína'   },
  { letter: 'Á',  word: 'Ár'          },
  { letter: 'B',  word: 'Bíll'        },
  { letter: 'D',  word: 'Dúfa'        },
  { letter: 'Ð',  word: 'Ðorinn'      },
  { letter: 'E',  word: 'Epli'        },
  { letter: 'É',  word: 'Éta'         },
  { letter: 'F',  word: 'Fiskur'      },
  { letter: 'G',  word: 'Gæsa'        },
  { letter: 'H',  word: 'Hundur'      },
  { letter: 'I',  word: 'Ísbíll'      },
  { letter: 'Í',  word: 'Ís'          },
  { letter: 'J',  word: 'Jólasvein'   },
  { letter: 'K',  word: 'Köttur'      },
  { letter: 'L',  word: 'Ljón'        },
  { letter: 'M',  word: 'Maður'       },
  { letter: 'N',  word: 'Nabbi'       },
  { letter: 'O',  word: 'Ormur'       },
  { letter: 'Ó',  word: 'Óðinn'       },
  { letter: 'P',  word: 'Prinsessa'   },
  { letter: 'R',  word: 'Regnbogi'    },
  { letter: 'S',  word: 'Sól'         },
  { letter: 'T',  word: 'Tígur'       },
  { letter: 'U',  word: 'Ugla'        },
  { letter: 'Ú',  word: 'Úlfa'        },
  { letter: 'V',  word: 'Vatn'        },
  { letter: 'X',  word: 'Xýlófón'     },
  { letter: 'Y',  word: 'Ysja'        },
  { letter: 'Ý',  word: 'Ýta'         },
  { letter: 'Þ',  word: 'Þorskur'     },
  { letter: 'Æ',  word: 'Æðarkóngur'  },
  { letter: 'Ö',  word: 'Önd'         },
]

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/á/g, 'a2').replace(/é/g, 'e2').replace(/í/g, 'i2')
    .replace(/ó/g, 'o2').replace(/ú/g, 'u2').replace(/ý/g, 'y2')
    .replace(/ð/g, 'dh').replace(/þ/g, 'th').replace(/æ/g, 'ae')
    .replace(/ö/g, 'o3').replace(/[^a-z0-9]/g, '')
}

function gttsUrl(text: string): string {
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=is&client=tw-ob&ttsspeed=0.8`
}

async function fetchAudio(text: string): Promise<Buffer> {
  const res = await fetch(gttsUrl(text), {
    headers: {
      // Mimic a browser request — Google blocks plain fetch
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Referer': 'https://translate.google.com/',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

// Small delay between requests to avoid rate limiting
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  const outDir = join(process.cwd(), 'public', 'audio')
  mkdirSync(outDir, { recursive: true })

  const tasks: { file: string; text: string }[] = []
  for (const { letter, word } of letters) {
    tasks.push({ file: `letter-${slug(letter)}.mp3`, text: letter })
    tasks.push({ file: `word-${slug(word)}.mp3`,     text: word   })
  }

  let done = 0
  let failed = 0
  for (const { file, text } of tasks) {
    process.stdout.write(`[${++done}/${tasks.length}] ${file} … `)
    try {
      const buf = await fetchAudio(text)
      writeFileSync(join(outDir, file), buf)
      console.log('✓')
    } catch (err) {
      console.log('✗', (err as Error).message)
      failed++
    }
    // 200ms pause between requests
    await sleep(200)
  }

  console.log(`\nDone! ${tasks.length - failed} files written to public/audio/`)
  if (failed > 0) console.log(`${failed} failed — re-run to retry`)
}

main()
