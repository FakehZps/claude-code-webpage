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
      </body>
    </html>
  )
}
