'use client'

import { useState } from 'react'
import { DistillationSession } from '../types/distillation-session.types'

export interface ChargeComponent {
  source: string
  volume_L: number
  abv: number
  lal: number
}

export interface BotanicalEntry {
  name: string
  notes: string
  weight_g: number
  ratio: number
  status: 'ok' | 'pending' | 'issue'
}

export interface CutEntry {
  volume_L: number | null
  abv: number | null
  notes: string
}

export interface InteractiveDistillationData {
  spiritRunId: string
  sku: string
  date: string
  stillUsed: string
  boilerOn: string
  charge: ChargeComponent[]
  botanicals: BotanicalEntry[]
  cuts: {
    foreshots: CutEntry
    heads: CutEntry
    hearts: CutEntry
    tails: CutEntry
  }
  notes: string
}

export function useInteractiveDistillation(session: DistillationSession) {
  const [data, setData] = useState<InteractiveDistillationData>({
    spiritRunId: session.id,
    sku: session.sku,
    date: session.date,
    stillUsed: session.still,
    boilerOn: session.boilerOn,
    charge: (session.charge?.components as any) || [
      { source: "Manildra NC96", volume_L: 400, abv: 96.0, lal: 384.0 },
      { source: "Left Vodka", volume_L: 500, abv: 19.0, lal: 95.0 },
      { source: "Water", volume_L: 100, abv: 0.0, lal: 0.0 }
    ],
    botanicals: session.botanicals.map(b => ({
      name: b.name,
      notes: b.notes || '',
      weight_g: b.weightG ?? 0,
      ratio: b.ratio_percent || 0,
      status: b.status || 'ok'
    })),
    cuts: {
      foreshots: { volume_L: null, abv: null, notes: '' },
      heads: { volume_L: null, abv: null, notes: '' },
      hearts: { volume_L: null, abv: null, notes: '' },
      tails: { volume_L: null, abv: null, notes: '' }
    },
    notes: session.notes || ''
  })

  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const totalVolume = data.charge.reduce((sum, c) => sum + c.volume_L, 0)
  const totalLAL = data.charge.reduce((sum, c) => sum + c.lal, 0)
  const totalABV = totalVolume > 0 ? (totalLAL / totalVolume) * 100 : 0
  const totalBotanicals = data.botanicals.reduce((sum, b) => sum + b.weight_g, 0)

  const updateCharge = (index: number, field: keyof ChargeComponent, value: string | number) => {
    const newCharge = [...data.charge]
    newCharge[index] = { ...newCharge[index], [field]: value }
    if (field === 'volume_L' || field === 'abv') {
      const volume = field === 'volume_L' ? Number(value) : newCharge[index].volume_L
      const abv = field === 'abv' ? Number(value) : newCharge[index].abv
      newCharge[index].lal = volume * (abv / 100)
    }
    setData({ ...data, charge: newCharge })
    setHasChanges(true)
  }

  const updateBotanical = (index: number, field: keyof BotanicalEntry, value: string | number) => {
    const newBotanicals = [...data.botanicals]
    newBotanicals[index] = { ...newBotanicals[index], [field]: value }
    if (field === 'weight_g') {
      const totalWeight = newBotanicals.reduce((sum, b) => sum + b.weight_g, 0)
      newBotanicals[index].ratio = totalWeight > 0 ? (Number(value) / totalWeight) * 100 : 0
    }
    setData({ ...data, botanicals: newBotanicals })
    setHasChanges(true)
  }

  const updateCut = (cutType: keyof typeof data.cuts, field: keyof CutEntry, value: string | number | null) => {
    const newCuts = { ...data.cuts }
    newCuts[cutType] = { ...newCuts[cutType], [field]: value }
    setData({ ...data, cuts: newCuts })
    setHasChanges(true)
  }

  const updateNotes = (value: string) => {
    setData({ ...data, notes: value })
    setHasChanges(true)
  }

  const addChargeComponent = () => {
    setData({ ...data, charge: [...data.charge, { source: '', volume_L: 0, abv: 0, lal: 0 }] })
    setHasChanges(true)
  }

  const addBotanical = () => {
    setData({ ...data, botanicals: [...data.botanicals, { name: '', notes: '', weight_g: 0, ratio: 0, status: 'ok' as const }] })
    setHasChanges(true)
  }

  const removeChargeComponent = (index: number) => {
    setData({ ...data, charge: data.charge.filter((_, i) => i !== index) })
    setHasChanges(true)
  }

  const removeBotanical = (index: number) => {
    setData({ ...data, botanicals: data.botanicals.filter((_, i) => i !== index) })
    setHasChanges(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) { case 'ok': return '✅'; case 'pending': return '⚠️'; case 'issue': return '❌'; default: return '✅' }
  }

  const getStatusColor = (status: string) => {
    switch (status) { case 'ok': return 'text-graphite'; case 'pending': return 'text-copper/70'; case 'issue': return 'text-copper'; default: return 'text-graphite' }
  }

  return {
    data, isEditing, setIsEditing, hasChanges,
    totalVolume, totalLAL, totalABV, totalBotanicals,
    updateCharge, updateBotanical, updateCut, updateNotes,
    addChargeComponent, addBotanical, removeChargeComponent, removeBotanical,
    getStatusIcon, getStatusColor,
  }
}
