'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import type { Barrel } from '@/modules/barrels/types/barrel.types'

export default function BarrelDetailPage() {
  const router = useRouter()
  const params = useParams() as { id?: string } | null
  const barrelId = params?.id as string
  
  const [barrel, setBarrel] = useState<Barrel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // const [isEditing, setIsEditing] = useState(false) // Removed unused state

  useEffect(() => {
    loadBarrel()
  }, [barrelId])

  const isBadDateValue = (value: any): boolean => {
    if (value === null || value === undefined) return true
    const raw = String(value).trim()
    if (!raw) return true
    
    const lower = raw.toLowerCase()
    if (lower === 'invalid date' || lower === 'null' || lower === 'undefined') {
      return true
    }

    // Try direct date parsing first
    const directDate = new Date(raw)
    if (!isNaN(directDate.getTime())) {
      return false
    }
    
    // Try our flexible parser
    const timestamp = parseDateFlexible(raw)
    if (Number.isFinite(timestamp)) {
      return false
    }
    
    // Check for DD/MM/YYYY format
    const dmy = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/)
    if (dmy) {
      const day = parseInt(dmy[1], 10)
      const month = parseInt(dmy[2], 10) - 1
      let year = parseInt(dmy[3], 10)
      if (year < 100) year += 2000
      
      const date = new Date(year, month, day)
      return !(date.getFullYear() === year && date.getMonth() === month && date.getDate() === day)
    }
    
    return true
  }

  const loadBarrel = async () => {
    if (!barrelId) {
      setError('Missing barrel id')
      setIsLoading(false)
      return
    }
    try {
      const res = await fetch(`/api/barrels/${encodeURIComponent(barrelId)}`, { cache: 'no-store' })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || `Failed to load barrel: ${res.status}`)
      }
      const json = await res.json() as { barrel: Barrel }
      let data = json?.barrel || null
      if (!data) {
        setError('Barrel not found')
      } else {
        const needsDateFix = isBadDateValue((data as any).fillDate) || isBadDateValue((data as any).dateMature)
        if (needsDateFix) {
          try {
            const listRes = await fetch('/api/barrels?status=all', { cache: 'no-store' })
            if (listRes.ok) {
              const listJson = await listRes.json() as { barrels?: Barrel[] }
              const list = Array.isArray(listJson?.barrels) ? listJson.barrels : []
              const match = list.find((b) => b?.id === barrelId || b?.barrelNumber === barrelId || b?.barrelNumber === (data as any)?.barrelNumber)
              if (match) {
                data = {
                  ...data,
                  fillDate: isBadDateValue((data as any).fillDate) ? (match as any).fillDate : (data as any).fillDate,
                  dateMature: isBadDateValue((data as any).dateMature) ? (match as any).dateMature : (data as any).dateMature,
                  lastInspection: isBadDateValue((data as any).lastInspection) ? (match as any).lastInspection : (data as any).lastInspection,
                  createdAt: isBadDateValue((data as any).createdAt) ? (match as any).createdAt : (data as any).createdAt,
                  updatedAt: isBadDateValue((data as any).updatedAt) ? (match as any).updatedAt : (data as any).updatedAt,
                }
              }
            }
          } catch {}
        }
        setBarrel(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load barrel')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this barrel?')) {
      return
    }

    try {
      const res = await fetch(`/api/barrels/${encodeURIComponent(barrelId)}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || `Failed to delete barrel: ${res.status}`)
      }
      router.push('/dashboard/barrels')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete barrel')
    }
  }

  const normalizeDateInput = (value?: string | null): string => {
    const raw = String(value ?? '').trim()
    if (!raw) return ''

    // Postgres-ish timestamps: "YYYY-MM-DD HH:MM:SS" (+ tz)
    let s = raw
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(s)) {
      s = s.replace(/\s+/, 'T')
    }
    // +00 -> +00:00
    if (/[+-]\d{2}$/.test(s)) {
      s = `${s}:00`
    }
    // +0000 -> +00:00
    if (/[+-]\d{4}$/.test(s)) {
      s = s.replace(/([+-]\d{2})(\d{2})$/, '$1:$2')
    }
    // "YYYY-MM-DDTHH:MM:SS" (no tz) -> assume Z
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(s)) {
      s = `${s}Z`
    }
    return s
  }

  const parseDateFlexible = (value?: string | null): number => {
    const raw = String(value ?? '').trim()
    if (!raw) return NaN

    const normalized = normalizeDateInput(raw)
    const direct = Date.parse(normalized || raw)
    if (Number.isFinite(direct)) return direct

    // YYYY/MM/DD or YYYY.MM.DD
    const ymd = raw.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/)
    if (ymd) {
      const year = parseInt(ymd[1], 10)
      const month = parseInt(ymd[2], 10)
      const day = parseInt(ymd[3], 10)
      return new Date(year, month - 1, day).getTime()
    }

    // DD/MM/YYYY (or with '.' or '-')
    const dmy = raw.match(/^([0-9]{1,2})[\/\-.]([0-9]{1,2})[\/\-.]([0-9]{2,4})$/)
    if (dmy) {
      let day = parseInt(dmy[1], 10)
      let month = parseInt(dmy[2], 10)
      let year = parseInt(dmy[3], 10)
      if (year < 100) year += 2000

      // Handle MM/DD vs DD/MM ambiguity
      if (day <= 12 && month > 12) {
        const tmp = day
        day = month
        month = tmp
      }

      return new Date(year, month - 1, day).getTime()
    }

    return NaN
  }

  const formatDate = (value?: string, locale: string = 'en-US', options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) => {
    const timestamp = parseDateFlexible(value)
    if (!Number.isFinite(timestamp)) {
      const raw = String(value ?? '').trim()
      const lower = raw.toLowerCase()
      if (!raw || lower === 'invalid date' || lower === 'null' || lower === 'undefined') return '—'
      return raw
    }
    const d = new Date(timestamp)
    if (!Number.isFinite(d.getTime())) return (String(value ?? '').trim() || '—')
    const formatted = d.toLocaleDateString(locale, options)
    if (String(formatted).toLowerCase() === 'invalid date') return '—'
    return formatted
  }

  const formatDateTime = (value?: string, locale: string = 'en-US', options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) => {
    const timestamp = parseDateFlexible(value)
    if (!Number.isFinite(timestamp)) {
      const raw = String(value ?? '').trim()
      const lower = raw.toLowerCase()
      if (!raw || lower === 'invalid date' || lower === 'null' || lower === 'undefined') return '—'
      return raw
    }
    const d = new Date(timestamp)
    if (!Number.isFinite(d.getTime())) return (String(value ?? '').trim() || '—')
    const formatted = d.toLocaleString(locale, options)
    if (String(formatted).toLowerCase() === 'invalid date') return '—'
    return formatted
  }

  const calculateAge = (fillDate: string) => {
    const timestamp = parseDateFlexible(fillDate)
    if (!Number.isFinite(timestamp)) return '—'

    const now = Date.now()
    const diffDays = Math.ceil(Math.abs(now - timestamp) / (1000 * 60 * 60 * 24))

    if (diffDays < 30) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'}`
    }

    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months === 1 ? '' : 's'}`
    }

    const years = Math.floor(diffDays / 365)
    const months = Math.floor((diffDays % 365) / 30)
    const monthLabel = months > 0 ? ` ${months} month${months === 1 ? '' : 's'}` : ''
    return `${years} year${years === 1 ? '' : 's'}${monthLabel}`
  }

  const calculateAngelsShare = (originalVolume: number | null, currentVolume: number) => {
    if (originalVolume === null || !Number.isFinite(originalVolume) || originalVolume <= 0) {
      return { loss: '—', percentage: '—' }
    }
    const loss = originalVolume - currentVolume
    const percentage = (loss / originalVolume) * 100
    return {
      loss: Number.isFinite(loss) ? loss.toFixed(1) : '—',
      percentage: Number.isFinite(percentage) ? percentage.toFixed(1) : '—'
    }
  }

  const parseBatchList = (value?: string | null): string[] => {
    const raw = String(value ?? '').trim()
    if (!raw) return []

    const parts = raw
      .split(/[;,]/g)
      .map((s) => s.trim())
      .filter(Boolean)

    const uniq: string[] = []
    for (const p of parts) {
      if (!uniq.includes(p)) uniq.push(p)
    }
    return uniq
  }

  const getBatchHref = (batchId: string) => {
    const id = String(batchId || '').trim()
    if (!id) return '#'
    if (id.toUpperCase().startsWith('SPIRIT-')) {
      return `/dashboard/batches/old-roberta?batch=${encodeURIComponent(id)}`
    }
    return `/dashboard/production/rum?batch=${encodeURIComponent(id)}`
  }

  const agingProgress = (fillDate?: string, matureDate?: string) => {
    const fillTs = parseDateFlexible(fillDate)
    const matureTs = parseDateFlexible(matureDate)
    const now = Date.now()
    if (!Number.isFinite(fillTs) || !Number.isFinite(matureTs) || matureTs <= fillTs) return null
    const p = (now - fillTs) / (matureTs - fillTs)
    return Math.max(0, Math.min(1, p))
  }

  const normalizeStatus = (s: string) => {
    if (s === 'Decanted') return 'Decanted'
    if (s === 'Blended') return 'Blended'
    if (s === 'Bottled') return 'Bottled'
    if (s === 'Emptied') return 'Transferred'
    if (s === 'Less than 2 years') return '<2y'
    return 'Aging'
  }

  const isNearMaturity = (fillDate?: string, matureDate?: string) => {
    const fillTs = parseDateFlexible(fillDate)
    const matureTs = parseDateFlexible(matureDate)
    if (!Number.isFinite(fillTs) || !Number.isFinite(matureTs) || matureTs <= fillTs) return false
    const remainingDays = Math.ceil((matureTs - Date.now()) / (1000 * 60 * 60 * 24))
    return remainingDays <= 60
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading barrel details...</div>
      </div>
    )
  }

  if (error || !barrel) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Barrel not found'}
        </div>
        <Link
          href="/dashboard/barrels"
          className="mt-4 inline-block text-blue-600 hover:text-blue-800"
        >
          ← Back to barrels
        </Link>
      </div>
    )
  }

  const angelsShare = calculateAngelsShare(barrel.originalVolume, barrel.currentVolume)
  const statusLabel = normalizeStatus(barrel.status)
  const maturitySoon = isNearMaturity(barrel.fillDate, barrel.dateMature)
  const agingP = agingProgress(barrel.fillDate, barrel.dateMature)

  const canonicalId = barrel?.id || barrelId
  const batchList = parseBatchList(barrel.batch)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header / Identity */}
      <div className="mb-6 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <Link href="/dashboard/barrels" className="text-sm text-graphite/60 hover:text-graphite">
            ← Back to barrels
          </Link>
          <div className="mt-3 flex items-start gap-4">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wide text-graphite/60">Barrel</div>
              <h1 className="text-2xl font-semibold text-graphite truncate">{barrel.barrelNumber}</h1>
              <div className="mt-1 text-sm text-graphite/70 truncate">
                {barrel.spiritType || '—'}
                {barrel.barrelType ? ` • ${barrel.barrelType}` : ''}
                {barrel.barrelSize ? ` • ${barrel.barrelSize}` : ''}
              </div>
            </div>
            <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-graphite/5 text-graphite border border-graphite/10">
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/dashboard/barrels/${encodeURIComponent(canonicalId)}/movements`}
            className="px-3 py-2 rounded-md text-sm font-medium border border-graphite/20 text-graphite hover:border-graphite/30"
          >
            Move
          </Link>
          <Link
            href={`/dashboard/barrels/${encodeURIComponent(canonicalId)}/edit`}
            className="px-3 py-2 rounded-md text-sm font-medium bg-graphite text-white hover:bg-graphite/90"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-3 py-2 rounded-md text-sm font-medium border border-graphite/20 text-graphite/70 hover:text-graphite hover:border-graphite/30"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identity & Location */}
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
          <h2 className="text-sm font-semibold text-graphite">Identity & Location</h2>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-graphite/60">Location</div>
              <div className="mt-1 text-base text-graphite">{barrel.location || '—'}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-graphite/60">Batch</div>
              <div className="mt-1 text-base text-graphite">
                {batchList.length === 0 ? (
                  '—'
                ) : batchList.length === 1 ? (
                  <Link
                    href={getBatchHref(batchList[0])}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-graphite/15 bg-graphite/[0.03] text-graphite hover:bg-graphite/[0.06]"
                  >
                    {batchList[0]}
                  </Link>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {batchList.map((b) => (
                      <Link
                        key={b}
                        href={getBatchHref(b)}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-graphite/15 bg-graphite/[0.03] text-graphite hover:bg-graphite/[0.06]"
                      >
                        {b}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-graphite/60">Previous Spirit</div>
              <div className="mt-1 text-base text-graphite">{barrel.prevSpirit || '—'}</div>
            </div>
          </div>
        </div>

        {/* Time & Aging */}
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
          <h2 className="text-sm font-semibold text-graphite">Time & Aging</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-graphite/60">Fill Date</div>
              <div className="mt-1 font-mono tabular-nums text-base text-graphite">
                {formatDate(barrel.fillDate, 'en-AU', { year: 'numeric', month: '2-digit', day: '2-digit' })}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-graphite/60">Mature Date</div>
              <div className="mt-1 font-mono tabular-nums text-base text-graphite">
                {formatDate(barrel.dateMature, 'en-AU', { year: 'numeric', month: '2-digit', day: '2-digit' })}
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-[11px] uppercase tracking-wide text-graphite/60">Aging</div>
              <div className="mt-2">
                {agingP == null ? (
                  <div className="text-sm text-graphite/60">—</div>
                ) : (
                  <div>
                    <div className="h-2 rounded-full bg-graphite/10 overflow-hidden">
                      <div className="h-full bg-graphite/40" style={{ width: `${Math.round(agingP * 100)}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between text-[11px] text-graphite/60">
                      <span>{Math.round(agingP * 100)}%</span>
                      <span>{maturitySoon ? 'Near maturity' : ''}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-[11px] uppercase tracking-wide text-graphite/60">Last Inspection</div>
              <div className="mt-1 text-base text-graphite">{formatDate(barrel.lastInspection)}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
          <h2 className="text-sm font-semibold text-graphite">Actions</h2>
          <div className="mt-4 grid grid-cols-1 gap-3">
            {statusLabel === 'Aging' && (
              <Link
                href={`/dashboard/barrels/${encodeURIComponent(canonicalId)}/angels-share`}
                className="px-4 py-2 rounded-md text-sm font-medium bg-graphite text-white hover:bg-graphite/90 text-center"
              >
                Record Angel’s Share
              </Link>
            )}
            {maturitySoon && (
              <Link
                href={`/dashboard/barrels/${encodeURIComponent(canonicalId)}/sample`}
                className="px-4 py-2 rounded-md text-sm font-medium bg-graphite text-white hover:bg-graphite/90 text-center"
              >
                Record Sample
              </Link>
            )}
            {!maturitySoon && (
              <Link
                href={`/dashboard/barrels/${encodeURIComponent(canonicalId)}/sample`}
                className="px-4 py-2 rounded-md text-sm font-medium border border-graphite/20 text-graphite hover:border-graphite/30 text-center"
              >
                Record Sample
              </Link>
            )}
            <Link
              href={`/dashboard/barrels/${encodeURIComponent(canonicalId)}/history`}
              className="px-4 py-2 rounded-md text-sm font-medium border border-graphite/20 text-graphite hover:border-graphite/30 text-center"
            >
              View History
            </Link>
          </div>
        </div>

        {/* Volume & Strength */}
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-graphite">Volume & Strength</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-graphite/10 bg-graphite/[0.02] p-4">
              <div className="text-[11px] uppercase tracking-wide text-graphite/60">Current Volume</div>
              <div className="mt-2 font-mono tabular-nums text-2xl text-graphite">{barrel.currentVolume.toFixed(0)} <span className="text-xs text-graphite/60">L</span></div>
            </div>
            <div className="rounded-lg border border-graphite/10 bg-graphite/[0.02] p-4">
              <div className="text-[11px] uppercase tracking-wide text-graphite/60">Current ABV</div>
              <div className="mt-2 font-mono tabular-nums text-2xl text-graphite">{barrel.abv.toFixed(1)} <span className="text-xs text-graphite/60">%</span></div>
              <div className="mt-1 text-xs text-graphite/60">Proof {(barrel.abv * 2).toFixed(1)}</div>
            </div>
            <div className="rounded-lg border border-graphite/10 bg-graphite/[0.02] p-4">
              <div className="text-[11px] uppercase tracking-wide text-graphite/60">Angel’s Share</div>
              <div className="mt-2 font-mono tabular-nums text-2xl text-graphite">{angelsShare.loss} <span className="text-xs text-graphite/60">L</span></div>
              <div className="mt-1 text-xs text-graphite/60">{angelsShare.percentage === '—' ? '—' : `${angelsShare.percentage}% of original`}</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-graphite/60">Original Volume</div>
              <div className="mt-1 font-mono tabular-nums text-base text-graphite">{barrel.originalVolume === null ? '—' : `${barrel.originalVolume.toFixed(0)} L`}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-graphite/60">Angel’s Share (recorded)</div>
              <div className="mt-1 text-base text-graphite">{barrel.angelsShare || '—'}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-graphite/60">Status</div>
              <div className="mt-1 text-base text-graphite">{statusLabel}</div>
            </div>
          </div>
        </div>

        {/* Notes & History */}
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 lg:col-span-3">
          <h2 className="text-sm font-semibold text-graphite">Notes & History</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-graphite/60">Notes</div>
              <div className="mt-2 text-sm text-graphite/80 whitespace-pre-wrap">{barrel.notes || '—'}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-graphite/60">Tasting Notes</div>
              <div className="mt-2 text-sm text-graphite/80 whitespace-pre-wrap">{barrel.tastingNotes || '—'}</div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-stone-200 text-[11px] text-graphite/50">
            <div>Created: {formatDateTime(barrel.createdAt)}</div>
            <div>Last updated: {formatDateTime(barrel.updatedAt)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
