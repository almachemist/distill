'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarrelService } from '@/modules/barrels/services/barrel.service'
import type { Barrel, BarrelStats } from '@/modules/barrels/types/barrel.types'

export default function BarrelsPage() {
  const [barrels, setBarrels] = useState<Barrel[]>([])
  const [stats, setStats] = useState<BarrelStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadBarrels()
  }, [filter])

  const loadBarrels = async () => {
    setIsLoading(true)
    const service = new BarrelService()
    
    try {
      const filterOptions = filter === 'all' ? undefined : { status: filter as Barrel['status'] }
      const [barrelsData, statsData] = await Promise.all([
        service.getBarrels(filterOptions),
        service.getBarrelStats()
      ])
      
      setBarrels(barrelsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading barrels:', error)
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
          {['all', 'Aging', 'Ready', 'Emptied', 'Maintenance', 'Testing'].map((status) => (
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
                    : stats.byStatus[status as keyof typeof stats.byStatus] || 0}
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
            {barrels.map((barrel) => (
              <Link key={barrel.id} href={`/dashboard/barrels/${barrel.id}`} className="block">
                <div className="bg-white rounded-xl border border-copper-20 shadow-sm hover:shadow-md transition">
                  <div className="px-5 py-4 border-b border-copper-15 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`
                        h-10 w-10 rounded-full flex items-center justify-center text-white font-bold
                        ${barrel.status === 'Aging' ? 'bg-copper' :
                          barrel.status === 'Ready' ? 'bg-graphite' :
                          barrel.status === 'Emptied' ? 'bg-beige text-graphite' :
                          barrel.status === 'Maintenance' ? 'bg-copper-amber' :
                          'bg-copper-red'}
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
                      ${barrel.status === 'Aging' ? 'bg-copper-10 text-graphite border border-copper-30' :
                        barrel.status === 'Ready' ? 'bg-graphite text-white' :
                        barrel.status === 'Emptied' ? 'bg-beige text-graphite border border-copper-30' :
                        barrel.status === 'Maintenance' ? 'bg-copper-20 text-graphite border border-copper-30' :
                        'bg-copper-red text-white'}
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
                        {barrel.fillDate ? new Date(barrel.fillDate).toLocaleDateString() : '—'}
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
                        {barrel.fillDate ? Math.floor((Date.now() - new Date(barrel.fillDate).getTime()) / (1000 * 60 * 60 * 24)) : '—'}
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
