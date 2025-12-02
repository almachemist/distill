'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DistillationSession } from '@/modules/production/types/distillation-session.types'
import { DistillationSessionCalculator } from '@/modules/production/services/distillation-session-calculator.service'
import { merchantMaeGinDistillation } from '@/modules/production/sessions/merchant-mae-gin-distillation.session'
import { vodka003Distillation } from '@/modules/production/sessions/vodka-003-distillation.session'
import { rainforestGinRF30 } from '@/modules/production/sessions/rainforest-gin-rf30-distillation.session'
import InteractiveDistillationPanel from '@/modules/production/components/InteractiveDistillationPanel'

interface InteractiveDistillationData {
  spiritRunId: string
  sku: string
  date: string
  stillUsed: string
  boilerOn: string
  charge: Array<{
    source: string
    volume_L: number
    abv: number
    lal: number
  }>
  botanicals: Array<{
    name: string
    notes: string
    weight_g: number
    ratio: number
    status: 'ok' | 'pending' | 'issue'
  }>
  cuts: {
    foreshots: { volume_L: number | null; abv: number | null; notes: string }
    heads: { volume_L: number | null; abv: number | null; notes: string }
    hearts: { volume_L: number | null; abv: number | null; notes: string }
    tails: { volume_L: number | null; abv: number | null; notes: string }
  }
  notes: string
}

export default function InteractiveDistillationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<DistillationSession[]>([])
  const [selectedSession, setSelectedSession] = useState<DistillationSession | null>(null)
  const [savedData, setSavedData] = useState<InteractiveDistillationData[]>([])
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    setLoading(true)
    try {
      // Load example sessions and process them with calculations
      const exampleSessions = [
        merchantMaeGinDistillation,
        rainforestGinRF30,
        vodka003Distillation
      ]

      const processedSessions = exampleSessions.map(session => 
        DistillationSessionCalculator.processDistillationSession(session)
      )

      setSessions(processedSessions)
      if (processedSessions.length > 0) {
        setSelectedSession(processedSessions[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load distillation sessions')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSave = (data: InteractiveDistillationData) => {
    // In a real application, this would save to the database
    console.log('Saving distillation data:', data)
    
    // Update local state
    setSavedData(prev => {
      const existingIndex = prev.findIndex(d => d.spiritRunId === data.spiritRunId)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = data
        return updated
      } else {
        return [...prev, data]
      }
    })

    // Show success message
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleDuplicate = (data: InteractiveDistillationData) => {
    // Create a new batch based on the current one
    const newData: InteractiveDistillationData = {
      ...data,
      spiritRunId: `${data.spiritRunId}-COPY-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      cuts: {
        foreshots: { volume_L: null, abv: null, notes: '' },
        heads: { volume_L: null, abv: null, notes: '' },
        hearts: { volume_L: null, abv: null, notes: '' },
        tails: { volume_L: null, abv: null, notes: '' }
      },
      notes: `Duplicated from ${data.spiritRunId} on ${new Date().toLocaleDateString()}`
    }

    console.log('Duplicating batch:', newData)
    
    // In a real application, this would create a new session
    alert(`Batch duplicated! New ID: ${newData.spiritRunId}`)
  }

  const handleExport = (data: InteractiveDistillationData) => {
    // Generate PDF export
    console.log('Exporting to PDF:', data)
    
    // In a real application, this would generate and download a PDF
    const exportData = {
      ...data,
      exportDate: new Date().toISOString(),
      totalVolume: data.charge.reduce((sum, c) => sum + c.volume_L, 0),
      totalLAL: data.charge.reduce((sum, c) => sum + c.lal, 0),
      totalBotanicals: data.botanicals.reduce((sum, b) => sum + b.weight_g, 0)
    }

    // Create downloadable JSON file
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `distillation-${data.spiritRunId}-${data.date}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    alert('Export completed! Check your downloads folder.')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          ✅ Data saved successfully!
        </div>
      )}

      {/* Session Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Distillation Session</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedSession?.id === session.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium text-gray-900">{session.sku}</div>
              <div className="text-sm text-gray-600">{session.spiritRun}</div>
              <div className="text-sm text-gray-500">{session.date}</div>
              <div className="text-sm text-gray-500">Still: {session.still}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Panel */}
      {selectedSession && (
        <InteractiveDistillationPanel
          session={selectedSession}
          onSave={handleSave}
          onDuplicate={handleDuplicate}
          onExport={handleExport}
        />
      )}

      {/* Saved Data Summary */}
      {savedData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Saved Data Summary</h2>
          <div className="space-y-3">
            {savedData.map((data, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{data.sku}</div>
                  <div className="text-sm text-gray-600">{data.spiritRunId}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {data.charge.length} components • {data.botanicals.length} botanicals
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="flex justify-start">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  )
}
