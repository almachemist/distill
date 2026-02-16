'use client'

import { DistillationSession } from '../../types/distillation-session.types'
import { EditableStatRow } from '../EditableStatRow'

interface PreparationPhasePanelProps {
  displaySession: DistillationSession
  isEditing: boolean
  applyPatch: (fieldPath: string, newVal: any) => void
}

export function PreparationPhasePanel({ displaySession, isEditing, applyPatch }: PreparationPhasePanelProps) {
  if (!displaySession.charge) return null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
          <EditableStatRow
            label="Total Volume"
            value={displaySession.charge.total.volume_L}
            editable={isEditing}
            type="number"
            min={0}
            onSave={(v) => applyPatch('charge.total.volume_L', v)}
          />
          <div className="text-2xl font-bold text-cyan-400 mt-2">{displaySession.charge.total.volume_L} L</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
          <EditableStatRow
            label="ABV"
            value={displaySession.charge.total.abv_percent}
            editable={isEditing}
            type="number"
            min={0}
            max={96}
            step={0.1}
            onSave={(v) => applyPatch('charge.total.abv_percent', v)}
          />
          <div className="text-2xl font-bold text-violet-400 mt-2">{displaySession.charge.total.abv_percent}%</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
          <div className="text-xs text-gray-400 mb-1">LAL</div>
          <div className="text-2xl font-bold text-green-400">{displaySession.charge.total.lal != null ? (typeof displaySession.charge.total.lal === 'number' ? displaySession.charge.total.lal.toFixed(1) : displaySession.charge.total.lal) : '0.0'} L</div>
        </div>
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-300 mb-3">Components</div>
        <div className="space-y-2">
          {displaySession.charge.components.map((comp, idx) => (
            <div key={idx} className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/50 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-white font-medium">{comp.source}</span>
                  <span className="ml-2 text-xs text-gray-400">({comp.type})</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <EditableStatRow
                  label="Volume (L)"
                  value={comp.volume_L}
                  editable={isEditing}
                  type="number"
                  min={0}
                  onSave={(v) => applyPatch(`charge.components.${idx}.volume_L`, v)}
                />
                <EditableStatRow
                  label="ABV (%)"
                  value={comp.abv_percent}
                  editable={isEditing}
                  type="number"
                  min={0}
                  max={96}
                  step={0.1}
                  onSave={(v) => applyPatch(`charge.components.${idx}.abv_percent`, v)}
                />
                <div>
                  <div className="text-xs text-gray-400 mb-1">LAL</div>
                  <div className="font-semibold text-cyan-400">{comp.lal != null ? (typeof comp.lal === 'number' ? comp.lal.toFixed(1) : comp.lal) : '0.0'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
        <div className="text-sm text-gray-400">
          Still Used: {isEditing ? (
            <EditableStatRow
              label=""
              value={displaySession.still}
              editable={true}
              type="text"
              onSave={(v) => applyPatch('still', v)}
            />
          ) : (
            <span className="text-white">{displaySession.still}</span>
          )}
        </div>
        {displaySession.boilerOn && (
          <div className="text-sm text-gray-400">
            Boiler On: {isEditing ? (
              <EditableStatRow
                label=""
                value={displaySession.boilerOn}
                editable={true}
                type="text"
                onSave={(v) => applyPatch('boilerOn', v)}
              />
            ) : (
              <span className="text-white">{displaySession.boilerOn}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
