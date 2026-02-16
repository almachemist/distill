'use client'

import type { GinVodkaSpiritBatch } from '@/types/production-schemas'

interface DilutionSectionProps {
  batch: GinVodkaSpiritBatch
  updateField: (field: string, value: any) => void
}

function getHeartsStats(batch: GinVodkaSpiritBatch) {
  const hearts = (batch.output ?? []).filter(p => p.phase === 'Hearts')
  const heartsVol = hearts.reduce((sum, p) => sum + (p.volume_L ?? 0), 0)
  const heartsLAL = hearts.reduce((sum, p) => sum + ((p.volume_L ?? 0) * (p.abv_percent ?? 0) * 0.01), 0)
  const heartsABV = heartsVol > 0 ? (heartsLAL * 100.0 / heartsVol) : 0
  const targetABV = batch.targetFinalABV ?? 43
  const waterNeeded = heartsVol * ((heartsABV - targetABV) / targetABV)
  return { heartsVol, heartsLAL, heartsABV, targetABV, waterNeeded }
}

export function DilutionSection({ batch, updateField }: DilutionSectionProps) {
  const { heartsVol, heartsABV, waterNeeded } = getHeartsStats(batch)
  const dilutions = batch.dilutions ?? []

  const updateDilutionRow = (index: number, field: string, value: any) => {
    const newDilutions = [...dilutions]
    newDilutions[index] = { ...newDilutions[index], [field]: value }
    updateField('dilutions', newDilutions)
  }

  const removeDilutionRow = (index: number) => {
    updateField('dilutions', dilutions.filter((_, i) => i !== index))
  }

  const addDilutionRow = () => {
    updateField('dilutions', [
      ...dilutions,
      { number: dilutions.length + 1, date: '', newMake_L: 0, filteredWater_L: 0, newVolume_L: 0, abv_percent: 0, notes: '' }
    ])
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Dilution (Hearts Cut)</h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Summary</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-blue-700">Hearts Volume (L)</p>
            <p className="text-lg font-semibold text-blue-900">{heartsVol.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-xs text-blue-700">Hearts ABV (%)</p>
            <p className="text-lg font-semibold text-blue-900">{heartsABV.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-xs text-blue-700">Target Final ABV (%)</p>
            <input type="number" step="0.1" value={batch.targetFinalABV || ''} onChange={(e) => updateField('targetFinalABV', parseFloat(e.target.value) || 0)} placeholder="43.0" className="w-full px-2 py-1 border border-blue-300 rounded text-lg font-semibold" />
          </div>
          <div>
            <p className="text-xs text-blue-700">Water Required (L)</p>
            <p className="text-lg font-semibold text-blue-900">{waterNeeded > 0 ? waterNeeded.toFixed(1) : '0.0'}</p>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Water Additions</h3>
      <p className="text-sm text-neutral-600 mb-4">
        Track progressive water additions. Remaining water is calculated after each entry.
      </p>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-neutral-50">
            <th className="border border-neutral-300 px-4 py-2 text-left text-sm font-medium text-neutral-700">Date</th>
            <th className="border border-neutral-300 px-4 py-2 text-left text-sm font-medium text-neutral-700">Water Added (L)</th>
            <th className="border border-neutral-300 px-4 py-2 text-left text-sm font-medium text-neutral-700">Remaining (L)</th>
            <th className="border border-neutral-300 px-4 py-2 text-left text-sm font-medium text-neutral-700">Temp (°C)</th>
            <th className="border border-neutral-300 px-4 py-2 text-left text-sm font-medium text-neutral-700">ABV (%)</th>
            <th className="border border-neutral-300 px-4 py-2 text-left text-sm font-medium text-neutral-700">Notes</th>
            <th className="border border-neutral-300 px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {dilutions.map((dilution, index) => {
            const waterUsed = dilutions.slice(0, index).reduce((sum, d) => sum + (d.filteredWater_L ?? 0), 0)
            const remaining = waterNeeded - waterUsed - (dilution.filteredWater_L ?? 0)

            return (
              <tr key={index}>
                <td className="border border-neutral-300 px-4 py-2">
                  <input type="date" value={dilution.date || ''} onChange={(e) => updateDilutionRow(index, 'date', e.target.value)} className="w-full px-2 py-1 border border-neutral-200 rounded" />
                </td>
                <td className="border border-neutral-300 px-4 py-2">
                  <input type="number" step="0.1" value={dilution.filteredWater_L || ''} onChange={(e) => updateDilutionRow(index, 'filteredWater_L', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 border border-neutral-200 rounded" />
                </td>
                <td className="border border-neutral-300 px-4 py-2 text-center font-medium">{remaining.toFixed(1)}</td>
                <td className="border border-neutral-300 px-4 py-2">
                  <input type="number" step="0.1" value={dilution.temperature_C || ''} onChange={(e) => updateDilutionRow(index, 'temperature_C', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 border border-neutral-200 rounded" />
                </td>
                <td className="border border-neutral-300 px-4 py-2">
                  <input type="number" step="0.1" value={dilution.abv_percent || ''} onChange={(e) => updateDilutionRow(index, 'abv_percent', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 border border-neutral-200 rounded" />
                </td>
                <td className="border border-neutral-300 px-4 py-2">
                  <input type="text" value={dilution.notes || ''} onChange={(e) => updateDilutionRow(index, 'notes', e.target.value)} placeholder="First dilution stage" className="w-full px-2 py-1 border border-neutral-200 rounded" />
                </td>
                <td className="border border-neutral-300 px-4 py-2">
                  <button onClick={() => removeDilutionRow(index)} className="text-red-600 hover:text-red-800">Remove</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <button onClick={addDilutionRow} className="mt-4 px-4 py-2 text-sm text-amber-700 border border-amber-700 rounded-md hover:bg-amber-50">
        Add Dilution Step
      </button>
    </div>
  )
}
