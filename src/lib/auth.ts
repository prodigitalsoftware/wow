import crypto from 'crypto'

const SECRET = process.env.AUTH_SECRET || 'dramabox-demo-secret-change-in-production'
export const SESSION_COOKIE = 'db_admin_session'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(pw, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const test = crypto.scryptSync(pw, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  return test.length === expected.length && crypto.timingSafeEqual(test, expected)
}

export function signSession(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, exp: Date.now() + SESSION_TTL_MS })
  ).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifySession(token: string | undefined | null): { uid: string } | null {
  if (!token) return null
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
      uid: string
      exp: number
    }
    if (!data.uid || !data.exp || Date.now() > data.exp) return null
    return { uid: data.uid }
  } catch {
    return null
  }
}

/** Extract and verify the admin session from a request. Returns uid or null. */
export function getAdminUid(req: Request): string | null {
  const cookieHeader = req.headers.get('cookie') || ''
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`))
  if (!match) return null
  const token = decodeURIComponent(match.slice(SESSION_COOKIE.length + 1))
  return verifySession(token)?.uid ?? null
}
