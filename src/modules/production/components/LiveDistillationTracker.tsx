'use client'

import { useState, useEffect } from 'react'
import { DistillationSession } from '@/modules/production/types/distillation-session.types'

interface DistillationPhase {
  phase: string
  manualStartTime?: string
  manualEndTime?: string
  data: any
  isCompleted: boolean
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
}

export default function LiveDistillationTracker({ 
  session, 
  isOpen, 
  onClose, 
  onSave 
}: LiveDistillationTrackerProps) {
  const [currentRun, setCurrentRun] = useState<DistillationRun>({
    runId: session.id,
    sku: session.sku,
    stillUsed: session.still,
    recipeId: session.id, // Using session ID as recipe reference
    phases: [
      {
        phase: 'Preparation',
        data: {
          ethanolAdded_L: session.chargeVolumeL || 0,
          ethanolABV_percent: session.chargeABV || 0,
          waterAdded_L: 0,
          totalChargeVolume_L: session.chargeVolumeL || 0,
          totalChargeABV_percent: session.chargeABV || 0,
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
          collectionTime: '',
          volume_L: 0,
          abv_percent: 0,
          density: 0,
          receivingVessel: '',
          destination: 'Discarded',
          notes: ''
        },
        isCompleted: false
      },
      {
        phase: 'Heads',
        data: {
          collectionTime: '',
          volume_L: 0,
          abv_percent: 0,
          density: 0,
          receivingVessel: '',
          destination: 'Feints',
          notes: ''
        },
        isCompleted: false
      },
      {
        phase: 'Hearts',
        data: {
          collectionTime: '',
          volume_L: 0,
          abv_percent: 0,
          density: 0,
          receivingVessel: '',
          destination: 'VC Tank',
          notes: ''
        },
        isCompleted: false
      },
      {
        phase: 'Tails',
        data: {
          collectionTime: '',
          volume_L: 0,
          abv_percent: 0,
          density: 0,
          receivingVessel: '',
          destination: 'Feints',
          notes: ''
        },
        isCompleted: false
      }
    ]
  })

  const [activePhase, setActivePhase] = useState<string>('Preparation')

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

  const updatePhaseTimestamps = (phaseName: string, startTime?: string, endTime?: string) => {
    setCurrentRun(prev => ({
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
    }))
  }

  const togglePhaseCompletion = (phaseName: string) => {
    setCurrentRun(prev => ({
      ...prev,
      phases: prev.phases.map(phase => 
        phase.phase === phaseName 
          ? { 
              ...phase, 
              isCompleted: !phase.isCompleted,
              manualEndTime: !phase.isCompleted ? new Date().toISOString() : undefined
            }
          : phase
      )
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
    if (phase.isCompleted) return '✅'
    if (phase.manualStartTime) return '🟢'
    return '⏳'
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
                    {phase.manualStartTime && (
                      <div className="text-xs mt-1 opacity-75">
                        Started: {new Date(phase.manualStartTime).toLocaleTimeString()}
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
                        <button
                          onClick={() => updatePhaseTimestamps(phase.phase, new Date().toISOString())}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                        >
                          Set Start Time
                        </button>
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ethanol ABV (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={phase.data.ethanolABV_percent || ''}
                            onChange={(e) => updatePhaseData('Preparation', 'ethanolABV_percent', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Water Added (L)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={phase.data.waterAdded_L || ''}
                            onChange={(e) => updatePhaseData('Preparation', 'waterAdded_L', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Still Used</label>
                          <select
                            value={phase.data.stillUsed}
                            onChange={(e) => updatePhaseData('Preparation', 'stillUsed', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          >
                            {stillOptions.map(still => (
                              <option key={still} value={still}>{still}</option>
                            ))}
                          </select>
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

                    {/* Collection Phases (Foreshots, Heads, Hearts, Tails) */}
                    {['Foreshots', 'Heads', 'Hearts', 'Tails'].includes(phase.phase) && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Collection Time</label>
                            <input
                              type="datetime-local"
                              value={phase.data.collectionTime}
                              onChange={(e) => updatePhaseData(phase.phase, 'collectionTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
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
              💾 Save Distillation Run
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
