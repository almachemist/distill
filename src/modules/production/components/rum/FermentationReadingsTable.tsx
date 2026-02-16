"use client"

import { RumCaneSpiritBatch, FermentationReading } from "@/types/production-schemas"
import { formatPH, formatDecimal, parseToNumber, validateOnBlur } from "./fermentation-format-utils"

interface FermentationReadingsTableProps {
  batch: RumCaneSpiritBatch
  updateField: <K extends keyof RumCaneSpiritBatch>(field: K, value: RumCaneSpiritBatch[K]) => void
}

export function FermentationReadingsTable({ batch, updateField }: FermentationReadingsTableProps) {
  const updateReading = <K extends keyof FermentationReading>(index: number, field: K, value: FermentationReading[K]) => {
    const newReadings = [...(batch.fermentation_readings ?? [])]
    newReadings[index] = { ...newReadings[index], [field]: value }
    updateField('fermentation_readings', newReadings)
  }

  const initializeReadings = () => {
    if ((batch.fermentation_readings ?? []).length === 0) {
      updateField('fermentation_readings', [
        { hours: 24 }, { hours: 48 }, { hours: 72 }, { hours: 96 }, { hours: 120 }
      ])
    }
  }

  return (
    <div className="border-t border-stone-200 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-stone-900">Fermentation Monitoring</h3>
        <button onClick={initializeReadings}
          className="px-3 py-1 text-xs text-amber-700 border border-amber-700 rounded-md hover:bg-amber-50">
          Initialize Readings (24h, 48h, 72h, 96h, 120h)
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-stone-100">
              <th className="border border-stone-300 px-3 py-2 text-left">Time</th>
              <th className="border border-stone-300 px-3 py-2 text-left">Temperature (°C)</th>
              <th className="border border-stone-300 px-3 py-2 text-left">Brix</th>
              <th className="border border-stone-300 px-3 py-2 text-left">pH</th>
            </tr>
          </thead>
          <tbody>
            {(batch.fermentation_readings ?? []).map((reading, index) => (
              <tr key={index}>
                <td className="border border-stone-300 px-3 py-2 font-medium">{reading.hours}h</td>
                <td className="border border-stone-300 px-3 py-2">
                  <input type="text" value={reading.temperature_c ?? ''}
                    onChange={(e) => {
                      const formatted = formatDecimal(e.target.value)
                      updateReading(index, 'temperature_c', formatted ? parseFloat(formatted) : undefined)
                    }}
                    onBlur={(e) => {
                      const validated = validateOnBlur(e.target.value, 99.9, 1)
                      updateReading(index, 'temperature_c', parseToNumber(validated))
                    }}
                    placeholder="0.0" className="w-full px-2 py-1 border border-stone-200 rounded" />
                </td>
                <td className="border border-stone-300 px-3 py-2">
                  <input type="text" value={reading.brix ?? ''}
                    onChange={(e) => {
                      const formatted = formatDecimal(e.target.value)
                      updateReading(index, 'brix', formatted ? parseFloat(formatted) : undefined)
                    }}
                    onBlur={(e) => {
                      const validated = validateOnBlur(e.target.value, 40)
                      updateReading(index, 'brix', parseToNumber(validated))
                    }}
                    placeholder="0.0" className="w-full px-2 py-1 border border-stone-200 rounded" />
                </td>
                <td className="border border-stone-300 px-3 py-2">
                  <input type="text" value={reading.ph ?? ''}
                    onChange={(e) => {
                      const formatted = formatPH(e.target.value)
                      updateReading(index, 'ph', formatted ? parseFloat(formatted) : undefined)
                    }}
                    onBlur={(e) => {
                      const validated = validateOnBlur(e.target.value, 14, 2)
                      updateReading(index, 'ph', parseToNumber(validated))
                    }}
                    placeholder="0.00" className="w-full px-2 py-1 border border-stone-200 rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(batch.fermentation_readings ?? []).length === 0 && (
        <div className="border border-dashed border-stone-300 rounded-lg p-6 text-center text-sm text-stone-500">
          No readings yet. Click &quot;Initialize Readings&quot; to add monitoring points.
        </div>
      )}
    </div>
  )
}
