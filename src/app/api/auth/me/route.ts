import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminUid } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const uid = getAdminUid(req)
  if (!uid) {
    return NextResponse.json({ authenticated: false })
  }
  const user = await db.adminUser.findUnique({ where: { id: uid } })
  if (!user) {
    return NextResponse.json({ authenticated: false })
  }
  return NextResponse.json({ authenticated: true, email: user.email })
}
