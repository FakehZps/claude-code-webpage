import EntryForm from '@/components/admin/EntryForm'
import LogoutButton from '@/components/admin/LogoutButton'

export default function NewEntryPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-orbitron text-2xl font-black text-white neon-text-cyan">
          [ NEW_LOG_ENTRY ]
        </h1>
        <LogoutButton />
      </div>
      <EntryForm />
    </div>
  )
}
