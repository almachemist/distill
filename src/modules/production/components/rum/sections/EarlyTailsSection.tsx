"use client"

import { RumCaneSpiritBatch } from '@/types/production-schemas'
import { AbvField, DensityField, TimeField, NumberField } from '../fields'
import { parseToNumber, calculateLAL } from '@/modules/production/utils/distillation-formatters'

interface EarlyTailsSectionProps {
  batch: RumCaneSpiritBatch
  updateField: <K extends keyof RumCaneSpiritBatch>(field: K, value: RumCaneSpiritBatch[K]) => void
}

export function EarlyTailsSection({ batch, updateField }: EarlyTailsSectionProps) {
  return (
    <div className="border-t border-stone-200 pt-6">
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Early Tails Cut</h3>

      <div className="grid grid-cols-5 gap-6">
        <TimeField
          id="early_tails_cut_time"
          label="Early Tails Cut Time"
          value={batch.early_tails_cut_time}
          onChange={(v) => updateField('early_tails_cut_time', v)}
        />
        <AbvField
          id="early_tails_cut_abv_percent"
          label="ETails Cut ABV (%)"
          value={batch.early_tails_cut_abv_percent}
          onChange={(v) => updateField('early_tails_cut_abv_percent', v)}
        />
        <AbvField
          id="early_tails_total_abv_percent"
          label="ETails Total ABV (%)"
          value={batch.early_tails_total_abv_percent}
          onChange={(v) => updateField('early_tails_total_abv_percent', v)}
          onBlurExtra={(abv) => {
            if (abv !== undefined && batch.early_tails_volume_l !== undefined) {
              updateField('early_tails_lal', calculateLAL(batch.early_tails_volume_l, abv))
            }
          }}
        />
        <div>
          <label htmlFor="early_tails_volume_l" className="block text-sm font-medium text-stone-700 mb-2">
            ETails Volume (L)
          </label>
          <input
            type="text"
            id="early_tails_volume_l"
            value={batch.early_tails_volume_l ?? ''}
            onChange={(e) => updateField('early_tails_volume_l', parseToNumber(e.target.value))}
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
          <label htmlFor="early_tails_lal" className="block text-sm font-medium text-stone-700 mb-2">
            ETails LAL
          </label>
          <input
            type="number"
            step="0.01"
            id="early_tails_lal"
            value={batch.early_tails_lal ?? ''}
            readOnly
            className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-stone-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-4">
        <DensityField
          id="early_tails_density"
          label="ETails Density"
          value={batch.early_tails_density}
          onChange={(v) => updateField('early_tails_density', v)}
        />
        <NumberField
          id="power_input_changed_to_2"
          label="Power Input Changed To (A)"
          value={batch.power_input_changed_to_2}
          onChange={(v) => updateField('power_input_changed_to_2', v)}
          hint="Power adjustment during early tails"
        />
      </div>
    </div>
  )
}
