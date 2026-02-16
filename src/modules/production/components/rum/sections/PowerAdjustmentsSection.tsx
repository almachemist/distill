"use client"

import { RumCaneSpiritBatch } from '@/types/production-schemas'
import { NumberField } from '../fields'

interface PowerAdjustmentsSectionProps {
  batch: RumCaneSpiritBatch
  updateField: <K extends keyof RumCaneSpiritBatch>(field: K, value: RumCaneSpiritBatch[K]) => void
}

export function PowerAdjustmentsSection({ batch, updateField }: PowerAdjustmentsSectionProps) {
  return (
    <div className="border-t border-stone-200 pt-6">
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Power Adjustments & Flow</h3>
      <div className="grid grid-cols-4 gap-6">
        <NumberField
          id="power_input_pot_a"
          label="Power Input Pot (A)"
          value={batch.power_input_pot_a}
          onChange={(v) => updateField('power_input_pot_a', v)}
        />
        <NumberField
          id="r1_power_input_a"
          label="R1 Power Input (A)"
          value={batch.r1_power_input_a}
          onChange={(v) => updateField('r1_power_input_a', v)}
        />
        <NumberField
          id="r2_power_input_a"
          label="R2 Power Input (A)"
          value={batch.r2_power_input_a}
          onChange={(v) => updateField('r2_power_input_a', v)}
        />
        <NumberField
          id="flow_l_per_h"
          label="Flow (L/h)"
          value={batch.flow_l_per_h}
          onChange={(v) => updateField('flow_l_per_h', v)}
        />
      </div>
    </div>
  )
}
