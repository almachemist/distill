"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function DilutionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const batchId = searchParams?.get('batchId') || ''

  const [dilutionSteps, setDilutionSteps] = useState<Array<{
    step: number
    description: string
    newMakeVolume: number
    waterAdded: number
    ethanolAdded: number
    finalVolume: number
    targetABV: number
    actualABV: number
    lal: number
    notes: string
  }>>([
    {
      step: 1,
      description: 'Initial dilution to target ABV',
      newMakeVolume: 0,
      waterAdded: 0,
      ethanolAdded: 0,
      finalVolume: 0,
      targetABV: 42,
      actualABV: 0,
      lal: 0,
      notes: ''
    }
  ])

  const [finalOutput, setFinalOutput] = useState({
    totalVolume: 0,
    finalABV: 0,
    totalLAL: 0,
    bottlingDate: '',
    notes: ''
  })

  useEffect(() => {
    // Load hearts data from localStorage
    const cutsData = localStorage.getItem('distillation_cuts')
    if (cutsData) {
      const cuts = JSON.parse(cutsData)
      if (cuts.hearts && cuts.hearts.length > 0) {
        const heartsTotal = cuts.hearts.reduce((acc: any, h: any) => ({
          volume_l: acc.volume_l + (h.volume_l || 0),
          abv_percent: acc.abv_percent + (h.abv_percent || 0),
          lal: acc.lal + (h.lal || 0)
        }), { volume_l: 0, abv_percent: 0, lal: 0 })

        const avgABV = cuts.hearts.length > 0 
          ? heartsTotal.abv_percent / cuts.hearts.length 
          : 0

        // Update first dilution step with hearts data
        setDilutionSteps([{
          step: 1,
          description: 'Initial dilution to target ABV',
          newMakeVolume: heartsTotal.volume_l,
          waterAdded: 0,
          ethanolAdded: 0,
          finalVolume: heartsTotal.volume_l,
          targetABV: 42,
          actualABV: avgABV,
          lal: heartsTotal.lal,
          notes: ''
        }])
      }
    }
  }, [])

  const addDilutionStep = () => {
    const lastStep = dilutionSteps[dilutionSteps.length - 1]
    setDilutionSteps([
      ...dilutionSteps,
      {
        step: dilutionSteps.length + 1,
        description: `Dilution step ${dilutionSteps.length + 1}`,
        newMakeVolume: lastStep.finalVolume,
        waterAdded: 0,
        ethanolAdded: 0,
        finalVolume: lastStep.finalVolume,
        targetABV: lastStep.targetABV,
        actualABV: lastStep.actualABV,
        lal: lastStep.lal,
        notes: ''
      }
    ])
  }

  const updateDilutionStep = (index: number, field: string, value: any) => {
    const updated = [...dilutionSteps]
    const step = { ...updated[index], [field]: value }

    // Calculate final volume and ABV
    if (field === 'waterAdded' || field === 'ethanolAdded' || field === 'newMakeVolume') {
      step.finalVolume = step.newMakeVolume + step.waterAdded + step.ethanolAdded
      
      // Calculate new ABV after dilution
      const totalAlcohol = (step.newMakeVolume * step.actualABV / 100) + (step.ethanolAdded * 96 / 100)
      step.actualABV = step.finalVolume > 0 ? (totalAlcohol / step.finalVolume) * 100 : 0
      step.lal = totalAlcohol
    }

    updated[index] = step
    setDilutionSteps(updated)

    // Update final output
    const lastStep = updated[updated.length - 1]
    setFinalOutput({
      ...finalOutput,
      totalVolume: lastStep.finalVolume,
      finalABV: lastStep.actualABV,
      totalLAL: lastStep.lal
    })
  }

  const removeDilutionStep = (index: number) => {
    if (dilutionSteps.length > 1) {
      setDilutionSteps(dilutionSteps.filter((_, i) => i !== index))
    }
  }

  const calculateWaterNeeded = (step: any) => {
    if (step.newMakeVolume && step.actualABV && step.targetABV && step.actualABV > step.targetABV) {
      const waterNeeded = (step.newMakeVolume * (step.actualABV - step.targetABV)) / step.targetABV
      return waterNeeded.toFixed(2)
    }
    return '0'
  }

  const handleSubmit = async () => {
    try {
      // Load all previous steps from localStorage
      const preparationData = JSON.parse(localStorage.getItem('distillation_preparation') || '{}')
      const steepingData = JSON.parse(localStorage.getItem('distillation_steeping') || '{}')
      const heatingData = JSON.parse(localStorage.getItem('distillation_heating') || '{}')
      const cutsData = JSON.parse(localStorage.getItem('distillation_cuts') || '{}')
      
      // Calculate cuts totals
      const getCutTotal = (cuts: any[]) => {
        if (!cuts || cuts.length === 0) return { volume_l: 0, abv_percent: 0, lal: 0 }
        const total = cuts.reduce((acc, cut) => ({
          volume_l: acc.volume_l + (cut.volume_l || 0),
          abv_percent: acc.abv_percent + (cut.abv_percent || 0),
          lal: acc.lal + (cut.lal || 0)
        }), { volume_l: 0, abv_percent: 0, lal: 0 })
        total.abv_percent = cuts.length > 0 ? total.abv_percent / cuts.length : 0
        return total
      }

      const foreshotsTotal = getCutTotal(cutsData.foreshots)
      const headsTotal = getCutTotal(cutsData.heads)
      const heartsTotal = getCutTotal(cutsData.hearts)
      const tailsTotal = getCutTotal(cutsData.tails)
      
      // Prepare data for Supabase
      const productType = preparationData.productType || 'gin'
      const productLabel = productType === 'ethanol' ? 'Ethanol Recovery' : productType.charAt(0).toUpperCase() + productType.slice(1)
      
      const distillationRunData = {
        batchId,
        sku: batchId,
        displayName: `${batchId} (${productLabel})`,
        productId: productType,
        recipeId: productType === 'gin' ? cutsData.recipeId : null,
        date: preparationData.date || new Date().toISOString().split('T')[0],
        stillUsed: preparationData.stillUsed || heatingData.stillUsed || 'Unknown',
        
        // Charge
        chargeComponents: preparationData.components || [],
        chargeTotalVolume: preparationData.totalVolume || 0,
        chargeTotalABV: preparationData.averageABV || 0,
        chargeTotalLAL: preparationData.totalLAL || 0,
        
        // Botanicals (only for gin)
        botanicals: productType === 'gin' ? steepingData.botanicals : null,
        steepingStartTime: steepingData.startTime || null,
        steepingEndTime: steepingData.endTime || null,
        steepingTemp: steepingData.temperature || null,
        
        // Heating
        boilerOnTime: heatingData.boilerOnTime || preparationData.startTime || null,
        powerSetting: heatingData.powerSetting || null,
        heatingElements: heatingData.heatingElements || null,
        plates: heatingData.plates || null,
        deflegmator: heatingData.deflegmator || null,
        
        // Cuts
        foreshotsVolume: foreshotsTotal.volume_l,
        foreshotsABV: foreshotsTotal.abv_percent,
        foreshotsLAL: foreshotsTotal.lal,
        
        headsVolume: headsTotal.volume_l,
        headsABV: headsTotal.abv_percent,
        headsLAL: headsTotal.lal,
        
        heartsVolume: heartsTotal.volume_l,
        heartsABV: heartsTotal.abv_percent,
        heartsLAL: heartsTotal.lal,
        
        tailsVolume: tailsTotal.volume_l,
        tailsABV: tailsTotal.abv_percent,
        tailsLAL: tailsTotal.lal,
        
        // Multi-part cuts
        heartsSegments: cutsData.hearts?.length > 1 ? cutsData.hearts : null,
        tailsSegments: cutsData.tails?.length > 1 ? cutsData.tails : null,
        
        // Dilution
        dilutionSteps,
        
        // Final Output
        finalOutputVolume: finalOutput.totalVolume,
        finalOutputABV: finalOutput.finalABV,
        finalOutputLAL: finalOutput.totalLAL,
        
        notes: preparationData.notes || ''
      }
      
      // Save to Supabase
      const { DistillationRunRepository } = await import('@/modules/production/services/distillation-run.repository')
      const repository = new DistillationRunRepository()
      await repository.create(distillationRunData)
      
      console.log('✅ Saved distillation run to Supabase:', batchId)
      
      // Clear localStorage after successful save
      localStorage.removeItem('distillation_preparation')
      localStorage.removeItem('distillation_steeping')
      localStorage.removeItem('distillation_heating')
      localStorage.removeItem('distillation_cuts')
      
      // Keep a backup in localStorage with batch prefix
      localStorage.setItem(`batch_${batchId}`, JSON.stringify(distillationRunData))
      
      // Navigate back to batches (production complete)
      router.push('/dashboard/batches')
      
    } catch (error) {
      console.error('❌ Error saving distillation run:', error)
      alert('Failed to save distillation run. Please try again.')
    }
  }

  const handleBack = () => {
    router.push(`/dashboard/production/distillation-cuts?batchId=${batchId}`)
  }

  return (
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <div className="text-sm text-graphite/60">
          <span>Production</span>
          <span className="mx-2">→</span>
          <span>Start Batch</span>
          <span className="mx-2">→</span>
          <span>Botanical Steeping</span>
          <span className="mx-2">→</span>
          <span>Heating</span>
          <span className="mx-2">→</span>
          <span>Distillation Cuts</span>
          <span className="mx-2">→</span>
          <span className="font-medium text-copper">Dilution</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-graphite mb-2">Dilution & Final Output</h1>
          <p className="text-graphite/70">
            Batch: <span className="font-mono font-medium text-copper">{batchId}</span>
          </p>
          <p className="text-sm text-graphite/60 mt-2">
            Dilute hearts to target ABV and record final bottling-ready output.
          </p>
        </div>

        {/* Dilution Steps */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-graphite">Dilution Steps</h2>
            <button
              onClick={addDilutionStep}
              className="px-4 py-2 bg-copper-10 text-copper rounded-lg hover:bg-copper-20 border border-copper-30 font-medium transition-all"
            >
              + Add Step
            </button>
          </div>

          {dilutionSteps.map((step, index) => (
            <div key={index} className="border border-copper-15 rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-graphite">Step {step.step}</h3>
                  <input
                    type="text"
                    value={step.description}
                    onChange={(e) => updateDilutionStep(index, 'description', e.target.value)}
                    className="mt-1 text-sm text-graphite/70 bg-transparent border-none p-0 focus:outline-none focus:ring-0"
                    placeholder="Description..."
                  />
                </div>
                {dilutionSteps.length > 1 && (
                  <button
                    onClick={() => removeDilutionStep(index)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor={`step_${index}_new_make_volume`} className="block text-xs font-medium text-graphite/70 mb-1">
                    New Make Volume (L)
                  </label>
                  <input
                    id={`step_${index}_new_make_volume`}
                    type="number"
                    step="0.1"
                    value={step.newMakeVolume}
                    onChange={(e) => updateDilutionStep(index, 'newMakeVolume', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                    disabled={index > 0}
                  />
                </div>

                <div>
                  <label htmlFor={`step_${index}_current_abv`} className="block text-xs font-medium text-graphite/70 mb-1">
                    Current ABV (%)
                  </label>
                  <input
                    id={`step_${index}_current_abv`}
                    type="number"
                    step="0.1"
                    value={step.actualABV.toFixed(2)}
                    readOnly
                    className="w-full px-3 py-2 bg-beige border border-copper-15 rounded-lg text-graphite"
                  />
                </div>

                <div>
                  <label htmlFor={`step_${index}_target_abv`} className="block text-xs font-medium text-graphite/70 mb-1">
                    Target ABV (%)
                  </label>
                  <input
                    id={`step_${index}_target_abv`}
                    type="number"
                    step="0.1"
                    value={step.targetABV}
                    onChange={(e) => updateDilutionStep(index, 'targetABV', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                  />
                </div>

                <div className="bg-copper-10 p-3 rounded-lg">
                  <p className="block text-xs font-medium text-copper mb-1">
                    Water Needed (L)
                  </p>
                  <div className="text-lg font-bold text-copper">
                    {calculateWaterNeeded(step)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor={`step_${index}_water_added`} className="block text-xs font-medium text-graphite/70 mb-1">
                    Water Added (L)
                  </label>
                  <input
                    id={`step_${index}_water_added`}
                    type="number"
                    step="0.1"
                    value={step.waterAdded}
                    onChange={(e) => updateDilutionStep(index, 'waterAdded', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                  />
                </div>

                <div>
                  <label htmlFor={`step_${index}_ethanol_added`} className="block text-xs font-medium text-graphite/70 mb-1">
                    Ethanol Added (L) <span className="text-xs">(if needed)</span>
                  </label>
                  <input
                    id={`step_${index}_ethanol_added`}
                    type="number"
                    step="0.1"
                    value={step.ethanolAdded}
                    onChange={(e) => updateDilutionStep(index, 'ethanolAdded', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                  />
                </div>

                <div>
                  <label htmlFor={`step_${index}_final_volume`} className="block text-xs font-medium text-graphite/70 mb-1">
                    Final Volume (L)
                  </label>
                  <input
                    id={`step_${index}_final_volume`}
                    type="number"
                    value={step.finalVolume.toFixed(2)}
                    readOnly
                    className="w-full px-3 py-2 bg-beige border border-copper-15 rounded-lg text-graphite"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`step_${index}_notes`} className="block text-xs font-medium text-graphite/70 mb-1">
                  Notes
                </label>
                <textarea
                  id={`step_${index}_notes`}
                  value={step.notes}
                  onChange={(e) => updateDilutionStep(index, 'notes', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                  rows={2}
                  placeholder="Observations, adjustments..."
                />
              </div>

              <div className="bg-beige rounded-lg p-3 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-xs text-graphite/60">Final ABV</div>
                  <div className="font-semibold text-graphite">{step.actualABV.toFixed(2)}%</div>
                </div>
                <div>
                  <div className="text-xs text-graphite/60">LAL</div>
                  <div className="font-semibold text-graphite">{step.lal.toFixed(2)} L</div>
                </div>
                <div>
                  <div className="text-xs text-graphite/60">Total Volume</div>
                  <div className="font-semibold text-graphite">{step.finalVolume.toFixed(2)} L</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Final Output Summary */}
        <div className="bg-gradient-to-br from-copper-10 to-copper-20 rounded-xl border border-copper-30 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-graphite">Final Output (Bottling Ready)</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-graphite/60">Total Volume</div>
              <div className="text-2xl font-bold text-copper">{finalOutput.totalVolume.toFixed(2)} L</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-graphite/60">Final ABV</div>
              <div className="text-2xl font-bold text-copper">{finalOutput.finalABV.toFixed(2)}%</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-graphite/60">Total LAL</div>
              <div className="text-2xl font-bold text-copper">{finalOutput.totalLAL.toFixed(2)} L</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="bottling_date" className="block text-sm font-medium text-graphite mb-2">
                Bottling Date
              </label>
              <input
                id="bottling_date"
                type="date"
                value={finalOutput.bottlingDate}
                onChange={(e) => setFinalOutput({ ...finalOutput, bottlingDate: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>
          </div>

          <div>
            <label htmlFor="final_notes" className="block text-sm font-medium text-graphite mb-2">
              Final Notes
            </label>
            <textarea
              id="final_notes"
              value={finalOutput.notes}
              onChange={(e) => setFinalOutput({ ...finalOutput, notes: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              rows={3}
              placeholder="Color, clarity, aroma, taste notes..."
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-white border border-copper-30 text-graphite rounded-lg hover:bg-beige font-medium transition-all"
          >
            ← Back to Cuts
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-copper text-white rounded-lg hover:bg-copper/90 font-medium shadow-md transition-all"
          >
            Save & Finish Batch →
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DilutionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-beige p-6" />}> 
      <DilutionContent />
    </Suspense>
  )
}
