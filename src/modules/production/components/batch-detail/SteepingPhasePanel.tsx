'use client'

import { DistillationSession } from '../../types/distillation-session.types'
import { EditableStatRow } from '../EditableStatRow'

interface SteepingPhasePanelProps {
  displaySession: DistillationSession
  isEditing: boolean
  applyPatch: (fieldPath: string, newVal: any) => void
}

export function SteepingPhasePanel({ displaySession, isEditing, applyPatch }: SteepingPhasePanelProps) {
  if (displaySession.botanicals.length === 0) return null

  return (
    <div className="space-y-4">
      {displaySession.totalBotanicals_g && (
        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-gray-400 mb-1">Total Botanicals</div>
              <div className="text-2xl font-bold text-violet-400">{displaySession.totalBotanicals_g.toLocaleString()} g</div>
            </div>
            {displaySession.botanicalsPerLAL && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Per LAL</div>
                <div className="text-lg font-semibold text-cyan-400">{displaySession.botanicalsPerLAL?.toFixed(1) || '0.0'} g/LAL</div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {displaySession.botanicals.map((bot, idx) => (
          <div key={idx} className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/50">
            <div className="font-medium text-white">{bot.name}</div>
            <div className="text-sm text-gray-300 mt-1">
              {bot.weightG?.toLocaleString()} g
              {bot.ratio_percent && (
                <span className="text-gray-500 ml-2">({bot.ratio_percent.toFixed(1)}%)</span>
              )}
            </div>
            {bot.notes && (
              <div className="text-xs text-gray-400 mt-1">{bot.notes}</div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-sm text-gray-400">
          Steeping Duration: {isEditing ? (
            <EditableStatRow
              label=""
              value={displaySession.steepingHours ?? ''}
              editable={true}
              type="number"
              min={0}
              onSave={(v) => applyPatch('steepingHours', v)}
            />
          ) : (
            <span className="text-white">{displaySession.steepingHours ? `${displaySession.steepingHours} hours` : '—'}</span>
          )}
        </div>
      </div>
    </div>
  )
}
