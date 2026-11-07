import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST: like an episode
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const { liked } = body as { liked?: boolean }
    const delta = liked ? 1 : -1
    const episode = await db.episode.update({
      where: { id },
      data: { likes: { increment: delta } },
    })
    return NextResponse.json({ ok: true, likes: episode.likes })
  } catch (e) {
    console.error('POST /api/episodes/[id]/like error', e)
    return NextResponse.json({ error: 'Failed to like episode' }, { status: 500 })
  }
}
