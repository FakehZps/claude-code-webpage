'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GENRE_OPTIONS, PLATFORM_OPTIONS } from '@/lib/constants'
import { validateEntryPayload } from '@/lib/validateEntry'
import Button from '@/components/ui/Button'
import FormField from '@/components/ui/FormField'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import CoverImageUpload, {
  CoverImageValue,
} from '@/components/admin/CoverImageUpload'

const OTHER = 'Other'

export interface EntryFormInitialData {
  title: string
  platform: string
  genre: string
  completionDate: string
  rating: number
  excerpt: string
  reviewBody?: string
  coverImagePath?: string
}

export interface EntryFormProps {
  mode?: 'create' | 'edit'
  slug?: string
  initialData?: EntryFormInitialData
}

interface SubmitResult {
  slug: string
  mode: 'mdx' | 'json'
}

function resolveOptionState(
  value: string | undefined,
  options: readonly string[]
): { selected: string; other: string } {
  if (!value) return { selected: options[0], other: '' }
  if ((options as readonly string[]).includes(value)) {
    return { selected: value, other: '' }
  }
  return { selected: OTHER, other: value }
}

export default function EntryForm({
  mode = 'create',
  slug,
  initialData,
}: EntryFormProps) {
  const router = useRouter()
  const isEdit = mode === 'edit'

  const initialPlatform = resolveOptionState(
    initialData?.platform,
    PLATFORM_OPTIONS
  )
  const initialGenre = resolveOptionState(initialData?.genre, GENRE_OPTIONS)

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [platform, setPlatform] = useState<string>(initialPlatform.selected)
  const [platformOther, setPlatformOther] = useState(initialPlatform.other)
  const [genre, setGenre] = useState<string>(initialGenre.selected)
  const [genreOther, setGenreOther] = useState(initialGenre.other)
  const [completionDate, setCompletionDate] = useState(
    initialData?.completionDate ?? ''
  )
  const [rating, setRating] = useState(
    initialData?.rating !== undefined ? String(initialData.rating) : ''
  )
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '')
  const [reviewBody, setReviewBody] = useState(initialData?.reviewBody ?? '')
  const [coverImage, setCoverImage] = useState<CoverImageValue | null>(null)

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setResult(null)

    const resolvedPlatform = platform === OTHER ? platformOther.trim() : platform
    const resolvedGenre = genre === OTHER ? genreOther.trim() : genre

    const payload = {
      title: title.trim(),
      platform: resolvedPlatform,
      genre: resolvedGenre,
      completionDate,
      rating: rating === '' ? NaN : Number(rating),
      excerpt: excerpt.trim(),
      reviewBody: reviewBody.trim() || undefined,
      coverImage: coverImage ?? undefined,
    }

    const validation = validateEntryPayload(payload)
    if (!validation.ok) {
      setFieldErrors(validation.errors ?? {})
      return
    }
    setFieldErrors({})
    setLoading(true)

    try {
      const res = await fetch(
        isEdit ? `/api/entries/${slug}` : '/api/entries',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      const body = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (body.fields) setFieldErrors(body.fields)
        setFormError(body.error ?? 'Submission failed')
        setLoading(false)
        return
      }

      if (isEdit) {
        router.push('/admin')
        router.refresh()
        return
      }

      setResult({ slug: body.slug, mode: body.mode })
      setTitle('')
      setPlatform(PLATFORM_OPTIONS[0])
      setPlatformOther('')
      setGenre(GENRE_OPTIONS[0])
      setGenreOther('')
      setCompletionDate('')
      setRating('')
      setExcerpt('')
      setReviewBody('')
      setCoverImage(null)
      setLoading(false)
    } catch {
      setFormError('Network error — try again')
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!slug) return
    if (!window.confirm('Delete this entry? This cannot be undone.')) return

    setDeleting(true)
    setFormError(null)
    try {
      const res = await fetch(`/api/entries/${slug}`, { method: 'DELETE' })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFormError(body.error ?? 'Delete failed')
        setDeleting(false)
        return
      }
      router.push('/admin')
      router.refresh()
    } catch {
      setFormError('Network error — try again')
      setDeleting(false)
    }
  }

  return (
    <form
      data-testid="entry-form"
      onSubmit={handleSubmit}
      className="border border-neon-cyan/20 bg-black/40 p-6 backdrop-blur-sm"
    >
      <FormField label="TITLE" htmlFor="title" error={fieldErrors.title}>
        <Input
          id="title"
          data-testid="entry-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={!!fieldErrors.title}
        />
      </FormField>

      <FormField label="PLATFORM" htmlFor="platform" error={fieldErrors.platform}>
        <Select
          id="platform"
          data-testid="entry-platform-select"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          error={!!fieldErrors.platform}
        >
          {PLATFORM_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
        {platform === OTHER && (
          <Input
            className="mt-2"
            placeholder="Enter platform"
            value={platformOther}
            onChange={(e) => setPlatformOther(e.target.value)}
          />
        )}
      </FormField>

      <FormField label="GENRE" htmlFor="genre" error={fieldErrors.genre}>
        <Select
          id="genre"
          data-testid="entry-genre-select"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          error={!!fieldErrors.genre}
        >
          {GENRE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
        {genre === OTHER && (
          <Input
            className="mt-2"
            placeholder="Enter genre"
            value={genreOther}
            onChange={(e) => setGenreOther(e.target.value)}
          />
        )}
      </FormField>

      <FormField
        label="COMPLETION DATE"
        htmlFor="completionDate"
        error={fieldErrors.completionDate}
      >
        <Input
          id="completionDate"
          data-testid="entry-date-input"
          type="date"
          value={completionDate}
          onChange={(e) => setCompletionDate(e.target.value)}
          error={!!fieldErrors.completionDate}
        />
      </FormField>

      <FormField label="RATING (0-10)" htmlFor="rating" error={fieldErrors.rating}>
        <Input
          id="rating"
          data-testid="entry-rating-input"
          type="number"
          min={0}
          max={10}
          step={0.5}
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          error={!!fieldErrors.rating}
        />
      </FormField>

      <FormField label="COMMENT" htmlFor="excerpt" error={fieldErrors.excerpt}>
        <Textarea
          id="excerpt"
          data-testid="entry-excerpt-textarea"
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          error={!!fieldErrors.excerpt}
        />
      </FormField>

      <FormField
        label="FULL REVIEW (OPTIONAL — LEAVE BLANK FOR A QUICK LOG)"
        htmlFor="reviewBody"
        error={fieldErrors.reviewBody}
      >
        <Textarea
          id="reviewBody"
          data-testid="entry-review-body-textarea"
          rows={8}
          value={reviewBody}
          onChange={(e) => setReviewBody(e.target.value)}
          error={!!fieldErrors.reviewBody}
        />
      </FormField>

      <FormField label="COVER IMAGE (OPTIONAL)" error={fieldErrors.coverImage}>
        <CoverImageUpload
          value={coverImage}
          onChange={setCoverImage}
          initialPreviewUrl={initialData?.coverImagePath}
        />
      </FormField>

      {formError && (
        <p
          data-testid="entry-error-message"
          className="mb-4 font-space-mono text-xs text-neon-pink"
        >
          {formError}
        </p>
      )}

      {result && (
        <p
          data-testid="entry-success-message"
          className="mb-4 font-space-mono text-xs text-neon-cyan"
        >
          Entry saved as {result.mode === 'mdx' ? 'a full review' : 'a quick log'}{' '}
          (slug: {result.slug}).
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" data-testid="entry-submit-button" loading={loading}>
          {loading ? 'SAVING...' : isEdit ? 'SAVE CHANGES' : 'SAVE ENTRY'}
        </Button>
        {isEdit && (
          <Button
            type="button"
            variant="danger"
            data-testid="entry-delete-button"
            loading={deleting}
            onClick={handleDelete}
          >
            {deleting ? 'DELETING...' : 'DELETE ENTRY'}
          </Button>
        )}
      </div>
    </form>
  )
}
