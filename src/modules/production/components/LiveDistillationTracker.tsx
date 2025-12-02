'use client'

import { useState, useEffect, useCallback } from 'react'
import { DistillationSession, HeartPart, PhaseTotal } from '@/modules/production/types/distillation-session.types'
import HeartsPartsManager from './HeartsPartsManager'

interface DistillationPhase {
  phase: string
  manualStartTime?: string
  manualEndTime?: string
  data: any
  isCompleted: boolean
  // For Hearts phase, data will contain parts array
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
  viewMode?: 'draft' | 'started' | 'completed' // New prop for view mode
}

export default function LiveDistillationTracker({ 
  session, 
  isOpen, 
  onClose, 
  onSave,
  viewMode = 'draft'
}: LiveDistillationTrackerProps) {
  // Helper function to extract charge data from session
  const extractChargeData = (session: DistillationSession) => {
    const ethanolComponent = session.charge?.components?.find(c => c.type === 'ethanol')
    const waterComponent = session.charge?.components?.find(c => c.type === 'dilution' || c.type === 'water')
    const otherComponents = session.charge?.components?.filter(c => c.type === 'other') || []
    
    return {
      ethanolAdded_L: ethanolComponent?.volume_L || session.chargeVolumeL || 0,
      ethanolABV_percent: ethanolComponent?.abv_percent || session.chargeABV || 0,
      waterAdded_L: waterComponent?.volume_L || 0,
      totalChargeVolume_L: session.charge?.total?.volume_L || session.chargeVolumeL || 0,
      totalChargeABV_percent: session.charge?.total?.abv_percent || session.chargeABV || 0,
      others: otherComponents.map(c => ({
        name: c.source,
        volume_L: c.volume_L,
        abv_percent: c.abv_percent,
        type: c.type
      }))
    }
  }

  const chargeData = extractChargeData(session)
  const outputs = session.outputs as any

  const [currentRun, setCurrentRun] = useState<DistillationRun>({
    runId: session.id,
    sku: session.sku,
    stillUsed: session.still,
    recipeId: session.id, // Using session ID as recipe reference
    phases: [
      {
        phase: 'Preparation',
        data: {
          ethanolAdded_L: chargeData.ethanolAdded_L,
          ethanolABV_percent: chargeData.ethanolABV_percent,
          waterAdded_L: chargeData.waterAdded_L,
          others: chargeData.others,
          totalChargeVolume_L: chargeData.totalChargeVolume_L,
          totalChargeABV_percent: chargeData.totalChargeABV_percent,
          stillUsed: session.still,
          notes: ''
        },
        isCompleted: false
      },
      {
        phase: 'Botanical Steeping',
        data: {
          recipeShown: true,
          botanicals: session.botanicals?.map(bot => ({
            name: bot.name,
            weight_g: bot.weightG,
            notes: bot.notes || ''
          })) || [],
          steepingTime_hours: session.steepingHours || 0,
          steepingTemp_C: null,
          notes: ''
        },
        isCompleted: false
      },
      {
        phase: 'Heating',
        data: {
          elementsOn: 2,
          amperage_A: session.powerA || 35,
          power_kW: session.elementsKW || 32,
          notes: ''
        },
        isCompleted: false
      },
      {
        phase: 'Foreshots',
        data: {
          volume_L: outputs?.find((o: any) => o.name === 'Foreshots')?.volumeL || 0,
          abv_percent: outputs?.find((o: any) => o.name === 'Foreshots')?.abv || 0,
          density: 0.814,
          receivingVessel: outputs?.find((o: any) => o.name === 'Foreshots')?.vessel || '',
          destination: 'Discarded',
          notes: outputs?.find((o: any) => o.name === 'Foreshots')?.observations || ''
        },
        isCompleted: true
      },
      {
        phase: 'Heads',
        data: {
          volume_L: outputs?.find((o: any) => o.name === 'Heads')?.volumeL || 0,
          abv_percent: outputs?.find((o: any) => o.name === 'Heads')?.abv || 0,
          density: 0.818,
          receivingVessel: outputs?.find((o: any) => o.name === 'Heads')?.vessel || '',
          destination: 'Feints',
          notes: outputs?.find((o: any) => o.name === 'Heads')?.observations || ''
        },
        isCompleted: true
      },
      {
        phase: 'Hearts',
        data: {
          volume_L: outputs?.find((o: any) => o.name === 'Hearts')?.volumeL || 0,
          abv_percent: outputs?.find((o: any) => o.name === 'Hearts')?.abv || 0,
          density: 0.820,
          receivingVessel: outputs?.find((o: any) => o.name === 'Hearts')?.vessel || '',
          destination: 'VC Tank',
          notes: outputs?.find((o: any) => o.name === 'Hearts')?.observations || ''
        },
        heartsParts: [], // Initialize empty parts array
        heartsTotals: {
          volumeL: 0,
          avgAbvPercent: 0,
          lal: 0,
          count: 0
        },
        isCompleted: false // Hearts is not completed until parts are added
      },
      {
        phase: 'Tails',
        data: {
          volume_L: outputs?.find((o: any) => o.name === 'Tails')?.volumeL || 0,
          abv_percent: outputs?.find((o: any) => o.name === 'Tails')?.abv || 0,
          density: 0.814,
          receivingVessel: outputs?.find((o: any) => o.name === 'Tails')?.vessel || '',
          destination: 'Feints',
          notes: outputs?.find((o: any) => o.name === 'Tails')?.observations || ''
        },
        isCompleted: true
      }
    ]
  })

  const [activePhase, setActivePhase] = useState<string>('Preparation')
  const [showTimeOptions, setShowTimeOptions] = useState<string | null>(null)
  const [customTime, setCustomTime] = useState<string>('')

  // Stable callback functions to prevent infinite loops
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

  // Update currentRun when session changes
  useEffect(() => {
    console.log('LiveDistillationTracker: Loading session data:', session.id, session.sku)
    console.log('Session outputs:', outputs)
    console.log('Session runData:', session.runData)
    console.log('Session charge:', session.charge)
    
    // Extract charge data properly using the helper function
    const chargeData = extractChargeData(session)
    
    setCurrentRun({
      runId: session.id,
      sku: session.sku,
      stillUsed: session.still,
      recipeId: session.id,
      phases: [
        {
          phase: 'Preparation',
          data: {
            ethanolAdded_L: chargeData.ethanolAdded_L,
            ethanolABV_percent: chargeData.ethanolABV_percent,
            waterAdded_L: chargeData.waterAdded_L,
            others: chargeData.others,
            totalChargeVolume_L: chargeData.totalChargeVolume_L,
            totalChargeABV_percent: chargeData.totalChargeABV_percent,
            stillUsed: session.still,
            notes: ''
          },
          isCompleted: false
        },
        {
          phase: 'Botanical Steeping',
          data: {
            recipeShown: true,
            botanicals: session.botanicals?.map(bot => ({
              name: bot.name,
              weight_g: bot.weightG,
              notes: bot.notes || ''
            })) || [],
            steepingTime_hours: session.steepingHours || 0,
            steepingTemp_C: null,
            notes: ''
          },
          isCompleted: false
        },
        {
          phase: 'Heating',
          data: {
            elementsOn: 2,
            amperage_A: session.powerA || 35,
            power_kW: session.elementsKW || 32,
            notes: ''
          },
          isCompleted: false
        },
        {
          phase: 'Foreshots',
          data: {
            volume_L: outputs?.find((o: any) => o.name === 'Foreshots')?.volumeL || 0,
            abv_percent: outputs?.find((o: any) => o.name === 'Foreshots')?.abv || 0,
            density: 0.814,
            receivingVessel: outputs?.find((o: any) => o.name === 'Foreshots')?.vessel || '',
            destination: 'Discarded',
            notes: outputs?.find((o: any) => o.name === 'Foreshots')?.observations || ''
          },
          isCompleted: false
        },
        {
          phase: 'Heads',
          data: {
            volume_L: outputs?.find((o: any) => o.name === 'Heads')?.volumeL || 0,
            abv_percent: outputs?.find((o: any) => o.name === 'Heads')?.abv || 0,
            density: 0.818,
            receivingVessel: outputs?.find((o: any) => o.name === 'Heads')?.vessel || '',
            destination: 'Feints',
            notes: outputs?.find((o: any) => o.name === 'Heads')?.observations || ''
          },
          isCompleted: false
        },
        {
          phase: 'Hearts',
          data: {
            volume_L: outputs?.find((o: any) => o.name === 'Hearts')?.volumeL || 0,
            abv_percent: outputs?.find((o: any) => o.name === 'Hearts')?.abv || 0,
            density: 0.820,
            receivingVessel: outputs?.find((o: any) => o.name === 'Hearts')?.vessel || '',
            destination: 'VC Tank',
            notes: outputs?.find((o: any) => o.name === 'Hearts')?.observations || ''
          },
          heartsParts: [], // Initialize empty parts array for new multi-part system
          heartsTotals: {
            volumeL: 0,
            avgAbvPercent: 0,
            lal: 0,
            count: 0
          },
          isCompleted: false // Hearts is not completed until parts are added
        },
        {
          phase: 'Tails',
          data: {
            volume_L: outputs?.find((o: any) => o.name === 'Tails')?.volumeL || 0,
            abv_percent: outputs?.find((o: any) => o.name === 'Tails')?.abv || 0,
            density: 0.814,
            receivingVessel: outputs?.find((o: any) => o.name === 'Tails')?.vessel || '',
            destination: 'Feints',
            notes: outputs?.find((o: any) => o.name === 'Tails')?.observations || ''
          },
          isCompleted: false
        }
      ]
    })
  }, [session])

  const vesselOptions = [
    '20L Waste',
    'VC-315',
    'IBC-01',
    'Jug 1',
    'Jug 2',
    'FEINTS-GIN-001',
    'FEINTS-GIN-002',
    'GIN-NS-0016',
    'GIN-NS-0017',
    'GIN-NS-0018'
  ]

  const stillOptions = [
    'Roberta',
    'Carrie',
    'Still 3',
    'Still 4'
  ]

  const addOtherComponent = () => {
    const preparationPhase = currentRun.phases.find(p => p.phase === 'Preparation')
    if (preparationPhase) {
      const newOthers = [...preparationPhase.data.others, { name: '', volume_L: 0, abv_percent: 0, notes: '' }]
      updatePhaseData('Preparation', 'others', newOthers)
    }
  }

  const removeOtherComponent = (index: number) => {
    const preparationPhase = currentRun.phases.find(p => p.phase === 'Preparation')
    if (preparationPhase) {
      const newOthers = preparationPhase.data.others.filter((_: any, i: number) => i !== index)
      updatePhaseData('Preparation', 'others', newOthers)
    }
  }

  const updateOtherComponent = (index: number, field: string, value: any) => {
    const preparationPhase = currentRun.phases.find(p => p.phase === 'Preparation')
    if (preparationPhase) {
      const newOthers = [...preparationPhase.data.others]
      newOthers[index] = { ...newOthers[index], [field]: value }
      updatePhaseData('Preparation', 'others', newOthers)
    }
  }

  const updatePhaseData = (phaseName: string, field: string, value: any) => {
    setCurrentRun(prev => ({
      ...prev,
      phases: prev.phases.map(phase => 
        phase.phase === phaseName 
          ? { 
              ...phase, 
              data: { ...phase.data, [field]: value } 
            }
          : phase
      )
    }))
  }

  const setStartTimeNow = (phaseName: string) => {
    console.log('Setting start time now for phase:', phaseName)
    updatePhaseTimestamps(phaseName, new Date().toISOString())
    setShowTimeOptions(null)
  }

  const setCustomStartTime = (phaseName: string, customTime: string) => {
    if (customTime) {
      console.log('Setting custom start time for phase:', phaseName, 'time:', customTime)
      updatePhaseTimestamps(phaseName, customTime)
      setShowTimeOptions(null)
      setCustomTime('')
    }
  }

  const handleCustomTimeChange = (value: string) => {
    console.log('Custom time changed:', value)
    setCustomTime(value)
  }

  const applyCustomTime = (phaseName: string) => {
    if (customTime) {
      console.log('Applying custom time for phase:', phaseName, 'time:', customTime)
      const isoTime = new Date(customTime).toISOString()
      updatePhaseTimestamps(phaseName, isoTime)
      setShowTimeOptions(null)
      setCustomTime('')
    }
  }

  const toggleTimeOptions = (phaseName: string) => {
    setShowTimeOptions(showTimeOptions === phaseName ? null : phaseName)
  }

  const updatePhaseTimestamps = (phaseName: string, startTime?: string, endTime?: string) => {
    console.log('Updating phase timestamps:', phaseName, 'startTime:', startTime, 'endTime:', endTime)
    setCurrentRun(prev => {
      const updated = {
        ...prev,
        phases: prev.phases.map(phase => 
          phase.phase === phaseName 
            ? { 
                ...phase, 
                manualStartTime: startTime || phase.manualStartTime,
                manualEndTime: endTime || phase.manualEndTime
              }
            : phase
        )
      }
      console.log('Updated run:', updated)
      return updated
    })
  }

  const togglePhaseCompletion = (phaseName: string) => {
    setCurrentRun(prev => ({
      ...prev,
      phases: prev.phases.map(phase => {
        if (phase.phase === phaseName) {
          // Special handling for Hearts phase
          if (phaseName === 'Hearts') {
            // Hearts can only be completed if there are parts
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
  }

  const calculateLAL = (volume: number, abv: number) => {
    return volume * (abv / 100)
  }

  const calculateTotalLAL = () => {
    return currentRun.phases
      .filter(phase => ['Foreshots', 'Heads', 'Hearts', 'Tails'].includes(phase.phase))
      .reduce((sum, phase) => sum + calculateLAL(phase.data.volume_L || 0, phase.data.abv_percent || 0), 0)
  }

  const calculateEfficiency = () => {
    const inputLAL = currentRun.phases.find(p => p.phase === 'Preparation')?.data.totalChargeVolume_L * 
                    (currentRun.phases.find(p => p.phase === 'Preparation')?.data.totalChargeABV_percent / 100) || 0
    const outputLAL = calculateTotalLAL()
    return inputLAL > 0 ? (outputLAL / inputLAL) * 100 : 0
  }

  const getPhaseStatusColor = (phase: DistillationPhase) => {
    if (phase.isCompleted) return 'bg-green-100 text-green-800 border-green-200'
    if (phase.manualStartTime) return 'bg-blue-100 text-blue-800 border-blue-200'
    return 'bg-gray-100 text-gray-600 border-gray-200'
  }

  const getPhaseStatusIcon = (phase: DistillationPhase) => {
    // Special handling for Hearts phase
    if (phase.phase === 'Hearts') {
      if (phase.heartsParts && phase.heartsParts.length > 0) return '✓'
      if (phase.manualStartTime) return '●'
      return '○'
    }
    
    // Default handling for other phases
    if (phase.isCompleted) return '✓'
    if (phase.manualStartTime) return '●'
    return '○'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
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
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
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
                    {/* Show time information for phases */}
                    {phase.manualStartTime && (
                      <div className="text-xs mt-1 opacity-75">
                        Started: {phase.manualStartTime}
                      </div>
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
                              onClick={() => toggleTimeOptions(phase.phase)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                            >
                              Set Start Time
                            </button>
                          
                          {showTimeOptions === phase.phase && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-64">
                              <div className="p-3 space-y-2">
                                <div className="text-sm font-medium text-gray-700 mb-2">Choose start time:</div>
                                
                                <button
                                  onClick={() => setStartTimeNow(phase.phase)}
                                  className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                >
                                  Start Now ({new Date().toLocaleTimeString()})
                                </button>
                                
                                <div className="border-t pt-2">
                                  <div className="text-xs text-gray-600 mb-1">Or set custom time:</div>
                                  <div className="flex gap-2">
                                    <input
                                      type="datetime-local"
                                      value={customTime || new Date().toISOString().slice(0, 16)}
                                      onChange={(e) => handleCustomTimeChange(e.target.value)}
                                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                    <button
                                      onClick={() => applyCustomTime(phase.phase)}
                                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                    >
                                      Apply
                                    </button>
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => setShowTimeOptions(null)}
                                  className="w-full px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
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
                        
                        {/* Status indicator for non-draft modes */}
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

                    {/* Preparation Phase */}
                    {phase.phase === 'Preparation' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ethanol Added (L)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={phase.data.ethanolAdded_L || ''}
                            onChange={(e) => updatePhaseData('Preparation', 'ethanolAdded_L', parseFloat(e.target.value) || 0)}
                            disabled={viewMode !== 'draft'}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                              viewMode !== 'draft' ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ethanol ABV (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={phase.data.ethanolABV_percent || ''}
                            onChange={(e) => updatePhaseData('Preparation', 'ethanolABV_percent', parseFloat(e.target.value) || 0)}
                            disabled={viewMode !== 'draft'}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                              viewMode !== 'draft' ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Water Added (L)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={phase.data.waterAdded_L || ''}
                            onChange={(e) => updatePhaseData('Preparation', 'waterAdded_L', parseFloat(e.target.value) || 0)}
                            disabled={viewMode !== 'draft'}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                              viewMode !== 'draft' ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Still Used</label>
                          <select
                            value={phase.data.stillUsed}
                            onChange={(e) => updatePhaseData('Preparation', 'stillUsed', e.target.value)}
                            disabled={viewMode !== 'draft'}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                              viewMode !== 'draft' ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                          >
                            {stillOptions.map(still => (
                              <option key={still} value={still}>{still}</option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Others Section */}
                        <div className="md:col-span-2">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-lg font-medium text-gray-900">Other Components</h4>
                            <button
                              onClick={addOtherComponent}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                            >
                              Add Component
                            </button>
                          </div>
                          
                          {phase.data.others && phase.data.others.length > 0 ? (
                            <div className="space-y-3">
                              {phase.data.others.map((other: any, index: number) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                                    <input
                                      type="text"
                                      value={other.name}
                                      onChange={(e) => updateOtherComponent(index, 'name', e.target.value)}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                      placeholder="e.g., Vodka, Rum"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Volume (L)</label>
                                    <input
                                      type="number"
                                      step="0.1"
                                      value={other.volume_L || ''}
                                      onChange={(e) => updateOtherComponent(index, 'volume_L', parseFloat(e.target.value) || 0)}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">ABV (%)</label>
                                    <input
                                      type="number"
                                      step="0.1"
                                      value={other.abv_percent || ''}
                                      onChange={(e) => updateOtherComponent(index, 'abv_percent', parseFloat(e.target.value) || 0)}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                  </div>
                                  <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                      <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                                      <input
                                        type="text"
                                        value={other.notes}
                                        onChange={(e) => updateOtherComponent(index, 'notes', e.target.value)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                        placeholder="Optional"
                                      />
                                    </div>
                                    <button
                                      onClick={() => removeOtherComponent(index)}
                                      className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              <p>No other components added yet</p>
                              <p className="text-sm">Click "Add Component" to add vodka, rum, or other spirits</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                          <textarea
                            value={phase.data.notes}
                            onChange={(e) => updatePhaseData('Preparation', 'notes', e.target.value)}
                            className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Preparation notes..."
                          />
                        </div>
                      </div>
                    )}

                    {/* Botanical Steeping Phase */}
                    {phase.phase === 'Botanical Steeping' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Steeping Time (hours)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={phase.data.steepingTime_hours || ''}
                              onChange={(e) => updatePhaseData('Botanical Steeping', 'steepingTime_hours', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Steeping Temp (°C)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={phase.data.steepingTemp_C || ''}
                              onChange={(e) => updatePhaseData('Botanical Steeping', 'steepingTemp_C', parseFloat(e.target.value) || null)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="Optional"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 mb-3">Botanicals</h4>
                          <div className="space-y-3">
                            {phase.data.botanicals.map((botanical: any, index: number) => (
                              <div key={index} className="flex gap-4 items-center p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <span className="font-medium">{botanical.name}</span>
                                </div>
                                <div className="w-24">
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={botanical.weight_g || ''}
                                    onChange={(e) => {
                                      const newBotanicals = [...phase.data.botanicals]
                                      newBotanicals[index].weight_g = parseFloat(e.target.value) || 0
                                      updatePhaseData('Botanical Steeping', 'botanicals', newBotanicals)
                                    }}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="g"
                                  />
                                </div>
                                <div className="w-32">
                                  <input
                                    type="text"
                                    value={botanical.notes || ''}
                                    onChange={(e) => {
                                      const newBotanicals = [...phase.data.botanicals]
                                      newBotanicals[index].notes = e.target.value
                                      updatePhaseData('Botanical Steeping', 'botanicals', newBotanicals)
                                    }}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Notes"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Steeping Notes</label>
                          <textarea
                            value={phase.data.notes}
                            onChange={(e) => updatePhaseData('Botanical Steeping', 'notes', e.target.value)}
                            className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Steeping observations..."
                          />
                        </div>
                      </div>
                    )}

                    {/* Heating Phase */}
                    {phase.phase === 'Heating' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Elements On</label>
                          <input
                            type="number"
                            value={phase.data.elementsOn || ''}
                            onChange={(e) => updatePhaseData('Heating', 'elementsOn', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Amperage (A)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={phase.data.amperage_A || ''}
                            onChange={(e) => updatePhaseData('Heating', 'amperage_A', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Power (kW)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={phase.data.power_kW || ''}
                            onChange={(e) => updatePhaseData('Heating', 'power_kW', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Heating Notes</label>
                          <textarea
                            value={phase.data.notes}
                            onChange={(e) => updatePhaseData('Heating', 'notes', e.target.value)}
                            className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Heating observations..."
                          />
                        </div>
                      </div>
                    )}

                    {/* Collection Phases (Foreshots, Heads, Tails) */}
                    {['Foreshots', 'Heads', 'Tails'].includes(phase.phase) && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Volume (L)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={phase.data.volume_L || ''}
                              onChange={(e) => updatePhaseData(phase.phase, 'volume_L', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ABV (%)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={phase.data.abv_percent || ''}
                              onChange={(e) => updatePhaseData(phase.phase, 'abv_percent', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Density</label>
                            <input
                              type="number"
                              step="0.001"
                              value={phase.data.density || ''}
                              onChange={(e) => updatePhaseData(phase.phase, 'density', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="0.814"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Receiving Vessel</label>
                            <select
                              value={phase.data.receivingVessel}
                              onChange={(e) => updatePhaseData(phase.phase, 'receivingVessel', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                              <option value="">Select vessel...</option>
                              {vesselOptions.map(vessel => (
                                <option key={vessel} value={vessel}>{vessel}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                            <input
                              type="text"
                              value={phase.data.destination}
                              onChange={(e) => updatePhaseData(phase.phase, 'destination', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-sm text-blue-800">
                            <strong>LAL:</strong> {calculateLAL(phase.data.volume_L || 0, phase.data.abv_percent || 0).toFixed(2)}L
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Collection Notes</label>
                          <textarea
                            value={phase.data.notes}
                            onChange={(e) => updatePhaseData(phase.phase, 'notes', e.target.value)}
                            className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder={`${phase.phase} observations...`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Hearts Phase - Multi-part Manager */}
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
              onClick={() => {
                console.log('Save button clicked, current run:', currentRun)
                onSave(currentRun)
              }}
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
