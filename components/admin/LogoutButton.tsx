'use client'

import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <Button
      type="button"
      variant="secondary"
      data-testid="logout-button"
      onClick={handleLogout}
    >
      [ LOGOUT ]
    </Button>
  )
}
