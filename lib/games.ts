import fs from 'fs'
import path from 'path'
import type { LogMeta } from './mdx'

const gamesFile = path.join(process.cwd(), 'content', 'games.json')

export function getGamesData(): LogMeta[] {
  if (!fs.existsSync(gamesFile)) return []
  const raw = fs.readFileSync(gamesFile, 'utf-8')
  return JSON.parse(raw) as LogMeta[]
}
