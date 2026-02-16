'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Batch,
  SelectedBatch,
  DilutionPhase,
  BottleEntry,
  ProductType,
  getBottlingMode,
  calculateBottlingSummary,
  normalizeBatch,
  getAvailableBatches
} from '@/types/bottling'
import { PRODUCT_LIST, inferProductType } from '../constants/bottling-products'

export function useBottlingData() {
  const searchParams = useSearchParams() as URLSearchParams | null

  const [loading, setLoading] = useState(true)
  const [allBatches, setAllBatches] = useState<Batch[]>([])
  const [selectedBatches, setSelectedBatches] = useState<SelectedBatch[]>([])
  const [dilutionPhases, setDilutionPhases] = useState<DilutionPhase[]>([])
  const [bottleEntries, setBottleEntries] = useState<BottleEntry[]>([])
  const [productName, setProductName] = useState('')
  const [manualMode, setManualMode] = useState(false)
  const [isTestRun, setIsTestRun] = useState(false)

  // Manual entry state
  const [manualProductType, setManualProductType] = useState<ProductType>('gin')
  const [manualVolume, setManualVolume] = useState<number>(0)
  const [manualABV, setManualABV] = useState<number>(0)
  const [manualTankCode, setManualTankCode] = useState<string>('')
  const [deeplinkApplied, setDeeplinkApplied] = useState(false)

  // Filters
  const [filterProductType, setFilterProductType] = useState<ProductType | 'all'>('all')
  const [filterSearch, setFilterSearch] = useState('')

  // Load batches
  useEffect(() => { loadBatches() }, [])

  // Handle deep link by batchId
  useEffect(() => {
    const batchId = searchParams?.get('batchId')
    if (batchId && allBatches.length > 0 && selectedBatches.length === 0) {
      const batch = allBatches.find(b => b.batchCode === batchId || b.id === batchId)
      if (batch) addBatchToSelection(batch)
    }
  }, [searchParams, allBatches])

  // Handle deep link by tank params
  useEffect(() => {
    if (deeplinkApplied) return
    const tankId = searchParams?.get('tankId') || ''
    const productParam = searchParams?.get('product') || ''
    const volumeParam = parseFloat(searchParams?.get('volume') || '') || 0
    const abvParam = parseFloat(searchParams?.get('abv') || '') || 0
    if (!tankId && !productParam && !volumeParam && !abvParam) return

    const productType = inferProductType(productParam)
    const manualBatch: Batch = {
      id: `manual-${Date.now()}`,
      batchCode: tankId || `MANUAL-${Date.now()}`,
      productName: productParam || 'Manual Entry',
      productType,
      volumeLitres: volumeParam,
      abvPercent: abvParam,
      lal: (volumeParam * abvParam) / 100,
      tankCode: tankId || undefined,
      status: 'in_tank',
      notes: 'Manual entry from tank'
    }
    setSelectedBatches([{ batch: manualBatch, volumeToUseLitres: manualBatch.volumeLitres, lal: manualBatch.lal }])
    setProductName(productParam || '')
    setManualMode(false)
    setDeeplinkApplied(true)
  }, [searchParams, deeplinkApplied])

  // Handle search param
  useEffect(() => {
    const s = searchParams?.get('search') || ''
    if (s && !filterSearch) setFilterSearch(s)
  }, [searchParams])

  async function loadBatches() {
    try {
      const res = await fetch('/api/production/batches')
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      const ginBatches = (data.gin || []).map(normalizeBatch).filter(Boolean) as Batch[]
      const rumBatches = (data.rum || []).map(normalizeBatch).filter(Boolean) as Batch[]
      const allBatchesRaw = [...ginBatches, ...rumBatches]
      const seen = new Map<string, Batch>()
      for (const b of allBatchesRaw) {
        const k = `${b.id}|${b.batchCode}|${b.tankCode || ''}|${b.distilledAt || ''}`
        if (!seen.has(k)) seen.set(k, b)
      }
      setAllBatches(getAvailableBatches(Array.from(seen.values())))
    } catch (error) {
      console.error('Error loading batches:', error)
    } finally {
      setLoading(false)
    }
  }

  const addBatchToSelection = useCallback((batch: Batch) => {
    if (selectedBatches.some(sb => sb.batch.id === batch.id)) return
    const sb: SelectedBatch = { batch, volumeToUseLitres: batch.volumeLitres, lal: batch.lal }
    setSelectedBatches(prev => [...prev, sb])
    if (selectedBatches.length === 0 && !productName) setProductName(batch.productName)
  }, [selectedBatches, productName])

  const removeBatchFromSelection = useCallback((index: number) => {
    setSelectedBatches(prev => prev.filter((_, i) => i !== index))
  }, [])

  const updateSelectedBatchVolume = useCallback((index: number, volume: number) => {
    setSelectedBatches(prev => {
      const sb = prev[index]
      if (!sb) return prev
      const v = Math.max(0, Math.min(volume, sb.batch.volumeLitres))
      const updated = [...prev]
      updated[index] = { ...sb, volumeToUseLitres: v, lal: (v * sb.batch.abvPercent) / 100 }
      return updated
    })
  }, [])

  const updateSelectedBatchAbv = useCallback((index: number, abv: number) => {
    setSelectedBatches(prev => {
      const sb = prev[index]
      if (!sb) return prev
      const newAbv = Math.max(0, abv || 0)
      const updatedBatch = { ...sb.batch, abvPercent: newAbv }
      const updated = [...prev]
      updated[index] = { ...sb, batch: updatedBatch, lal: (sb.volumeToUseLitres * newAbv) / 100 }
      return updated
    })
  }, [])

  const updateSelectedBatchAvailableVolume = useCallback((index: number, availableLitres: number) => {
    setSelectedBatches(prev => {
      const sb = prev[index]
      if (!sb) return prev
      const avail = Math.max(0, availableLitres || 0)
      const updatedBatch = { ...sb.batch, volumeLitres: avail }
      const v = Math.max(0, Math.min(sb.volumeToUseLitres, avail))
      const updated = [...prev]
      updated[index] = { ...sb, batch: updatedBatch, volumeToUseLitres: v, lal: (v * updatedBatch.abvPercent) / 100 }
      return updated
    })
  }, [])

  const addDilutionPhase = useCallback(() => {
    setDilutionPhases(prev => [...prev, { id: `phase-${Date.now()}`, date: new Date().toISOString().split('T')[0], waterAdded_L: 0, notes: '' }])
  }, [])

  const updateDilutionPhase = useCallback((index: number, phase: DilutionPhase) => {
    setDilutionPhases(prev => { const u = [...prev]; u[index] = phase; return u })
  }, [])

  const removeDilutionPhase = useCallback((index: number) => {
    setDilutionPhases(prev => prev.filter((_, i) => i !== index))
  }, [])

  const addBottleSize = useCallback((size_ml: number) => {
    setBottleEntries(prev => [...prev, { size_ml, quantity: 0, volumeBottled_L: 0, lalBottled: 0 }])
  }, [])

  const updateBottleEntry = useCallback((index: number, entry: BottleEntry) => {
    setBottleEntries(prev => { const u = [...prev]; u[index] = entry; return u })
  }, [])

  const removeBottleEntry = useCallback((index: number) => {
    setBottleEntries(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Computed
  const mode = getBottlingMode(selectedBatches.map(sb => sb.batch))
  const summary = calculateBottlingSummary(selectedBatches, dilutionPhases, bottleEntries)
  const selectedInputVolume = selectedBatches.reduce((s, sb) => s + (sb.volumeToUseLitres || 0), 0)
  const plannedBottleVolume = bottleEntries.reduce((s, e) => s + (e.volumeBottled_L || 0), 0)

  const balanceBottleEntries = useCallback(() => {
    const final = summary.finalVolume_L || 0
    const planned = bottleEntries.reduce((s, e) => s + (e.volumeBottled_L || 0), 0)
    if (final <= 0 || planned <= final) return
    const ratio = final / planned
    setBottleEntries(prev => prev.map(e => {
      const q = Math.floor((e.quantity || 0) * ratio)
      const volumeBottled_L = (q * e.size_ml) / 1000
      const lalBottled = (volumeBottled_L * summary.finalABV) / 100
      return { ...e, quantity: q, volumeBottled_L, lalBottled }
    }))
  }, [summary.finalVolume_L, summary.finalABV, bottleEntries])

  // Update LAL when ABV changes
  useEffect(() => {
    setBottleEntries(prev =>
      prev.map(e => {
        const volume = e.volumeBottled_L || 0
        const lal = (volume * (summary.finalABV || 0)) / 100
        return { ...e, lalBottled: lal }
      })
    )
  }, [summary.finalABV])

  const createManualBatch = useCallback(() => {
    if (!manualVolume || !manualABV) { alert('Please enter volume and ABV'); return }
    const manualBatch: Batch = {
      id: `manual-${Date.now()}`,
      batchCode: manualTankCode || `MANUAL-${Date.now()}`,
      productName: productName || 'Manual Entry',
      productType: manualProductType,
      volumeLitres: manualVolume,
      abvPercent: manualABV,
      lal: (manualVolume * manualABV) / 100,
      tankCode: manualTankCode,
      status: 'in_tank',
      notes: 'Manual entry for bottling'
    }
    setSelectedBatches(prev => [...prev, { batch: manualBatch, volumeToUseLitres: manualVolume, lal: manualBatch.lal }])
    setManualMode(false)
    if (!productName) setProductName(manualBatch.productName)
  }, [manualVolume, manualABV, manualTankCode, productName, manualProductType])

  const saveBottlingRun = useCallback(async () => {
    try {
      if (!productName) throw new Error('Please enter a product name')
      if (selectedBatches.length === 0) throw new Error('Select at least one batch or create a manual entry')
      if (bottleEntries.length === 0) throw new Error('Add at least one bottle size')
      const payload = {
        productType: selectedBatches[0]?.batch?.productType || 'gin',
        productName, mode, selectedBatches, dilutionPhases, bottleEntries, summary,
        isTest: isTestRun, notes: isTestRun ? 'TEST RUN' : undefined,
      }
      const res = await fetch('/api/production/bottling-runs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || `Failed to save (HTTP ${res.status})`) }
      await res.json()
      alert('Bottling run saved and inventory updated successfully!')
      window.location.href = '/dashboard/inventory'
    } catch (e: any) {
      alert(e?.message || 'Failed to save bottling run')
    }
  }, [productName, selectedBatches, bottleEntries, dilutionPhases, summary, mode, isTestRun])

  // Filtered batches
  const filteredBatches = allBatches.filter(batch => {
    if (selectedBatches.some(sb => sb.batch.id === batch.id)) return false
    if (filterProductType !== 'all' && batch.productType !== filterProductType) return false
    if (filterSearch) {
      const search = filterSearch.toLowerCase()
      return batch.batchCode.toLowerCase().includes(search) ||
        batch.productName.toLowerCase().includes(search) ||
        (batch.tankCode && batch.tankCode.toLowerCase().includes(search))
    }
    return true
  })

  return {
    loading, allBatches, selectedBatches, dilutionPhases, bottleEntries,
    productName, setProductName, manualMode, setManualMode, isTestRun, setIsTestRun,
    manualProductType, setManualProductType, manualVolume, setManualVolume,
    manualABV, setManualABV, manualTankCode, setManualTankCode,
    filterProductType, setFilterProductType, filterSearch, setFilterSearch,
    filteredBatches, mode, summary, selectedInputVolume, plannedBottleVolume,
    addBatchToSelection, removeBatchFromSelection,
    updateSelectedBatchVolume, updateSelectedBatchAbv, updateSelectedBatchAvailableVolume,
    addDilutionPhase, updateDilutionPhase, removeDilutionPhase,
    addBottleSize, updateBottleEntry, removeBottleEntry, balanceBottleEntries,
    createManualBatch, saveBottlingRun,
  }
}
