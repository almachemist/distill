'use client'

import { useState, useEffect } from 'react'
import { DistillationSession } from '@/modules/production/types/distillation-session.types'

interface CutData {
  id: string
  name: string
  icon: string
  startTime?: string
  endTime?: string
  volume: number
  abv: number
  tank: string
  notes: string
  status: 'pending' | 'active' | 'completed'
}

interface PowerData {
  elementsOnTime?: string
  elementsOffTime?: string
  powerKW: number
  totalHours: number
  notes: string
}

interface DistillationCutsModalProps {
  session: DistillationSession
  isOpen: boolean
  onClose: () => void
  onSave: (cutsData: CutData[], powerData: PowerData) => void
}

export default function DistillationCutsModal({ 
  session, 
  isOpen, 
  onClose, 
  onSave 
}: DistillationCutsModalProps) {
  const [cuts, setCuts] = useState<CutData[]>([
    {
      id: 'foreshots',
      name: 'Foreshots',
      icon: '⚡',
      volume: 0,
      abv: 0,
      tank: '',
      notes: '',
      status: 'pending'
    },
    {
      id: 'heads',
      name: 'Heads',
      icon: '💧',
      volume: 0,
      abv: 0,
      tank: '',
      notes: '',
      status: 'pending'
    },
    {
      id: 'hearts',
      name: 'Hearts',
      icon: '💎',
      volume: 0,
      abv: 0,
      tank: '',
      notes: '',
      status: 'pending'
    },
    {
      id: 'tails',
      name: 'Tails',
      icon: '🌊',
      volume: 0,
      abv: 0,
      tank: '',
      notes: '',
      status: 'pending'
    }
  ])

  const [currentTime, setCurrentTime] = useState('')
  const [isTracking, setIsTracking] = useState(false)
  const [powerData, setPowerData] = useState<PowerData>({
    powerKW: 32,
    totalHours: 0,
    notes: ''
  })

  // Common tank options
  const tankOptions = [
    'FEINTS-GIN-001',
    'FEINTS-GIN-002', 
    'GIN-NS-0016',
    'GIN-NS-0017',
    'GIN-NS-0018',
    'DISCARDED',
    'NEW-TANK-001',
    'NEW-TANK-002'
  ]

  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => {
        setCurrentTime(new Date().toLocaleTimeString())
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isOpen])

  const startCut = (cutId: string) => {
    setCuts(prev => prev.map(cut => {
      if (cut.id === cutId) {
        return {
          ...cut,
          status: 'active',
          startTime: new Date().toISOString()
        }
      } else if (cut.status === 'active') {
        return {
          ...cut,
          status: 'completed',
          endTime: new Date().toISOString()
        }
      }
      return cut
    }))
  }

  const completeCut = (cutId: string) => {
    setCuts(prev => prev.map(cut => {
      if (cut.id === cutId) {
        return {
          ...cut,
          status: 'completed',
          endTime: new Date().toISOString()
        }
      }
      return cut
    }))
  }

  const updateCutField = (cutId: string, field: keyof CutData, value: any) => {
    setCuts(prev => prev.map(cut => 
      cut.id === cutId ? { ...cut, [field]: value } : cut
    ))
  }

  const updatePowerField = (field: keyof PowerData, value: any) => {
    setPowerData(prev => ({ ...prev, [field]: value }))
  }

  const turnElementsOn = () => {
    setPowerData(prev => ({
      ...prev,
      elementsOnTime: new Date().toISOString()
    }))
  }

  const turnElementsOff = () => {
    if (powerData.elementsOnTime) {
      const startTime = new Date(powerData.elementsOnTime)
      const endTime = new Date()
      const diffHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
      
      setPowerData(prev => ({
        ...prev,
        elementsOffTime: endTime.toISOString(),
        totalHours: prev.totalHours + diffHours
      }))
    }
  }

  const calculateTotalVolume = () => {
    return cuts.reduce((sum, cut) => sum + cut.volume, 0)
  }

  const calculateTotalLAL = () => {
    return cuts.reduce((sum, cut) => sum + (cut.volume * cut.abv / 100), 0)
  }

  const getCutStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getCutStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅'
      case 'active': return '🟢'
      default: return '⏳'
    }
  }

  const formatDuration = (startTime?: string, endTime?: string) => {
    if (!startTime) return ''
    
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffSecs = Math.floor((diffMs % 60000) / 1000)
    
    return `${diffMins}:${diffSecs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Distillation Cuts Tracking</h2>
              <p className="text-purple-100">{session.sku} - {session.date}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-purple-100">Current Time</div>
                <div className="text-lg font-mono">{currentTime}</div>
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
            {/* Left Column - Cuts */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cuts Collection</h3>
              
              <div className="space-y-4">
                {cuts.map((cut) => (
                  <div
                    key={cut.id}
                    className={`border-2 rounded-xl p-4 transition-all duration-300 ${getCutStatusColor(cut.status)}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cut.icon}</span>
                        <div>
                          <h4 className="font-semibold">{cut.name}</h4>
                          <div className="flex items-center gap-2 text-sm">
                            <span>{getCutStatusIcon(cut.status)}</span>
                            <span className="capitalize">{cut.status}</span>
                            {cut.startTime && (
                              <span className="text-xs opacity-75">
                                Duration: {formatDuration(cut.startTime, cut.endTime)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {cut.status === 'pending' && (
                          <button
                            onClick={() => startCut(cut.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                          >
                            Start
                          </button>
                        )}
                        {cut.status === 'active' && (
                          <button
                            onClick={() => completeCut(cut.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Cut Data Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Volume (L)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={cut.volume || ''}
                          onChange={(e) => updateCutField(cut.id, 'volume', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ABV (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={cut.abv || ''}
                          onChange={(e) => updateCutField(cut.id, 'abv', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tank
                        </label>
                        <select
                          value={cut.tank}
                          onChange={(e) => updateCutField(cut.id, 'tank', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select tank...</option>
                          {tankOptions.map(tank => (
                            <option key={tank} value={tank}>{tank}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          LAL
                        </label>
                        <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm">
                          {(cut.volume * cut.abv / 100).toFixed(2)}L
                        </div>
                      </div>
                    </div>

                    {/* Cut Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes:
                      </label>
                      <textarea
                        value={cut.notes}
                        onChange={(e) => updateCutField(cut.id, 'notes', e.target.value)}
                        placeholder={`Add observations for ${cut.name.toLowerCase()}...`}
                        className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Time Stamps */}
                    {cut.startTime && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-medium">Start:</span> {new Date(cut.startTime).toLocaleTimeString()}
                          </div>
                          {cut.endTime && (
                            <div>
                              <span className="font-medium">End:</span> {new Date(cut.endTime).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Summary & Controls */}
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Volume:</span>
                    <span className="font-medium">{calculateTotalVolume().toFixed(1)}L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total LAL:</span>
                    <span className="font-medium">{calculateTotalLAL().toFixed(2)}L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completed Cuts:</span>
                    <span className="font-medium">{cuts.filter(c => c.status === 'completed').length}/4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Cut:</span>
                    <span className="font-medium">
                      {cuts.find(c => c.status === 'active')?.name || 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tank Usage */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tank Usage</h3>
                
                <div className="space-y-2">
                  {tankOptions.map(tank => {
                    const cutsUsingTank = cuts.filter(cut => cut.tank === tank)
                    if (cutsUsingTank.length === 0) return null
                    
                    return (
                      <div key={tank} className="flex justify-between items-center text-sm">
                        <span className="font-medium">{tank}</span>
                        <div className="flex gap-1">
                          {cutsUsingTank.map(cut => (
                            <span key={cut.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {cut.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Power Control */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Power Control</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Power (kW)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={powerData.powerKW || ''}
                      onChange={(e) => updatePowerField('powerKW', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="32.0"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={turnElementsOn}
                      disabled={!!powerData.elementsOnTime}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                    >
                      🔌 Turn On
                    </button>
                    <button
                      onClick={turnElementsOff}
                      disabled={!powerData.elementsOnTime}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                    >
                      🔌 Turn Off
                    </button>
                  </div>
                  
                  {powerData.elementsOnTime && (
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span>On since:</span>
                        <span className="font-medium">
                          {new Date(powerData.elementsOnTime).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total hours:</span>
                        <span className="font-medium">{powerData.totalHours.toFixed(2)}h</span>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Power Notes
                    </label>
                    <textarea
                      value={powerData.notes}
                      onChange={(e) => updatePowerField('notes', e.target.value)}
                      placeholder="Power adjustments, issues, etc..."
                      className="w-full h-16 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
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
                    onClick={() => onSave(cuts, powerData)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    💾 Save All Data
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
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
