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
        <h1 className="text-2xl font-bold text-gray-900">Barrel Tracking</h1>
        <Link
          href="/dashboard/barrels/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add Barrel
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Barrels
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.totalBarrels}
              </dd>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Active Barrels
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.activeBarrels}
              </dd>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Volume (L)
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.totalVolume.toFixed(1)}
              </dd>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Avg Age (days)
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.averageAge}
              </dd>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['all', 'Aging', 'Ready', 'Emptied', 'Maintenance', 'Testing'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`
                whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
                ${filter === status
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {status === 'all' ? 'All Barrels' : status}
              {stats && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {status === 'all' 
                    ? stats.totalBarrels 
                    : stats.byStatus[status as keyof typeof stats.byStatus] || 0}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Barrels Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading barrels...</div>
        ) : barrels.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No barrels found. 
            <Link href="/dashboard/barrels/new" className="text-blue-600 hover:text-blue-800 ml-1">
              Add your first barrel
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {barrels.map((barrel) => (
              <li key={barrel.id}>
                <Link
                  href={`/dashboard/barrels/${barrel.id}`}
                  className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`
                          h-10 w-10 rounded-full flex items-center justify-center text-white font-bold
                          ${barrel.status === 'Aging' ? 'bg-green-500' :
                            barrel.status === 'Ready' ? 'bg-blue-500' :
                            barrel.status === 'Emptied' ? 'bg-gray-500' :
                            barrel.status === 'Maintenance' ? 'bg-yellow-500' :
                            'bg-purple-500'}
                        `}>
                          {barrel.barrelNumber.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {barrel.barrelNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {barrel.spiritType} • {barrel.barrelType} • {barrel.barrelSize}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-900">
                          {barrel.currentVolume}L / {barrel.originalVolume}L
                        </div>
                        <div className="text-sm text-gray-500">
                          {barrel.abv}% ABV
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-900">
                          {barrel.location}
                        </div>
                        <div className="text-sm text-gray-500">
                          Filled {new Date(barrel.fillDate).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${barrel.status === 'Aging' ? 'bg-green-100 text-green-800' :
                          barrel.status === 'Ready' ? 'bg-blue-100 text-blue-800' :
                          barrel.status === 'Emptied' ? 'bg-gray-100 text-gray-800' :
                          barrel.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-purple-100 text-purple-800'}
                      `}>
                        {barrel.status}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}