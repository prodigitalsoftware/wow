'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  Film,
  ListVideo,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Lock,
  Loader2,
  Eye,
  Heart,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CoverImage } from './CoverImage'
import { formatViews, paletteFor } from '@/lib/format'
import { GENRES } from '@/lib/types'
import type { Drama, Episode } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ---------- types ----------
interface DramaFormState {
  id?: string
  title: string
  description: string
  genre: string
  tags: string
  coverTheme: number
  status: 'ongoing' | 'completed'
  featured: boolean
  trending: boolean
  mustSee: boolean
  hiddenGem: boolean
  isNew: boolean
}

const EMPTY_FORM: DramaFormState = {
  title: '',
  description: '',
  genre: 'Romance',
  tags: '',
  coverTheme: 0,
  status: 'ongoing',
  featured: false,
  trending: false,
  mustSee: false,
  hiddenGem: false,
  isNew: true,
}

interface EpisodeFormState {
  id?: string
  number: number
  title: string
  videoUrl: string
  duration: number
  isFree: boolean
}

// ---------- Admin view ----------
export function AdminView() {
  const authQuery = useQuery<{ authenticated: boolean; email?: string }>({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me')
      return res.json()
    },
  })

  if (authQuery.isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!authQuery.data?.authenticated) {
    return <AdminLogin onLogin={() => authQuery.refetch()} />
  }

  return <AdminDashboard email={authQuery.data.email || 'admin'} onLogout={() => authQuery.refetch()} />
}

// ---------- Login ----------
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('admin@dramabox.demo')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
      } else {
        toast.success('Welcome back, admin!')
        onLogin()
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-14">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-xl shadow-orange-500/25">
        <ShieldCheck className="h-7 w-7 text-white" />
      </span>
      <h1 className="mt-4 text-2xl font-extrabold text-white">Admin Console</h1>
      <p className="mt-1 text-sm text-zinc-400">Sign in to manage your drama catalog</p>

      <form
        onSubmit={submit}
        className="mt-8 w-full rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-xl"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="admin-email" className="text-xs text-zinc-300">
              Email
            </Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl border-white/10 bg-zinc-950 text-sm text-white"
              placeholder="admin@yourdomain.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-password" className="text-xs text-zinc-300">
              Password
            </Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl border-white/10 bg-zinc-950 text-sm text-white"
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400" role="alert">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={busy}
            className="h-11 w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-500 font-bold text-white hover:from-orange-400 hover:to-red-400"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
          </Button>
          <p className="rounded-lg bg-zinc-950 px-3 py-2 text-center text-[11px] text-zinc-500">
            Demo credentials: <span className="font-mono text-zinc-400">admin@dramabox.demo / admin123</span>
          </p>
        </div>
      </form>
    </div>
  )
}

// ---------- Dashboard ----------
function AdminDashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [tab, setTab] = useState('overview')
  const [epDramaId, setEpDramaId] = useState<string | null>(null)

  const dramasQuery = useQuery<Drama[]>({
    queryKey: ['dramas', 'admin-all'],
    queryFn: async () => {
      const res = await fetch('/api/dramas?limit=100&sort=new')
      const data = await res.json()
      return (data.dramas || []) as Drama[]
    },
  })

  const dramas = dramasQuery.data ?? null
  const reload = async () => {
    await dramasQuery.refetch()
  }

  const stats = useMemo(() => {
    if (!dramas) return null
    return {
      dramas: dramas.length,
      episodes: dramas.reduce((a, d) => a + d.totalEpisodes, 0),
      views: dramas.reduce((a, d) => a + d.views, 0),
      likes: dramas.reduce((a, d) => a + d.likes, 0),
    }
  }, [dramas])

  const top = useMemo(
    () => (dramas ? [...dramas].sort((a, b) => b.views - a.views).slice(0, 5) : []),
    [dramas]
  )

  const openEpisodes = (dramaId: string) => {
    setEpDramaId(dramaId)
    setTab('episodes')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Admin Console</h1>
          <p className="mt-0.5 text-xs text-zinc-500">Signed in as {email}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' })
            toast.success('Signed out')
            onLogout()
          }}
          className="h-9 gap-1.5 rounded-full border-white/10 bg-zinc-900 text-xs text-zinc-300 hover:bg-zinc-800"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList className="bg-zinc-900">
          <TabsTrigger value="overview" className="gap-1.5 data-[state=active]:text-orange-400">
            <LayoutDashboard className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="dramas" className="gap-1.5 data-[state=active]:text-orange-400">
            <Film className="h-3.5 w-3.5" /> Dramas
          </TabsTrigger>
          <TabsTrigger value="episodes" className="gap-1.5 data-[state=active]:text-orange-400">
            <ListVideo className="h-3.5 w-3.5" /> Episodes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          {!stats ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatCard icon={Film} label="Dramas" value={String(stats.dramas)} />
                <StatCard icon={ListVideo} label="Episodes" value={String(stats.episodes)} />
                <StatCard icon={Eye} label="Total Views" value={formatViews(stats.views)} />
                <StatCard icon={Heart} label="Total Likes" value={formatViews(stats.likes)} />
              </div>
              <h3 className="mb-2 mt-7 text-sm font-bold uppercase tracking-wider text-zinc-400">
                Top 5 by views
              </h3>
              <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/60">
                {top.map((d, i) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-3 border-b border-white/5 p-3 last:border-0"
                  >
                    <span className="w-5 text-center text-sm font-black text-orange-500">{i + 1}</span>
                    <div className="h-12 w-9 overflow-hidden rounded-md ring-1 ring-white/10">
                      <CoverImage title={d.title} theme={d.coverTheme} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-zinc-100">{d.title}</p>
                      <p className="text-[11px] text-zinc-500">
                        {d.genre} · {d.totalEpisodes} EP
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-zinc-300">{formatViews(d.views)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="dramas" className="mt-5">
          <DramasTab dramas={dramas} reload={reload} onManageEpisodes={openEpisodes} />
        </TabsContent>

        <TabsContent value="episodes" className="mt-5">
          <EpisodesTab dramas={dramas || []} selectedId={epDramaId} onSelect={setEpDramaId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Film
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/15">
          <Icon className="h-3.5 w-3.5 text-orange-400" />
        </span>
        <span className="text-xs font-medium text-zinc-400">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-extrabold text-white">{value}</p>
    </div>
  )
}

// ---------- Dramas tab ----------
function DramasTab({
  dramas,
  reload,
  onManageEpisodes,
}: {
  dramas: Drama[] | null
  reload: () => Promise<unknown>
  onManageEpisodes: (id: string) => void
}) {
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<DramaFormState>(EMPTY_FORM)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, coverTheme: Math.floor(Math.random() * 12) })
    setFormOpen(true)
  }

  const openEdit = (d: Drama) => {
    setForm({
      id: d.id,
      title: d.title,
      description: d.description,
      genre: d.genre,
      tags: d.tags.join(', '),
      coverTheme: d.coverTheme,
      status: d.status === 'completed' ? 'completed' : 'ongoing',
      featured: d.featured,
      trending: d.trending,
      mustSee: d.mustSee,
      hiddenGem: d.hiddenGem,
      isNew: d.isNew,
    })
    setFormOpen(true)
  }

  const save = async () => {
    setBusy(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        genre: form.genre,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        coverTheme: form.coverTheme,
        status: form.status,
        flags: {
          featured: form.featured,
          trending: form.trending,
          mustSee: form.mustSee,
          hiddenGem: form.hiddenGem,
          isNew: form.isNew,
        },
      }
      const res = await fetch(form.id ? `/api/admin/dramas/${form.id}` : '/api/admin/dramas', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Save failed')
      } else {
        toast.success(form.id ? 'Drama updated' : 'Drama created — add episodes next!')
        setFormOpen(false)
        await reload()
      }
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!deleteId) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/dramas/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error('Delete failed')
      } else {
        toast.success('Drama deleted')
        setDeleteId(null)
        await reload()
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{dramas?.length ?? 0} dramas in catalog</p>
        <Button
          onClick={openCreate}
          className="h-9 gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-xs font-bold text-white hover:from-orange-400 hover:to-red-400"
        >
          <Plus className="h-4 w-4" /> New Drama
        </Button>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/60">
        {!dramas ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : dramas.length === 0 ? (
          <p className="p-8 text-center text-sm text-zinc-500">No dramas yet. Create your first one!</p>
        ) : (
          dramas.map((d) => (
            <div
              key={d.id}
              className="flex flex-wrap items-center gap-3 border-b border-white/5 p-3 last:border-0"
            >
              <div className="h-14 w-10 shrink-0 overflow-hidden rounded-md ring-1 ring-white/10">
                <CoverImage title={d.title} theme={d.coverTheme} />
              </div>
              <div className="min-w-0 flex-1 basis-48">
                <p className="truncate text-sm font-semibold text-zinc-100">{d.title}</p>
                <p className="text-[11px] text-zinc-500">
                  {d.genre} · {d.totalEpisodes} EP · {d.status}
                </p>
              </div>
              <div className="hidden items-center gap-1.5 sm:flex">
                {d.featured && <FlagChip label="Featured" />}
                {d.trending && <FlagChip label="Trending" />}
                {d.mustSee && <FlagChip label="Must-See" />}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onManageEpisodes(d.id)}
                  className="h-8 w-8 text-zinc-400 hover:text-orange-400"
                  aria-label={`Manage episodes of ${d.title}`}
                >
                  <ListVideo className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(d)}
                  className="h-8 w-8 text-zinc-400 hover:text-white"
                  aria-label={`Edit ${d.title}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(d.id)}
                  className="h-8 w-8 text-zinc-400 hover:text-red-400"
                  aria-label={`Delete ${d.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* create / edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-white/10 bg-zinc-900 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">{form.id ? 'Edit Drama' : 'New Drama'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="h-10 rounded-xl border-white/10 bg-zinc-950 text-sm text-white"
                placeholder="The CEO's Contract Bride"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="min-h-24 rounded-xl border-white/10 bg-zinc-950 text-sm text-white"
                placeholder="Short synopsis shown on the detail page..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Genre</Label>
                <Select value={form.genre} onValueChange={(v) => setForm((f) => ({ ...f, genre: v }))}>
                  <SelectTrigger className="h-10 rounded-xl border-white/10 bg-zinc-950 text-sm text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-zinc-900 text-zinc-200">
                    {GENRES.filter((g) => g !== 'All').map((g) => (
                      <SelectItem key={g} value={g} className="text-sm focus:bg-zinc-800">
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v as 'ongoing' | 'completed' }))}
                >
                  <SelectTrigger className="h-10 rounded-xl border-white/10 bg-zinc-950 text-sm text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-zinc-900 text-zinc-200">
                    <SelectItem value="ongoing" className="text-sm focus:bg-zinc-800">
                      Ongoing
                    </SelectItem>
                    <SelectItem value="completed" className="text-sm focus:bg-zinc-800">
                      Completed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Tags (comma separated)</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  className="h-10 rounded-xl border-white/10 bg-zinc-950 text-sm text-white"
                  placeholder="CEO, Contract Marriage, Sweet"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Cover theme</Label>
                <div className="flex gap-1.5">
                  <div className="h-10 w-8 shrink-0 overflow-hidden rounded-md ring-1 ring-white/10">
                    <CoverImage title={form.title || 'Preview'} theme={form.coverTheme} />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={11}
                    value={form.coverTheme}
                    onChange={(e) => setForm((f) => ({ ...f, coverTheme: Number(e.target.value) }))}
                    className="w-full accent-orange-500"
                    aria-label="Cover theme"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-white/5 bg-zinc-950/60 p-3 sm:grid-cols-3">
              {(
                [
                  ['featured', 'Featured'],
                  ['trending', 'Trending'],
                  ['mustSee', 'Must-See'],
                  ['hiddenGem', 'Hidden Gem'],
                  ['isNew', 'New badge'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between gap-2 text-xs text-zinc-300">
                  {label}
                  <Switch
                    checked={form[key]}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, [key]: v }))}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </label>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setFormOpen(false)}
              className="h-10 rounded-full text-zinc-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={save}
              disabled={busy || !form.title.trim() || !form.description.trim()}
              className="h-10 min-w-28 rounded-full bg-gradient-to-r from-orange-500 to-red-500 font-bold text-white hover:from-orange-400 hover:to-red-400"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : form.id ? 'Save Changes' : 'Create Drama'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="border-white/10 bg-zinc-900 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Delete this drama?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400">
            This permanently removes the drama and all its episodes. This action cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteId(null)}
              className="h-10 rounded-full text-zinc-400"
            >
              Cancel
            </Button>
            <Button
              onClick={remove}
              disabled={busy}
              className="h-10 rounded-full bg-red-600 font-bold text-white hover:bg-red-500"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FlagChip({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-400">
      {label}
    </span>
  )
}

// ---------- Episodes tab ----------
function EpisodesTab({
  dramas,
  selectedId,
  onSelect,
}: {
  dramas: Drama[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<EpisodeFormState | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const selected = dramas.find((d) => d.id === selectedId) || null

  const episodesQuery = useQuery<Episode[]>({
    queryKey: ['admin-episodes', selectedId],
    queryFn: async () => {
      const res = await fetch(`/api/dramas/${selectedId}`)
      if (!res.ok) return []
      const data = await res.json()
      return (data.drama.episodes || []) as Episode[]
    },
    enabled: !!selectedId,
  })

  const episodes = selectedId ? episodesQuery.data ?? null : null
  const loadEpisodes = async () => {
    await episodesQuery.refetch()
  }

  const openAdd = () => {
    if (!selected) return
    setForm({
      number: (episodes?.length ?? 0) + 1,
      title: '',
      videoUrl: '',
      duration: 120,
      isFree: true,
    })
    setFormOpen(true)
  }

  const openEdit = (ep: Episode) => {
    setForm({
      id: ep.id,
      number: ep.number,
      title: ep.title,
      videoUrl: ep.videoUrl,
      duration: ep.duration,
      isFree: ep.isFree,
    })
    setFormOpen(true)
  }

  const save = async () => {
    if (!form || !selected) return
    setBusy(true)
    try {
      const res = form.id
        ? await fetch(`/api/admin/episodes/${form.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: form.title,
              videoUrl: form.videoUrl,
              duration: form.duration,
              isFree: form.isFree,
            }),
          })
        : await fetch(`/api/admin/dramas/${selected.id}/episodes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              number: form.number,
              title: form.title,
              videoUrl: form.videoUrl,
              duration: form.duration,
              isFree: form.isFree,
            }),
          })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Save failed')
      } else {
        toast.success(form.id ? 'Episode updated' : `Episode ${form.number} added`)
        setFormOpen(false)
        await loadEpisodes()
      }
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!deleteId) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/episodes/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error('Delete failed')
      } else {
        toast.success('Episode deleted')
        setDeleteId(null)
        await loadEpisodes()
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedId ?? ''} onValueChange={(v) => onSelect(v)}>
          <SelectTrigger className="h-10 w-full min-w-56 rounded-xl border-white/10 bg-zinc-900 text-sm text-white sm:w-72">
            <SelectValue placeholder="Select a drama to manage episodes" />
          </SelectTrigger>
          <SelectContent className="max-h-72 border-white/10 bg-zinc-900 text-zinc-200">
            {dramas.map((d) => (
              <SelectItem key={d.id} value={d.id} className="text-sm focus:bg-zinc-800">
                {d.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selected && (
          <Button
            onClick={openAdd}
            className="ml-auto h-9 gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-xs font-bold text-white hover:from-orange-400 hover:to-red-400"
          >
            <Plus className="h-4 w-4" /> Add Episode
          </Button>
        )}
      </div>

      {!selected ? (
        <p className="mt-6 rounded-2xl border border-dashed border-white/10 bg-zinc-900/50 p-10 text-center text-sm text-zinc-500">
          Pick a drama above to view and manage its episodes.
        </p>
      ) : !episodes ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/60">
          <div className="max-h-[55vh] overflow-y-auto scrollbar-thin">
            {episodes.length === 0 ? (
              <p className="p-8 text-center text-sm text-zinc-500">
                No episodes yet — add the first one!
              </p>
            ) : (
              episodes.map((ep) => {
                const p = paletteFor(0)
                void p
                return (
                  <div
                    key={ep.id}
                    className="flex items-center gap-3 border-b border-white/5 p-3 last:border-0"
                  >
                    <span className="w-10 text-center text-sm font-black text-orange-500">
                      {ep.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-100">{ep.title}</p>
                      <p className="truncate text-[11px] text-zinc-500">{ep.videoUrl}</p>
                    </div>
                    <span className="hidden text-[11px] text-zinc-500 sm:block">
                      {Math.floor(ep.duration / 60)}:{String(ep.duration % 60).padStart(2, '0')}
                    </span>
                    {ep.isFree ? (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
                        Free
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-400">
                        <Lock className="h-2.5 w-2.5" /> VIP
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(ep)}
                        className="h-8 w-8 text-zinc-400 hover:text-white"
                        aria-label={`Edit episode ${ep.number}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(ep.id)}
                        className="h-8 w-8 text-zinc-400 hover:text-red-400"
                        aria-label={`Delete episode ${ep.number}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* add/edit episode dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="border-white/10 bg-zinc-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {form?.id ? `Edit Episode ${form.number}` : `Add Episode ${form?.number ?? ''}`}
            </DialogTitle>
          </DialogHeader>
          {form && (
            <div className="grid gap-4 py-1">
              {!form.id && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-300">Episode number</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.number}
                    onChange={(e) => setForm((f) => (f ? { ...f, number: Number(e.target.value) } : f))}
                    className="h-10 rounded-xl border-white/10 bg-zinc-950 text-sm text-white"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Episode title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => (f ? { ...f, title: e.target.value } : f))}
                  className="h-10 rounded-xl border-white/10 bg-zinc-950 text-sm text-white"
                  placeholder="The Beginning"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Video URL (mp4)</Label>
                <Input
                  value={form.videoUrl}
                  onChange={(e) => setForm((f) => (f ? { ...f, videoUrl: e.target.value } : f))}
                  className="h-10 rounded-xl border-white/10 bg-zinc-950 font-mono text-xs text-white"
                  placeholder="https://cdn.yourdomain.com/ep1.mp4"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-300">Duration (seconds)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.duration}
                    onChange={(e) => setForm((f) => (f ? { ...f, duration: Number(e.target.value) } : f))}
                    className="h-10 rounded-xl border-white/10 bg-zinc-950 text-sm text-white"
                  />
                </div>
                <div className="flex items-end justify-between gap-2 rounded-xl border border-white/5 bg-zinc-950/60 px-3 py-2.5">
                  <Label className="text-xs text-zinc-300">Free to watch</Label>
                  <Switch
                    checked={form.isFree}
                    onCheckedChange={(v) => setForm((f) => (f ? { ...f, isFree: v } : f))}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
              </div>
              <p className={cn('text-[11px] leading-relaxed text-zinc-500')}>
                Tip: episodes marked &quot;Free&quot; are playable by everyone. VIP episodes show the
                unlock screen unless the viewer has VIP.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setFormOpen(false)}
              className="h-10 rounded-full text-zinc-400"
            >
              Cancel
            </Button>
            <Button
              onClick={save}
              disabled={busy || !form?.videoUrl.trim()}
              className="h-10 min-w-28 rounded-full bg-gradient-to-r from-orange-500 to-red-500 font-bold text-white hover:from-orange-400 hover:to-red-400"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : form?.id ? 'Save' : 'Add Episode'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="border-white/10 bg-zinc-900 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Delete this episode?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400">This action cannot be undone.</p>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteId(null)}
              className="h-10 rounded-full text-zinc-400"
            >
              Cancel
            </Button>
            <Button
              onClick={remove}
              disabled={busy}
              className="h-10 rounded-full bg-red-600 font-bold text-white hover:bg-red-500"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
