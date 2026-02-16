"use client"

import { formatABV, parseToNumber, validateOnBlur } from '@/modules/production/utils/distillation-formatters'

interface AbvFieldProps {
  id: string
  label: string
  value: number | string | undefined | null
  onChange: (value: number | undefined) => void
  onBlurExtra?: (abv: number | undefined) => void
  max?: number
}

export function AbvField({ id, label, value, onChange, onBlurExtra, max = 95.0 }: AbvFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-stone-700 mb-2">
        {label}
      </label>
      <input
        type="text"
        id={id}
        value={value ?? ''}
        onChange={(e) => {
          const formatted = formatABV(e.target.value)
          onChange(formatted ? parseFloat(formatted) : undefined)
        }}
        onBlur={(e) => {
          const validated = validateOnBlur(e.target.value, max, 1)
          const abv = parseToNumber(validated)
          onChange(abv)
          onBlurExtra?.(abv)
        }}
        placeholder="0.00"
        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
      />
    </div>
  )
}
