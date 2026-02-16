"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export interface DilutionStep {
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
}

export interface FinalOutput {
  totalVolume: number
  finalABV: number
  totalLAL: number
  bottlingDate: string
  notes: string
}

export function useDilution() {
  const router = useRouter()
  const searchParams = useSearchParams() as URLSearchParams | null
  const runId = searchParams?.get('runId')
  const batchId = searchParams?.get('batchId') || ''
  const [saving, setSaving] = useState(false)
  const [finalizeError, setFinalizeError] = useState<string | null>(null)

  const [dilutionSteps, setDilutionSteps] = useState<DilutionStep[]>([{
    step: 1, description: 'Initial dilution to target ABV',
    newMakeVolume: 0, waterAdded: 0, ethanolAdded: 0, finalVolume: 0,
    targetABV: 42, actualABV: 0, lal: 0, notes: ''
  }])

  const [finalOutput, setFinalOutput] = useState<FinalOutput>({
    totalVolume: 0, finalABV: 0, totalLAL: 0, bottlingDate: '', notes: ''
  })

  useEffect(() => {
    const cutsData = localStorage.getItem('distillation_cuts')
    if (cutsData) {
      const cuts = JSON.parse(cutsData)
      if (cuts.hearts && cuts.hearts.length > 0) {
        const heartsTotal = cuts.hearts.reduce((acc: any, h: any) => ({
          volume_l: acc.volume_l + (h.volume_l || 0),
          abv_percent: acc.abv_percent + (h.abv_percent || 0),
          lal: acc.lal + (h.lal || 0)
        }), { volume_l: 0, abv_percent: 0, lal: 0 })
        const avgABV = cuts.hearts.length > 0 ? heartsTotal.abv_percent / cuts.hearts.length : 0
        setDilutionSteps([{
          step: 1, description: 'Initial dilution to target ABV',
          newMakeVolume: heartsTotal.volume_l, waterAdded: 0, ethanolAdded: 0,
          finalVolume: heartsTotal.volume_l, targetABV: 42, actualABV: avgABV,
          lal: heartsTotal.lal, notes: ''
        }])
      }
    }
  }, [])

  const addDilutionStep = useCallback(() => {
    setDilutionSteps(prev => {
      const lastStep = prev[prev.length - 1]
      return [...prev, {
        step: prev.length + 1, description: `Dilution step ${prev.length + 1}`,
        newMakeVolume: lastStep.finalVolume, waterAdded: 0, ethanolAdded: 0,
        finalVolume: lastStep.finalVolume, targetABV: lastStep.targetABV,
        actualABV: lastStep.actualABV, lal: lastStep.lal, notes: ''
      }]
    })
  }, [])

  const updateDilutionStep = useCallback((index: number, field: string, value: any) => {
    setDilutionSteps(prev => {
      const updated = [...prev]
      const step = { ...updated[index], [field]: value }
      if (field === 'waterAdded' || field === 'ethanolAdded' || field === 'newMakeVolume') {
        step.finalVolume = step.newMakeVolume + step.waterAdded + step.ethanolAdded
        const totalAlcohol = (step.newMakeVolume * step.actualABV / 100) + (step.ethanolAdded * 96 / 100)
        step.actualABV = step.finalVolume > 0 ? (totalAlcohol / step.finalVolume) * 100 : 0
        step.lal = totalAlcohol
      }
      updated[index] = step
      const lastStep = updated[updated.length - 1]
      setFinalOutput(fo => ({ ...fo, totalVolume: lastStep.finalVolume, finalABV: lastStep.actualABV, totalLAL: lastStep.lal }))
      return updated
    })
  }, [])

  const removeDilutionStep = useCallback((index: number) => {
    setDilutionSteps(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev)
  }, [])

  const calculateWaterNeeded = (step: DilutionStep) => {
    if (step.newMakeVolume && step.actualABV && step.targetABV && step.actualABV > step.targetABV) {
      return ((step.newMakeVolume * (step.actualABV - step.targetABV)) / step.targetABV).toFixed(2)
    }
    return '0'
  }

  const saveLegacy = useCallback(async () => {
    const preparationData = JSON.parse(localStorage.getItem('distillation_preparation') || '{}')
    const steepingData = JSON.parse(localStorage.getItem('distillation_steeping') || '{}')
    const heatingData = JSON.parse(localStorage.getItem('distillation_heating') || '{}')
    const cutsData = JSON.parse(localStorage.getItem('distillation_cuts') || '{}')

    const getCutTotal = (cuts: any[]) => {
      if (!cuts || cuts.length === 0) return { volume_l: 0, abv_percent: 0, lal: 0 }
      const total = cuts.reduce((acc: any, cut: any) => ({
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

    const productType = preparationData.productType || 'gin'
    const productLabel = productType === 'ethanol' ? 'Ethanol Recovery' : productType.charAt(0).toUpperCase() + productType.slice(1)

    const distillationRunData = {
      batchId, sku: batchId, displayName: `${batchId} (${productLabel})`, productId: productType,
      recipeId: productType === 'gin' ? cutsData.recipeId : null,
      date: preparationData.date || new Date().toISOString().split('T')[0],
      stillUsed: preparationData.stillUsed || heatingData.stillUsed || 'Unknown',
      chargeComponents: preparationData.components || [],
      chargeTotalVolume: preparationData.totalVolume || 0,
      chargeTotalABV: preparationData.averageABV || 0,
      chargeTotalLAL: preparationData.totalLAL || 0,
      botanicals: productType === 'gin' ? steepingData.botanicals : null,
      steepingStartTime: steepingData.startTime || null, steepingEndTime: steepingData.endTime || null,
      steepingTemp: steepingData.temperature || null,
      boilerOnTime: heatingData.boilerOnTime || preparationData.startTime || null,
      powerSetting: heatingData.powerSetting || null, heatingElements: heatingData.heatingElements || null,
      plates: heatingData.plates || null, deflegmator: heatingData.deflegmator || null,
      foreshotsVolume: foreshotsTotal.volume_l, foreshotsABV: foreshotsTotal.abv_percent, foreshotsLAL: foreshotsTotal.lal,
      headsVolume: headsTotal.volume_l, headsABV: headsTotal.abv_percent, headsLAL: headsTotal.lal,
      heartsVolume: heartsTotal.volume_l, heartsABV: heartsTotal.abv_percent, heartsLAL: heartsTotal.lal,
      tailsVolume: tailsTotal.volume_l, tailsABV: tailsTotal.abv_percent, tailsLAL: tailsTotal.lal,
      heartsSegments: cutsData.hearts?.length > 1 ? cutsData.hearts : null,
      tailsSegments: cutsData.tails?.length > 1 ? cutsData.tails : null,
      dilutionSteps, finalOutputVolume: finalOutput.totalVolume,
      finalOutputABV: finalOutput.finalABV, finalOutputLAL: finalOutput.totalLAL,
      notes: preparationData.notes || ''
    }

    const { DistillationRunRepository } = await import('@/modules/production/services/distillation-run.repository')
    const repository = new DistillationRunRepository()
    await repository.create(distillationRunData)

    localStorage.removeItem('distillation_preparation')
    localStorage.removeItem('distillation_steeping')
    localStorage.removeItem('distillation_heating')
    localStorage.removeItem('distillation_cuts')
    localStorage.setItem(`batch_${batchId}`, JSON.stringify(distillationRunData))
  }, [batchId, dilutionSteps, finalOutput])

  const handleSaveDraft = useCallback(async () => {
    setSaving(true)
    setFinalizeError(null)
    try {
      if (runId) {
        await fetch('/api/production/runs', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update_step', run_id: runId, step_number: 4, step_data: { dilutionSteps, finalOutput } })
        })
        await fetch('/api/production/runs', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_draft', run_id: runId,
            columns: {
              dilution_steps: dilutionSteps, final_output_volume_l: finalOutput.totalVolume,
              final_output_abv_percent: finalOutput.finalABV, final_output_lal: finalOutput.totalLAL,
              notes: finalOutput.notes || null,
            }
          })
        })
        alert('Draft saved successfully!')
      } else {
        await saveLegacy()
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      alert('Failed to save draft. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [runId, dilutionSteps, finalOutput, saveLegacy])

  const handleFinalize = useCallback(async () => {
    setSaving(true)
    setFinalizeError(null)
    try {
      if (runId) {
        const res = await fetch('/api/production/runs', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'finalize', run_id: runId,
            final_data: {
              dilution_steps: dilutionSteps, final_output_volume_l: finalOutput.totalVolume,
              final_output_abv_percent: finalOutput.finalABV, final_output_lal: finalOutput.totalLAL,
              notes: finalOutput.notes || null,
            }
          })
        })
        const result = await res.json()
        if (!res.ok) {
          setFinalizeError(result.details ? `${result.error}: ${result.details.join(', ')}` : result.error || 'Finalization failed')
          return
        }
        console.log('✅ Finalized batch:', result)
        localStorage.removeItem('distillation_preparation')
        localStorage.removeItem('distillation_steeping')
        localStorage.removeItem('distillation_heating')
        localStorage.removeItem('distillation_cuts')
        router.push('/dashboard/batches')
      } else {
        await saveLegacy()
        router.push('/dashboard/batches')
      }
    } catch (error) {
      console.error('Error finalizing:', error)
      setFinalizeError('Failed to finalize. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [runId, dilutionSteps, finalOutput, saveLegacy, router])

  const handleBack = useCallback(() => {
    const runParam = runId ? `runId=${runId}&` : ''
    router.push(`/dashboard/production/distillation-cuts?${runParam}batchId=${batchId}`)
  }, [runId, batchId, router])

  return {
    batchId, saving, finalizeError, dilutionSteps, finalOutput, setFinalOutput,
    addDilutionStep, updateDilutionStep, removeDilutionStep, calculateWaterNeeded,
    handleSaveDraft, handleFinalize, handleBack,
  }
}
