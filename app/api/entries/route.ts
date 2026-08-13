import matter from 'gray-matter'
import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, verifySessionToken } from '@/lib/auth'
import { extensionForDataUrl } from '@/lib/images'
import { LogFrontmatter, LogMeta } from '@/lib/mdx'
import { PersistError, commitFile, listDirectory, readFile } from '@/lib/persist'
import { buildReviewSlug, resolveUniqueSlug } from '@/lib/slug'
import { validateEntryPayload } from '@/lib/validateEntry'

const LOGS_DIR = 'content/logs'
const GAMES_JSON_PATH = 'content/games.json'
const IMAGES_DIR = 'public/images'

async function collectExistingSlugs(): Promise<Set<string>> {
  const mdxFiles = await listDirectory(LOGS_DIR)
  const mdxSlugs = mdxFiles
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))

  const gamesFile = await readFile(GAMES_JSON_PATH)
  const gamesSlugs: string[] = gamesFile
    ? (JSON.parse(gamesFile.content) as LogMeta[]).map((g) => g.slug)
    : []

  return new Set([...mdxSlugs, ...gamesSlugs])
}

export async function POST(req: NextRequest) {
  // Defense in depth: middleware already gates this route, re-check here too.
  const token = req.cookies.get(COOKIE_NAME)?.value
  const authed = token ? await verifySessionToken(token) : false
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const result = validateEntryPayload(body)
  if (!result.ok || !result.data) {
    return NextResponse.json(
      { error: 'Validation failed', fields: result.errors },
      { status: 400 }
    )
  }
  const entry = result.data

  try {
    const existingSlugs = await collectExistingSlugs()
    const slug = resolveUniqueSlug(buildReviewSlug(entry.title), existingSlugs)

    let coverImagePath = ''
    if (entry.coverImage) {
      const ext = extensionForDataUrl(entry.coverImage.dataUrl)
      const base64 = entry.coverImage.dataUrl.slice(
        entry.coverImage.dataUrl.indexOf(',') + 1
      )
      coverImagePath = `/images/${slug}.${ext}`
      await commitFile({
        path: `${IMAGES_DIR}/${slug}.${ext}`,
        content: base64,
        encoding: 'base64',
        message: `chore: add cover image for ${slug}`,
      })
    }

    const frontmatter: LogFrontmatter = {
      title: entry.title,
      date: entry.completionDate,
      completionDate: entry.completionDate,
      category: 'review',
      platform: entry.platform,
      genre: entry.genre,
      rating: entry.rating,
      coverImage: coverImagePath,
      excerpt: entry.excerpt,
      award: null,
    }

    if (entry.reviewBody) {
      const fileContents = matter.stringify(entry.reviewBody, frontmatter)
      await commitFile({
        path: `${LOGS_DIR}/${slug}.mdx`,
        content: fileContents,
        encoding: 'utf-8',
        message: `feat: add log entry ${slug}`,
      })
      return NextResponse.json(
        { ok: true, slug, path: `${LOGS_DIR}/${slug}.mdx`, mode: 'mdx' },
        { status: 201 }
      )
    }

    const gamesFile = await readFile(GAMES_JSON_PATH)
    const games: LogMeta[] = gamesFile ? JSON.parse(gamesFile.content) : []
    games.push({ ...frontmatter, slug, hasFullReview: false })
    await commitFile({
      path: GAMES_JSON_PATH,
      content: JSON.stringify(games, null, 2) + '\n',
      encoding: 'utf-8',
      message: `feat: add quick log entry ${slug}`,
      sha: gamesFile?.sha,
    })
    return NextResponse.json(
      { ok: true, slug, path: GAMES_JSON_PATH, mode: 'json' },
      { status: 201 }
    )
  } catch (err) {
    if (err instanceof PersistError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error(err)
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    )
  }
}
