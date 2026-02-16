"use client"

import { RumCaneSpiritBatch } from '@/types/production-schemas'
import { AbvField, NumberField } from '../fields'
import { toNum, formatABV, validateOnBlur, parseToNumber } from '@/modules/production/utils/distillation-formatters'

interface DilutionSectionProps {
  batch: RumCaneSpiritBatch
  updateField: <K extends keyof RumCaneSpiritBatch>(field: K, value: RumCaneSpiritBatch[K]) => void
}

export function DilutionSection({ batch, updateField }: DilutionSectionProps) {
  const heartsVol = toNum(batch.hearts_volume_l)
  const heartsABV = toNum(batch.hearts_abv_percent)
  const targetABV = toNum(batch.final_abv_after_dilution_percent)

  const canCalculate = heartsVol > 0 && heartsABV > 0 && targetABV > 0 && targetABV < heartsABV
  const waterNeeded = canCalculate ? heartsVol * ((heartsABV - targetABV) / targetABV) : 0
  const finalVolume = canCalculate ? heartsVol + waterNeeded : 0

  return (
    <div className="border-t border-stone-200 pt-6">
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Dilution</h3>
      <p className="text-sm text-stone-600 mb-4">
        Calculate water needed to dilute hearts to target ABV
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
        <h4 className="text-sm font-semibold text-amber-900 mb-4">Dilution Calculator</h4>

        <div className="grid grid-cols-3 gap-6 mb-4">
          <div>
            <label htmlFor="dilution_hearts_volume_l" className="block text-xs text-amber-800 mb-1">
              Hearts Volume (L)
            </label>
            <input
              type="number"
              step="0.1"
              id="dilution_hearts_volume_l"
              value={batch.hearts_volume_l ?? ''}
              readOnly
              className="w-full px-3 py-2 border border-amber-300 rounded-md bg-white text-stone-900"
            />
          </div>
          <div>
            <label htmlFor="dilution_hearts_abv_percent" className="block text-xs text-amber-800 mb-1">
              Hearts ABV (%)
            </label>
            <input
              type="number"
              step="0.01"
              id="dilution_hearts_abv_percent"
              value={batch.hearts_abv_percent ?? ''}
              readOnly
              className="w-full px-3 py-2 border border-amber-300 rounded-md bg-white text-stone-900"
            />
          </div>
          <div>
            <label htmlFor="dilution_target_abv_percent" className="block text-xs text-amber-800 mb-1">
              Target ABV (%)
            </label>
            <input
              type="text"
              id="dilution_target_abv_percent"
              value={batch.final_abv_after_dilution_percent ?? ''}
              onChange={(e) => {
                const formatted = formatABV(e.target.value)
                updateField('final_abv_after_dilution_percent', formatted ? parseFloat(formatted) : undefined)
              }}
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
            {waterNeeded.toFixed(2)} L
          </p>
          <p className="text-sm text-amber-900">
            <span className="font-semibold">Final Volume:</span>{' '}
            {finalVolume.toFixed(2)} L
          </p>
          <p className="text-xs text-amber-700 mt-2">
            Formula: Water = Hearts Volume × ((Hearts ABV - Target ABV) / Target ABV)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <NumberField
          id="water_added_for_dilution_l"
          label="Water Added for Dilution (L)"
          value={batch.water_added_for_dilution_l}
          onChange={(v) => updateField('water_added_for_dilution_l', v)}
        />
        <AbvField
          id="final_abv_after_dilution_percent"
          label="Final ABV (%)"
          value={batch.final_abv_after_dilution_percent}
          onChange={(v) => updateField('final_abv_after_dilution_percent', v)}
        />
        <NumberField
          id="final_volume_after_dilution_l"
          label="Final Volume (L)"
          value={batch.final_volume_after_dilution_l}
          onChange={(v) => updateField('final_volume_after_dilution_l', v)}
        />
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <span className="font-medium">Note:</span> Final ABV and Final Volume will be used in the Barrel Aging section.
        </p>
      </div>
    </div>
  )
}
