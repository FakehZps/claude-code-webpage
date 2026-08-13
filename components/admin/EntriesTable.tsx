'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDate, getRatingStars } from '@/lib/utils'
import type { LogMeta } from '@/lib/mdx'
import Button from '@/components/ui/Button'

export default function EntriesTable({ entries }: { entries: LogMeta[] }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null)

  const query = searchQuery.trim().toLowerCase()
  const filtered = query
    ? entries.filter((e) => {
        const haystack = [e.title, e.platform, e.genre, e.excerpt]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(query)
      })
    : entries

  async function handleDelete(slug: string) {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return

    setDeletingSlug(slug)
    try {
      const res = await fetch(`/api/entries/${slug}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        window.alert(body.error ?? 'Delete failed')
        setDeletingSlug(null)
        return
      }
      router.refresh()
    } catch {
      window.alert('Network error — try again')
      setDeletingSlug(null)
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 border border-neon-cyan/20 bg-black/40 px-3 py-2 backdrop-blur-sm">
        <span className="font-space-mono text-xs text-neon-cyan">SEARCH&gt;</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="title, platform, genre..."
          data-testid="admin-search-input"
          className="flex-1 bg-transparent font-space-mono text-xs text-gray-100 placeholder:text-gray-600 focus:outline-none"
        />
        <span className="shrink-0 font-space-mono text-[10px] text-gray-500">
          {filtered.length} ENTR{filtered.length !== 1 ? 'IES' : 'Y'}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div
          data-testid="admin-entries-empty"
          className="border border-neon-cyan/20 bg-black/40 p-6 text-center backdrop-blur-sm"
        >
          <p className="font-space-mono text-xs text-gray-400">NO MATCHES</p>
        </div>
      ) : (
        <div className="divide-y divide-neon-cyan/10 border border-neon-cyan/20 bg-black/40 backdrop-blur-sm">
          {filtered.map((entry) => (
            <div
              key={entry.slug}
              data-testid={`admin-entry-row-${entry.slug}`}
              className="flex flex-wrap items-center gap-3 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-orbitron text-xs font-bold text-white">
                  {entry.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 font-space-mono text-[10px] text-gray-400">
                  {entry.platform && <span>{entry.platform}</span>}
                  {entry.genre && <span>&middot; {entry.genre}</span>}
                  {entry.rating !== null && (
                    <span className="neon-text-yellow">
                      {getRatingStars(entry.rating)} {entry.rating}/10
                    </span>
                  )}
                  <span>{formatDate(entry.date)}</span>
                  <span>{entry.hasFullReview ? 'FULL REVIEW' : 'QUICK LOG'}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/edit/${entry.slug}`}
                  data-testid={`admin-entry-edit-link-${entry.slug}`}
                  className="border border-gray-600 px-3 py-1.5 font-space-mono text-xs text-gray-400 transition-colors hover:border-neon-cyan hover:text-neon-cyan"
                >
                  [ EDIT ]
                </Link>
                <Button
                  type="button"
                  variant="danger"
                  data-testid={`admin-entry-delete-button-${entry.slug}`}
                  loading={deletingSlug === entry.slug}
                  onClick={() => handleDelete(entry.slug)}
                >
                  DEL
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
