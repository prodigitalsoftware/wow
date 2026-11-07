'use client'

import { useMemo } from 'react'
import { paletteFor } from '@/lib/format'
import { cn } from '@/lib/utils'

interface CoverImageProps {
  title: string
  theme: number
  genre?: string
  className?: string
  large?: boolean
}

/**
 * Generated poster art: layered gradients + decorative rings + stylized title.
 * Fully procedural so the catalog needs no external image assets.
 */
export function CoverImage({ title, theme, genre, className, large }: CoverImageProps) {
  const p = paletteFor(theme)

  // Decorative pattern varies by theme
  const variant = theme % 4

  const words = useMemo(() => {
    const w = title.split(' ').filter(Boolean)
    return { top: w.slice(0, Math.ceil(w.length / 2)).join(' '), bottom: w.slice(Math.ceil(w.length / 2)).join(' ') }
  }, [title])

  return (
    <div
      className={cn('relative h-full w-full overflow-hidden select-none', className)}
      style={{ background: `linear-gradient(150deg, ${p.from} 0%, ${p.via} 55%, ${p.to} 130%)` }}
      aria-hidden="true"
    >
      {/* soft light blob */}
      <div
        className="absolute -top-[20%] -right-[30%] h-[80%] w-[110%] rounded-full opacity-30 blur-2xl"
        style={{ background: `radial-gradient(circle, ${p.ink}55 0%, transparent 70%)` }}
      />
      {/* decorative geometry */}
      {variant === 0 && (
        <>
          <div className="absolute -left-8 top-10 h-40 w-40 rounded-full border border-white/15" />
          <div className="absolute -left-3 top-[52px] h-24 w-24 rounded-full border border-white/20" />
          <div className="absolute bottom-6 right-4 h-16 w-16 rounded-full bg-white/10 blur-[2px]" />
        </>
      )}
      {variant === 1 && (
        <>
          <div className="absolute right-[-20%] top-[30%] h-[55%] w-[120%] rotate-[-18deg] bg-white/10 blur-xl" />
          <div className="absolute left-4 bottom-4 h-24 w-24 rounded-full border border-white/20" />
        </>
      )}
      {variant === 2 && (
        <>
          <div className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
          <div className="absolute left-1/2 top-1/2 h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
          <div className="absolute right-5 top-6 h-10 w-10 rounded-full bg-white/15" />
        </>
      )}
      {variant === 3 && (
        <>
          <div className="absolute left-[-15%] bottom-[-10%] h-[60%] w-[130%] rotate-[20deg] bg-black/20 blur-lg" />
          <div className="absolute right-3 bottom-10 h-20 w-20 rounded-full border border-white/25" />
          <div className="absolute left-5 top-8 h-8 w-8 rotate-45 border border-white/20" />
        </>
      )}
      {/* grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.7'/%3E%3C/svg%3E\")",
        }}
      />
      {/* bottom vignette for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* typography */}
      <div className="absolute inset-0 flex flex-col justify-end p-3 text-left">
        <div
          className={cn(
            'font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]',
            large ? 'text-3xl md:text-4xl' : 'text-[15px] md:text-base'
          )}
        >
          {words.top && <div>{words.top}</div>}
          {words.bottom && (
            <div style={{ color: p.ink }} className="italic">
              {words.bottom}
            </div>
          )}
        </div>
        {genre && (
          <div className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-full border border-white/25 bg-black/30 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-white/85 backdrop-blur-sm">
            {genre}
          </div>
        )}
      </div>
    </div>
  )
}
