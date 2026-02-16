"use client"

import { parseNumber } from '@/modules/production/utils/distillation-formatters'

interface NumberFieldProps {
  id: string
  label: string
  value: number | string | undefined | null
  onChange: (value: number | undefined) => void
  placeholder?: string
  hint?: string
}

export function NumberField({ id, label, value, onChange, placeholder = '0.0', hint }: NumberFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-stone-700 mb-2">
        {label}
      </label>
      <input
        type="text"
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(parseNumber(e.target.value))}
        onBlur={(e) => onChange(parseNumber(e.target.value))}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
      />
      {hint && <p className="text-xs text-stone-500 mt-1">{hint}</p>}
    </div>
  )
}
