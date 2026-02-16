"use client"

import { RumCaneSpiritBatch } from '@/types/production-schemas'
import { VolumeAbvLalGroup } from '../fields'

interface RetortSectionProps {
  batch: RumCaneSpiritBatch
  updateField: <K extends keyof RumCaneSpiritBatch>(field: K, value: RumCaneSpiritBatch[K]) => void
  retortNumber: 1 | 2
}

export function RetortSection({ batch, updateField, retortNumber }: RetortSectionProps) {
  const label = retortNumber === 1 ? 'Retort 1 (Right)' : 'Retort 2 (Left)'
  const prefix = retortNumber === 1 ? 'retort1' : 'retort2'
  const contentField = `${prefix}_content` as keyof RumCaneSpiritBatch
  const volumeField = `${prefix}_volume_l` as keyof RumCaneSpiritBatch
  const abvField = `${prefix}_abv_percent` as keyof RumCaneSpiritBatch
  const lalField = `${prefix}_lal` as keyof RumCaneSpiritBatch
  const rLabel = retortNumber === 1 ? 'R1' : 'R2'

  return (
    <div className="border-t border-stone-200 pt-6">
      <h3 className="text-lg font-semibold text-stone-900 mb-4">{label}</h3>
      <div className="grid grid-cols-4 gap-6">
        <div>
          <label htmlFor={contentField} className="block text-sm font-medium text-stone-700 mb-2">
            Content
          </label>
          <input
            type="text"
            id={contentField}
            value={(batch[contentField] as string) ?? ''}
            onChange={(e) => updateField(contentField, e.target.value as never)}
            placeholder={retortNumber === 1 ? 'e.g., Heads' : 'e.g., Tails'}
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>
        <VolumeAbvLalGroup
          volumeValue={batch[volumeField] as number | undefined}
          abvValue={batch[abvField] as number | undefined}
          lalValue={batch[lalField] as number | undefined}
          onVolumeChange={(v) => updateField(volumeField, v as never)}
          onAbvChange={(v) => updateField(abvField, v as never)}
          onLalChange={(v) => updateField(lalField, v as never)}
          volumeLabel={`${rLabel} Volume (L)`}
          abvLabel={`${rLabel} ABV (%)`}
          lalLabel={`${rLabel} LAL`}
          volumeId={String(volumeField)}
          abvId={String(abvField)}
          lalId={String(lalField)}
        />
      </div>
    </div>
  )
}
