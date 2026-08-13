import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_MAX_AGE, COOKIE_NAME, createSessionToken } from '@/lib/auth'

function timingSafeStringEqual(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest()
  const hashB = crypto.createHash('sha256').update(b).digest()
  return crypto.timingSafeEqual(hashA, hashB)
}

export async function POST(req: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD
  if (!sitePassword) {
    return NextResponse.json(
      { error: 'Server misconfigured: SITE_PASSWORD is not set' },
      { status: 500 }
    )
  }

  const body = await req.json().catch(() => ({ password: '' }))
  const password = typeof body.password === 'string' ? body.password : ''

  if (!password || !timingSafeStringEqual(password, sitePassword)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = await createSessionToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
  return res
}
