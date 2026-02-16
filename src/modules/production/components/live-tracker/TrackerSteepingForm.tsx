'use client'

interface TrackerSteepingFormProps {
  data: any
  updatePhaseData: (phaseName: string, field: string, value: any) => void
}

export function TrackerSteepingForm({ data, updatePhaseData }: TrackerSteepingFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="steeping_time_hours" className="block text-sm font-medium text-gray-700 mb-1">Steeping Time (hours)</label>
          <input id="steeping_time_hours" type="number" step="0.1" value={data.steepingTime_hours || ''} onChange={(e) => updatePhaseData('Botanical Steeping', 'steepingTime_hours', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
        <div>
          <label htmlFor="steeping_temp_c" className="block text-sm font-medium text-gray-700 mb-1">Steeping Temp (°C)</label>
          <input id="steeping_temp_c" type="number" step="0.1" value={data.steepingTemp_C || ''} onChange={(e) => updatePhaseData('Botanical Steeping', 'steepingTemp_C', parseFloat(e.target.value) || null)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Optional" />
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-3">Botanicals</h4>
        <div className="space-y-3">
          {data.botanicals.map((botanical: any, index: number) => (
            <div key={index} className="flex gap-4 items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <span className="font-medium">{botanical.name}</span>
              </div>
              <div className="w-24">
                <input type="number" step="0.1" value={botanical.weight_g || ''} onChange={(e) => {
                  const newBotanicals = [...data.botanicals]
                  newBotanicals[index].weight_g = parseFloat(e.target.value) || 0
                  updatePhaseData('Botanical Steeping', 'botanicals', newBotanicals)
                }} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" placeholder="g" />
              </div>
              <div className="w-32">
                <input type="text" value={botanical.notes || ''} onChange={(e) => {
                  const newBotanicals = [...data.botanicals]
                  newBotanicals[index].notes = e.target.value
                  updatePhaseData('Botanical Steeping', 'botanicals', newBotanicals)
                }} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" placeholder="Notes" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <label htmlFor="steeping_notes" className="block text-sm font-medium text-gray-700 mb-1">Steeping Notes</label>
        <textarea id="steeping_notes" value={data.notes} onChange={(e) => updatePhaseData('Botanical Steeping', 'notes', e.target.value)} className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Steeping observations..." />
      </div>
    </div>
  )
}
