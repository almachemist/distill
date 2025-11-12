"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { buildRumBatchFallback, type RumBatchSummary } from "@/modules/production/services/batch-fallback.service"
import { RumDetailPanel } from "./RumDetailPanel"

type RumBatchRecord = RumBatchSummary & Record<string, any>

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  try {
    return new Date(value).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  } catch {
    return value
  }
}

function formatNumber(value: number | null | undefined, fraction = 1) {
  if (value === null || value === undefined) return "—"
  return new Intl.NumberFormat("en-AU", { minimumFractionDigits: fraction, maximumFractionDigits: fraction }).format(value)
}

// --- Component: Rum Card ---
const RumCard: React.FC<{
  run: RumBatchRecord
  onSelect: () => void
  isSelected: boolean
}> = ({ run, onSelect, isSelected }) => {
  const heartsVolume = run.hearts_volume_l || 0
  const heartsABV = run.hearts_abv_percent || 0
  const heartsLAL = run.hearts_lal || (heartsVolume * heartsABV / 100)
  
  return (
    <button
      onClick={onSelect}
      className={`bg-white border rounded-xl p-4 flex flex-col gap-3 transition text-left w-full ${
        isSelected ? 'border-amber-700 shadow-md' : 'border-stone-200 hover:border-amber-700'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs uppercase tracking-wide text-stone-400">
            {run.product_name || "Rum"}
          </p>
          <h3 className="text-sm font-semibold text-stone-900">
            {run.batch_id}
          </h3>
        </div>
        <span className="text-xs text-stone-400">{formatDate(run.fermentation_start_date)}</span>
      </div>
      <div>
        <p className="text-[0.6rem] uppercase tracking-wide text-stone-500 mb-1">
          Hearts (most important)
        </p>
        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-semibold text-stone-900">
            {formatNumber(heartsVolume, 1)}
          </p>
          <div className="text-xs text-stone-500 leading-tight">
            <p>{formatNumber(heartsABV, 1)}% ABV</p>
            <p>{formatNumber(heartsLAL, 1)} LAL</p>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center text-xs text-stone-500">
        <p>Still: {run.still_used || "Roberta"}</p>
        {run.cask_number && <p>Cask: {run.cask_number}</p>}
      </div>
    </button>
  )
}

export default function RumPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rumBatches, setRumBatches] = useState<RumBatchRecord[]>(() => buildRumBatchFallback())
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [batchListCollapsed, setBatchListCollapsed] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'ongoing' | 'completed'>('all')

  // Set filter from URL on mount
  useEffect(() => {
    const filter = searchParams.get('filter')
    if (filter === 'ongoing' || filter === 'completed') {
      setStatusFilter(filter)
    }
  }, [searchParams])

  useEffect(() => {
    const controller = new AbortController()

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/production/batches", { signal: controller.signal })
        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || "Failed to load batches")
        }

        const payload: { gin: any[]; rum: RumBatchRecord[] } = await response.json()
        const batches = (payload.rum?.length ?? 0) > 0 ? payload.rum : buildRumBatchFallback()
        setRumBatches(batches)

        // Auto-select first batch if none selected
        if (!selectedRunId && batches.length > 0) {
          setSelectedRunId(batches[0].batch_id)
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        const message = err instanceof Error ? err.message : "Failed to load batches"
        console.error("❌ Error loading rum batches:", err)
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => controller.abort()
  }, [])

  // Filter by status
  const filteredBatches = rumBatches.filter((batch) => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'ongoing') return batch.status === 'in_progress' || batch.status === 'draft'
    if (statusFilter === 'completed') return batch.status === 'completed'
    return true
  })

  // Sort by fermentation start date
  const sortedRuns = [...filteredBatches].sort((a, b) => {
    const dateA = a.fermentation_start_date ? new Date(a.fermentation_start_date).getTime() : 0
    const dateB = b.fermentation_start_date ? new Date(b.fermentation_start_date).getTime() : 0
    return dateB - dateA
  })

  const selectedRun = rumBatches.find((r) => r.batch_id === selectedRunId) || null

  return (
    <div className="h-screen flex flex-col bg-stone-100">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-stone-900">Production Batches</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/dashboard/batches')}
              className="px-4 py-2 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-md text-sm font-medium"
            >
              Gin / Vodka / Ethanol
            </button>
            <button
              className="px-4 py-2 bg-amber-700 text-white rounded-md text-sm font-medium"
            >
              Rum
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className={`border-r border-stone-200 p-6 overflow-auto transition-all ${batchListCollapsed ? 'w-12' : 'w-[28rem]'}`}>
          <div className="flex items-center justify-between mb-4">
            {!batchListCollapsed && (
              <div>
                <h1 className="text-lg font-semibold text-stone-900">
                  Rum Production Runs
                </h1>
                <p className="text-xs text-stone-500 mt-1">Fermentation → Distillation → Barrel</p>
              </div>
            )}
            <button
              onClick={() => setBatchListCollapsed(!batchListCollapsed)}
              className="text-stone-400 hover:text-stone-600 transition"
              title={batchListCollapsed ? "Expand batch list" : "Collapse batch list"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {batchListCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                )}
              </svg>
            </button>
          </div>
          {!batchListCollapsed && (
            <>
              {/* Status Filter Buttons */}
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                    statusFilter === 'all'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('ongoing')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                    statusFilter === 'ongoing'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  Ongoing
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                    statusFilter === 'completed'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  Completed
                </button>
              </div>

              {loading && (
                <div className="mb-4 text-sm text-stone-500">Loading from Supabase...</div>
              )}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="grid gap-4">
                {sortedRuns.length === 0 ? (
                  <p className="text-sm text-stone-400">
                    {statusFilter === 'all'
                      ? 'No rum runs found.'
                      : `No ${statusFilter} batches found.`}
                  </p>
                ) : (
                  sortedRuns.map((run, index) => (
                    <RumCard
                      key={`rum-${index}-${run.batch_id}`}
                      run={run}
                      isSelected={run.batch_id === selectedRunId}
                      onSelect={() => setSelectedRunId(run.batch_id)}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <RumDetailPanel run={selectedRun} onClose={() => setSelectedRunId(null)} />
      </div>
    </div>
  )
}

