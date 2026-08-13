import matter from 'gray-matter'
import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, verifySessionToken } from '@/lib/auth'
import { locateEntry } from '@/lib/entries'
import { extensionForDataUrl } from '@/lib/images'
import { LogFrontmatter, LogMeta } from '@/lib/mdx'
import {
  PersistError,
  commitFile,
  deleteFile,
  readFile,
} from '@/lib/persist'
import { validateEntryPayload } from '@/lib/validateEntry'
import { EntryPayload } from '@/lib/validateEntry'

const LOGS_DIR = 'content/logs'
const GAMES_JSON_PATH = 'content/games.json'
const IMAGES_DIR = 'public/images'

async function checkAuth(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  return token ? verifySessionToken(token) : false
}

async function resolveCoverImagePath(
  slug: string,
  coverImage: EntryPayload['coverImage'],
  existingCoverImage: string
): Promise<string> {
  if (!coverImage) return existingCoverImage

  const ext = extensionForDataUrl(coverImage.dataUrl)
  const base64 = coverImage.dataUrl.slice(coverImage.dataUrl.indexOf(',') + 1)
  const imagePath = `${IMAGES_DIR}/${slug}.${ext}`
  const existing = await readFile(imagePath)

  await commitFile({
    path: imagePath,
    content: base64,
    encoding: 'base64',
    message: `chore: update cover image for ${slug}`,
    sha: existing?.sha ?? null,
  })

  return `/images/${slug}.${ext}`
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const slug = params.slug
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
    const located = await locateEntry(slug)
    if (!located) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    const wantsMdx = !!entry.reviewBody
    const frontmatterBase = {
      title: entry.title,
      date: entry.completionDate,
      completionDate: entry.completionDate,
      category: 'review' as const,
      platform: entry.platform,
      genre: entry.genre,
      rating: entry.rating,
      excerpt: entry.excerpt,
      // Award isn't exposed in the form — preserve whatever was already set.
      award: located.frontmatter.award,
    }

    // mdx -> mdx: overwrite the review in place.
    if (located.mode === 'mdx' && wantsMdx) {
      const coverImage = await resolveCoverImagePath(
        slug,
        entry.coverImage,
        located.frontmatter.coverImage
      )
      const frontmatter: LogFrontmatter = { ...frontmatterBase, coverImage }
      const fileContents = matter.stringify(entry.reviewBody!, frontmatter)
      await commitFile({
        path: `${LOGS_DIR}/${slug}.mdx`,
        content: fileContents,
        encoding: 'utf-8',
        message: `chore: update log entry ${slug}`,
        sha: located.sha,
      })
      return NextResponse.json({ ok: true, slug, mode: 'mdx' })
    }

    // json -> json: update the matching entry in place.
    if (located.mode === 'json' && !wantsMdx) {
      const coverImage = await resolveCoverImagePath(
        slug,
        entry.coverImage,
        located.frontmatter.coverImage
      )
      const frontmatter: LogFrontmatter = { ...frontmatterBase, coverImage }
      const gamesArray = located.gamesArray!
      const idx = gamesArray.findIndex((g) => g.slug === slug)
      gamesArray[idx] = { ...frontmatter, slug, hasFullReview: false }
      await commitFile({
        path: GAMES_JSON_PATH,
        content: JSON.stringify(gamesArray, null, 2) + '\n',
        encoding: 'utf-8',
        message: `chore: update quick log entry ${slug}`,
        sha: located.gamesFileSha,
      })
      return NextResponse.json({ ok: true, slug, mode: 'json' })
    }

    // mdx -> json: review body was cleared, convert to a quick log.
    if (located.mode === 'mdx' && !wantsMdx) {
      const coverImage = await resolveCoverImagePath(
        slug,
        entry.coverImage,
        located.frontmatter.coverImage
      )
      const frontmatter: LogFrontmatter = { ...frontmatterBase, coverImage }
      const gamesFile = await readFile(GAMES_JSON_PATH)
      const gamesArray: LogMeta[] = gamesFile
        ? JSON.parse(gamesFile.content)
        : []
      gamesArray.push({ ...frontmatter, slug, hasFullReview: false })
      await commitFile({
        path: GAMES_JSON_PATH,
        content: JSON.stringify(gamesArray, null, 2) + '\n',
        encoding: 'utf-8',
        message: `chore: convert ${slug} to a quick log`,
        sha: gamesFile?.sha ?? null,
      })
      await deleteFile({
        path: `${LOGS_DIR}/${slug}.mdx`,
        message: `chore: remove full review for ${slug} (converted to quick log)`,
        sha: located.sha,
      })
      return NextResponse.json({ ok: true, slug, mode: 'json' })
    }

    // json -> mdx: a review body was written, convert to a full review.
    const coverImage = await resolveCoverImagePath(
      slug,
      entry.coverImage,
      located.frontmatter.coverImage
    )
    const frontmatter: LogFrontmatter = { ...frontmatterBase, coverImage }
    const fileContents = matter.stringify(entry.reviewBody!, frontmatter)
    await commitFile({
      path: `${LOGS_DIR}/${slug}.mdx`,
      content: fileContents,
      encoding: 'utf-8',
      message: `chore: convert ${slug} to a full review`,
    })
    const gamesArray = located.gamesArray!
    const idx = gamesArray.findIndex((g) => g.slug === slug)
    gamesArray.splice(idx, 1)
    await commitFile({
      path: GAMES_JSON_PATH,
      content: JSON.stringify(gamesArray, null, 2) + '\n',
      encoding: 'utf-8',
      message: `chore: remove quick log entry ${slug} (converted to full review)`,
      sha: located.gamesFileSha,
    })
    return NextResponse.json({ ok: true, slug, mode: 'mdx' })
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const slug = params.slug

  try {
    const located = await locateEntry(slug)
    if (!located) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    if (located.mode === 'mdx') {
      await deleteFile({
        path: `${LOGS_DIR}/${slug}.mdx`,
        message: `chore: delete log entry ${slug}`,
        sha: located.sha,
      })
    } else {
      const gamesArray = located.gamesArray!
      const idx = gamesArray.findIndex((g) => g.slug === slug)
      gamesArray.splice(idx, 1)
      await commitFile({
        path: GAMES_JSON_PATH,
        content: JSON.stringify(gamesArray, null, 2) + '\n',
        encoding: 'utf-8',
        message: `chore: delete quick log entry ${slug}`,
        sha: located.gamesFileSha,
      })
    }

    return NextResponse.json({ ok: true, slug })
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
