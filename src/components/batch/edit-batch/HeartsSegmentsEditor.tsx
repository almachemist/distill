'use client'

import type { BatchNew } from '@/modules/production/new-model/types/batch.types'
import { fmt, parseNum, calculateLAL } from './batch-edit-utils'

interface HeartsSegmentsEditorProps {
  segments: any[]
  setEditedBatch: React.Dispatch<React.SetStateAction<BatchNew>>
  updateField: (path: string[], value: any) => void
}

export function HeartsSegmentsEditor({ segments, setEditedBatch, updateField }: HeartsSegmentsEditorProps) {
  if (!segments || segments.length === 0) return null

  return (
    <div className="bg-beige rounded-xl p-4 border border-copper-15">
      <h3 className="text-lg font-semibold text-graphite mb-4">Hearts Segments</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-copper-15 text-sm">
          <thead className="bg-copper-10">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-graphite">Time</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-graphite">Volume (L)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-graphite">ABV (%)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-graphite">LAL</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-copper-15">
            {segments.map((seg, idx) => (
              <tr key={idx}>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={seg.time_start || ''}
                    onChange={(e) => {
                      const newSegs = [...segments]
                      newSegs[idx] = { ...newSegs[idx], time_start: e.target.value }
                      updateField(['cuts', 'hearts_segments'], newSegs)
                    }}
                    className="w-24 px-2 py-1 text-sm border border-copper-30 rounded focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.1"
                    value={fmt(seg.volume_l)}
                    onChange={(e) => {
                      const newVolume = parseNum(e.target.value)
                      setEditedBatch(prev => {
                        const clone = JSON.parse(JSON.stringify(prev))
                        const currentSeg = clone.cuts.hearts_segments[idx]
                        const currentABV = currentSeg.abv_percent
                        const newLAL = calculateLAL(newVolume, currentABV)
                        clone.cuts.hearts_segments[idx] = { ...currentSeg, volume_l: newVolume, lal: newLAL !== null ? newLAL : null }
                        return clone
                      })
                    }}
                    className="w-20 px-2 py-1 text-sm border border-copper-30 rounded focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.1"
                    value={fmt(seg.abv_percent)}
                    onChange={(e) => {
                      const newABV = parseNum(e.target.value)
                      setEditedBatch(prev => {
                        const clone = JSON.parse(JSON.stringify(prev))
                        const currentSeg = clone.cuts.hearts_segments[idx]
                        const currentVolume = currentSeg.volume_l
                        const newLAL = calculateLAL(currentVolume, newABV)
                        clone.cuts.hearts_segments[idx] = { ...currentSeg, abv_percent: newABV, lal: newLAL !== null ? newLAL : null }
                        return clone
                      })
                    }}
                    className="w-20 px-2 py-1 text-sm border border-copper-30 rounded focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.1"
                    value={fmt(seg.lal)}
                    onChange={(e) => {
                      const newSegs = [...segments]
                      newSegs[idx] = { ...newSegs[idx], lal: parseNum(e.target.value) }
                      updateField(['cuts', 'hearts_segments'], newSegs)
                    }}
                    className="w-20 px-2 py-1 text-sm border border-copper-30 rounded focus:ring-2 focus:ring-copper focus:border-copper bg-beige"
                    placeholder="Auto"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
