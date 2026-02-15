"use client"

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import type { Barrel, BarrelStats } from '@/modules/barrels/types/barrel.types'

export const dynamic = 'force-dynamic'

function BarrelsContent() {
  const [barrels, setBarrels] = useState<Barrel[]>([])
  const [stats, setStats] = useState<BarrelStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  type UiStatus = 'aging' | 'ready' | 'bottled' | 'transferred' | 'unknown'

  const toUiStatus = (barrel: Barrel): UiStatus => {
    const raw = String(barrel.status || '').toLowerCase()
    if (raw.includes('transferred') || raw.includes('emptied')) return 'transferred'
    if (raw.includes('bottled')) return 'bottled'
    if (raw.includes('ready') || raw.includes('greater than') || raw.includes('good')) return 'ready'

    const fillRaw = String((barrel as any)?.fillDate ?? '').trim()
    const t = fillRaw ? Date.parse(fillRaw) : NaN
    if (Number.isFinite(t)) {
      const ageDays = Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24))
      if (ageDays >= 365 * 2) return 'ready'
      return 'aging'
    }

    if (raw.includes('aging') || raw.includes('active') || raw.includes('less than')) return 'aging'
    return 'unknown'
  }

  const tileClasses = (status: UiStatus) => {
    if (status === 'ready') return 'bg-[#2F5D3A]'
    if (status === 'aging') return 'bg-[#6B4E2E]'
    if (status === 'bottled') return 'bg-[#0B1633]'
    if (status === 'transferred') return 'bg-[#8A8F98]'
    return 'bg-[#8A8F98]'
  }

  const dropletSvg = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12 2.5C12 2.5 6 9.2 6 14.2C6 18 8.9 21 12 21C15.1 21 18 18 18 14.2C18 9.2 12 2.5 12 2.5Z"
        fill="currentColor"
      />
    </svg>
  )

  const toDateTimestamp = (value?: string) => {
    const raw = (value ?? '').trim()
    if (!raw) return NaN

    const iso = raw.match(/^\d{4}-\d{2}-\d{2}(T.*)?$/)
    if (iso) {
      try {
        return new Date(raw).getTime()
      } catch {}
    }

    const parsed = Date.parse(raw)
    if (Number.isFinite(parsed)) {
      return parsed
    }

    const legacy = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
    if (legacy) {
      let day = parseInt(legacy[1], 10)
      let month = parseInt(legacy[2], 10)
      let year = parseInt(legacy[3], 10)
      if (year < 100) year += 2000
      if (day <= 12 && month > 12) {
        const tmp = day
        day = month
        month = tmp
      }
      return new Date(year, month - 1, day).getTime()
    }

    return NaN
  }

  const formatDate = (value?: string) => {
    const timestamp = toDateTimestamp(value)
    if (!Number.isFinite(timestamp)) return '—'
    const formatted = new Date(timestamp).toLocaleDateString()
    return String(formatted).toLowerCase() === 'invalid date' ? '—' : formatted
  }

  const ageDays = (value?: string) => {
    const timestamp = toDateTimestamp(value)
    return Number.isFinite(timestamp) ? Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24)) : '—'
  }

  const toAgeLabel = (fillDate?: string) => {
    const d = ageDays(fillDate)
    if (d === '—') return '—'
    const days = Number(d)
    if (!Number.isFinite(days)) return '—'
    if (days < 365) return `${days}d`
    const years = Math.floor(days / 365)
    const months = Math.floor((days % 365) / 30)
    if (months <= 0) return `${years}y`
    return `${years}y ${months}m`
  }

  const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

  const agingProgress = (fillDate?: string, matureDate?: string) => {
    const fillTs = toDateTimestamp(fillDate)
    const matureTs = toDateTimestamp(matureDate)
    const now = Date.now()
    if (!Number.isFinite(fillTs) || !Number.isFinite(matureTs) || matureTs <= fillTs) return null
    return clamp01((now - fillTs) / (matureTs - fillTs))
  }

  const normalizeStatus = (s: string) => {
    if (s === 'Decanted') return 'Decanted'
    if (s === 'Blended') return 'Blended'
    if (s === 'Bottled') return 'Bottled'
    if (s === 'Emptied') return 'Transferred'
    if (s === 'Less than 2 years') return '<2y'
    return 'Aging'
  }
  const safeLabel = (s?: string) => {
    const v = (s ?? '').trim()
    if (!v) return ''
    const lower = v.toLowerCase()
    return lower === 'null' || lower === 'undefined' ? '' : v
  }
  const formatBatchList = (value?: string | null) => {
    const raw = String(value ?? '').trim()
    if (!raw) return ''
    const parts = raw
      .split(/[;,]/g)
      .map((s) => s.trim())
      .filter(Boolean)
    const uniq: string[] = []
    for (const p of parts) {
      if (!uniq.includes(p)) uniq.push(p)
    }
    return uniq.join(', ')
  }
  const safeNumber = (n?: number) => (Number.isFinite(n as number) ? (n as number) : 0)

  useEffect(() => {
    loadBarrels()
  }, [filter])

  const loadBarrels = async () => {
    setIsLoading(true)
    try {
      const statusParam = filter === 'all' ? 'all' : filter
      const res = await fetch(`/api/barrels?status=${encodeURIComponent(statusParam)}`, { cache: 'no-store' })
      if (!res.ok) {
        throw new Error(`Failed to load barrels: ${res.status}`)
      }
      const json = await res.json() as { barrels: Barrel[]; stats: BarrelStats }
      setBarrels(json.barrels || [])
      setStats(json.stats || null)
    } catch (error) {
      console.error('Error loading barrels:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const statusClass = (s: string) => {
    const ns = normalizeStatus(s)
    if (ns === 'Decanted') return 'bg-copper-10 text-graphite border border-copper-30'
    if (ns === 'Blended') return 'bg-copper-10 text-graphite border border-copper-30'
    if (ns === 'Bottled') return 'bg-graphite text-white'
    if (ns === 'Transferred') return 'bg-beige text-graphite border border-copper-30'
    if (ns === '<2y') return 'bg-copper-10 text-graphite border border-copper-30'
    return 'bg-graphite/5 text-graphite border border-graphite/10'
  }

  const cardBackgroundClass = (s: string) => {
    if (s === 'Aging') return 'bg-copper-10'
    if (s === 'Ready') return 'bg-graphite-10'
    if (s === 'Emptied') return 'bg-beige'
    if (s === 'Maintenance') return 'bg-copper-10'
    if (s === 'Testing') return 'bg-copper-10'
    if (s === 'Less than 2 years') return 'bg-brand-10'
    if (s === 'Greater than 2 years') return 'bg-copper-green-10'
    if (s === 'Bottled') return 'bg-graphite-10'
    return 'bg-copper-10'
  }

  const menuStatuses = ['all', ...Array.from(new Set(Object.keys(stats?.byStatus || {})))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Barrel Tracking</h1>
        <Link
          href="/dashboard/barrels/new"
          className="bg-copper hover:bg-copper-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Add Barrel
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface overflow-hidden shadow-card rounded-xl border border-border">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-muted-foreground truncate">
                Total Barrels
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-foreground">
                {stats.totalBarrels}
              </dd>
            </div>
          </div>
          
          <div className="bg-surface overflow-hidden shadow-card rounded-xl border border-border">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-muted-foreground truncate">
                Active Barrels
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-foreground">
                {stats.activeBarrels}
              </dd>
            </div>
          </div>
          
          <div className="bg-surface overflow-hidden shadow-card rounded-xl border border-border">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-muted-foreground truncate">
                Total Volume (L)
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-foreground">
                {stats.totalVolume.toFixed(1)}
              </dd>
            </div>
          </div>
          
          <div className="bg-surface overflow-hidden shadow-card rounded-xl border border-border">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-muted-foreground truncate">
                Avg Age (days)
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-foreground">
                {stats.averageAge}
              </dd>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {menuStatuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`
                whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${filter === status
                  ? 'border-copper text-copper'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border-strong'
                }
              `}
            >
              {status === 'all' ? 'All Barrels' : status}
              {stats && (
                <span className="ml-2 bg-accent text-foreground py-0.5 px-2 rounded-full text-xs">
                  {status === 'all'
                    ? stats.totalBarrels
                    : (stats.byStatus[status as keyof typeof stats.byStatus] || 0)}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Barrels Cards */}
      <div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading barrels...</div>
        ) : barrels.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No barrels found.
            <Link href="/dashboard/barrels/new" className="text-copper hover:text-copper-hover ml-1 transition-colors">
              Add your first barrel
            </Link>
          </div>
        ) : (
          <div className="mx-auto bg-surface rounded-2xl shadow-card border border-border p-4 sm:p-5">
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-10">
              {barrels
                .slice()
                .sort((a, b) => String(a.barrelNumber || '').localeCompare(String(b.barrelNumber || '')))
                .map((barrel) => {
                  const code = String(barrel.barrelNumber || '').toUpperCase()
                  const uiStatus = toUiStatus(barrel)
                  const bg = tileClasses(uiStatus)
                  const label = `Barrel ${code}, status ${uiStatus}`

                  return (
                    <Link
                      key={barrel.id}
                      href={`/dashboard/barrels/${barrel.id}`}
                      aria-label={label}
                      className={
                        `${bg} rounded-lg aspect-square flex items-center justify-center text-white border-2 border-white ` +
                        'transition-all duration-150 ease-out hover:brightness-[1.04] active:brightness-[0.98] active:scale-[0.99] cursor-pointer ' +
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-graphite/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
                      }
                    >
                      <div className="flex flex-col items-center justify-center text-center select-none">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-white">{dropletSvg}</span>
                          <span className="text-white text-sm font-semibold tracking-wide">{code}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BarrelsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading barrels...</div>}>
      <BarrelsContent />
    </Suspense>
  )
}
