'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { formatDate, getRatingStars } from '@/lib/utils'
import type { LogMeta } from '@/lib/mdx'

const MONTH_ABBR = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

function groupByYear(logs: LogMeta[]) {
  const groups: Record<string, LogMeta[]> = {}
  for (const log of logs) {
    const year = log.date.slice(0, 4)
    if (!groups[year]) groups[year] = []
    groups[year].push(log)
  }
  return Object.entries(groups).sort(([a], [b]) => Number(b) - Number(a))
}

const RATING_OPTIONS = [9, 8, 7, 6]
const AWARD_OPTIONS: Array<'GOTY' | 'WORST'> = ['GOTY', 'WORST']

export default function Timeline({ logs }: { logs: LogMeta[] }) {
  const yearGroups = groupByYear(logs)
  const initialYear = yearGroups[0]?.[0] ?? ''

  const searchParams = useSearchParams()
  const initialPlatform = searchParams.get('platform')
  const initialGenre = searchParams.get('genre')

  const [selectedYear, setSelectedYear] = useState(initialYear)
  const [selected, setSelected] = useState<LogMeta | null>(logs[0] ?? null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPlatform, setFilterPlatform] = useState(initialPlatform ?? 'ALL')
  const [filterGenre, setFilterGenre] = useState(initialGenre ?? 'ALL')
  const [filterAward, setFilterAward] = useState<'ALL' | 'GOTY' | 'WORST'>('ALL')
  const [filterMinRating, setFilterMinRating] = useState<number | null>(null)

  const platforms = Array.from(new Set(logs.map(l => l.platform).filter((p): p is string => !!p))).sort()
  const genres = Array.from(new Set(logs.map(l => l.genre).filter((g): g is string => !!g))).sort()

  const query = searchQuery.trim().toLowerCase()
  const isSearching = query.length > 0
  const hasActiveFilters =
    filterPlatform !== 'ALL' || filterGenre !== 'ALL' || filterAward !== 'ALL' || filterMinRating !== null
  const isFiltering = isSearching || hasActiveFilters

  const filteredResults = isFiltering
    ? logs.filter(l => {
        if (isSearching) {
          const haystack = [l.title, l.platform, l.genre, l.excerpt].filter(Boolean).join(' ').toLowerCase()
          if (!haystack.includes(query)) return false
        }
        if (filterPlatform !== 'ALL' && l.platform !== filterPlatform) return false
        if (filterGenre !== 'ALL' && l.genre !== filterGenre) return false
        if (filterAward !== 'ALL' && l.award !== filterAward) return false
        if (filterMinRating !== null && (l.rating ?? -1) < filterMinRating) return false
        return true
      })
    : []
  const visibleLogs = isFiltering
    ? filteredResults
    : logs.filter(l => l.date.startsWith(selectedYear))

  function clearFilters() {
    setFilterPlatform('ALL')
    setFilterGenre('ALL')
    setFilterAward('ALL')
    setFilterMinRating(null)
  }

  function selectYear(year: string) {
    setSearchQuery('')
    clearFilters()
    setSelectedYear(year)
    // Auto-select the first game of that year if current selection isn't in it
    const yearLogs = logs.filter(l => l.date.startsWith(year))
    if (selected && !yearLogs.find(l => l.slug === selected.slug)) {
      setSelected(yearLogs[0] ?? null)
    }
  }

  function selectLog(log: LogMeta) {
    setSelected(log)
    setSelectedYear(log.date.slice(0, 4))
  }

  function selectRandomLog() {
    if (logs.length === 0) return
    setSearchQuery('')
    clearFilters()
    const random = logs[Math.floor(Math.random() * logs.length)]
    selectLog(random)
  }

  // Scroll the centre panel to the selected card whenever selection changes
  useEffect(() => {
    if (!selected) return
    const card = document.getElementById(`card-${selected.slug}`)
    card?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selected])

  return (
    <div data-testid="timeline">
      {/* SEARCH BAR */}
      <div className="mb-2 flex items-center gap-2 border border-neon-cyan/20 bg-black/90 px-3 py-2 backdrop-blur-sm">
        <span className="font-space-mono text-xs text-neon-cyan">SEARCH&gt;</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="title, platform, genre..."
          data-testid="search-input"
          className="flex-1 bg-transparent font-space-mono text-xs text-gray-100 placeholder:text-gray-600 focus:outline-none"
        />
        {isSearching && (
          <button
            onClick={() => setSearchQuery('')}
            data-testid="search-clear"
            className="font-space-mono text-xs text-gray-500 hover:text-neon-pink"
            aria-label="Clear search"
          >
            [x]
          </button>
        )}
        <button
          onClick={selectRandomLog}
          data-testid="random-log-button"
          className="shrink-0 font-space-mono text-xs tracking-widest text-neon-yellow hover:neon-text-yellow"
        >
          [ RANDOM ]
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="mb-3 flex flex-wrap items-center gap-2 border border-neon-cyan/20 bg-black/90 px-3 py-2 backdrop-blur-sm">
        <span className="font-space-mono text-[10px] tracking-widest text-gray-500">FILTER&gt;</span>

        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          data-testid="filter-platform"
          className="border border-neon-cyan/20 bg-black/90 px-1.5 py-0.5 font-space-mono text-[10px] text-gray-300 focus:outline-none"
        >
          <option value="ALL">ALL PLATFORMS</option>
          {platforms.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
          data-testid="filter-genre"
          className="border border-neon-cyan/20 bg-black/90 px-1.5 py-0.5 font-space-mono text-[10px] text-gray-300 focus:outline-none"
        >
          <option value="ALL">ALL GENRES</option>
          {genres.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <select
          value={filterMinRating ?? ''}
          onChange={(e) => setFilterMinRating(e.target.value ? Number(e.target.value) : null)}
          data-testid="filter-rating"
          className="border border-neon-cyan/20 bg-black/90 px-1.5 py-0.5 font-space-mono text-[10px] text-gray-300 focus:outline-none"
        >
          <option value="">ANY RATING</option>
          {RATING_OPTIONS.map(r => (
            <option key={r} value={r}>{r}+ /10</option>
          ))}
        </select>

        <select
          value={filterAward}
          onChange={(e) => setFilterAward(e.target.value as 'ALL' | 'GOTY' | 'WORST')}
          data-testid="filter-award"
          className="border border-neon-cyan/20 bg-black/90 px-1.5 py-0.5 font-space-mono text-[10px] text-gray-300 focus:outline-none"
        >
          <option value="ALL">ALL AWARDS</option>
          {AWARD_OPTIONS.map(a => (
            <option key={a} value={a}>{a} ONLY</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            data-testid="filter-clear"
            className="font-space-mono text-[10px] text-gray-500 hover:text-neon-pink"
          >
            [x] RESET
          </button>
        )}
      </div>

      <div className="grid h-[75vh] grid-cols-1 gap-3 md:grid-cols-[1fr_280px] lg:grid-cols-[180px_1fr_300px]">
      {/* LEFT: Archive index — hidden on mobile/tablet */}
      <aside className="hidden flex-col overflow-hidden border border-neon-cyan/20 bg-black/90 backdrop-blur-sm lg:flex">
        <div className="border-b border-neon-cyan/20 px-3 py-2">
          <p className="font-orbitron text-xs font-bold tracking-widest text-neon-cyan">
            // ARCHIVE
          </p>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-2">
          {yearGroups.map(([year, entries]) => (
            <div key={year}>
              <button
                onClick={() => selectYear(year)}
                className={`mb-1 w-full px-1 text-left font-orbitron text-xs font-bold tracking-widest transition-all ${
                  selectedYear === year
                    ? 'text-neon-pink'
                    : 'text-neon-pink/40 hover:text-neon-pink/80'
                }`}
              >
                {year}
                {selectedYear === year && (
                  <span className="ml-1 font-space-mono text-[9px] text-gray-400">
                    [{entries.length}]
                  </span>
                )}
              </button>
              {entries.map((log) => {
                const month = MONTH_ABBR[new Date(log.date).getUTCMonth()]
                const isActive = selected?.slug === log.slug
                return (
                  <button
                    key={log.slug}
                    onClick={() => selectLog(log)}
                    className={`flex w-full items-baseline gap-2 rounded-sm px-2 py-1 text-left transition-all ${
                      isActive
                        ? 'bg-neon-cyan/10 text-neon-cyan'
                        : 'text-gray-400 hover:text-gray-100'
                    }`}
                  >
                    <span className="shrink-0 font-space-mono text-xs">{month}</span>
                    <span className="truncate font-space-mono text-xs leading-tight">
                      {log.title.replace(/\s*[—–].+$/, '')}
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* CENTER: Filtered card list for selected year */}
      <div className="flex flex-col overflow-hidden">
        <div className="border-b border-neon-cyan/20 bg-black/90 px-3 py-2 backdrop-blur-sm">
          <p className="font-orbitron text-xs font-bold tracking-widest text-neon-cyan">
            // {isSearching ? 'SEARCH RESULTS' : hasActiveFilters ? 'FILTERED' : selectedYear}
            <span className="ml-2 font-space-mono text-[10px] font-normal text-gray-400">
              {visibleLogs.length} ENTR{visibleLogs.length !== 1 ? 'IES' : 'Y'}
            </span>
          </p>
        </div>
        {isFiltering && visibleLogs.length === 0 ? (
          <div
            data-testid="search-empty"
            className="flex flex-1 items-center justify-center p-4 text-center"
          >
            <p className="font-space-mono text-xs text-gray-400">
              {isSearching ? <>NO MATCHES FOR &quot;{searchQuery.trim()}&quot;</> : 'NO MATCHES FOR CURRENT FILTERS'}
            </p>
          </div>
        ) : (
        <div className="space-y-2 overflow-y-auto pr-1 pt-2">
        {visibleLogs.map((log) => {
          const isActive = selected?.slug === log.slug
          const isRoundup = log.category === 'roundup'
          return (
            <article
              key={log.slug}
              id={`card-${log.slug}`}
              data-testid={isRoundup ? 'year-wrapup-node' : 'timeline-node'}
              data-date={log.date}
              onClick={() => selectLog(log)}
              className={`cursor-pointer border transition-all duration-200 ${
                isActive
                  ? 'border-neon-cyan bg-surface neon-glow-cyan'
                  : 'border-neon-cyan/20 bg-surface hover:border-neon-cyan/50'
              }`}
            >
              <div className="flex gap-3">
                {/* Thumbnail */}
                <div className="relative h-24 w-36 shrink-0 overflow-hidden">
                  {log.coverImage ? (
                    <Image
                      src={log.coverImage}
                      alt={log.title}
                      fill
                      className="object-cover object-top opacity-70"
                      unoptimized
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-neon-cyan/10 to-neon-pink/10" />
                  )}
                  {log.award && (
                    <span
                      className={`absolute bottom-1 left-1 border bg-black/80 px-1 font-space-mono text-[10px] ${
                        log.award === 'GOTY'
                          ? 'border-neon-yellow neon-text-yellow'
                          : 'border-neon-pink neon-text-pink'
                      }`}
                    >
                      {log.award === 'GOTY' ? '★ GOTY' : '✕ WORST'}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex min-w-0 flex-1 flex-col justify-center py-2 pr-3">
                  {isRoundup && (
                    <span className="mb-1 font-space-mono text-[10px] tracking-widest text-neon-pink">
                      YEAR WRAP-UP
                    </span>
                  )}
                  <p className="mb-1 line-clamp-2 font-orbitron text-xs font-bold leading-snug text-white">
                    {log.title.replace(/\s*[—–].+$/, '')}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {log.platform && (
                      <span className="border border-neon-cyan/30 px-1 font-space-mono text-[10px] text-neon-cyan">
                        {log.platform}
                      </span>
                    )}
                    {log.genre && (
                      <span className="border border-neon-pink/30 px-1 font-space-mono text-[10px] text-neon-pink">
                        {log.genre}
                      </span>
                    )}
                    {log.rating !== null && (
                      <span className="font-space-mono text-[10px] neon-text-yellow">
                        {getRatingStars(log.rating)}{' '}
                        <span className="font-orbitron text-[10px] font-bold">{log.rating}/10</span>
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-space-mono text-[10px] text-gray-400">
                    {formatDate(log.date)}
                  </p>
                </div>
              </div>
            </article>
          )
        })}
        </div>
        )}
      </div>

      {/* RIGHT: Detail panel */}
      <aside className="hidden flex-col overflow-hidden border border-neon-cyan/20 bg-black/90 backdrop-blur-sm md:flex">
        <div className="border-b border-neon-cyan/20 px-3 py-2">
          <p className="font-orbitron text-xs font-bold tracking-widest text-neon-cyan">
            // LOG DETAIL
          </p>
        </div>

        {selected ? (
          <div className="flex-1 overflow-y-auto">
            {/* Cover — taller, title overlaid at bottom */}
            <div className="relative h-64 w-full shrink-0 overflow-hidden">
              {selected.coverImage ? (
                <Image
                  src={selected.coverImage}
                  alt={selected.title}
                  fill
                  className="object-cover object-top opacity-80"
                  unoptimized
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-neon-cyan/10 to-neon-pink/10" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              {selected.award && (
                <span
                  className={`absolute right-2 top-2 border bg-black/80 px-2 py-0.5 font-space-mono text-xs ${
                    selected.award === 'GOTY'
                      ? 'border-neon-yellow neon-text-yellow'
                      : 'border-neon-pink neon-text-pink'
                  }`}
                >
                  {selected.award === 'GOTY' ? '★ GOTY' : '✕ WORST'}
                </span>
              )}
              {/* Title overlaid on image */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h2 className="font-orbitron text-sm font-bold leading-snug text-white drop-shadow-lg">
                  {selected.title}
                </h2>
              </div>
            </div>

            <div className="space-y-3 p-3">

              {/* Platform */}
              {selected.platform && (
                <div className="flex items-center gap-2">
                  <span className="w-20 shrink-0 font-space-mono text-[10px] tracking-widest text-gray-400">
                    PLATFORM
                  </span>
                  <span className="border border-neon-cyan/30 px-2 py-0.5 font-space-mono text-xs text-neon-cyan">
                    {selected.platform}
                  </span>
                </div>
              )}

              {/* Genre */}
              {selected.genre && (
                <div className="flex items-center gap-2">
                  <span className="w-20 shrink-0 font-space-mono text-[10px] tracking-widest text-gray-400">
                    GENRE
                  </span>
                  <span className="border border-neon-pink/30 px-2 py-0.5 font-space-mono text-xs text-neon-pink">
                    {selected.genre}
                  </span>
                </div>
              )}

              {/* Rating */}
              {selected.rating !== null && (
                <div className="flex items-center gap-2">
                  <span className="w-20 shrink-0 font-space-mono text-[10px] tracking-widest text-gray-400">
                    RATING
                  </span>
                  <span className="font-space-mono text-xs neon-text-yellow">
                    {getRatingStars(selected.rating)}
                  </span>
                  <span className="font-orbitron text-sm font-bold neon-text-yellow">
                    {selected.rating}/10
                  </span>
                </div>
              )}

              {/* Completed */}
              <div className="flex items-center gap-2">
                <span className="w-20 shrink-0 font-space-mono text-[10px] tracking-widest text-gray-500">
                  COMPLETED
                </span>
                <span className="font-space-mono text-xs text-gray-100">
                  {formatDate(selected.completionDate ?? selected.date)}
                </span>
              </div>

              {/* Comment */}
              <div>
                <span className="mb-1 block font-space-mono text-[10px] tracking-widest text-gray-400">
                  COMMENT
                </span>
                <p className="border-l-2 border-neon-cyan/30 pl-2 font-space-mono text-xs leading-relaxed text-gray-300">
                  {selected.excerpt}
                </p>
              </div>

              {/* Link to full log — only for MDX-backed entries */}
              {selected.hasFullReview && (
                <Link
                  href={`/logs/${selected.slug}`}
                  data-testid="access-log-link"
                  className="inline-block border border-neon-cyan/40 px-3 py-1.5 font-space-mono text-xs text-neon-cyan transition-all duration-150 hover:border-neon-cyan hover:bg-neon-cyan/10 hover:neon-glow-cyan"
                >
                  [&gt; Access Full Log]
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center p-4 text-center">
            <p className="font-space-mono text-xs text-gray-400">
              SELECT A LOG<br />TO VIEW DETAILS
              <span className="animate-blink">█</span>
            </p>
          </div>
        )}
      </aside>
      </div>
    </div>
  )
}
