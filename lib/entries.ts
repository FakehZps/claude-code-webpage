import matter from 'gray-matter'
import { LogFrontmatter, LogMeta } from '@/lib/mdx'
import { readFile } from '@/lib/persist'

const LOGS_DIR = 'content/logs'
const GAMES_JSON_PATH = 'content/games.json'

export interface LocatedEntry {
  mode: 'mdx' | 'json'
  slug: string
  frontmatter: LogFrontmatter
  reviewBody: string
  sha: string | null
  gamesFileSha: string | null
  gamesArray?: LogMeta[]
}

export async function locateEntry(slug: string): Promise<LocatedEntry | null> {
  const mdxFile = await readFile(`${LOGS_DIR}/${slug}.mdx`)
  if (mdxFile) {
    const { data, content } = matter(mdxFile.content)
    return {
      mode: 'mdx',
      slug,
      frontmatter: data as LogFrontmatter,
      reviewBody: content,
      sha: mdxFile.sha,
      gamesFileSha: null,
    }
  }

  const gamesFile = await readFile(GAMES_JSON_PATH)
  if (gamesFile) {
    const gamesArray: LogMeta[] = JSON.parse(gamesFile.content)
    const entry = gamesArray.find((g) => g.slug === slug)
    if (entry) {
      const frontmatter: LogFrontmatter = {
        title: entry.title,
        date: entry.date,
        completionDate: entry.completionDate,
        category: entry.category,
        platform: entry.platform,
        genre: entry.genre,
        rating: entry.rating,
        coverImage: entry.coverImage,
        excerpt: entry.excerpt,
        award: entry.award,
      }
      return {
        mode: 'json',
        slug,
        frontmatter,
        reviewBody: '',
        sha: null,
        gamesFileSha: gamesFile.sha,
        gamesArray,
      }
    }
  }

  return null
}
