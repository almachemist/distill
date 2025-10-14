'use client'

import { useState } from 'react'
import DailyDetailsCard from '@/modules/production/components/DailyDetailsCard'

interface DistillationData {
  date: string
  volume: string
  still: string
  abv: string
  notes: string
  cuts: {
    foreshots: { volume: string; abv: string; notes: string }
    heads: { volume: string; abv: string; notes: string }
    hearts: { volume: string; abv: string; notes: string }
    tails: { volume: string; abv: string; notes: string }
  }
}

export default function DailyDetailsPage() {
  const [savedData, setSavedData] = useState<DistillationData[]>([])
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSave = (data: DistillationData) => {
    console.log('Saving distillation data:', data)
    
    // Update local state
    setSavedData(prev => {
      const existingIndex = prev.findIndex(d => d.date === data.date)
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

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <span>✅</span>
          <span>Data saved successfully!</span>
        </div>
      )}

      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Interactive Distillation Panel
          </h1>
          <p className="text-xl text-gray-600">
            Click any field to edit • Auto-saves after 2 seconds • Modern UI with Tailwind
          </p>
        </div>
      </div>

      {/* Main Card */}
      <DailyDetailsCard 
        sessionId="SPIRIT-GIN-MM-002"
        onSave={handleSave}
      />

      {/* Features Demo */}
      <div className="max-w-4xl mx-auto px-4 mt-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">✨ Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Inline Editing</h3>
                  <p className="text-gray-600 text-sm">Click any field to edit directly inline</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Auto-Save</h3>
                  <p className="text-gray-600 text-sm">Automatically saves after 2 seconds of inactivity</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Keyboard Shortcuts</h3>
                  <p className="text-gray-600 text-sm">Press Enter to save, Escape to cancel</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 font-semibold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Editable Tables</h3>
                  <p className="text-gray-600 text-sm">Complete cuts and yields table with inline editing</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-semibold">5</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Change Tracking</h3>
                  <p className="text-gray-600 text-sm">Visual indicators for unsaved changes</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 font-semibold">6</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Modern UI</h3>
                  <p className="text-gray-600 text-sm">Clean design with Tailwind CSS and smooth transitions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Data Summary */}
      {savedData.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">💾 Saved Data</h2>
            <div className="space-y-3">
              {savedData.map((data, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{data.still} - {data.date}</div>
                    <div className="text-sm text-gray-600">{data.volume} @ {data.abv}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {Object.values(data.cuts).filter(cut => cut.volume).length} cuts recorded
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🎯 How to Use</h3>
          <ol className="space-y-2 text-blue-800">
            <li>1. <strong>Click any field</strong> to start editing (Date, Volume, Still, ABV, Notes)</li>
            <li>2. <strong>Edit the cuts table</strong> by clicking on Volume, ABV, or Observations columns</li>
            <li>3. <strong>Press Enter</strong> to save or <strong>Escape</strong> to cancel</li>
            <li>4. <strong>Auto-save</strong> happens after 2 seconds of inactivity</li>
            <li>5. <strong>Manual save</strong> with the "Save Changes" button</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
