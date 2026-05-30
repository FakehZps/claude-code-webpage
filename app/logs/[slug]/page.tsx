import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getLogBySlug, getAllSlugs } from '@/lib/mdx'
import { getMDXComponents } from '@/components/MDXComponents'
import { formatDate, getRatingStars } from '@/lib/utils'

interface PageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const log = getLogBySlug(params.slug)
  if (!log) return {}
  return {
    title: `${log.title} // Memory_Timeline`,
    description: log.excerpt,
  }
}

export default function LogPage({ params }: PageProps) {
  const log = getLogBySlug(params.slug)
  if (!log) notFound()

  return (
    <article className="mx-auto max-w-3xl">
      {/* Back link */}
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 font-space-mono text-xs text-gray-500 transition-colors hover:text-neon-cyan"
      >
        &lt; BACK_TO_TIMELINE
      </Link>

      {/* Hero */}
      <header className="relative mb-8 overflow-hidden border border-neon-cyan/20">
        {/* Cover image */}
        <div className="relative h-56 w-full sm:h-72">
          {log.coverImage ? (
            <Image
              src={log.coverImage}
              alt={log.title}
              fill
              className="object-cover"
              unoptimized
              priority
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-neon-cyan/10 to-neon-pink/10" />
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-base via-base/70 to-transparent" />
        </div>

        {/* Title block overlaid on image */}
        <div className="relative -mt-24 px-6 pb-6">
          {/* Category + award badges */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="border border-neon-cyan/40 bg-surface px-2 py-0.5 font-space-mono text-xs uppercase tracking-widest text-neon-cyan">
              {log.category}
            </span>
            {log.platform && (
              <span className="border border-neon-cyan/20 px-2 py-0.5 font-space-mono text-xs text-gray-500">
                {log.platform}
              </span>
            )}
            {log.award === 'GOTY' && (
              <span className="border border-neon-yellow px-2 py-0.5 font-space-mono text-xs neon-text-yellow">
                ★ GAME OF THE YEAR
              </span>
            )}
            {log.award === 'WORST' && (
              <span className="border border-neon-pink px-2 py-0.5 font-space-mono text-xs neon-text-pink">
                ✕ WORST OF YEAR
              </span>
            )}
          </div>

          <h1
            data-testid="log-title"
            className="font-orbitron text-2xl font-black leading-tight text-white sm:text-3xl"
            style={{ textShadow: '0 0 30px rgba(0,243,255,0.3)' }}
          >
            {log.title}
          </h1>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-4 font-space-mono text-xs text-gray-500">
            {log.completionDate && (
              <span>Completed: {formatDate(log.completionDate)}</span>
            )}
            <span>Logged: {formatDate(log.date)}</span>
            {log.rating !== null && (
              <span className="neon-text-yellow">
                {getRatingStars(log.rating)} {log.rating}/10
              </span>
            )}
          </div>
        </div>
      </header>

      {/* MDX body */}
      <div
        data-testid="mdx-body"
        className="border-l border-neon-cyan/10 pl-6"
      >
        <MDXRemote source={log.content} components={getMDXComponents()} />
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-neon-cyan/10 pt-6">
        <Link
          href="/"
          className="font-space-mono text-xs text-gray-600 transition-colors hover:text-neon-cyan"
        >
          [&gt; Return to Memory_Timeline]
        </Link>
      </footer>
    </article>
  )
}
