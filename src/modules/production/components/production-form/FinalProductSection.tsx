'use client'

import type { GinVodkaSpiritBatch } from '@/types/production-schemas'

interface FinalProductSectionProps {
  batch: GinVodkaSpiritBatch
  updateField: (field: string, value: any) => void
  updateNestedField: (section: string, field: string, value: any) => void
}

export function FinalProductSection({ batch, updateField, updateNestedField }: FinalProductSectionProps) {
  const hearts = (batch.output || []).filter(p => p.phase === 'Hearts')
  const heartsVol = hearts.reduce((sum, p) => sum + (p.volume_L || 0), 0)
  const heartsLAL = hearts.reduce((sum, p) => sum + ((p.volume_L ?? 0) * (p.abv_percent ?? 0) * 0.01), 0)
  const waterAdded = (batch.dilutions || []).reduce((sum, d) => sum + (d.filteredWater_L || 0), 0)
  const autoVolume = heartsVol + waterAdded
  const autoBottles = Math.floor(((batch.finalOutput?.totalVolume_L || 0) * 1000) / (batch.bottleSize_ml || 700))

  return (
    <div>
      <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Final Product & Bottling</h2>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="final_total_volume_l" className="block text-sm font-medium text-neutral-700 mb-2">Final Volume (L)</label>
          <input id="final_total_volume_l" type="number" step="0.1" value={batch.finalOutput?.totalVolume_L || ''} onChange={(e) => updateNestedField('finalOutput', 'totalVolume_L', parseFloat(e.target.value) || 0)} placeholder="Auto-calculated or manual" className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
          <p className="text-xs text-neutral-500 mt-1">Auto: Hearts + Water = {autoVolume.toFixed(1)} L</p>
        </div>

        <div>
          <label htmlFor="final_abv_percent" className="block text-sm font-medium text-neutral-700 mb-2">Final ABV (%)</label>
          <input id="final_abv_percent" type="number" step="0.1" value={batch.finalOutput?.abv_percent || ''} onChange={(e) => updateNestedField('finalOutput', 'abv_percent', parseFloat(e.target.value) || 0)} placeholder="Measured ABV" className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
        </div>

        <div>
          <label htmlFor="final_lal" className="block text-sm font-medium text-neutral-700 mb-2">Final LAL</label>
          <input id="final_lal" type="number" step="0.01" value={batch.finalOutput?.lal || ''} onChange={(e) => updateNestedField('finalOutput', 'lal', parseFloat(e.target.value) || 0)} placeholder="Auto-calculated" className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
          <p className="text-xs text-neutral-500 mt-1">Auto: {heartsLAL.toFixed(2)} L</p>
        </div>

        <div>
          <label htmlFor="final_bottling_date" className="block text-sm font-medium text-neutral-700 mb-2">Bottling Date</label>
          <input id="final_bottling_date" type="date" value={batch.bottlingDate || ''} onChange={(e) => updateField('bottlingDate', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
        </div>

        <div>
          <label htmlFor="final_bottle_size_ml" className="block text-sm font-medium text-neutral-700 mb-2">Bottle Size (ml)</label>
          <select id="final_bottle_size_ml" value={batch.bottleSize_ml || ''} onChange={(e) => updateField('bottleSize_ml', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600">
            <option value="">Select size...</option>
            <option value="200">200 ml</option>
            <option value="700">700 ml</option>
            <option value="1000">1000 ml</option>
          </select>
        </div>

        <div>
          <label htmlFor="final_total_bottles" className="block text-sm font-medium text-neutral-700 mb-2">Total Bottles</label>
          <input id="final_total_bottles" type="number" value={batch.totalBottles || ''} onChange={(e) => updateField('totalBottles', parseInt(e.target.value) || 0)} placeholder="Auto-calculated" className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
          <p className="text-xs text-neutral-500 mt-1">Auto: {autoBottles} bottles</p>
        </div>

        <div className="col-span-2">
          <label htmlFor="final_notes" className="block text-sm font-medium text-neutral-700 mb-2">Notes</label>
          <textarea id="final_notes" value={batch.finalOutput?.notes || ''} onChange={(e) => updateNestedField('finalOutput', 'notes', e.target.value)} placeholder="Batch #5, Rainforest Gin..." rows={3} className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-4">Batch Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-green-700">Final Volume</p>
            <p className="text-2xl font-semibold text-green-900">{batch.finalOutput?.totalVolume_L || 0} L</p>
          </div>
          <div>
            <p className="text-sm text-green-700">Final ABV</p>
            <p className="text-2xl font-semibold text-green-900">{batch.finalOutput?.abv_percent || 0}%</p>
          </div>
          <div>
            <p className="text-sm text-green-700">Total Bottles</p>
            <p className="text-2xl font-semibold text-green-900">{batch.totalBottles || 0}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
