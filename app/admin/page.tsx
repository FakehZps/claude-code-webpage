import Link from 'next/link'
import { getAllLogs } from '@/lib/mdx'
import { getGamesData } from '@/lib/games'
import EntriesTable from '@/components/admin/EntriesTable'
import LogoutButton from '@/components/admin/LogoutButton'

export default function AdminDashboardPage() {
  const mdxLogs = getAllLogs()
  const jsonLogs = getGamesData()
  const mdxSlugs = new Set(mdxLogs.map((l) => l.slug))
  const entries = [...mdxLogs, ...jsonLogs.filter((l) => !mdxSlugs.has(l.slug))].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-orbitron text-2xl font-black text-white neon-text-cyan">
          [ ADMIN_DASHBOARD ]
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/new"
            data-testid="admin-new-entry-link"
            className="border border-neon-cyan/40 bg-neon-cyan/10 px-4 py-2 font-space-mono text-xs tracking-widest text-neon-cyan transition-colors hover:bg-neon-cyan/20"
          >
            [ + NEW ENTRY ]
          </Link>
          <LogoutButton />
        </div>
      </div>
      <EntriesTable entries={entries} />
    </div>
  )
}
