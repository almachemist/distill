"use client"

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function useRumFermentation() {
  const router = useRouter()

  // Form state
  const [batchId, setBatchId] = useState('')
  const [productName, setProductName] = useState('Pineapple Rum')
  const [productType, setProductType] = useState<'rum' | 'cane_spirit'>('rum')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

  // Substrate
  const [substrateType, setSubstrateType] = useState('C Molasses')
  const [substrateBatch, setSubstrateBatch] = useState('')
  const [substrateMassKg, setSubstrateMassKg] = useState(400)
  const [waterMassKg, setWaterMassKg] = useState(1500)
  const [initialBrix, setInitialBrix] = useState(26.6)
  const [initialPH, setInitialPH] = useState(5.14)

  // Dunder
  const [dunderAdded, setDunderAdded] = useState(false)
  const [dunderType, setDunderType] = useState('clean')
  const [dunderVolumeL, setDunderVolumeL] = useState(100)
  const [dunderPH, setDunderPH] = useState<number | null>(null)

  // Additives
  const [antiFoamML, setAntiFoamML] = useState(100)
  const [citricAcidG, setCitricAcidG] = useState<number | null>(null)
  const [fermaidG, setFermaidG] = useState<number | null>(1000)
  const [dapG, setDapG] = useState<number | null>(null)
  const [calciumCarbonateG, setCalciumCarbonateG] = useState<number | null>(null)
  const [additionalNutrients, setAdditionalNutrients] = useState('')

  // Yeast
  const [yeastType, setYeastType] = useState('Distillamax RM')
  const [yeastMassG, setYeastMassG] = useState(1000)
  const [yeastRehydrationTempC, setYeastRehydrationTempC] = useState(37.5)
  const [yeastRehydrationTimeMin, setYeastRehydrationTimeMin] = useState(15)

  // Fermentation curves (24h intervals)
  const [tempCurve, setTempCurve] = useState({ '0h': 24.2, '24h': 29.3, '48h': 29.8, '72h': 27.6, '96h': 27.6 })
  const [brixCurve, setBrixCurve] = useState({ '0h': 26.6, '24h': 14.9, '48h': 10.8, '72h': 9.6, '96h': 9.3 })
  const [phCurve, setPhCurve] = useState({ '0h': 5.14, '24h': 4.92, '48h': 4.89, '72h': 4.86, '96h': 4.88 })

  const [durationHours, setDurationHours] = useState(96)
  const [finalBrix, setFinalBrix] = useState(9.3)
  const [finalPH, setFinalPH] = useState(4.88)
  const [finalABV, setFinalABV] = useState(9.6)
  const [notes, setNotes] = useState('')

  const updateCurve = useCallback((curve: any, setCurve: any, key: string, value: number) => {
    setCurve({ ...curve, [key]: value })
  }, [])

  const handleSubmit = useCallback(() => {
    if (!batchId) { alert('Please enter a Batch ID'); return }

    const fermentationData = {
      batchId, productName, productType, startDate,
      substrateType, substrateBatch, substrateMassKg, waterMassKg, initialBrix, initialPH,
      dunderAdded, dunderType: dunderAdded ? dunderType : null,
      dunderVolumeL: dunderAdded ? dunderVolumeL : null, dunderPH: dunderAdded ? dunderPH : null,
      antiFoamML, citricAcidG, fermaidG, dapG, calciumCarbonateG, additionalNutrients,
      yeastType, yeastMassG, yeastRehydrationTempC, yeastRehydrationTimeMin,
      temperatureCurve: tempCurve, brixCurve, phCurve,
      durationHours, finalBrix, finalPH, finalABV, notes
    }

    localStorage.setItem('rum_fermentation', JSON.stringify(fermentationData))
    router.push(`/dashboard/production/rum/distillation?batchId=${batchId}`)
  }, [batchId, productName, productType, startDate, substrateType, substrateBatch, substrateMassKg,
    waterMassKg, initialBrix, initialPH, dunderAdded, dunderType, dunderVolumeL, dunderPH,
    antiFoamML, citricAcidG, fermaidG, dapG, calciumCarbonateG, additionalNutrients,
    yeastType, yeastMassG, yeastRehydrationTempC, yeastRehydrationTimeMin,
    tempCurve, brixCurve, phCurve, durationHours, finalBrix, finalPH, finalABV, notes, router])

  return {
    batchId, setBatchId, productName, setProductName, productType, setProductType,
    startDate, setStartDate,
    substrateType, setSubstrateType, substrateBatch, setSubstrateBatch,
    substrateMassKg, setSubstrateMassKg, waterMassKg, setWaterMassKg,
    initialBrix, setInitialBrix, initialPH, setInitialPH,
    dunderAdded, setDunderAdded, dunderType, setDunderType,
    dunderVolumeL, setDunderVolumeL, dunderPH, setDunderPH,
    antiFoamML, setAntiFoamML, citricAcidG, setCitricAcidG,
    fermaidG, setFermaidG, dapG, setDapG,
    calciumCarbonateG, setCalciumCarbonateG, additionalNutrients, setAdditionalNutrients,
    yeastType, setYeastType, yeastMassG, setYeastMassG,
    yeastRehydrationTempC, setYeastRehydrationTempC, yeastRehydrationTimeMin, setYeastRehydrationTimeMin,
    tempCurve, setTempCurve, brixCurve, setBrixCurve, phCurve, setPhCurve,
    durationHours, setDurationHours, finalBrix, setFinalBrix,
    finalPH, setFinalPH, finalABV, setFinalABV, notes, setNotes,
    updateCurve, handleSubmit,
  }
}
