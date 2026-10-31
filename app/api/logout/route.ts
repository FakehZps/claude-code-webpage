import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth'

export async function POST(req: NextRequest) {
  // 303 so the browser follows with a GET to /login after the form POST.
  const res = NextResponse.redirect(new URL('/login', req.url), 303)
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}
