'use client'

import { Tank } from '@/modules/production/types/tank.types'

interface TankAdjustModalProps {
  tank: Tank
  abv: string
  volume: string
  notes: string
  onAbvChange: (v: string) => void
  onVolumeChange: (v: string) => void
  onNotesChange: (v: string) => void
  onSubmit: () => void
  onClose: () => void
}

export function TankAdjustModal({ tank, abv, volume, notes, onAbvChange, onVolumeChange, onNotesChange, onSubmit, onClose }: TankAdjustModalProps) {
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-copper-red text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold">Adjust Volume / ABV</h2>
          <p className="text-sm mt-1">{tank.tank_id} • {tank.tank_name}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="adjust_abv" className="block text-sm font-medium text-gray-700 mb-2">ABV (%)</label>
              <input id="adjust_abv" type="number" value={abv} onChange={(e) => onAbvChange(e.target.value)} className="w-full px-4 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper" step="0.1" min="0" max="100" placeholder="40.0" />
            </div>
            <div>
              <label htmlFor="adjust_volume" className="block text sm font-medium text-gray-700 mb-2">Volume (L)</label>
              <input id="adjust_volume" type="number" value={volume} onChange={(e) => onVolumeChange(e.target.value)} className="w-full px-4 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper" step="0.1" min="0" placeholder="500" />
            </div>
          </div>
          <div>
            <label htmlFor="adjust_notes" className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
            <input id="adjust_notes" type="text" value={notes} onChange={(e) => onNotesChange(e.target.value)} className="w-full px-4 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper" placeholder="Evaporation, transfer loss, measurement update..." />
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-between">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition">Cancel</button>
          <button onClick={onSubmit} className="px-6 py-2 bg-copper hover:bg-copper/90 text-white rounded-lg transition">Apply</button>
        </div>
      </div>
    </div>
  )
}
