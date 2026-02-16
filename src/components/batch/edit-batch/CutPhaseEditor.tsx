'use client'

import type { BatchNew, CutPhase } from '@/modules/production/new-model/types/batch.types'
import { fmt, parseNum, calculateLAL } from './batch-edit-utils'

interface CutPhaseEditorProps {
  title: string
  phaseKey: 'foreshots' | 'heads' | 'hearts' | 'tails'
  data: CutPhase
  setEditedBatch: React.Dispatch<React.SetStateAction<BatchNew>>
  updateField: (path: string[], value: any) => void
}

export function CutPhaseEditor({ title, phaseKey, data, setEditedBatch, updateField }: CutPhaseEditorProps) {
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseNum(e.target.value)
    setEditedBatch(prev => {
      const clone = JSON.parse(JSON.stringify(prev))
      const currentABV = clone.cuts[phaseKey].abv_percent
      const newLAL = calculateLAL(newVolume, currentABV)
      clone.cuts[phaseKey].volume_l = newVolume
      clone.cuts[phaseKey].lal = newLAL !== null ? newLAL : null
      return clone
    })
  }

  const handleAbvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newABV = parseNum(e.target.value)
    setEditedBatch(prev => {
      const clone = JSON.parse(JSON.stringify(prev))
      const currentVolume = clone.cuts[phaseKey].volume_l
      const newLAL = calculateLAL(currentVolume, newABV)
      clone.cuts[phaseKey].abv_percent = newABV
      clone.cuts[phaseKey].lal = newLAL !== null ? newLAL : null
      return clone
    })
  }

  return (
    <div className="bg-beige rounded-xl p-4 border border-copper-15">
      <h3 className="text-lg font-semibold text-graphite mb-4">{title}</h3>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label htmlFor={`${phaseKey}_volume_l`} className="block text-sm font-medium text-graphite mb-1">Volume (L)</label>
          <input
            id={`${phaseKey}_volume_l`}
            type="number"
            step="0.1"
            value={fmt(data.volume_l)}
            onChange={handleVolumeChange}
            className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
          />
        </div>
        <div>
          <label htmlFor={`${phaseKey}_abv_percent`} className="block text-sm font-medium text-graphite mb-1">ABV (%)</label>
          <input
            id={`${phaseKey}_abv_percent`}
            type="number"
            step="0.1"
            value={fmt(data.abv_percent)}
            onChange={handleAbvChange}
            className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
          />
        </div>
        <div>
          <label htmlFor={`${phaseKey}_lal`} className="block text-sm font-medium text-graphite mb-1">LAL (auto)</label>
          <input
            id={`${phaseKey}_lal`}
            type="number"
            step="0.1"
            value={fmt(data.lal)}
            onChange={(e) => updateField(['cuts', phaseKey, 'lal'], parseNum(e.target.value))}
            className="w-full px-3 py-2 border border-copper-15 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-beige"
            placeholder="Auto"
          />
        </div>
        <div>
          <label htmlFor={`${phaseKey}_vessel`} className="block text-sm font-medium text-graphite mb-1">Vessel</label>
          <input
            id={`${phaseKey}_vessel`}
            type="text"
            value={data.receiving_vessel || ''}
            onChange={(e) => updateField(['cuts', phaseKey, 'receiving_vessel'], e.target.value)}
            className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
          />
        </div>
      </div>
    </div>
  )
}
