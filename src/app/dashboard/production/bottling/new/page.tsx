'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useBottlingData } from '@/modules/production/hooks/useBottlingData'
import { PRODUCT_LIST } from '@/modules/production/constants/bottling-products'
import BatchCard from '@/components/bottling/BatchCard'
import DilutionPhaseCard from '@/components/bottling/DilutionPhaseCard'
import BottlingSummaryCard from '@/components/bottling/BottlingSummaryCard'
import BottleEntryRow from '@/components/bottling/BottleEntryRow'

function NewBottlingRunContent() {
  const d = useBottlingData()

  if (d.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A65E2E]"></div>
      </div>
    )
  }

  if (d.allBatches.length === 0) {
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
            <h2 className="text-xl font-semibold text-[#000000] mb-2">No Liquid Available for Bottling</h2>
            <p className="text-sm text-[#777777] mb-6">
              No batches are currently available in tanks for bottling.<br />
              Go to Production → Batches and mark a batch as &apos;in tank / ready for bottling&apos;, then return here.
            </p>
            <Link href="/dashboard/batches" className="inline-flex items-center px-6 py-3 rounded-md bg-[#A65E2E] hover:bg-[#8B4E26] text-white font-medium transition-colors">
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
              <p className="text-sm text-[#777777] mt-1">Select batches from available liquid in tanks</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-[#000000]">
                <input type="checkbox" checked={d.isTestRun} onChange={(e) => d.setIsTestRun(e.target.checked)} className="h-4 w-4 rounded border-[#E5E5E5]" />
                Test run (bypass stock checks)
              </label>
            </div>
            <Link href="/dashboard/production" className="px-4 py-2 rounded-md border border-[#E5E5E5] text-[#777777] hover:bg-[#E5E5E5] transition-colors text-sm font-medium">Cancel</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Step 1: Batch Selection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#000000]">1. Select Source Batches</h2>
            <div className="flex gap-3">
              <button onClick={() => d.setManualMode(!d.manualMode)} className="px-4 py-2 rounded-md bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium transition-colors">
                {d.manualMode ? 'Cancel Manual Entry' : '+ Create from Scratch'}
              </button>
              <select value={d.filterProductType} onChange={(e) => d.setFilterProductType(e.target.value as any)} className="px-3 py-2 rounded-md border border-[#E5E5E5] text-sm text-[#777777] focus:outline-none focus:ring-2 focus:ring-[#A65E2E]">
                <option value="all">All Types</option>
                <option value="gin">Gin</option>
                <option value="vodka">Vodka</option>
                <option value="rum">Rum</option>
                <option value="cane_spirit">Cane Spirit</option>
                <option value="spiced_rum">Spiced Rum</option>
                <option value="pineapple_rum">Pineapple Rum</option>
                <option value="coffee_liqueur">Coffee Liqueur</option>
              </select>
              <input type="text" value={d.filterSearch} onChange={(e) => d.setFilterSearch(e.target.value)} placeholder="Search batches..." className="px-3 py-2 rounded-md border border-[#E5E5E5] text-sm text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#A65E2E]" />
            </div>
          </div>

          {/* Manual Entry Form */}
          {d.manualMode && (
            <div className="mb-6 p-6 bg-amber-50 border-2 border-amber-200 rounded-lg">
              <h3 className="text-md font-semibold text-amber-900 mb-4">Create Bottling Run from Scratch</h3>
              <p className="text-sm text-amber-700 mb-4">Enter the details of the liquid you want to bottle (e.g., from a tank not tracked as a batch)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="manual_select_product" className="block text-sm font-medium text-amber-900 mb-2">Select Product</label>
                  <select id="manual_select_product" value={d.productName} onChange={(e) => {
                    const sel = PRODUCT_LIST.find(p => p.value === e.target.value)
                    d.setProductName(e.target.value)
                    if (sel) d.setManualProductType(sel.type)
                  }} className="w-full px-3 py-2 rounded-md border border-amber-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600">
                    <option value="">-- Select a product --</option>
                    <optgroup label="Devil's Thumb Products">
                      {PRODUCT_LIST.filter((_, i) => i < 10).map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </optgroup>
                    <optgroup label="Merchant Mae Products">
                      {PRODUCT_LIST.filter((_, i) => i >= 10).map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label htmlFor="manual_volume" className="block text-sm font-medium text-amber-900 mb-2">Volume (Litres)</label>
                  <input id="manual_volume" type="number" step="0.1" value={d.manualVolume || ''} onChange={(e) => d.setManualVolume(parseFloat(e.target.value) || 0)} placeholder="e.g., 100" className="w-full px-3 py-2 rounded-md border border-amber-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
                </div>
                <div>
                  <label htmlFor="manual_abv" className="block text-sm font-medium text-amber-900 mb-2">ABV (%)</label>
                  <input id="manual_abv" type="number" step="0.1" value={d.manualABV || ''} onChange={(e) => d.setManualABV(parseFloat(e.target.value) || 0)} placeholder="e.g., 40" className="w-full px-3 py-2 rounded-md border border-amber-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
                </div>
                <div>
                  <label htmlFor="manual_tank_code" className="block text-sm font-medium text-amber-900 mb-2">Tank Code (Optional)</label>
                  <input id="manual_tank_code" type="text" value={d.manualTankCode} onChange={(e) => d.setManualTankCode(e.target.value)} placeholder="e.g., T-330-01" className="w-full px-3 py-2 rounded-md border border-amber-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
                </div>
                <div className="flex items-end">
                  <button onClick={d.createManualBatch} className="w-full px-4 py-2 rounded-md bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium transition-colors">Add to Bottling Run</button>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white rounded border border-amber-200">
                <p className="text-xs text-amber-700"><strong>Calculated LAL:</strong> {((d.manualVolume * d.manualABV) / 100).toFixed(2)} L</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Available Batches */}
            <div>
              <h3 className="text-sm font-medium text-[#777777] mb-3 uppercase tracking-wide">Available Batches ({d.filteredBatches.length})</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {d.filteredBatches.map((batch, idx) => (
                  <BatchCard key={`${batch.id}-${batch.batchCode}-${batch.tankCode || batch.distilledAt || ''}-${idx}`} batch={batch} onAdd={() => d.addBatchToSelection(batch)} showAddButton />
                ))}
                {d.filteredBatches.length === 0 && (
                  <div className="rounded-lg border-2 border-dashed border-[#E5E5E5] p-8 text-center">
                    <p className="text-sm text-[#777777]">No batches match your filters</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Batches */}
            <div>
              <h3 className="text-sm font-medium text-[#777777] mb-3 uppercase tracking-wide">Selected Batches ({d.selectedBatches.length})</h3>
              <div className="space-y-3">
                {d.selectedBatches.map((sb, index) => (
                  <div key={`${sb.batch.id}-${sb.batch.tankCode || sb.batch.distilledAt || index}`} className="space-y-2">
                    <BatchCard batch={sb.batch} onRemove={() => d.removeBatchFromSelection(index)} isSelected showRemoveButton />
                    <div className="rounded-lg border border-[#E5E5E5] bg-white p-3">
                      <div className="grid grid-cols-4 gap-4 items-end">
                        <div>
                          <label htmlFor={`selected_${index}_use_volume`} className="block text-xs text-[#777777] mb-1">Use Volume (L)</label>
                          <input id={`selected_${index}_use_volume`} type="number" step="0.1" min="0" max={sb.batch.volumeLitres} value={sb.volumeToUseLitres} onChange={(e) => { const val = parseFloat(e.target.value); d.updateSelectedBatchVolume(index, isNaN(val) ? 0 : val) }} className="w-full px-3 py-2 rounded-md border border-[#E5E5E5] text-sm text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#A65E2E] focus:border-transparent" placeholder="0.0" />
                          <div className="mt-2 flex gap-2">
                            {[0.25, 0.5, 1].map(pct => (
                              <button key={pct} onClick={() => d.updateSelectedBatchVolume(index, sb.batch.volumeLitres * pct)} className="px-2 py-1 rounded-md border border-[#E5E5E5] text-xs text-[#777777] hover:bg-[#E5E5E5]" type="button">{pct * 100}%</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label htmlFor={`selected_${index}_abv`} className="block text-xs text-[#777777] mb-1">ABV (%)</label>
                          <input id={`selected_${index}_abv`} type="number" step="0.1" min="0" value={sb.batch.abvPercent} onChange={(e) => { const val = parseFloat(e.target.value); d.updateSelectedBatchAbv(index, isNaN(val) ? 0 : val) }} className="w-full px-3 py-2 rounded-md border border-[#E5E5E5] text-sm text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#A65E2E] focus:border-transparent" placeholder="0.0" />
                        </div>
                        <div>
                          <label htmlFor={`selected_${index}_available_volume`} className="block text-xs text-[#777777] mb-1">Available Volume (L)</label>
                          <input id={`selected_${index}_available_volume`} type="number" step="0.1" min="0" value={sb.batch.volumeLitres} onChange={(e) => { const val = parseFloat(e.target.value); d.updateSelectedBatchAvailableVolume(index, isNaN(val) ? 0 : val) }} className="w-full px-3 py-2 rounded-md border border-[#E5E5E5] text-sm text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#A65E2E] focus:border-transparent" placeholder="0.0" />
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#777777] mb-1">Selected LAL</p>
                          <p className="text-sm font-medium text-[#000000]">{sb.lal.toFixed(2)} L</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {d.selectedBatches.length === 0 && (
                  <div className="rounded-lg border-2 border-dashed border-[#E5E5E5] p-8 text-center">
                    <p className="text-sm text-[#777777]">No batches selected yet</p>
                    <p className="text-xs text-[#777777] mt-2">Click &quot;Add&quot; on a batch to start</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Product Name */}
        {d.selectedBatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#000000] mb-4">2. Product Name</h2>
            <input type="text" value={d.productName} onChange={(e) => d.setProductName(e.target.value)} placeholder="e.g., Devil's Thumb White Rum" className="w-full max-w-md px-4 py-3 rounded-lg border border-[#E5E5E5] text-sm text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#A65E2E] focus:border-transparent" />
            <p className="text-xs text-[#777777] mt-2">
              Mode: <span className="font-medium text-[#A65E2E]">{d.mode === 'blend' ? 'Blend Mode (Rum/Cane Spirit)' : 'Simple Bottling (Gin/Vodka)'}</span>
            </p>
            {d.productName && (
              <div className="mt-3">
                <Link href={`/dashboard/inventory?category=Spirits&search=${encodeURIComponent(d.productName)}`} className="inline-flex items-center px-3 py-2 rounded-md border border-[#E5E5E5] text-[#777777] hover:bg-[#E5E5E5] transition-colors text-sm">Edit Product Details</Link>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Dilution Phases */}
        {d.selectedBatches.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#000000]">3. Dilution Phases {d.mode === 'simple' && '(Optional)'}</h2>
              <button onClick={d.addDilutionPhase} className="px-4 py-2 rounded-md bg-[#A65E2E] hover:bg-[#8B4E26] text-white text-sm font-medium transition-colors">+ Add Phase</button>
            </div>
            {d.dilutionPhases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {d.dilutionPhases.map((phase, index) => (
                  <DilutionPhaseCard key={phase.id} phase={phase} phaseNumber={index + 1} onUpdate={(updated) => d.updateDilutionPhase(index, updated)} onRemove={() => d.removeDilutionPhase(index)} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-[#E5E5E5] p-8 text-center">
                <p className="text-sm text-[#777777]">No dilution phases added. Click &quot;Add Phase&quot; to track multi-day dilution.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Bottling Details */}
        {d.selectedBatches.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#000000]">4. Bottling Details</h2>
              <div className="flex gap-2">
                {[700, 200, 1000].map(size => (
                  <button key={size} onClick={() => d.addBottleSize(size)} className="px-3 py-2 rounded-md border border-[#E5E5E5] text-[#777777] hover:bg-[#E5E5E5] transition-colors text-sm">
                    + {size >= 1000 ? `${size / 1000}L` : `${size}ml`}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><p className="text-amber-700">Selected Input</p><p className="font-semibold text-amber-900">{d.selectedInputVolume.toFixed(1)} L</p></div>
                <div><p className="text-amber-700">Water Added</p><p className="font-semibold text-amber-900">{d.summary.totalWaterAdded_L.toFixed(1)} L</p></div>
                <div><p className="text-amber-700">Final Volume</p><p className="font-semibold text-amber-900">{d.summary.finalVolume_L.toFixed(1)} L</p></div>
                <div><p className="text-amber-700">Planned Bottles</p><p className="font-semibold text-amber-900">{d.plannedBottleVolume.toFixed(1)} L</p></div>
              </div>
              {d.plannedBottleVolume > d.summary.finalVolume_L && (
                <>
                  <p className="mt-2 text-xs text-red-700">Planned bottled volume exceeds final volume. Reduce quantities.</p>
                  <div className="mt-3">
                    <button type="button" onClick={d.balanceBottleEntries} className="px-3 py-2 rounded-md bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium transition-colors">Balance to Final Volume</button>
                  </div>
                </>
              )}
            </div>
            {d.bottleEntries.length > 0 ? (
              <div>
                <div className="grid grid-cols-5 gap-4 px-3 py-2 mb-2">
                  {['Size', 'Quantity', 'Volume', 'LAL', 'Action'].map((h, i) => (
                    <p key={h} className={`text-xs font-medium text-[#777777] uppercase ${i === 4 ? 'text-right' : ''}`}>{h}</p>
                  ))}
                </div>
                <div className="space-y-2">
                  {d.bottleEntries.map((entry, index) => (
                    <BottleEntryRow key={index} entry={entry} finalABV={d.summary.finalABV} onUpdate={(updated) => d.updateBottleEntry(index, updated)} onRemove={() => d.removeBottleEntry(index)} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-[#E5E5E5] p-8 text-center">
                <p className="text-sm text-[#777777]">No bottle sizes added. Click a button above to add bottle sizes.</p>
              </div>
            )}
          </div>
        )}

        {/* Summary Card */}
        {d.selectedBatches.length > 0 && (
          <div className="mb-8"><BottlingSummaryCard summary={d.summary} mode={d.mode} /></div>
        )}

        {/* Save Button */}
        {d.selectedBatches.length > 0 && d.productName && (
          <div className="flex justify-end gap-4">
            <Link href="/dashboard/production" className="px-6 py-3 rounded-md border border-[#E5E5E5] text-[#777777] hover:bg-[#E5E5E5] transition-colors font-medium">Cancel</Link>
            <button onClick={d.saveBottlingRun} className="px-6 py-3 rounded-md bg-[#A65E2E] hover:bg-[#8B4E26] text-white font-medium transition-colors">Save Bottling Run</button>
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
