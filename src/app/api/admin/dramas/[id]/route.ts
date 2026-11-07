import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminUid } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// PATCH: update an existing drama (admin only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!getAdminUid(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
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

    const existing = await db.drama.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Drama not found' }, { status: 404 })
    }

    const drama = await db.drama.update({
      where: { id },
      data: {
        ...(title?.trim() ? { title: title.trim() } : {}),
        ...(description?.trim() ? { description: description.trim() } : {}),
        ...(genre ? { genre } : {}),
        ...(tags ? { tags: JSON.stringify(tags) } : {}),
        ...(coverTheme !== undefined ? { coverTheme } : {}),
        ...(status ? { status: status === 'completed' ? 'completed' : 'ongoing' } : {}),
        ...(flags
          ? {
              featured: flags.featured ?? existing.featured,
              trending: flags.trending ?? existing.trending,
              mustSee: flags.mustSee ?? existing.mustSee,
              hiddenGem: flags.hiddenGem ?? existing.hiddenGem,
              isNew: flags.isNew ?? existing.isNew,
            }
          : {}),
      },
    })
    return NextResponse.json({ ok: true, drama })
  } catch (e) {
    console.error('PATCH /api/admin/dramas/[id] error', e)
    return NextResponse.json({ error: 'Failed to update drama' }, { status: 500 })
  }
}

// DELETE: remove a drama and its episodes (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!getAdminUid(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    await db.drama.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/admin/dramas/[id] error', e)
    return NextResponse.json({ error: 'Failed to delete drama' }, { status: 500 })
  }
}
