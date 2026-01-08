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
      const data = json?.barrel || null
      if (!data) setError('Barrel not found')
      else setBarrel(data)
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

  const calculateAge = (fillDate: string) => {
    const fill = new Date(fillDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - fill.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return `${diffDays} days`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months > 1 ? 's' : ''}`
    } else {
      const years = Math.floor(diffDays / 365)
      const months = Math.floor((diffDays % 365) / 30)
      return `${years} year${years > 1 ? 's' : ''}${months > 0 ? ` ${months} month${months > 1 ? 's' : ''}` : ''}`
    }
  }

  const calculateAngelsShare = (originalVolume: number, currentVolume: number) => {
    const loss = originalVolume - currentVolume
    const percentage = (loss / originalVolume) * 100
    return {
      loss: loss.toFixed(1),
      percentage: percentage.toFixed(1)
    }
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Link
              href="/dashboard/barrels"
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Barrel {barrel.barrelNumber}
          </h1>
          <p className="mt-2 text-gray-600">
            {barrel.spiritType} • {calculateAge(barrel.fillDate)} old
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Link
            href={`/dashboard/barrels/${barrelId}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
          barrel.status === 'Aging' ? 'bg-green-100 text-green-800' :
          barrel.status === 'Ready' ? 'bg-blue-100 text-blue-800' :
          barrel.status === 'Emptied' ? 'bg-gray-100 text-gray-800' :
          barrel.status === 'Testing' ? 'bg-yellow-100 text-yellow-800' :
          'bg-orange-100 text-orange-800'
        }`}>
          {barrel.status}
        </span>
      </div>

      {/* Main Details Grid */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Barrel Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Barrel Type</h3>
            <p className="mt-1 text-lg">{barrel.barrelType}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Previous Spirit</h3>
            <p className="mt-1 text-lg">{barrel.prevSpirit || 'New barrel'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Location</h3>
            <p className="mt-1 text-lg">{barrel.location}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Fill Date</h3>
            <p className="mt-1 text-lg">
              {new Date(barrel.fillDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Batch</h3>
            <p className="mt-1 text-lg">{barrel.batch || '—'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Mature Date</h3>
            <p className="mt-1 text-lg">
              {barrel.dateMature ? new Date(barrel.dateMature).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : '—'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Last Inspection</h3>
            <p className="mt-1 text-lg">
              {barrel.lastInspection ? new Date(barrel.lastInspection).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Volume & ABV */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Volume & Strength</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Original Volume</h3>
            <p className="mt-1 text-lg">{barrel.originalVolume} L</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Current Volume</h3>
            <p className="mt-1 text-lg">{barrel.currentVolume} L</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Angel&apos;s Share</h3>
            <p className="mt-1 text-lg">
              {angelsShare.loss} L ({angelsShare.percentage}%)
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Current ABV</h3>
            <p className="mt-1 text-lg">{barrel.abv}%</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Proof</h3>
            <p className="mt-1 text-lg">{(barrel.abv * 2).toFixed(1)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Angel&apos;s Share (recorded)</h3>
            <p className="mt-1 text-lg">{barrel.angelsShare || '—'}</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {barrel.notes && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{barrel.notes}</p>
        </div>
      )}
      {barrel.tastingNotes && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tasting Notes</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{barrel.tastingNotes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/dashboard/barrels/${barrelId}/sample`}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Record Sample
          </Link>
          <Link
            href={`/dashboard/barrels/${barrelId}/move`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Move Location
          </Link>
          <Link
            href={`/dashboard/barrels/${barrelId}/history`}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            View History
          </Link>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-6 text-sm text-gray-500">
        <p>Created: {new Date(barrel.createdAt).toLocaleString()}</p>
        <p>Last updated: {new Date(barrel.updatedAt).toLocaleString()}</p>
      </div>
    </div>
  )
}
