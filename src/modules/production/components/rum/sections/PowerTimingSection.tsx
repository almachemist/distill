"use client"

import { RumCaneSpiritBatch } from '@/types/production-schemas'
import { NumberField, TimeField } from '../fields'

interface PowerTimingSectionProps {
  batch: RumCaneSpiritBatch
  updateField: <K extends keyof RumCaneSpiritBatch>(field: K, value: RumCaneSpiritBatch[K]) => void
}

export function PowerTimingSection({ batch, updateField }: PowerTimingSectionProps) {
  return (
    <div className="border-t border-stone-200 pt-6">
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Power & Timing</h3>
      <div className="grid grid-cols-2 gap-6">
        <NumberField
          id="power_input_boiler_a"
          label="Power Input Boiler (A)"
          value={batch.power_input_boiler_a}
          onChange={(v) => updateField('power_input_boiler_a', v)}
        />
        <TimeField
          id="still_heat_starting_time"
          label="Still Heat Starting Time"
          value={batch.still_heat_starting_time}
          onChange={(v) => updateField('still_heat_starting_time', v)}
        />
        <NumberField
          id="power_input_r1_a"
          label="Power Input R1 (A)"
          value={batch.power_input_r1_a}
          onChange={(v) => updateField('power_input_r1_a', v)}
        />
        <TimeField
          id="r1_heat_starting_time"
          label="R1 Heat Starting Time"
          value={batch.r1_heat_starting_time}
          onChange={(v) => updateField('r1_heat_starting_time', v)}
        />
        <NumberField
          id="power_input_r2_a"
          label="Power Input R2 (A)"
          value={batch.power_input_r2_a}
          onChange={(v) => updateField('power_input_r2_a', v)}
        />
        <TimeField
          id="r2_heat_starting_time"
          label="R2 Heat Starting Time"
          value={batch.r2_heat_starting_time}
          onChange={(v) => updateField('r2_heat_starting_time', v)}
        />
      </div>
    </div>
  )
}
