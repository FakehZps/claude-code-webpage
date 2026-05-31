import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { formatDate, getRatingStars } from '@/lib/utils'
import type { LogMeta } from '@/lib/mdx'

interface TimelineNodeProps {
  log: LogMeta
  side: 'left' | 'right'
}

export default function TimelineNode({ log, side }: TimelineNodeProps) {
  return (
    <article
      data-testid="timeline-node"
      data-date={log.date}
      className={cn(
        'relative w-full md:w-[calc(50%-2rem)]',
        side === 'left' ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
      )}
    >
      {/* Connector dot on the timeline line */}
      <div
        className={cn(
          'absolute top-6 hidden h-3 w-3 rounded-full bg-neon-cyan neon-glow-cyan md:block',
          side === 'left' ? '-right-[1.4375rem]' : '-left-[1.4375rem]'
        )}
      />

      {/* Mobile connector dot */}
      <div className="absolute -left-[1.4375rem] top-6 h-3 w-3 rounded-full bg-neon-cyan neon-glow-cyan md:hidden" />

      {/* Card */}
      <div className="group border border-neon-cyan/20 bg-surface transition-all duration-300 hover:border-neon-cyan/60 hover:neon-glow-cyan">
        {/* Cover image */}
        <div className="relative h-40 w-full overflow-hidden">
          {log.coverImage ? (
            <Image
              src={log.coverImage}
              alt={log.title}
              fill
              className="object-cover opacity-60 transition-opacity duration-300 group-hover:opacity-80"
              unoptimized
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-neon-cyan/10 to-neon-pink/10" />
          )}
          {/* Award badge */}
          {log.award === 'GOTY' && (
            <span className="absolute right-2 top-2 border border-neon-yellow bg-black/80 px-2 py-0.5 font-space-mono text-xs neon-text-yellow">
              ★ GOTY
            </span>
          )}
          {log.award === 'WORST' && (
            <span className="absolute right-2 top-2 border border-neon-pink bg-black/80 px-2 py-0.5 font-space-mono text-xs neon-text-pink">
              ✕ WORST
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Meta row */}
          <div className="mb-2 flex items-center justify-between">
            {log.platform && (
              <span className="border border-neon-cyan/30 bg-neon-cyan/5 px-2 py-0.5 font-space-mono text-xs text-neon-cyan">
                {log.platform}
              </span>
            )}
            <span className="font-space-mono text-xs text-gray-600">
              {formatDate(log.date)}
            </span>
          </div>

          {/* Title */}
          <h2 className="mb-1 font-orbitron text-sm font-bold leading-snug text-white transition-colors duration-150 group-hover:text-neon-cyan">
            {log.title}
          </h2>

          {/* Rating */}
          {log.rating !== null && (
            <div className="mb-2 flex items-baseline gap-2">
              <span className="font-space-mono text-sm neon-text-yellow">{getRatingStars(log.rating)}</span>
              <span className="font-orbitron text-sm font-bold neon-text-yellow">{log.rating}/10</span>
            </div>
          )}

          {/* Excerpt */}
          <p className="mb-4 font-space-mono text-xs leading-relaxed text-gray-400">
            {log.excerpt}
          </p>

          {/* CTA */}
          <Link
            href={`/logs/${log.slug}`}
            data-testid="access-log-link"
            className="inline-block border border-neon-cyan/40 px-3 py-1.5 font-space-mono text-xs text-neon-cyan transition-all duration-150 hover:border-neon-cyan hover:bg-neon-cyan/10 hover:neon-glow-cyan"
          >
            [&gt; Access Log]
          </Link>
        </div>
      </div>
    </article>
  )
}
