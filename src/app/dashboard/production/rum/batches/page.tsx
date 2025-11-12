"use client"

import { useState } from 'react'
import { rumBatchesDataset } from '@/modules/production/data/rum-batches.dataset'
import type { RumProductionRunDB } from '@/modules/production/types/rum-production.types'

type TabType = 'fermentation' | 'distillation' | 'cask' | 'graphs'

export default function RumBatchesPage() {
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('fermentation')

  const toggleBatch = (batchId: string) => {
    setExpandedBatch(expandedBatch === batchId ? null : batchId)
    setActiveTab('fermentation')
  }

  const getStatusBadge = (batch: RumProductionRunDB) => {
    if (batch.fill_date && batch.distillation_date && batch.fermentation_start_date) {
      return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">✅ Barreled</span>
    }
    if (batch.distillation_date && batch.fermentation_start_date) {
      return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">🔥 Distilled</span>
    }
    if (batch.fermentation_start_date) {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">🧪 In Fermentation</span>
    }
    return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">New</span>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-graphite mb-2">Rum Production Batches</h1>
          <p className="text-graphite/70">
            Complete fermentation → double retort distillation → cask filling cycles
          </p>
          <p className="text-sm text-graphite/60 mt-2">
            Still: <span className="font-mono font-medium text-copper">Roberta (Double Retort)</span>
          </p>
        </div>

        {/* Batch Cards */}
        <div className="space-y-4">
          {rumBatchesDataset.map((batch) => (
            <div key={batch.batch_id} className="bg-white rounded-xl border border-copper-15 shadow-sm overflow-hidden">
              {/* Collapsed Header */}
              <button
                onClick={() => toggleBatch(batch.batch_id)}
                className="w-full p-6 hover:bg-beige/50 transition-colors text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h2 className="text-xl font-bold text-graphite">{batch.batch_id}</h2>
                      <span className="text-lg text-graphite/70">{batch.product_name}</span>
                      {getStatusBadge(batch)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm mt-4">
                      <div>
                        <div className="text-graphite/60">Date</div>
                        <div className="font-medium text-graphite">{formatDate(batch.fermentation_start_date)}</div>
                      </div>
                      
                      <div>
                        <div className="text-graphite/60">Fermentation LAL</div>
                        <div className="font-medium text-graphite">{batch.boiler_lal?.toFixed(1) || '—'} L</div>
                      </div>
                      
                      <div>
                        <div className="text-graphite/60">Hearts LAL</div>
                        <div className="font-medium text-copper">{batch.hearts_lal?.toFixed(1) || '—'} L</div>
                      </div>
                      
                      <div>
                        <div className="text-graphite/60">Yield %</div>
                        <div className="font-medium text-graphite">{batch.heart_yield_percent?.toFixed(1) || '—'}%</div>
                      </div>
                      
                      <div>
                        <div className="text-graphite/60">Cask #</div>
                        <div className="font-medium text-graphite">{batch.cask_number || '—'}</div>
                      </div>
                      
                      <div>
                        <div className="text-graphite/60">Cask ABV</div>
                        <div className="font-medium text-graphite">{batch.fill_abv_percent?.toFixed(1) || '—'}%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <svg 
                      className={`w-6 h-6 text-graphite/60 transition-transform ${expandedBatch === batch.batch_id ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              {expandedBatch === batch.batch_id && (
                <div className="border-t border-copper-15">
                  {/* Tabs */}
                  <div className="flex gap-1 px-6 pt-4 border-b border-copper-15">
                    {(['fermentation', 'distillation', 'cask', 'graphs'] as TabType[]).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium capitalize transition-colors rounded-t-lg ${
                          activeTab === tab
                            ? 'bg-white text-copper border-t-2 border-x-2 border-copper'
                            : 'text-graphite/60 hover:text-graphite hover:bg-beige/50'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {activeTab === 'fermentation' && (
                      <FermentationTab batch={batch} />
                    )}
                    
                    {activeTab === 'distillation' && (
                      <DistillationTab batch={batch} />
                    )}
                    
                    {activeTab === 'cask' && (
                      <CaskTab batch={batch} />
                    )}
                    
                    {activeTab === 'graphs' && (
                      <GraphsTab batch={batch} />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Fermentation Tab Component
function FermentationTab({ batch }: { batch: RumProductionRunDB }) {
  return (
    <div className="space-y-6">
      {/* Substrate */}
      <div>
        <h3 className="text-lg font-semibold text-graphite mb-3">Substrate</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-graphite/60">Type</div>
            <div className="font-medium text-graphite">{batch.substrate_type}</div>
          </div>
          <div>
            <div className="text-graphite/60">Batch</div>
            <div className="font-medium text-graphite">{batch.substrate_batch || '—'}</div>
          </div>
          <div>
            <div className="text-graphite/60">Substrate Mass</div>
            <div className="font-medium text-graphite">{batch.substrate_mass_kg} kg</div>
          </div>
          <div>
            <div className="text-graphite/60">Water</div>
            <div className="font-medium text-graphite">{batch.water_mass_kg} kg</div>
          </div>
          <div>
            <div className="text-graphite/60">Initial Brix</div>
            <div className="font-medium text-graphite">{batch.initial_brix}</div>
          </div>
          <div>
            <div className="text-graphite/60">Initial pH</div>
            <div className="font-medium text-graphite">{batch.initial_ph}</div>
          </div>
        </div>
      </div>

      {/* Dunder */}
      {batch.dunder_added && (
        <div>
          <h3 className="text-lg font-semibold text-graphite mb-3">Dunder</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-graphite/60">Type</div>
              <div className="font-medium text-graphite capitalize">{batch.dunder_type}</div>
            </div>
            <div>
              <div className="text-graphite/60">Volume</div>
              <div className="font-medium text-graphite">{batch.dunder_volume_l} L</div>
            </div>
            {batch.dunder_ph && (
              <div>
                <div className="text-graphite/60">pH</div>
                <div className="font-medium text-graphite">{batch.dunder_ph}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Yeast */}
      <div>
        <h3 className="text-lg font-semibold text-graphite mb-3">Yeast</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-graphite/60">Type</div>
            <div className="font-medium text-graphite">{batch.yeast_type}</div>
          </div>
          <div>
            <div className="text-graphite/60">Mass</div>
            <div className="font-medium text-graphite">{batch.yeast_mass_g} g</div>
          </div>
          <div>
            <div className="text-graphite/60">Rehydration Temp</div>
            <div className="font-medium text-graphite">{batch.yeast_rehydration_temp_c} °C</div>
          </div>
          <div>
            <div className="text-graphite/60">Rehydration Time</div>
            <div className="font-medium text-graphite">{batch.yeast_rehydration_time_min} min</div>
          </div>
        </div>
      </div>

      {/* Fermentation Curves */}
      <div>
        <h3 className="text-lg font-semibold text-graphite mb-3">Fermentation Progress</h3>
        <div className="grid grid-cols-3 gap-6">
          {/* Temperature */}
          <div>
            <h4 className="font-medium text-graphite mb-2">Temperature (°C)</h4>
            <div className="space-y-1 text-sm">
              {Object.entries(batch.temperature_curve || {}).map(([time, value]) => (
                <div key={time} className="flex justify-between">
                  <span className="text-graphite/60">{time}</span>
                  <span className="font-medium text-graphite">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Brix */}
          <div>
            <h4 className="font-medium text-graphite mb-2">Brix</h4>
            <div className="space-y-1 text-sm">
              {Object.entries(batch.brix_curve || {}).map(([time, value]) => (
                <div key={time} className="flex justify-between">
                  <span className="text-graphite/60">{time}</span>
                  <span className="font-medium text-graphite">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* pH */}
          <div>
            <h4 className="font-medium text-graphite mb-2">pH</h4>
            <div className="space-y-1 text-sm">
              {Object.entries(batch.ph_curve || {}).map(([time, value]) => (
                <div key={time} className="flex justify-between">
                  <span className="text-graphite/60">{time}</span>
                  <span className="font-medium text-graphite">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Final Readings */}
      <div className="bg-copper-10 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-graphite mb-3">Final Readings</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-graphite/60">Duration</div>
            <div className="font-medium text-graphite">{batch.fermentation_duration_hours} hours</div>
          </div>
          <div>
            <div className="text-graphite/60">Final Brix</div>
            <div className="font-medium text-graphite">{batch.final_brix}</div>
          </div>
          <div>
            <div className="text-graphite/60">Final pH</div>
            <div className="font-medium text-graphite">{batch.final_ph}</div>
          </div>
          <div>
            <div className="text-graphite/60">Final ABV</div>
            <div className="font-medium text-copper">{batch.final_abv_percent}%</div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {batch.fermentation_notes && (
        <div>
          <h3 className="text-lg font-semibold text-graphite mb-2">Notes</h3>
          <p className="text-sm text-graphite/80 italic">{batch.fermentation_notes}</p>
        </div>
      )}
    </div>
  )
}

// Distillation Tab Component
function DistillationTab({ batch }: { batch: RumProductionRunDB }) {
  return (
    <div className="space-y-6">
      {/* Vessels */}
      <div>
        <h3 className="text-lg font-semibold text-graphite mb-3">Vessel Configuration</h3>
        <div className="grid grid-cols-3 gap-4">
          {/* Boiler */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Boiler (Wash)</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Volume</span>
                <span className="font-medium text-blue-900">{batch.boiler_volume_l} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">ABV</span>
                <span className="font-medium text-blue-900">{batch.boiler_abv_percent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">LAL</span>
                <span className="font-medium text-blue-900">{batch.boiler_lal?.toFixed(1)} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Elements</span>
                <span className="font-medium text-blue-900 text-xs">{batch.boiler_elements}</span>
              </div>
            </div>
          </div>

          {/* Retort 1 */}
          <div className="bg-amber-50 rounded-lg p-4">
            <h4 className="font-medium text-amber-900 mb-2">Retort 1 (Late Tails)</h4>
            <div className="space-y-1 text-sm">
              <div className="text-xs text-amber-700 mb-2">{batch.retort1_content}</div>
              <div className="flex justify-between">
                <span className="text-amber-700">Volume</span>
                <span className="font-medium text-amber-900">{batch.retort1_volume_l} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">ABV</span>
                <span className="font-medium text-amber-900">{batch.retort1_abv_percent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">LAL</span>
                <span className="font-medium text-amber-900">{batch.retort1_lal?.toFixed(1)} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">Elements</span>
                <span className="font-medium text-amber-900 text-xs">{batch.retort1_elements}</span>
              </div>
            </div>
          </div>

          {/* Retort 2 */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h4 className="font-medium text-orange-900 mb-2">Retort 2 (Early Tails)</h4>
            <div className="space-y-1 text-sm">
              <div className="text-xs text-orange-700 mb-2">{batch.retort2_content}</div>
              <div className="flex justify-between">
                <span className="text-orange-700">Volume</span>
                <span className="font-medium text-orange-900">{batch.retort2_volume_l} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700">ABV</span>
                <span className="font-medium text-orange-900">{batch.retort2_abv_percent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700">LAL</span>
                <span className="font-medium text-orange-900">{batch.retort2_lal?.toFixed(1)} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700">Elements</span>
                <span className="font-medium text-orange-900 text-xs">{batch.retort2_elements}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cuts Table */}
      <div>
        <h3 className="text-lg font-semibold text-graphite mb-3">Cuts</h3>
        <table className="w-full text-sm">
          <thead className="border-b-2 border-copper-30">
            <tr className="text-left">
              <th className="py-2 px-3 font-medium text-graphite">Time</th>
              <th className="py-2 px-3 font-medium text-graphite">Phase</th>
              <th className="py-2 px-3 font-medium text-graphite text-right">Vol (L)</th>
              <th className="py-2 px-3 font-medium text-graphite text-right">ABV %</th>
              <th className="py-2 px-3 font-medium text-graphite text-right">LAL</th>
              <th className="py-2 px-3 font-medium text-graphite">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-copper-15">
            {/* Foreshots */}
            <tr>
              <td className="py-2 px-3">{batch.foreshots_time}</td>
              <td className="py-2 px-3">Foreshots</td>
              <td className="py-2 px-3 text-right">—</td>
              <td className="py-2 px-3 text-right">{batch.foreshots_abv_percent}%</td>
              <td className="py-2 px-3 text-right">—</td>
              <td className="py-2 px-3 text-xs text-graphite/60">{batch.foreshots_notes}</td>
            </tr>

            {/* Heads */}
            <tr>
              <td className="py-2 px-3">{batch.heads_time}</td>
              <td className="py-2 px-3">Heads</td>
              <td className="py-2 px-3 text-right">{batch.heads_volume_l}</td>
              <td className="py-2 px-3 text-right">{batch.heads_abv_percent}%</td>
              <td className="py-2 px-3 text-right">{batch.heads_lal?.toFixed(2)}</td>
              <td className="py-2 px-3 text-xs text-graphite/60">{batch.heads_notes}</td>
            </tr>

            {/* Hearts */}
            <tr className="bg-copper-10">
              <td className="py-2 px-3 font-medium">{batch.hearts_time}</td>
              <td className="py-2 px-3 font-medium text-copper">Hearts</td>
              <td className="py-2 px-3 text-right font-bold text-copper">{batch.hearts_volume_l}</td>
              <td className="py-2 px-3 text-right font-bold text-copper">{batch.hearts_abv_percent}%</td>
              <td className="py-2 px-3 text-right font-bold text-copper">{batch.hearts_lal?.toFixed(2)}</td>
              <td className="py-2 px-3 text-xs text-graphite/80">{batch.hearts_notes}</td>
            </tr>

            {/* Tails (multi-part) */}
            {(batch.tails_segments || []).map((tail: any, idx: number) => (
              <tr key={idx}>
                <td className="py-2 px-3">{tail.time}</td>
                <td className="py-2 px-3">Tails {idx + 1}</td>
                <td className="py-2 px-3 text-right">{tail.volume_l}</td>
                <td className="py-2 px-3 text-right">{tail.abv_percent}%</td>
                <td className="py-2 px-3 text-right">{tail.lal?.toFixed(2)}</td>
                <td className="py-2 px-3 text-xs text-graphite/60">{tail.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Yield Summary */}
      <div className="bg-gradient-to-br from-copper-10 to-copper-20 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-graphite mb-3">Yield Summary</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-graphite/60">Total Input LAL</div>
            <div className="font-bold text-graphite">{batch.total_lal_start?.toFixed(2)} L</div>
          </div>
          <div>
            <div className="text-graphite/60">Output LAL</div>
            <div className="font-bold text-graphite">{batch.total_lal_end?.toFixed(2)} L</div>
          </div>
          <div>
            <div className="text-graphite/60">Heart Yield</div>
            <div className="font-bold text-copper">{batch.heart_yield_percent?.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-graphite/60">LAL Loss</div>
            <div className="font-medium text-graphite">{batch.lal_loss?.toFixed(2)} L</div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {batch.distillation_notes && (
        <div>
          <h3 className="text-lg font-semibold text-graphite mb-2">Notes</h3>
          <p className="text-sm text-graphite/80 italic">{batch.distillation_notes}</p>
        </div>
      )}
    </div>
  )
}

// Cask Tab Component
function CaskTab({ batch }: { batch: RumProductionRunDB }) {
  if (!batch.fill_date) {
    return (
      <div className="text-center py-12 text-graphite/60">
        <p>Not yet casked</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div>
          <div className="text-sm text-graphite/60 mb-1">Fill Date</div>
          <div className="font-medium text-graphite">{new Date(batch.fill_date).toLocaleDateString('en-AU')}</div>
        </div>
        
        <div>
          <div className="text-sm text-graphite/60 mb-1">Cask Number</div>
          <div className="font-bold text-copper text-xl">{batch.cask_number}</div>
        </div>
        
        <div>
          <div className="text-sm text-graphite/60 mb-1">Origin</div>
          <div className="font-medium text-graphite">{batch.cask_origin}</div>
        </div>
        
        <div>
          <div className="text-sm text-graphite/60 mb-1">Type</div>
          <div className="font-medium text-graphite">{batch.cask_type || '—'}</div>
        </div>
        
        <div>
          <div className="text-sm text-graphite/60 mb-1">Size</div>
          <div className="font-medium text-graphite">{batch.cask_size_l || '—'} L</div>
        </div>
        
        <div>
          <div className="text-sm text-graphite/60 mb-1">Location</div>
          <div className="font-medium text-graphite">{batch.maturation_location || '—'}</div>
        </div>
      </div>

      <div className="bg-copper-10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-graphite mb-4">Fill Details</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-graphite/60 mb-1">Volume Filled</div>
            <div className="font-bold text-copper text-2xl">{batch.volume_filled_l} L</div>
          </div>
          
          <div>
            <div className="text-sm text-graphite/60 mb-1">Fill ABV</div>
            <div className="font-bold text-copper text-2xl">{batch.fill_abv_percent}%</div>
          </div>
          
          <div>
            <div className="text-sm text-graphite/60 mb-1">LAL Filled</div>
            <div className="font-bold text-copper text-2xl">{batch.lal_filled?.toFixed(2)} L</div>
          </div>
        </div>
      </div>

      {batch.expected_bottling_date && (
        <div>
          <div className="text-sm text-graphite/60 mb-1">Expected Bottling Date</div>
          <div className="font-medium text-graphite">{new Date(batch.expected_bottling_date).toLocaleDateString('en-AU')}</div>
        </div>
      )}
    </div>
  )
}

// Graphs Tab Component (placeholder for now)
function GraphsTab({ batch }: { batch: RumProductionRunDB }) {
  return (
    <div className="text-center py-12 text-graphite/60">
      <p className="mb-2">📈 Graphs coming soon</p>
      <p className="text-sm">Brix, pH, and Temperature curves will be displayed here</p>
    </div>
  )
}

