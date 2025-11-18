'use client'

import { useState, useEffect } from 'react'
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

export default function NewBottlingRunPage() {
  const searchParams = useSearchParams()
  
  // State
  const [loading, setLoading] = useState(true)
  const [allBatches, setAllBatches] = useState<Batch[]>([])
  const [selectedBatches, setSelectedBatches] = useState<SelectedBatch[]>([])
  const [dilutionPhases, setDilutionPhases] = useState<DilutionPhase[]>([])
  const [bottleEntries, setBottleEntries] = useState<BottleEntry[]>([])
  const [productName, setProductName] = useState('')
  
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

  async function loadBatches() {
    try {
      const res = await fetch('/api/production/batches')
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      
      const data = await res.json()
      
      // Normalize both gin and rum batches
      const ginBatches = (data.gin || []).map(normalizeBatch).filter(Boolean) as Batch[]
      const rumBatches = (data.rum || []).map(normalizeBatch).filter(Boolean) as Batch[]
      
      const allBatchesRaw = [...ginBatches, ...rumBatches]
      
      // Filter only batches available for bottling
      const available = getAvailableBatches(allBatchesRaw)
      
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

  async function saveBottlingRun() {
    try {
      if (!productName) throw new Error('Please enter a product name')
      if (selectedBatches.length === 0) throw new Error('Select at least one batch')
      if (bottleEntries.length === 0) throw new Error('Add at least one bottle size')

      const payload = {
        productType: selectedBatches[0]?.batch?.productType || 'gin',
        productName,
        mode,
        selectedBatches,
        dilutionPhases,
        bottleEntries,
        summary,
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Available Batches */}
            <div>
              <h3 className="text-sm font-medium text-[#777777] mb-3 uppercase tracking-wide">
                Available Batches ({filteredBatches.length})
              </h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {filteredBatches.map((batch) => (
                  <BatchCard
                    key={batch.id}
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
                  <BatchCard
                    key={sb.batch.id}
                    batch={sb.batch}
                    onRemove={() => removeBatchFromSelection(index)}
                    isSelected
                    showRemoveButton
                  />
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

