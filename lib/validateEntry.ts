import { GENRE_OPTIONS, PLATFORM_OPTIONS } from '@/lib/constants'

export interface EntryPayload {
  title: string
  platform: string
  genre: string
  completionDate: string // YYYY-MM-DD
  rating: number // 0-10, 0.5 step
  excerpt: string
  reviewBody?: string
  coverImage?: { filename: string; dataUrl: string }
}

export interface ValidationResult {
  ok: boolean
  data?: EntryPayload
  errors?: Partial<Record<keyof EntryPayload, string>>
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const COVER_IMAGE_RE = /^data:image\/(png|jpe?g|webp);base64,/
const MAX_COVER_IMAGE_BYTES = 4 * 1024 * 1024
const MAX_REVIEW_BODY_CHARS = 200_000

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

export function validateEntryPayload(input: unknown): ValidationResult {
  const errors: Partial<Record<keyof EntryPayload, string>> = {}

  if (typeof input !== 'object' || input === null) {
    return { ok: false, errors: { title: 'Invalid request body' } }
  }
  const body = input as Record<string, unknown>

  // title
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  if (!title || title.length > 200) {
    errors.title = 'Title is required (max 200 characters)'
  }

  // platform
  const platform = typeof body.platform === 'string' ? body.platform.trim() : ''
  if (!platform) {
    errors.platform = 'Platform is required'
  } else if (
    (PLATFORM_OPTIONS as readonly string[]).includes('Other') &&
    body.platform === 'Other'
  ) {
    errors.platform = 'Please provide a specific platform'
  }

  // genre
  const genre = typeof body.genre === 'string' ? body.genre.trim() : ''
  if (!genre) {
    errors.genre = 'Genre is required'
  } else if (
    (GENRE_OPTIONS as readonly string[]).includes('Other') &&
    body.genre === 'Other'
  ) {
    errors.genre = 'Please provide a specific genre'
  }

  // completionDate
  const completionDate =
    typeof body.completionDate === 'string' ? body.completionDate : ''
  if (
    !completionDate ||
    !DATE_RE.test(completionDate) ||
    isNaN(Date.parse(completionDate))
  ) {
    errors.completionDate = 'Completion date must be a valid YYYY-MM-DD date'
  }

  // rating
  const rating = typeof body.rating === 'number' ? body.rating : NaN
  if (
    isNaN(rating) ||
    rating < 0 ||
    rating > 10 ||
    Math.round(rating * 2) !== rating * 2
  ) {
    errors.rating = 'Rating must be a number 0-10 in 0.5 increments'
  }

  // excerpt
  const excerpt = typeof body.excerpt === 'string' ? body.excerpt.trim() : ''
  if (!excerpt || excerpt.length > 500) {
    errors.excerpt = 'Comment is required (max 500 characters)'
  }

  // reviewBody (optional)
  const reviewBody =
    typeof body.reviewBody === 'string' ? body.reviewBody : undefined
  if (reviewBody && reviewBody.length > MAX_REVIEW_BODY_CHARS) {
    errors.reviewBody = 'Review body is too long'
  }

  // coverImage (optional)
  let coverImage: EntryPayload['coverImage']
  if (body.coverImage != null) {
    const ci = body.coverImage as Record<string, unknown>
    const filename = isNonEmptyString(ci.filename) ? ci.filename : ''
    const dataUrl = isNonEmptyString(ci.dataUrl) ? ci.dataUrl : ''

    if (!filename || !dataUrl || !COVER_IMAGE_RE.test(dataUrl)) {
      errors.coverImage = 'Cover image must be a PNG, JPEG, or WebP file'
    } else {
      const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
      const approxBytes = Math.ceil((base64.length * 3) / 4)
      if (approxBytes > MAX_COVER_IMAGE_BYTES) {
        errors.coverImage = 'Cover image must be 4MB or smaller'
      } else {
        coverImage = { filename, dataUrl }
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    data: {
      title,
      platform,
      genre,
      completionDate,
      rating,
      excerpt,
      reviewBody: reviewBody?.trim() ? reviewBody.trim() : undefined,
      coverImage,
    },
  }
}
