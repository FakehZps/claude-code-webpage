import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { LogMeta } from '@/lib/mdx'

interface YearWrapUpNodeProps {
  log: LogMeta
}

export default function YearWrapUpNode({ log }: YearWrapUpNodeProps) {
  const year = new Date(log.date).getUTCFullYear()

  return (
    <div
      data-testid="year-wrapup-node"
      className="relative my-8 w-full"
    >
      {/* Full-width card with dual neon borders */}
      <div
        className="border-2 border-neon-yellow bg-gradient-to-r from-neon-yellow/5 via-surface to-neon-pink/5"
        style={{
          borderColor: undefined,
          borderTopColor: '#fcee0a',
          borderBottomColor: '#fcee0a',
          borderLeftColor: '#ff003c',
          borderRightColor: '#ff003c',
          boxShadow:
            '0 0 12px rgba(252,238,10,0.15), 0 0 30px rgba(255,0,60,0.1)',
        }}
      >
        {/* Top label strip */}
        <div className="flex items-center justify-between border-b border-neon-yellow/30 px-6 py-2">
          <span className="font-space-mono text-xs tracking-widest neon-text-pink">
            // MEMORY_DUMP :: ANNUAL_REVIEW
          </span>
          <span className="font-space-mono text-xs text-gray-600">
            {formatDate(log.date)}
          </span>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Year display */}
            <div className="flex items-baseline gap-4">
              <span
                className="font-orbitron text-6xl font-black leading-none md:text-8xl"
                style={{
                  color: '#fcee0a',
                  textShadow: '0 0 20px #fcee0a, 0 0 60px #fcee0a88',
                }}
              >
                {year}
              </span>
              <div>
                <div className="font-space-mono text-xs uppercase tracking-widest text-gray-500">
                  Year In Review
                </div>
                <div className="mt-1 font-orbitron text-lg font-bold text-white">
                  {log.title}
                </div>
              </div>
            </div>

            {/* Excerpt + CTA */}
            <div className="max-w-sm">
              <p className="mb-4 font-space-mono text-xs leading-relaxed text-gray-400">
                {log.excerpt}
              </p>
              <Link
                href={`/logs/${log.slug}`}
                data-testid="access-log-link"
                className="inline-block border border-neon-yellow/60 px-4 py-2 font-space-mono text-xs neon-text-yellow transition-all duration-150 hover:border-neon-yellow hover:bg-neon-yellow/10 hover:neon-glow-yellow"
              >
                [&gt; Access Memory Dump]
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
