import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllLogs, type LogMeta } from '@/lib/mdx'
import { getGamesData } from '@/lib/games'
import RetroBackground from '@/components/RetroBackground'

export const metadata: Metadata = {
  title: 'Stats // Memory_Timeline',
  description: 'Aggregate stats across every logged game — ratings, platforms, genres, years.',
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div
      data-testid="stat-tile"
      className="border border-neon-cyan/20 bg-black/90 p-4 text-center backdrop-blur-sm"
    >
      <p className="font-orbitron text-2xl font-black text-white neon-text-cyan sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 font-space-mono text-[10px] tracking-widest text-gray-500">
        {label}
      </p>
    </div>
  )
}

function BarColumn({ label, count, max }: { label: string; count: number; max: number }) {
  const heightPct = max > 0 ? Math.max((count / max) * 100, count > 0 ? 4 : 0) : 0
  return (
    <div className="flex flex-1 flex-col items-center gap-1" title={`${label}: ${count}`}>
      <span className="font-space-mono text-[10px] text-gray-400">{count || ''}</span>
      <div className="flex h-32 w-full items-end justify-center">
        <div
          className="w-full max-w-[24px] rounded-t-sm bg-neon-cyan/70"
          style={{ height: `${heightPct}%` }}
        />
      </div>
      <span className="font-space-mono text-[10px] tracking-wide text-gray-500">{label}</span>
    </div>
  )
}

function BarRow({
  label,
  count,
  max,
  href,
}: {
  label: string
  count: number
  max: number
  href?: string
}) {
  const widthPct = max > 0 ? Math.max((count / max) * 100, 3) : 0
  const content = (
    <>
      <span className="w-36 shrink-0 truncate font-space-mono text-[11px] text-gray-400 group-hover:text-neon-pink">
        {label}
      </span>
      <div className="h-[18px] flex-1 bg-black/30">
        <div
          className="h-full rounded-r-sm bg-neon-pink/60 group-hover:bg-neon-pink/90"
          style={{ width: `${widthPct}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right font-space-mono text-[11px] text-gray-300">
        {count}
      </span>
    </>
  )

  if (!href) {
    return (
      <div className="flex items-center gap-2" title={`${label}: ${count}`}>
        {content}
      </div>
    )
  }

  return (
    <Link
      href={href}
      data-testid="stats-drilldown-link"
      title={`View all ${label} games`}
      className="group flex items-center gap-2 transition-opacity hover:opacity-90"
    >
      {content}
    </Link>
  )
}

function topN(counts: Map<string, number>, n: number): Array<[string, number]> {
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  if (sorted.length <= n) return sorted
  const top = sorted.slice(0, n)
  const otherCount = sorted.slice(n).reduce((sum, [, c]) => sum + c, 0)
  return [...top, ['Other', otherCount]]
}

export default function StatsPage() {
  const mdxLogs = getAllLogs()
  const jsonLogs = getGamesData()
  const mdxSlugs = new Set(mdxLogs.map((l) => l.slug))
  const allLogs: LogMeta[] = [...mdxLogs, ...jsonLogs.filter((l) => !mdxSlugs.has(l.slug))]
  const games = allLogs.filter((l) => l.category === 'review')

  const totalGames = games.length
  const ratings = games.map((g) => g.rating).filter((r): r is number => r !== null)
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '—'

  const yearCounts = new Map<string, number>()
  for (const g of games) {
    const year = g.date.slice(0, 4)
    yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1)
  }
  const years = Array.from(yearCounts.keys()).sort()
  const maxYearCount = Math.max(...Array.from(yearCounts.values()), 1)
  const busiestYear = Array.from(yearCounts.entries()).sort((a, b) => b[1] - a[1])[0]

  const ratingBuckets = new Map<number, number>()
  for (let i = 0; i <= 10; i++) ratingBuckets.set(i, 0)
  for (const r of ratings) {
    const bucket = Math.min(10, Math.max(0, Math.round(r)))
    ratingBuckets.set(bucket, (ratingBuckets.get(bucket) ?? 0) + 1)
  }
  const maxRatingCount = Math.max(...Array.from(ratingBuckets.values()), 1)

  const platformCounts = new Map<string, number>()
  for (const g of games) {
    if (!g.platform) continue
    platformCounts.set(g.platform, (platformCounts.get(g.platform) ?? 0) + 1)
  }
  const topPlatforms = topN(platformCounts, 8)
  const maxPlatformCount = Math.max(...topPlatforms.map(([, c]) => c), 1)
  const topPlatformName = Array.from(platformCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  const genreCounts = new Map<string, number>()
  for (const g of games) {
    if (!g.genre) continue
    genreCounts.set(g.genre, (genreCounts.get(g.genre) ?? 0) + 1)
  }
  const topGenres = topN(genreCounts, 8)
  const maxGenreCount = Math.max(...topGenres.map(([, c]) => c), 1)

  return (
    <div>
      <RetroBackground />

      <div className="relative z-[1]">
        <header className="mb-12 text-center">
          <div className="mx-auto mb-6 inline-block rounded-sm border border-neon-cyan/20 bg-black/80 px-8 py-6 backdrop-blur-sm">
            <p className="mb-2 font-space-mono text-xs tracking-widest text-gray-400">
              // SYSTEM_ANALYTICS
            </p>
            <h1 className="font-orbitron text-3xl font-black tracking-wider text-white neon-text-cyan sm:text-4xl">
              STATS DUMP
            </h1>
          </div>
          <div className="mx-auto h-px max-w-xs bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50" />
        </header>

        <div className="mx-auto max-w-4xl space-y-10">
          {/* KPI ROW */}
          <div data-testid="stats-kpi-row" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="GAMES LOGGED" value={String(totalGames)} />
            <StatTile label="AVG RATING" value={`${avgRating}/10`} />
            <StatTile label="YEARS TRACKED" value={String(years.length)} />
            <StatTile
              label={`BUSIEST YEAR${busiestYear ? ` (${busiestYear[1]})` : ''}`}
              value={busiestYear ? busiestYear[0] : '—'}
            />
          </div>

          {/* ENTRIES PER YEAR */}
          <section>
            <p className="mb-3 font-orbitron text-xs font-bold tracking-widest text-neon-cyan">
              // ENTRIES PER YEAR
            </p>
            <div data-testid="stats-year-chart" className="flex items-end gap-1 border border-neon-cyan/10 bg-black/90 p-3">
              {years.map((year) => (
                <BarColumn key={year} label={year} count={yearCounts.get(year) ?? 0} max={maxYearCount} />
              ))}
            </div>
          </section>

          {/* RATING DISTRIBUTION */}
          <section>
            <p className="mb-3 font-orbitron text-xs font-bold tracking-widest text-neon-cyan">
              // RATING DISTRIBUTION
            </p>
            <div data-testid="stats-rating-chart" className="flex items-end gap-1 border border-neon-cyan/10 bg-black/90 p-3">
              {Array.from(ratingBuckets.entries()).map(([bucket, count]) => (
                <BarColumn key={bucket} label={String(bucket)} count={count} max={maxRatingCount} />
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {/* PLATFORM BREAKDOWN */}
            <section>
              <p className="mb-3 font-orbitron text-xs font-bold tracking-widest text-neon-pink">
                // TOP PLATFORMS
              </p>
              <div data-testid="stats-platform-chart" className="space-y-1.5 border border-neon-pink/10 bg-black/90 p-3">
                {topPlatforms.map(([platform, count]) => (
                  <BarRow
                    key={platform}
                    label={platform}
                    count={count}
                    max={maxPlatformCount}
                    href={platform === 'Other' ? undefined : `/?platform=${encodeURIComponent(platform)}`}
                  />
                ))}
              </div>
            </section>

            {/* GENRE BREAKDOWN */}
            <section>
              <p className="mb-3 font-orbitron text-xs font-bold tracking-widest text-neon-pink">
                // TOP GENRES
              </p>
              <div data-testid="stats-genre-chart" className="space-y-1.5 border border-neon-pink/10 bg-black/90 p-3">
                {topGenres.map(([genre, count]) => (
                  <BarRow
                    key={genre}
                    label={genre}
                    count={count}
                    max={maxGenreCount}
                    href={genre === 'Other' ? undefined : `/?genre=${encodeURIComponent(genre)}`}
                  />
                ))}
              </div>
            </section>
          </div>

          <p className="text-shadow-crisp text-center font-space-mono text-[10px] text-gray-400">
            Most-logged platform: <span className="text-neon-cyan">{topPlatformName}</span>
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl text-center">
          <Link
            href="/"
            className="text-shadow-crisp font-space-mono text-xs text-gray-400 transition-colors hover:text-neon-cyan"
          >
            [&gt; Return to Memory_Timeline]
          </Link>
        </div>
      </div>
    </div>
  )
}
