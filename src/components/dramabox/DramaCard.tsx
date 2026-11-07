'use client'

import { Heart, Eye } from 'lucide-react'
import { CoverImage } from './CoverImage'
import { formatViews } from '@/lib/format'
import type { Drama } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DramaCardProps {
  drama: Drama
  onOpen: (id: string) => void
  badge?: string
  className?: string
}

export function DramaCard({ drama, onOpen, badge, className }: DramaCardProps) {
  return (
    <button
      onClick={() => onOpen(drama.id)}
      className={cn(
        'group relative flex flex-col text-left transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-xl',
        className
      )}
      aria-label={`Open ${drama.title}`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl shadow-lg shadow-black/40 ring-1 ring-white/10">
        <CoverImage title={drama.title} theme={drama.coverTheme} genre={drama.genre} />

        {badge && (
          <span className="absolute left-2 top-2 rounded-md bg-gradient-to-r from-orange-600 to-red-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow">
            {badge}
          </span>
        )}
        {drama.isNew && !badge && (
          <span className="absolute left-2 top-2 rounded-md bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow">
            New
          </span>
        )}
        {drama.status === 'completed' && (
          <span className="absolute right-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300 backdrop-blur-sm">
            Completed
          </span>
        )}

        {/* hover play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-xl">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-black" aria-hidden="true">
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
          </span>
        </div>
      </div>

      <div className="mt-2 min-w-0">
        <p className="truncate text-sm font-semibold text-zinc-100 group-hover:text-orange-400">
          {drama.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-400">
          <span className="rounded bg-zinc-800 px-1 py-px font-medium text-orange-400">
            {drama.totalEpisodes} Ep
          </span>
          <span className="inline-flex items-center gap-0.5">
            <Eye className="h-3 w-3" aria-hidden="true" />
            {formatViews(drama.views)}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <Heart className="h-3 w-3" aria-hidden="true" />
            {formatViews(drama.likes)}
          </span>
        </div>
      </div>
    </button>
  )
}
