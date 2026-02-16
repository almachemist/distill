'use client'

import { DistillationSession } from '../../types/distillation-session.types'
import { EditableStatRow } from '../EditableStatRow'
import { BatchStatus } from '../../utils/batch-detail-utils'

interface BatchDetailHeaderProps {
  displaySession: DistillationSession
  batchStatus: BatchStatus
  isEditing: boolean
  isSaving: boolean
  pendingPatchCount: number
  applyPatch: (fieldPath: string, newVal: any) => void
  startEditing: () => void
  handleSaveCorrections: () => void
  handleCancelEditing: () => void
  onClose: () => void
}

export function BatchDetailHeader({
  displaySession,
  batchStatus,
  isEditing,
  isSaving,
  pendingPatchCount,
  applyPatch,
  startEditing,
  handleSaveCorrections,
  handleCancelEditing,
  onClose,
}: BatchDetailHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 p-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold text-white">{displaySession.sku}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              batchStatus === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
              batchStatus === 'live' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse' :
              'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}>
              {batchStatus === 'completed' ? 'Completed' :
               batchStatus === 'live' ? 'Live' : 'Draft'}
            </span>
            {isEditing && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                Editing Mode
              </span>
            )}
          </div>
          <div className="mt-2 space-y-2">
            {isEditing ? (
              <>
                <EditableStatRow
                  label="Batch ID"
                  value={displaySession.spiritRun || displaySession.id}
                  editable={true}
                  type="text"
                  onSave={(v) => applyPatch('spiritRun', v)}
                />
                {displaySession.description !== undefined && (
                  <EditableStatRow
                    label="Description"
                    value={displaySession.description || ''}
                    editable={true}
                    type="text"
                    onSave={(v) => applyPatch('description', v)}
                  />
                )}
              </>
            ) : (
              <>
                <p className="text-violet-300 text-lg">{displaySession.spiritRun || displaySession.id}</p>
                {displaySession.description && (
                  <p className="text-gray-400 text-sm mt-1">{displaySession.description}</p>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <button
              onClick={startEditing}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Edit data
            </button>
          ) : (
            <>
              <button
                onClick={handleCancelEditing}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCorrections}
                disabled={isSaving || pendingPatchCount === 0}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
              >
                {isSaving ? 'Saving...' : `Save corrections (${pendingPatchCount})`}
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl leading-none transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
