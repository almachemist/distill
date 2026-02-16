"use client"

import { useState } from 'react'
import { useRumBatches } from '@/modules/production/hooks/useRumBatches'
import { FermentationTab } from './tabs/FermentationTab'
import { DistillationTab } from './tabs/DistillationTab'
import { CaskTab } from './tabs/CaskTab'

type TabType = 'fermentation' | 'distillation' | 'cask' | 'graphs'
type RumBatchLegacy = any

export default function RumBatchesPage() {
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('fermentation')
  const { data: batches = [], isLoading, error } = useRumBatches()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A65E2E]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Failed to load rum batches: {(error as Error).message}</p>
      </div>
    )
  }

  const toggleBatch = (batchId: string) => {
    setExpandedBatch(expandedBatch === batchId ? null : batchId)
    setActiveTab('fermentation')
  }

  const getStatusBadge = (batch: RumBatchLegacy) => {
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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-graphite mb-2">Rum Production Batches</h1>
          <p className="text-graphite/70">Complete fermentation → double retort distillation → cask filling cycles</p>
          <p className="text-sm text-graphite/60 mt-2">Still: <span className="font-mono font-medium text-copper">Roberta (Double Retort)</span></p>
        </div>

        {/* Batch Cards */}
        <div className="space-y-4">
          {batches.map((batch: RumBatchLegacy) => (
            <div key={batch.batch_id} className="bg-white rounded-xl border border-copper-15 shadow-sm overflow-hidden">
              <button onClick={() => toggleBatch(batch.batch_id)} className="w-full p-6 hover:bg-beige/50 transition-colors text-left">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h2 className="text-xl font-bold text-graphite">{batch.batch_id}</h2>
                      <span className="text-lg text-graphite/70">{batch.product_name}</span>
                      {getStatusBadge(batch)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm mt-4">
                      <div><div className="text-graphite/60">Date</div><div className="font-medium text-graphite">{formatDate(batch.fermentation_start_date)}</div></div>
                      <div><div className="text-graphite/60">Fermentation LAL</div><div className="font-medium text-graphite">{batch.boiler_lal?.toFixed(1) || '—'} L</div></div>
                      <div><div className="text-graphite/60">Hearts LAL</div><div className="font-medium text-copper">{batch.hearts_lal?.toFixed(1) || '—'} L</div></div>
                      <div><div className="text-graphite/60">Yield %</div><div className="font-medium text-graphite">{batch.heart_yield_percent?.toFixed(1) || '—'}%</div></div>
                      <div><div className="text-graphite/60">Cask #</div><div className="font-medium text-graphite">{batch.cask_number || '—'}</div></div>
                      <div><div className="text-graphite/60">Cask ABV</div><div className="font-medium text-graphite">{batch.fill_abv_percent?.toFixed(1) || '—'}%</div></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <svg className={`w-6 h-6 text-graphite/60 transition-transform ${expandedBatch === batch.batch_id ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {expandedBatch === batch.batch_id && (
                <div className="border-t border-copper-15">
                  <div className="flex gap-1 px-6 pt-4 border-b border-copper-15">
                    {(['fermentation', 'distillation', 'cask', 'graphs'] as TabType[]).map((tab) => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium capitalize transition-colors rounded-t-lg ${activeTab === tab ? 'bg-white text-copper border-t-2 border-x-2 border-copper' : 'text-graphite/60 hover:text-graphite hover:bg-beige/50'}`}>
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="p-6">
                    {activeTab === 'fermentation' && <FermentationTab batch={batch} />}
                    {activeTab === 'distillation' && <DistillationTab batch={batch} />}
                    {activeTab === 'cask' && <CaskTab batch={batch} />}
                    {activeTab === 'graphs' && <GraphsTab />}
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

function GraphsTab() {
  return (
    <div className="text-center py-12 text-graphite/60">
      <p className="mb-2">📈 Graphs coming soon</p>
      <p className="text-sm">Brix, pH, and Temperature curves will be displayed here</p>
    </div>
  )
}
