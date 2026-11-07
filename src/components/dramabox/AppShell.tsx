'use client'

import { useAppStore } from '@/lib/store'
import { Providers } from './Providers'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { Footer } from './Footer'
import { HomeView } from './HomeView'
import { BrowseView } from './BrowseView'
import { DetailView } from './DetailView'
import { PlayerView } from './PlayerView'
import { SearchView } from './SearchView'
import { MyListView } from './MyListView'
import { AdminView } from './AdminView'
import { Toaster } from '@/components/ui/sonner'

export function AppShell() {
  const { view, activeDramaId, startEpisode, goBack, openDrama } = useAppStore()

  return (
    <Providers>
      <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
        <Toaster position="top-center" richColors theme="dark" />
        <Header />

        <main className="flex-1 pb-16 md:pb-0">
          {view === 'home' && <HomeView />}
          {view === 'browse' && <BrowseView />}
          {view === 'detail' && activeDramaId && <DetailView key={activeDramaId} dramaId={activeDramaId} />}
          {view === 'search' && <SearchView />}
          {view === 'mylist' && <MyListView />}
          {view === 'admin' && <AdminView />}
        </main>

        <Footer />
        <BottomNav />

        {/* Full-screen player overlays everything */}
        {view === 'player' && activeDramaId && (
          <PlayerView
            key={`${activeDramaId}-${startEpisode ?? 1}`}
            dramaId={activeDramaId}
            startEpisode={startEpisode}
            onBack={goBack}
            onOpenDrama={openDrama}
          />
        )}
      </div>
    </Providers>
  )
}
