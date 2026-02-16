'use client'

import { VESSEL_OPTIONS, calculateLAL } from '../../utils/tracker-phase-init'

interface TrackerCollectionFormProps {
  phaseName: string
  data: any
  updatePhaseData: (phaseName: string, field: string, value: any) => void
}

export function TrackerCollectionForm({ phaseName, data, updatePhaseData }: TrackerCollectionFormProps) {
  const phaseKey = phaseName.toLowerCase()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`collection_volume_l_${phaseKey}`} className="block text-sm font-medium text-gray-700 mb-1">Volume (L)</label>
          <input id={`collection_volume_l_${phaseKey}`} type="number" step="0.1" value={data.volume_L || ''} onChange={(e) => updatePhaseData(phaseName, 'volume_L', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
        <div>
          <label htmlFor={`collection_abv_percent_${phaseKey}`} className="block text-sm font-medium text-gray-700 mb-1">ABV (%)</label>
          <input id={`collection_abv_percent_${phaseKey}`} type="number" step="0.1" value={data.abv_percent || ''} onChange={(e) => updatePhaseData(phaseName, 'abv_percent', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
        <div>
          <label htmlFor={`collection_density_${phaseKey}`} className="block text-sm font-medium text-gray-700 mb-1">Density</label>
          <input id={`collection_density_${phaseKey}`} type="number" step="0.001" value={data.density || ''} onChange={(e) => updatePhaseData(phaseName, 'density', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="0.814" />
        </div>
        <div>
          <label htmlFor={`collection_receiving_vessel_${phaseKey}`} className="block text-sm font-medium text-gray-700 mb-1">Receiving Vessel</label>
          <select id={`collection_receiving_vessel_${phaseKey}`} value={data.receivingVessel} onChange={(e) => updatePhaseData(phaseName, 'receivingVessel', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="">Select vessel...</option>
            {VESSEL_OPTIONS.map(vessel => (
              <option key={vessel} value={vessel}>{vessel}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`collection_destination_${phaseKey}`} className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
          <input id={`collection_destination_${phaseKey}`} type="text" value={data.destination} onChange={(e) => updatePhaseData(phaseName, 'destination', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
      </div>
      
      <div className="bg-blue-50 p-3 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>LAL:</strong> {calculateLAL(data.volume_L || 0, data.abv_percent || 0).toFixed(2)}L
        </div>
      </div>
      
      <div>
        <label htmlFor={`collection_notes_${phaseKey}`} className="block text-sm font-medium text-gray-700 mb-1">Collection Notes</label>
        <textarea id={`collection_notes_${phaseKey}`} value={data.notes} onChange={(e) => updatePhaseData(phaseName, 'notes', e.target.value)} className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder={`${phaseName} observations...`} />
      </div>
    </div>
  )
}
