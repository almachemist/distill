"use client"

import { RumCaneSpiritBatch } from '@/types/production-schemas'
import { VolumeAbvLalGroup } from '../fields'

interface HeadsAddedSectionProps {
  batch: RumCaneSpiritBatch
  updateField: <K extends keyof RumCaneSpiritBatch>(field: K, value: RumCaneSpiritBatch[K]) => void
}

export function HeadsAddedSection({ batch, updateField }: HeadsAddedSectionProps) {
  return (
    <div className="border-t border-stone-200 pt-6">
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Heads Added to Boiler</h3>
      <div className="grid grid-cols-3 gap-6">
        <VolumeAbvLalGroup
          volumeValue={batch.heads_added_volume_l}
          abvValue={batch.heads_added_abv_percent}
          lalValue={batch.heads_added_lal}
          onVolumeChange={(v) => updateField('heads_added_volume_l', v)}
          onAbvChange={(v) => updateField('heads_added_abv_percent', v)}
          onLalChange={(v) => updateField('heads_added_lal', v)}
          volumeLabel="Volume (L)"
          abvLabel="ABV (%)"
          lalLabel="LAL"
          volumeId="heads_added_volume_l"
          abvId="heads_added_abv_percent"
          lalId="heads_added_lal"
        />
      </div>
    </div>
  )
}
