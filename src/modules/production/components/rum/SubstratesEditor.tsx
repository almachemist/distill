"use client"

import { RumCaneSpiritBatch, SubstrateEntry } from "@/types/production-schemas"
import { toNum } from "./fermentation-format-utils"

interface SubstratesEditorProps {
  batch: RumCaneSpiritBatch
  updateField: <K extends keyof RumCaneSpiritBatch>(field: K, value: RumCaneSpiritBatch[K]) => void
}

export function SubstratesEditor({ batch, updateField }: SubstratesEditorProps) {
  const updateSubstrate = <K extends keyof SubstrateEntry>(index: number, field: K, value: SubstrateEntry[K]) => {
    const newSubstrates = [...(batch.substrates ?? [])]
    newSubstrates[index] = { ...newSubstrates[index], [field]: value }
    updateField('substrates', newSubstrates)
  }

  const addSubstrate = () => {
    updateField('substrates', [...(batch.substrates ?? []), { name: '', volume_l: 0 }])
  }

  const removeSubstrate = (index: number) => {
    updateField('substrates', (batch.substrates ?? []).filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="block text-sm font-medium text-stone-700">Substrate(s) Added</span>
        <button onClick={addSubstrate} className="px-3 py-1 text-xs text-amber-700 border border-amber-700 rounded-md hover:bg-amber-50">+ Add Substrate</button>
      </div>
      <p className="text-xs text-stone-500 mb-3">You can add multiple substrates (e.g., 500L cane juice + 200L molasses)</p>

      <div className="space-y-3">
        {(batch.substrates ?? []).map((substrate, index) => (
          <div key={index} className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-5">
              <label htmlFor={`substrate_name_${index}`} className="block text-xs text-stone-600 mb-1">Substrate Name</label>
              <input type="text" id={`substrate_name_${index}`} value={substrate.name}
                onChange={(e) => updateSubstrate(index, 'name', e.target.value)}
                placeholder="e.g., Cane Juice, Molasses"
                className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm" />
            </div>
            <div className="col-span-3">
              <label htmlFor={`substrate_batch_year_${index}`} className="block text-xs text-stone-600 mb-1">Batch / Year</label>
              <input type="text" id={`substrate_batch_year_${index}`} value={substrate.batch_or_year ?? ''}
                onChange={(e) => updateSubstrate(index, 'batch_or_year', e.target.value)}
                placeholder="2025" className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm" />
            </div>
            <div className="col-span-3">
              <label htmlFor={`substrate_volume_${index}`} className="block text-xs text-stone-600 mb-1">Volume (L)</label>
              <input type="number" step="0.1" id={`substrate_volume_${index}`} value={substrate.volume_l}
                onChange={(e) => updateSubstrate(index, 'volume_l', parseFloat(e.target.value) || 0)}
                placeholder="0" className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm" />
            </div>
            <div className="col-span-1">
              <button onClick={() => removeSubstrate(index)} className="w-full px-2 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm">×</button>
            </div>
          </div>
        ))}
      </div>

      {(batch.substrates ?? []).length === 0 && (
        <div className="border border-dashed border-stone-300 rounded-lg p-6 text-center text-sm text-stone-500">
          No substrates added yet. Click &quot;+ Add Substrate&quot; to add one.
        </div>
      )}

      <div className="mt-3 bg-stone-50 p-3 rounded-lg">
        <p className="text-sm text-stone-700">
          <span className="font-medium">Total Substrate Volume:</span>{' '}
          {(batch.substrates ?? []).reduce((sum, s) => sum + toNum(s.volume_l), 0).toFixed(1)} L
        </p>
      </div>
    </div>
  )
}
