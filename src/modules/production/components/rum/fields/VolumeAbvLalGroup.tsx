"use client"

import { formatABV, parseToNumber, validateOnBlur, calculateLAL, parseNumber } from '@/modules/production/utils/distillation-formatters'

interface VolumeAbvLalGroupProps {
  volumeValue: number | string | undefined | null
  abvValue: number | string | undefined | null
  lalValue: number | string | undefined | null
  onVolumeChange: (value: number | undefined) => void
  onAbvChange: (value: number | undefined) => void
  onLalChange: (value: number) => void
  volumeLabel?: string
  abvLabel?: string
  lalLabel?: string
  volumeId: string
  abvId: string
  lalId: string
  columns?: 3 | 4
}

export function VolumeAbvLalGroup({
  volumeValue,
  abvValue,
  lalValue,
  onVolumeChange,
  onAbvChange,
  onLalChange,
  volumeLabel = 'Volume (L)',
  abvLabel = 'ABV (%)',
  lalLabel = 'LAL',
  volumeId,
  abvId,
  lalId,
  columns = 3,
}: VolumeAbvLalGroupProps) {
  const gridClass = columns === 4 ? 'grid grid-cols-4 gap-6' : 'grid grid-cols-3 gap-6'
  const inputClass = 'w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600'
  const readonlyClass = 'w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-stone-600'

  return (
    <>
      <div>
        <label htmlFor={volumeId} className="block text-sm font-medium text-stone-700 mb-2">
          {volumeLabel}
        </label>
        <input
          type="text"
          id={volumeId}
          value={volumeValue ?? ''}
          onChange={(e) => onVolumeChange(parseNumber(e.target.value))}
          onBlur={(e) => {
            const vol = parseToNumber(e.target.value)
            onVolumeChange(vol)
            if (vol !== undefined && abvValue !== undefined && abvValue !== null) {
              onLalChange(calculateLAL(vol, typeof abvValue === 'string' ? parseFloat(abvValue) : abvValue))
            }
          }}
          placeholder="0.0"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor={abvId} className="block text-sm font-medium text-stone-700 mb-2">
          {abvLabel}
        </label>
        <input
          type="text"
          id={abvId}
          value={abvValue ?? ''}
          onChange={(e) => {
            const formatted = formatABV(e.target.value)
            onAbvChange(formatted ? parseFloat(formatted) : undefined)
          }}
          onBlur={(e) => {
            const validated = validateOnBlur(e.target.value, 95.0, 1)
            const abv = parseToNumber(validated)
            onAbvChange(abv)
            if (abv !== undefined && volumeValue !== undefined && volumeValue !== null) {
              onLalChange(calculateLAL(typeof volumeValue === 'string' ? parseFloat(volumeValue) : volumeValue, abv))
            }
          }}
          placeholder="0.00"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor={lalId} className="block text-sm font-medium text-stone-700 mb-2">
          {lalLabel}
        </label>
        <input
          type="number"
          step="0.01"
          id={lalId}
          value={lalValue ?? ''}
          readOnly
          className={readonlyClass}
        />
        <p className="text-xs text-stone-500 mt-1">Auto-calculated</p>
      </div>
    </>
  )
}
