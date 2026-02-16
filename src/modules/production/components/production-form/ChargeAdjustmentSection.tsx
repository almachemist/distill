'use client'

import type { GinVodkaSpiritBatch } from '@/types/production-schemas'

interface ChargeAdjustmentSectionProps {
  batch: GinVodkaSpiritBatch
  updateNestedField: (section: string, field: string, value: any) => void
}

export function ChargeAdjustmentSection({ batch, updateNestedField }: ChargeAdjustmentSectionProps) {
  const components = batch.chargeAdjustment?.components || []

  const updateComponent = (index: number, field: string, value: any) => {
    const newComponents = [...components]
    newComponents[index] = { ...newComponents[index], [field]: value }
    updateNestedField('chargeAdjustment', 'components', newComponents)
  }

  const removeComponent = (index: number) => {
    const newComponents = components.filter((_, i) => i !== index)
    updateNestedField('chargeAdjustment', 'components', newComponents)
  }

  const addComponent = () => {
    const newComponents = [...components, { type: '', source: '', volume_L: 0, abv_percent: 0 }]
    updateNestedField('chargeAdjustment', 'components', newComponents)
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Charge Adjustment</h2>
      
      <div className="mb-6">
        <p className="text-sm text-neutral-600 mb-4">
          List each ingredient in the charge with volume and ABV. LAL is calculated automatically.
        </p>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-neutral-50">
              <th className="border border-neutral-300 px-4 py-2 text-left text-sm font-medium text-neutral-700">Type</th>
              <th className="border border-neutral-300 px-4 py-2 text-left text-sm font-medium text-neutral-700">Source</th>
              <th className="border border-neutral-300 px-4 py-2 text-left text-sm font-medium text-neutral-700">Volume (L)</th>
              <th className="border border-neutral-300 px-4 py-2 text-left text-sm font-medium text-neutral-700">ABV (%)</th>
              <th className="border border-neutral-300 px-4 py-2 text-left text-sm font-medium text-neutral-700">LAL</th>
              <th className="border border-neutral-300 px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {components.map((component, index) => (
              <tr key={index}>
                <td className="border border-neutral-300 px-4 py-2">
                  <input type="text" value={component.type || ''} onChange={(e) => updateComponent(index, 'type', e.target.value)} placeholder="Ethanol" className="w-full px-2 py-1 border border-neutral-200 rounded" />
                </td>
                <td className="border border-neutral-300 px-4 py-2">
                  <input type="text" value={component.source || ''} onChange={(e) => updateComponent(index, 'source', e.target.value)} placeholder="Manildra NC96" className="w-full px-2 py-1 border border-neutral-200 rounded" />
                </td>
                <td className="border border-neutral-300 px-4 py-2">
                  <input type="number" step="0.1" value={component.volume_L || ''} onChange={(e) => updateComponent(index, 'volume_L', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 border border-neutral-200 rounded" />
                </td>
                <td className="border border-neutral-300 px-4 py-2">
                  <input type="number" step="0.1" value={component.abv_percent || ''} onChange={(e) => updateComponent(index, 'abv_percent', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 border border-neutral-200 rounded" />
                </td>
                <td className="border border-neutral-300 px-4 py-2 text-center font-medium">
                  {((component.volume_L ?? 0) * (component.abv_percent ?? 0) * 0.01).toFixed(2)}
                </td>
                <td className="border border-neutral-300 px-4 py-2">
                  <button onClick={() => removeComponent(index)} className="text-red-600 hover:text-red-800">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={addComponent} className="mt-4 px-4 py-2 text-sm text-amber-700 border border-amber-700 rounded-md hover:bg-amber-50">
          Add Component
        </button>
      </div>

      <div className="bg-neutral-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-neutral-600">Total Volume</p>
            <p className="text-2xl font-semibold text-neutral-900">
              {components.reduce((sum, c) => sum + (c.volume_L ?? 0), 0).toFixed(1)} L
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-600">Total LAL</p>
            <p className="text-2xl font-semibold text-neutral-900">
              {components.reduce((sum, c) => sum + ((c.volume_L ?? 0) * (c.abv_percent ?? 0) * 0.01), 0).toFixed(2)} L
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
