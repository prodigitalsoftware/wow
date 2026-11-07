import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminUid } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST: create a new drama (admin only)
export async function POST(req: NextRequest) {
  try {
    if (!getAdminUid(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const { title, description, genre, tags, coverTheme, status, flags } = body as {
      title?: string
      description?: string
      genre?: string
      tags?: string[]
      coverTheme?: number
      status?: string
      flags?: { featured?: boolean; trending?: boolean; mustSee?: boolean; hiddenGem?: boolean; isNew?: boolean }
    }
    if (!title?.trim() || !description?.trim() || !genre) {
      return NextResponse.json({ error: 'Title, description and genre are required' }, { status: 400 })
    }
    const drama = await db.drama.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        genre,
        tags: JSON.stringify(tags && tags.length > 0 ? tags : [genre]),
        coverTheme: coverTheme ?? 0,
        status: status === 'completed' ? 'completed' : 'ongoing',
        totalEpisodes: 0,
        featured: flags?.featured ?? false,
        trending: flags?.trending ?? false,
        mustSee: flags?.mustSee ?? false,
        hiddenGem: flags?.hiddenGem ?? false,
        isNew: flags?.isNew ?? true,
      },
    })
    return NextResponse.json({ ok: true, drama })
  } catch (e) {
    console.error('POST /api/admin/dramas error', e)
    return NextResponse.json({ error: 'Failed to create drama' }, { status: 500 })
  }
}
