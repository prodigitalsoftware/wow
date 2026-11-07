import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, signSession, SESSION_COOKIE } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string }
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    const user = await db.adminUser.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    const res = NextResponse.json({ ok: true, email: user.email })
    res.cookies.set(SESSION_COOKIE, signSession(user.id), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })
    return res
  } catch (e) {
    console.error('POST /api/auth/login error', e)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
