'use client'

import { Bell, Clapperboard, Search, Crown, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

export function Header() {
  const { view, goBack, navigate, unlockVip, vipUnlocked } = useAppStore()
  const canGoBack = view === 'detail' || view === 'player' || view === 'mylist' || view === 'search'

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        {canGoBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            aria-label="Go back"
            className="h-9 w-9 shrink-0 text-zinc-300 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 focus-visible:outline-none"
          aria-label="DramaBox home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/25">
            <Clapperboard className="h-4.5 w-4.5 text-white" />
          </span>
          <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
            DramaBox
          </span>
        </button>

        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Main">
          {(
            [
              ['home', 'For You'],
              ['browse', 'Browse'],
              ['search', 'Search'],
              ['mylist', 'My List'],
              ['admin', 'Admin'],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              onClick={() => navigate(v)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                view === v || (v === 'browse' && view === 'detail')
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
              aria-current={view === v ? 'page' : undefined}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-zinc-300 hover:text-white"
            aria-label="Search"
            onClick={() => navigate('search')}
          >
            <Search className="h-5 w-5 md:hidden" />
            <Search className="hidden h-5 w-5 md:block" />
          </Button>
          {!vipUnlocked && (
            <Button
              size="sm"
              onClick={() => {
                unlockVip()
                toast.success('VIP trial activated — all episodes unlocked for this session!')
              }}
              className="h-8 gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-3 text-xs font-bold text-white shadow-lg shadow-orange-500/25 hover:from-amber-400 hover:to-orange-500"
            >
              <Crown className="h-3.5 w-3.5" />
              VIP
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-zinc-300 hover:text-white"
            aria-label="Notifications"
            onClick={() => toast.info('No new notifications')}
          >
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
