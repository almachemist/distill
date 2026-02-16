'use client'

import { Tank } from '@/modules/production/types/tank.types'

interface TankCombineModalProps {
  source: Tank
  tanks: Tank[]
  selectedIds: string[]
  targetId: string
  onSelectedIdsChange: (ids: string[]) => void
  onTargetIdChange: (id: string) => void
  onSubmit: () => void
  onClose: () => void
}

export function TankCombineModal({ source, tanks, selectedIds, targetId, onSelectedIdsChange, onTargetIdChange, onSubmit, onClose }: TankCombineModalProps) {
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-blue-700 text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold">Combine Tanks</h2>
          <p className="text-sm mt-1">{source.tank_id} • {(source.current_volume_l || source.volume || 0).toFixed(0)}L @ {(source.current_abv || source.abv || 0).toFixed(1)}%</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Select destination tank</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 border rounded-lg p-3">
                <span className="sr-only">Destination {source.tank_id} {source.tank_name}</span>
                <input type="radio" checked={targetId === source.id} onChange={() => onTargetIdChange(source.id)} name="combine_destination" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{source.tank_id} • {source.tank_name} (current)</div>
                  <div className="text-sm text-gray-600">
                    {Number(source.current_volume_l || source.volume || 0).toFixed(0)}L @ {Number.isFinite(Number(source.current_abv || source.abv || 0)) ? Number(source.current_abv || source.abv || 0).toFixed(1) : '—'}%
                  </div>
                </div>
              </label>
              {tanks.filter(t => t.id !== source.id).map(t => {
                const vol = Number(t.current_volume_l || t.volume || 0)
                const abv = Number(t.current_abv || t.abv || 0)
                return (
                  <label key={t.id} className="flex items-center gap-3 border rounded-lg p-3">
                    <span className="sr-only">Destination {t.tank_id} {t.tank_name}</span>
                    <input type="radio" checked={targetId === t.id} onChange={() => onTargetIdChange(t.id)} name="combine_destination" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{t.tank_id} • {t.tank_name}</div>
                      <div className="text-sm text-gray-600">{vol.toFixed(0)}L @ {Number.isFinite(abv) ? abv.toFixed(1) : '—'}%</div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Select source tanks to merge into destination</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tanks.filter(t => t.id !== source.id && t.id !== targetId).map(t => {
                const vol = Number(t.current_volume_l || t.volume || 0)
                const abv = Number(t.current_abv || t.abv || 0)
                const checked = selectedIds.includes(t.id)
                return (
                  <label key={t.id} className="flex items-center gap-3 border rounded-lg p-3">
                    <span className="sr-only">Select {t.tank_id} {t.tank_name}</span>
                    <input type="checkbox" checked={checked} onChange={(e) => {
                      const next = e.target.checked ? [...selectedIds, t.id] : selectedIds.filter(id => id !== t.id)
                      onSelectedIdsChange(next)
                    }} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{t.tank_id} • {t.tank_name}</div>
                      <div className="text-sm text-gray-600">{vol.toFixed(0)}L @ {Number.isFinite(abv) ? abv.toFixed(1) : '—'}%</div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-between">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition">Cancel</button>
          <button onClick={onSubmit} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">Combine</button>
        </div>
      </div>
    </div>
  )
}
