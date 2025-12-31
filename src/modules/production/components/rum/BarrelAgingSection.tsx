"use client"

import { RumCaneSpiritBatch } from "@/types/production-schemas"

interface BarrelAgingSectionProps {
  batch: RumCaneSpiritBatch
  updateField: <K extends keyof RumCaneSpiritBatch>(field: K, value: RumCaneSpiritBatch[K]) => void
}

export function BarrelAgingSection({ batch, updateField }: BarrelAgingSectionProps) {

  // Helper functions for formatting inputs
 

  // Parse to number for storage
  const parseToNumber = (value: string): number | undefined => {
    if (value === '') return undefined
    const num = parseFloat(value)
    return isNaN(num) ? undefined : num
  }

  // Validate on blur - format to fixed decimals and clamp to max
  const validateOnBlur = (value: string, max: number, decimals: number = 1): string => {
    if (value === '') return ''
    const num = parseFloat(value)
    if (isNaN(num)) return ''
    return Math.min(num, max).toFixed(decimals)
  }

  // Helper to safely convert to number for display (handles string, number, undefined, null)
  const toNum = (value: string | number | undefined | null): number => {
    if (value === undefined || value === null || value === '') return 0
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? 0 : parsed
    }
    return value
  }

  // Calculate LAL helper
  const calculateLAL = (volume: number, abv: number): number => {
    return volume * abv * 0.01
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-stone-900 mb-6">Barrel Aging</h2>
        <p className="text-sm text-stone-600 mb-6">
          Track barrel aging details. Final ABV and Volume from distillation are used here.
        </p>
      </div>

      {/* Batch Tracking */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Batch Tracking</h3>

        <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Batch Name
          </label>
          <input
            type="text"
            value={batch.batch_name ?? ''}
            disabled
            className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-stone-900"
          />
          <p className="text-xs text-blue-700 mt-1">
            Tracked from fermentation through all phases. All data is available in the tabs above.
          </p>
        </div>
      </div>

      {/* Fill Details from Distillation */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Fill Details (from Distillation)</h3>
        
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Final ABV (%)
            </label>
            <input
              type="text"
              value={batch.fill_abv_percent ?? batch.final_abv_after_dilution_percent ?? ''}
              onChange={(e) => updateField('fill_abv_percent', parseToNumber(e.target.value))}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 95.0, 1)
                const abv = parseToNumber(validated)
                updateField('fill_abv_percent', abv)
                const vol = batch.volume_filled_l ?? batch.final_volume_after_dilution_l
                if (abv !== undefined && vol !== undefined) {
                  updateField('lal_filled', calculateLAL(vol, abv))
                }
              }}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
            <p className="text-xs text-stone-500 mt-1">
              From dilution section or enter manually
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Final Volume (L)
            </label>
            <input
              type="text"
              value={batch.volume_filled_l ?? batch.final_volume_after_dilution_l ?? ''}
              onChange={(e) => updateField('volume_filled_l', parseToNumber(e.target.value))}
              onBlur={(e) => {
                const vol = parseToNumber(e.target.value)
                updateField('volume_filled_l', vol)
                const abv = batch.fill_abv_percent ?? batch.final_abv_after_dilution_percent
                if (vol !== undefined && abv !== undefined) {
                  updateField('lal_filled', calculateLAL(vol, abv))
                }
              }}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
            <p className="text-xs text-stone-500 mt-1">
              From dilution section or enter manually
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              LAL Filled
            </label>
            <input
              type="number"
              step="0.01"
              value={batch.lal_filled ?? ''}
              readOnly
              className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-stone-600"
            />
            <p className="text-xs text-stone-500 mt-1">
              Auto-calculated
            </p>
          </div>
        </div>
      </div>

      {/* Cask Information */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Cask Information</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Fill Date
            </label>
            <input
              type="date"
              value={batch.fill_date ?? ''}
              onChange={(e) => updateField('fill_date', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Cask Number
            </label>
            <input
              type="text"
              value={batch.cask_number ?? ''}
              onChange={(e) => updateField('cask_number', e.target.value)}
              placeholder="e.g., CASK-001"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Cask Type
            </label>
            <input
              type="text"
              value={batch.cask_type ?? ''}
              onChange={(e) => updateField('cask_type', e.target.value)}
              placeholder="e.g., Ex-Bourbon, Ex-Sherry"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Cask Size (L)
            </label>
            <input
              type="number"
              step="1"
              value={batch.cask_size_l ?? ''}
              onChange={(e) => updateField('cask_size_l', parseInt(e.target.value) || undefined)}
              placeholder="0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Maturation Location
            </label>
            <input
              type="text"
              value={batch.maturation_location ?? ''}
              onChange={(e) => updateField('maturation_location', e.target.value)}
              placeholder="e.g., Warehouse A, Rack 3"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Expected Bottling Date
            </label>
            <input
              type="date"
              value={batch.expected_bottling_date ?? ''}
              onChange={(e) => updateField('expected_bottling_date', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="border-t border-stone-200 pt-6">
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Barrel Aging Notes
        </label>
        <textarea
          value={batch.barrel_aging_notes ?? ''}
          onChange={(e) => updateField('barrel_aging_notes', e.target.value)}
          rows={4}
          placeholder="Any notes about the barrel aging process..."
          className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
        />
      </div>

      {/* Summary */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Barrel Aging Summary</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-800 mb-1">Cask</p>
            <p className="text-lg font-semibold text-amber-900">
              {batch.cask_number ?? 'Not assigned'}
            </p>
            <p className="text-xs text-amber-700">
              {batch.cask_type ?? 'Type not specified'}
            </p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-800 mb-1">Fill Details</p>
            <p className="text-lg font-semibold text-amber-900">
              {toNum(batch.volume_filled_l ?? batch.final_volume_after_dilution_l).toFixed(1)} L
            </p>
            <p className="text-xs text-amber-700">
              @ {toNum(batch.fill_abv_percent ?? batch.final_abv_after_dilution_percent).toFixed(1)}% ABV
            </p>
            <p className="text-xs text-amber-700">
              {toNum(batch.lal_filled).toFixed(2)} LAL
            </p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-800 mb-1">Timeline</p>
            <p className="text-sm text-amber-900">
              <span className="font-medium">Filled:</span>{' '}
              {batch.fill_date ? new Date(batch.fill_date).toLocaleDateString('en-AU') : 'Not set'}
            </p>
            <p className="text-sm text-amber-900">
              <span className="font-medium">Expected:</span>{' '}
              {batch.expected_bottling_date ? new Date(batch.expected_bottling_date).toLocaleDateString('en-AU') : 'Not set'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
