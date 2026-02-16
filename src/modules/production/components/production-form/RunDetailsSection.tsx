'use client'

import type { GinVodkaSpiritBatch } from '@/types/production-schemas'

interface RunDetailsSectionProps {
  batch: GinVodkaSpiritBatch
  updateField: (field: string, value: any) => void
}

export function RunDetailsSection({ batch, updateField }: RunDetailsSectionProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Run Details</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="run_spirit_run_id" className="block text-sm font-medium text-neutral-700 mb-2">Spirits Run ID</label>
          <input id="run_spirit_run_id" type="text" value={batch.spiritRunId || ''} onChange={(e) => updateField('spiritRunId', e.target.value)} placeholder="RUN-20250415-001" className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
        </div>
        <div>
          <label htmlFor="run_sku" className="block text-sm font-medium text-neutral-700 mb-2">SKU</label>
          <input id="run_sku" type="text" value={batch.sku || ''} onChange={(e) => updateField('sku', e.target.value)} placeholder="GIN-R01" className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
        </div>
        <div>
          <label htmlFor="run_date" className="block text-sm font-medium text-neutral-700 mb-2">Date</label>
          <input id="run_date" type="date" value={batch.date || ''} onChange={(e) => updateField('date', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
        </div>
        <div>
          <label htmlFor="run_boiler_start_time" className="block text-sm font-medium text-neutral-700 mb-2">Boiler Start Time</label>
          <input id="run_boiler_start_time" type="time" value={batch.boilerStartTime || ''} onChange={(e) => updateField('boilerStartTime', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
        </div>
        <div className="col-span-2">
          <label htmlFor="run_still_used" className="block text-sm font-medium text-neutral-700 mb-2">Still Used</label>
          <select id="run_still_used" value={batch.stillUsed || ''} onChange={(e) => updateField('stillUsed', e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600">
            <option value="">Select still...</option>
            <option value="Roberta 1000L">Roberta 1000L</option>
            <option value="Carrie 1000L">Carrie 1000L</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  )
}
