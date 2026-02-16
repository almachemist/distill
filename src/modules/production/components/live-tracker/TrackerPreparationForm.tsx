'use client'

import { STILL_OPTIONS } from '../../utils/tracker-phase-init'

interface TrackerPreparationFormProps {
  data: any
  viewMode: string
  updatePhaseData: (phaseName: string, field: string, value: any) => void
  addOtherComponent: () => void
  removeOtherComponent: (index: number) => void
  updateOtherComponent: (index: number, field: string, value: any) => void
}

export function TrackerPreparationForm({
  data,
  viewMode,
  updatePhaseData,
  addOtherComponent,
  removeOtherComponent,
  updateOtherComponent,
}: TrackerPreparationFormProps) {
  const disabled = viewMode !== 'draft'
  const disabledClass = disabled ? 'bg-gray-100 cursor-not-allowed' : ''

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="prep_ethanol_added_l" className="block text-sm font-medium text-gray-700 mb-1">Ethanol Added (L)</label>
        <input id="prep_ethanol_added_l" type="number" step="0.1" value={data.ethanolAdded_L || ''} onChange={(e) => updatePhaseData('Preparation', 'ethanolAdded_L', parseFloat(e.target.value) || 0)} disabled={disabled} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${disabledClass}`} />
      </div>
      <div>
        <label htmlFor="prep_ethanol_abv_percent" className="block text-sm font-medium text-gray-700 mb-1">Ethanol ABV (%)</label>
        <input id="prep_ethanol_abv_percent" type="number" step="0.1" value={data.ethanolABV_percent || ''} onChange={(e) => updatePhaseData('Preparation', 'ethanolABV_percent', parseFloat(e.target.value) || 0)} disabled={disabled} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${disabledClass}`} />
      </div>
      <div>
        <label htmlFor="prep_water_added_l" className="block text-sm font-medium text-gray-700 mb-1">Water Added (L)</label>
        <input id="prep_water_added_l" type="number" step="0.1" value={data.waterAdded_L || ''} onChange={(e) => updatePhaseData('Preparation', 'waterAdded_L', parseFloat(e.target.value) || 0)} disabled={disabled} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${disabledClass}`} />
      </div>
      <div>
        <label htmlFor="prep_still_used" className="block text-sm font-medium text-gray-700 mb-1">Still Used</label>
        <select id="prep_still_used" value={data.stillUsed} onChange={(e) => updatePhaseData('Preparation', 'stillUsed', e.target.value)} disabled={disabled} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${disabledClass}`}>
          {STILL_OPTIONS.map(still => (
            <option key={still} value={still}>{still}</option>
          ))}
        </select>
      </div>
      
      {/* Others Section */}
      <div className="md:col-span-2">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-lg font-medium text-gray-900">Other Components</h4>
          <button onClick={addOtherComponent} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
            Add Component
          </button>
        </div>
        
        {data.others && data.others.length > 0 ? (
          <div className="space-y-3">
            {data.others.map((other: any, index: number) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
                <div>
                  <label htmlFor={`prep_other_name_${index}`} className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                  <input id={`prep_other_name_${index}`} type="text" value={other.name} onChange={(e) => updateOtherComponent(index, 'name', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" placeholder="e.g., Vodka, Rum" />
                </div>
                <div>
                  <label htmlFor={`prep_other_volume_l_${index}`} className="block text-xs font-medium text-gray-600 mb-1">Volume (L)</label>
                  <input id={`prep_other_volume_l_${index}`} type="number" step="0.1" value={other.volume_L || ''} onChange={(e) => updateOtherComponent(index, 'volume_L', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
                </div>
                <div>
                  <label htmlFor={`prep_other_abv_percent_${index}`} className="block text-xs font-medium text-gray-600 mb-1">ABV (%)</label>
                  <input id={`prep_other_abv_percent_${index}`} type="number" step="0.1" value={other.abv_percent || ''} onChange={(e) => updateOtherComponent(index, 'abv_percent', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label htmlFor={`prep_other_notes_${index}`} className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                    <input id={`prep_other_notes_${index}`} type="text" value={other.notes} onChange={(e) => updateOtherComponent(index, 'notes', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" placeholder="Optional" />
                  </div>
                  <button onClick={() => removeOtherComponent(index)} className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No other components added yet</p>
            <p className="text-sm">Click &quot;Add Component&quot; to add vodka, rum, or other spirits</p>
          </div>
        )}
      </div>
      
      <div className="md:col-span-2">
        <label htmlFor="prep_notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea id="prep_notes" value={data.notes} onChange={(e) => updatePhaseData('Preparation', 'notes', e.target.value)} className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Preparation notes..." />
      </div>
    </div>
  )
}
