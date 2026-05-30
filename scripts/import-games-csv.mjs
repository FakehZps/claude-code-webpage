/**
 * Converts the bulk game completion CSV into content/games.json.
 * Skips any game whose title already exists in an MDX file.
 * Usage: node scripts/import-games-csv.mjs "path/to/file.csv"
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOGS_DIR  = path.join(__dirname, '../content/logs')
const OUT_FILE  = path.join(__dirname, '../content/games.json')
const CSV_PATH  = process.argv[2] ?? path.join(__dirname, '../games completed - Sheet1.csv')

// ── date parser ─────────────────────────────────────────────────────────────
function parseDate(raw) {
  const parts = raw.trim().split('/')
  if (parts.length !== 3) return null
  let [a, b, y] = parts.map(Number)
  if (y < 100) y += 2000          // 2-digit year

  // Determine DD/MM vs MM/DD
  let day, month
  if (a > 12)      { day = a; month = b }   // must be DD/MM
  else if (b > 12) { day = b; month = a }   // must be MM/DD
  else             { day = a; month = b }   // ambiguous → DD/MM (UK default)

  if (!month || month > 12 || !day || day > 31) return null
  return `${y}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
}

// ── slug ────────────────────────────────────────────────────────────────────
function toSlug(title, year) {
  const base = title
    .toLowerCase()
    .replace(/[':.,!?"""]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 55)
  return `${base}-${year}`
}

// ── load existing MDX titles to skip ────────────────────────────────────────
async function loadExistingTitles() {
  const files = (await fs.readdir(LOGS_DIR)).filter(f => f.endsWith('.mdx'))
  const titles = new Set()
  for (const file of files) {
    const text = await fs.readFile(path.join(LOGS_DIR, file), 'utf8')
    // Match both quoted and unquoted title lines
    const m = text.match(/^title:\s*"?([^"\n]+)"?/m)
    if (m) {
      // Strip subtitle (everything after em dash / en dash)
      const base = m[1].replace(/\s*[—–].+$/, '').trim()
      titles.add(base.toLowerCase())
    }
  }
  return titles
}

// ── parse CSV ────────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const rows = []
  for (let i = 1; i < lines.length; i++) {   // skip header
    // Handle quoted fields with commas inside
    const fields = []
    let cur = '', inQ = false
    for (const ch of lines[i] + ',') {
      if (ch === '"') { inQ = !inQ }
      else if (ch === ',' && !inQ) { fields.push(cur.trim()); cur = '' }
      else cur += ch
    }
    if (fields.length >= 5) rows.push(fields)
  }
  return rows
}

// ── main ─────────────────────────────────────────────────────────────────────
const csvText     = await fs.readFile(CSV_PATH, 'utf8')
const rows        = parseCSV(csvText)
const skipTitles  = await loadExistingTitles()
const slugsSeen   = new Set()
const games       = []
let skipped = 0, warnings = 0

for (const [title, platform, , rawDate, rawRating, comment] of rows) {
  if (!title) continue

  // Skip games already covered by a full MDX review
  const baseTitle = title.replace(/\s*[—–].+$/, '').trim().toLowerCase()
  if (skipTitles.has(baseTitle)) {
    skipped++
    continue
  }

  const date = parseDate(rawDate)
  if (!date) {
    console.warn(`⚠  Bad date "${rawDate}" for "${title}" — skipping`)
    warnings++
    continue
  }

  const year    = date.slice(0, 4)
  const rating  = rawRating ? Math.round(Number(rawRating) / 10 * 10) / 10 : null
  const excerpt = (comment ?? '').replace(/^"+|"+$/g, '').trim() || null

  // Unique slug
  let slug = toSlug(title, year)
  if (slugsSeen.has(slug)) slug = `${slug}-${platform.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,15)}`
  if (slugsSeen.has(slug)) slug = `${slug}-${games.length}`
  slugsSeen.add(slug)

  games.push({
    slug,
    title,
    date,
    completionDate: date,
    category: 'review',
    platform: platform || null,
    rating,
    coverImage: null,
    excerpt,
    award: null,
    hasFullReview: false,
  })
}

await fs.writeFile(OUT_FILE, JSON.stringify(games, null, 2), 'utf8')
console.log(`✓ Wrote ${games.length} entries to content/games.json`)
if (skipped)  console.log(`  (${skipped} skipped — already have full MDX reviews)`)
if (warnings) console.log(`  (${warnings} skipped — unparseable dates)`)
