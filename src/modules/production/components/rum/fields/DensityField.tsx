"use client"

import { formatDensity, parseToNumber, validateOnBlur } from '@/modules/production/utils/distillation-formatters'

interface DensityFieldProps {
  id: string
  label: string
  value: number | string | undefined | null
  onChange: (value: number | undefined) => void
}

export function DensityField({ id, label, value, onChange }: DensityFieldProps) {
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
          const formatted = formatDensity(e.target.value)
          onChange(formatted ? parseFloat(formatted) : undefined)
        }}
        onBlur={(e) => {
          const validated = validateOnBlur(e.target.value, 2, 3)
          onChange(parseToNumber(validated))
        }}
        placeholder="0.000"
        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
      />
    </div>
  )
}
