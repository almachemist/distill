'use client'

interface TrackerHeatingFormProps {
  data: any
  updatePhaseData: (phaseName: string, field: string, value: any) => void
}

export function TrackerHeatingForm({ data, updatePhaseData }: TrackerHeatingFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label htmlFor="heating_elements_on" className="block text-sm font-medium text-gray-700 mb-1">Elements On</label>
        <input id="heating_elements_on" type="number" value={data.elementsOn || ''} onChange={(e) => updatePhaseData('Heating', 'elementsOn', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
      </div>
      <div>
        <label htmlFor="heating_amperage_a" className="block text-sm font-medium text-gray-700 mb-1">Amperage (A)</label>
        <input id="heating_amperage_a" type="number" step="0.1" value={data.amperage_A || ''} onChange={(e) => updatePhaseData('Heating', 'amperage_A', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
      </div>
      <div>
        <label htmlFor="heating_power_kw" className="block text-sm font-medium text-gray-700 mb-1">Power (kW)</label>
        <input id="heating_power_kw" type="number" step="0.1" value={data.power_kW || ''} onChange={(e) => updatePhaseData('Heating', 'power_kW', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
      </div>
      <div className="md:col-span-3">
        <label htmlFor="heating_notes" className="block text-sm font-medium text-gray-700 mb-1">Heating Notes</label>
        <textarea id="heating_notes" value={data.notes} onChange={(e) => updatePhaseData('Heating', 'notes', e.target.value)} className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Heating observations..." />
      </div>
    </div>
  )
}
