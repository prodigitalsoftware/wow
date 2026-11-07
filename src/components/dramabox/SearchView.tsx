'use client'

import { useEffect, useState } from 'react'
import { Search as SearchIcon, TrendingUp, X } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { DramaCard } from './DramaCard'
import type { Drama } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

const TRENDING = ['CEO', 'Werewolf', 'Contract Marriage', 'Revenge', 'Vampire', 'Billionaire', 'Second Chance']

export function SearchView() {
  const { openDrama } = useAppStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Drama[] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setResults(null)
      return
    }
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/dramas?q=${encodeURIComponent(q)}&limit=24`)
        const data = await res.json()
        setResults(data.dramas || [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [query])

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:py-8">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search dramas, genres, tropes..."
          className="h-12 rounded-full border-white/10 bg-zinc-900 pl-11 pr-10 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-orange-500"
          aria-label="Search dramas"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white focus-visible:outline-none"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!results && !loading && (
        <div className="mt-8">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
            <TrendingUp className="h-4 w-4 text-orange-400" /> Trending Searches
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {TRENDING.map((t) => (
              <button
                key={t}
                onClick={() => setQuery(t)}
                className="rounded-full border border-white/10 bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-orange-500/50 hover:text-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                {t}
              </button>
            ))}
          </div>

          <h2 className="mt-8 text-sm font-bold uppercase tracking-wider text-zinc-400">
            Try searching for...
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {['Romance', 'Fantasy', 'Revenge', 'Mystery'].map((g) => (
              <button
                key={g}
                onClick={() => setQuery(g)}
                className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:border-orange-500/50 hover:text-orange-400"
              >
                {g} dramas
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-6 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
          ))}
        </div>
      )}

      {results && !loading && (
        <div className="mt-6">
          <p className="mb-4 text-sm text-zinc-400">
            {results.length > 0 ? (
              <>
                <span className="font-bold text-orange-400">{results.length}</span> results for &quot;
                {query}&quot;
              </>
            ) : (
              <>No results for &quot;{query}&quot;. Try another keyword.</>
            )}
          </p>
          <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-6">
            {results.map((d) => (
              <DramaCard key={d.id} drama={d} onOpen={openDrama} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
