import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET: continue-watching list (one latest episode per drama, ordered by recency)
export async function GET(req: NextRequest) {
  try {
    const userId = new URL(req.url).searchParams.get('userId') || 'guest'
    const rows = await db.watchProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      include: {
        drama: true,
        episode: true,
      },
    })
    return NextResponse.json({
      items: rows.map((r) => ({
        dramaId: r.dramaId,
        drama: r.drama,
        episodeNumber: r.episode.number,
        episodeId: r.episodeId,
        position: r.position,
        duration: r.episode.duration,
        updatedAt: r.updatedAt,
      })),
    })
  } catch (e) {
    console.error('GET /api/progress error', e)
    return NextResponse.json({ error: 'Failed to load progress' }, { status: 500 })
  }
}

// POST: upsert watch progress for a drama
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { dramaId, episodeId, position, userId } = body as {
      dramaId?: string
      episodeId?: string
      position?: number
      userId?: string
    }
    if (!dramaId || !episodeId) {
      return NextResponse.json({ error: 'dramaId and episodeId are required' }, { status: 400 })
    }
    const row = await db.watchProgress.upsert({
      where: { userId_dramaId: { userId: userId || 'guest', dramaId } },
      create: {
        userId: userId || 'guest',
        dramaId,
        episodeId,
        position: position || 0,
      },
      update: {
        episodeId,
        position: position || 0,
      },
    })
    return NextResponse.json({ ok: true, id: row.id })
  } catch (e) {
    console.error('POST /api/progress error', e)
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
  }
}

// DELETE: remove a continue-watching entry
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dramaId = searchParams.get('dramaId')
    const userId = searchParams.get('userId') || 'guest'
    if (!dramaId) {
      return NextResponse.json({ error: 'dramaId is required' }, { status: 400 })
    }
    await db.watchProgress.deleteMany({ where: { userId, dramaId } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/progress error', e)
    return NextResponse.json({ error: 'Failed to remove progress' }, { status: 500 })
  }
}
