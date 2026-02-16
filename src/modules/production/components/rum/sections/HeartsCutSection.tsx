"use client"

import { RumCaneSpiritBatch } from '@/types/production-schemas'
import { AbvField, DensityField, TimeField, NumberField } from '../fields'
import { parseToNumber, calculateLAL } from '@/modules/production/utils/distillation-formatters'

interface HeartsCutSectionProps {
  batch: RumCaneSpiritBatch
  updateField: <K extends keyof RumCaneSpiritBatch>(field: K, value: RumCaneSpiritBatch[K]) => void
}

export function HeartsCutSection({ batch, updateField }: HeartsCutSectionProps) {
  return (
    <div className="border-t border-stone-200 pt-6">
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Hearts Cut</h3>

      <div className="grid grid-cols-5 gap-6">
        <TimeField
          id="hearts_cut_time"
          label="Hearts Cut Time"
          value={batch.hearts_cut_time}
          onChange={(v) => updateField('hearts_cut_time', v)}
        />
        <AbvField
          id="hearts_cut_abv_percent"
          label="Hearts Cut ABV (%)"
          value={batch.hearts_cut_abv_percent}
          onChange={(v) => updateField('hearts_cut_abv_percent', v)}
        />
        <div>
          <label htmlFor="hearts_volume_l" className="block text-sm font-medium text-stone-700 mb-2">
            Hearts Volume (L)
          </label>
          <input
            type="text"
            id="hearts_volume_l"
            value={batch.hearts_volume_l ?? ''}
            onChange={(e) => updateField('hearts_volume_l', parseToNumber(e.target.value))}
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
        <AbvField
          id="hearts_abv_percent"
          label="Hearts ABV (%)"
          value={batch.hearts_abv_percent}
          onChange={(v) => updateField('hearts_abv_percent', v)}
          onBlurExtra={(abv) => {
            if (abv !== undefined && batch.hearts_volume_l !== undefined) {
              updateField('hearts_lal', calculateLAL(batch.hearts_volume_l, abv))
            }
          }}
        />
        <div>
          <label htmlFor="hearts_lal" className="block text-sm font-medium text-stone-700 mb-2">
            Hearts LAL
          </label>
          <input
            type="number"
            step="0.01"
            id="hearts_lal"
            value={batch.hearts_lal ?? ''}
            readOnly
            className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-stone-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-4">
        <DensityField
          id="hearts_cut_density"
          label="Hearts Cut Density"
          value={batch.hearts_cut_density}
          onChange={(v) => updateField('hearts_cut_density', v)}
        />
        <DensityField
          id="hearts_density"
          label="Hearts Density"
          value={batch.hearts_density}
          onChange={(v) => updateField('hearts_density', v)}
        />
      </div>

      <div className="mt-4">
        <NumberField
          id="power_input_changed_to"
          label="Power Input Changed To (A)"
          value={batch.power_input_changed_to}
          onChange={(v) => updateField('power_input_changed_to', v)}
          hint="Power adjustment during hearts collection"
        />
      </div>
    </div>
  )
}
