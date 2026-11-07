'use client'

import { Clapperboard, Compass, Search, Heart } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import type { ViewName } from '@/lib/types'
import { cn } from '@/lib/utils'

const NAV: { view: ViewName; label: string; icon: typeof Clapperboard }[] = [
  { view: 'home', label: 'For You', icon: Clapperboard },
  { view: 'browse', label: 'Browse', icon: Compass },
  { view: 'search', label: 'Search', icon: Search },
  { view: 'mylist', label: 'My List', icon: Heart },
]

export function BottomNav() {
  const { view, navigate } = useAppStore()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-zinc-950/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Bottom navigation"
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {NAV.map(({ view: v, label, icon: Icon }) => {
          const active = view === v
          return (
            <button
              key={v}
              onClick={() => navigate(v)}
              className="flex min-h-[56px] flex-col items-center justify-center gap-0.5 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500"
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className={cn('h-5 w-5 transition-colors', active ? 'text-orange-500' : 'text-zinc-500')}
              />
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors',
                  active ? 'text-orange-500' : 'text-zinc-500'
                )}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
