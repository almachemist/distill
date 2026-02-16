'use client'

import { DistillationSession } from '../../types/distillation-session.types'
import { EditableStatRow } from '../EditableStatRow'

interface DilutionsPanelProps {
  displaySession: DistillationSession
  isEditing: boolean
  applyPatch: (fieldPath: string, newVal: any) => void
}

export function DilutionsPanel({ displaySession, isEditing, applyPatch }: DilutionsPanelProps) {
  if (!displaySession.dilutions || displaySession.dilutions.length === 0) return null

  return (
    <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <h4 className="text-lg font-semibold text-white mb-4">Dilution Steps</h4>
      <div className="space-y-4">
        {displaySession.dilutions.map((dilution, idx) => (
          <div key={idx} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-white">
                Step {(dilution as any).stepNo || (dilution as any).number || idx + 1}
              </span>
              {(dilution as any).date && (
                <span className="text-sm text-gray-400">{(dilution as any).date}</span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <EditableStatRow
                label="New Make (L)"
                value={(dilution as any).newMakeL ?? (dilution as any).newMake_L ?? ''}
                editable={isEditing}
                type="number"
                min={0}
                onSave={(v) => {
                  const field = (dilution as any).newMakeL !== undefined ? 'newMakeL' : 'newMakeL'
                  applyPatch(`dilutions.${idx}.${field}`, v)
                }}
              />
              <EditableStatRow
                label="Water Added (L)"
                value={(dilution as any).filteredWater_L || (dilution as any).waterL || 0}
                editable={isEditing}
                type="number"
                min={0}
                onSave={(v) => {
                  const field = (dilution as any).filteredWater_L !== undefined ? 'filteredWater_L' : 'waterL'
                  applyPatch(`dilutions.${idx}.${field}`, v)
                }}
              />
              <EditableStatRow
                label="Final Volume (L)"
                value={(dilution as any).newVolume_L || (dilution as any).finalVolumeL || ''}
                editable={isEditing}
                type="number"
                min={0}
                onSave={(v) => {
                  const field = (dilution as any).newVolume_L !== undefined ? 'newVolume_L' : 'finalVolumeL'
                  applyPatch(`dilutions.${idx}.${field}`, v)
                }}
              />
              <EditableStatRow
                label="Final ABV (%)"
                value={(dilution as any).finalAbv_percent || (dilution as any).finalABV || ''}
                editable={isEditing}
                type="number"
                min={0}
                max={96}
                step={0.1}
                onSave={(v) => {
                  const field = (dilution as any).finalAbv_percent !== undefined ? 'finalAbv_percent' : 'finalABV'
                  applyPatch(`dilutions.${idx}.${field}`, v)
                }}
              />
            </div>
            {((dilution as any).notes) && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <EditableStatRow
                  label="Notes"
                  value={(dilution as any).notes || ''}
                  editable={isEditing}
                  type="text"
                  onSave={(v) => applyPatch(`dilutions.${idx}.notes`, v)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
