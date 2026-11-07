'use client'

import { Clapperboard, Facebook, Youtube, Instagram } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

export function Footer() {
  const navigate = useAppStore((s) => s.navigate)

  const demoLink = (label: string) => (
    <button
      key={label}
      onClick={() => toast.info(`${label} page — demo placeholder`)}
      className="text-zinc-400 transition-colors hover:text-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
    >
      {label}
    </button>
  )

  return (
    <footer className="mt-auto border-t border-white/5 bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-10 pb-24 md:pb-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                <Clapperboard className="h-4 w-4 text-white" />
              </span>
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-lg font-extrabold text-transparent">
                DramaBox
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-zinc-500">
              Bite-sized dramas, big emotions. Stream original short series anytime, anywhere.
            </p>
            <div className="mt-4 flex items-center gap-3">
              {[Facebook, Youtube, Instagram].map((Icon, i) => (
                <button
                  key={i}
                  onClick={() => toast.info('Social link — demo placeholder')}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  aria-label="Social media"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-300">Explore</p>
              <button
                onClick={() => navigate('browse')}
                className="text-left text-zinc-400 transition-colors hover:text-orange-400"
              >
                All Dramas
              </button>
              <button
                onClick={() => navigate('home')}
                className="text-left text-zinc-400 transition-colors hover:text-orange-400"
              >
                For You
              </button>
              {demoLink('Rankings')}
            </div>
            <div className="flex flex-col gap-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-300">Company</p>
              {demoLink('About Us')}
              {demoLink('Careers')}
              {demoLink('Contact')}
            </div>
            <div className="flex flex-col gap-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-300">Legal</p>
              {demoLink('Terms of Use')}
              {demoLink('Privacy Policy')}
              {demoLink('Cookie Policy')}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} DramaBox Demo Platform. All rights reserved. Demo content for
          development purposes.
        </div>
      </div>
    </footer>
  )
}
