'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'HOME', href: '/', testId: 'nav-home-link' },
  { label: 'ARCHIVE', href: '/', testId: 'nav-archive-link' },
]

export default function TerminalNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neon-cyan/20 bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* CLI prompt */}
        <div className="flex items-center gap-0 font-space-mono text-xs text-neon-cyan sm:text-sm">
          <span className="text-gray-500">C:\FakeH\</span>
          <span className="neon-text-cyan">Memory_Timeline</span>
          <span className="text-gray-500">&gt;&nbsp;</span>
          <span className="animate-blink text-neon-cyan">█</span>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.testId}
              href={link.href}
              data-testid={link.testId}
              className={cn(
                'font-space-mono text-xs tracking-widest transition-all duration-150',
                pathname === link.href
                  ? 'neon-text-yellow'
                  : 'text-gray-500 hover:text-neon-cyan'
              )}
            >
              [&nbsp;{link.label}&nbsp;]
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
