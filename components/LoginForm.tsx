'use client'

import { FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Login failed')
        setLoading(false)
        return
      }

      const from = searchParams.get('from') ?? '/admin/new'
      router.push(from)
      router.refresh()
    } catch {
      setError('Network error — try again')
      setLoading(false)
    }
  }

  return (
    <form
      data-testid="login-form"
      onSubmit={handleSubmit}
      className="border border-neon-cyan/20 bg-black/40 p-6 backdrop-blur-sm"
    >
      <label
        htmlFor="password"
        className="mb-2 block font-space-mono text-xs tracking-widest text-gray-500"
      >
        [ PASSWORD ]
      </label>
      <input
        id="password"
        data-testid="login-password-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
        className="mb-4 w-full border border-neon-cyan/30 bg-black/60 px-3 py-2 font-space-mono text-sm text-gray-200 outline-none transition-colors focus:border-neon-cyan"
      />

      {error && (
        <p
          data-testid="login-error"
          className="mb-4 font-space-mono text-xs text-neon-pink"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        data-testid="login-submit-button"
        disabled={loading}
        className="w-full border border-neon-cyan/40 bg-neon-cyan/10 py-2 font-space-mono text-xs tracking-widest text-neon-cyan transition-colors hover:bg-neon-cyan/20 disabled:opacity-50"
      >
        {loading ? '[ AUTHENTICATING... ]' : '[ CONNECT ]'}
      </button>
    </form>
  )
}
