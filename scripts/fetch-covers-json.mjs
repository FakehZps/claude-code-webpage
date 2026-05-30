/**
 * Fetches cover images from RAWG for all entries in content/games.json.
 * Usage: node scripts/fetch-covers-json.mjs <RAWG_API_KEY>
 */

import fs from 'fs/promises'
import { createWriteStream } from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'
import { fileURLToPath } from 'url'

const RAWG_KEY  = process.argv[2]
if (!RAWG_KEY) {
  console.error('Usage: node scripts/fetch-covers-json.mjs <RAWG_API_KEY>')
  process.exit(1)
}

const __dirname   = path.dirname(fileURLToPath(import.meta.url))
const GAMES_FILE  = path.join(__dirname, '../content/games.json')
const IMAGES_DIR  = path.join(__dirname, '../public/images')

await fs.mkdir(IMAGES_DIR, { recursive: true })

const games = JSON.parse(await fs.readFile(GAMES_FILE, 'utf8'))
const todo  = games.filter(g => !g.coverImage)
console.log(`${todo.length} entries need cover images\n`)

let found = 0, missing = 0, errors = 0

for (let i = 0; i < games.length; i++) {
  const game = games[i]
  if (game.coverImage) continue

  // Strip subtitle for a cleaner search query
  const query = game.title.replace(/\s*[—–:].+$/, '').trim()
  process.stdout.write(`[${String(i+1).padStart(3)}/${games.length}] ${query} ... `)

  // Search RAWG
  let bgImage = null
  try {
    const url = `https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&key=${RAWG_KEY}&page_size=5`
    const res  = await fetch(url)
    const data = await res.json()
    const hit  = data.results?.find(r => r.background_image) ?? data.results?.[0]
    bgImage    = hit?.background_image ?? null
  } catch (e) {
    process.stdout.write(`FETCH ERROR\n`)
    errors++
    continue
  }

  if (!bgImage) {
    process.stdout.write(`no image\n`)
    missing++
    // Small delay even on miss to stay polite to the API
    await new Promise(r => setTimeout(r, 250))
    continue
  }

  // Download image
  const ext      = bgImage.match(/\.(jpg|jpeg|png|webp)/i)?.[1] ?? 'jpg'
  const filename = `${game.slug}.${ext}`
  const destPath = path.join(IMAGES_DIR, filename)

  try {
    const imgRes = await fetch(bgImage)
    if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status}`)
    await pipeline(imgRes.body, createWriteStream(destPath))
    game.coverImage = `/images/${filename}`
    found++
    process.stdout.write(`✓\n`)
  } catch (e) {
    process.stdout.write(`DOWNLOAD ERROR\n`)
    errors++
  }

  // Polite delay between requests
  await new Promise(r => setTimeout(r, 250))
}

// Write updated JSON
await fs.writeFile(GAMES_FILE, JSON.stringify(games, null, 2), 'utf8')

console.log(`\nDone — ${found} images saved, ${missing} not found on RAWG, ${errors} errors`)
