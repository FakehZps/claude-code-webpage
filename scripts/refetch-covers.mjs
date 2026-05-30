/**
 * Re-fetches cover images for a specific list of games using their full titles.
 * Usage: node scripts/refetch-covers.mjs <RAWG_API_KEY>
 */

import fs from 'fs/promises'
import { createWriteStream } from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'
import { fileURLToPath } from 'url'

const RAWG_KEY = process.argv[2]
if (!RAWG_KEY) { console.error('Usage: node scripts/refetch-covers.mjs <KEY>'); process.exit(1) }

const __dirname  = path.dirname(fileURLToPath(import.meta.url))
const GAMES_FILE = path.join(__dirname, '../content/games.json')
const LOGS_DIR   = path.join(__dirname, '../content/logs')
const IMAGES_DIR = path.join(__dirname, '../public/images')

// Titles to re-fetch — using corrected/full search queries
const TARGETS = [
  'Indiana Jones and the Great Circle',
  'Final Fantasy XIV: Heavensward',
  'Final Fantasy XIV: A Realm Reborn',
  'Final Fantasy XIV: Stormblood',
  'Final Fantasy VI',
  'Final Fantasy V',
  'Final Fantasy IV',
  'Final Fantasy III',
  'Final Fantasy II',
  'Final Fantasy I',
  'Final Fantasy VII Remake Intergrade',
  'Final Fantasy VII',
  'Nuclear Blaze',
  'Robocop: Rogue City',
  'Blasphemous',
  'Mini Motorways',
  'Lego Harry Potter Collection',
  'The Legend of Heroes: Trails of Cold Steel',
  'The Legend of Heroes: Trails of Cold Steel II',
  'Sekiro: Shadows Die Twice',
  'OPUS: Echo of Starsong',
  'Xenoblade Chronicles 2: Torna - The Golden Country',
  'The Legend of Zelda: Link\'s Awakening',
  'The Legend of Heroes: Trails in the Sky the 3rd',
  'The Legend of Heroes: Trails in the Sky SC',
  'If On A Winter\'s Night Four Travelers',
  'The Legend of Heroes: Trails in the Sky',
  'Beneath a Steel Sky',
  'Human Resource Machine',
  'Dragon Quest XI S: Echoes of an Elusive Age - Definitive Edition',
  'Aliens: Fireteam Elite',
  'Batman: The Enemy Within',
  'Blackwell Unbound',
  'Xenoblade Chronicles: Definitive Edition',
  'The Blackwell Legacy',
  'Tales of Vesperia: Definitive Edition',
  'A Short Hike',
  'The Sexy Brutale',
  'The Legend of Zelda: Breath of the Wild',
  'South Park: The Stick of Truth',
  'Final Fantasy VII Remake',
  'Call of Duty: Modern Warfare 2 Remastered',
  'Metal Gear Solid V: The Phantom Pain',
  'The Last of Us Remastered',
  'Contradiction',
  'Wipeout Omega Collection',
  'Detroit: Become Human',
  'The Legend of Korra',
  'JazzPunk',
  'Batman: Arkham Knight',
  'Open Sorcery',
  'Batman: The Telltale Series',
  'Type:Rider',
  'Zero Escape: Virtue\'s Last Reward',
  'STARWHAL',
  'Unmechanical Extended',
  'Metal Slug X',
  'The Fall',
  'Uncharted 2: Among Thieves Remastered',
  'Costume Quest 2',
  'Wolfenstein: The New Order',
  'Homeworld Remastered Collection',
  'Middle-earth: Shadow of Mordor',
]

// ── helpers ──────────────────────────────────────────────────────────────────
function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
}

function similarity(a, b) {
  const na = normalize(a), nb = normalize(b)
  if (na === nb) return 1
  if (na.includes(nb) || nb.includes(na)) return 0.9
  // count shared words
  const wa = new Set(na.split(' ')), wb = nb.split(' ')
  const shared = wb.filter(w => wa.has(w)).length
  return shared / Math.max(wa.size, wb.length)
}

async function searchRawg(query) {
  const url = `https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&key=${RAWG_KEY}&page_size=5`
  const res  = await fetch(url)
  const data = await res.json()
  return data.results?.find(r => r.background_image) ?? null
}

async function downloadImage(imageUrl, destPath) {
  const res = await fetch(imageUrl)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  await pipeline(res.body, createWriteStream(destPath))
}

// ── load data ─────────────────────────────────────────────────────────────────
const games   = JSON.parse(await fs.readFile(GAMES_FILE, 'utf8'))
const mdxFiles = (await fs.readdir(LOGS_DIR)).filter(f => f.endsWith('.mdx'))

// Build MDX title→imagePath map
const mdxEntries = []
for (const file of mdxFiles) {
  const text = await fs.readFile(path.join(LOGS_DIR, file), 'utf8')
  const titleM = text.match(/^title:\s*"?([^"\n]+)"?/m)
  const imgM   = text.match(/^coverImage:\s*"([^"]+)"/m)
  if (titleM && imgM) {
    mdxEntries.push({ title: titleM[1].replace(/\s*[—–].+$/, '').trim(), imagePath: path.join(IMAGES_DIR, path.basename(imgM[1])) })
  }
}

// ── main loop ─────────────────────────────────────────────────────────────────
let ok = 0, fail = 0

for (const target of TARGETS) {
  process.stdout.write(`\n🔍 "${target}"\n`)

  // Find best match in games.json
  let bestGame = null, bestScore = 0
  for (const g of games) {
    const score = similarity(target, g.title)
    if (score > bestScore) { bestScore = score; bestGame = g }
  }

  // Also check MDX entries
  let bestMdx = null, bestMdxScore = 0
  for (const m of mdxEntries) {
    const score = similarity(target, m.title)
    if (score > bestMdxScore) { bestMdxScore = score; bestMdx = m }
  }

  let imagePath = null
  if (bestMdxScore > bestScore && bestMdxScore > 0.7) {
    process.stdout.write(`   matched MDX: "${bestMdx.title}" (${(bestMdxScore*100).toFixed(0)}%)\n`)
    imagePath = bestMdx.imagePath
  } else if (bestGame && bestScore > 0.7) {
    process.stdout.write(`   matched JSON: "${bestGame.title}" (${(bestScore*100).toFixed(0)}%)\n`)
    const ext = bestGame.coverImage?.match(/\.\w+$/)?.[0] ?? '.jpg'
    imagePath = path.join(IMAGES_DIR, `${bestGame.slug}${ext}`)
  } else {
    process.stdout.write(`   ✗ no match found (best: "${bestGame?.title}", ${(bestScore*100).toFixed(0)}%)\n`)
    fail++
    continue
  }

  // Search RAWG with full target title
  let hit
  try { hit = await searchRawg(target) }
  catch (e) { process.stdout.write(`   ✗ RAWG error: ${e.message}\n`); fail++; continue }

  if (!hit?.background_image) {
    process.stdout.write(`   ✗ no image on RAWG\n`); fail++
    await new Promise(r => setTimeout(r, 250))
    continue
  }

  process.stdout.write(`   RAWG: "${hit.name}"\n`)

  try {
    await downloadImage(hit.background_image, imagePath)
    process.stdout.write(`   ✓ saved ${path.basename(imagePath)}\n`)
    ok++
  } catch (e) {
    process.stdout.write(`   ✗ download failed: ${e.message}\n`); fail++
  }

  await new Promise(r => setTimeout(r, 250))
}

console.log(`\nDone — ${ok} updated, ${fail} failed`)
