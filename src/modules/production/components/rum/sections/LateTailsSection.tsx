"use client"

import { RumCaneSpiritBatch } from '@/types/production-schemas'
import { AbvField, DensityField, TimeField } from '../fields'
import { parseToNumber, calculateLAL } from '@/modules/production/utils/distillation-formatters'

interface LateTailsSectionProps {
  batch: RumCaneSpiritBatch
  updateField: <K extends keyof RumCaneSpiritBatch>(field: K, value: RumCaneSpiritBatch[K]) => void
}

export function LateTailsSection({ batch, updateField }: LateTailsSectionProps) {
  return (
    <div className="border-t border-stone-200 pt-6">
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Late Tails Cut</h3>

      <div className="grid grid-cols-5 gap-6">
        <TimeField
          id="late_tails_cut_time"
          label="Late Tails Cut Time"
          value={batch.late_tails_cut_time}
          onChange={(v) => updateField('late_tails_cut_time', v)}
        />
        <AbvField
          id="late_tails_cut_abv_percent"
          label="LTails Cut ABV (%)"
          value={batch.late_tails_cut_abv_percent}
          onChange={(v) => updateField('late_tails_cut_abv_percent', v)}
        />
        <AbvField
          id="late_tails_total_abv_percent"
          label="LTails Total ABV (%)"
          value={batch.late_tails_total_abv_percent}
          onChange={(v) => updateField('late_tails_total_abv_percent', v)}
          onBlurExtra={(abv) => {
            if (abv !== undefined && batch.late_tails_volume_l !== undefined) {
              updateField('late_tails_lal', calculateLAL(batch.late_tails_volume_l, abv))
            }
          }}
        />
        <div>
          <label htmlFor="late_tails_volume_l" className="block text-sm font-medium text-stone-700 mb-2">
            LTails Volume (L)
          </label>
          <input
            type="text"
            id="late_tails_volume_l"
            value={batch.late_tails_volume_l ?? ''}
            onChange={(e) => updateField('late_tails_volume_l', parseToNumber(e.target.value))}
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
          <label htmlFor="late_tails_lal" className="block text-sm font-medium text-stone-700 mb-2">
            LTails LAL
          </label>
          <input
            type="number"
            step="0.01"
            id="late_tails_lal"
            value={batch.late_tails_lal ?? ''}
            readOnly
            className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-stone-600"
          />
        </div>
      </div>

      <div className="mt-4">
        <DensityField
          id="late_tails_density"
          label="LTails Density"
          value={batch.late_tails_density}
          onChange={(v) => updateField('late_tails_density', v)}
        />
      </div>
    </div>
  )
}
