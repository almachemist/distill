'use client'

import { Tank } from '@/modules/production/types/tank.types'

interface TankInfusionModalProps {
  tank: Tank
  infusionType: string
  botanicals: Array<{ id: string; name: string; unit: string; currentStock: number }>
  botanicalSearch: string
  infusionItems: Array<{ id: string; name: string; unit: string; quantity: number }>
  onInfusionTypeChange: (v: string) => void
  onBotanicalSearchChange: (v: string) => void
  onInfusionItemsChange: (items: Array<{ id: string; name: string; unit: string; quantity: number }>) => void
  onSubmit: () => void
  onClose: () => void
}

export function TankInfusionModal({ tank, infusionType, botanicals, botanicalSearch, infusionItems, onInfusionTypeChange, onBotanicalSearchChange, onInfusionItemsChange, onSubmit, onClose }: TankInfusionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-copper-amber text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold">Add Ingredients / Infusion</h2>
          <p className="text-sm mt-1">{tank.tank_id} • {tank.tank_name}</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="infusion_type" className="block text-sm font-medium text-gray-700 mb-2">Infusion type</label>
            <input id="infusion_type" type="text" value={infusionType} onChange={(e) => onInfusionTypeChange(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="coffee, spice, vanilla..." />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700 mb-2">Botanicals</div>
              <input type="text" value={botanicalSearch} onChange={(e) => onBotanicalSearchChange(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm" placeholder="Search..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {botanicals
                .filter(b => b.name.toLowerCase().includes(botanicalSearch.toLowerCase()))
                .map(b => {
                  const existing = infusionItems.find(it => it.id === b.id)
                  return (
                    <div key={b.id} className="border rounded-lg p-3 flex items-center gap-3">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{b.name}</div>
                        <div className="text-xs text-gray-600">Available: {b.currentStock} {b.unit}</div>
                      </div>
                      <input
                        type="number"
                        value={existing?.quantity?.toString() || ''}
                        onChange={(e) => {
                          const q = e.target.value === '' ? 0 : Number(e.target.value)
                          const others = infusionItems.filter(it => it.id !== b.id)
                          onInfusionItemsChange([...others, { id: b.id, name: b.name, unit: b.unit, quantity: Number.isFinite(q) ? q : 0 }])
                        }}
                        className="w-24 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                        placeholder={`0 ${b.unit}`}
                        min="0"
                        step="0.1"
                      />
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-between">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition">Cancel</button>
          <button onClick={onSubmit} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">Apply</button>
        </div>
      </div>
    </div>
  )
}
