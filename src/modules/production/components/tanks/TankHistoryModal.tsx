'use client'

import { Tank, TankHistoryEntry } from '@/modules/production/types/tank.types'

interface TankHistoryModalProps {
  tank: Tank
  entries: TankHistoryEntry[]
  onClose: () => void
}

export function TankHistoryModal({ tank, entries, onClose }: TankHistoryModalProps) {
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gray-800 text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold">Tank History</h2>
          <p className="text-sm mt-1">{tank.tank_id} • {tank.tank_name}</p>
        </div>
        <div className="p-6 space-y-3">
          {entries.length === 0 ? (
            <div className="text-gray-600 text-sm">No history entries found.</div>
          ) : (
            entries.map((h) => (
              <div key={h.id} className="border rounded-lg p-3">
                <div className="text-sm text-gray-900">{new Date(h.created_at).toLocaleString()}</div>
                <div className="text-sm font-semibold text-gray-800">{h.action}</div>
                {h.notes && <div className="text-sm text-gray-600">{h.notes}</div>}
                {h.previous_values || h.new_values ? (
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="border rounded-lg p-2">
                      <div className="font-medium text-gray-700">Previous</div>
                      <div className="text-gray-800">
                        <div>Tank Name: {String((h.previous_values as any)?.tank_name ?? '—')}</div>
                        <div>Product: {String((h.previous_values as any)?.product ?? '—')}</div>
                        <div>ABV: {(() => { const v = (h.previous_values as any)?.current_abv; return v === null || v === undefined ? '—' : `${Number(v).toFixed(2)}%` })()}</div>
                        <div>Volume: {(() => { const v = (h.previous_values as any)?.current_volume_l; return v === null || v === undefined ? '—' : `${Number(v).toFixed(2)} L` })()}</div>
                        <div>Status: {String((h.previous_values as any)?.status ?? '—')}</div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-2">
                      <div className="font-medium text-gray-700">New</div>
                      <div className="text-gray-800">
                        <div>Tank Name: {String((h.new_values as any)?.tank_name ?? '—')}</div>
                        <div>Product: {String((h.new_values as any)?.product ?? '—')}</div>
                        <div>ABV: {(() => { const v = (h.new_values as any)?.current_abv; return v === null || v === undefined ? '—' : `${Number(v).toFixed(2)}%` })()}</div>
                        <div>Volume: {(() => { const v = (h.new_values as any)?.current_volume_l; return v === null || v === undefined ? '—' : `${Number(v).toFixed(2)} L` })()}</div>
                        <div>Status: {String((h.new_values as any)?.status ?? '—')}</div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition">Close</button>
        </div>
      </div>
    </div>
  )
}
