"use client"

import { RumCaneSpiritBatch, SubstrateEntry, FermentationReading } from "@/types/production-schemas"

interface FermentationSectionProps {
  batch: RumCaneSpiritBatch
  updateField: <K extends keyof RumCaneSpiritBatch>(field: K, value: RumCaneSpiritBatch[K]) => void
}

export function FermentationSection({ batch, updateField }: FermentationSectionProps) {

  // Helper functions for formatting inputs
  /**
   * Format pH: Type digits → xx.x format (e.g., 104 → 10.4, 125 → 12.5)
   * Max: 14.0 (pH scale limit)
   * Rule: Last digit becomes decimal (like ABV/Temperature)
   * Limit: Max 3 digits (prevents infinite input)
   */
  const formatPH = (value: string): string => {
    const digits = value.replace(/\D/g, '')
    if (digits.length === 0) return ''

    // Limit to max 3 digits (e.g., 104 → 10.4, 125 → 12.5)
    const limitedDigits = digits.slice(0, 3)

    let formatted = ''
    if (limitedDigits.length <= 2) {
      // 1-2 digits: show as-is (e.g., 1 → 1, 10 → 10)
      formatted = limitedDigits
    } else {
      // 3 digits: last digit becomes decimal (e.g., 104 → 10.4, 125 → 12.5)
      const intPart = limitedDigits.slice(0, -1)
      const decPart = limitedDigits.slice(-1)
      formatted = `${intPart}.${decPart}`
    }

    // Clamp to max AFTER formatting
    const num = parseFloat(formatted)
    if (!isNaN(num) && num > 14.0) return '14.0'

    return formatted
  }

  // Brix/Temperature: Type 3 digits → xx.x (e.g., 223 → 22.3)
  const formatDecimal = (value: string): string => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 2) return digits
    // 3+ digits → last digit is decimal
    const intPart = digits.slice(0, -1)
    const decPart = digits.slice(-1)
    return `${intPart}.${decPart}`
  }

  // Parse to number for storage (returns undefined if empty)
  const parseToNumber = (value: string): number | undefined => {
    if (value === '') return undefined
    const num = parseFloat(value)
    return isNaN(num) ? undefined : num
  }

  /**
   * Validate on blur - format to fixed decimals and clamp to max
   * @param decimals - Number of decimal places (1 for Temp, 2 for pH/Brix)
   */
  const validateOnBlur = (value: string, max: number, decimals: number = 2): string => {
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

  // Helper to update substrate entries
  const updateSubstrate = <K extends keyof SubstrateEntry>(index: number, field: K, value: SubstrateEntry[K]) => {
    const newSubstrates = [...(batch.substrates ?? [])]
    newSubstrates[index] = { ...newSubstrates[index], [field]: value }
    updateField('substrates', newSubstrates)
  }

  const addSubstrate = () => {
    updateField('substrates', [
      ...(batch.substrates ?? []),
      { name: '', volume_l: 0 }
    ])
  }

  const removeSubstrate = (index: number) => {
    updateField('substrates', (batch.substrates ?? []).filter((_, i) => i !== index))
  }

  // Helper to update fermentation readings
  const updateReading = <K extends keyof FermentationReading>(index: number, field: K, value: FermentationReading[K]) => {
    const newReadings = [...(batch.fermentation_readings ?? [])]
    newReadings[index] = { ...newReadings[index], [field]: value }
    updateField('fermentation_readings', newReadings)
  }

  // Initialize readings if empty (24h, 48h, 72h, 96h, 120h)
  const initializeReadings = () => {
    if ((batch.fermentation_readings ?? []).length === 0) {
      updateField('fermentation_readings', [
        { hours: 24 },
        { hours: 48 },
        { hours: 72 },
        { hours: 96 },
        { hours: 120 }
      ])
    }
  }



  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-stone-900 mb-6">Fermentation</h2>
        <p className="text-sm text-stone-600 mb-6">
          Track all fermentation parameters from start to finish. All fields can be left blank if data is not available.
        </p>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Batch Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={batch.batch_name ?? ''}
            onChange={(e) => updateField('batch_name', e.target.value)}
            placeholder="e.g., RUM-2025-001"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
          <p className="text-xs text-stone-500 mt-1">
            This name will follow through all phases
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={batch.fermentation_date ?? ''}
            onChange={(e) => updateField('fermentation_date', e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Day
          </label>
          <input
            type="number"
            value={batch.fermentation_day ?? ''}
            onChange={(e) => updateField('fermentation_day', parseInt(e.target.value) || undefined)}
            placeholder="1"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>
      </div>

      {/* Substrates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-stone-700">
            Substrate(s) Added
          </label>
          <button
            onClick={addSubstrate}
            className="px-3 py-1 text-xs text-amber-700 border border-amber-700 rounded-md hover:bg-amber-50"
          >
            + Add Substrate
          </button>
        </div>
        <p className="text-xs text-stone-500 mb-3">
          You can add multiple substrates (e.g., 500L cane juice + 200L molasses)
        </p>

        <div className="space-y-3">
          {(batch.substrates ?? []).map((substrate, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-5">
                <label className="block text-xs text-stone-600 mb-1">Substrate Name</label>
                <input
                  type="text"
                  value={substrate.name}
                  onChange={(e) => updateSubstrate(index, 'name', e.target.value)}
                  placeholder="e.g., Cane Juice, Molasses"
                  className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs text-stone-600 mb-1">Batch / Year</label>
                <input
                  type="text"
                  value={substrate.batch_or_year ?? ''}
                  onChange={(e) => updateSubstrate(index, 'batch_or_year', e.target.value)}
                  placeholder="2025"
                  className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs text-stone-600 mb-1">Volume (L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={substrate.volume_l}
                  onChange={(e) => updateSubstrate(index, 'volume_l', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm"
                />
              </div>
              <div className="col-span-1">
                <button
                  onClick={() => removeSubstrate(index)}
                  className="w-full px-2 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        {(batch.substrates ?? []).length === 0 && (
          <div className="border border-dashed border-stone-300 rounded-lg p-6 text-center text-sm text-stone-500">
            No substrates added yet. Click &quot;+ Add Substrate&quot; to add one.
          </div>
        )}

        <div className="mt-3 bg-stone-50 p-3 rounded-lg">
          <p className="text-sm text-stone-700">
            <span className="font-medium">Total Substrate Volume:</span>{' '}
            {(batch.substrates ?? []).reduce((sum, s) => sum + toNum(s.volume_l), 0).toFixed(1)} L
          </p>
        </div>
      </div>

      {/* Water */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Water Volume Added (L)
          </label>
          <input
            type="number"
            step="0.1"
            value={batch.water_volume_l ?? ''}
            onChange={(e) => updateField('water_volume_l', parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>
      </div>

      {/* Dunder */}
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Dunder Batch
          </label>
          <input
            type="text"
            value={batch.dunder_batch ?? ''}
            onChange={(e) => updateField('dunder_batch', e.target.value)}
            placeholder="e.g., DUNDER-001"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Dunder Volume (L)
          </label>
          <input
            type="number"
            step="0.1"
            value={batch.dunder_volume_l ?? ''}
            onChange={(e) => updateField('dunder_volume_l', parseFloat(e.target.value) || undefined)}
            placeholder="0"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Dunder pH
          </label>
          <input
            type="text"
            value={batch.dunder_ph ?? ''}
            onChange={(e) => {
              const formatted = formatPH(e.target.value)
              updateField('dunder_ph', formatted ? parseFloat(formatted) : undefined)
            }}
            onBlur={(e) => {
              const validated = validateOnBlur(e.target.value, 14, 2)
              updateField('dunder_ph', parseToNumber(validated))
            }}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>
      </div>

      {/* Initial Conditions */}
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Initial Brix
          </label>
          <input
            type="text"
            value={batch.initial_brix ?? ''}
            onChange={(e) => {
              const formatted = formatDecimal(e.target.value)
              updateField('initial_brix', formatted ? parseFloat(formatted) : 0)
            }}
            onBlur={(e) => {
              const validated = validateOnBlur(e.target.value, 40)
              updateField('initial_brix', (parseToNumber(validated) ?? 0))
            }}
            placeholder="0.0"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Initial pH
          </label>
          <input
            type="text"
            value={batch.initial_ph ?? ''}
            onChange={(e) => {
              const formatted = formatPH(e.target.value)
              updateField('initial_ph', formatted ? parseFloat(formatted) : 0)
            }}
            onBlur={(e) => {
              const validated = validateOnBlur(e.target.value, 14, 2)
              updateField('initial_ph', (parseToNumber(validated) ?? 0))
            }}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Initial Temperature (°C)
          </label>
          <input
            type="text"
            value={batch.initial_temperature_c ?? ''}
            onChange={(e) => {
              const formatted = formatDecimal(e.target.value)
              updateField('initial_temperature_c', formatted ? parseFloat(formatted) : undefined)
            }}
            onBlur={(e) => {
              const validated = validateOnBlur(e.target.value, 99.9, 1)
              updateField('initial_temperature_c', parseToNumber(validated))
            }}
            placeholder="0.0"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>
      </div>

      {/* Temperature Control */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Temperature Control Settings
        </label>
        <input
          type="text"
          value={batch.temperature_control_settings ?? ''}
          onChange={(e) => updateField('temperature_control_settings', e.target.value)}
          placeholder="e.g., 28-30°C"
          className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
        />
      </div>

      {/* Yeast */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Yeast</h3>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Yeast Type
            </label>
            <input
              type="text"
              value={batch.yeast_type ?? ''}
              onChange={(e) => updateField('yeast_type', e.target.value)}
              placeholder="e.g., SafSpirit M-1"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Yeast Mass Added (g)
            </label>
            <input
              type="number"
              step="0.1"
              value={batch.yeast_mass_g ?? ''}
              onChange={(e) => updateField('yeast_mass_g', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Yeast Rehydration Temperature (°C)
            </label>
          <input
            type="text"
            value={batch.yeast_rehydration_temperature_c ?? ''}
            onChange={(e) => {
              const formatted = formatDecimal(e.target.value)
              updateField('yeast_rehydration_temperature_c', formatted ? parseFloat(formatted) : undefined)
            }}
            onBlur={(e) => {
              const validated = validateOnBlur(e.target.value, 99.9, 1)
              updateField('yeast_rehydration_temperature_c', parseToNumber(validated))
            }}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Yeast Rehydration Time (min)
            </label>
            <input
              type="number"
              step="1"
              value={batch.yeast_rehydration_time_min ?? ''}
              onChange={(e) => updateField('yeast_rehydration_time_min', parseInt(e.target.value) || undefined)}
              placeholder="0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>
        </div>
      </div>

      {/* Chemicals & Nutrients */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Chemicals & Nutrients</h3>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Chems Added
            </label>
            <input
              type="text"
              value={batch.chems_added ?? ''}
              onChange={(e) => updateField('chems_added', e.target.value)}
              placeholder="e.g., Citric Acid 50g"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Nutrients Added
            </label>
            <input
              type="text"
              value={batch.nutrients_added ?? ''}
              onChange={(e) => updateField('nutrients_added', e.target.value)}
              placeholder="e.g., DAP 100g, Fermaid 50g"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>
        </div>
      </div>

      {/* Fermentation Monitoring */}
      <div className="border-t border-stone-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-stone-900">Fermentation Monitoring</h3>
          <button
            onClick={initializeReadings}
            className="px-3 py-1 text-xs text-amber-700 border border-amber-700 rounded-md hover:bg-amber-50"
          >
            Initialize Readings (24h, 48h, 72h, 96h, 120h)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-stone-100">
                <th className="border border-stone-300 px-3 py-2 text-left">Time</th>
                <th className="border border-stone-300 px-3 py-2 text-left">Temperature (°C)</th>
                <th className="border border-stone-300 px-3 py-2 text-left">Brix</th>
                <th className="border border-stone-300 px-3 py-2 text-left">pH</th>
              </tr>
            </thead>
            <tbody>
              {(batch.fermentation_readings ?? []).map((reading, index) => (
                <tr key={index}>
                  <td className="border border-stone-300 px-3 py-2 font-medium">{reading.hours}h</td>
                  <td className="border border-stone-300 px-3 py-2">
                    <input
                      type="text"
                      value={reading.temperature_c ?? ''}
                      onChange={(e) => {
                        const formatted = formatDecimal(e.target.value)
                        updateReading(index, 'temperature_c', formatted ? parseFloat(formatted) : undefined)
                      }}
                      onBlur={(e) => {
                        const validated = validateOnBlur(e.target.value, 99.9, 1)
                        updateReading(index, 'temperature_c', parseToNumber(validated))
                      }}
                      placeholder="0.0"
                      className="w-full px-2 py-1 border border-stone-200 rounded"
                    />
                  </td>
                  <td className="border border-stone-300 px-3 py-2">
                    <input
                      type="text"
                      value={reading.brix ?? ''}
                      onChange={(e) => {
                        const formatted = formatDecimal(e.target.value)
                        updateReading(index, 'brix', formatted ? parseFloat(formatted) : undefined)
                      }}
                      onBlur={(e) => {
                        const validated = validateOnBlur(e.target.value, 40)
                        updateReading(index, 'brix', parseToNumber(validated))
                      }}
                      placeholder="0.0"
                      className="w-full px-2 py-1 border border-stone-200 rounded"
                    />
                  </td>
                  <td className="border border-stone-300 px-3 py-2">
                    <input
                      type="text"
                      value={reading.ph ?? ''}
                      onChange={(e) => {
                        const formatted = formatPH(e.target.value)
                        updateReading(index, 'ph', formatted ? parseFloat(formatted) : undefined)
                      }}
                      onBlur={(e) => {
                        const validated = validateOnBlur(e.target.value, 14, 2)
                        updateReading(index, 'ph', parseToNumber(validated))
                      }}
                      placeholder="0.00"
                      className="w-full px-2 py-1 border border-stone-200 rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(batch.fermentation_readings ?? []).length === 0 && (
          <div className="border border-dashed border-stone-300 rounded-lg p-6 text-center text-sm text-stone-500">
            No readings yet. Click &quot;Initialize Readings&quot; to add monitoring points.
          </div>
        )}
      </div>

      {/* Final Fermentation */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Final Fermentation</h3>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Final Brix
            </label>
          <input
            type="text"
            value={batch.final_brix ?? ''}
            onChange={(e) => {
              const formatted = formatDecimal(e.target.value)
              updateField('final_brix', formatted ? parseFloat(formatted) : 0)
            }}
            onBlur={(e) => {
              const validated = validateOnBlur(e.target.value, 40)
              updateField('final_brix', (parseToNumber(validated) ?? 0))
            }}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Final pH
            </label>
          <input
            type="text"
            value={batch.final_ph ?? ''}
            onChange={(e) => {
              const formatted = formatPH(e.target.value)
              updateField('final_ph', formatted ? parseFloat(formatted) : 0)
            }}
            onBlur={(e) => {
              const validated = validateOnBlur(e.target.value, 14, 2)
              updateField('final_ph', (parseToNumber(validated) ?? 0))
            }}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

        </div>
      </div>
    </div>
  )
}
