'use client'

import type { BatchNew } from '@/modules/production/new-model/types/batch.types'
import { fmt, parseNum, calculateLAL } from './batch-edit-utils'

interface ChargeEditorProps {
  charge: BatchNew['charge']
  setEditedBatch: React.Dispatch<React.SetStateAction<BatchNew>>
  updateField: (path: string[], value: any) => void
}

export function ChargeEditor({ charge, setEditedBatch, updateField }: ChargeEditorProps) {
  if (!charge) return null

  return (
    <div className="bg-copper-5 rounded-xl p-4 border border-copper-15">
      <h3 className="text-lg font-semibold text-graphite mb-4">Charge Total</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="charge_total_volume_l" className="block text-sm font-medium text-graphite mb-1">Volume (L)</label>
          <input
            id="charge_total_volume_l"
            type="number"
            step="0.1"
            value={fmt(charge.total.volume_l)}
            onChange={(e) => {
              const newVolume = parseNum(e.target.value)
              setEditedBatch(prev => {
                const clone = JSON.parse(JSON.stringify(prev))
                const currentABV = clone.charge.total.abv_percent
                const newLAL = calculateLAL(newVolume, currentABV)
                clone.charge.total.volume_l = newVolume
                clone.charge.total.lal = newLAL !== null ? newLAL : null
                return clone
              })
            }}
            className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
          />
        </div>
        <div>
          <label htmlFor="charge_total_abv_percent" className="block text-sm font-medium text-graphite mb-1">ABV (%)</label>
          <input
            id="charge_total_abv_percent"
            type="number"
            step="0.1"
            min="0"
            max="96"
            value={fmt(charge.total.abv_percent)}
            onChange={(e) => {
              const newABV = parseNum(e.target.value)
              setEditedBatch(prev => {
                const clone = JSON.parse(JSON.stringify(prev))
                const currentVolume = clone.charge.total.volume_l
                const newLAL = calculateLAL(currentVolume, newABV)
                clone.charge.total.abv_percent = newABV
                clone.charge.total.lal = newLAL !== null ? newLAL : null
                return clone
              })
            }}
            className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
          />
        </div>
        <div>
          <label htmlFor="charge_total_lal" className="block text-sm font-medium text-graphite mb-1">LAL (auto-calculated)</label>
          <input
            id="charge_total_lal"
            type="number"
            step="0.1"
            value={fmt(charge.total.lal)}
            onChange={(e) => updateField(['charge', 'total', 'lal'], parseNum(e.target.value))}
            className="w-full px-3 py-2 border border-copper-15 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-beige"
            placeholder="Auto"
          />
        </div>
      </div>

      {/* Charge Components */}
      {charge.components && charge.components.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-graphite mb-2">Components</h4>
          <div className="space-y-3">
            {charge.components.map((comp, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 border border-copper-15">
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label htmlFor={`comp_${idx}_source`} className="block text-xs font-medium text-graphite mb-1">Source</label>
                    <input
                      id={`comp_${idx}_source`}
                      type="text"
                      value={comp.source}
                      onChange={(e) => {
                        const newComps = [...charge.components]
                        newComps[idx] = { ...newComps[idx], source: e.target.value }
                        updateField(['charge', 'components'], newComps)
                      }}
                      className="w-full px-2 py-1 text-sm border border-copper-30 rounded focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor={`comp_${idx}_volume_l`} className="block text-xs font-medium text-graphite mb-1">Volume (L)</label>
                    <input
                      id={`comp_${idx}_volume_l`}
                      type="number"
                      step="0.1"
                      value={fmt(comp.volume_l)}
                      onChange={(e) => {
                        const newVolume = parseNum(e.target.value)
                        setEditedBatch(prev => {
                          const clone = JSON.parse(JSON.stringify(prev))
                          const currentComp = clone.charge.components[idx]
                          const currentABV = currentComp.abv_percent
                          const newLAL = calculateLAL(newVolume, currentABV)
                          clone.charge.components[idx] = { ...currentComp, volume_l: newVolume, lal: newLAL !== null ? newLAL : null }
                          return clone
                        })
                      }}
                      className="w-full px-2 py-1 text-sm border border-copper-30 rounded focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor={`comp_${idx}_abv_percent`} className="block text-xs font-medium text-graphite mb-1">ABV (%)</label>
                    <input
                      id={`comp_${idx}_abv_percent`}
                      type="number"
                      step="0.1"
                      value={fmt(comp.abv_percent)}
                      onChange={(e) => {
                        const newABV = parseNum(e.target.value)
                        setEditedBatch(prev => {
                          const clone = JSON.parse(JSON.stringify(prev))
                          const currentComp = clone.charge.components[idx]
                          const currentVolume = currentComp.volume_l
                          const newLAL = calculateLAL(currentVolume, newABV)
                          clone.charge.components[idx] = { ...currentComp, abv_percent: newABV, lal: newLAL !== null ? newLAL : null }
                          return clone
                        })
                      }}
                      className="w-full px-2 py-1 text-sm border border-copper-30 rounded focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor={`comp_${idx}_lal`} className="block text-xs font-medium text-graphite mb-1">LAL (auto)</label>
                    <input
                      id={`comp_${idx}_lal`}
                      type="number"
                      step="0.1"
                      value={fmt(comp.lal)}
                      onChange={(e) => {
                        const newComps = [...charge.components]
                        newComps[idx] = { ...newComps[idx], lal: parseNum(e.target.value) }
                        updateField(['charge', 'components'], newComps)
                      }}
                      className="w-full px-2 py-1 text-sm border border-copper-15 rounded focus:ring-2 focus:ring-copper focus:border-copper bg-beige"
                      placeholder="Auto"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
