'use client'

import { DistillationSession } from '../../types/distillation-session.types'
import { EditableStatRow } from '../EditableStatRow'

interface FinalOutputPanelProps {
  displaySession: DistillationSession
  isEditing: boolean
  applyPatch: (fieldPath: string, newVal: any) => void
}

export function FinalOutputPanel({ displaySession, isEditing, applyPatch }: FinalOutputPanelProps) {
  if (!displaySession.finalOutput) return null

  return (
    <div className="mt-8 bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-700/30 rounded-xl p-6">
      <h4 className="text-lg font-semibold text-white mb-4">Final Output</h4>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-xs text-gray-400 mb-1">Total Volume</div>
          {isEditing ? (
            <EditableStatRow
              label=""
              value={displaySession.finalOutput.totalVolume_L}
              editable={true}
              type="number"
              min={0}
              onSave={(v) => applyPatch('finalOutput.totalVolume_L', v)}
            />
          ) : (
            <div className="text-2xl font-bold text-green-400">{displaySession.finalOutput.totalVolume_L} L</div>
          )}
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Final ABV</div>
          {isEditing ? (
            <EditableStatRow
              label=""
              value={displaySession.finalOutput.finalAbv_percent || ''}
              editable={true}
              type="number"
              min={0}
              max={96}
              step={0.1}
              onSave={(v) => applyPatch('finalOutput.abv_percent', v)}
            />
          ) : (
            <div className="text-2xl font-bold text-green-400">{(displaySession.finalOutput as any).abv_percent || (displaySession.finalOutput as any).abvPercent || '-'}%</div>
          )}
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">LAL</div>
          <div className="text-2xl font-bold text-green-400">{displaySession.finalOutput.lal?.toFixed(1) || '-'}</div>
        </div>
      </div>
      {displaySession.finalOutput.notes && (
        <div className="mt-4 pt-4 border-t border-green-700/30">
          <EditableStatRow
            label="Notes"
            value={displaySession.finalOutput.notes}
            editable={isEditing}
            type="text"
            onSave={(v) => applyPatch('finalOutput.notes', v)}
          />
          {!isEditing && (
            <p className="text-sm text-gray-300 mt-2">{displaySession.finalOutput.notes}</p>
          )}
        </div>
      )}
    </div>
  )
}
