"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function RumDistillationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const batchId = searchParams.get('batchId') || ''

  // Load fermentation data
  const [fermentationData, setFermentationData] = useState<any>(null)

  useEffect(() => {
    const data = localStorage.getItem('rum_fermentation')
    if (data) {
      setFermentationData(JSON.parse(data))
    }
  }, [])

  // Form state
  const [distillationDate, setDistillationDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('06:00')

  // Boiler (wash from fermentation)
  const [boilerVolume, setBoilerVolume] = useState(1000)
  const [boilerABV, setBoilerABV] = useState(fermentationData?.finalABV || 9.6)
  const [boilerLAL, setBoilerLAL] = useState(0)

  // Retort 1 (late tails from previous run)
  const [retort1Content, setRetort1Content] = useState('Late tails from previous run')
  const [retort1Volume, setRetort1Volume] = useState(140)
  const [retort1ABV, setRetort1ABV] = useState(49.0)
  const [retort1LAL, setRetort1LAL] = useState(0)

  // Retort 2 (early tails from previous run)
  const [retort2Content, setRetort2Content] = useState('Early tails from previous run')
  const [retort2Volume, setRetort2Volume] = useState(134)
  const [retort2ABV, setRetort2ABV] = useState(80.4)
  const [retort2LAL, setRetort2LAL] = useState(0)

  // Heat profile
  const [boilerElements, setBoilerElements] = useState('5 × 5750 W')
  const [retort1Elements, setRetort1Elements] = useState('2200 W')
  const [retort2Elements, setRetort2Elements] = useState('2400 W')

  // Cuts
  const [foreshotsTime, setForeshotsTime] = useState('08:30')
  const [foreshotsABV, setForeshotsABV] = useState(82.6)
  const [foreshotsNotes, setForeshotsNotes] = useState('Discarded')

  const [headsTime, setHeadsTime] = useState('09:15')
  const [headsVolume, setHeadsVolume] = useState(30)
  const [headsABV, setHeadsABV] = useState(83.8)
  const [headsLAL, setHeadsLAL] = useState(0)
  const [headsNotes, setHeadsNotes] = useState('')

  const [heartsTime, setHeartsTime] = useState('13:15')
  const [heartsVolume, setHeartsVolume] = useState(97)
  const [heartsABV, setHeartsABV] = useState(82.8)
  const [heartsLAL, setHeartsLAL] = useState(0)
  const [heartsNotes, setHeartsNotes] = useState('')

  // Tails (multi-part)
  const [tailsSegments, setTailsSegments] = useState([
    { time: '15:10', volume: 105, abv: 79.6, lal: 0, notes: '' }
  ])

  const [notes, setNotes] = useState('')

  // Auto-calculate LAL
  useEffect(() => {
    setBoilerLAL((boilerVolume * boilerABV) / 100)
  }, [boilerVolume, boilerABV])

  useEffect(() => {
    setRetort1LAL((retort1Volume * retort1ABV) / 100)
  }, [retort1Volume, retort1ABV])

  useEffect(() => {
    setRetort2LAL((retort2Volume * retort2ABV) / 100)
  }, [retort2Volume, retort2ABV])

  useEffect(() => {
    setHeadsLAL((headsVolume * headsABV) / 100)
  }, [headsVolume, headsABV])

  useEffect(() => {
    setHeartsLAL((heartsVolume * heartsABV) / 100)
  }, [heartsVolume, heartsABV])

  const addTailsSegment = () => {
    setTailsSegments([
      ...tailsSegments,
      { time: '', volume: 0, abv: 0, lal: 0, notes: '' }
    ])
  }

  const updateTailsSegment = (index: number, field: string, value: any) => {
    const updated = [...tailsSegments]
    updated[index] = { ...updated[index], [field]: value }
    
    // Auto-calculate LAL for tails
    if (field === 'volume' || field === 'abv') {
      updated[index].lal = (updated[index].volume * updated[index].abv) / 100
    }
    
    setTailsSegments(updated)
  }

  const removeTailsSegment = (index: number) => {
    if (tailsSegments.length > 1) {
      setTailsSegments(tailsSegments.filter((_, i) => i !== index))
    }
  }

  // Calculate yield metrics
  const totalLALStart = boilerLAL + retort1LAL + retort2LAL
  const totalLALEnd = headsLAL + heartsLAL + tailsSegments.reduce((sum, t) => sum + t.lal, 0)
  const lalLoss = totalLALStart - totalLALEnd
  const heartYieldPercent = totalLALStart > 0 ? (heartsLAL / totalLALStart) * 100 : 0

  const handleSubmit = () => {
    if (!batchId) {
      alert('Missing batch ID')
      return
    }

    const distillationData = {
      batchId,
      date: distillationDate,
      startTime,
      
      // Vessels
      boilerVolume,
      boilerABV,
      boilerLAL,
      retort1Content,
      retort1Volume,
      retort1ABV,
      retort1LAL,
      retort2Content,
      retort2Volume,
      retort2ABV,
      retort2LAL,
      
      // Heat
      boilerElements,
      retort1Elements,
      retort2Elements,
      
      // Cuts
      foreshotsTime,
      foreshotsABV,
      foreshotsNotes,
      headsTime,
      headsVolume,
      headsABV,
      headsLAL,
      headsNotes,
      heartsTime,
      heartsVolume,
      heartsABV,
      heartsLAL,
      heartsNotes,
      tailsSegments,
      
      // Yield
      totalLALStart,
      totalLALEnd,
      lalLoss,
      heartYieldPercent,
      
      notes
    }

    localStorage.setItem('rum_distillation', JSON.stringify(distillationData))
    
    // Navigate to cask filling
    router.push(`/dashboard/production/rum/cask-filling?batchId=${batchId}`)
  }

  const handleBack = () => {
    router.push(`/dashboard/production/rum/fermentation`)
  }

  return (
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <div className="text-sm text-graphite/60">
          <span>Production</span>
          <span className="mx-2">→</span>
          <span>Rum Production</span>
          <span className="mx-2">→</span>
          <span>Fermentation</span>
          <span className="mx-2">→</span>
          <span className="font-medium text-copper">Double Retort Distillation</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-graphite mb-2">Double Retort Distillation</h1>
          <p className="text-graphite/70">
            Batch: <span className="font-mono font-medium text-copper">{batchId}</span>
          </p>
          <p className="text-sm text-graphite/60 mt-2">
            Still: <span className="font-mono font-medium text-copper">Roberta (Double Retort)</span>
          </p>
        </div>

        {/* Date & Time */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-graphite">Distillation Details</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Date</label>
              <input
                type="date"
                value={distillationDate}
                onChange={(e) => setDistillationDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>
          </div>
        </div>

        {/* Vessels Configuration */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold text-graphite">Vessel Configuration (3-Vessel System)</h2>
          
          <div className="grid grid-cols-3 gap-4">
            {/* Boiler */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-blue-900">Boiler (Wash)</h3>
              
              <div>
                <label className="block text-xs font-medium text-blue-700 mb-1">Volume (L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={boilerVolume}
                  onChange={(e) => setBoilerVolume(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-graphite text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-blue-700 mb-1">ABV (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={boilerABV}
                  onChange={(e) => setBoilerABV(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-graphite text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-blue-700 mb-1">LAL</label>
                <input
                  type="number"
                  value={boilerLAL.toFixed(2)}
                  readOnly
                  className="w-full px-3 py-2 bg-blue-100 border border-blue-200 rounded-lg text-blue-900 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-blue-700 mb-1">Elements</label>
                <input
                  type="text"
                  value={boilerElements}
                  onChange={(e) => setBoilerElements(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-graphite text-sm"
                />
              </div>
            </div>

            {/* Retort 1 */}
            <div className="bg-amber-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-amber-900">Retort 1 (Late Tails)</h3>
              
              <div>
                <label className="block text-xs font-medium text-amber-700 mb-1">Content</label>
                <input
                  type="text"
                  value={retort1Content}
                  onChange={(e) => setRetort1Content(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-graphite text-sm"
                  placeholder="Late tails from..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-700 mb-1">Volume (L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={retort1Volume}
                  onChange={(e) => setRetort1Volume(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-graphite text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-700 mb-1">ABV (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={retort1ABV}
                  onChange={(e) => setRetort1ABV(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-graphite text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-700 mb-1">LAL</label>
                <input
                  type="number"
                  value={retort1LAL.toFixed(2)}
                  readOnly
                  className="w-full px-3 py-2 bg-amber-100 border border-amber-200 rounded-lg text-amber-900 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-700 mb-1">Elements</label>
                <input
                  type="text"
                  value={retort1Elements}
                  onChange={(e) => setRetort1Elements(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-graphite text-sm"
                />
              </div>
            </div>

            {/* Retort 2 */}
            <div className="bg-orange-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-orange-900">Retort 2 (Early Tails)</h3>
              
              <div>
                <label className="block text-xs font-medium text-orange-700 mb-1">Content</label>
                <input
                  type="text"
                  value={retort2Content}
                  onChange={(e) => setRetort2Content(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-graphite text-sm"
                  placeholder="Early tails from..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-orange-700 mb-1">Volume (L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={retort2Volume}
                  onChange={(e) => setRetort2Volume(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-graphite text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-orange-700 mb-1">ABV (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={retort2ABV}
                  onChange={(e) => setRetort2ABV(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-graphite text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-orange-700 mb-1">LAL</label>
                <input
                  type="number"
                  value={retort2LAL.toFixed(2)}
                  readOnly
                  className="w-full px-3 py-2 bg-orange-100 border border-orange-200 rounded-lg text-orange-900 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-orange-700 mb-1">Elements</label>
                <input
                  type="text"
                  value={retort2Elements}
                  onChange={(e) => setRetort2Elements(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-graphite text-sm"
                />
              </div>
            </div>
          </div>

          {/* Total LAL Start */}
          <div className="bg-gradient-to-r from-blue-50 via-amber-50 to-orange-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-graphite">Total Input LAL (All 3 Vessels)</span>
              <span className="text-2xl font-bold text-copper">{totalLALStart.toFixed(2)} L</span>
            </div>
          </div>
        </div>

        {/* Cuts Section */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold text-graphite">Distillation Cuts</h2>
          
          {/* Foreshots */}
          <div className="border border-copper-15 rounded-lg p-4">
            <h3 className="font-semibold text-graphite mb-3">Foreshots</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-graphite mb-2">Time</label>
                <input
                  type="time"
                  value={foreshotsTime}
                  onChange={(e) => setForeshotsTime(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">ABV (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={foreshotsABV}
                  onChange={(e) => setForeshotsABV(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">Notes</label>
                <input
                  type="text"
                  value={foreshotsNotes}
                  onChange={(e) => setForeshotsNotes(e.target.value)}
                  placeholder="Discarded, aggressive, etc."
                  className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                />
              </div>
            </div>
          </div>

          {/* Heads */}
          <div className="border border-copper-15 rounded-lg p-4">
            <h3 className="font-semibold text-graphite mb-3">Heads</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-graphite mb-2">Time</label>
                <input
                  type="time"
                  value={headsTime}
                  onChange={(e) => setHeadsTime(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">Volume (L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={headsVolume}
                  onChange={(e) => setHeadsVolume(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">ABV (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={headsABV}
                  onChange={(e) => setHeadsABV(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">LAL</label>
                <input
                  type="number"
                  value={headsLAL.toFixed(2)}
                  readOnly
                  className="w-full px-4 py-3 bg-beige border border-copper-15 rounded-lg text-graphite font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">Notes</label>
                <input
                  type="text"
                  value={headsNotes}
                  onChange={(e) => setHeadsNotes(e.target.value)}
                  placeholder="Aromatic, clean..."
                  className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                />
              </div>
            </div>
          </div>

          {/* Hearts */}
          <div className="border-2 border-copper rounded-lg p-4 bg-copper-10">
            <h3 className="font-semibold text-copper mb-3">Hearts (Main Cut)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-graphite mb-2">Time</label>
                <input
                  type="time"
                  value={heartsTime}
                  onChange={(e) => setHeartsTime(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">Volume (L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={heartsVolume}
                  onChange={(e) => setHeartsVolume(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">ABV (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={heartsABV}
                  onChange={(e) => setHeartsABV(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">LAL</label>
                <input
                  type="number"
                  value={heartsLAL.toFixed(2)}
                  readOnly
                  className="w-full px-4 py-3 bg-copper-20 border border-copper rounded-lg text-copper font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">Notes</label>
                <input
                  type="text"
                  value={heartsNotes}
                  onChange={(e) => setHeartsNotes(e.target.value)}
                  placeholder="Character notes..."
                  className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                />
              </div>
            </div>
          </div>

          {/* Tails (Multi-part) */}
          <div className="border border-copper-15 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-graphite">Tails (Multi-Collection)</h3>
              <button
                onClick={addTailsSegment}
                className="px-3 py-1 bg-copper-10 text-copper rounded-lg hover:bg-copper-20 border border-copper-30 text-sm font-medium"
              >
                + Add Collection
              </button>
            </div>

            <div className="space-y-3">
              {tailsSegments.map((segment, index) => (
                <div key={index} className="grid grid-cols-2 md:grid-cols-6 gap-3 p-3 bg-beige rounded-lg">
                  <div>
                    <label className="block text-xs font-medium text-graphite mb-1">Time</label>
                    <input
                      type="time"
                      value={segment.time}
                      onChange={(e) => updateTailsSegment(index, 'time', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper text-graphite text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-graphite mb-1">Volume (L)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={segment.volume}
                      onChange={(e) => updateTailsSegment(index, 'volume', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper text-graphite text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-graphite mb-1">ABV (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={segment.abv}
                      onChange={(e) => updateTailsSegment(index, 'abv', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper text-graphite text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-graphite mb-1">LAL</label>
                    <input
                      type="number"
                      value={segment.lal.toFixed(2)}
                      readOnly
                      className="w-full px-3 py-2 bg-beige border border-copper-15 rounded-lg text-graphite text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-graphite mb-1">Notes</label>
                    <input
                      type="text"
                      value={segment.notes}
                      onChange={(e) => updateTailsSegment(index, 'notes', e.target.value)}
                      placeholder="Funky, oily..."
                      className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper text-graphite text-sm"
                    />
                  </div>

                  <div className="flex items-end">
                    {tailsSegments.length > 1 && (
                      <button
                        onClick={() => removeTailsSegment(index)}
                        className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Yield Summary */}
        <div className="bg-gradient-to-br from-copper-10 to-copper-20 rounded-xl border border-copper-30 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-graphite mb-4">Yield Summary</h2>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-graphite/60 mb-1">Total Input LAL</div>
              <div className="text-2xl font-bold text-graphite">{totalLALStart.toFixed(2)} L</div>
            </div>
            
            <div>
              <div className="text-sm text-graphite/60 mb-1">Total Output LAL</div>
              <div className="text-2xl font-bold text-graphite">{totalLALEnd.toFixed(2)} L</div>
            </div>
            
            <div>
              <div className="text-sm text-graphite/60 mb-1">Heart Yield</div>
              <div className="text-2xl font-bold text-copper">{heartYieldPercent.toFixed(1)}%</div>
            </div>
            
            <div>
              <div className="text-sm text-graphite/60 mb-1">LAL Loss</div>
              <div className="text-2xl font-bold text-graphite">{lalLoss.toFixed(2)} L</div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-graphite mb-4">Distillation Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Observations, aromas, performance notes..."
            className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
          />
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-white border border-copper-30 text-graphite rounded-lg hover:bg-beige font-medium transition-all"
          >
            ← Back to Fermentation
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-copper text-white rounded-lg hover:bg-copper/90 font-medium shadow-md transition-all"
          >
            Save & Continue to Cask Filling →
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RumDistillationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-beige p-6" />}> 
      <RumDistillationContent />
    </Suspense>
  )
}
