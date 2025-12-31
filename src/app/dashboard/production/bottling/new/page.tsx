'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { 
  Batch, 
  SelectedBatch, 
  DilutionPhase, 
  BottleEntry, 
  ProductType,
  BottlingMode,
  getBottlingMode,
  calculateBottlingSummary,
  normalizeBatch,
  getAvailableBatches
} from '@/types/bottling'
import BatchCard from '@/components/bottling/BatchCard'
import DilutionPhaseCard from '@/components/bottling/DilutionPhaseCard'
import BottlingSummaryCard from '@/components/bottling/BottlingSummaryCard'
import BottleEntryRow from '@/components/bottling/BottleEntryRow'

// All products from Devil's Thumb and Merchant Mae
const PRODUCT_LIST = [
  // Devil's Thumb Products
  { value: 'Rainforest Gin', label: 'Rainforest Gin', type: 'gin' as ProductType },
  { value: 'Signature Dry Gin', label: 'Signature Dry Gin', type: 'gin' as ProductType },
  { value: 'Navy Strength Gin', label: 'Navy Strength Gin', type: 'gin' as ProductType },
  { value: 'Wet Season Gin', label: 'Wet Season Gin', type: 'gin' as ProductType },
  { value: 'Dry Season Gin', label: 'Dry Season Gin', type: 'gin' as ProductType },
  { value: 'Australian Cane Spirit', label: 'Australian Cane Spirit', type: 'cane_spirit' as ProductType },
  { value: 'Pineapple Rum', label: 'Pineapple Rum', type: 'rum' as ProductType },
  { value: 'Spiced Rum', label: 'Spiced Rum', type: 'rum' as ProductType },
  { value: 'Reserve Cask Rum', label: 'Reserve Cask Rum', type: 'rum' as ProductType },
  { value: 'Coffee Liqueur', label: 'Coffee Liqueur', type: 'liqueur' as ProductType },

  // Merchant Mae Products
  { value: 'Merchant Mae Gin', label: 'Merchant Mae Gin', type: 'gin' as ProductType },
  { value: 'Merchant Mae Vodka', label: 'Merchant Mae Vodka', type: 'vodka' as ProductType },
  { value: 'Merchant Mae Golden Sunrise', label: 'Merchant Mae Golden Sunrise', type: 'vodka' as ProductType },
  { value: 'Merchant Mae Berry Burst', label: 'Merchant Mae Berry Burst', type: 'vodka' as ProductType },
  { value: 'Merchant Mae White Rum', label: 'Merchant Mae White Rum', type: 'rum' as ProductType },
  { value: 'Merchant Mae Dark Rum', label: 'Merchant Mae Dark Rum', type: 'rum' as ProductType },
]

function NewBottlingRunContent() {
  const searchParams = useSearchParams()
  
  // State
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
  
  // Load batches on mount
  useEffect(() => {
    loadBatches()
  }, [])
  
  // Handle deep link (e.g., ?batchId=RAIN-24-3)
  useEffect(() => {
    const batchId = searchParams.get('batchId')
    if (batchId && allBatches.length > 0 && selectedBatches.length === 0) {
      const batch = allBatches.find(b => b.batchCode === batchId || b.id === batchId)
      if (batch) {
        addBatchToSelection(batch)
      }
    }
  }, [searchParams, allBatches])

  useEffect(() => {
    if (deeplinkApplied) return
    const tankId = searchParams.get('tankId') || ''
    const productParam = searchParams.get('product') || ''
    const volumeParam = parseFloat(searchParams.get('volume') || '') || 0
    const abvParam = parseFloat(searchParams.get('abv') || '') || 0
    if (!tankId && !productParam && !volumeParam && !abvParam) return
    function inferType(name: string): ProductType {
      const p = PRODUCT_LIST.find(p => p.value === name)
      if (p) return p.type
      const n = (name || '').toLowerCase()
      if (n.includes('rum')) return 'rum'
      if (n.includes('gin')) return 'gin'
      if (n.includes('vodka')) return 'vodka'
      if (n.includes('cane')) return 'cane_spirit'
      if (n.includes('liqueur')) return 'other_liqueur'
      return 'gin'
    }
    const productType = inferType(productParam)
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
    const selected: SelectedBatch = {
      batch: manualBatch,
      volumeToUseLitres: manualBatch.volumeLitres,
      lal: manualBatch.lal
    }
    setSelectedBatches([selected])
    setProductName(productParam || '')
    setManualMode(false)
    setDeeplinkApplied(true)
  }, [searchParams, deeplinkApplied])

  async function loadBatches() {
    try {
      const res = await fetch('/api/production/batches')
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      
      const data = await res.json()
      
      // Normalize both gin and rum batches
      const ginBatches = (data.gin || []).map(normalizeBatch).filter(Boolean) as Batch[]
      const rumBatches = (data.rum || []).map(normalizeBatch).filter(Boolean) as Batch[]
      
      const allBatchesRaw = [...ginBatches, ...rumBatches]
      const seen = new Map<string, Batch>()
      for (const b of allBatchesRaw) {
        const k = `${b.id}|${b.batchCode}|${b.tankCode || ''}|${b.distilledAt || ''}`
        if (!seen.has(k)) seen.set(k, b)
      }
      const allBatchesDedup = Array.from(seen.values())
      
      // Filter only batches available for bottling
      const available = getAvailableBatches(allBatchesDedup)
      
      setAllBatches(available)
    } catch (error) {
      console.error('Error loading batches:', error)
    } finally {
      setLoading(false)
    }
  }

  function addBatchToSelection(batch: Batch) {
    // Check if already selected
    if (selectedBatches.some(sb => sb.batch.id === batch.id)) {
      return
    }
    
    const selectedBatch: SelectedBatch = {
      batch,
      volumeToUseLitres: batch.volumeLitres,
      lal: batch.lal
    }
    setSelectedBatches([...selectedBatches, selectedBatch])
    
    // Auto-set product name if first batch
    if (selectedBatches.length === 0 && !productName) {
      setProductName(batch.productName)
    }
  }

  function removeBatchFromSelection(index: number) {
    setSelectedBatches(selectedBatches.filter((_, i) => i !== index))
  }

  function updateSelectedBatchVolume(index: number, volume: number) {
    const sb = selectedBatches[index]
    if (!sb) return
    const max = sb.batch.volumeLitres
    const v = Math.max(0, Math.min(volume, max))
    const updated = [...selectedBatches]
    updated[index] = {
      ...sb,
      volumeToUseLitres: v,
      lal: (v * sb.batch.abvPercent) / 100
    }
    setSelectedBatches(updated)
  }

  function addDilutionPhase() {
    const newPhase: DilutionPhase = {
      id: `phase-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      waterAdded_L: 0,
      notes: ''
    }
    setDilutionPhases([...dilutionPhases, newPhase])
  }

  function updateDilutionPhase(index: number, phase: DilutionPhase) {
    const updated = [...dilutionPhases]
    updated[index] = phase
    setDilutionPhases(updated)
  }

  function updateSelectedBatchAbv(index: number, abv: number) {
    const sb = selectedBatches[index]
    if (!sb) return
    const newAbv = Math.max(0, abv || 0)
    const updatedBatch = { ...sb.batch, abvPercent: newAbv }
    const v = sb.volumeToUseLitres
    const updated = [...selectedBatches]
    updated[index] = {
      ...sb,
      batch: updatedBatch,
      lal: (v * newAbv) / 100
    }
    setSelectedBatches(updated)
  }

  function updateSelectedBatchAvailableVolume(index: number, availableLitres: number) {
    const sb = selectedBatches[index]
    if (!sb) return
    const avail = Math.max(0, availableLitres || 0)
    const updatedBatch = { ...sb.batch, volumeLitres: avail }
    const v = Math.max(0, Math.min(sb.volumeToUseLitres, avail))
    const updated = [...selectedBatches]
    updated[index] = {
      ...sb,
      batch: updatedBatch,
      volumeToUseLitres: v,
      lal: (v * updatedBatch.abvPercent) / 100
    }
    setSelectedBatches(updated)
  }

  function removeDilutionPhase(index: number) {
    setDilutionPhases(dilutionPhases.filter((_, i) => i !== index))
  }

  function addBottleSize(size_ml: number) {
    const newEntry: BottleEntry = {
      size_ml,
      quantity: 0,
      volumeBottled_L: 0,
      lalBottled: 0
    }
    setBottleEntries([...bottleEntries, newEntry])
  }

  function updateBottleEntry(index: number, entry: BottleEntry) {
    const updated = [...bottleEntries]
    updated[index] = entry
    setBottleEntries(updated)
  }

  function removeBottleEntry(index: number) {
    setBottleEntries(bottleEntries.filter((_, i) => i !== index))
  }

  function balanceBottleEntries() {
    const final = summary.finalVolume_L || 0
    const planned = bottleEntries.reduce((s, e) => s + (e.volumeBottled_L || 0), 0)
    if (final <= 0 || planned <= final) return
    const ratio = final / planned
    const updated = bottleEntries.map(e => {
      const q = Math.floor((e.quantity || 0) * ratio)
      const volumeBottled_L = (q * e.size_ml) / 1000
      const lalBottled = (volumeBottled_L * summary.finalABV) / 100
      return { ...e, quantity: q, volumeBottled_L, lalBottled }
    })
    setBottleEntries(updated)
  }

  function createManualBatch() {
    if (!manualVolume || !manualABV) {
      alert('Please enter volume and ABV')
      return
    }

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

    const selectedBatch: SelectedBatch = {
      batch: manualBatch,
      volumeToUseLitres: manualVolume,
      lal: manualBatch.lal
    }

    setSelectedBatches(prev => [...prev, selectedBatch])
    setManualMode(false)

    // Auto-set product name if not set
    if (!productName) {
      setProductName(manualBatch.productName)
    }
  }

  async function saveBottlingRun() {
    try {
      if (!productName) throw new Error('Please enter a product name')
      if (selectedBatches.length === 0) throw new Error('Select at least one batch or create a manual entry')
      if (bottleEntries.length === 0) throw new Error('Add at least one bottle size')

      const payload = {
        productType: selectedBatches[0]?.batch?.productType || 'gin',
        productName,
        mode,
        selectedBatches,
        dilutionPhases,
        bottleEntries,
        summary,
        isTest: isTestRun,
        notes: isTestRun ? 'TEST RUN' : undefined,
      }

      const res = await fetch('/api/production/bottling-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `Failed to save (HTTP ${res.status})`)
      }

      const j = await res.json()
      alert('Bottling run saved and inventory updated successfully!')
      window.location.href = '/dashboard/production'
    } catch (e: any) {
      alert(e?.message || 'Failed to save bottling run')
    }
  }

  // Calculate mode and summary
  const mode = getBottlingMode(selectedBatches.map(sb => sb.batch))
  const summary = calculateBottlingSummary(selectedBatches, dilutionPhases, bottleEntries)
  const selectedInputVolume = selectedBatches.reduce((s, sb) => s + (sb.volumeToUseLitres || 0), 0)
  const plannedBottleVolume = bottleEntries.reduce((s, e) => s + (e.volumeBottled_L || 0), 0)

  // Filter available batches
  const filteredBatches = allBatches.filter(batch => {
    // Exclude already selected
    if (selectedBatches.some(sb => sb.batch.id === batch.id)) return false

    // Filter by product type
    if (filterProductType !== 'all' && batch.productType !== filterProductType) return false

    // Filter by search
    if (filterSearch) {
      const search = filterSearch.toLowerCase()
      return (
        batch.batchCode.toLowerCase().includes(search) ||
        batch.productName.toLowerCase().includes(search) ||
        (batch.tankCode && batch.tankCode.toLowerCase().includes(search))
      )
    }

    return true
  })

  // Render
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A65E2E]"></div>
      </div>
    )
  }

  // Empty state
  if (allBatches.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <div className="bg-white border-b border-[#E5E5E5] px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-[#000000]">New Bottling Run</h1>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="bg-white rounded-lg border border-[#E5E5E5] p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#A65E2E]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#A65E2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#000000] mb-2">
              No Liquid Available for Bottling
            </h2>
            <p className="text-sm text-[#777777] mb-6">
              No batches are currently available in tanks for bottling.<br />
              Go to Production → Batches and mark a batch as 'in tank / ready for bottling', then return here.
            </p>
            <Link
              href="/dashboard/batches"
              className="inline-flex items-center px-6 py-3 rounded-md bg-[#A65E2E] hover:bg-[#8B4E26] text-white font-medium transition-colors"
            >
              View Batches
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5] px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#000000]">New Bottling Run</h1>
              <p className="text-sm text-[#777777] mt-1">
                Select batches from available liquid in tanks
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-[#000000]">
                <input
                  type="checkbox"
                  checked={isTestRun}
                  onChange={(e) => setIsTestRun(e.target.checked)}
                  className="h-4 w-4 rounded border-[#E5E5E5]"
                />
                Test run (bypass stock checks)
              </label>
            </div>
            <Link
              href="/dashboard/production"
              className="px-4 py-2 rounded-md border border-[#E5E5E5] text-[#777777] hover:bg-[#E5E5E5] transition-colors text-sm font-medium"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Step 1: Batch Selection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#000000]">
              1. Select Source Batches
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => setManualMode(!manualMode)}
                className="px-4 py-2 rounded-md bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium transition-colors"
              >
                {manualMode ? 'Cancel Manual Entry' : '+ Create from Scratch'}
              </button>
              {/* Product Type Filter */}
              <select
                value={filterProductType}
                onChange={(e) => setFilterProductType(e.target.value as ProductType | 'all')}
                className="px-3 py-2 rounded-md border border-[#E5E5E5] text-sm text-[#777777] focus:outline-none focus:ring-2 focus:ring-[#A65E2E]"
              >
                <option value="all">All Types</option>
                <option value="gin">Gin</option>
                <option value="vodka">Vodka</option>
                <option value="rum">Rum</option>
                <option value="cane_spirit">Cane Spirit</option>
                <option value="spiced_rum">Spiced Rum</option>
                <option value="pineapple_rum">Pineapple Rum</option>
                <option value="coffee_liqueur">Coffee Liqueur</option>
              </select>

              {/* Search Filter */}
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Search batches..."
                className="px-3 py-2 rounded-md border border-[#E5E5E5] text-sm text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#A65E2E]"
              />
            </div>
          </div>

          {/* Manual Entry Form */}
          {manualMode && (
            <div className="mb-6 p-6 bg-amber-50 border-2 border-amber-200 rounded-lg">
              <h3 className="text-md font-semibold text-amber-900 mb-4">
                Create Bottling Run from Scratch
              </h3>
              <p className="text-sm text-amber-700 mb-4">
                Enter the details of the liquid you want to bottle (e.g., from a tank not tracked as a batch)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Select Product
                  </label>
                  <select
                    value={productName}
                    onChange={(e) => {
                      const selectedProduct = PRODUCT_LIST.find(p => p.value === e.target.value)
                      setProductName(e.target.value)
                      if (selectedProduct) {
                        setManualProductType(selectedProduct.type)
                      }
                    }}
                    className="w-full px-3 py-2 rounded-md border border-amber-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                  >
                    <option value="">-- Select a product --</option>
                    <optgroup label="Devil's Thumb Products">
                      <option value="Rainforest Gin">Rainforest Gin</option>
                      <option value="Signature Dry Gin">Signature Dry Gin</option>
                      <option value="Navy Strength Gin">Navy Strength Gin</option>
                      <option value="Wet Season Gin">Wet Season Gin</option>
                      <option value="Dry Season Gin">Dry Season Gin</option>
                      <option value="Australian Cane Spirit">Australian Cane Spirit</option>
                      <option value="Pineapple Rum">Pineapple Rum</option>
                      <option value="Spiced Rum">Spiced Rum</option>
                      <option value="Reserve Cask Rum">Reserve Cask Rum</option>
                      <option value="Coffee Liqueur">Coffee Liqueur</option>
                    </optgroup>
                    <optgroup label="Merchant Mae Products">
                      <option value="Merchant Mae Gin">Merchant Mae Gin</option>
                      <option value="Merchant Mae Vodka">Merchant Mae Vodka</option>
                      <option value="Merchant Mae Golden Sunrise">Merchant Mae Golden Sunrise</option>
                      <option value="Merchant Mae Berry Burst">Merchant Mae Berry Burst</option>
                      <option value="Merchant Mae White Rum">Merchant Mae White Rum</option>
                      <option value="Merchant Mae Dark Rum">Merchant Mae Dark Rum</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Volume (Litres)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualVolume || ''}
                    onChange={(e) => setManualVolume(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 100"
                    className="w-full px-3 py-2 rounded-md border border-amber-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    ABV (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualABV || ''}
                    onChange={(e) => setManualABV(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 40"
                    className="w-full px-3 py-2 rounded-md border border-amber-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Tank Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={manualTankCode}
                    onChange={(e) => setManualTankCode(e.target.value)}
                    placeholder="e.g., T-330-01"
                    className="w-full px-3 py-2 rounded-md border border-amber-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={createManualBatch}
                    className="w-full px-4 py-2 rounded-md bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium transition-colors"
                  >
                    Add to Bottling Run
                  </button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white rounded border border-amber-200">
                <p className="text-xs text-amber-700">
                  <strong>Calculated LAL:</strong> {((manualVolume * manualABV) / 100).toFixed(2)} L
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Available Batches */}
            <div>
              <h3 className="text-sm font-medium text-[#777777] mb-3 uppercase tracking-wide">
                Available Batches ({filteredBatches.length})
              </h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {filteredBatches.map((batch, idx) => (
                  <BatchCard
                    key={`${batch.id}-${batch.batchCode}-${batch.tankCode || batch.distilledAt || ''}-${idx}`}
                    batch={batch}
                    onAdd={() => addBatchToSelection(batch)}
                    showAddButton
                  />
                ))}
                {filteredBatches.length === 0 && (
                  <div className="rounded-lg border-2 border-dashed border-[#E5E5E5] p-8 text-center">
                    <p className="text-sm text-[#777777]">
                      No batches match your filters
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Batches */}
            <div>
              <h3 className="text-sm font-medium text-[#777777] mb-3 uppercase tracking-wide">
                Selected Batches ({selectedBatches.length})
              </h3>
              <div className="space-y-3">
                {selectedBatches.map((sb, index) => (
                  <div key={`${sb.batch.id}-${sb.batch.tankCode || sb.batch.distilledAt || index}`} className="space-y-2">
                    <BatchCard
                      batch={sb.batch}
                      onRemove={() => removeBatchFromSelection(index)}
                      isSelected
                      showRemoveButton
                    />
                    <div className="rounded-lg border border-[#E5E5E5] bg-white p-3">
                      <div className="grid grid-cols-4 gap-4 items-end">
                        <div>
                          <label className="block text-xs text-[#777777] mb-1">
                            Use Volume (L)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max={sb.batch.volumeLitres}
                            value={sb.volumeToUseLitres}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value)
                              updateSelectedBatchVolume(index, isNaN(val) ? 0 : val)
                            }}
                            className="
                              w-full px-3 py-2 rounded-md
                              border border-[#E5E5E5]
                              text-sm text-[#000000]
                              focus:outline-none focus:ring-2 focus:ring-[#A65E2E] focus:border-transparent
                            "
                            placeholder="0.0"
                          />
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => updateSelectedBatchVolume(index, sb.batch.volumeLitres * 0.25)}
                              className="px-2 py-1 rounded-md border border-[#E5E5E5] text-xs text-[#777777] hover:bg-[#E5E5E5]"
                              type="button"
                            >
                              25%
                            </button>
                            <button
                              onClick={() => updateSelectedBatchVolume(index, sb.batch.volumeLitres * 0.5)}
                              className="px-2 py-1 rounded-md border border-[#E5E5E5] text-xs text-[#777777] hover:bg-[#E5E5E5]"
                              type="button"
                            >
                              50%
                            </button>
                            <button
                              onClick={() => updateSelectedBatchVolume(index, sb.batch.volumeLitres)}
                              className="px-2 py-1 rounded-md border border-[#E5E5E5] text-xs text-[#777777] hover:bg-[#E5E5E5]"
                              type="button"
                            >
                              100%
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-[#777777] mb-1">
                            ABV (%)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={sb.batch.abvPercent}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value)
                              updateSelectedBatchAbv(index, isNaN(val) ? 0 : val)
                            }}
                            className="
                              w-full px-3 py-2 rounded-md
                              border border-[#E5E5E5]
                              text-sm text-[#000000]
                              focus:outline-none focus:ring-2 focus:ring-[#A65E2E] focus:border-transparent
                            "
                            placeholder="0.0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#777777] mb-1">
                            Available Volume (L)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={sb.batch.volumeLitres}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value)
                              updateSelectedBatchAvailableVolume(index, isNaN(val) ? 0 : val)
                            }}
                            className="
                              w-full px-3 py-2 rounded-md
                              border border-[#E5E5E5]
                              text-sm text-[#000000]
                              focus:outline-none focus:ring-2 focus:ring-[#A65E2E] focus:border-transparent
                            "
                            placeholder="0.0"
                          />
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#777777] mb-1">Selected LAL</p>
                          <p className="text-sm font-medium text-[#000000]">
                            {sb.lal.toFixed(2)} L
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {selectedBatches.length === 0 && (
                  <div className="rounded-lg border-2 border-dashed border-[#E5E5E5] p-8 text-center">
                    <p className="text-sm text-[#777777]">
                      No batches selected yet
                    </p>
                    <p className="text-xs text-[#777777] mt-2">
                      Click "Add" on a batch to start
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Product Name */}
        {selectedBatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#000000] mb-4">
              2. Product Name
            </h2>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g., Devil's Thumb White Rum"
              className="
                w-full max-w-md px-4 py-3 rounded-lg
                border border-[#E5E5E5]
                text-sm text-[#000000]
                focus:outline-none focus:ring-2 focus:ring-[#A65E2E] focus:border-transparent
              "
            />
            <p className="text-xs text-[#777777] mt-2">
              Mode: <span className="font-medium text-[#A65E2E]">{mode === 'blend' ? 'Blend Mode (Rum/Cane Spirit)' : 'Simple Bottling (Gin/Vodka)'}</span>
            </p>
            {productName && (
              <div className="mt-3">
                <Link
                  href={`/dashboard/inventory?category=Spirits&search=${encodeURIComponent(productName)}`}
                  className="inline-flex items-center px-3 py-2 rounded-md border border-[#E5E5E5] text-[#777777] hover:bg-[#E5E5E5] transition-colors text-sm"
                >
                  Edit Product Details
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Dilution Phases (only for blend mode or if user wants to track) */}
        {selectedBatches.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#000000]">
                3. Dilution Phases {mode === 'simple' && '(Optional)'}
              </h2>
              <button
                onClick={addDilutionPhase}
                className="
                  px-4 py-2 rounded-md
                  bg-[#A65E2E] hover:bg-[#8B4E26]
                  text-white text-sm font-medium
                  transition-colors
                "
              >
                + Add Phase
              </button>
            </div>

            {dilutionPhases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dilutionPhases.map((phase, index) => (
                  <DilutionPhaseCard
                    key={phase.id}
                    phase={phase}
                    phaseNumber={index + 1}
                    onUpdate={(updated) => updateDilutionPhase(index, updated)}
                    onRemove={() => removeDilutionPhase(index)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-[#E5E5E5] p-8 text-center">
                <p className="text-sm text-[#777777]">
                  No dilution phases added. Click "Add Phase" to track multi-day dilution.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Bottling */}
        {selectedBatches.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#000000]">
                4. Bottling Details
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => addBottleSize(700)}
                  className="px-3 py-2 rounded-md border border-[#E5E5E5] text-[#777777] hover:bg-[#E5E5E5] transition-colors text-sm"
                >
                  + 700ml
                </button>
                <button
                  onClick={() => addBottleSize(200)}
                  className="px-3 py-2 rounded-md border border-[#E5E5E5] text-[#777777] hover:bg-[#E5E5E5] transition-colors text-sm"
                >
                  + 200ml
                </button>
                <button
                  onClick={() => addBottleSize(1000)}
                  className="px-3 py-2 rounded-md border border-[#E5E5E5] text-[#777777] hover:bg-[#E5E5E5] transition-colors text-sm"
                >
                  + 1L
                </button>
              </div>
            </div>
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-amber-700">Selected Input</p>
                  <p className="font-semibold text-amber-900">{selectedInputVolume.toFixed(1)} L</p>
                </div>
                <div>
                  <p className="text-amber-700">Water Added</p>
                  <p className="font-semibold text-amber-900">{summary.totalWaterAdded_L.toFixed(1)} L</p>
                </div>
                <div>
                  <p className="text-amber-700">Final Volume</p>
                  <p className="font-semibold text-amber-900">{summary.finalVolume_L.toFixed(1)} L</p>
                </div>
                <div>
                  <p className="text-amber-700">Planned Bottles</p>
                  <p className="font-semibold text-amber-900">{plannedBottleVolume.toFixed(1)} L</p>
                </div>
              </div>
              {plannedBottleVolume > summary.finalVolume_L && (
                <p className="mt-2 text-xs text-red-700">
                  Planned bottled volume exceeds final volume. Reduce quantities.
                </p>
              )}
              {plannedBottleVolume > summary.finalVolume_L && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={balanceBottleEntries}
                    className="px-3 py-2 rounded-md bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium transition-colors"
                  >
                    Balance to Final Volume
                  </button>
                </div>
              )}
            </div>

            {bottleEntries.length > 0 ? (
              <div>
                {/* Header Row */}
                <div className="grid grid-cols-5 gap-4 px-3 py-2 mb-2">
                  <p className="text-xs font-medium text-[#777777] uppercase">Size</p>
                  <p className="text-xs font-medium text-[#777777] uppercase">Quantity</p>
                  <p className="text-xs font-medium text-[#777777] uppercase">Volume</p>
                  <p className="text-xs font-medium text-[#777777] uppercase">LAL</p>
                  <p className="text-xs font-medium text-[#777777] uppercase text-right">Action</p>
                </div>

                {/* Bottle Entries */}
                <div className="space-y-2">
                  {bottleEntries.map((entry, index) => (
                    <BottleEntryRow
                      key={index}
                      entry={entry}
                      finalABV={summary.finalABV}
                      onUpdate={(updated) => updateBottleEntry(index, updated)}
                      onRemove={() => removeBottleEntry(index)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-[#E5E5E5] p-8 text-center">
                <p className="text-sm text-[#777777]">
                  No bottle sizes added. Click a button above to add bottle sizes.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Summary Card */}
        {selectedBatches.length > 0 && (
          <div className="mb-8">
            <BottlingSummaryCard summary={summary} mode={mode} />
          </div>
        )}

        {/* Save Button */}
        {selectedBatches.length > 0 && productName && (
          <div className="flex justify-end gap-4">
            <Link
              href="/dashboard/production"
              className="px-6 py-3 rounded-md border border-[#E5E5E5] text-[#777777] hover:bg-[#E5E5E5] transition-colors font-medium"
            >
              Cancel
            </Link>
            <button
              onClick={saveBottlingRun}
              className="
                px-6 py-3 rounded-md
                bg-[#A65E2E] hover:bg-[#8B4E26]
                text-white font-medium
                transition-colors
              "
            >
              Save Bottling Run
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function NewBottlingRunPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5]" />}> 
      <NewBottlingRunContent />
    </Suspense>
  )
}
