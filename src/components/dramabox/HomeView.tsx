'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronRight, Flame, Star, Sparkles, Trophy, History, Trash2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { DramaCard } from './DramaCard'
import { CoverImage } from './CoverImage'
import { useDramas, useAsync } from './hooks'
import type { Drama, ContinueItem } from '@/lib/types'
import { formatViews } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

function SectionHeader({
  icon: Icon,
  title,
  onMore,
}: {
  icon: typeof Flame
  title: string
  onMore?: () => void
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-lg font-bold text-white">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/25 to-red-500/15">
          <Icon className="h-4 w-4 text-orange-400" />
        </span>
        {title}
      </h2>
      {onMore && (
        <button
          onClick={onMore}
          className="flex items-center gap-0.5 text-xs font-medium text-zinc-400 transition-colors hover:text-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
        >
          More <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

function DramaRow({
  icon,
  title,
  section,
  sort = 'popular',
}: {
  icon: typeof Flame
  title: string
  section: string
  sort?: string
}) {
  const { dramas, loading, error } = useDramas({ section, sort, limit: '12' })
  const openDrama = useAppStore((s) => s.openDrama)
  const setBrowsePrefs = useAppStore((s) => s.setBrowsePrefs)
  const navigate = useAppStore((s) => s.navigate)

  const more = () => {
    setBrowsePrefs({ section: section, genre: 'All' })
    navigate('browse')
  }

  return (
    <section aria-label={title}>
      <SectionHeader icon={icon} title={title} onMore={more} />
      {loading ? (
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-[130px] shrink-0 rounded-xl sm:w-[150px]" />
          ))}
        </div>
      ) : error ? (
        <p className="py-8 text-center text-sm text-zinc-500">{error}</p>
      ) : (
        <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {dramas.map((d: Drama) => (
            <DramaCard
              key={d.id}
              drama={d}
              onOpen={openDrama}
              className="w-[130px] shrink-0 snap-start sm:w-[150px]"
              badge={section === 'trending' ? '🔥 Hot' : undefined}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function Hero() {
  const { dramas, loading, error } = useDramas({ section: 'featured', sort: 'views', limit: '5' })
  const openPlayer = useAppStore((s) => s.openPlayer)
  const openDrama = useAppStore((s) => s.openDrama)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (dramas.length < 2) return
    const t = setInterval(() => setIndex((i) => (i + 1) % dramas.length), 5000)
    return () => clearInterval(t)
  }, [dramas.length])

  if (loading) {
    return <Skeleton className="aspect-[4/5] w-full rounded-2xl sm:aspect-[21/9]" />
  }
  if (error || dramas.length === 0) {
    return (
      <div className="flex aspect-[4/5] w-full items-center justify-center rounded-2xl bg-zinc-900 text-sm text-zinc-500 sm:aspect-[21/9]">
        Featured dramas unavailable
      </div>
    )
  }

  const d = dramas[index % dramas.length]

  return (
    <section aria-label="Featured dramas" className="relative">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-white/10 sm:aspect-[21/9]">
        <div className="absolute inset-0 scale-110" key={d.id}>
          <CoverImage title={d.title} theme={d.coverTheme} large />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent sm:bg-gradient-to-r sm:from-black/85 sm:via-black/30 sm:to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5 sm:inset-y-0 sm:left-0 sm:right-[35%] sm:flex sm:flex-col sm:justify-center sm:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-gradient-to-r from-orange-600 to-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Featured
            </span>
            {d.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/25 bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm"
              >
                {t}
              </span>
            ))}
          </div>
          <h1 className="mt-2.5 max-w-xl text-2xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-4xl">
            {d.title}
          </h1>
          <p className="mt-2 line-clamp-2 max-w-lg text-xs leading-relaxed text-zinc-300 sm:line-clamp-3 sm:text-sm">
            {d.description}
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs text-zinc-300">
            <span className="rounded bg-white/10 px-1.5 py-0.5 font-semibold text-amber-400 backdrop-blur-sm">
              {d.totalEpisodes} EP
            </span>
            <span>{formatViews(d.views)} views</span>
            <span className={d.status === 'completed' ? 'text-emerald-400' : 'text-orange-400'}>
              {d.status === 'completed' ? 'Completed' : 'Ongoing'}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2.5">
            <Button
              onClick={() => openPlayer(d.id, 1)}
              className="h-10 gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-6 font-bold text-white shadow-lg shadow-orange-500/30 hover:from-orange-400 hover:to-red-400"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
              Watch Now
            </Button>
            <Button
              variant="outline"
              onClick={() => openDrama(d.id)}
              className="h-10 rounded-full border-white/25 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
            >
              Details
            </Button>
          </div>
        </div>

        {/* dots */}
        <div className="absolute bottom-3 right-4 flex gap-1.5 sm:bottom-6 sm:right-8">
          {dramas.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to featured drama ${i + 1}`}
              className={cn(
                'h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                i === index % dramas.length ? 'w-6 bg-orange-500' : 'w-1.5 bg-white/40 hover:bg-white/70'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function ContinueWatching() {
  const openPlayer = useAppStore((s) => s.openPlayer)
  const { data, loading } = useAsync(async () => {
    const res = await fetch('/api/progress?userId=guest')
    if (!res.ok) throw new Error()
    return (await res.json()) as { items: ContinueItem[] }
  }, [])

  if (loading || !data || data.items.length === 0) return null

  return (
    <section aria-label="Continue watching">
      <SectionHeader icon={History} title="Continue Watching" />
      <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {data.items.slice(0, 10).map((item) => (
          <div key={item.dramaId} className="w-[150px] shrink-0 sm:w-[170px]">
            <button
              onClick={() => openPlayer(item.dramaId, item.episodeNumber)}
              className="group relative block w-full overflow-hidden rounded-xl ring-1 ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              aria-label={`Continue ${item.drama.title} episode ${item.episodeNumber}`}
            >
              <div className="aspect-video w-full">
                <CoverImage title={item.drama.title} theme={item.drama.coverTheme} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90">
                  <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-black" aria-hidden="true">
                    <path d="M8 5.14v14l11-7-11-7z" />
                  </svg>
                </span>
              </div>
              <div className="absolute bottom-1.5 left-1.5 right-1.5">
                <div className="h-1 overflow-hidden rounded-full bg-white/25">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{
                      width: `${Math.min(100, (item.position / Math.max(item.duration, 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <span className="absolute right-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                EP {item.episodeNumber}
              </span>
            </button>
            <p className="mt-1.5 truncate text-xs font-medium text-zinc-300">{item.drama.title}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Top10() {
  const { dramas, loading, error } = useDramas({ sort: 'views', limit: '10' })
  const openDrama = useAppStore((s) => s.openDrama)

  if (loading) {
    return (
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] w-[150px] shrink-0 rounded-xl" />
        ))}
      </div>
    )
  }
  if (error) return <p className="py-8 text-center text-sm text-zinc-500">{error}</p>

  return (
    <section aria-label="Top 10 dramas">
      <SectionHeader icon={Trophy} title="Top 10 This Week" />
      <div className="scrollbar-none -mx-4 flex gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {dramas.map((d, i) => (
          <div key={d.id} className="flex shrink-0 items-end gap-0">
            <span
              className="select-none pr-1 text-6xl font-black italic leading-none text-transparent"
              style={{
                WebkitTextStroke: '2px rgba(255,255,255,0.25)',
                ...(i < 3 ? { WebkitTextStroke: '2px #f97316' } : {}),
              }}
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <DramaCard drama={d} onOpen={openDrama} className="w-[110px] sm:w-[125px]" badge={`#${i + 1}`} />
          </div>
        ))}
      </div>
    </section>
  )
}

export function HomeView() {
  const navigate = useAppStore((s) => s.navigate)
  const setBrowsePrefs = useAppStore((s) => s.setBrowsePrefs)
  const openDrama = useAppStore((s) => s.openDrama)

  const genreChip = (g: string) => {
    setBrowsePrefs({ genre: g, section: 'all' })
    navigate('browse')
  }

  const { dramas: fresh } = useDramas({ section: 'new', sort: 'new', limit: '12' })

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-0 py-4 sm:gap-12 sm:px-4 sm:py-6">
      <div className="px-0 sm:px-0">
        <Hero />
      </div>

      {/* genre chips */}
      <section aria-label="Browse by genre" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {['Romance', 'Fantasy', 'Revenge', 'Family', 'Urban', 'Mystery'].map((g) => (
          <button
            key={g}
            onClick={() => genreChip(g)}
            className="shrink-0 rounded-full border border-white/10 bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-orange-500/50 hover:text-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            {g}
          </button>
        ))}
      </section>

      <ContinueWatching />
      <Top10 />
      <DramaRow icon={Star} title="Must-See Dramas" section="mustSee" />
      <DramaRow icon={Flame} title="Trending Now" section="trending" />
      <DramaRow icon={Sparkles} title="Hidden Gems" section="hiddenGem" sort="likes" />

      {/* fresh grid */}
      <section aria-label="New releases">
        <SectionHeader icon={Sparkles} title="Fresh & New" onMore={() => genreChip('All')} />
        <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-6">
          {fresh.slice(0, 12).map((d) => (
            <DramaCard key={d.id} drama={d} onOpen={openDrama} badge="NEW" />
          ))}
        </div>
      </section>
    </div>
  )
}

export { SectionHeader }
