'use client'

import { useState, useEffect, useCallback } from 'react'
import { DistillationSession, HeartPart, PhaseTotal } from '@/modules/production/types/distillation-session.types'
import HeartsPartsManager from './HeartsPartsManager'
import { buildInitialPhases, calculateLAL } from '../utils/tracker-phase-init'
import {
  TrackerPreparationForm,
  TrackerSteepingForm,
  TrackerHeatingForm,
  TrackerCollectionForm,
} from './live-tracker'

interface DistillationPhase {
  phase: string
  manualStartTime?: string
  manualEndTime?: string
  data: any
  isCompleted: boolean
  heartsParts?: HeartPart[]
  heartsTotals?: PhaseTotal
}

interface DistillationRun {
  runId: string
  sku: string
  stillUsed: string
  recipeId?: string
  phases: DistillationPhase[]
}

interface LiveDistillationTrackerProps {
  session: DistillationSession
  isOpen: boolean
  onClose: () => void
  onSave: (runData: DistillationRun) => void
  viewMode?: 'draft' | 'started' | 'completed'
}

export default function LiveDistillationTracker({ 
  session, 
  isOpen, 
  onClose, 
  onSave,
  viewMode = 'draft'
}: LiveDistillationTrackerProps) {
  const [currentRun, setCurrentRun] = useState<DistillationRun>({
    runId: session.id,
    sku: session.sku,
    stillUsed: session.still,
    recipeId: session.id,
    phases: buildInitialPhases(session) as DistillationPhase[]
  })

  const [activePhase, setActivePhase] = useState<string>('Preparation')
  const [showTimeOptions, setShowTimeOptions] = useState<string | null>(null)
  const [customTime, setCustomTime] = useState<string>('')

  const handleHeartsPartsChange = useCallback((parts: HeartPart[]) => {
    setCurrentRun(prev => ({
      ...prev,
      phases: prev.phases.map(p => 
        p.phase === 'Hearts' ? { ...p, heartsParts: parts } : p
      )
    }))
  }, [])

  const handleHeartsTotalsChange = useCallback((totals: PhaseTotal) => {
    setCurrentRun(prev => ({
      ...prev,
      phases: prev.phases.map(p => 
        p.phase === 'Hearts' ? { ...p, heartsTotals: totals } : p
      )
    }))
  }, [])

  const handleHeartsFinalize = useCallback(() => {
    setCurrentRun(prev => ({
      ...prev,
      phases: prev.phases.map(p => 
        p.phase === 'Hearts' ? { ...p, isCompleted: true } : p
      )
    }))
  }, [])

  useEffect(() => {
    setCurrentRun({
      runId: session.id,
      sku: session.sku,
      stillUsed: session.still,
      recipeId: session.id,
      phases: buildInitialPhases(session) as DistillationPhase[]
    })
  }, [session])

  const updatePhaseData = useCallback((phaseName: string, field: string, value: any) => {
    setCurrentRun(prev => ({
      ...prev,
      phases: prev.phases.map(phase => 
        phase.phase === phaseName 
          ? { ...phase, data: { ...phase.data, [field]: value } }
          : phase
      )
    }))
  }, [])

  const addOtherComponent = useCallback(() => {
    const preparationPhase = currentRun.phases.find(p => p.phase === 'Preparation')
    if (preparationPhase) {
      const newOthers = [...preparationPhase.data.others, { name: '', volume_L: 0, abv_percent: 0, notes: '' }]
      updatePhaseData('Preparation', 'others', newOthers)
    }
  }, [currentRun.phases, updatePhaseData])

  const removeOtherComponent = useCallback((index: number) => {
    const preparationPhase = currentRun.phases.find(p => p.phase === 'Preparation')
    if (preparationPhase) {
      const newOthers = preparationPhase.data.others.filter((_: any, i: number) => i !== index)
      updatePhaseData('Preparation', 'others', newOthers)
    }
  }, [currentRun.phases, updatePhaseData])

  const updateOtherComponent = useCallback((index: number, field: string, value: any) => {
    const preparationPhase = currentRun.phases.find(p => p.phase === 'Preparation')
    if (preparationPhase) {
      const newOthers = [...preparationPhase.data.others]
      newOthers[index] = { ...newOthers[index], [field]: value }
      updatePhaseData('Preparation', 'others', newOthers)
    }
  }, [currentRun.phases, updatePhaseData])

  const updatePhaseTimestamps = useCallback((phaseName: string, startTime?: string, endTime?: string) => {
    setCurrentRun(prev => ({
      ...prev,
      phases: prev.phases.map(phase => 
        phase.phase === phaseName 
          ? { ...phase, manualStartTime: startTime || phase.manualStartTime, manualEndTime: endTime || phase.manualEndTime }
          : phase
      )
    }))
  }, [])

  const setStartTimeNow = useCallback((phaseName: string) => {
    updatePhaseTimestamps(phaseName, new Date().toISOString())
    setShowTimeOptions(null)
  }, [updatePhaseTimestamps])

  const applyCustomTime = useCallback((phaseName: string) => {
    if (customTime) {
      updatePhaseTimestamps(phaseName, new Date(customTime).toISOString())
      setShowTimeOptions(null)
      setCustomTime('')
    }
  }, [customTime, updatePhaseTimestamps])

  const togglePhaseCompletion = useCallback((phaseName: string) => {
    setCurrentRun(prev => ({
      ...prev,
      phases: prev.phases.map(phase => {
        if (phase.phase === phaseName) {
          if (phaseName === 'Hearts') {
            if (!phase.isCompleted && (!phase.heartsParts || phase.heartsParts.length === 0)) {
              alert('Please add at least one Hearts part before completing this phase.')
              return phase
            }
          }
          return { 
            ...phase, 
            isCompleted: !phase.isCompleted,
            manualEndTime: !phase.isCompleted ? new Date().toISOString() : undefined
          }
        }
        return phase
      })
    }))
  }, [])

  const calculateTotalLAL = useCallback(() => {
    return currentRun.phases
      .filter(phase => ['Foreshots', 'Heads', 'Hearts', 'Tails'].includes(phase.phase))
      .reduce((sum, phase) => sum + calculateLAL(phase.data.volume_L || 0, phase.data.abv_percent || 0), 0)
  }, [currentRun.phases])

  const calculateEfficiency = useCallback(() => {
    const prep = currentRun.phases.find(p => p.phase === 'Preparation')
    const inputLAL = (prep?.data.totalChargeVolume_L || 0) * ((prep?.data.totalChargeABV_percent || 0) / 100)
    const outputLAL = calculateTotalLAL()
    return inputLAL > 0 ? (outputLAL / inputLAL) * 100 : 0
  }, [currentRun.phases, calculateTotalLAL])

  const getPhaseStatusColor = (phase: DistillationPhase) => {
    if (phase.isCompleted) return 'bg-green-100 text-green-800 border-green-200'
    if (phase.manualStartTime) return 'bg-blue-100 text-blue-800 border-blue-200'
    return 'bg-gray-100 text-gray-600 border-gray-200'
  }

  const getPhaseStatusIcon = (phase: DistillationPhase) => {
    if (phase.phase === 'Hearts') {
      if (phase.heartsParts && phase.heartsParts.length > 0) return '✓'
      if (phase.manualStartTime) return '●'
      return '○'
    }
    if (phase.isCompleted) return '✓'
    if (phase.manualStartTime) return '●'
    return '○'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Live Distillation Tracking</h2>
              <p className="text-indigo-100">{currentRun.sku} - {currentRun.runId}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-indigo-100">Total LAL</div>
                <div className="text-lg font-bold">{calculateTotalLAL().toFixed(2)}L</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-indigo-100">Efficiency</div>
                <div className="text-lg font-bold">{calculateEfficiency().toFixed(1)}%</div>
              </div>
              <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">×</button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Phase Navigation */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Phases</h3>
              <div className="space-y-2">
                {currentRun.phases.map((phase) => (
                  <button
                    key={phase.phase}
                    onClick={() => setActivePhase(phase.phase)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${getPhaseStatusColor(phase)} ${
                      activePhase === phase.phase ? 'ring-2 ring-indigo-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{getPhaseStatusIcon(phase)}</span>
                      <span className="font-medium">{phase.phase}</span>
                    </div>
                    {phase.manualStartTime && (
                      <div className="text-xs mt-1 opacity-75">Started: {phase.manualStartTime}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column - Phase Details */}
            <div className="lg:col-span-3">
              {currentRun.phases.map((phase) => (
                activePhase === phase.phase && (
                  <div key={phase.phase} className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-gray-900">{phase.phase}</h3>
                      <div className="flex gap-2">
                        {viewMode === 'draft' && (
                          <div className="relative">
                            <button
                              onClick={() => setShowTimeOptions(showTimeOptions === phase.phase ? null : phase.phase)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                            >
                              Set Start Time
                            </button>
                          
                          {showTimeOptions === phase.phase && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-64">
                              <div className="p-3 space-y-2">
                                <div className="text-sm font-medium text-gray-700 mb-2">Choose start time:</div>
                                <button onClick={() => setStartTimeNow(phase.phase)} className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                                  Start Now ({new Date().toLocaleTimeString()})
                                </button>
                                <div className="border-t pt-2">
                                  <div className="text-xs text-gray-600 mb-1">Or set custom time:</div>
                                  <div className="flex gap-2">
                                    <input type="datetime-local" value={customTime || new Date().toISOString().slice(0, 16)} onChange={(e) => setCustomTime(e.target.value)} className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" />
                                    <button onClick={() => applyCustomTime(phase.phase)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Apply</button>
                                  </div>
                                </div>
                                <button onClick={() => setShowTimeOptions(null)} className="w-full px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600">Cancel</button>
                              </div>
                            </div>
                          )}
                        </div>
                        )}
                        
                        {viewMode === 'draft' && (
                          <button
                            onClick={() => togglePhaseCompletion(phase.phase)}
                            className={`px-3 py-1 rounded-lg text-sm ${
                              phase.isCompleted 
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {phase.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                          </button>
                        )}
                        
                        {viewMode !== 'draft' && (
                          <div className={`px-3 py-1 rounded-lg text-sm ${
                            phase.isCompleted 
                              ? 'bg-green-100 text-green-800' 
                              : phase.manualStartTime
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {phase.isCompleted ? 'Completed' : phase.manualStartTime ? 'In Progress' : 'Not Started'}
                          </div>
                        )}
                      </div>
                    </div>

                    {phase.phase === 'Preparation' && (
                      <TrackerPreparationForm
                        data={phase.data}
                        viewMode={viewMode}
                        updatePhaseData={updatePhaseData}
                        addOtherComponent={addOtherComponent}
                        removeOtherComponent={removeOtherComponent}
                        updateOtherComponent={updateOtherComponent}
                      />
                    )}

                    {phase.phase === 'Botanical Steeping' && (
                      <TrackerSteepingForm data={phase.data} updatePhaseData={updatePhaseData} />
                    )}

                    {phase.phase === 'Heating' && (
                      <TrackerHeatingForm data={phase.data} updatePhaseData={updatePhaseData} />
                    )}

                    {['Foreshots', 'Heads', 'Tails'].includes(phase.phase) && (
                      <TrackerCollectionForm phaseName={phase.phase} data={phase.data} updatePhaseData={updatePhaseData} />
                    )}

                    {phase.phase === 'Hearts' && (
                      <HeartsPartsManager
                        parts={phase.heartsParts || []}
                        onPartsChange={handleHeartsPartsChange}
                        onTotalsChange={handleHeartsTotalsChange}
                        onFinalize={handleHeartsFinalize}
                      />
                    )}
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => onSave(currentRun)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Save Distillation Run
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
