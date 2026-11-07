'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { DramaCard } from './DramaCard'
import { useDramas } from './hooks'
import type { Drama } from '@/lib/types'
import { GENRES } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const SORTS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'new', label: 'Recently Added' },
  { value: 'likes', label: 'Most Liked' },
  { value: 'episodes', label: 'Most Episodes' },
]

export function BrowseView() {
  const { browsePrefs, setBrowsePrefs, openDrama } = useAppStore()
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const { dramas, loading, error } = useDramas({
    genre: browsePrefs.genre,
    sort: browsePrefs.sort,
    section: browsePrefs.section,
    page: String(page),
    limit: '24',
  })

  // derive pages from total via dramas length fallback is imprecise; fetch returns pages via header not used here.
  // Simplest: request also returns total/pages when using direct fetch; useDramas returns dramas only.
  // We re-fetch pages count with a tiny effect below.

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:py-8">
      <h1 className="text-2xl font-extrabold text-white">Browse Dramas</h1>
      <p className="mt-1 text-sm text-zinc-400">
        {browsePrefs.genre === 'All' ? 'All genres' : browsePrefs.genre} ·{' '}
        {SORTS.find((s) => s.value === browsePrefs.sort)?.label}
      </p>

      {/* genre tabs */}
      <div
        className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        role="tablist"
        aria-label="Genres"
      >
        {GENRES.map((g) => (
          <button
            key={g}
            role="tab"
            aria-selected={browsePrefs.genre === g}
            onClick={() => {
              setBrowsePrefs({ genre: g })
              setPage(1)
            }}
            className={cn(
              'shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
              browsePrefs.genre === g
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
            )}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Sort by
        </div>
        <Select
          value={browsePrefs.sort}
          onValueChange={(v) => {
            setBrowsePrefs({ sort: v })
            setPage(1)
          }}
        >
          <SelectTrigger className="h-8 w-[160px] rounded-full border-white/10 bg-zinc-900 text-xs text-zinc-200">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-zinc-900 text-zinc-200">
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value} className="text-xs focus:bg-zinc-800 focus:text-orange-400">
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* grid */}
      {loading ? (
        <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <p className="py-16 text-center text-sm text-zinc-500">{error}</p>
      ) : dramas.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-zinc-400">No dramas found in this category yet.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 rounded-full border-white/15 text-zinc-300"
            onClick={() => setBrowsePrefs({ genre: 'All', section: 'all' })}
          >
            Reset filters
          </Button>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-6">
          {dramas.map((d: Drama) => (
            <DramaCard key={d.id} drama={d} onOpen={openDrama} />
          ))}
        </div>
      )}

      {/* pagination */}
      {!loading && dramas.length > 0 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-9 gap-1 rounded-full border-white/10 bg-zinc-900 text-xs text-zinc-300 hover:bg-zinc-800"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <span className="text-xs text-zinc-500">Page {page}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={dramas.length < 24}
            onClick={() => setPage((p) => p + 1)}
            className="h-9 gap-1 rounded-full border-white/10 bg-zinc-900 text-xs text-zinc-300 hover:bg-zinc-800"
            aria-label="Next page"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
