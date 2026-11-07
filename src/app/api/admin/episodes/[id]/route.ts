import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminUid } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// PATCH: update an episode (admin only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!getAdminUid(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const body = await req.json()
    const { title, videoUrl, duration, isFree } = body as {
      title?: string
      videoUrl?: string
      duration?: number
      isFree?: boolean
    }
    const episode = await db.episode.update({
      where: { id },
      data: {
        ...(title?.trim() ? { title: title.trim() } : {}),
        ...(videoUrl?.trim() ? { videoUrl: videoUrl.trim() } : {}),
        ...(duration !== undefined && duration > 0 ? { duration: Math.round(duration) } : {}),
        ...(isFree !== undefined ? { isFree } : {}),
      },
    })
    return NextResponse.json({ ok: true, episode })
  } catch (e) {
    console.error('PATCH /api/admin/episodes/[id] error', e)
    return NextResponse.json({ error: 'Failed to update episode' }, { status: 500 })
  }
}

// DELETE: remove an episode (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!getAdminUid(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const episode = await db.episode.findUnique({ where: { id } })
    if (!episode) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 })
    }
    await db.episode.delete({ where: { id } })
    const count = await db.episode.count({ where: { dramaId: episode.dramaId } })
    await db.drama.update({ where: { id: episode.dramaId }, data: { totalEpisodes: count } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/admin/episodes/[id] error', e)
    return NextResponse.json({ error: 'Failed to delete episode' }, { status: 500 })
  }
}
