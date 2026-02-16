"use client"

import { RumCaneSpiritBatch } from '@/types/production-schemas'
import { TemperatureField, AbvField, DensityField, TimeField } from '../fields'

interface FirstSpiritSectionProps {
  batch: RumCaneSpiritBatch
  updateField: <K extends keyof RumCaneSpiritBatch>(field: K, value: RumCaneSpiritBatch[K]) => void
}

export function FirstSpiritSection({ batch, updateField }: FirstSpiritSectionProps) {
  return (
    <div className="border-t border-stone-200 pt-6">
      <h3 className="text-lg font-semibold text-stone-900 mb-4">First Spirit</h3>
      <div className="grid grid-cols-3 gap-6">
        <TemperatureField
          id="first_spirit_pot_temperature_c"
          label="First Spirit Pot Temperature (°C)"
          value={batch.first_spirit_pot_temperature_c}
          onChange={(v) => updateField('first_spirit_pot_temperature_c', v)}
        />
        <TemperatureField
          id="r1_temperature_c"
          label="R1 Temperature (°C)"
          value={batch.r1_temperature_c}
          onChange={(v) => updateField('r1_temperature_c', v)}
        />
        <TemperatureField
          id="r2_temperature_c"
          label="R2 Temperature (°C)"
          value={batch.r2_temperature_c}
          onChange={(v) => updateField('r2_temperature_c', v)}
        />
        <TimeField
          id="first_spirit_time"
          label="First Spirit Time"
          value={batch.first_spirit_time}
          onChange={(v) => updateField('first_spirit_time', v)}
        />
        <AbvField
          id="first_spirit_abv_percent"
          label="First Spirit ABV (%)"
          value={batch.first_spirit_abv_percent}
          onChange={(v) => updateField('first_spirit_abv_percent', v)}
        />
        <DensityField
          id="first_spirit_density"
          label="First Spirit Density"
          value={batch.first_spirit_density}
          onChange={(v) => updateField('first_spirit_density', v)}
        />
      </div>
    </div>
  )
}
