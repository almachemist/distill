'use client'

import type { GinVodkaSpiritBatch } from '@/types/production-schemas'

interface CollectionPhasesSectionProps {
  batch: GinVodkaSpiritBatch
  updateField: (field: string, value: any) => void
}

export function CollectionPhasesSection({ batch, updateField }: CollectionPhasesSectionProps) {
  const output = batch.output || []

  const updateOutputRow = (index: number, field: string, value: any) => {
    const newOutput = [...output]
    newOutput[index] = { ...newOutput[index], [field]: value }
    updateField('output', newOutput)
  }

  const removeOutputRow = (index: number) => {
    updateField('output', output.filter((_, i) => i !== index))
  }

  const addOutputRow = () => {
    updateField('output', [...output, { phase: 'Hearts', volume_L: 0, abv_percent: 0, output: '', receivingVessel: '' }])
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Section 4: Collection Phases</h2>

      <p className="text-sm text-neutral-600 mb-4">
        Log each distillation phase with volume, ABV, and LAL. LAL is calculated automatically.
      </p>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-neutral-50">
            <th className="border border-neutral-300 px-4 py-2 text-left text-sm font-medium text-neutral-700">Date</th>
            <th className="border border-neutral-300 px-4 py-2 text-left text-sm font-medium text-neutral-700">Phase</th>
            <th className="border border-neutral-300 px-4 py-2 text-left text-sm font-medium text-neutral-700">Volume (L)</th>
            <th className="border border-neutral-300 px-4 py-2 text-left text-sm font-medium text-neutral-700">ABV (%)</th>
            <th className="border border-neutral-300 px-4 py-2 text-left text-sm font-medium text-neutral-700">LAL</th>
            <th className="border border-neutral-300 px-4 py-2 text-left text-sm font-medium text-neutral-700">Receiving Vessel</th>
            <th className="border border-neutral-300 px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {output.map((phase, index) => (
            <tr key={index}>
              <td className="border border-neutral-300 px-4 py-2">
                <input type="date" value={phase.date || ''} onChange={(e) => updateOutputRow(index, 'date', e.target.value)} className="w-full px-2 py-1 border border-neutral-200 rounded" />
              </td>
              <td className="border border-neutral-300 px-4 py-2">
                <select value={phase.phase || ''} onChange={(e) => updateOutputRow(index, 'phase', e.target.value)} className="w-full px-2 py-1 border border-neutral-200 rounded">
                  <option value="">Select...</option>
                  <option value="Foreshots">Foreshots</option>
                  <option value="Heads">Heads</option>
                  <option value="Hearts">Hearts</option>
                  <option value="Tails">Tails</option>
                </select>
              </td>
              <td className="border border-neutral-300 px-4 py-2">
                <input type="number" step="0.1" value={phase.volume_L || ''} onChange={(e) => updateOutputRow(index, 'volume_L', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 border border-neutral-200 rounded" />
              </td>
              <td className="border border-neutral-300 px-4 py-2">
                <input type="number" step="0.1" value={phase.abv_percent || ''} onChange={(e) => updateOutputRow(index, 'abv_percent', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 border border-neutral-200 rounded" />
              </td>
              <td className="border border-neutral-300 px-4 py-2 text-center font-medium">
                {((phase.volume_L ?? 0) * (phase.abv_percent ?? 0) * 0.01).toFixed(2)}
              </td>
              <td className="border border-neutral-300 px-4 py-2">
                <input type="text" value={phase.receivingVessel || ''} onChange={(e) => updateOutputRow(index, 'receivingVessel', e.target.value)} placeholder="Vessel name" className="w-full px-2 py-1 border border-neutral-200 rounded" />
              </td>
              <td className="border border-neutral-300 px-4 py-2">
                <button onClick={() => removeOutputRow(index)} className="text-red-600 hover:text-red-800">Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addOutputRow} className="mt-4 px-4 py-2 text-sm text-amber-700 border border-amber-700 rounded-md hover:bg-amber-50">
        Add Phase
      </button>

      <div className="bg-neutral-50 p-4 rounded-lg mt-6">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Summary by Phase</h3>
        <div className="grid grid-cols-4 gap-4">
          {['Foreshots', 'Heads', 'Hearts', 'Tails'].map(phaseName => {
            const phaseData = output.filter(p => p.phase === phaseName)
            const totalVolume = phaseData.reduce((sum, p) => sum + (p.volume_L ?? 0), 0)
            const totalLAL = phaseData.reduce((sum, p) => sum + ((p.volume_L ?? 0) * (p.abv_percent ?? 0) * 0.01), 0)
            const avgABV = totalVolume > 0 ? (totalLAL * 100.0 / totalVolume) : 0

            return (
              <div key={phaseName} className="bg-white p-3 rounded border border-neutral-200">
                <p className="text-xs text-neutral-600 mb-1">{phaseName}</p>
                <p className="text-lg font-semibold text-neutral-900">{totalVolume.toFixed(1)} L</p>
                <p className="text-xs text-neutral-600 mt-1">@ {avgABV.toFixed(1)}% ABV</p>
                <p className="text-xs text-neutral-500">{totalLAL.toFixed(2)} LAL</p>
              </div>
            )
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-neutral-300">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-600">Total Volume</p>
              <p className="text-xl font-semibold text-neutral-900">
                {output.reduce((sum, p) => sum + (p.volume_L || 0), 0).toFixed(1)} L
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Total LAL</p>
              <p className="text-xl font-semibold text-neutral-900">
                {output.reduce((sum, p) => sum + ((p.volume_L ?? 0) * (p.abv_percent ?? 0) * 0.01), 0).toFixed(2)} L
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
