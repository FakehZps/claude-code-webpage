import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface LogFrontmatter {
  title: string
  date: string
  completionDate: string | null
  category: 'review' | 'roundup'
  platform: string | null
  rating: number | null
  coverImage: string
  excerpt: string
  award: 'GOTY' | 'WORST' | null
}

export interface LogMeta extends LogFrontmatter {
  slug: string
}

export interface LogEntry extends LogMeta {
  content: string
}

const logsDir = path.join(process.cwd(), 'content', 'logs')

export function getAllSlugs(): string[] {
  if (!fs.existsSync(logsDir)) return []
  return fs
    .readdirSync(logsDir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
}

export function getAllLogs(): LogMeta[] {
  if (!fs.existsSync(logsDir)) return []

  const slugs = getAllSlugs()

  const logs = slugs.map((slug) => {
    const filePath = path.join(logsDir, `${slug}.mdx`)
    const source = fs.readFileSync(filePath, 'utf-8')
    const { data } = matter(source)

    return {
      ...(data as LogFrontmatter),
      slug,
    } satisfies LogMeta
  })

  return logs.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getLogBySlug(slug: string): LogEntry | null {
  const filePath = path.join(logsDir, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const source = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(source)

  return {
    ...(data as LogFrontmatter),
    slug,
    content,
  }
}
