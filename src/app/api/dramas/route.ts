import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const section = searchParams.get('section') // featured | mustSee | trending | hiddenGem | new
    const genre = searchParams.get('genre')
    const q = searchParams.get('q')
    const sort = searchParams.get('sort') || 'popular' // popular | new | episodes | likes
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const excludeId = searchParams.get('excludeId')

    const where: Record<string, unknown> = {}
    if (section === 'featured') where.featured = true
    if (section === 'mustSee') where.mustSee = true
    if (section === 'trending') where.trending = true
    if (section === 'hiddenGem') where.hiddenGem = true
    if (section === 'new') where.isNew = true
    if (genre && genre !== 'All') where.genre = genre
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { genre: { contains: q } },
        { tags: { contains: q } },
      ]
    }
    if (excludeId) where.id = { not: excludeId }

    const orderBy: Record<string, 'desc'>[] = []
    if (sort === 'popular') orderBy.push({ views: 'desc' })
    if (sort === 'new') orderBy.push({ createdAt: 'desc' })
    if (sort === 'episodes') orderBy.push({ totalEpisodes: 'desc' })
    if (sort === 'likes') orderBy.push({ likes: 'desc' })
    if (orderBy.length === 0) orderBy.push({ views: 'desc' })

    const [dramas, total] = await Promise.all([
      db.drama.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.drama.count({ where }),
    ])

    return NextResponse.json({
      dramas: dramas.map(parseTags),
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (e) {
    console.error('GET /api/dramas error', e)
    return NextResponse.json({ error: 'Failed to load dramas' }, { status: 500 })
  }
}

export function parseTags(d: { tags: string } & Record<string, unknown>) {
  let tags: string[] = []
  try {
    tags = JSON.parse(d.tags)
  } catch {
    tags = []
  }
  return { ...d, tags }
}
