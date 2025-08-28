'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarrelService } from '@/modules/barrels/services/barrel.service'
import type { CreateBarrelData } from '@/modules/barrels/types/barrel.types'

export default function NewBarrelPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<CreateBarrelData>({
    barrelNumber: '',
    spiritType: '',
    barrelType: '',
    barrelSize: '200L',
    liters: 200,
    fillDate: new Date().toISOString().split('T')[0],
    location: '',
    currentVolume: 0,
    originalVolume: 0,
    abv: 0,
    prevSpirit: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const service = new BarrelService()
      await service.createBarrel(formData)
      router.push('/dashboard/barrels')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create barrel')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'liters' || name === 'currentVolume' || name === 'originalVolume' || name === 'abv' 
        ? parseFloat(value) || 0
        : value
    }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Barrel</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter the barrel details to start tracking its aging process.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-sm rounded-lg p-6">
        {/* Barrel Identification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="barrelNumber" className="block text-sm font-medium text-gray-700">
              Barrel Number *
            </label>
            <input
              type="text"
              id="barrelNumber"
              name="barrelNumber"
              required
              value={formData.barrelNumber}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., B001"
            />
          </div>

          <div>
            <label htmlFor="spiritType" className="block text-sm font-medium text-gray-700">
              Spirit Type *
            </label>
            <select
              id="spiritType"
              name="spiritType"
              required
              value={formData.spiritType}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select spirit</option>
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
        </div>

        {/* Barrel Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="barrelType" className="block text-sm font-medium text-gray-700">
              Barrel Type *
            </label>
            <select
              id="barrelType"
              name="barrelType"
              required
              value={formData.barrelType}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select type</option>
              <option value="Ex-Bourbon">Ex-Bourbon</option>
              <option value="Virgin Oak">Virgin Oak</option>
              <option value="Ex-Sherry">Ex-Sherry</option>
              <option value="Ex-Port">Ex-Port</option>
              <option value="Stainless Steel">Stainless Steel</option>
            </select>
          </div>

          <div>
            <label htmlFor="barrelSize" className="block text-sm font-medium text-gray-700">
              Barrel Size *
            </label>
            <select
              id="barrelSize"
              name="barrelSize"
              required
              value={formData.barrelSize}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="5L">5L</option>
              <option value="10L">10L</option>
              <option value="20L">20L</option>
              <option value="50L">50L</option>
              <option value="100L">100L</option>
              <option value="200L">200L (Standard)</option>
              <option value="225L">225L (Burgundy)</option>
              <option value="250L">250L</option>
              <option value="300L">300L (Hogshead)</option>
              <option value="500L">500L (Puncheon)</option>
            </select>
          </div>
        </div>

        {/* Volume and ABV */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="originalVolume" className="block text-sm font-medium text-gray-700">
              Original Volume (L) *
            </label>
            <input
              type="number"
              id="originalVolume"
              name="originalVolume"
              required
              step="0.1"
              value={formData.originalVolume}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="190"
            />
          </div>

          <div>
            <label htmlFor="currentVolume" className="block text-sm font-medium text-gray-700">
              Current Volume (L) *
            </label>
            <input
              type="number"
              id="currentVolume"
              name="currentVolume"
              required
              step="0.1"
              value={formData.currentVolume}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="190"
            />
          </div>

          <div>
            <label htmlFor="abv" className="block text-sm font-medium text-gray-700">
              ABV (%) *
            </label>
            <input
              type="number"
              id="abv"
              name="abv"
              required
              step="0.1"
              min="0"
              max="100"
              value={formData.abv}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="62.5"
            />
          </div>
        </div>

        {/* Location and Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., Warehouse A, Rack 3"
            />
          </div>

          <div>
            <label htmlFor="fillDate" className="block text-sm font-medium text-gray-700">
              Fill Date *
            </label>
            <input
              type="date"
              id="fillDate"
              name="fillDate"
              required
              value={formData.fillDate}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Previous Spirit (optional) */}
        <div>
          <label htmlFor="prevSpirit" className="block text-sm font-medium text-gray-700">
            Previous Spirit (if re-used barrel)
          </label>
          <input
            type="text"
            id="prevSpirit"
            name="prevSpirit"
            value={formData.prevSpirit}
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
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Any additional notes about this barrel..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/barrels')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Barrel'}
          </button>
        </div>
      </form>
    </div>
  )
}