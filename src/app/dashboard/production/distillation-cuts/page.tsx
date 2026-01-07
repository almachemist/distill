"use client"

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DistillationRunRepository } from '@/modules/production/services/distillation-run.repository'

type Cut = {
  id: string
  time: string
  volume_l: number
  abv_percent: number
  density?: number
  condenser_temp_c?: number
  head_temp_c?: number
  notes?: string
}

function DistillationCutsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const recipeId = searchParams.get('recipeId')
  const batchId = searchParams.get('batchId')
  
  const [loading, setLoading] = useState(false)
  const [activePhase, setActivePhase] = useState<'foreshots' | 'heads' | 'hearts' | 'tails'>('foreshots')
  
  // Cuts state
  const [foreshots, setForeshots] = useState<Cut[]>([{
    id: crypto.randomUUID(),
    time: '',
    volume_l: 0,
    abv_percent: 0,
    density: undefined,
    condenser_temp_c: undefined,
    notes: ''
  }])
  
  const [heads, setHeads] = useState<Cut[]>([{
    id: crypto.randomUUID(),
    time: '',
    volume_l: 0,
    abv_percent: 0,
    density: undefined,
    condenser_temp_c: undefined,
    notes: ''
  }])
  
  const [hearts, setHearts] = useState<Cut[]>([{
    id: crypto.randomUUID(),
    time: '',
    volume_l: 0,
    abv_percent: 0,
    density: undefined,
    condenser_temp_c: undefined,
    head_temp_c: undefined,
    notes: ''
  }])
  
  const [tails, setTails] = useState<Cut[]>([{
    id: crypto.randomUUID(),
    time: '',
    volume_l: 0,
    abv_percent: 0,
    density: undefined,
    condenser_temp_c: undefined,
    notes: ''
  }])

  const calculateLAL = (volume_l: number, abv_percent: number): number => {
    return Number((volume_l * (abv_percent / 100)).toFixed(2))
  }

  const getCutTotal = (cuts: Cut[]) => {
    const totalVolume = cuts.reduce((sum, cut) => sum + (cut.volume_l || 0), 0)
    const totalLAL = cuts.reduce((sum, cut) => sum + calculateLAL(cut.volume_l || 0, cut.abv_percent || 0), 0)
    const avgABV = totalVolume > 0 ? (totalLAL / totalVolume) * 100 : 0
    
    return {
      volume: parseFloat(totalVolume.toFixed(2)),
      lal: parseFloat(totalLAL.toFixed(2)),
      abv: parseFloat(avgABV.toFixed(1))
    }
  }

  const updateCut = (
    phase: 'foreshots' | 'heads' | 'hearts' | 'tails',
    index: number,
    field: keyof Cut,
    value: any
  ) => {
    const setState = {
      foreshots: setForeshots,
      heads: setHeads,
      hearts: setHearts,
      tails: setTails
    }[phase]
    
    const state = {
      foreshots,
      heads,
      hearts,
      tails
    }[phase]
    
    const updated = [...state]
    updated[index] = { ...updated[index], [field]: value }
    setState(updated)
  }

  const addCutEntry = (phase: 'foreshots' | 'heads' | 'hearts' | 'tails') => {
    const setState = {
      foreshots: setForeshots,
      heads: setHeads,
      hearts: setHearts,
      tails: setTails
    }[phase]
    
    const state = {
      foreshots,
      heads,
      hearts,
      tails
    }[phase]
    
    setState([...state, {
      id: crypto.randomUUID(),
      time: '',
      volume_l: 0,
      abv_percent: 0,
      density: undefined,
      condenser_temp_c: undefined,
      notes: ''
    }])
  }

  const removeCutEntry = (phase: 'foreshots' | 'heads' | 'hearts' | 'tails', index: number) => {
    const setState = {
      foreshots: setForeshots,
      heads: setHeads,
      hearts: setHearts,
      tails: setTails
    }[phase]
    
    const state = {
      foreshots,
      heads,
      hearts,
      tails
    }[phase]
    
    if (state.length > 1) {
      setState(state.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async () => {
    // Save cuts data to localStorage
    const cutsData = {
      batchId,
      recipeId,
      foreshots,
      heads,
      hearts,
      tails
    }
    localStorage.setItem('distillation_cuts', JSON.stringify(cutsData))

    // Navigate to dilution phase (final step before saving to DB)
    router.push(`/dashboard/production/dilution?batchId=${batchId}`)
  }

  // Deprecated: Old save logic (moved to dilution page)
  const handleSubmitOLD = async () => {
    if (!recipeId || !batchId) {
      alert('Missing recipe or batch ID')
      return
    }

    try {
      setLoading(true)
      
      // Load all previous steps from localStorage
      const preparationData = JSON.parse(localStorage.getItem('distillation_preparation') || '{}')
      const steepingData = JSON.parse(localStorage.getItem('distillation_steeping') || '{}')
      const heatingData = JSON.parse(localStorage.getItem('distillation_heating') || '{}')
      
      // Calculate totals
      const foreshotsTotal = getCutTotal(foreshots)
      const headsTotal = getCutTotal(heads)
      const heartsTotal = getCutTotal(hearts)
      const tailsTotal = getCutTotal(tails)
      
      // Prepare data for Supabase
      const productType = preparationData.productType || 'gin'
      const productLabel = productType === 'ethanol' ? 'Ethanol Recovery' : productType.charAt(0).toUpperCase() + productType.slice(1)
      
      const distillationRunData = {
        batchId,
        sku: batchId,
        displayName: `${batchId} (${productLabel})`,
        productId: productType,
        recipeId: productType === 'gin' ? recipeId : undefined,
        date: preparationData.date || new Date().toISOString().split('T')[0],
        stillUsed: preparationData.stillUsed || heatingData.stillUsed || 'Unknown',
        
        // Charge
        chargeComponents: preparationData.components || [],
        chargeTotalVolume: preparationData.totalVolume || 0,
        chargeTotalABV: preparationData.averageABV || 0,
        chargeTotalLAL: preparationData.totalLAL || 0,
        
        // Botanicals
        botanicals: steepingData.botanicals || [],
        steepingStartTime: steepingData.startTime,
        steepingEndTime: steepingData.endTime,
        steepingTemp: steepingData.temperature,
        
        // Heating
        boilerOnTime: heatingData.boilerOnTime,
        powerSetting: heatingData.powerSetting,
        heatingElements: heatingData.elements,
        plates: heatingData.plates,
        deflegmator: heatingData.deflegmator,
        
        // Cuts
        foreshotsVolume: foreshotsTotal.volume,
        foreshotsABV: foreshotsTotal.abv,
        foreshotsLAL: foreshotsTotal.lal,
        
        headsVolume: headsTotal.volume,
        headsABV: headsTotal.abv,
        headsLAL: headsTotal.lal,
        
        heartsVolume: heartsTotal.volume,
        heartsABV: heartsTotal.abv,
        heartsLAL: heartsTotal.lal,
        
        tailsVolume: tailsTotal.volume,
        tailsABV: tailsTotal.abv,
        tailsLAL: tailsTotal.lal,
        
        heartsSegments: hearts.length > 1 ? hearts : undefined,
        tailsSegments: tails.length > 1 ? tails : undefined,
        
        // Final output (same as hearts for now)
        finalOutputVolume: heartsTotal.volume,
        finalOutputABV: heartsTotal.abv,
        finalOutputLAL: heartsTotal.lal,
        
        notes: `${preparationData.notes || ''}\n${steepingData.notes || ''}\n${heatingData.notes || ''}`.trim()
      }
      
      // Save to Supabase
      console.log('💾 Saving batch to Supabase:', distillationRunData)
      const repository = new DistillationRunRepository()
      const savedBatch = await repository.create(distillationRunData)
      
      console.log('✅ Batch saved to Supabase successfully:', savedBatch)
      
      // Clean up localStorage (no longer needed)
      localStorage.removeItem('distillation_preparation')
      localStorage.removeItem('distillation_steeping')
      localStorage.removeItem('distillation_heating')
      localStorage.removeItem('distillation_cuts')
      
      alert(`✅ Batch ${batchId} saved successfully!\n\nYou can now view it in the Batches page.`)
      router.push('/dashboard/batches')
    } catch (error) {
      console.error('Error saving batch:', error)
      alert(`Error saving batch: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`)
    } finally {
      setLoading(false)
    }
  }

  const renderCutTable = (
    phase: 'foreshots' | 'heads' | 'hearts' | 'tails',
    cuts: Cut[],
    title: string,
    color: string
  ) => {
    const total = getCutTotal(cuts)
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-semibold ${color}`}>{title}</h3>
            <p className="text-xs text-graphite/50 mt-1">
              Total: {total.volume} L @ {total.abv}% ABV | {total.lal} LAL
            </p>
          </div>
          <button
            onClick={() => addCutEntry(phase)}
            className="px-3 py-1.5 bg-copper-10 hover:bg-copper-20 text-graphite text-sm rounded-lg border border-copper-30 transition-colors"
          >
            + Add Entry
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-copper-30">
                <th className="text-left py-2 px-2 font-medium text-graphite/70">Time</th>
                <th className="text-right py-2 px-2 font-medium text-graphite/70">Volume (L)</th>
                <th className="text-right py-2 px-2 font-medium text-graphite/70">ABV (%)</th>
                <th className="text-right py-2 px-2 font-medium text-graphite/70">LAL</th>
                <th className="text-right py-2 px-2 font-medium text-graphite/70">Density</th>
                <th className="text-right py-2 px-2 font-medium text-graphite/70">Cond. °C</th>
                {phase === 'hearts' && (
                  <th className="text-right py-2 px-2 font-medium text-graphite/70">Head °C</th>
                )}
                <th className="text-left py-2 px-2 font-medium text-graphite/70">Notes</th>
                <th className="py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {cuts.map((cut, index) => (
                <tr key={cut.id} className="border-b border-copper-15">
                  <td className="py-2 px-2">
                    <input
                      type="time"
                      value={cut.time}
                      onChange={(e) => updateCut(phase, index, 'time', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-copper-30 rounded text-graphite focus:ring-2 focus:ring-copper focus:border-copper"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      step="0.1"
                      value={cut.volume_l || ''}
                      onChange={(e) => updateCut(phase, index, 'volume_l', Number(e.target.value))}
                      className="w-20 px-2 py-1.5 bg-white border border-copper-30 rounded text-right text-graphite focus:ring-2 focus:ring-copper focus:border-copper"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      step="0.1"
                      value={cut.abv_percent || ''}
                      onChange={(e) => updateCut(phase, index, 'abv_percent', Number(e.target.value))}
                      className="w-20 px-2 py-1.5 bg-white border border-copper-30 rounded text-right text-graphite focus:ring-2 focus:ring-copper focus:border-copper"
                    />
                  </td>
                  <td className="py-2 px-2 text-right text-graphite/70 font-mono">
                    {calculateLAL(cut.volume_l || 0, cut.abv_percent || 0).toFixed(2)}
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      step="0.001"
                      value={cut.density || ''}
                      onChange={(e) => updateCut(phase, index, 'density', Number(e.target.value))}
                      placeholder="0.830"
                      className="w-20 px-2 py-1.5 bg-white border border-copper-30 rounded text-right text-graphite focus:ring-2 focus:ring-copper focus:border-copper"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      step="1"
                      value={cut.condenser_temp_c || ''}
                      onChange={(e) => updateCut(phase, index, 'condenser_temp_c', Number(e.target.value))}
                      placeholder="25"
                      className="w-16 px-2 py-1.5 bg-white border border-copper-30 rounded text-right text-graphite focus:ring-2 focus:ring-copper focus:border-copper"
                    />
                  </td>
                  {phase === 'hearts' && (
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        step="1"
                        value={cut.head_temp_c || ''}
                        onChange={(e) => updateCut(phase, index, 'head_temp_c', Number(e.target.value))}
                        placeholder="78"
                        className="w-16 px-2 py-1.5 bg-white border border-copper-30 rounded text-right text-graphite focus:ring-2 focus:ring-copper focus:border-copper"
                      />
                    </td>
                  )}
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={cut.notes || ''}
                      onChange={(e) => updateCut(phase, index, 'notes', e.target.value)}
                      placeholder="Observations..."
                      className="w-40 px-2 py-1.5 bg-white border border-copper-30 rounded text-graphite focus:ring-2 focus:ring-copper focus:border-copper"
                    />
                  </td>
                  <td className="py-2 px-2">
                    {cuts.length > 1 && (
                      <button
                        onClick={() => removeCutEntry(phase, index)}
                        className="text-copper hover:text-copper/80 text-xs px-2 py-1"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-graphite/50">
          <span>Preparation</span>
          <span>→</span>
          <span>Botanical Steeping</span>
          <span>→</span>
          <span>Heating</span>
          <span>→</span>
          <span className="text-copper font-semibold">Distillation Cuts</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-graphite">Distillation Cuts</h1>
          <p className="text-sm text-graphite/70 mt-1">
            Log foreshots, heads, hearts, and tails — {batchId || 'No Batch ID'}
          </p>
        </div>

        {/* Phase Navigation */}
        <div className="flex gap-2 mb-6 border-b border-copper-30 pb-2">
          {(['foreshots', 'heads', 'hearts', 'tails'] as const).map((phase) => (
            <button
              key={phase}
              onClick={() => setActivePhase(phase)}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors capitalize ${
                activePhase === phase
                  ? 'bg-copper text-white'
                  : 'bg-copper-10 text-graphite hover:bg-copper-20'
              }`}
            >
              {phase}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm">
          {activePhase === 'foreshots' && renderCutTable('foreshots', foreshots, 'Foreshots', 'text-copper')}
          {activePhase === 'heads' && renderCutTable('heads', heads, 'Heads', 'text-copper')}
          {activePhase === 'hearts' && renderCutTable('hearts', hearts, 'Hearts (Middle Run)', 'text-copper')}
          {activePhase === 'tails' && renderCutTable('tails', tails, 'Tails', 'text-copper')}
        </div>

        {/* Summary Card */}
        <div className="mt-6 bg-white rounded-xl border border-copper-15 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-graphite mb-4">Run Summary</h3>
          <div className="grid grid-cols-4 gap-4">
            {(['foreshots', 'heads', 'hearts', 'tails'] as const).map((phase) => {
              const cuts = { foreshots, heads, hearts, tails }[phase]
              const total = getCutTotal(cuts)
              const colors = {
                foreshots: 'border-copper-30 bg-beige',
                heads: 'border-copper-30 bg-beige',
                hearts: 'border-copper-30 bg-beige',
                tails: 'border-copper-30 bg-beige'
              }
              
              return (
                <div key={phase} className={`p-4 rounded-lg border ${colors[phase]}`}>
                  <div className="text-xs text-graphite/50 uppercase font-medium mb-1">{phase}</div>
                  <div className="text-2xl font-bold text-graphite">{total.volume} L</div>
                  <div className="text-sm text-graphite/70 mt-1">
                    {total.abv}% ABV | {total.lal} LAL
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => {
              if (activePhase === 'foreshots') {
                router.push(`/dashboard/production/heating?recipeId=${recipeId}&batchId=${batchId}`)
              } else if (activePhase === 'heads') {
                setActivePhase('foreshots')
              } else if (activePhase === 'hearts') {
                setActivePhase('heads')
              } else if (activePhase === 'tails') {
                setActivePhase('hearts')
              }
            }}
            className="px-6 py-3 bg-copper-10 hover:bg-copper-20 text-graphite rounded-lg font-medium transition-colors border border-copper-30"
          >
            {activePhase === 'foreshots' ? '← Back to Heating' : `← Back to ${activePhase === 'heads' ? 'Foreshots' : activePhase === 'hearts' ? 'Heads' : 'Hearts'}`}
          </button>
          <button
            onClick={() => {
              if (activePhase === 'foreshots') {
                setActivePhase('heads')
              } else if (activePhase === 'heads') {
                setActivePhase('hearts')
              } else if (activePhase === 'hearts') {
                setActivePhase('tails')
              } else if (activePhase === 'tails') {
                handleSubmit()
              }
            }}
            disabled={loading || !recipeId || !batchId}
            className="px-6 py-3 bg-copper hover:bg-copper/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {activePhase === 'tails' ? 'Continue to Dilution →' : `Continue to ${activePhase === 'foreshots' ? 'Heads' : activePhase === 'heads' ? 'Hearts' : 'Tails'} →`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DistillationCutsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-beige p-6" />}> 
      <DistillationCutsContent />
    </Suspense>
  )
}
