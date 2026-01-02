'use client'

import { useState, useEffect } from 'react'
import { DistillationSession } from '@/modules/production/types/distillation-session.types'

interface DistillationPhase {
  id: string
  name: string
  icon: string
  status: 'pending' | 'active' | 'completed'
  startTime?: string
  endTime?: string
  notes: string
  metrics: {
    temperature?: number
    pressure?: number
    abv?: number
    volume?: number
    flowRate?: number
  }
}

interface LiveDistillationDetails {
  sessionId: string
  currentPhase: string
  phases: DistillationPhase[]
  overallNotes: string
  startTime: string
  lastUpdate: string
}

interface LiveDistillationModalProps {
  session: DistillationSession
  isOpen: boolean
  onClose: () => void
  onSave: (details: LiveDistillationDetails) => void
}

export default function LiveDistillationModal({ 
  session, 
  isOpen, 
  onClose, 
  onSave 
}: LiveDistillationModalProps) {
  const [currentPhase, setCurrentPhase] = useState<string>('preparation')
  const [phases, setPhases] = useState<DistillationPhase[]>([
    {
      id: 'preparation',
      name: 'Preparation',
      icon: '🔧',
      status: 'pending',
      notes: '',
      metrics: {}
    },
    {
      id: 'steeping',
      name: 'Botanical Steeping',
      icon: '🌿',
      status: 'pending',
      notes: '',
      metrics: {}
    },
    {
      id: 'heating',
      name: 'Heating Up',
      icon: '🔥',
      status: 'pending',
      notes: '',
      metrics: {}
    },
    {
      id: 'foreshots',
      name: 'Foreshots Collection',
      icon: '⚡',
      status: 'pending',
      notes: '',
      metrics: {}
    },
    {
      id: 'heads',
      name: 'Heads Collection',
      icon: '💧',
      status: 'pending',
      notes: '',
      metrics: {}
    },
    {
      id: 'hearts',
      name: 'Hearts Collection',
      icon: '💎',
      status: 'pending',
      notes: '',
      metrics: {}
    },
    {
      id: 'tails',
      name: 'Tails Collection',
      icon: '🌊',
      status: 'pending',
      notes: '',
      metrics: {}
    },
    {
      id: 'cleanup',
      name: 'Cleanup & Finish',
      icon: '🧹',
      status: 'pending',
      notes: '',
      metrics: {}
    }
  ])
  
  const [overallNotes, setOverallNotes] = useState('')
  const [isTracking, setIsTracking] = useState(false)
  const [startTime, setStartTime] = useState('')
  const [currentMetrics, setCurrentMetrics] = useState({
    temperature: '',
    pressure: '',
    abv: '',
    volume: '',
    flowRate: ''
  })

  useEffect(() => {
    if (isOpen) {
      setStartTime(new Date().toISOString())
    }
  }, [isOpen])

  const startPhase = (phaseId: string) => {
    setPhases(prev => prev.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          status: 'active',
          startTime: new Date().toISOString()
        }
      } else if (phase.status === 'active') {
        return {
          ...phase,
          status: 'completed',
          endTime: new Date().toISOString()
        }
      }
      return phase
    }))
    setCurrentPhase(phaseId)
  }

  const completePhase = (phaseId: string) => {
    setPhases(prev => prev.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          status: 'completed',
          endTime: new Date().toISOString()
        }
      }
      return phase
    }))
  }

  const updatePhaseNotes = (phaseId: string, notes: string) => {
    setPhases(prev => prev.map(phase => 
      phase.id === phaseId ? { ...phase, notes } : phase
    ))
  }

  const updatePhaseMetrics = (phaseId: string, metrics: any) => {
    setPhases(prev => prev.map(phase => 
      phase.id === phaseId ? { ...phase, metrics: { ...phase.metrics, ...metrics } } : phase
    ))
  }

  const addCurrentMetricsToPhase = () => {
    const activePhase = phases.find(p => p.status === 'active')
    if (activePhase) {
      const metrics = {
        temperature: currentMetrics.temperature ? parseFloat(currentMetrics.temperature) : undefined,
        pressure: currentMetrics.pressure ? parseFloat(currentMetrics.pressure) : undefined,
        abv: currentMetrics.abv ? parseFloat(currentMetrics.abv) : undefined,
        volume: currentMetrics.volume ? parseFloat(currentMetrics.volume) : undefined,
        flowRate: currentMetrics.flowRate ? parseFloat(currentMetrics.flowRate) : undefined
      }
      
      updatePhaseMetrics(activePhase.id, metrics)
      
      // Clear current metrics
      setCurrentMetrics({
        temperature: '',
        pressure: '',
        abv: '',
        volume: '',
        flowRate: ''
      })
    }
  }

  const saveDistillationDetails = () => {
    const details: LiveDistillationDetails = {
      sessionId: session.id,
      currentPhase,
      phases,
      overallNotes,
      startTime,
      lastUpdate: new Date().toISOString()
    }
    
    onSave(details)
    onClose()
  }

  const getPhaseStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getPhaseStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅'
      case 'active': return '🟢'
      default: return '⏳'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Live Distillation Tracking</h2>
              <p className="text-blue-100">{session.sku} - {session.date}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <span className="text-sm">
                  {isTracking ? 'Tracking Active' : 'Paused'}
                </span>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Phases */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distillation Phases</h3>
              
              <div className="space-y-4">
                {phases.map((phase) => (
                  <div
                    key={phase.id}
                    className={`border-2 rounded-xl p-4 transition-all duration-300 ${getPhaseStatusColor(phase.status)}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{phase.icon}</span>
                        <div>
                          <h4 className="font-semibold">{phase.name}</h4>
                          <div className="flex items-center gap-2 text-sm">
                            <span>{getPhaseStatusIcon(phase.status)}</span>
                            <span className="capitalize">{phase.status}</span>
                            {phase.startTime && (
                              <span className="text-xs opacity-75">
                                Started: {new Date(phase.startTime).toLocaleTimeString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {phase.status === 'pending' && (
                          <button
                            onClick={() => startPhase(phase.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                          >
                            Start
                          </button>
                        )}
                        {phase.status === 'active' && (
                          <button
                            onClick={() => completePhase(phase.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Phase Notes */}
                    <div className="mb-3">
                      <label htmlFor={`phase_notes_${phase.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Phase Notes:
                      </label>
                      <textarea
                        id={`phase_notes_${phase.id}`}
                        value={phase.notes}
                        onChange={(e) => updatePhaseNotes(phase.id, e.target.value)}
                        placeholder={`Add observations for ${phase.name.toLowerCase()}...`}
                        className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Phase Metrics */}
                    {phase.metrics && Object.keys(phase.metrics).length > 0 && (
                      <div className="bg-white/50 rounded-lg p-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Recorded Metrics:</h5>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                          {Object.entries(phase.metrics).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key}:</span>
                              <span className="font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Live Metrics & Controls */}
            <div className="space-y-6">
              {/* Live Metrics Input */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Metrics</h3>
                
                <div className="space-y-3">
                  <div>
                    <label htmlFor="metrics_temperature" className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
                    <input
                      id="metrics_temperature"
                      type="number"
                      step="0.1"
                      value={currentMetrics.temperature}
                      onChange={(e) => setCurrentMetrics(prev => ({ ...prev, temperature: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="78.5"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="metrics_pressure" className="block text-sm font-medium text-gray-700 mb-1">Pressure (bar)</label>
                    <input
                      id="metrics_pressure"
                      type="number"
                      step="0.1"
                      value={currentMetrics.pressure}
                      onChange={(e) => setCurrentMetrics(prev => ({ ...prev, pressure: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1.2"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="metrics_abv_percent" className="block text-sm font-medium text-gray-700 mb-1">ABV (%)</label>
                    <input
                      id="metrics_abv_percent"
                      type="number"
                      step="0.1"
                      value={currentMetrics.abv}
                      onChange={(e) => setCurrentMetrics(prev => ({ ...prev, abv: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="82.4"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="metrics_volume_l" className="block text-sm font-medium text-gray-700 mb-1">Volume (L)</label>
                    <input
                      id="metrics_volume_l"
                      type="number"
                      step="0.1"
                      value={currentMetrics.volume}
                      onChange={(e) => setCurrentMetrics(prev => ({ ...prev, volume: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="150.5"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="metrics_flow_rate_lh" className="block text-sm font-medium text-gray-700 mb-1">Flow Rate (L/h)</label>
                    <input
                      id="metrics_flow_rate_lh"
                      type="number"
                      step="0.1"
                      value={currentMetrics.flowRate}
                      onChange={(e) => setCurrentMetrics(prev => ({ ...prev, flowRate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="12.5"
                    />
                  </div>
                </div>
                
                <button
                  onClick={addCurrentMetricsToPhase}
                  disabled={!phases.some(p => p.status === 'active')}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Record Metrics
                </button>
              </div>

              {/* Overall Notes */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Notes</h3>
                <textarea
                  value={overallNotes}
                  onChange={(e) => setOverallNotes(e.target.value)}
                  placeholder="Add general observations, problems encountered, adjustments made, etc..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Controls */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Controls</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setIsTracking(!isTracking)}
                    className={`w-full px-4 py-2 rounded-lg font-medium ${
                      isTracking 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isTracking ? '⏸️ Pause Tracking' : '▶️ Start Tracking'}
                  </button>
                  
                  <button
                    onClick={saveDistillationDetails}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    💾 Save All Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
