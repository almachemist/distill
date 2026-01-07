'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Barrel, BarrelStats } from '@/modules/barrels/types/barrel.types'
import { createClient } from '@/lib/supabase/client'
export const dynamic = 'force-dynamic'

export default function BarrelsPage() {
  const [barrels, setBarrels] = useState<Barrel[]>([])
  const [stats, setStats] = useState<BarrelStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const tableName = (process.env.NEXT_PUBLIC_BARRELS_TABLE || 'tracking')
  const getStatusColors = (status?: string) => {
    const s = (status || '').toLowerCase()
    if (s.includes('less than 2 years')) {
      return {
        cardBg: 'bg-copper-10',
        avatarBg: 'bg-copper',
        avatarText: 'text-white',
        pillBg: 'bg-copper-10',
        pillText: 'text-graphite',
        pillBorder: 'border border-copper-30',
      }
    }
    if (s.includes('greater than 2 years')) {
      return {
        cardBg: 'bg-copper-20',
        avatarBg: 'bg-copper-amber',
        avatarText: 'text-white',
        pillBg: 'bg-copper-20',
        pillText: 'text-graphite',
        pillBorder: 'border border-copper-30',
      }
    }
    if (s === 'aging') {
      return {
        cardBg: 'bg-copper-10',
        avatarBg: 'bg-copper',
        avatarText: 'text-white',
        pillBg: 'bg-copper-10',
        pillText: 'text-graphite',
        pillBorder: 'border border-copper-30',
      }
    }
    if (s === 'bottled' || s === 'ready') {
      return {
        cardBg: 'bg-gray-100',
        avatarBg: 'bg-graphite',
        avatarText: 'text-white',
        pillBg: 'bg-gray-200',
        pillText: 'text-graphite',
        pillBorder: 'border border-gray-300',
      }
    }
    if (s === 'emptied' || s === 'transferred') {
      return {
        cardBg: 'bg-gray-50',
        avatarBg: 'bg-gray-300',
        avatarText: 'text-graphite',
        pillBg: 'bg-gray-200',
        pillText: 'text-graphite',
        pillBorder: 'border border-gray-300',
      }
    }
    if (s === 'maintenance') {
      return {
        cardBg: 'bg-copper-10',
        avatarBg: 'bg-copper-amber',
        avatarText: 'text-white',
        pillBg: 'bg-copper-20',
        pillText: 'text-graphite',
        pillBorder: 'border border-copper-30',
      }
    }
    return {
      cardBg: 'bg-white',
      avatarBg: 'bg-copper-red',
      avatarText: 'text-white',
      pillBg: 'bg-copper-red',
      pillText: 'text-white',
      pillBorder: '',
    }
  }
  const parseDate = (s: string | null | undefined) => {
    if (!s) return null
    const v = String(s).trim()
    if (!v) return null
    if (v.includes('/')) {
      const p = v.split('/')
      if (p.length >= 3) {
        const dd = parseInt(p[0], 10)
        const mm = parseInt(p[1], 10)
        const yy = parseInt(p[2], 10)
        if (Number.isFinite(dd) && Number.isFinite(mm) && Number.isFinite(yy) && mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
          const d = new Date(yy, mm - 1, dd)
          if (Number.isFinite(d.getTime())) return d
        }
      }
    }
    const t = new Date(v).getTime()
    if (!Number.isFinite(t)) return null
    return new Date(t)
  }

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      try { controller.abort() } catch {}
      setIsLoading(false)
    }, 10000)
    loadBarrels(controller.signal).finally(() => clearTimeout(timeout))
    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [filter])

  const loadBarrels = async (signal?: AbortSignal) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status', filter)
      const qs = params.toString()
      const url = qs ? `/api/barrels?${qs}` : '/api/barrels'
      const res = await fetch(url, { cache: 'no-store', credentials: 'same-origin', signal })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json) {
        const supabase = createClient()
        let q = supabase.from(tableName).select('*')
        if (filter !== 'all') q = q.eq('status', filter)
        const { data } = await q.order('created_at', { ascending: false })
        const fallback = (data || []).map((b: any) => {
          const isUuid = typeof b.id === 'string' && b.id.includes('-')
          const idVal = isUuid ? b.id : (b.barrel_id || String(b.id || (b.barrel_number || '')))
          const vol =
            typeof b.volume_l !== 'undefined' ? parseFloat(String(b.volume_l)) :
            typeof b.liters !== 'undefined' ? parseFloat(String(b.liters)) :
            parseFloat(String(b.volume || '0'))
          const abvVal =
            typeof b.abv !== 'undefined' ? parseFloat(String(b.abv)) :
            typeof b.strength !== 'undefined' ? parseFloat(String(b.strength)) : 0
          const fill =
            (b as any).date_filled_normalized || b.date_filled || b.fill_date || b.filled_date || ''
          const size =
            b.size || b.barrel_size || ''
          const loc =
            b.location_normalized || b.location || b.location_name || ''
          const sizeVal = (String(size).trim() === '0' ? '' : String(size))
          return {
            id: idVal,
            barrelNumber: b.barrel_number || b.barrel_id || '',
            spiritType: b.spirit || '',
            prevSpirit: b.prev_spirit,
            barrelType: b.barrel || b.barrel_type || '',
            barrelSize: sizeVal,
            liters: Number.isFinite(vol) ? vol : 0,
            fillDate: fill,
            location: loc,
            status: (b.status || 'Aging') as Barrel['status'],
            currentVolume: Number.isFinite(vol) ? vol : 0,
            originalVolume: Number.isFinite(vol) ? vol : 0,
            abv: Number.isFinite(abvVal) ? abvVal : 0,
            notes: b.notes_comments || b.notes || '',
            organizationId: b.organization_id || '',
            createdAt: b.created_at || '',
            updatedAt: b.updated_at || '',
          }
        })
        setBarrels(fallback)
        const now = Date.now()
        const averageAge = fallback.length
          ? Math.round(
              fallback.reduce((acc, b) => {
                const df = b.fillDate ? new Date(b.fillDate).getTime() : now
                return acc + Math.floor((now - df) / (1000 * 60 * 60 * 24))
              }, 0) / fallback.length
            )
          : 0
        const totalVolume = fallback.reduce((sum, b) => sum + (b.currentVolume || 0), 0)
        const byStatus = fallback.reduce(
          (acc: Record<string, number>, b) => {
            const s = b.status || 'Aging'
            acc[s] = (acc[s] || 0) + 1
            return acc
          },
          {} as Record<string, number>
        )
        const bySpiritType = fallback.reduce((acc: Record<string, number>, b) => {
          const s = b.spiritType || ''
          if (!s) return acc
          acc[s] = (acc[s] || 0) + 1
          return acc
        }, {})
        const byLocation = fallback.reduce((acc: Record<string, number>, b) => {
          const raw = b.location || ''
          const s = raw ? (raw.toLowerCase().includes('warehouse') ? 'Warehouse' : raw) : 'Warehouse'
          if (!s) return acc
          acc[s] = (acc[s] || 0) + 1
          return acc
        }, {})
        setStats({
          totalBarrels: fallback.length,
          activeBarrels: fallback.filter(b => b.status !== 'Emptied').length,
          totalVolume,
          averageAge,
          byStatus: byStatus as any,
          bySpiritType,
          byLocation,
        })
        return
      }
      const mapped = (json.barrels || []).map((b: any) => {
        const isUuid = typeof b.id === 'string' && b.id.includes('-')
        const idVal = isUuid ? b.id : (b.barrel_id || String(b.id || (b.barrel_number || '')))
        const vol =
          typeof b.volume_l !== 'undefined' ? parseFloat(String(b.volume_l)) :
          typeof b.liters !== 'undefined' ? parseFloat(String(b.liters)) :
          parseFloat(String(b.volume || '0'))
        const abvVal =
          typeof b.abv !== 'undefined' ? parseFloat(String(b.abv)) :
          typeof b.strength !== 'undefined' ? parseFloat(String(b.strength)) : 0
        const fill =
          b.date_filled_normalized || b.date_filled || b.fill_date || b.filled_date || ''
        const size =
          b.size || b.barrel_size || ''
        const loc =
          b.location_normalized || b.location || b.location_name || ''
        const sizeVal = (String(size).trim() === '0' ? '' : String(size))
        return {
          id: idVal,
          barrelNumber: b.barrel_number || b.barrel_id || '',
          spiritType: b.spirit || '',
          prevSpirit: b.prev_spirit,
          barrelType: b.barrel || b.barrel_type || '',
          barrelSize: sizeVal,
          liters: Number.isFinite(vol) ? vol : 0,
          fillDate: fill,
          location: loc,
          status: (b.status || 'Aging') as Barrel['status'],
          currentVolume: Number.isFinite(vol) ? vol : 0,
          originalVolume: Number.isFinite(vol) ? vol : 0,
          abv: Number.isFinite(abvVal) ? abvVal : 0,
          notes: b.notes_comments || b.notes || '',
          organizationId: b.organization_id || '',
          createdAt: b.created_at || '',
          updatedAt: b.updated_at || '',
        }
      })
      setBarrels(mapped)
      setStats(json.stats as BarrelStats)
    } catch (error: any) {
      const msg = String(error?.message || '')
      const isAbort = error?.name === 'AbortError' || msg.toLowerCase().includes('abort')
      if (!isAbort) {
        setStats(null)
        setBarrels([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-graphite">Barrel Tracking</h1>
        <Link
          href="/dashboard/barrels/new"
          className="bg-copper hover:bg-copper/90 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add Barrel
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-graphite/60 truncate">
                Total Barrels
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-graphite">
                {stats.totalBarrels}
              </dd>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-graphite/60 truncate">
                Active Barrels
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-graphite">
                {stats.activeBarrels}
              </dd>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-graphite/60 truncate">
                Total Volume (L)
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-graphite">
                {stats.totalVolume.toFixed(1)}
              </dd>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-graphite/60 truncate">
                Avg Age (days)
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-graphite">
                {stats.averageAge}
              </dd>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="border-b border-copper-15">
        <nav className="-mb-px flex space-x-8">
          {(stats ? ['all', ...Object.keys(stats.byStatus || {})] : ['all', 'Aging', 'Ready', 'Emptied', 'Maintenance', 'Testing']).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`
                whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
                ${filter === status
                  ? 'border-copper text-copper'
                  : 'border-transparent text-graphite/60 hover:text-graphite hover:border-copper-30'
                }
              `}
            >
              {status === 'all' ? 'All Barrels' : status}
              {stats && (
                <span className="ml-2 bg-beige text-graphite py-0.5 px-2 rounded-full text-xs">
                  {status === 'all' 
                    ? stats.totalBarrels 
                    : (stats.byStatus as any)[status] || 0}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Barrels Cards */}
      <div>
        {isLoading ? (
          <div className="p-8 text-center text-graphite/60">Loading barrels...</div>
        ) : barrels.length === 0 ? (
          <div className="p-8 text-center text-graphite/60">
            No barrels found.
            <Link href="/dashboard/barrels/new" className="text-brand hover:text-brand ml-1">
              Add your first barrel
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barrels.map((barrel) => {
              const colors = getStatusColors(barrel.status)
              return (
              <Link key={barrel.id || barrel.barrelNumber} href={`/dashboard/barrels/${barrel.id}`} className="block">
                <div className={`${colors.cardBg} rounded-xl border border-copper-20 shadow-sm hover:shadow-md transition`}>
                  <div className="px-5 py-4 border-b border-copper-15 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`
                        h-10 w-10 rounded-full flex items-center justify-center text-white font-bold
                        ${colors.avatarBg} ${colors.avatarText}
                      `}>
                        {barrel.barrelNumber.charAt(0)}
                      </div>
                      <div>
                        <div className="text-base font-semibold text-graphite">
                          {barrel.barrelNumber}
                        </div>
                        <div className="text-sm text-graphite/70">
                          {barrel.spiritType} • {barrel.barrelType}{barrel.barrelSize ? ` • ${barrel.barrelSize}` : ''}
                        </div>
                      </div>
                    </div>
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${colors.pillBg} ${colors.pillText} ${colors.pillBorder}
                    `}>
                      {barrel.status}
                    </span>
                  </div>
                  <div className="p-5 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-copper uppercase tracking-wide">Volume</p>
                      <p className="text-sm font-medium text-graphite">
                        {barrel.currentVolume}L / {barrel.originalVolume}L
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-copper uppercase tracking-wide">ABV</p>
                      <p className="text-sm font-medium text-graphite">{barrel.abv}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-copper uppercase tracking-wide">Location</p>
                      <p className="text-sm font-medium text-graphite">{barrel.location}</p>
                    </div>
                    <div>
                      <p className="text-xs text-copper uppercase tracking-wide">Filled</p>
                      <p className="text-sm font-medium text-graphite">
                        {(() => {
                          const d = parseDate(barrel.fillDate)
                          return d ? d.toLocaleDateString() : '—'
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="px-5 pb-5 grid grid-cols-2 gap-4 border-t border-copper-15">
                    <div>
                      <p className="text-xs text-copper uppercase tracking-wide">Prev. Spirit</p>
                      <p className="text-sm font-medium text-graphite">{barrel.prevSpirit || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-copper uppercase tracking-wide">Age (days)</p>
                      <p className="text-sm font-medium text-graphite">
                        {(() => {
                          const d = parseDate(barrel.fillDate)
                          if (!d) return '—'
                          return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
                        })()}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-copper uppercase tracking-wide">Notes</p>
                      <p className="text-sm text-graphite">
                        {barrel.notes ? (barrel.notes.length > 160 ? `${barrel.notes.slice(0, 160)}…` : barrel.notes) : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )})}
          </div>
        )}
      </div>
    </div>
  )
}
