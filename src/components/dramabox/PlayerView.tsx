'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Heart,
  ListOrdered,
  X,
  Volume2,
  VolumeX,
  Lock,
  ChevronUp,
  ChevronDown,
  Loader2,
  Crown,
} from 'lucide-react'
import { CoverImage } from './CoverImage'
import type { Drama, Episode } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PlayerData {
  drama: Drama & { episodes: Episode[] }
  related: Drama[]
}

interface PlayerProps {
  dramaId: string
  startEpisode: number | null
  onBack: () => void
  onOpenDrama: (id: string) => void
}

export function PlayerView({ dramaId, startEpisode, onBack, onOpenDrama }: PlayerProps) {
  const [data, setData] = useState<PlayerData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [current, setCurrent] = useState(Math.max(1, startEpisode ?? 1))
  const [muted, setMuted] = useState(false)
  const [showEpisodes, setShowEpisodes] = useState(false)
  const [vip, setVip] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [likedEps, setLikedEps] = useState<Record<string, boolean>>({})
  const [favorited, setFavorited] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({})
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load drama + episodes
  useEffect(() => {
    let alive = true
    fetch(`/api/dramas/${dramaId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((d: PlayerData) => alive && setData(d))
      .catch(() => alive && setError('Failed to load episodes'))
    return () => {
      alive = false
    }
  }, [dramaId])

  const episodes = useMemo(() => data?.drama.episodes ?? [], [data])
  const ep = episodes[current - 1]
  const locked = ep ? !ep.isFree && !vip : false

  // Scroll to start episode on first load
  useEffect(() => {
    if (!data) return
    const target = Math.max(1, startEpisode ?? 1)
    const el = containerRef.current?.children[target - 1] as HTMLElement | undefined
    if (el) {
      containerRef.current?.scrollTo({ top: el.offsetTop, behavior: 'instant' as ScrollBehavior })
    }
  }, [data])

  // Intersection observer to detect active slide
  useEffect(() => {
    if (!data) return
    const root = containerRef.current
    if (!root) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.6) {
            const idx = Number((e.target as HTMLElement).dataset.ep)
            if (idx && idx !== current) setCurrent(idx)
          }
        })
      },
      { root, threshold: 0.6 }
    )
    Array.from(root.children).forEach((c) => obs.observe(c))
    return () => obs.disconnect()
  }, [data, current])

  // Play/pause control of videos on slide change
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([num, v]) => {
      if (!v) return
      if (Number(num) === current) {
        v.currentTime = 0
        const p = v.play()
        if (p) p.catch(() => {
          v.muted = true
          setMuted(true)
          v.play().catch(() => undefined)
        })
      } else {
        v.pause()
      }
    })
  }, [current, data])

  // Save progress (debounced)
  const saveProgress = useCallback(
    (position: number) => {
      if (!ep) return
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dramaId, episodeId: ep.id, position, userId: 'guest' }),
        }).catch(() => undefined)
      }, 800)
    },
    [dramaId, ep]
  )

  const onTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    saveProgress(e.currentTarget.currentTime)
  }

  const goEpisode = useCallback(
    (num: number) => {
      if (!data) return
      const target = data.drama.episodes.find((e) => e.number === num)
      if (!target) return
      if (!target.isFree && !vip) {
        setShowEpisodes(false)
        toast.error('This episode is for VIP members', {
          action: { label: 'Unlock', onClick: () => setVip(true) },
        })
        return
      }
      const el = containerRef.current?.children[num - 1] as HTMLElement | undefined
      if (el) {
        containerRef.current?.scrollTo({ top: el.offsetTop, behavior: 'smooth' })
        setCurrent(num)
      }
      setShowEpisodes(false)
    },
    [data, vip]
  )

  const likeEpisode = async () => {
    if (!ep) return
    const nowLiked = !likedEps[ep.id]
    setLikedEps((m) => ({ ...m, [ep.id]: nowLiked }))
    try {
      await fetch(`/api/episodes/${ep.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked: nowLiked }),
      })
    } catch {
      // optimistic, ignore
    }
  }

  if (error) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3 text-zinc-400">
        <p className="text-sm">{error}</p>
        <Button variant="outline" className="rounded-full border-white/15" onClick={onBack}>
          Back
        </Button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const { drama } = data
  const likeCount = ep ? ep.likes + (likedEps[ep.id] ? 1 : 0) : 0

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* video feed */}
      <div
        ref={containerRef}
        className="h-full w-full snap-y snap-mandatory overflow-y-auto scrollbar-none"
        role="region"
        aria-label="Episode player"
      >
        {drama.episodes.map((e) => {
          const isLocked = !e.isFree && !vip
          return (
            <div
              key={e.id}
              data-ep={e.number}
              className="relative h-full w-full snap-start snap-always overflow-hidden bg-zinc-950"
            >
              <div className="absolute inset-0">
                <CoverImage title={drama.title} theme={drama.coverTheme} className="scale-110 blur-2xl opacity-40" />
              </div>

              {/* video */}
              <div className="absolute inset-0 mx-auto flex h-full max-w-[min(100vw,56.25vh)] items-center justify-center sm:max-w-[min(100vw-320px,56.25vh)] md:pl-0">
                {!isLocked ? (
                  <video
                    ref={(v) => {
                      videoRefs.current[e.number] = v
                    }}
                    src={e.videoUrl}
                    className="h-full w-full object-cover"
                    loop
                    playsInline
                    muted={muted}
                    preload={Math.abs(e.number - current) <= 1 ? 'auto' : 'none'}
                    onTimeUpdate={onTimeUpdate}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onError={() => {
                      if (e.number === current) {
                        toast.error('Video source unavailable — check your connection or replace the demo video URL.', {
                          id: `vid-err-${e.id}`,
                        })
                      }
                    }}
                    onClick={() => {
                      const v = videoRefs.current[e.number]
                      if (!v) return
                      if (v.paused) {
                        v.play()
                        setPlaying(true)
                      } else {
                        v.pause()
                        setPlaying(false)
                      }
                    }}
                    aria-label={`Episode ${e.number}: ${e.title}`}
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-black/80 px-8 text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-500/30">
                      <Lock className="h-7 w-7 text-zinc-950" />
                    </span>
                    <p className="text-lg font-bold text-white">Episode {e.number} is VIP only</p>
                    <p className="max-w-xs text-sm text-zinc-400">
                      Unlock the full series to keep watching {drama.title}.
                    </p>
                    <Button
                      onClick={() => {
                        setVip(true)
                        toast.success('VIP unlocked — enjoy!')
                      }}
                      className="mt-2 h-11 gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 font-bold text-zinc-950 hover:from-amber-400 hover:to-orange-400"
                    >
                      <Crown className="h-4 w-4" /> Unlock with VIP
                    </Button>
                  </div>
                )}
              </div>

              {/* gradient overlays */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/80 to-transparent" />

              {/* top bar */}
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                <button
                  onClick={onBack}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  aria-label="Close player"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-sm">
                  <span className="text-xs font-bold text-orange-400">EP {e.number}</span>
                  <span className="text-xs text-zinc-300">/ {drama.totalEpisodes}</span>
                </div>
                <button
                  onClick={() => setMuted((m) => !m)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  aria-label={muted ? 'Unmute' : 'Mute'}
                >
                  {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
              </div>

              {/* pause indicator */}
              {!isLocked && !playing && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="rounded-full bg-black/50 p-4 backdrop-blur-sm">
                    <svg viewBox="0 0 24 24" className="h-10 w-10 fill-white/90" aria-hidden="true">
                      <path d="M8 5.14v14l11-7-11-7z" />
                    </svg>
                  </span>
                </div>
              )}

              {/* action rail */}
              <div className="absolute bottom-28 right-3 flex flex-col items-center gap-5 sm:right-5">
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={likeEpisode}
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                      likedEps[e.id] ? 'text-red-500' : 'text-white'
                    )}
                    aria-label="Like episode"
                    aria-pressed={!!likedEps[e.id]}
                  >
                    <Heart className={cn('h-6 w-6', likedEps[e.id] && 'fill-current')} />
                  </button>
                  <span className="text-[10px] font-semibold text-white/90">
                    {(likeCount / 1000).toFixed(1)}K
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <button
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
                      'flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                      favorited ? 'text-amber-400' : 'text-white'
                    )}
                    aria-label="Add drama to my list"
                    aria-pressed={favorited}
                  >
                    <Crown className="h-6 w-6" />
                  </button>
                  <span className="text-[10px] font-semibold text-white/90">VIP</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => setShowEpisodes(true)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    aria-label="Open episode list"
                  >
                    <ListOrdered className="h-6 w-6" />
                  </button>
                  <span className="text-[10px] font-semibold text-white/90">Episodes</span>
                </div>
              </div>

              {/* bottom info */}
              <div className="absolute inset-x-0 bottom-0 p-4 pr-20 sm:pr-24">
                <button
                  onClick={() => onOpenDrama(drama.id)}
                  className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
                >
                  <h2 className="text-lg font-extrabold text-white drop-shadow-md hover:text-orange-300">
                    {drama.title}
                  </h2>
                </button>
                <p className="mt-0.5 text-xs text-zinc-300">
                  EP {e.number} · {e.title}
                </p>
                <p className="mt-1 line-clamp-2 max-w-md text-xs leading-relaxed text-zinc-400">
                  {drama.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* desktop up/down hints */}
      <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col gap-3 text-zinc-500 md:flex">
        <ChevronUp className="h-6 w-6" />
        <ChevronDown className="h-6 w-6" />
      </div>

      {/* episode drawer */}
      {showEpisodes && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowEpisodes(false)}>
          <div
            className="max-h-[65vh] w-full max-w-lg overflow-hidden rounded-t-2xl border border-white/10 bg-zinc-900 sm:mb-8 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Episodes"
          >
            <div className="flex items-center justify-between border-b border-white/5 p-4">
              <h3 className="font-bold text-white">
                {drama.title} <span className="text-xs font-normal text-zinc-500">· {drama.totalEpisodes} episodes</span>
              </h3>
              <button
                onClick={() => setShowEpisodes(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 hover:text-white focus-visible:outline-none"
                aria-label="Close episode list"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="scrollbar-thin max-h-[calc(65vh-60px)] overflow-y-auto p-3">
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">
                {drama.episodes.map((e) => {
                  const isLocked = !e.isFree && !vip
                  return (
                    <button
                      key={e.id}
                      onClick={() => goEpisode(e.number)}
                      className={cn(
                        'relative flex aspect-square flex-col items-center justify-center rounded-lg border text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                        e.number === current
                          ? 'border-orange-500 bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                          : isLocked
                            ? 'border-white/5 bg-zinc-800/60 text-zinc-500 hover:border-amber-500/40'
                            : 'border-white/10 bg-zinc-800 text-zinc-200 hover:border-orange-500/50'
                      )}
                      aria-label={`Go to episode ${e.number}`}
                      aria-current={e.number === current ? 'true' : undefined}
                    >
                      {e.number}
                      {isLocked && (
                        <Lock className="absolute right-1 top-1 h-2.5 w-2.5 text-amber-500" />
                      )}
                      {e.number === current && (
                        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-white" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
