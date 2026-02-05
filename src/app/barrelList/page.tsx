'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Barrel } from '@/modules/barrels/types/barrel.types'

type UiStatus = 'aging' | 'ready' | 'bottled' | 'transferred' | 'unknown'

const toUiStatus = (barrel: Barrel): UiStatus => {
  const raw = String(barrel.status || '').toLowerCase()
  if (raw.includes('transferred')) return 'transferred'
  if (raw.includes('bottled') || raw.includes('emptied')) return 'bottled'
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

const tileClasses = (status: UiStatus, selected: boolean) => {
  if (selected) {
    return 'bg-[#6B4E2E]'
  }
  if (status === 'ready') return 'bg-[#2F9E44]'
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

export default function BarrelListPage() {
  const router = useRouter()

  const [barrels, setBarrels] = useState<Barrel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filter, setFilter] = useState<'all' | UiStatus>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string>('')

  useEffect(() => {
    try {
      const v = window.localStorage.getItem('barrelList:selected') || ''
      if (v) setSelectedId(v)
    } catch {}
  }, [])

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/barrels?status=all', { cache: 'no-store' })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(json?.error || `Failed to load barrels: ${res.status}`)
        }
        const json = await res.json() as { barrels?: Barrel[] }
        setBarrels(Array.isArray(json?.barrels) ? json.barrels : [])
      } catch (e: any) {
        setError(String(e?.message || 'Failed to load barrels'))
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return barrels
      .map((b) => ({ barrel: b, uiStatus: toUiStatus(b) }))
      .filter(({ barrel, uiStatus }) => {
        if (filter !== 'all' && uiStatus !== filter) return false
        if (!q) return true
        const code = String(barrel.barrelNumber || '').toLowerCase()
        return code.includes(q)
      })
      .sort((a, b) => String(a.barrel.barrelNumber || '').localeCompare(String(b.barrel.barrelNumber || '')))
  }, [barrels, filter, query])

  const filters: { key: 'all' | UiStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'ready', label: 'Ready' },
    { key: 'aging', label: 'Aging' },
    { key: 'bottled', label: 'Bottled' },
    { key: 'transferred', label: 'Transferred' },
  ]

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-10 w-10 rounded-xl bg-white shadow-sm border border-stone-200 text-graphite flex items-center justify-center hover:bg-stone-50 transition"
            aria-label="Back"
          >
            <span aria-hidden="true">←</span>
          </button>
          <div className="text-base font-semibold text-graphite">Barrel List</div>
          <div className="w-10" />
        </div>
        <div className="border-b border-stone-200" />

        <div className="py-6">
          <div className="mx-auto bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    className={
                      filter === f.key
                        ? 'px-3 py-1.5 rounded-full text-sm font-medium bg-graphite text-white transition'
                        : 'px-3 py-1.5 rounded-full text-sm font-medium bg-stone-100 text-graphite/70 hover:text-graphite hover:bg-stone-200 transition'
                    }
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search DTD…"
                className="w-full sm:w-60 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-graphite placeholder:text-graphite/40 focus:outline-none focus:ring-2 focus:ring-graphite/15"
                aria-label="Search barrels"
              />
            </div>

            {isLoading ? (
              <div className="mt-6 text-sm text-graphite/60">Loading…</div>
            ) : error ? (
              <div className="mt-6 text-sm text-red-700">{error}</div>
            ) : (
              <div className="mt-6 grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-10">
                {filtered.map(({ barrel, uiStatus }) => {
                  const code = String(barrel.barrelNumber || '').toUpperCase()
                  const selectedByData = Boolean((barrel as any)?.is_selected ?? (barrel as any)?.isSelected)
                  const selectedByClick = Boolean(selectedId) && (selectedId === barrel.id || selectedId === barrel.barrelNumber)
                  const selected = selectedByData || selectedByClick
                  const bg = tileClasses(uiStatus, selected)
                  const label = `Barrel ${code}, status ${uiStatus}, ABV ${Number.isFinite(barrel.abv) ? barrel.abv.toFixed(1) : '—'}, volume ${Number.isFinite(barrel.currentVolume) ? barrel.currentVolume.toFixed(1) : '—'}L`

                  return (
                    <Link
                      key={barrel.id || barrel.barrelNumber}
                      href={`/dashboard/barrels/${encodeURIComponent(barrel.id || barrel.barrelNumber)}`}
                      onClick={() => {
                        const next = barrel.id || barrel.barrelNumber
                        setSelectedId(next)
                        try {
                          window.localStorage.setItem('barrelList:selected', String(next))
                        } catch {}
                      }}
                      aria-label={label}
                      className={
                        `${bg} rounded-lg aspect-square flex items-center justify-center text-white border-2 border-white ` +
                        'transition-all duration-150 ease-out hover:brightness-[1.04] active:brightness-[0.98] active:scale-[0.99] cursor-pointer ' +
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-graphite/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F7F9]'
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
