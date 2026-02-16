"use client"

import { useEffect, useRef, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { RumDetailPanel } from "./RumDetailPanel"

type RumBatchSummary = {
  batch_id: string
  product_name: string | null
  product_type?: string | null
  status?: string | null
  still_used: string | null
  fermentation_start_date: string | null
  distillation_date: string | null
  hearts_volume_l: number | null
  hearts_abv_percent: number | null
  hearts_lal: number | null
  fill_date?: string | null
  cask_number: string | null
}
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
  const router = useRouter()
  const toDomId = (value: any) => {
    const raw = String(value ?? '').trim()
    if (!raw) return ''
    return raw.replace(/[^A-Za-z0-9_-]/g, '_')
  }
  const asNum = (v: any): number | null => {
    if (v === null || v === undefined) return null
    if (typeof v === 'number') return Number.isFinite(v) ? v : null
    const m = String(v).match(/-?\d+(\.\d+)?/)
    if (!m) return null
    const n = Number(m[0])
    return Number.isFinite(n) ? n : null
  }
  const nonZero = (v: any): number | null => {
    const n = asNum(v)
    if (n === null) return null
    return n > 0 ? n : null
  }

  const heartsVolume = nonZero(run.hearts_volume_l)
  const heartsABV = nonZero(run.hearts_abv_percent)
  const heartsLAL = nonZero(run.hearts_lal)

  const heartsLALComputed = (heartsLAL ?? (
    heartsVolume != null && heartsABV != null
      ? heartsVolume * (heartsABV / 100)
      : null
  ))
  const heartsABVComputed = (heartsABV ?? (
    heartsVolume != null && heartsVolume > 0 && heartsLALComputed != null
      ? (heartsLALComputed / heartsVolume) * 100
      : null
  ))
  const productName = (run.product_name || 'Rum').replace(/\s+—\s+.*/g, '').trim()
  const label = `Rum batch ${run.batch_id}, status ${run.status || '—'}, still ${run.still_used || '—'}, fermentation ${formatDate(run.fermentation_start_date)}, distillation ${formatDate(run.distillation_date)}, hearts ${formatNumber(heartsVolume, 1)} L, ${formatNumber(heartsABVComputed, 1)}% ABV`
  
  return (
    <div
      id={run?.batch_id ? `rum-batch-card-${toDomId(run.batch_id)}` : undefined}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      aria-label={label}
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
            <p>{formatNumber(heartsABVComputed, 1)}% ABV</p>
            <p>{formatNumber(heartsLALComputed, 1)} LAL</p>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center text-xs text-stone-500">
        <p>Still: {run.still_used || "Roberta"}</p>
        {run.cask_number && <p>Cask: {run.cask_number}</p>}
      </div>
      <div className="pt-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            const params = new URLSearchParams({
              spiritType: productName,
              volume: String(heartsVolume || 0),
              bottleSize: String(750),
            })
            router.push(`/dashboard/production/bottling?${params.toString()}`)
          }}
          className="inline-flex items-center rounded-md bg-amber-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-amber-700 transition-colors"
        >
          Bottle
        </button>
      </div>
    </div>
  )
}

function RumPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams() as URLSearchParams | null
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rumBatches, setRumBatches] = useState<RumBatchRecord[]>([])
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [requestedBatchId, setRequestedBatchId] = useState<string | null>(null)
  const [batchListCollapsed, setBatchListCollapsed] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'ongoing' | 'completed'>('all')
  const [sortOrder, setSortOrder] = useState<'oldest-first' | 'newest-first'>('oldest-first')

  const lastRequestedRef = useRef<string>('')
  const appliedRequestedRef = useRef<boolean>(false)

  const toDomId = (value: any) => {
    const raw = String(value ?? '').trim()
    if (!raw) return ''
    return raw.replace(/[^A-Za-z0-9_-]/g, '_')
  }

  const normalizeBatchId = (value: string) => {
    const raw = String(value ?? '').trim()
    if (!raw) return ''
    // Handle user-friendly IDs like RUM-24-8 -> RUM-24-008 (3-digit suffix)
    const m = raw.match(/^(RUM)-(\d{2,4})-(\d{1,3})$/i)
    if (m) {
      const prefix = m[1].toUpperCase()
      const year = m[2]
      const n = parseInt(m[3], 10)
      if (Number.isFinite(n)) {
        const suffix = String(n).padStart(3, '0')
        return `${prefix}-${year}-${suffix}`
      }
    }
    return raw
  }

  const normalizeForCompare = (value: any) => {
    const raw = String(value ?? '').trim().toUpperCase().replace(/\s+/g, '').replace(/\//g, '-')
    return normalizeBatchId(raw)
  }

  // Set filter from URL on mount
  useEffect(() => {
    const filter = searchParams?.get('filter')
    if (filter === 'ongoing' || filter === 'completed') {
      setStatusFilter(filter)
    }
  }, [searchParams])

  // Select a specific batch from URL (?batch=RUM-24-5)
  useEffect(() => {
    const batch = searchParams?.get('batch')
    const trimmed = String(batch ?? '').trim()
    if (!trimmed) {
      setRequestedBatchId(null)
      lastRequestedRef.current = ''
      appliedRequestedRef.current = false
      return
    }
    const normalized = normalizeBatchId(trimmed)
    setRequestedBatchId(normalized)
    if (lastRequestedRef.current !== normalized) {
      lastRequestedRef.current = normalized
      appliedRequestedRef.current = false
    }
  }, [searchParams])

  useEffect(() => {
    const id = requestedBatchId || selectedRunId
    if (!id) return
    const el = document.getElementById(`rum-batch-card-${toDomId(id)}`)
    if (el) {
      el.scrollIntoView({ block: 'center' })
    }
  }, [requestedBatchId, selectedRunId])

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
        const batches = payload.rum ?? []
        setRumBatches(batches)

        // If no requested batch was provided, auto-select first
        if (!requestedBatchId && !selectedRunId && batches.length > 0) {
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

  useEffect(() => {
    if (!requestedBatchId) return
    if (!rumBatches.length) return
    if (appliedRequestedRef.current) return
    const wanted = normalizeForCompare(requestedBatchId)
    const match = rumBatches.find((b) => normalizeForCompare(b?.batch_id) === wanted)
    if (match && match.batch_id && selectedRunId !== match.batch_id) {
      setSelectedRunId(match.batch_id)
      appliedRequestedRef.current = true
    }
  }, [requestedBatchId, rumBatches])

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

    if (sortOrder === 'oldest-first') {
      return dateA - dateB // Oldest first
    } else {
      return dateB - dateA // Newest first
    }
  })

  const selectedRun = rumBatches.find((r) => r.batch_id === selectedRunId) || null

  const handleDeleteBatch = async () => {
    // Refresh the batch list after deletion
    try {
      const response = await fetch("/api/production/batches")
      if (response.ok) {
        const payload: { gin: any[]; rum: RumBatchRecord[] } = await response.json()
        const batches = payload.rum ?? []
        setRumBatches(batches)
        setSelectedRunId(null)
      }
    } catch (err) {
      console.error("Error refreshing batches after delete:", err)
    }
  }

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

              {/* Sort Order Dropdown */}
              <div className="mb-4">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'oldest-first' | 'newest-first')}
                  className="w-full text-sm border border-stone-200 rounded-md px-3 py-2 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="oldest-first">Oldest first (A→Z by date)</option>
                  <option value="newest-first">Newest first (Z→A by date)</option>
                </select>
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

        <RumDetailPanel
          run={selectedRun}
          onClose={() => setSelectedRunId(null)}
          onDelete={handleDeleteBatch}
        />
      </div>
    </div>
  )
}

export default function RumPage() {
  return (
    <Suspense fallback={<div className="h-screen flex flex-col bg-stone-100" />}> 
      <RumPageContent />
    </Suspense>
  )
}
