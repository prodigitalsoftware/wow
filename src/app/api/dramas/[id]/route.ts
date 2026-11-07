import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const drama = await db.drama.findUnique({
      where: { id },
      include: {
        episodes: { orderBy: { number: 'asc' } },
      },
    })
    if (!drama) {
      return NextResponse.json({ error: 'Drama not found' }, { status: 404 })
    }

    // Increment view count
    await db.drama.update({ where: { id }, data: { views: { increment: 1 } } })

    // Related dramas: same genre first, then popular others
    const related = await db.drama.findMany({
      where: { id: { not: id }, genre: drama.genre },
      orderBy: { views: 'desc' },
      take: 6,
    })
    const fill = related.length < 6
      ? await db.drama.findMany({
          where: { id: { notIn: [id, ...related.map((r) => r.id)] } },
          orderBy: { views: 'desc' },
          take: 6 - related.length,
        })
      : []

    let tags: string[] = []
    try {
      tags = JSON.parse(drama.tags)
    } catch {
      tags = []
    }

    return NextResponse.json({
      drama: { ...drama, tags, episodes: drama.episodes },
      related: [...related, ...fill].map((d) => ({
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
    console.error('GET /api/dramas/[id] error', e)
    return NextResponse.json({ error: 'Failed to load drama' }, { status: 500 })
  }
}
