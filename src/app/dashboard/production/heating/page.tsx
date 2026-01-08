"use client"

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function HeatingContent() {
  const router = useRouter()
  const searchParams = useSearchParams() as URLSearchParams | null
  const recipeId = searchParams?.get('recipeId')
  const batchId = searchParams?.get('batchId')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [boilerOnTime, setBoilerOnTime] = useState('')
  const [powerSetting, setPowerSetting] = useState('35A')
  const [elements, setElements] = useState('')
  const [plates, setPlates] = useState('')
  const [deflegmator, setDeflegmator] = useState('off')
  const [warmUpTemp, setWarmUpTemp] = useState('')
  const [startTemp, setStartTemp] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = () => {
    if (!batchId) {
      setError('Missing batch ID')
      return
    }

    // Save to localStorage for now
    const heatingData = {
      recipeId,
      batchId,
      date,
      boilerOnTime,
      powerSetting,
      elements,
      plates,
      deflegmator,
      warmUpTemp,
      startTemp,
      notes
    }
    
    localStorage.setItem('distillation_heating', JSON.stringify(heatingData))
    
    // Navigate to distillation cuts phase
    router.push(`/dashboard/production/distillation-cuts?recipeId=${recipeId}&batchId=${batchId}`)
  }

  return (
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-graphite/50">
          <span>Preparation</span>
          <span>→</span>
          <span>Botanical Steeping</span>
          <span>→</span>
          <span className="text-copper font-semibold">Heating</span>
          <span>→</span>
          <span>Distillation Cuts</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-graphite">Heating</h1>
          <p className="text-sm text-graphite/70 mt-1">
            Boiler settings and still configuration — {batchId || 'No Batch ID'}
          </p>
        </div>

        {error && (
          <div className="bg-beige border border-copper-30 rounded-xl p-4 mb-6">
            <p className="text-copper text-sm">{error}</p>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-6">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="heating_date" className="block text-sm font-medium text-graphite mb-2">
                Date
              </label>
              <input
                id="heating_date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>
            <div>
              <label htmlFor="boiler_on_time" className="block text-sm font-medium text-graphite mb-2">
                Boiler On Time
              </label>
              <input
                id="boiler_on_time"
                type="time"
                value={boilerOnTime}
                onChange={(e) => setBoilerOnTime(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>
          </div>

          {/* Power & Elements */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="power_setting" className="block text-sm font-medium text-graphite mb-2">
                Power Setting
              </label>
              <select
                id="power_setting"
                value={powerSetting}
                onChange={(e) => setPowerSetting(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              >
                <option value="35A">35A</option>
                <option value="30A">30A</option>
                <option value="25A">25A</option>
                <option value="20A">20A</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label htmlFor="heating_elements" className="block text-sm font-medium text-graphite mb-2">
                Heating Elements
              </label>
              <input
                id="heating_elements"
                type="text"
                value={elements}
                onChange={(e) => setElements(e.target.value)}
                placeholder="e.g., 6 × 5750W"
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>
          </div>

          {/* Still Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="plates" className="block text-sm font-medium text-graphite mb-2">
                Plates
              </label>
              <input
                id="plates"
                type="text"
                value={plates}
                onChange={(e) => setPlates(e.target.value)}
                placeholder="e.g., All plates, Zero plates"
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>
            <div>
              <label htmlFor="deflegmator" className="block text-sm font-medium text-graphite mb-2">
                Deflegmator
              </label>
              <select
                id="deflegmator"
                value={deflegmator}
                onChange={(e) => setDeflegmator(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              >
                <option value="off">Off</option>
                <option value="on">On</option>
                <option value="water-running">Water Running</option>
              </select>
            </div>
          </div>

          {/* Temperature */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="warm_up_temp" className="block text-sm font-medium text-graphite mb-2">
                Warm-up Temperature (°C)
              </label>
              <input
                id="warm_up_temp"
                type="number"
                value={warmUpTemp}
                onChange={(e) => setWarmUpTemp(e.target.value)}
                placeholder="e.g., 70"
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
              <p className="text-xs text-graphite/50 mt-1">Temperature before heating started</p>
            </div>
            <div>
              <label htmlFor="start_temp" className="block text-sm font-medium text-graphite mb-2">
                Start Temperature (°C)
              </label>
              <input
                id="start_temp"
                type="number"
                value={startTemp}
                onChange={(e) => setStartTemp(e.target.value)}
                placeholder="e.g., 50"
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
              <p className="text-xs text-graphite/50 mt-1">Temperature when boiler turned on</p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="heating_notes" className="block text-sm font-medium text-graphite mb-2">
              Notes
            </label>
            <textarea
              id="heating_notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Warmed up to 70°C a day before; 50°C at 06:00; turned on at 35A..."
              className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <button
              onClick={() => router.push(`/dashboard/production/botanical-steeping?recipeId=${recipeId || ''}&batchId=${batchId || ''}`)}
              className="px-6 py-3 bg-copper-10 hover:bg-copper-20 text-graphite rounded-lg font-medium transition-colors border border-copper-30"
            >
              ← Back to Steeping
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !batchId}
              className="px-6 py-3 bg-copper hover:bg-copper/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save & Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HeatingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-beige p-6" />}> 
      <HeatingContent />
    </Suspense>
  )
}
