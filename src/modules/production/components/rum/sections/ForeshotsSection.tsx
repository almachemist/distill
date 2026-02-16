"use client"

import { RumCaneSpiritBatch } from '@/types/production-schemas'
import { AbvField } from '../fields'
import { parseToNumber } from '@/modules/production/utils/distillation-formatters'

interface ForeshotsSectionProps {
  batch: RumCaneSpiritBatch
  updateField: <K extends keyof RumCaneSpiritBatch>(field: K, value: RumCaneSpiritBatch[K]) => void
}

export function ForeshotsSection({ batch, updateField }: ForeshotsSectionProps) {
  return (
    <div className="border-t border-stone-200 pt-6">
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Foreshots</h3>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="foreshots_volume_l" className="block text-sm font-medium text-stone-700 mb-2">
            Volume (L)
          </label>
          <input
            type="text"
            id="foreshots_volume_l"
            value={batch.foreshots_volume_l ?? ''}
            onChange={(e) => updateField('foreshots_volume_l', parseToNumber(e.target.value))}
            onBlur={(e) => updateField('foreshots_volume_l', parseToNumber(e.target.value))}
            placeholder="0.0"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>
        <AbvField
          id="foreshots_abv_percent"
          label="ABV (%)"
          value={batch.foreshots_abv_percent}
          onChange={(v) => updateField('foreshots_abv_percent', v)}
          max={99.9}
        />
      </div>
    </div>
  )
}
