"use client"

import { RumCaneSpiritBatch } from '@/types/production-schemas'
import { VolumeAbvLalGroup } from '../fields'

interface BoilerSectionProps {
  batch: RumCaneSpiritBatch
  updateField: <K extends keyof RumCaneSpiritBatch>(field: K, value: RumCaneSpiritBatch[K]) => void
}

export function BoilerSection({ batch, updateField }: BoilerSectionProps) {
  return (
    <div className="border-t border-stone-200 pt-6">
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Boiler</h3>
      <div className="grid grid-cols-3 gap-6">
        <VolumeAbvLalGroup
          volumeValue={batch.boiler_volume_l}
          abvValue={batch.boiler_abv_percent}
          lalValue={batch.boiler_lal}
          onVolumeChange={(v) => updateField('boiler_volume_l', v)}
          onAbvChange={(v) => updateField('boiler_abv_percent', v)}
          onLalChange={(v) => updateField('boiler_lal', v)}
          volumeLabel="Boiler Volume (L)"
          abvLabel="Boiler ABV (%)"
          lalLabel="Boiler LAL"
          volumeId="boiler_volume_l"
          abvId="boiler_abv_percent"
          lalId="boiler_lal"
        />
      </div>
    </div>
  )
}
