import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET: list user's favorite dramas
export async function GET(req: NextRequest) {
  try {
    const userId = new URL(req.url).searchParams.get('userId') || 'guest'
    const rows = await db.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { drama: true },
    })
    return NextResponse.json({
      favorites: rows.map((r) => r.drama).map((d) => ({
        ...d,
        tags: (() => {
          try {
            return JSON.parse(d.tags)
          } catch {
            return []
          }
        })(),
      })),
    })
  } catch (e) {
    console.error('GET /api/favorites error', e)
    return NextResponse.json({ error: 'Failed to load favorites' }, { status: 500 })
  }
}

// POST: toggle favorite for a drama
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { dramaId, userId } = body as { dramaId?: string; userId?: string }
    if (!dramaId) {
      return NextResponse.json({ error: 'dramaId is required' }, { status: 400 })
    }
    const existing = await db.favorite.findUnique({
      where: { userId_dramaId: { userId: userId || 'guest', dramaId } },
    })
    if (existing) {
      await db.favorite.delete({ where: { id: existing.id } })
      return NextResponse.json({ favorited: false })
    }
    await db.favorite.create({ data: { userId: userId || 'guest', dramaId } })
    return NextResponse.json({ favorited: true })
  } catch (e) {
    console.error('POST /api/favorites error', e)
    return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 })
  }
}
