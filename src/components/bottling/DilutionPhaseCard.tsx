'use client'

import { DilutionPhase } from '@/types/bottling'

interface DilutionPhaseCardProps {
  phase: DilutionPhase
  phaseNumber: number
  onUpdate: (phase: DilutionPhase) => void
  onRemove: () => void
}

export default function DilutionPhaseCard({
  phase,
  phaseNumber,
  onUpdate,
  onRemove
}: DilutionPhaseCardProps) {
  return (
    <div className="rounded-lg border border-[#E5E5E5] bg-white p-4">
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-semibold text-[#000000]">
          Phase {phaseNumber}
        </h4>
        <button
          onClick={onRemove}
          className="text-[#777777] hover:text-red-600 transition-colors"
          title="Remove phase"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {/* Date */}
        <div>
          <label className="block text-xs text-[#777777] mb-1">
            Date
          </label>
          <input
            type="date"
            value={phase.date}
            onChange={(e) => onUpdate({ ...phase, date: e.target.value })}
            className="
              w-full px-3 py-2 rounded-md
              border border-[#E5E5E5]
              text-sm text-[#000000]
              focus:outline-none focus:ring-2 focus:ring-[#A65E2E] focus:border-transparent
            "
          />
        </div>

        {/* Water Added */}
        <div>
          <label className="block text-xs text-[#777777] mb-1">
            Water Added (L)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={phase.waterAdded_L === 0 ? '' : phase.waterAdded_L}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
              onUpdate({ ...phase, waterAdded_L: isNaN(value) ? 0 : value })
            }}
            className="
              w-full px-3 py-2 rounded-md
              border border-[#E5E5E5]
              text-sm text-[#000000]
              focus:outline-none focus:ring-2 focus:ring-[#A65E2E] focus:border-transparent
            "
            placeholder="0.0"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs text-[#777777] mb-1">
            Notes (optional)
          </label>
          <textarea
            value={phase.notes || ''}
            onChange={(e) => onUpdate({ ...phase, notes: e.target.value })}
            rows={2}
            className="
              w-full px-3 py-2 rounded-md
              border border-[#E5E5E5]
              text-sm text-[#000000]
              focus:outline-none focus:ring-2 focus:ring-[#A65E2E] focus:border-transparent
              resize-none
            "
            placeholder="e.g., Adjusted to target ABV"
          />
        </div>
      </div>
    </div>
  )
}

