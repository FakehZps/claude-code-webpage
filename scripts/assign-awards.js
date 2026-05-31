const fs = require('fs')
const path = require('path')

const logsDir = path.join(__dirname, '..', 'content', 'logs')

const files = fs.readdirSync(logsDir).filter(f => f.endsWith('.mdx'))

// Parse frontmatter from each file
const entries = files.map(f => {
  const content = fs.readFileSync(path.join(logsDir, f), 'utf-8')
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return null
  const fm = match[1]
  const get = (key) => {
    const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
    return m ? m[1].trim().replace(/^"|"$/g, '') : null
  }
  const rating = parseFloat(get('rating'))
  const date = get('date')
  const award = get('award')
  const category = get('category')
  const year = date ? date.slice(0, 4) : null
  return { file: f, content, rating, date, year, award, category }
}).filter(e => e && e.category === 'review' && e.year && !isNaN(e.rating))

// Group by year
const byYear = {}
for (const e of entries) {
  if (!byYear[e.year]) byYear[e.year] = []
  byYear[e.year].push(e)
}

let updated = 0

for (const [year, games] of Object.entries(byYear)) {
  // Skip years that already have awards set
  const hasAwards = games.some(g => g.award && g.award !== 'null')
  if (hasAwards) continue

  // Sort by rating
  const sorted = [...games].sort((a, b) => b.rating - a.rating)
  const goty = sorted[0]
  const worst = sorted[sorted.length - 1]

  // Only assign WORST if the rating is genuinely bad (< 6) or clearly the weakest
  const assignWorst = worst.rating < 6 || (sorted.length > 5 && worst.rating <= sorted[sorted.length - 2].rating)

  const updateAward = (entry, award) => {
    const newContent = entry.content.replace(
      /^award: .+$/m,
      `award: "${award}"`
    )
    fs.writeFileSync(path.join(logsDir, entry.file), newContent, 'utf-8')
    console.log(`${year} ${award}: ${entry.file} (${entry.rating})`)
    updated++
  }

  updateAward(goty, 'GOTY')
  if (assignWorst && worst.file !== goty.file) {
    updateAward(worst, 'WORST')
  }
}

console.log(`\nDone. Updated ${updated} files.`)
