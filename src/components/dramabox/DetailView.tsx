'use client'

import { useMemo, useState } from 'react'
import {
  Heart,
  Play,
  Lock,
  Crown,
  ChevronDown,
  Check,
  Eye,
  Calendar,
  BookmarkPlus,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { CoverImage } from './CoverImage'
import { DramaCard } from './DramaCard'
import { useAsync } from './hooks'
import type { Drama, Episode } from '@/lib/types'
import { formatViews } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface DetailData {
  drama: Drama & { episodes: Episode[] }
  related: Drama[]
}

export function DetailView({ dramaId }: { dramaId: string }) {
  const { openPlayer, openDrama } = useAppStore()
  const [expanded, setExpanded] = useState(false)
  const [episodesOpen, setEpisodesOpen] = useState(true)
  const [liked, setLiked] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [showUnlockDialog, setShowUnlockDialog] = useState(false)

  const { data, loading, error } = useAsync<DetailData>(async () => {
    const [dRes, fRes] = await Promise.all([
      fetch(`/api/dramas/${dramaId}`),
      fetch('/api/progress?userId=guest'),
    ])
    if (!dRes.ok) throw new Error('failed')
    const dData = await dRes.json()
    let continueEp: number | null = null
    if (fRes.ok) {
      const items = (await fRes.json()).items as { dramaId: string; episodeNumber: number }[]
      const hit = items.find((i) => i.dramaId === dramaId)
      if (hit) continueEp = hit.episodeNumber
    }
    return { ...dData, continueEp }
  }, [dramaId])

  const continueEp: number | null = (data as (DetailData & { continueEp?: number }) | null)?.continueEp ?? null

  const [vip, setVip] = useState(false)
  const vipRef = useMemo(() => vip, [vip])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <Skeleton className="aspect-[2/3] w-48 rounded-2xl md:w-64" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <p className="text-sm text-zinc-400">This drama could not be loaded.</p>
        <Button variant="outline" className="mt-4 rounded-full border-white/15" onClick={() => location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  const { drama, related } = data
  const freeCount = drama.episodes.filter((e) => e.isFree).length
  const canWatchFree = (ep: Episode) => ep.isFree || vipRef

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:py-8">
      {/* hero */}
      <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/10">
        <div className="absolute inset-0">
          <CoverImage title={drama.title} theme={drama.coverTheme} large />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl" />
        </div>

        <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:p-8">
          {/* poster */}
          <div className="w-40 shrink-0 self-center sm:self-start md:w-56">
            <div className="aspect-[2/3] overflow-hidden rounded-xl shadow-2xl shadow-black/60 ring-1 ring-white/15">
              <CoverImage title={drama.title} theme={drama.coverTheme} genre={drama.genre} />
            </div>
          </div>

          {/* info */}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span
                className={cn(
                  'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white',
                  drama.status === 'completed' ? 'bg-emerald-600' : 'bg-orange-600'
                )}
              >
                {drama.status === 'completed' ? 'Completed' : 'Ongoing'}
              </span>
              {drama.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/20 bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white/90"
                >
                  {t}
                </span>
              ))}
            </div>
            <h1 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">{drama.title}</h1>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-300 sm:justify-start">
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-orange-400" /> {formatViews(drama.views)} views
              </span>
              <span className="inline-flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 text-red-400" /> {formatViews(drama.likes)} likes
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                {drama.totalEpisodes} episodes · {freeCount} free
              </span>
            </div>

            <p
              className={cn(
                'mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:mx-0',
                !expanded && 'line-clamp-3'
              )}
            >
              {drama.description}
            </p>
            <button
              onClick={() => setExpanded((e) => !e)}
              className="mt-1 inline-flex items-center gap-0.5 text-xs font-medium text-orange-400 focus-visible:outline-none"
            >
              {expanded ? 'Show less' : 'Show more'}
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-180')} />
            </button>

            {/* actions */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
              <Button
                onClick={() => openPlayer(drama.id, continueEp ?? 1)}
                className="h-11 gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-8 font-bold text-white shadow-lg shadow-orange-500/30 hover:from-orange-400 hover:to-red-400"
              >
                <Play className="h-4 w-4 fill-current" />
                {continueEp ? `Continue EP ${continueEp}` : 'Watch Episode 1'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setLiked((l) => !l)
                  toast.success(liked ? 'Removed from likes' : 'Added to likes!')
                }}
                className={cn(
                  'h-11 w-11 rounded-full border-white/15 bg-black/30 p-0 backdrop-blur-sm',
                  liked && 'border-red-500/50 text-red-400'
                )}
                aria-label="Like this drama"
              >
                <Heart className={cn('h-5 w-5', liked && 'fill-current')} />
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  const res = await fetch('/api/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dramaId: drama.id, userId: 'guest' }),
                  })
                  const j = await res.json()
                  setFavorited(j.favorited)
                  toast.success(j.favorited ? 'Added to My List' : 'Removed from My List')
                }}
                className={cn(
                  'h-11 w-11 rounded-full border-white/15 bg-black/30 p-0 backdrop-blur-sm',
                  favorited && 'border-amber-400/60 text-amber-400'
                )}
                aria-label="Add to my list"
              >
                {favorited ? <Check className="h-5 w-5" /> : <BookmarkPlus className="h-5 w-5" />}
              </Button>
              {!vip && (
                <Button
                  onClick={() => setShowUnlockDialog(true)}
                  className="h-11 gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-4 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-yellow-400"
                >
                  <Crown className="h-4 w-4" /> Unlock All
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* unlock dialog */}
      {showUnlockDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Unlock all episodes"
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-6 text-center shadow-2xl">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
              <Crown className="h-7 w-7 text-zinc-950" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-white">Unlock the full series</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Get instant access to all {drama.totalEpisodes} episodes of {drama.title}, ad-free and in HD.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button
                onClick={() => {
                  setVip(true)
                  setShowUnlockDialog(false)
                  toast.success('VIP unlocked — enjoy the full series!')
                }}
                className="h-11 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-zinc-950 hover:from-amber-400 hover:to-orange-400"
              >
                Start free VIP trial (demo)
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowUnlockDialog(false)}
                className="h-10 rounded-full text-zinc-400 hover:text-white"
              >
                Maybe later
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* episodes */}
      <section className="mt-8" aria-label="Episodes">
        <button
          onClick={() => setEpisodesOpen((o) => !o)}
          className="flex w-full items-center justify-between focus-visible:outline-none"
          aria-expanded={episodesOpen}
        >
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            Episodes <span className="text-sm font-normal text-zinc-500">({drama.totalEpisodes})</span>
          </h2>
          <ChevronDown
            className={cn('h-5 w-5 text-zinc-400 transition-transform', episodesOpen && 'rotate-180')}
          />
        </button>

        {episodesOpen && (
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-8 md:gap-2.5">
            {drama.episodes.map((ep) => {
              const locked = !canWatchFree(ep)
              return (
                <button
                  key={ep.id}
                  onClick={() => (locked ? setShowUnlockDialog(true) : openPlayer(drama.id, ep.number))}
                  className={cn(
                    'group relative flex flex-col items-center rounded-xl border p-2.5 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                    locked
                      ? 'border-white/5 bg-zinc-900/60 hover:border-amber-500/40'
                      : 'border-white/10 bg-zinc-900 hover:border-orange-500/50 hover:bg-zinc-800'
                  )}
                  aria-label={`Episode ${ep.number}${locked ? ' locked' : ''}: ${ep.title}`}
                >
                  <span className="text-sm font-bold text-zinc-100">EP {ep.number}</span>
                  <span className="mt-0.5 w-full truncate text-[10px] text-zinc-500">{ep.title}</span>
                  {locked ? (
                    <span className="mt-1 inline-flex items-center gap-0.5 rounded-full bg-amber-500/15 px-1.5 py-px text-[9px] font-bold uppercase text-amber-400">
                      <Lock className="h-2.5 w-2.5" /> VIP
                    </span>
                  ) : (
                    <span className="mt-1 inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-px text-[9px] font-bold uppercase text-emerald-400">
                      Free
                    </span>
                  )}
                  <span className="absolute right-1.5 top-1.5 text-[9px] text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100">
                    <Heart className="h-2.5 w-2.5" />
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </section>

      {/* related */}
      {related.length > 0 && (
        <section className="mt-10" aria-label="You may also like">
          <h2 className="mb-3 text-lg font-bold text-white">You May Also Like</h2>
          <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {related.map((d) => (
              <DramaCard key={d.id} drama={d} onOpen={openDrama} className="w-[130px] shrink-0 sm:w-[150px]" />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
