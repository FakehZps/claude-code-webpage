import type { Metadata } from 'next'
import { Orbitron, Space_Mono } from 'next/font/google'
import './globals.css'
import TerminalNav from '@/components/TerminalNav'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['400', '700', '900'],
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: 'FakeH.dat // Memory_Timeline',
  description:
    'A cyberpunk gaming blog. Logs, reviews, and memory dumps from the digital frontier.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${orbitron.variable} ${spaceMono.variable}`}>
      <body className="min-h-screen bg-base text-gray-200 antialiased">
        {/* CRT scanline overlay */}
        <div className="scanline" aria-hidden="true" />

        <TerminalNav />

        <main className="relative z-10 mx-auto max-w-5xl px-4 py-8">{children}</main>

        <footer className="relative z-10 border-t border-neon-cyan/10 py-4 text-center">
          <p className="font-space-mono text-xs text-gray-600">
            Game data and images provided by{' '}
            <a
              href="https://rawg.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 transition-colors hover:text-neon-cyan"
            >
              RAWG
            </a>
            {' '}· Game cover art © respective publishers and developers.
          </p>
        </footer>
      </body>
    </html>
  )
}
