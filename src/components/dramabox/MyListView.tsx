'use client'

import { Heart, History, Trash2, Play } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { DramaCard } from './DramaCard'
import { CoverImage } from './CoverImage'
import { useAsync } from './hooks'
import type { Drama, ContinueItem } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function MyListView() {
  const { openDrama, openPlayer } = useAppStore()

  const favorites = useAsync<Drama[]>(async () => {
    const res = await fetch('/api/favorites?userId=guest')
    if (!res.ok) throw new Error()
    return (await res.json()).favorites
  }, [])

  const progress = useAsync<ContinueItem[]>(async () => {
    const res = await fetch('/api/progress?userId=guest')
    if (!res.ok) throw new Error()
    return (await res.json()).items
  }, [])

  const removeProgress = async (dramaId: string) => {
    await fetch(`/api/progress?dramaId=${dramaId}&userId=guest`, { method: 'DELETE' })
    progress.setData((prev) => (prev ? prev.filter((p) => p.dramaId !== dramaId) : prev))
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:py-8">
      <h1 className="text-2xl font-extrabold text-white">My List</h1>

      {/* continue watching */}
      <section className="mt-6" aria-label="Watch history">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <History className="h-5 w-5 text-orange-400" /> Watch History
        </h2>
        {progress.loading ? (
          <div className="mt-3 flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-40 rounded-xl" />
            ))}
          </div>
        ) : !progress.data || progress.data.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-white/10 bg-zinc-900/50 p-6 text-center text-sm text-zinc-500">
            Nothing watched yet — start a drama and it will show up here.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {progress.data.map((item) => (
              <div
                key={item.dramaId}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-zinc-900/70 p-2.5 transition-colors hover:bg-zinc-900"
              >
                <button
                  onClick={() => openPlayer(item.dramaId, item.episodeNumber)}
                  className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  aria-label={`Resume ${item.drama.title} at episode ${item.episodeNumber}`}
                >
                  <CoverImage title={item.drama.title} theme={item.drama.coverTheme} />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-5 w-5 fill-white text-white" />
                  </span>
                  <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[9px] font-bold text-white">
                    EP {item.episodeNumber}
                  </span>
                </button>
                <div className="min-w-0 flex-1">
                  <button
                    onClick={() => openDrama(item.dramaId)}
                    className="truncate text-sm font-semibold text-zinc-100 hover:text-orange-400 focus-visible:outline-none"
                  >
                    {item.drama.title}
                  </button>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {item.drama.genre} · {item.drama.totalEpisodes} episodes
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeProgress(item.dramaId)}
                  className="h-8 w-8 shrink-0 text-zinc-500 hover:text-red-400"
                  aria-label={`Remove ${item.drama.title} from history`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* favorites */}
      <section className="mt-8" aria-label="Favorite dramas">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <Heart className="h-5 w-5 text-red-400" /> Favorites
        </h2>
        {favorites.loading ? (
          <div className="mt-3 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
            ))}
          </div>
        ) : !favorites.data || favorites.data.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-white/10 bg-zinc-900/50 p-6 text-center text-sm text-zinc-500">
            Tap the bookmark icon on any drama to save it here.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-6">
            {favorites.data.map((d) => (
              <DramaCard key={d.id} drama={d} onOpen={openDrama} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
