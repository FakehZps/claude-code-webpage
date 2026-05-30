'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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

export default function Timeline({ logs }: { logs: LogMeta[] }) {
  const yearGroups = groupByYear(logs)
  const initialYear = yearGroups[0]?.[0] ?? ''

  const [selectedYear, setSelectedYear] = useState(initialYear)
  const [selected, setSelected] = useState<LogMeta | null>(logs[0] ?? null)

  const visibleLogs = logs.filter(l => l.date.startsWith(selectedYear))

  function selectYear(year: string) {
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

  return (
    <div
      data-testid="timeline"
      className="grid h-[75vh] grid-cols-1 gap-3 md:grid-cols-[1fr_280px] lg:grid-cols-[180px_1fr_300px]"
    >
      {/* LEFT: Archive index — hidden on mobile/tablet */}
      <aside className="hidden flex-col overflow-hidden border border-neon-cyan/20 bg-black/40 backdrop-blur-sm lg:flex">
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
                  <span className="ml-1 font-space-mono text-[9px] text-gray-600">
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
                        : 'text-gray-500 hover:text-gray-300'
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
        <div className="border-b border-neon-cyan/20 bg-black/40 px-3 py-2 backdrop-blur-sm">
          <p className="font-orbitron text-xs font-bold tracking-widest text-neon-cyan">
            // {selectedYear}
            <span className="ml-2 font-space-mono text-[10px] font-normal text-gray-600">
              {visibleLogs.length} ENTR{visibleLogs.length !== 1 ? 'IES' : 'Y'}
            </span>
          </p>
        </div>
        <div className="space-y-2 overflow-y-auto pr-1 pt-2">
        {visibleLogs.map((log) => {
          const isActive = selected?.slug === log.slug
          const isRoundup = log.category === 'roundup'
          return (
            <article
              key={log.slug}
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
                      className="object-cover opacity-70"
                      unoptimized
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-neon-cyan/10 to-neon-pink/10" />
                  )}
                  {log.award && (
                    <span
                      className={`absolute bottom-1 left-1 border px-1 font-space-mono text-[10px] ${
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
                    {log.rating !== null && (
                      <span className="font-space-mono text-[10px] neon-text-yellow">
                        {getRatingStars(log.rating)}{' '}
                        <span className="font-orbitron text-[10px] font-bold">{log.rating}/10</span>
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-space-mono text-[10px] text-gray-600">
                    {formatDate(log.date)}
                  </p>
                </div>
              </div>
            </article>
          )
        })}
        </div>
      </div>

      {/* RIGHT: Detail panel */}
      <aside className="hidden flex-col overflow-hidden border border-neon-cyan/20 bg-black/40 backdrop-blur-sm md:flex">
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
                  className="object-cover opacity-80"
                  unoptimized
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-neon-cyan/10 to-neon-pink/10" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              {selected.award && (
                <span
                  className={`absolute right-2 top-2 border px-2 py-0.5 font-space-mono text-xs ${
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
                  <span className="w-20 shrink-0 font-space-mono text-[10px] tracking-widest text-gray-500">
                    PLATFORM
                  </span>
                  <span className="border border-neon-cyan/30 px-2 py-0.5 font-space-mono text-xs text-neon-cyan">
                    {selected.platform}
                  </span>
                </div>
              )}

              {/* Rating */}
              {selected.rating !== null && (
                <div className="flex items-center gap-2">
                  <span className="w-20 shrink-0 font-space-mono text-[10px] tracking-widest text-gray-500">
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
                <span className="font-space-mono text-xs text-gray-300">
                  {formatDate(selected.completionDate ?? selected.date)}
                </span>
              </div>

              {/* Comment */}
              <div>
                <span className="mb-1 block font-space-mono text-[10px] tracking-widest text-gray-500">
                  COMMENT
                </span>
                <p className="border-l-2 border-neon-cyan/30 pl-2 font-space-mono text-xs leading-relaxed text-gray-400">
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
            <p className="font-space-mono text-xs text-gray-600">
              SELECT A LOG<br />TO VIEW DETAILS
              <span className="animate-blink">█</span>
            </p>
          </div>
        )}
      </aside>
    </div>
  )
}
