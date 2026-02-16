'use client'

import { DistillationSession } from '../../types/distillation-session.types'
import { EditableStatRow } from '../EditableStatRow'
import { formatDate } from '../../utils/batch-detail-utils'

interface BatchDetailSummaryBarProps {
  displaySession: DistillationSession
  isEditing: boolean
  applyPatch: (fieldPath: string, newVal: any) => void
}

export function BatchDetailSummaryBar({ displaySession, isEditing, applyPatch }: BatchDetailSummaryBarProps) {
  return (
    <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-violet-400">⚗️</span>
          <div className="flex-1">
            <div className="text-xs text-gray-400">Still</div>
            {isEditing ? (
              <EditableStatRow
                label=""
                value={displaySession.still}
                editable={true}
                type="text"
                onSave={(v) => applyPatch('still', v)}
              />
            ) : (
              <div className="text-sm font-semibold text-white">{displaySession.still}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-violet-400">📅</span>
          <div className="flex-1">
            <div className="text-xs text-gray-400">Date</div>
            {isEditing ? (
              <EditableStatRow
                label=""
                value={displaySession.date}
                editable={true}
                type="text"
                onSave={(v) => applyPatch('date', v)}
              />
            ) : (
              <div className="text-sm font-semibold text-white">{formatDate(displaySession.date)}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-violet-400">📊</span>
          <div>
            <div className="text-xs text-gray-400">Efficiency</div>
            <div className={`text-sm font-semibold ${
              (displaySession.lalEfficiency || 0) >= 80 ? 'text-green-400' :
              (displaySession.lalEfficiency || 0) >= 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {displaySession.lalEfficiency?.toFixed(1) || '-'}%
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-violet-400">🍶</span>
          <div>
            <div className="text-xs text-gray-400">Total LAL</div>
            <div className="text-sm font-semibold text-cyan-400">{displaySession.lalOut?.toFixed(1) || '-'} L</div>
          </div>
        </div>
      </div>
    </div>
  )
}
