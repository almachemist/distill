"use client"

import { RumCaneSpiritBatch } from '@/types/production-schemas'
import { AbvField, DensityField, TimeField } from '../fields'
import { parseToNumber, calculateLAL } from '@/modules/production/utils/distillation-formatters'

interface HeadsCutSectionProps {
  batch: RumCaneSpiritBatch
  updateField: <K extends keyof RumCaneSpiritBatch>(field: K, value: RumCaneSpiritBatch[K]) => void
}

export function HeadsCutSection({ batch, updateField }: HeadsCutSectionProps) {
  return (
    <div className="border-t border-stone-200 pt-6">
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Heads Cut</h3>
      <div className="grid grid-cols-5 gap-6">
        <TimeField
          id="heads_cut_time"
          label="Heads Cut Time"
          value={batch.heads_cut_time}
          onChange={(v) => updateField('heads_cut_time', v)}
        />
        <AbvField
          id="heads_cut_abv_percent"
          label="Heads ABV (%)"
          value={batch.heads_cut_abv_percent}
          onChange={(v) => updateField('heads_cut_abv_percent', v)}
          onBlurExtra={(abv) => {
            if (abv !== undefined && batch.heads_cut_volume_l !== undefined) {
              updateField('heads_cut_lal', calculateLAL(batch.heads_cut_volume_l, abv))
            }
          }}
        />
        <div>
          <label htmlFor="heads_cut_volume_l" className="block text-sm font-medium text-stone-700 mb-2">
            Heads Volume (L)
          </label>
          <input
            type="text"
            id="heads_cut_volume_l"
            value={batch.heads_cut_volume_l ?? ''}
            onChange={(e) => updateField('heads_cut_volume_l', parseToNumber(e.target.value))}
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
          <label htmlFor="heads_cut_lal" className="block text-sm font-medium text-stone-700 mb-2">
            Heads LAL
          </label>
          <input
            type="number"
            step="0.01"
            id="heads_cut_lal"
            value={batch.heads_cut_lal ?? ''}
            readOnly
            className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-stone-600"
          />
        </div>
        <DensityField
          id="heads_cut_density"
          label="Heads Density"
          value={batch.heads_cut_density}
          onChange={(v) => updateField('heads_cut_density', v)}
        />
      </div>
    </div>
  )
}
