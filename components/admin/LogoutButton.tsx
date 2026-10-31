import Button from '@/components/ui/Button'

// Plain form POST: works before hydration and does a full navigation,
// so the cleared cookie takes effect and no stale client cache is reused.
export default function LogoutButton() {
  return (
    <form action="/api/logout" method="post">
      <Button type="submit" variant="secondary" data-testid="logout-button">
        [ LOGOUT ]
      </Button>
    </form>
  )
}
