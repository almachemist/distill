'use client'

import { DistillationSession } from '../../types/distillation-session.types'
import { EditableStatRow } from '../EditableStatRow'

interface CollectionPhasePanelProps {
  displaySession: DistillationSession
  activePhase: string
  phaseData: any
  isEditing: boolean
  applyPatch: (fieldPath: string, newVal: any) => void
}

export function CollectionPhasePanel({ displaySession, activePhase, phaseData, isEditing, applyPatch }: CollectionPhasePanelProps) {
  if (!phaseData) return null

  return (
    <div className="space-y-4">
      {/* Multi-part Hearts support */}
      {activePhase === 'hearts' && phaseData.phaseData && Array.isArray(phaseData.phaseData) && (
        <div className="mb-6">
          <div className="text-sm font-semibold text-gray-300 mb-3">Hearts Parts</div>
          <div className="space-y-3">
            {phaseData.phaseData.map((part: any, idx: number) => (
              <div key={idx} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-white">{part.label || `Part ${idx + 1}`}</div>
                  {part.startTime && (
                    <div className="text-xs text-gray-400">{part.startTime}</div>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Volume</div>
                    <div className="text-white font-semibold">{part.volumeL?.toFixed(1) || '-'} L</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">ABV</div>
                    <div className="text-white font-semibold">{part.abvPercent?.toFixed(1) || '-'}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">LAL</div>
                    <div className="text-cyan-400 font-semibold">{part.lal?.toFixed(1) || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Temp</div>
                    <div className="text-gray-300">{part.condenserTempC || '-'}°C</div>
                  </div>
                </div>
                {part.notes && (
                  <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">{part.notes}</div>
                )}
              </div>
            ))}
          </div>
          {displaySession.totals?.hearts && (
            <div className="mt-4 bg-violet-500/20 rounded-lg p-4 border border-violet-500/30">
              <div className="text-sm font-semibold text-violet-300 mb-2">Hearts Totals</div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Total Volume</div>
                  <div className="text-lg font-bold text-white">{displaySession.totals.hearts.volumeL != null ? (typeof displaySession.totals.hearts.volumeL === 'number' ? displaySession.totals.hearts.volumeL.toFixed(1) : displaySession.totals.hearts.volumeL) : '0.0'} L</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Avg ABV</div>
                  <div className="text-lg font-bold text-white">{displaySession.totals.hearts.avgAbvPercent?.toFixed(1) || '0.0'}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Total LAL</div>
                  <div className="text-lg font-bold text-cyan-400">{displaySession.totals.hearts.lal != null ? (typeof displaySession.totals.hearts.lal === 'number' ? displaySession.totals.hearts.lal.toFixed(1) : displaySession.totals.hearts.lal) : '0.0'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Parts</div>
                  <div className="text-lg font-bold text-white">{displaySession.totals.hearts.count}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {phaseData.runData && phaseData.runData.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-gray-300 mb-3">Run Data</div>
          <div className="space-y-3">
            {phaseData.runData.map((run: any, idx: number) => {
              const fullRunDataIdx = displaySession.runData?.findIndex((r: any) => 
                r === run || 
                (r.time === run.time && r.phase === run.phase && r.volume_L === run.volume_L)
              ) ?? idx
              
              return (
                <div key={idx} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <EditableStatRow
                      label="Time"
                      value={run.time || ''}
                      editable={isEditing}
                      type="time"
                      onSave={(v) => applyPatch(`runData.${fullRunDataIdx}.time`, v)}
                    />
                    <EditableStatRow
                      label="Volume (L)"
                      value={run.volume_L}
                      editable={isEditing}
                      type="number"
                      min={0}
                      step={0.1}
                      onSave={(v) => applyPatch(`runData.${fullRunDataIdx}.volume_L`, v)}
                    />
                    <EditableStatRow
                      label="ABV %"
                      value={run.abv_percent || ''}
                      editable={isEditing}
                      type="number"
                      min={0}
                      max={96}
                      step={0.1}
                      onSave={(v) => applyPatch(`runData.${fullRunDataIdx}.abv_percent`, v)}
                    />
                    <div>
                      <div className="text-xs text-gray-400 mb-1">LAL</div>
                      <div className="text-cyan-400 font-semibold">{run.lal?.toFixed(1) || '-'}</div>
                    </div>
                    <EditableStatRow
                      label="Density"
                      value={run.density || ''}
                      editable={isEditing}
                      type="number"
                      min={0}
                      step={0.001}
                      onSave={(v) => applyPatch(`runData.${fullRunDataIdx}.density`, v)}
                    />
                    <EditableStatRow
                      label="Observations"
                      value={run.observations || ''}
                      editable={isEditing}
                      type="text"
                      onSave={(v) => applyPatch(`runData.${fullRunDataIdx}.observations`, v)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {phaseData.output && (
        <OutputSummary
          output={phaseData.output}
          activePhase={activePhase}
          displaySession={displaySession}
          isEditing={isEditing}
          applyPatch={applyPatch}
        />
      )}
    </div>
  )
}

function OutputSummary({ output, activePhase, displaySession, isEditing, applyPatch }: {
  output: any
  activePhase: string
  displaySession: DistillationSession
  isEditing: boolean
  applyPatch: (fieldPath: string, newVal: any) => void
}) {
  const findOutputIdx = () => {
    return displaySession.outputs?.findIndex((o: any) => 
      ('name' in o && o.name.toLowerCase().includes(activePhase?.slice(0, -1) || '')) ||
      ('phase' in o && o.phase?.toLowerCase().includes(activePhase?.slice(0, -1) || ''))
    ) ?? -1
  }

  return (
    <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50 space-y-3">
      <div className="text-sm font-semibold text-gray-300 mb-2">Output Summary</div>
      <div className="grid grid-cols-3 gap-4">
        <EditableStatRow
          label="Volume (L)"
          value={('volumeL' in output ? output.volumeL : output.volume_L) as number}
          editable={isEditing}
          type="number"
          min={0}
          onSave={(v) => {
            const idx = findOutputIdx()
            if (idx >= 0) applyPatch(`outputs.${idx}.volumeL`, v)
          }}
        />
        <EditableStatRow
          label="ABV (%)"
          value={('abv' in output ? output.abv : output.abv_percent) as number}
          editable={isEditing}
          type="number"
          min={0}
          max={96}
          step={0.1}
          onSave={(v) => {
            const idx = findOutputIdx()
            if (idx >= 0) applyPatch(`outputs.${idx}.abv`, v)
          }}
        />
        {output.lal != null && output.lal > 0 && (
          <div>
            <div className="text-xs text-gray-400 mb-1">LAL</div>
            <div className="text-lg font-semibold text-green-400">{output.lal != null ? (typeof output.lal === 'number' ? output.lal.toFixed(1) : output.lal) : '0.0'}</div>
          </div>
        )}
      </div>
      {('vessel' in output ? output.vessel : ('receivingVessel' in output ? output.receivingVessel : null)) && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <EditableStatRow
            label="Receiving Vessel"
            value={('vessel' in output ? output.vessel : ('receivingVessel' in output ? output.receivingVessel : '')) as string}
            editable={isEditing}
            type="text"
            onSave={(v) => {
              const idx = findOutputIdx()
              if (idx >= 0) applyPatch(`outputs.${idx}.vessel`, v)
            }}
          />
        </div>
      )}
      {('observations' in output && output.observations) && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <EditableStatRow
            label="Observations"
            value={output.observations}
            editable={isEditing}
            type="text"
            onSave={(v) => {
              const idx = findOutputIdx()
              if (idx >= 0) applyPatch(`outputs.${idx}.observations`, v)
            }}
          />
        </div>
      )}
    </div>
  )
}
