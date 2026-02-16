"use client"

interface TimeFieldProps {
  id: string
  label: string
  value: string | undefined | null
  onChange: (value: string) => void
}

export function TimeField({ id, label, value, onChange }: TimeFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-stone-700 mb-2">
        {label}
      </label>
      <input
        type="time"
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
      />
    </div>
  )
}
