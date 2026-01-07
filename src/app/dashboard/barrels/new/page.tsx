'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { CreateBarrelData } from '@/modules/barrels/types/barrel.types'
import { createClient } from '@/lib/supabase/client'
import type { Tank } from '@/modules/production/types/tank.types'

function NewBarrelContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const USE_STATIC = ['1','true','yes'].includes((process.env.NEXT_PUBLIC_USE_STATIC_DATA || '').toLowerCase())
  const [sourceTank, setSourceTank] = useState<Tank | null>(null)
  
  // Generate a default barrel number based on date and random suffix
  const generateBarrelNumber = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `B${year}${month}-${random}`
  }

  const [formData, setFormData] = useState<CreateBarrelData>({
    barrelNumber: generateBarrelNumber(),
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

  useEffect(() => {
    const product = searchParams?.get('product') || ''
    const abv = parseFloat(searchParams?.get('abv') || '') || 0
    const volume = parseFloat(searchParams?.get('volume') || '') || 0
    const location = searchParams?.get('location') || ''
    const tankId = searchParams?.get('tankId') || ''
    if (product || abv || volume || location || tankId) {
      setFormData(prev => ({
        ...prev,
        spiritType: product || prev.spiritType,
        abv: abv || prev.abv,
        currentVolume: volume || prev.currentVolume,
        originalVolume: volume || prev.originalVolume,
        location: location || prev.location,
        notes: tankId ? `From tank ${tankId}` : prev.notes
      }))
    }
    if (tankId && !USE_STATIC) {
      ;(async () => {
        const { data } = await supabase
          .from('tanks')
          .select('*')
          .eq('tank_id', tankId)
          .single()
        if (data) setSourceTank(data as Tank)
      })()
    }
  }, [searchParams])

  useEffect(() => {
    const map: Record<string, string> = {
      'Ex-Bourbon': '200L',
      'Virgin Oak': '200L',
      'Ex-Sherry': '250L',
      'Ex-Port': '225L',
      'Stainless Steel': '200L'
    }
    const target = map[formData.barrelType]
    if (target) {
      setFormData(prev => ({
        ...prev,
        barrelSize: target,
        currentVolume: Math.min(prev.currentVolume || 0, parseFloat(target))
      }))
    }
  }, [formData.barrelType])

  const capacityL = parseFloat(formData.barrelSize) || 0
  const availableTank = ((sourceTank?.current_volume_l ?? sourceTank?.volume ?? 0) as number) || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (sourceTank) {
        const available = Number(sourceTank.current_volume_l ?? sourceTank.volume ?? 0)
        const transferVol = Number(formData.currentVolume || 0)
        if (transferVol > available) {
          setError(`Transfer exceeds tank volume. Available: ${available}L, Requested: ${transferVol}L`)
          setIsLoading(false)
          return
        }
      }
      const sizeStr = formData.barrelSize || ''
      const capacityMatch = sizeStr.match(/(\d+)\s*L/i)
      const capacityL = capacityMatch ? parseFloat(capacityMatch[1]) : undefined
      if (capacityL && formData.currentVolume > capacityL) {
        setError(`Barrel capacity exceeded. Capacity: ${capacityL}L, Requested: ${formData.currentVolume}L`)
        setIsLoading(false)
        return
      }
      const res = await fetch('/api/barrels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || 'Failed to create barrel')
      }
      const created = await res.json()

      const tankId = searchParams?.get('tankId') || ''
      if (tankId && !USE_STATIC) {
        const { data: tank, error: tankErr } = await supabase
          .from('tanks')
          .select('*')
          .eq('tank_id', tankId)
          .single()
        if (!tankErr && tank) {
          const prevVol = Number(tank.current_volume_l ?? tank.volume ?? 0)
          const transferVol = Number(formData.currentVolume || 0)
          const remaining = Math.max(prevVol - transferVol, 0)
          const newStatus = remaining <= 0 ? 'empty' : 'holding'
          const updates = {
            current_volume_l: remaining,
            status: newStatus,
            last_updated_by: 'Barreling'
          }
          const { error: updErr } = await supabase
            .from('tanks')
            .update(updates)
            .eq('id', tank.id)
          if (!updErr) {
            await supabase
              .from('tank_history')
              .insert({
                organization_id: tank.organization_id,
                tank_id: tank.id,
                action: 'Transferred to barrel',
                user_name: 'Barreling',
                previous_values: {
                  tank_name: tank.tank_name,
                  capacity_l: tank.capacity_l,
                  product: tank.product,
                  current_abv: tank.current_abv,
                  current_volume_l: tank.current_volume_l,
                  status: tank.status,
                  notes: tank.notes
                },
                new_values: updates,
                notes: `Barrel ${formData.barrelNumber}`
              })
          }
        }
      }
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
        {sourceTank && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="text-sm text-amber-700">
              Source tank {sourceTank.tank_id} has {(sourceTank.current_volume_l ?? sourceTank.volume ?? 0) || 0} L at {(sourceTank.current_abv ?? sourceTank.abv ?? 0) || 0}% ABV.
            </div>
            <div className="text-xs text-amber-800 mt-1">
              After transfer of {formData.currentVolume} L, remaining will be {Math.max(((sourceTank.current_volume_l ?? sourceTank.volume ?? 0) || 0) - (formData.currentVolume || 0), 0)} L.
            </div>
          </div>
        )}
        {/* Barrel Identification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="barrelNumber" className="block text-sm font-medium text-gray-700">
              Barrel Number *
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="barrelNumber"
                name="barrelNumber"
                required
                value={formData.barrelNumber}
                onChange={handleChange}
                className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., B001"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, barrelNumber: generateBarrelNumber() }))}
                className="ml-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                title="Generate new number"
              >
                ↻
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Auto-generated or enter your own tracking number
            </p>
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
            <div className="mt-2 flex items-center gap-3">
              <span className="text-xs text-gray-600">Capacity: {capacityL} L</span>
              {sourceTank && (
                <span className="text-xs text-gray-600">Available in tank: {availableTank} L</span>
              )}
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, currentVolume: Math.min(capacityL || 0, availableTank || 0), originalVolume: Math.min(capacityL || 0, availableTank || 0) }))}
                className="px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Fill to Capacity
              </button>
            </div>
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

export default function NewBarrelPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-600">Loading...</div>}>
      <NewBarrelContent />
    </Suspense>
  )
}
