import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllLogs, type LogMeta } from '@/lib/mdx'
import { getGamesData } from '@/lib/games'
import { getRatingStars } from '@/lib/utils'
import RetroBackground from '@/components/RetroBackground'

export const metadata: Metadata = {
  title: 'Awards Archive // Memory_Timeline',
  description: 'Every Game of the Year and Worst of the Year pick, by year.',
}

function AwardCard({ log, kind }: { log: LogMeta; kind: 'GOTY' | 'WORST' }) {
  const isGoty = kind === 'GOTY'
  const content = (
    <article
      data-testid={isGoty ? 'goty-card' : 'worst-card'}
      className={`flex gap-3 border bg-surface p-3 transition-all duration-200 ${
        isGoty
          ? 'border-neon-yellow/40 hover:border-neon-yellow hover:neon-glow-cyan'
          : 'border-neon-pink/40 hover:border-neon-pink'
      }`}
    >
      <div className="relative h-24 w-20 shrink-0 overflow-hidden">
        {log.coverImage ? (
          <Image
            src={log.coverImage}
            alt={log.title}
            fill
            className="object-cover object-top"
            unoptimized
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-neon-cyan/10 to-neon-pink/10" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <span
          className={`mb-1 font-space-mono text-[10px] tracking-widest ${
            isGoty ? 'neon-text-yellow' : 'neon-text-pink'
          }`}
        >
          {isGoty ? '★ GAME OF THE YEAR' : '✕ WORST OF THE YEAR'}
        </span>
        <p className="line-clamp-2 font-orbitron text-xs font-bold leading-snug text-white">
          {log.title.replace(/\s*[—–].+$/, '')}
        </p>
        {log.rating !== null && (
          <span className="mt-1 font-space-mono text-[10px] neon-text-yellow">
            {getRatingStars(log.rating)} {log.rating}/10
          </span>
        )}
      </div>
    </article>
  )

  return log.hasFullReview ? (
    <Link href={`/logs/${log.slug}`} className="block">
      {content}
    </Link>
  ) : (
    content
  )
}

export default function AwardsPage() {
  const mdxLogs = getAllLogs()
  const jsonLogs = getGamesData()
  const mdxSlugs = new Set(mdxLogs.map((l) => l.slug))
  const logs = [...mdxLogs, ...jsonLogs.filter((l) => !mdxSlugs.has(l.slug))]

  const years = Array.from(new Set(logs.map((l) => l.date.slice(0, 4)))).sort(
    (a, b) => Number(b) - Number(a)
  )

  const rows = years
    .map((year) => {
      const yearLogs = logs.filter((l) => l.date.startsWith(year))
      const goty = yearLogs.find((l) => l.award === 'GOTY') ?? null
      const worst = yearLogs.find((l) => l.award === 'WORST') ?? null
      return { year, goty, worst }
    })
    .filter((r) => r.goty || r.worst)

  return (
    <div>
      <RetroBackground />

      <div className="relative z-[1]">
        <header className="mb-12 text-center">
          <div className="mx-auto mb-6 inline-block rounded-sm border border-neon-cyan/20 bg-black/80 px-8 py-6 backdrop-blur-sm">
            <p className="mb-2 font-space-mono text-xs tracking-widest text-gray-400">
              // AWARDS_ARCHIVE
            </p>
            <h1 className="font-orbitron text-3xl font-black tracking-wider text-white neon-text-cyan sm:text-4xl">
              HALL OF RECORD
            </h1>
            <p className="mt-1 font-space-mono text-xs text-gray-500">
              {rows.length} YEAR{rows.length !== 1 ? 'S' : ''} JUDGED
            </p>
          </div>
          <div className="mx-auto h-px max-w-xs bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50" />
        </header>

        <div data-testid="awards-list" className="mx-auto max-w-3xl space-y-8">
          {rows.map(({ year, goty, worst }) => (
            <div key={year} data-testid="awards-year">
              <p className="mb-3 font-orbitron text-sm font-bold tracking-widest text-neon-pink">
                // {year}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {goty && <AwardCard log={goty} kind="GOTY" />}
                {worst && <AwardCard log={worst} kind="WORST" />}
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl text-center">
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
