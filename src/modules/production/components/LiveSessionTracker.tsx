'use client'

import { useState, useEffect } from 'react'
import { DistillationSession } from '@/modules/production/types/distillation-session.types'

interface DailyLogEntry {
  id: string
  sessionId: string
  timestamp: string
  phase: 'preparation' | 'steeping' | 'distillation' | 'post-processing'
  notes: string
  temperature?: number
  pressure?: number
  abv?: number
  volume?: number
}

interface LiveSessionTrackerProps {
  session: DistillationSession
  onUpdate: (session: DistillationSession) => void
}

export default function LiveSessionTracker({ session, onUpdate }: LiveSessionTrackerProps) {
  const [currentPhase, setCurrentPhase] = useState<'preparation' | 'steeping' | 'distillation' | 'post-processing'>('preparation')
  const [notes, setNotes] = useState('')
  const [temperature, setTemperature] = useState<number | undefined>()
  const [pressure, setPressure] = useState<number | undefined>()
  const [abv, setAbv] = useState<number | undefined>()
  const [volume, setVolume] = useState<number | undefined>()
  const [logEntries, setLogEntries] = useState<DailyLogEntry[]>([])
  const [isTracking, setIsTracking] = useState(false)

  const phases = [
    { key: 'preparation', label: 'Preparation', icon: '🔧' },
    { key: 'steeping', label: 'Steeping', icon: '🌿' },
    { key: 'distillation', label: 'Distillation', icon: '⚗️' },
    { key: 'post-processing', label: 'Post-processing', icon: '📦' }
  ]

  const addLogEntry = () => {
    if (!notes.trim()) return

    const newEntry: DailyLogEntry = {
      id: Date.now().toString(),
      sessionId: session.id,
      timestamp: new Date().toISOString(),
      phase: currentPhase,
      notes: notes.trim(),
      temperature,
      pressure,
      abv,
      volume
    }

    setLogEntries(prev => [newEntry, ...prev])
    setNotes('')
    setTemperature(undefined)
    setPressure(undefined)
    setAbv(undefined)
    setVolume(undefined)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'preparation': return 'bg-blue-100 text-blue-800'
      case 'steeping': return 'bg-green-100 text-green-800'
      case 'distillation': return 'bg-purple-100 text-purple-800'
      case 'post-processing': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Real-Time Tracking
        </h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className="text-sm text-gray-600">
            {isTracking ? 'Active' : 'Paused'}
          </span>
        </div>
      </div>

      {/* Session Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Batch:</span>
            <div className="text-gray-900">{session.sku}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Date:</span>
            <div className="text-gray-900">{session.date}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Still:</span>
            <div className="text-gray-900">{session.still}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Start:</span>
            <div className="text-gray-900">{session.boilerOn}</div>
          </div>
        </div>
      </div>

      {/* Phase Selector */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Current Phase</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {phases.map((phase) => (
            <button
              key={phase.key}
              onClick={() => setCurrentPhase(phase.key as any)}
              className={`p-3 rounded-lg border-2 transition-colors ${
                currentPhase === phase.key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{phase.icon}</div>
              <div className="text-sm font-medium">{phase.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label htmlFor="live_temperature_c" className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
          <input
            type="number"
            id="live_temperature_c"
            value={temperature || ''}
            onChange={(e) => setTemperature(e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 78.5"
          />
        </div>
        <div>
          <label htmlFor="live_pressure_bar" className="block text-sm font-medium text-gray-700 mb-1">Pressure (bar)</label>
          <input
            type="number"
            step="0.1"
            id="live_pressure_bar"
            value={pressure || ''}
            onChange={(e) => setPressure(e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 1.2"
          />
        </div>
        <div>
          <label htmlFor="live_abv_percent" className="block text-sm font-medium text-gray-700 mb-1">ABV (%)</label>
          <input
            type="number"
            step="0.1"
            id="live_abv_percent"
            value={abv || ''}
            onChange={(e) => setAbv(e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 82.4"
          />
        </div>
        <div>
          <label htmlFor="live_volume_l" className="block text-sm font-medium text-gray-700 mb-1">Volume (L)</label>
          <input
            type="number"
            step="0.1"
            id="live_volume_l"
            value={volume || ''}
            onChange={(e) => setVolume(e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 150.5"
          />
        </div>
      </div>

      {/* Notes Input */}
      <div className="mb-6">
        <label htmlFor="live_notes" className="block text-sm font-medium text-gray-700 mb-2">
          Current Observations
        </label>
        <textarea
          id="live_notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe what's happening now... (e.g., 'Starting distillation', 'Adjusting temperature', 'First drop collected')"
          className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={addLogEntry}
            disabled={!notes.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add Entry
          </button>
        </div>
      </div>

      {/* Log Entries */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Daily Log</h3>
        {logEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No entries yet. Start adding observations about the distillation.
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {logEntries.map((entry) => (
              <div key={entry.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPhaseColor(entry.phase)}`}>
                      {phases.find(p => p.key === entry.phase)?.icon} {phases.find(p => p.key === entry.phase)?.label}
                    </span>
                    <span className="text-sm text-gray-500">{formatTime(entry.timestamp)}</span>
                  </div>
                </div>
                
                <div className="text-gray-900 mb-2">{entry.notes}</div>
                
                {(entry.temperature || entry.pressure || entry.abv || entry.volume) && (
                  <div className="flex gap-4 text-sm text-gray-600">
                    {entry.temperature && <span>🌡️ {entry.temperature}°C</span>}
                    {entry.pressure && <span>📊 {entry.pressure} bar</span>}
                    {entry.abv && <span>🍷 {entry.abv}% ABV</span>}
                    {entry.volume && <span>📏 {entry.volume}L</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
