'use client'

import { DistillationSession } from '../types/distillation-session.types'
import { CorrectionPatch } from '../types/correction.types'
import { useState, useMemo, useEffect } from 'react'
import { EditableStatRow } from './EditableStatRow'

interface BatchDetailViewProps {
  session: DistillationSession
  onClose: () => void
  onStartLive?: () => void
  onViewCuts?: () => void
  onEdit?: () => void
  currentUser?: string
  onSaveCorrections?: (batchId: string, patches: CorrectionPatch[]) => Promise<void>
}

type BatchStatus = 'draft' | 'live' | 'completed' | 'archived'

const PHASES = [
  { id: 'preparation', name: 'Preparation', icon: '⚙️' },
  { id: 'steeping', name: 'Botanical Steeping', icon: '🌿' },
  { id: 'heating', name: 'Heating', icon: '🔥' },
  { id: 'foreshots', name: 'Foreshots', icon: '💧' },
  { id: 'heads', name: 'Heads', icon: '💨' },
  { id: 'hearts', name: 'Hearts', icon: '❤️' },
  { id: 'tails', name: 'Tails', icon: '🌊' },
]

export default function BatchDetailView({
  session,
  onClose,
  onStartLive,
  onViewCuts,
  onEdit,
  currentUser = 'User',
  onSaveCorrections,
}: BatchDetailViewProps) {
  const [activePhase, setActivePhase] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedSession, setEditedSession] = useState<DistillationSession>(session)
  const [pendingPatches, setPendingPatches] = useState<CorrectionPatch[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Helper to get nested value from object
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj)
  }

  // Helper to set nested value immutably
  const setNestedValue = (obj: any, path: string, value: any): any => {
    const clone = structuredClone(obj)
    const keys = path.split('.')
    let ref = clone
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!ref[keys[i]]) ref[keys[i]] = {}
      ref = ref[keys[i]]
    }
    
    ref[keys[keys.length - 1]] = value
    return clone
  }

  const applyPatch = (fieldPath: string, newVal: any) => {
    const oldVal = getNestedValue(editedSession, fieldPath)
    
    // Skip if value hasn't changed
    if (oldVal === newVal) return

    // Validate based on field type
    if (fieldPath.includes('volumeL') || fieldPath.includes('volume_L')) {
      if (typeof newVal === 'number' && newVal < 0) return
    }
    if (fieldPath.includes('abv') || fieldPath.includes('abv_percent')) {
      if (typeof newVal === 'number' && (newVal < 0 || newVal > 96)) return
    }
    if (fieldPath.includes('time')) {
      // Validate time format HH:MM
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (typeof newVal === 'string' && !timeRegex.test(newVal) && newVal !== '') return
    }

    // Create patch record
    const patch: CorrectionPatch = {
      id: crypto.randomUUID(),
      user: currentUser,
      timestamp: new Date().toISOString(),
      fieldPath,
      oldValue: oldVal ?? null,
      newValue: newVal,
    }

    // Add to pending patches
    setPendingPatches((prev) => {
      // Remove any existing patch for this field
      const filtered = prev.filter((p) => p.fieldPath !== fieldPath)
      return [...filtered, patch]
    })

    // Apply to edited session
    setEditedSession((prev) => {
      const updated = setNestedValue(prev, fieldPath, newVal)
      
      // Auto-calculate LAL if volume and ABV are both available
      if (fieldPath.includes('volumeL') || fieldPath.includes('volume_L') || 
          fieldPath.includes('abv') || fieldPath.includes('abv_percent')) {
        const volumePath = fieldPath.includes('volumeL') || fieldPath.includes('volume_L') 
          ? fieldPath 
          : fieldPath.replace(/abv.*$/, fieldPath.includes('volumeL') ? 'volumeL' : 'volume_L')
        const abvPath = fieldPath.includes('abv') || fieldPath.includes('abv_percent')
          ? fieldPath
          : fieldPath.replace(/volume.*$/, fieldPath.includes('abv_percent') ? 'abv_percent' : 'abv')
        
        const volume = getNestedValue(updated, volumePath)
        const abv = getNestedValue(updated, abvPath)
        
        if (typeof volume === 'number' && typeof abv === 'number' && abv > 0) {
          const lalPath = fieldPath.replace(/volume.*$/, 'lal').replace(/abv.*$/, 'lal')
          const calculatedLAL = Number((volume * (abv / 100)).toFixed(1))
          const updatedWithLAL = setNestedValue(updated, lalPath, calculatedLAL)
          return updatedWithLAL
        }
      }
      
      return updated
    })
  }

  const handleSaveCorrections = async () => {
    if (pendingPatches.length === 0) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      if (onSaveCorrections) {
        await onSaveCorrections(session.id, pendingPatches)
      } else {
        // Fallback: log to console or show error
        console.warn('onSaveCorrections not provided. Patches:', pendingPatches)
      }
      
      setPendingPatches([])
      setIsEditing(false)
      // Optionally reload session data here
    } catch (error) {
      console.error('Failed to save corrections:', error)
      alert('Failed to save corrections. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEditing = () => {
    setEditedSession(session)
    setPendingPatches([])
    setIsEditing(false)
  }

  // Sync editedSession when session changes (unless we're editing)
  useEffect(() => {
    if (!isEditing) {
      setEditedSession(session)
      setPendingPatches([])
    }
  }, [session, isEditing])

  // Use edited session for display when editing
  const displaySession = isEditing ? editedSession : session

  // Determine batch status based on data completeness
  const batchStatus: BatchStatus = useMemo(() => {
    const hasOutputData = displaySession.outputs && displaySession.outputs.length > 0
    const hasPhaseData = displaySession.phases && Object.values(displaySession.phases).some(phase => 
      Array.isArray(phase) ? phase.length > 0 : phase && Object.keys(phase).length > 0
    )
    
    if (hasOutputData && displaySession.finalOutput) return 'completed'
    if (hasPhaseData || (displaySession.runData?.length ?? 0) > 0) return 'live'
    return 'draft'
  }, [displaySession])

  // Check if phase is completed
  const isPhaseCompleted = (phaseId: string): boolean => {
    switch (phaseId) {
      case 'preparation':
        return !!displaySession.charge && displaySession.charge.components.length > 0
      case 'steeping':
        return !!displaySession.steepingHours && displaySession.botanicals.length > 0
      case 'heating':
        return !!displaySession.boilerOn
      case 'foreshots':
        return (displaySession.runData?.some(r => r.phase.toLowerCase().includes('foreshot')) ?? false) || 
               !!(displaySession.phases?.foreshots && displaySession.phases.foreshots.length > 0)
      case 'heads':
        return (displaySession.runData?.some(r => r.phase.toLowerCase().includes('head')) ?? false) ||
               !!(displaySession.phases?.heads && displaySession.phases.heads.length > 0)
      case 'hearts':
        return (displaySession.runData?.some(r => r.phase.toLowerCase().includes('heart')) ?? false) ||
               !!(displaySession.phases?.hearts && displaySession.phases.hearts.length > 0)
      case 'tails':
        return (displaySession.runData?.some(r => r.phase.toLowerCase().includes('tail')) ?? false) ||
               !!(displaySession.phases?.tails && displaySession.phases.tails.length > 0)
      default:
        return false
    }
  }

  // Get current active phase
  const currentPhase = useMemo(() => {
    for (const phase of PHASES) {
      if (!isPhaseCompleted(phase.id)) {
        return phase.id
      }
    }
    return PHASES[PHASES.length - 1].id
  }, [displaySession])

  const getPhaseDetails = (phaseId: string) => {
    switch (phaseId) {
      case 'preparation':
        return {
          title: 'Preparation Phase',
          data: displaySession.charge ? {
            components: displaySession.charge.components,
            total: displaySession.charge.total,
            still: displaySession.still,
            notes: displaySession.notes,
          } : null,
        }
      case 'steeping':
        return {
          title: 'Botanical Steeping',
          data: displaySession.botanicals.length > 0 ? {
            botanicals: displaySession.botanicals,
            totalWeight: displaySession.totalBotanicals_g,
            perLAL: displaySession.botanicalsPerLAL,
            hours: displaySession.steepingHours,
            setup: displaySession.stillSetup?.steeping,
          } : null,
        }
      case 'heating':
        return {
          title: 'Heating & Boiler Setup',
          data: {
            boilerOn: displaySession.boilerOn,
            power: displaySession.powerA,
            elements: displaySession.stillSetup?.elements,
            plates: displaySession.stillSetup?.plates,
            options: displaySession.stillSetup?.options,
          },
        }
      case 'foreshots':
      case 'heads':
      case 'hearts':
      case 'tails':
        const phaseName = phaseId.charAt(0).toUpperCase() + phaseId.slice(1)
        const runData = displaySession.runData?.filter(r => 
          r.phase.toLowerCase().includes(phaseId.slice(0, -1))
        ) || []
        const output = displaySession.outputs?.find(o => 
          ('name' in o && o.name.toLowerCase().includes(phaseId.slice(0, -1))) ||
          ('phase' in o && o.phase?.toLowerCase().includes(phaseId.slice(0, -1)))
        )
        return {
          title: `${phaseName} Collection`,
          data: {
            runData,
            output,
            phaseData: displaySession.phases?.[phaseId as keyof typeof displaySession.phases],
          },
        }
      default:
        return { title: '', data: null }
    }
  }

  const phaseDetails = activePhase ? getPhaseDetails(activePhase) : getPhaseDetails(currentPhase)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 text-white w-full max-w-7xl max-h-[95vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-gray-700">
        {/* Header */}
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
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Corrigir dados
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancelEditing}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveCorrections}
                    disabled={isSaving || pendingPatches.length === 0}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {isSaving ? 'Salvando...' : `Salvar correções (${pendingPatches.length})`}
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

        {/* Summary Bar */}
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

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Timeline Sidebar */}
          <div className="w-72 bg-gray-800 border-r border-gray-700 overflow-y-auto p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Phases Timeline
            </h3>
            <div className="space-y-2">
              {PHASES.map((phase, idx) => {
                const completed = isPhaseCompleted(phase.id)
                const isCurrent = phase.id === currentPhase && batchStatus !== 'completed'
                const isActive = activePhase === phase.id || (!activePhase && phase.id === currentPhase)

                return (
                  <button
                    key={phase.id}
                    onClick={() => setActivePhase(phase.id)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-violet-500/20 border-2 border-violet-500/50' 
                        : 'bg-gray-700/50 border-2 border-transparent hover:bg-gray-700/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl ${
                        completed ? 'opacity-100' : 'opacity-50'
                      }`}>
                        {phase.icon}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          completed ? 'text-white' : 'text-gray-400'
                        }`}>
                          {phase.name}
                        </div>
                        {completed && (
                          <div className="text-xs text-violet-400 mt-1">✓ Completed</div>
                        )}
                        {isCurrent && !completed && (
                          <div className="text-xs text-cyan-400 mt-1 animate-pulse">→ Current</div>
                        )}
                      </div>
                      {completed && (
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      )}
                    </div>
                    {idx < PHASES.length - 1 && (
                      <div className={`ml-5 mt-2 h-8 w-0.5 ${
                        completed ? 'bg-violet-500/50' : 'bg-gray-700'
                      }`}></div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Details Panel */}
          <div className="flex-1 overflow-y-auto bg-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-3">
                  {phaseDetails.title}
                </h3>

                {/* Phase-specific content */}
                {activePhase === 'preparation' && phaseDetails.data && (
                  <div className="space-y-4">
                    {displaySession.charge && (
                      <>
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
                                    <div className="font-semibold text-cyan-400">{comp.lal.toFixed(1)}</div>
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
                      </>
                    )}
                  </div>
                )}

                {activePhase === 'steeping' && phaseDetails.data && (
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
                              <div className="text-lg font-semibold text-cyan-400">{displaySession.botanicalsPerLAL.toFixed(1)} g/LAL</div>
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
                )}

                {activePhase === 'heating' && phaseDetails.data && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                      <div className="text-xs text-gray-400 mb-1">Boiler On</div>
                      <div className="text-lg font-semibold text-white">{session.boilerOn}</div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                      <div className="text-xs text-gray-400 mb-1">Power</div>
                      <div className="text-lg font-semibold text-white">{session.powerA} A</div>
                    </div>
                    {session.stillSetup?.elements && (
                      <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                        <div className="text-xs text-gray-400 mb-1">Elements</div>
                        <div className="text-sm text-white">{session.stillSetup.elements}</div>
                      </div>
                    )}
                    {session.stillSetup?.plates && (
                      <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                        <div className="text-xs text-gray-400 mb-1">Plates</div>
                        <div className="text-sm text-white">{session.stillSetup.plates}</div>
                      </div>
                    )}
                    {session.stillSetup?.options && (
                      <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50 col-span-2">
                        <div className="text-xs text-gray-400 mb-1">Options</div>
                        <div className="text-sm text-white">{session.stillSetup.options}</div>
                      </div>
                    )}
                  </div>
                )}

                {(activePhase === 'foreshots' || activePhase === 'heads' || activePhase === 'hearts' || activePhase === 'tails') && phaseDetails.data && (
                  <div className="space-y-4">
                    {/* Multi-part Hearts support */}
                    {activePhase === 'hearts' && phaseDetails.data.phaseData && Array.isArray(phaseDetails.data.phaseData) && (
                      <div className="mb-6">
                        <div className="text-sm font-semibold text-gray-300 mb-3">Hearts Parts</div>
                        <div className="space-y-3">
                          {phaseDetails.data.phaseData.map((part: any, idx: number) => (
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
                                <div className="text-lg font-bold text-white">{displaySession.totals.hearts.volumeL.toFixed(1)} L</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400 mb-1">Avg ABV</div>
                                <div className="text-lg font-bold text-white">{displaySession.totals.hearts.avgAbvPercent.toFixed(1)}%</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400 mb-1">Total LAL</div>
                                <div className="text-lg font-bold text-cyan-400">{displaySession.totals.hearts.lal.toFixed(1)}</div>
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

                    {phaseDetails.data.runData && phaseDetails.data.runData.length > 0 && (
                      <div>
                        <div className="text-sm font-semibold text-gray-300 mb-3">Run Data</div>
                        <div className="space-y-3">
                          {phaseDetails.data.runData.map((run, idx) => {
                            // Find the actual index in the full runData array
                            const fullRunDataIdx = displaySession.runData?.findIndex(r => 
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
                    {phaseDetails.data.output && (
                      <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50 space-y-3">
                        <div className="text-sm font-semibold text-gray-300 mb-2">Output Summary</div>
                        <div className="grid grid-cols-3 gap-4">
                          <EditableStatRow
                            label="Volume (L)"
                            value={phaseDetails.data.output.volumeL}
                            editable={isEditing}
                            type="number"
                            min={0}
                            onSave={(v) => {
                              const outputIdx = displaySession.outputs?.findIndex(o => 
                                o.name.toLowerCase().includes(activePhase?.slice(0, -1) || '')
                              ) ?? -1
                              if (outputIdx >= 0) {
                                applyPatch(`outputs.${outputIdx}.volumeL`, v)
                              }
                            }}
                          />
                          <EditableStatRow
                            label="ABV (%)"
                            value={phaseDetails.data.output.abv}
                            editable={isEditing}
                            type="number"
                            min={0}
                            max={96}
                            step={0.1}
                            onSave={(v) => {
                              const outputIdx = displaySession.outputs?.findIndex(o => 
                                o.name.toLowerCase().includes(activePhase?.slice(0, -1) || '')
                              ) ?? -1
                              if (outputIdx >= 0) {
                                applyPatch(`outputs.${outputIdx}.abv`, v)
                              }
                            }}
                          />
                          {phaseDetails.data.output.lal !== undefined && phaseDetails.data.output.lal > 0 && (
                            <div>
                              <div className="text-xs text-gray-400 mb-1">LAL</div>
                              <div className="text-lg font-semibold text-green-400">{phaseDetails.data.output.lal.toFixed(1)}</div>
                            </div>
                          )}
                        </div>
                        {phaseDetails.data.output.vessel && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <EditableStatRow
                              label="Receiving Vessel"
                              value={phaseDetails.data.output.vessel}
                              editable={isEditing}
                              type="text"
                              onSave={(v) => {
                                const outputIdx = displaySession.outputs?.findIndex(o => 
                                  o.name.toLowerCase().includes(activePhase?.slice(0, -1) || '')
                                ) ?? -1
                                if (outputIdx >= 0) {
                                  applyPatch(`outputs.${outputIdx}.vessel`, v)
                                }
                              }}
                            />
                          </div>
                        )}
                        {phaseDetails.data.output.observations && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <EditableStatRow
                              label="Observations"
                              value={phaseDetails.data.output.observations}
                              editable={isEditing}
                              type="text"
                              onSave={(v) => {
                                const outputIdx = displaySession.outputs?.findIndex(o => 
                                  o.name.toLowerCase().includes(activePhase?.slice(0, -1) || '')
                                ) ?? -1
                                if (outputIdx >= 0) {
                                  applyPatch(`outputs.${outputIdx}.observations`, v)
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!phaseDetails.data && (
                  <div className="text-center py-12 text-gray-400">
                    No data available for this phase
                  </div>
                )}

                {/* Final Output Section (when viewing any phase if available) */}
                {displaySession.finalOutput && (
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
                            value={displaySession.finalOutput.abv_percent || ''}
                            editable={true}
                            type="number"
                            min={0}
                            max={96}
                            step={0.1}
                            onSave={(v) => applyPatch('finalOutput.abv_percent', v)}
                          />
                        ) : (
                          <div className="text-2xl font-bold text-green-400">{displaySession.finalOutput.abv_percent}%</div>
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
                )}

                {/* Dilutions */}
                {displaySession.dilutions && displaySession.dilutions.length > 0 && (
                  <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Dilution Steps</h4>
                    <div className="space-y-4">
                      {displaySession.dilutions.map((dilution, idx) => (
                        <div key={idx} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-white">
                              Step {(dilution as any).stepNo || dilution.stepNo || idx + 1}
                            </span>
                            {(dilution as any).date && (
                              <span className="text-sm text-gray-400">{(dilution as any).date}</span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <EditableStatRow
                              label="New Make (L)"
                              value={(dilution as any).newMakeL ?? dilution.newMakeL ?? ''}
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
                              value={(dilution as any).filteredWater_L || dilution.waterL || 0}
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
                              value={(dilution as any).newVolume_L || dilution.finalVolumeL || ''}
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
                              value={(dilution as any).finalAbv_percent || dilution.finalABV || ''}
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
                          {(dilution.notes || (dilution as any).notes) && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <EditableStatRow
                                label="Notes"
                                value={(dilution as any).notes || dilution.notes || ''}
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
                )}

                {/* General Notes */}
                {(displaySession.notes || isEditing) && (
                  <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">General Notes</h4>
                    {!isEditing ? (
                      <p className="text-gray-300 whitespace-pre-wrap">{displaySession.notes || '—'}</p>
                    ) : (
                      <textarea
                        value={displaySession.notes || ''}
                        onChange={(e) => {
                          setEditedSession(prev => ({ ...prev, notes: e.target.value }))
                          // Also add to patches
                          const patch: CorrectionPatch = {
                            id: crypto.randomUUID(),
                            user: currentUser,
                            timestamp: new Date().toISOString(),
                            fieldPath: 'notes',
                            oldValue: session.notes ?? null,
                            newValue: e.target.value,
                          }
                          setPendingPatches((prev) => {
                            const filtered = prev.filter((p) => p.fieldPath !== 'notes')
                            return [...filtered, patch]
                          })
                        }}
                        className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        rows={4}
                        placeholder="Add notes..."
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Pending Corrections */}
              {isEditing && pendingPatches.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mt-6">
                  <div className="text-sm font-semibold text-yellow-400 mb-3">Correções Pendentes</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {pendingPatches.map((patch) => (
                      <div key={patch.id} className="text-sm bg-gray-800/50 rounded p-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-violet-300">{patch.fieldPath}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(patch.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="mt-1 text-gray-300">
                          <span className="line-through text-red-400 mr-2">{String(patch.oldValue ?? '—')}</span>
                          <span className="text-green-400">→</span>
                          <span className="font-semibold text-white ml-2">{String(patch.newValue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!isEditing && (
                <div className="flex gap-4 mt-6">
                  {batchStatus !== 'completed' && onStartLive && (
                    <button
                      onClick={onStartLive}
                      className="flex-1 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Start Live Tracking
                    </button>
                  )}
                  {batchStatus === 'completed' && onViewCuts && (
                    <button
                      onClick={onViewCuts}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      View Cuts Analysis
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

