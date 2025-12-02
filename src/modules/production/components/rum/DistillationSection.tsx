"use client"

import { RumCaneSpiritBatch } from "@/types/production-schemas"

interface DistillationSectionProps {
  batch: RumCaneSpiritBatch
  updateField: <K extends keyof RumCaneSpiritBatch>(field: K, value: RumCaneSpiritBatch[K]) => void
}

export function DistillationSection({ batch, updateField }: DistillationSectionProps) {

  // ============================================================================
  // NUMERIC INPUT FORMATTERS
  // Apply digit-based formatting WITHOUT premature clamping
  // Clamp to max AFTER formatting to prevent 333 → 99.9 bug
  // ============================================================================

  /**
   * Format ABV: Type digits → ##.# format (e.g., 855 → 85.5, NOT 85.50)
   * Max: 95.0% (realistic spirit run limit)
   * Rule: Last digit becomes decimal, clamp AFTER formatting
   * Limit: Max 3 digits (prevents infinite input)
   */
  const formatABV = (value: string): string => {
    const digits = value.replace(/\D/g, '')
    if (digits.length === 0) return ''

    // Limit to max 3 digits (prevents infinite input like 999999...)
    const limitedDigits = digits.slice(0, 3)

    let formatted = ''
    if (limitedDigits.length <= 2) {
      formatted = limitedDigits
    } else {
      // Last digit becomes decimal: 855 → 85.5
      const intPart = limitedDigits.slice(0, -1)
      const decPart = limitedDigits.slice(-1)
      formatted = `${intPart}.${decPart}`
    }

    // Clamp to max AFTER formatting (not before!)
    const num = parseFloat(formatted)
    if (!isNaN(num) && num > 95.0) return '95.0'

    return formatted
  }

  /**
   * Format Temperature: Type digits → ##.# format (e.g., 333 → 33.3)
   * Max: 99.9°C
   * Rule: Last digit becomes decimal, clamp AFTER formatting
   * Limit: Max 3 digits (prevents infinite input)
   */
  const formatTemperature = (value: string): string => {
    const digits = value.replace(/\D/g, '')
    if (digits.length === 0) return ''

    // Limit to max 3 digits (prevents infinite input like 999999...)
    const limitedDigits = digits.slice(0, 3)

    let formatted = ''
    if (limitedDigits.length <= 2) {
      formatted = limitedDigits
    } else {
      // Last digit becomes decimal: 333 → 33.3
      const intPart = limitedDigits.slice(0, -1)
      const decPart = limitedDigits.slice(-1)
      formatted = `${intPart}.${decPart}`
    }

    // Clamp to max AFTER formatting (not before!)
    const num = parseFloat(formatted)
    if (!isNaN(num) && num > 99.9) return '99.9'

    return formatted
  }

  /**
   * Format Density: Type digits → x.xxx format (e.g., 0839 → 0.839)
   * Max: 2.000 (realistic density limit)
   * Rule: First digit is integer, next 3 digits are decimals
   * Limit: Max 4 digits (prevents infinite input)
   */
  const formatDensity = (value: string): string => {
    const digits = value.replace(/\D/g, '')
    if (digits.length === 0) return ''

    // Limit to max 4 digits (e.g., 0839 → 0.839)
    const limitedDigits = digits.slice(0, 4)

    let formatted = ''
    if (limitedDigits.length === 1) {
      formatted = limitedDigits
    } else {
      // First digit is integer, rest are decimals: 0839 → 0.839
      const intPart = limitedDigits.slice(0, 1)
      const decPart = limitedDigits.slice(1)
      formatted = `${intPart}.${decPart}`
    }

    // Clamp to max AFTER formatting
    const num = parseFloat(formatted)
    if (!isNaN(num) && num > 2.0) return '2.000'

    return formatted
  }

  // Parse to number for storage
  const parseToNumber = (value: string): number | undefined => {
    if (value === '') return undefined
    const num = parseFloat(value)
    return isNaN(num) ? undefined : num
  }

  /**
   * Validate on blur - format to fixed decimals and clamp to max
   * Used for final cleanup when user leaves field
   * @param decimals - Number of decimal places (1 for ABV/Temp, 2 for Volume, 3 for Density)
   */
  const validateOnBlur = (value: string, max: number, decimals: number = 1): string => {
    if (value === '') return ''
    const num = parseFloat(value)
    if (isNaN(num)) return ''
    return Math.min(num, max).toFixed(decimals)
  }

  // Auto-calculate LAL
  const calculateLAL = (volume: number, abv: number) => {
    return volume * abv * 0.01
  }

  // Helper to parse number input (returns undefined for empty string)
  const parseNumber = (value: string): number | undefined => {
    return value === '' ? undefined : parseFloat(value)
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

  // Auto-update LAL when volume or ABV changes (update all 3 fields at once)
  const updateWithLAL = (
    volumeField: keyof RumCaneSpiritBatch,
    abvField: keyof RumCaneSpiritBatch,
    lalField: keyof RumCaneSpiritBatch,
    volume: number | undefined,
    abv: number | undefined
  ) => {
    const lal = (volume && abv) ? calculateLAL(volume, abv) : undefined

    // Update all 3 fields at once to avoid multiple re-renders
    const updates = {
      [volumeField]: volume,
      [abvField]: abv,
      [lalField]: lal
    }

    Object.entries(updates).forEach(([key, value]) => {
      updateField(key as keyof RumCaneSpiritBatch, value as any)
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-stone-900 mb-6">Distillation (Double Retort - Roberta)</h2>
        <p className="text-sm text-stone-600 mb-6">
          All distillation information for the Double Retort still. Can be completed over multiple days.
        </p>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Batch Name
          </label>
          <input
            type="text"
            value={batch.batch_name ?? ''}
            disabled
            className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-stone-600"
          />
          <p className="text-xs text-stone-500 mt-1">
            From fermentation
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Distillation Date
          </label>
          <input
            type="date"
            value={batch.distillation_date ?? ''}
            onChange={(e) => updateField('distillation_date', e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>
      </div>

      {/* Boiler */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Boiler</h3>
        
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Boiler Volume (L)
            </label>
            <input
              type="text"
              value={batch.boiler_volume_l ?? ''}
              onChange={(e) => {
                // @ts-ignore - Allow string during typing, convert to number on blur
                updateField('boiler_volume_l', e.target.value)
              }}
              onBlur={(e) => {
                const vol = parseNumber(e.target.value)
                updateField('boiler_volume_l', vol)
                // Auto-calculate LAL if both volume and ABV exist
                if (vol !== undefined && batch.boiler_abv_percent !== undefined) {
                  updateField('boiler_lal', calculateLAL(vol, batch.boiler_abv_percent))
                }
              }}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Boiler ABV (%)
            </label>
            <input
              type="text"
              value={batch.boiler_abv_percent ?? ''}
              onChange={(e) => {
                // Format and limit to 3 digits max (e.g., 855 → 85.5)
                const formatted = formatABV(e.target.value)
                updateField('boiler_abv_percent', formatted ? parseFloat(formatted) : undefined)
              }}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 95.0, 1)
                const abv = parseToNumber(validated)
                updateField('boiler_abv_percent', abv)
                if (abv !== undefined && batch.boiler_volume_l !== undefined) {
                  updateField('boiler_lal', calculateLAL(batch.boiler_volume_l, abv))
                }
              }}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Boiler LAL
            </label>
            <input
              type="number"
              step="0.01"
              value={batch.boiler_lal ?? ''}
              readOnly
              className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-stone-600"
            />
            <p className="text-xs text-stone-500 mt-1">
              Auto-calculated
            </p>
          </div>
        </div>
      </div>

      {/* Heads Added to Boiler */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Heads Added to Boiler</h3>
        
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Volume (L)
            </label>
            <input
              type="text"
              value={batch.heads_added_volume_l ?? ''}
              onChange={(e) => updateField('heads_added_volume_l', e.target.value)}
              onBlur={(e) => {
                const vol = parseToNumber(e.target.value)
                updateField('heads_added_volume_l', vol)
                if (vol !== undefined && batch.heads_added_abv_percent !== undefined) {
                  updateField('heads_added_lal', calculateLAL(vol, batch.heads_added_abv_percent))
                }
              }}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              ABV (%)
            </label>
            <input
              type="text"
              value={batch.heads_added_abv_percent ?? ''}
              onChange={(e) => updateField('heads_added_abv_percent', formatABV(e.target.value))}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 95.0, 1)
                const abv = parseToNumber(validated)
                updateField('heads_added_abv_percent', abv)
                if (abv !== undefined && batch.heads_added_volume_l !== undefined) {
                  updateField('heads_added_lal', calculateLAL(batch.heads_added_volume_l, abv))
                }
              }}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              LAL
            </label>
            <input
              type="number"
              step="0.01"
              value={batch.heads_added_lal ?? ''}
              readOnly
              className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-stone-600"
            />
            <p className="text-xs text-stone-500 mt-1">
              Auto-calculated
            </p>
          </div>
        </div>
      </div>

      {/* Retort 1 (Right) */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Retort 1 (Right)</h3>
        
        <div className="grid grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Content
            </label>
            <input
              type="text"
              value={batch.retort1_content ?? ''}
              onChange={(e) => updateField('retort1_content', e.target.value)}
              placeholder="e.g., Heads"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              R1 Volume (L)
            </label>
            <input
              type="text"
              value={batch.retort1_volume_l ?? ''}
              onChange={(e) => updateField('retort1_volume_l', e.target.value)}
              onBlur={(e) => {
                const vol = parseToNumber(e.target.value)
                updateField('retort1_volume_l', vol)
                if (vol !== undefined && batch.retort1_abv_percent !== undefined) {
                  updateField('retort1_lal', calculateLAL(vol, batch.retort1_abv_percent))
                }
              }}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              R1 ABV (%)
            </label>
            <input
              type="text"
              value={batch.retort1_abv_percent ?? ''}
              onChange={(e) => updateField('retort1_abv_percent', formatABV(e.target.value))}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 95.0, 1)
                const abv = parseToNumber(validated)
                updateField('retort1_abv_percent', abv)
                if (abv !== undefined && batch.retort1_volume_l !== undefined) {
                  updateField('retort1_lal', calculateLAL(batch.retort1_volume_l, abv))
                }
              }}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              R1 LAL
            </label>
            <input
              type="number"
              step="0.01"
              value={batch.retort1_lal ?? ''}
              readOnly
              className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-stone-600"
            />
          </div>
        </div>
      </div>

      {/* Retort 2 (Left) */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Retort 2 (Left)</h3>
        
        <div className="grid grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Content
            </label>
            <input
              type="text"
              value={batch.retort2_content ?? ''}
              onChange={(e) => updateField('retort2_content', e.target.value)}
              placeholder="e.g., Tails"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              R2 Volume (L)
            </label>
            <input
              type="text"
              value={batch.retort2_volume_l ?? ''}
              onChange={(e) => updateField('retort2_volume_l', e.target.value)}
              onBlur={(e) => {
                const vol = parseToNumber(e.target.value)
                updateField('retort2_volume_l', vol)
                if (vol !== undefined && batch.retort2_abv_percent !== undefined) {
                  updateField('retort2_lal', calculateLAL(vol, batch.retort2_abv_percent))
                }
              }}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              R2 ABV (%)
            </label>
            <input
              type="text"
              value={batch.retort2_abv_percent ?? ''}
              onChange={(e) => updateField('retort2_abv_percent', formatABV(e.target.value))}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 95.0, 1)
                const abv = parseToNumber(validated)
                updateField('retort2_abv_percent', abv)
                if (abv !== undefined && batch.retort2_volume_l !== undefined) {
                  updateField('retort2_lal', calculateLAL(batch.retort2_volume_l, abv))
                }
              }}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              R2 LAL
            </label>
            <input
              type="number"
              step="0.01"
              value={batch.retort2_lal ?? ''}
              readOnly
              className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-stone-600"
            />
          </div>
        </div>
      </div>

      {/* Power & Timing */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Power & Timing</h3>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Power Input Boiler (A)
            </label>
            <input
              type="text"
              value={batch.power_input_boiler_a ?? ''}
              onChange={(e) => updateField('power_input_boiler_a', e.target.value)}
              onBlur={(e) => updateField('power_input_boiler_a', parseNumber(e.target.value))}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Still Heat Starting Time
            </label>
            <input
              type="time"
              value={batch.still_heat_starting_time ?? ''}
              onChange={(e) => updateField('still_heat_starting_time', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Power Input R1 (A)
            </label>
            <input
              type="text"
              value={batch.power_input_r1_a ?? ''}
              onChange={(e) => updateField('power_input_r1_a', e.target.value)}
              onBlur={(e) => updateField('power_input_r1_a', parseNumber(e.target.value))}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              R1 Heat Starting Time
            </label>
            <input
              type="time"
              value={batch.r1_heat_starting_time ?? ''}
              onChange={(e) => updateField('r1_heat_starting_time', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Power Input R2 (A)
            </label>
            <input
              type="text"
              value={batch.power_input_r2_a ?? ''}
              onChange={(e) => updateField('power_input_r2_a', e.target.value)}
              onBlur={(e) => updateField('power_input_r2_a', parseNumber(e.target.value))}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              R2 Heat Starting Time
            </label>
            <input
              type="time"
              value={batch.r2_heat_starting_time ?? ''}
              onChange={(e) => updateField('r2_heat_starting_time', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>
        </div>
      </div>

      {/* First Spirit */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">First Spirit</h3>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              First Spirit Pot Temperature (°C)
            </label>
            <input
              type="text"
              value={batch.first_spirit_pot_temperature_c ?? ''}
              onChange={(e) => updateField('first_spirit_pot_temperature_c', e.target.value)}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 99.9, 1)
                updateField('first_spirit_pot_temperature_c', parseToNumber(validated))
              }}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              R1 Temperature (°C)
            </label>
            <input
              type="text"
              value={batch.r1_temperature_c ?? ''}
              onChange={(e) => updateField('r1_temperature_c', formatTemperature(e.target.value))}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 99.9, 1)
                updateField('r1_temperature_c', parseToNumber(validated))
              }}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              R2 Temperature (°C)
            </label>
            <input
              type="text"
              value={batch.r2_temperature_c ?? ''}
              onChange={(e) => updateField('r2_temperature_c', formatTemperature(e.target.value))}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 99.9, 1)
                updateField('r2_temperature_c', parseToNumber(validated))
              }}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              First Spirit Time
            </label>
            <input
              type="time"
              value={batch.first_spirit_time ?? ''}
              onChange={(e) => updateField('first_spirit_time', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              First Spirit ABV (%)
            </label>
            <input
              type="text"
              value={batch.first_spirit_abv_percent ?? ''}
              onChange={(e) => updateField('first_spirit_abv_percent', formatABV(e.target.value))}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 95.0, 1)
                updateField('first_spirit_abv_percent', parseToNumber(validated))
              }}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              First Spirit Density
            </label>
            <input
              type="text"
              value={batch.first_spirit_density ?? ''}
              onChange={(e) => updateField('first_spirit_density', formatDensity(e.target.value))}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 2, 3)
                updateField('first_spirit_density', parseToNumber(validated))
              }}
              placeholder="0.000"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>
        </div>
      </div>

      {/* Power Adjustments & Flow */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Power Adjustments & Flow</h3>

        <div className="grid grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Power Input Pot (A)
            </label>
            <input
              type="text"
              value={batch.power_input_pot_a ?? ''}
              onChange={(e) => updateField('power_input_pot_a', e.target.value)}
              onBlur={(e) => updateField('power_input_pot_a', parseNumber(e.target.value))}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              R1 Power Input (A)
            </label>
            <input
              type="text"
              value={batch.r1_power_input_a ?? ''}
              onChange={(e) => updateField('r1_power_input_a', e.target.value)}
              onBlur={(e) => updateField('r1_power_input_a', parseNumber(e.target.value))}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              R2 Power Input (A)
            </label>
            <input
              type="text"
              value={batch.r2_power_input_a ?? ''}
              onChange={(e) => updateField('r2_power_input_a', e.target.value)}
              onBlur={(e) => updateField('r2_power_input_a', parseNumber(e.target.value))}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Flow (L/h)
            </label>
            <input
              type="text"
              value={batch.flow_l_per_h ?? ''}
              onChange={(e) => updateField('flow_l_per_h', e.target.value)}
              onBlur={(e) => updateField('flow_l_per_h', parseNumber(e.target.value))}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>
        </div>
      </div>

      {/* Foreshots */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Foreshots</h3>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Volume (L)
            </label>
            <input
              type="text"
              value={batch.foreshots_volume_l ?? ''}
              onChange={(e) => updateField('foreshots_volume_l', e.target.value)}
              onBlur={(e) => updateField('foreshots_volume_l', parseToNumber(e.target.value))}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              ABV (%)
            </label>
            <input
              type="text"
              value={batch.foreshots_abv_percent ?? ''}
              onChange={(e) => updateField('foreshots_abv_percent', e.target.value)}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 99.9, 1)
                updateField('foreshots_abv_percent', parseToNumber(validated))
              }}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>
        </div>
      </div>

      {/* Heads Cut */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Heads Cut</h3>

        <div className="grid grid-cols-5 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Heads Cut Time
            </label>
            <input
              type="time"
              value={batch.heads_cut_time ?? ''}
              onChange={(e) => updateField('heads_cut_time', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Heads ABV (%)
            </label>
            <input
              type="text"
              value={batch.heads_cut_abv_percent ?? ''}
              onChange={(e) => updateField('heads_cut_abv_percent', formatABV(e.target.value))}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 95.0, 1)
                const abv = parseToNumber(validated)
                updateField('heads_cut_abv_percent', abv)
                if (abv !== undefined && batch.heads_cut_volume_l !== undefined) {
                  updateField('heads_cut_lal', calculateLAL(batch.heads_cut_volume_l, abv))
                }
              }}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Heads Volume (L)
            </label>
            <input
              type="text"
              value={batch.heads_cut_volume_l ?? ''}
              onChange={(e) => updateField('heads_cut_volume_l', e.target.value)}
              onBlur={(e) => {
                const vol = parseToNumber(e.target.value)
                updateField('heads_cut_volume_l', vol)
                if (vol !== undefined && batch.heads_cut_abv_percent !== undefined) {
                  updateField('heads_cut_lal', calculateLAL(vol, batch.heads_cut_abv_percent))
                }
              }}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Heads LAL
            </label>
            <input
              type="number"
              step="0.01"
              value={batch.heads_cut_lal ?? ''}
              readOnly
              className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-stone-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Heads Density
            </label>
            <input
              type="text"
              value={batch.heads_cut_density ?? ''}
              onChange={(e) => updateField('heads_cut_density', formatDensity(e.target.value))}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 2, 3)
                updateField('heads_cut_density', parseToNumber(validated))
              }}
              placeholder="0.000"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>
        </div>
      </div>

      {/* Hearts Cut */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Hearts Cut</h3>

        <div className="grid grid-cols-5 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Hearts Cut Time
            </label>
            <input
              type="time"
              value={batch.hearts_cut_time ?? ''}
              onChange={(e) => updateField('hearts_cut_time', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Hearts Cut ABV (%)
            </label>
            <input
              type="text"
              value={batch.hearts_cut_abv_percent ?? ''}
              onChange={(e) => updateField('hearts_cut_abv_percent', formatABV(e.target.value))}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 95.0, 1)
                updateField('hearts_cut_abv_percent', parseToNumber(validated))
              }}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Hearts Volume (L)
            </label>
            <input
              type="text"
              value={batch.hearts_volume_l ?? ''}
              onChange={(e) => updateField('hearts_volume_l', e.target.value)}
              onBlur={(e) => {
                const vol = parseToNumber(e.target.value)
                updateField('hearts_volume_l', vol)
                if (vol !== undefined && batch.hearts_abv_percent !== undefined) {
                  updateField('hearts_lal', calculateLAL(vol, batch.hearts_abv_percent))
                }
              }}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Hearts ABV (%)
            </label>
            <input
              type="text"
              value={batch.hearts_abv_percent ?? ''}
              onChange={(e) => updateField('hearts_abv_percent', formatABV(e.target.value))}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 95.0, 1)
                const abv = parseToNumber(validated)
                updateField('hearts_abv_percent', abv)
                if (abv !== undefined && batch.hearts_volume_l !== undefined) {
                  updateField('hearts_lal', calculateLAL(batch.hearts_volume_l, abv))
                }
              }}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Hearts LAL
            </label>
            <input
              type="number"
              step="0.01"
              value={batch.hearts_lal ?? ''}
              readOnly
              className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-stone-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Hearts Cut Density
            </label>
            <input
              type="text"
              value={batch.hearts_cut_density ?? ''}
              onChange={(e) => updateField('hearts_cut_density', formatDensity(e.target.value))}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 2, 3)
                updateField('hearts_cut_density', parseToNumber(validated))
              }}
              placeholder="0.000"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Hearts Density
            </label>
            <input
              type="text"
              value={batch.hearts_density ?? ''}
              onChange={(e) => updateField('hearts_density', formatDensity(e.target.value))}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 2, 3)
                updateField('hearts_density', parseToNumber(validated))
              }}
              placeholder="0.000"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Power Input Changed To (A)
          </label>
          <input
            type="text"
            value={batch.power_input_changed_to ?? ''}
            onChange={(e) => updateField('power_input_changed_to', e.target.value)}
            onBlur={(e) => updateField('power_input_changed_to', parseNumber(e.target.value))}
            placeholder="0.0"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
          <p className="text-xs text-stone-500 mt-1">
            Power adjustment during hearts collection
          </p>
        </div>
      </div>

      {/* Early Tails Cut */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Early Tails Cut</h3>

        <div className="grid grid-cols-5 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Early Tails Cut Time
            </label>
            <input
              type="time"
              value={batch.early_tails_cut_time ?? ''}
              onChange={(e) => updateField('early_tails_cut_time', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              ETails Cut ABV (%)
            </label>
            <input
              type="text"
              value={batch.early_tails_cut_abv_percent ?? ''}
              onChange={(e) => updateField('early_tails_cut_abv_percent', formatABV(e.target.value))}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 95.0, 1)
                updateField('early_tails_cut_abv_percent', parseToNumber(validated))
              }}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              ETails Total ABV (%)
            </label>
            <input
              type="text"
              value={batch.early_tails_total_abv_percent ?? ''}
              onChange={(e) => updateField('early_tails_total_abv_percent', formatABV(e.target.value))}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 95.0, 1)
                const abv = parseToNumber(validated)
                updateField('early_tails_total_abv_percent', abv)
                if (abv !== undefined && batch.early_tails_volume_l !== undefined) {
                  updateField('early_tails_lal', calculateLAL(batch.early_tails_volume_l, abv))
                }
              }}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              ETails Volume (L)
            </label>
            <input
              type="text"
              value={batch.early_tails_volume_l ?? ''}
              onChange={(e) => updateField('early_tails_volume_l', e.target.value)}
              onBlur={(e) => {
                const vol = parseToNumber(e.target.value)
                updateField('early_tails_volume_l', vol)
                if (vol !== undefined && batch.early_tails_total_abv_percent !== undefined) {
                  updateField('early_tails_lal', calculateLAL(vol, batch.early_tails_total_abv_percent))
                }
              }}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              ETails LAL
            </label>
            <input
              type="number"
              step="0.01"
              value={batch.early_tails_lal ?? ''}
              readOnly
              className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-stone-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              ETails Density
            </label>
            <input
              type="text"
              value={batch.early_tails_density ?? ''}
              onChange={(e) => updateField('early_tails_density', formatDensity(e.target.value))}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 2, 3)
                updateField('early_tails_density', parseToNumber(validated))
              }}
              placeholder="0.000"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Power Input Changed To (A)
            </label>
            <input
              type="text"
              value={batch.power_input_changed_to_2 ?? ''}
              onChange={(e) => updateField('power_input_changed_to_2', e.target.value)}
              onBlur={(e) => updateField('power_input_changed_to_2', parseNumber(e.target.value))}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
            <p className="text-xs text-stone-500 mt-1">
              Power adjustment during early tails
            </p>
          </div>
        </div>
      </div>

      {/* Late Tails Cut */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Late Tails Cut</h3>

        <div className="grid grid-cols-5 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Late Tails Cut Time
            </label>
            <input
              type="time"
              value={batch.late_tails_cut_time ?? ''}
              onChange={(e) => updateField('late_tails_cut_time', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              LTails Cut ABV (%)
            </label>
            <input
              type="text"
              value={batch.late_tails_cut_abv_percent ?? ''}
              onChange={(e) => updateField('late_tails_cut_abv_percent', formatABV(e.target.value))}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 95.0, 1)
                updateField('late_tails_cut_abv_percent', parseToNumber(validated))
              }}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              LTails Total ABV (%)
            </label>
            <input
              type="text"
              value={batch.late_tails_total_abv_percent ?? ''}
              onChange={(e) => updateField('late_tails_total_abv_percent', formatABV(e.target.value))}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 95.0, 1)
                const abv = parseToNumber(validated)
                updateField('late_tails_total_abv_percent', abv)
                if (abv !== undefined && batch.late_tails_volume_l !== undefined) {
                  updateField('late_tails_lal', calculateLAL(batch.late_tails_volume_l, abv))
                }
              }}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              LTails Volume (L)
            </label>
            <input
              type="text"
              value={batch.late_tails_volume_l ?? ''}
              onChange={(e) => updateField('late_tails_volume_l', e.target.value)}
              onBlur={(e) => {
                const vol = parseToNumber(e.target.value)
                updateField('late_tails_volume_l', vol)
                if (vol !== undefined && batch.late_tails_total_abv_percent !== undefined) {
                  updateField('late_tails_lal', calculateLAL(vol, batch.late_tails_total_abv_percent))
                }
              }}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              LTails LAL
            </label>
            <input
              type="number"
              step="0.01"
              value={batch.late_tails_lal ?? ''}
              readOnly
              className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-stone-600"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            LTails Density
          </label>
          <input
            type="text"
            value={batch.late_tails_density ?? ''}
            onChange={(e) => updateField('late_tails_density', formatDensity(e.target.value))}
            onBlur={(e) => {
              const validated = validateOnBlur(e.target.value, 2, 3)
              updateField('late_tails_density', parseToNumber(validated))
            }}
            placeholder="0.000"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>
      </div>

      {/* Dilution */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Dilution</h3>
        <p className="text-sm text-stone-600 mb-4">
          Calculate water needed to dilute hearts to target ABV
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
          <h4 className="text-sm font-semibold text-amber-900 mb-4">Dilution Calculator</h4>

          <div className="grid grid-cols-3 gap-6 mb-4">
            <div>
              <label className="block text-xs text-amber-800 mb-1">
                Hearts Volume (L)
              </label>
              <input
                type="number"
                step="0.1"
                value={batch.hearts_volume_l ?? ''}
                readOnly
                className="w-full px-3 py-2 border border-amber-300 rounded-md bg-white text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs text-amber-800 mb-1">
                Hearts ABV (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={batch.hearts_abv_percent ?? ''}
                readOnly
                className="w-full px-3 py-2 border border-amber-300 rounded-md bg-white text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs text-amber-800 mb-1">
                Target ABV (%)
              </label>
              <input
                type="text"
                value={batch.final_abv_after_dilution_percent ?? ''}
                onChange={(e) => updateField('final_abv_after_dilution_percent', formatABV(e.target.value))}
                onBlur={(e) => {
                  const validated = validateOnBlur(e.target.value, 95.0, 1)
                  updateField('final_abv_after_dilution_percent', parseToNumber(validated))
                }}
                placeholder="e.g., 63.5"
                className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>

          <div className="bg-white border border-amber-300 rounded-lg p-4">
            <p className="text-sm text-amber-900 mb-2">
              <span className="font-semibold">Water Required:</span>{' '}
              {(() => {
                const heartsVol = toNum(batch.hearts_volume_l)
                const heartsABV = toNum(batch.hearts_abv_percent)
                const targetABV = toNum(batch.final_abv_after_dilution_percent)

                if (heartsVol > 0 && heartsABV > 0 && targetABV > 0 && targetABV < heartsABV) {
                  const waterNeeded = heartsVol * ((heartsABV - targetABV) / targetABV)
                  return `${waterNeeded.toFixed(2)} L`
                }
                return '0.00 L'
              })()}
            </p>
            <p className="text-sm text-amber-900">
              <span className="font-semibold">Final Volume:</span>{' '}
              {(() => {
                const heartsVol = toNum(batch.hearts_volume_l)
                const heartsABV = toNum(batch.hearts_abv_percent)
                const targetABV = toNum(batch.final_abv_after_dilution_percent)

                if (heartsVol > 0 && heartsABV > 0 && targetABV > 0 && targetABV < heartsABV) {
                  const waterNeeded = heartsVol * ((heartsABV - targetABV) / targetABV)
                  const finalVol = heartsVol + waterNeeded
                  return `${finalVol.toFixed(2)} L`
                }
                return '0.00 L'
              })()}
            </p>
            <p className="text-xs text-amber-700 mt-2">
              Formula: Water = Hearts Volume × ((Hearts ABV - Target ABV) / Target ABV)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Water Added for Dilution (L)
            </label>
            <input
              type="text"
              value={batch.water_added_for_dilution_l ?? ''}
              onChange={(e) => updateField('water_added_for_dilution_l', e.target.value)}
              onBlur={(e) => updateField('water_added_for_dilution_l', parseNumber(e.target.value))}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Final ABV (%)
            </label>
            <input
              type="text"
              value={batch.final_abv_after_dilution_percent ?? ''}
              onChange={(e) => updateField('final_abv_after_dilution_percent', formatABV(e.target.value))}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 95.0, 1)
                updateField('final_abv_after_dilution_percent', parseToNumber(validated))
              }}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Final Volume (L)
            </label>
            <input
              type="text"
              value={batch.final_volume_after_dilution_l ?? ''}
              onChange={(e) => updateField('final_volume_after_dilution_l', e.target.value)}
              onBlur={(e) => updateField('final_volume_after_dilution_l', parseNumber(e.target.value))}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <span className="font-medium">Note:</span> Final ABV and Final Volume will be used in the Barrel Aging section.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Distillation Summary</h3>

        <div className="grid grid-cols-5 gap-4">
          <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
            <p className="text-xs text-stone-600 mb-1">Foreshots</p>
            <p className="text-lg font-semibold text-stone-900">
              {toNum(batch.foreshots_volume_l).toFixed(1)} L
            </p>
          </div>

          <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
            <p className="text-xs text-stone-600 mb-1">Heads</p>
            <p className="text-lg font-semibold text-stone-900">
              {toNum(batch.heads_cut_volume_l).toFixed(1)} L
            </p>
            <p className="text-xs text-stone-500">
              @ {toNum(batch.heads_cut_abv_percent).toFixed(1)}% ABV
            </p>
            <p className="text-xs text-stone-500">
              {toNum(batch.heads_cut_lal).toFixed(2)} LAL
            </p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-800 mb-1">Hearts</p>
            <p className="text-lg font-semibold text-amber-900">
              {toNum(batch.hearts_volume_l).toFixed(1)} L
            </p>
            <p className="text-xs text-amber-700">
              @ {toNum(batch.hearts_abv_percent).toFixed(1)}% ABV
            </p>
            <p className="text-xs text-amber-700">
              {toNum(batch.hearts_lal).toFixed(2)} LAL
            </p>
          </div>

          <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
            <p className="text-xs text-stone-600 mb-1">Early Tails</p>
            <p className="text-lg font-semibold text-stone-900">
              {toNum(batch.early_tails_volume_l).toFixed(1)} L
            </p>
            <p className="text-xs text-stone-500">
              @ {toNum(batch.early_tails_total_abv_percent).toFixed(1)}% ABV
            </p>
            <p className="text-xs text-stone-500">
              {toNum(batch.early_tails_lal).toFixed(2)} LAL
            </p>
          </div>

          <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
            <p className="text-xs text-stone-600 mb-1">Late Tails</p>
            <p className="text-lg font-semibold text-stone-900">
              {toNum(batch.late_tails_volume_l).toFixed(1)} L
            </p>
            <p className="text-xs text-stone-500">
              @ {toNum(batch.late_tails_total_abv_percent).toFixed(1)}% ABV
            </p>
            <p className="text-xs text-stone-500">
              {toNum(batch.late_tails_lal).toFixed(2)} LAL
            </p>
          </div>
        </div>

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-amber-800">
                <span className="font-semibold">Total LAL Start:</span>{' '}
                {(
                  toNum(batch.boiler_lal) +
                  toNum(batch.heads_added_lal) +
                  toNum(batch.retort1_lal) +
                  toNum(batch.retort2_lal)
                ).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-amber-800">
                <span className="font-semibold">Total LAL End:</span>{' '}
                {(
                  toNum(batch.heads_cut_lal) +
                  toNum(batch.hearts_lal) +
                  toNum(batch.early_tails_lal) +
                  toNum(batch.late_tails_lal)
                ).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-amber-800">
                <span className="font-semibold">Hearts Yield:</span>{' '}
                {(() => {
                  const totalStart = toNum(batch.boiler_lal) + toNum(batch.heads_added_lal) + toNum(batch.retort1_lal) + toNum(batch.retort2_lal)
                  const heartsLAL = toNum(batch.hearts_lal)
                  if (totalStart > 0 && heartsLAL > 0) {
                    return `${((heartsLAL / totalStart) * 100).toFixed(1)}%`
                  }
                  return '0.0%'
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

