'use client'

import { useState, useEffect } from 'react'

export interface CutData {
  id: string
  name: string
  icon: string
  startTime?: string
  endTime?: string
  volume: number
  abv: number
  tank: string
  notes: string
  status: 'pending' | 'active' | 'completed'
}

export interface PowerData {
  elementsOnTime?: string
  elementsOffTime?: string
  powerKW: number
  totalHours: number
  notes: string
}

const INITIAL_CUTS: CutData[] = [
  { id: 'foreshots', name: 'Foreshots', icon: '⚡', volume: 0, abv: 0, tank: '', notes: '', status: 'pending' },
  { id: 'heads', name: 'Heads', icon: '💧', volume: 0, abv: 0, tank: '', notes: '', status: 'pending' },
  { id: 'hearts', name: 'Hearts', icon: '💎', volume: 0, abv: 0, tank: '', notes: '', status: 'pending' },
  { id: 'tails', name: 'Tails', icon: '🌊', volume: 0, abv: 0, tank: '', notes: '', status: 'pending' },
]

export const TANK_OPTIONS = [
  'FEINTS-GIN-001', 'FEINTS-GIN-002', 'GIN-NS-0016', 'GIN-NS-0017',
  'GIN-NS-0018', 'DISCARDED', 'NEW-TANK-001', 'NEW-TANK-002'
]

export function useDistillationCuts(isOpen: boolean) {
  const [cuts, setCuts] = useState<CutData[]>(INITIAL_CUTS)
  const [currentTime, setCurrentTime] = useState('')
  const [isTracking, setIsTracking] = useState(false)
  const [powerData, setPowerData] = useState<PowerData>({ powerKW: 32, totalHours: 0, notes: '' })

  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000)
      return () => clearInterval(timer)
    }
  }, [isOpen])

  const startCut = (cutId: string) => {
    setCuts(prev => prev.map(cut => {
      if (cut.id === cutId) return { ...cut, status: 'active' as const, startTime: new Date().toISOString() }
      else if (cut.status === 'active') return { ...cut, status: 'completed' as const, endTime: new Date().toISOString() }
      return cut
    }))
  }

  const completeCut = (cutId: string) => {
    setCuts(prev => prev.map(cut =>
      cut.id === cutId ? { ...cut, status: 'completed' as const, endTime: new Date().toISOString() } : cut
    ))
  }

  const updateCutField = (cutId: string, field: keyof CutData, value: any) => {
    setCuts(prev => prev.map(cut => cut.id === cutId ? { ...cut, [field]: value } : cut))
  }

  const updatePowerField = (field: keyof PowerData, value: any) => {
    setPowerData(prev => ({ ...prev, [field]: value }))
  }

  const turnElementsOn = () => {
    setPowerData(prev => ({ ...prev, elementsOnTime: new Date().toISOString() }))
  }

  const turnElementsOff = () => {
    if (powerData.elementsOnTime) {
      const diffHours = (new Date().getTime() - new Date(powerData.elementsOnTime).getTime()) / (1000 * 60 * 60)
      setPowerData(prev => ({ ...prev, elementsOffTime: new Date().toISOString(), totalHours: prev.totalHours + diffHours }))
    }
  }

  const calculateTotalVolume = () => cuts.reduce((sum, cut) => sum + cut.volume, 0)
  const calculateTotalLAL = () => cuts.reduce((sum, cut) => sum + (cut.volume * cut.abv / 100), 0)

  const getCutStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getCutStatusIcon = (status: string) => {
    switch (status) { case 'completed': return '✓'; case 'active': return '●'; default: return '○' }
  }

  const formatDuration = (startTime?: string, endTime?: string) => {
    if (!startTime) return ''
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffSecs = Math.floor((diffMs % 60000) / 1000)
    return `${diffMins}:${diffSecs.toString().padStart(2, '0')}`
  }

  return {
    cuts, currentTime, isTracking, setIsTracking, powerData,
    startCut, completeCut, updateCutField, updatePowerField,
    turnElementsOn, turnElementsOff,
    calculateTotalVolume, calculateTotalLAL,
    getCutStatusColor, getCutStatusIcon, formatDuration,
  }
}
