'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { BarrelService } from '@/modules/barrels/services/barrel.service'
import type { Barrel, UpdateBarrelData } from '@/modules/barrels/types/barrel.types'

export default function EditBarrelPage() {
  const router = useRouter()
  const params = useParams()
  const barrelId = params.id as string
  
  const [barrel, setBarrel] = useState<Barrel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<UpdateBarrelData>({})

  useEffect(() => {
    loadBarrel()
  }, [barrelId])

  const loadBarrel = async () => {
    try {
      const service = new BarrelService()
      const data = await service.getBarrelById(barrelId)
      if (!data) {
        setError('Barrel not found')
      } else {
        setBarrel(data)
        // Initialize form with current values
        setFormData({
          spiritType: data.spiritType,
          barrelType: data.barrelType,
          fillDate: data.fillDate,
          location: data.location,
          currentVolume: data.currentVolume,
          originalVolume: data.originalVolume,
          abv: data.abv,
          prevSpirit: data.prevSpirit,
          notes: data.notes,
          status: data.status,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load barrel')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const service = new BarrelService()
      await service.updateBarrel(barrelId, formData)
      router.push(`/dashboard/barrels/${barrelId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update barrel')
      setIsSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'currentVolume' || name === 'originalVolume' || name === 'abv'
        ? parseFloat(value) || 0
        : value
    }))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading barrel...</div>
      </div>
    )
  }

  if (error && !barrel) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
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

  if (!barrel) return null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Barrel {barrel.barrelNumber}</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update the barrel information below.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-sm rounded-lg p-6">
        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="Aging">Aging</option>
            <option value="Ready">Ready</option>
            <option value="Emptied">Emptied</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Testing">Testing</option>
          </select>
        </div>

        {/* Spirit Type */}
        <div>
          <label htmlFor="spiritType" className="block text-sm font-medium text-gray-700">
            Spirit Type
          </label>
          <select
            id="spiritType"
            name="spiritType"
            value={formData.spiritType}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="Whiskey">Whiskey</option>
            <option value="Bourbon">Bourbon</option>
            <option value="Rye">Rye</option>
            <option value="Rum">Rum</option>
            <option value="Gin">Gin</option>
            <option value="Vodka">Vodka</option>
            <option value="Brandy">Brandy</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Barrel Type */}
        <div>
          <label htmlFor="barrelType" className="block text-sm font-medium text-gray-700">
            Barrel Type
          </label>
          <select
            id="barrelType"
            name="barrelType"
            value={formData.barrelType}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="Ex-Bourbon">Ex-Bourbon</option>
            <option value="Virgin Oak">Virgin Oak</option>
            <option value="Ex-Sherry">Ex-Sherry</option>
            <option value="Ex-Port">Ex-Port</option>
            <option value="Stainless Steel">Stainless Steel</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Warehouse A, Rack 3"
          />
        </div>

        {/* Volume and ABV */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="originalVolume" className="block text-sm font-medium text-gray-700">
              Original Volume (L)
            </label>
            <input
              type="number"
              id="originalVolume"
              name="originalVolume"
              step="0.1"
              value={formData.originalVolume}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="currentVolume" className="block text-sm font-medium text-gray-700">
              Current Volume (L)
            </label>
            <input
              type="number"
              id="currentVolume"
              name="currentVolume"
              step="0.1"
              value={formData.currentVolume}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="abv" className="block text-sm font-medium text-gray-700">
              ABV (%)
            </label>
            <input
              type="number"
              id="abv"
              name="abv"
              step="0.1"
              min="0"
              max="100"
              value={formData.abv}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Fill Date */}
        <div>
          <label htmlFor="fillDate" className="block text-sm font-medium text-gray-700">
            Fill Date
          </label>
          <input
            type="date"
            id="fillDate"
            name="fillDate"
            value={formData.fillDate}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Previous Spirit */}
        <div>
          <label htmlFor="prevSpirit" className="block text-sm font-medium text-gray-700">
            Previous Spirit (if re-used barrel)
          </label>
          <input
            type="text"
            id="prevSpirit"
            name="prevSpirit"
            value={formData.prevSpirit || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Bourbon, Sherry, Port"
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Any additional notes about this barrel..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            href={`/dashboard/barrels/${barrelId}`}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}