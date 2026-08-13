import { Suspense } from 'react'
import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-6 font-orbitron text-2xl font-black text-white neon-text-cyan">
        [ ACCESS_TERMINAL ]
      </h1>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
