/**
 * Generates Icelandic TTS audio files using OpenAI tts-1-hd.
 * Run: OPENAI_API_KEY=sk-... npx tsx scripts/generate-audio.ts
 */

import OpenAI from 'openai'
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

const wordList = [
  'ár','ís','kú','ey','tá','fé',
  'hús','bær','gás','sól','afi','már','lax','mús','rós','bók','tré','gos','hár','kál','lón',
  'bíll','fíll','kisa','fugl','gras','lamb','epli','amma','kaka',
  'auga','blóm','hjól','skip','barn','gull','nótt','eyra','hönd','kópa','tönn',
]

function slug(text: string): string {
  return text.toLowerCase()
    .replace(/á/g,'a2').replace(/é/g,'e2').replace(/í/g,'i2')
    .replace(/ó/g,'o2').replace(/ú/g,'u2').replace(/ý/g,'y2')
    .replace(/ð/g,'dh').replace(/þ/g,'th').replace(/æ/g,'ae')
    .replace(/ö/g,'o3').replace(/[^a-z0-9]/g,'')
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) { console.error('Set OPENAI_API_KEY first'); process.exit(1) }

  const client = new OpenAI({ apiKey })
  const outDir = join(process.cwd(), 'public', 'audio')
  mkdirSync(outDir, { recursive: true })

  const tasks: { file: string; text: string }[] = []

  for (const { letter, word } of letters) {
    tasks.push({ file: `letter-${slug(letter)}.mp3`, text: letter })
    tasks.push({ file: `word-${slug(word)}.mp3`,     text: word   })
  }
  for (const word of wordList) {
    const file = `word-${slug(word)}.mp3`
    if (!tasks.find(t => t.file === file)) {
      tasks.push({ file, text: word })
    }
  }

  let done = 0
  for (const { file, text } of tasks) {
    process.stdout.write(`[${++done}/${tasks.length}] ${file} … `)
    try {
      const response = await client.audio.speech.create({
        model: 'tts-1-hd',
        voice: 'nova',
        input: text,
        speed: 0.85,
        response_format: 'mp3',
      })
      writeFileSync(join(outDir, file), Buffer.from(await response.arrayBuffer()))
      console.log('✓')
    } catch (err) {
      console.log('✗', (err as Error).message)
    }
  }

  console.log(`\nDone! ${tasks.length} files written to public/audio/`)
}

main()
