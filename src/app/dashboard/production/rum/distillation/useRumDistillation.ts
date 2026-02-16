"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export interface TailsSegment {
  time: string; volume: number; abv: number; lal: number; notes: string
}

export function useRumDistillation() {
  const router = useRouter()
  const searchParams = useSearchParams() as URLSearchParams | null
  const batchId = searchParams?.get('batchId') || ''

  const [fermentationData, setFermentationData] = useState<any>(null)

  useEffect(() => {
    const data = localStorage.getItem('rum_fermentation')
    if (data) setFermentationData(JSON.parse(data))
  }, [])

  // Form state
  const [distillationDate, setDistillationDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('06:00')

  // Boiler
  const [boilerVolume, setBoilerVolume] = useState(1000)
  const [boilerABV, setBoilerABV] = useState(fermentationData?.finalABV || 9.6)
  const [boilerLAL, setBoilerLAL] = useState(0)

  // Retort 1
  const [retort1Content, setRetort1Content] = useState('Late tails from previous run')
  const [retort1Volume, setRetort1Volume] = useState(140)
  const [retort1ABV, setRetort1ABV] = useState(49.0)
  const [retort1LAL, setRetort1LAL] = useState(0)

  // Retort 2
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

  const [tailsSegments, setTailsSegments] = useState<TailsSegment[]>([
    { time: '15:10', volume: 105, abv: 79.6, lal: 0, notes: '' }
  ])

  const [notes, setNotes] = useState('')

  // Auto-calculate LAL
  useEffect(() => { setBoilerLAL((boilerVolume * boilerABV) / 100) }, [boilerVolume, boilerABV])
  useEffect(() => { setRetort1LAL((retort1Volume * retort1ABV) / 100) }, [retort1Volume, retort1ABV])
  useEffect(() => { setRetort2LAL((retort2Volume * retort2ABV) / 100) }, [retort2Volume, retort2ABV])
  useEffect(() => { setHeadsLAL((headsVolume * headsABV) / 100) }, [headsVolume, headsABV])
  useEffect(() => { setHeartsLAL((heartsVolume * heartsABV) / 100) }, [heartsVolume, heartsABV])

  const addTailsSegment = useCallback(() => {
    setTailsSegments(prev => [...prev, { time: '', volume: 0, abv: 0, lal: 0, notes: '' }])
  }, [])

  const updateTailsSegment = useCallback((index: number, field: string, value: any) => {
    setTailsSegments(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      if (field === 'volume' || field === 'abv') {
        updated[index].lal = (updated[index].volume * updated[index].abv) / 100
      }
      return updated
    })
  }, [])

  const removeTailsSegment = useCallback((index: number) => {
    setTailsSegments(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev)
  }, [])

  // Yield metrics
  const totalLALStart = boilerLAL + retort1LAL + retort2LAL
  const totalLALEnd = headsLAL + heartsLAL + tailsSegments.reduce((sum, t) => sum + t.lal, 0)
  const lalLoss = totalLALStart - totalLALEnd
  const heartYieldPercent = totalLALStart > 0 ? (heartsLAL / totalLALStart) * 100 : 0

  const handleSubmit = useCallback(() => {
    if (!batchId) { alert('Missing batch ID'); return }
    const distillationData = {
      batchId, date: distillationDate, startTime,
      boilerVolume, boilerABV, boilerLAL, retort1Content, retort1Volume, retort1ABV, retort1LAL,
      retort2Content, retort2Volume, retort2ABV, retort2LAL,
      boilerElements, retort1Elements, retort2Elements,
      foreshotsTime, foreshotsABV, foreshotsNotes,
      headsTime, headsVolume, headsABV, headsLAL, headsNotes,
      heartsTime, heartsVolume, heartsABV, heartsLAL, heartsNotes,
      tailsSegments, totalLALStart, totalLALEnd, lalLoss, heartYieldPercent, notes
    }
    localStorage.setItem('rum_distillation', JSON.stringify(distillationData))
    router.push(`/dashboard/production/rum/cask-filling?batchId=${batchId}`)
  }, [batchId, distillationDate, startTime, boilerVolume, boilerABV, boilerLAL,
    retort1Content, retort1Volume, retort1ABV, retort1LAL, retort2Content, retort2Volume, retort2ABV, retort2LAL,
    boilerElements, retort1Elements, retort2Elements,
    foreshotsTime, foreshotsABV, foreshotsNotes,
    headsTime, headsVolume, headsABV, headsLAL, headsNotes,
    heartsTime, heartsVolume, heartsABV, heartsLAL, heartsNotes,
    tailsSegments, totalLALStart, totalLALEnd, lalLoss, heartYieldPercent, notes, router])

  const handleBack = useCallback(() => {
    router.push('/dashboard/production/rum/fermentation')
  }, [router])

  return {
    batchId, distillationDate, setDistillationDate, startTime, setStartTime,
    boilerVolume, setBoilerVolume, boilerABV, setBoilerABV, boilerLAL,
    retort1Content, setRetort1Content, retort1Volume, setRetort1Volume, retort1ABV, setRetort1ABV, retort1LAL,
    retort2Content, setRetort2Content, retort2Volume, setRetort2Volume, retort2ABV, setRetort2ABV, retort2LAL,
    boilerElements, setBoilerElements, retort1Elements, setRetort1Elements, retort2Elements, setRetort2Elements,
    foreshotsTime, setForeshotsTime, foreshotsABV, setForeshotsABV, foreshotsNotes, setForeshotsNotes,
    headsTime, setHeadsTime, headsVolume, setHeadsVolume, headsABV, setHeadsABV, headsLAL, headsNotes, setHeadsNotes,
    heartsTime, setHeartsTime, heartsVolume, setHeartsVolume, heartsABV, setHeartsABV, heartsLAL, heartsNotes, setHeartsNotes,
    tailsSegments, addTailsSegment, updateTailsSegment, removeTailsSegment,
    notes, setNotes,
    totalLALStart, totalLALEnd, lalLoss, heartYieldPercent,
    handleSubmit, handleBack,
  }
}
