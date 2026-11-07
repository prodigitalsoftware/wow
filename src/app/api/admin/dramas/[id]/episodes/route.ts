import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminUid } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST: add an episode to a drama (admin only)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!getAdminUid(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const body = await req.json()
    const { number, title, videoUrl, duration, isFree } = body as {
      number?: number
      title?: string
      videoUrl?: string
      duration?: number
      isFree?: boolean
    }
    if (!videoUrl?.trim()) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 })
    }
    const drama = await db.drama.findUnique({ where: { id } })
    if (!drama) {
      return NextResponse.json({ error: 'Drama not found' }, { status: 404 })
    }

    // Auto next episode number if not provided
    let epNumber = number
    if (!epNumber || epNumber < 1) {
      const last = await db.episode.findFirst({
        where: { dramaId: id },
        orderBy: { number: 'desc' },
      })
      epNumber = (last?.number ?? 0) + 1
    }

    const dupe = await db.episode.findUnique({
      where: { dramaId_number: { dramaId: id, number: epNumber } },
    })
    if (dupe) {
      return NextResponse.json({ error: `Episode ${epNumber} already exists` }, { status: 409 })
    }

    const episode = await db.episode.create({
      data: {
        dramaId: id,
        number: epNumber,
        title: title?.trim() || `Episode ${epNumber}`,
        videoUrl: videoUrl.trim(),
        duration: duration && duration > 0 ? Math.round(duration) : 120,
        isFree: isFree ?? true,
      },
    })

    // Keep denormalized totalEpisodes in sync
    const count = await db.episode.count({ where: { dramaId: id } })
    await db.drama.update({ where: { id }, data: { totalEpisodes: count } })

    return NextResponse.json({ ok: true, episode })
  } catch (e) {
    console.error('POST /api/admin/dramas/[id]/episodes error', e)
    return NextResponse.json({ error: 'Failed to create episode' }, { status: 500 })
  }
}
