/**
 * Fetches game cover images from RAWG and updates MDX frontmatter.
 * Usage: node scripts/fetch-covers.mjs <YOUR_RAWG_API_KEY>
 * Get a free key at: https://rawg.io/apidocs
 */

import fs from 'fs/promises'
import path from 'path'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { fileURLToPath } from 'url'

const RAWG_KEY = process.argv[2]
if (!RAWG_KEY) {
  console.error('Usage: node scripts/fetch-covers.mjs <YOUR_RAWG_API_KEY>')
  console.error('Get a free key at: https://rawg.io/apidocs')
  process.exit(1)
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOGS_DIR = path.join(__dirname, '../content/logs')
const IMAGES_DIR = path.join(__dirname, '../public/images')

await fs.mkdir(IMAGES_DIR, { recursive: true })

const files = (await fs.readdir(LOGS_DIR)).filter(f => f.endsWith('.mdx'))

for (const file of files) {
  const filePath = path.join(LOGS_DIR, file)
  const content = await fs.readFile(filePath, 'utf8')

  // Skip if already has a real cover image
  if (/^coverImage:\s*"\/images\//m.test(content)) {
    console.log(`⏭  ${file} — already has cover, skipping`)
    continue
  }

  // Extract title from frontmatter
  const titleMatch = content.match(/^title:\s*"(.+)"/m)
  if (!titleMatch) {
    console.log(`⚠  ${file} — no title found, skipping`)
    continue
  }

  // Strip subtitle after em dash for cleaner search
  const searchTitle = titleMatch[1].replace(/\s*[—–].+$/, '').trim()
  console.log(`🔍 ${file} — searching for "${searchTitle}"`)

  // Search RAWG
  const searchUrl = `https://api.rawg.io/api/games?search=${encodeURIComponent(searchTitle)}&key=${RAWG_KEY}&page_size=5`
  let game
  try {
    const res = await fetch(searchUrl)
    const data = await res.json()
    game = data.results?.find(g => g.background_image) ?? data.results?.[0]
  } catch (err) {
    console.error(`  ✗ RAWG search failed: ${err.message}`)
    continue
  }

  if (!game?.background_image) {
    console.log(`  ✗ no image found on RAWG`)
    continue
  }

  // Download image
  const slug = file.replace('.mdx', '')
  const ext = game.background_image.match(/\.(jpg|jpeg|png|webp)/i)?.[1] ?? 'jpg'
  const imageName = `${slug}.${ext}`
  const imagePath = path.join(IMAGES_DIR, imageName)

  try {
    const imgRes = await fetch(game.background_image)
    if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status}`)
    await pipeline(imgRes.body, createWriteStream(imagePath))
    console.log(`  ✓ saved public/images/${imageName}`)
  } catch (err) {
    console.error(`  ✗ download failed: ${err.message}`)
    continue
  }

  // Patch frontmatter — replace coverImage line
  const updated = content.replace(
    /^coverImage:.*$/m,
    `coverImage: "/images/${imageName}"`
  )
  await fs.writeFile(filePath, updated, 'utf8')
  console.log(`  ✓ updated frontmatter`)
}

console.log('\nDone.')
