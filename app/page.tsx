import { getAllLogs } from '@/lib/mdx'
import Timeline from '@/components/Timeline'
import RetroBackground from '@/components/RetroBackground'

export default function HomePage() {
  const logs = getAllLogs()

  return (
    <div>
      <RetroBackground />

      <div className="relative z-[1]">
        {/* Header */}
        <header className="mb-16 text-center">
          <div className="mx-auto mb-6 inline-block rounded-sm border border-neon-cyan/20 bg-black/50 px-8 py-6 backdrop-blur-sm">
            <p className="mb-2 font-space-mono text-xs tracking-widest text-gray-600">
              // INITIALIZING MEMORY_TIMELINE
            </p>
            <h1 className="font-orbitron text-3xl font-black tracking-wider text-white neon-text-cyan sm:text-4xl md:text-5xl">
              MEMORY_TIMELINE
            </h1>
            <p className="mt-1 font-space-mono text-xs text-gray-500">
              FakeH.dat &nbsp;|&nbsp; {logs.length} LOG{logs.length !== 1 ? 'S' : ''} INDEXED
            </p>
          </div>
          <div className="mx-auto h-px max-w-xs bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50" />
        </header>

        <Timeline logs={logs} />
      </div>
    </div>
  )
}
