"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DetailPanel } from "./DetailPanel"

export const dynamic = 'force-dynamic'

type GinBatchSummary = {
  run_id: string
  batch_id?: string
  recipe?: string | null
  date?: string | null
  still_used?: string | null
  updated_at?: string | null
  status?: string | null
  hearts_volume_l?: number | null
  hearts_abv_percent?: number | null
  hearts_lal?: number | null
  charge_total_volume_l?: number | null
  charge_total_abv_percent?: number | null
  charge_total_lal?: number | null
}
type GinBatchRecord = GinBatchSummary & Record<string, any>

const GIN_CATEGORIES = [
  { id: "dry-season", label: "Dry Season" },
  { id: "ethanol", label: "Ethanol" },
  { id: "merchant", label: "Merchant Mae" },
  { id: "navy", label: "Navy Strength" },
  { id: "rainforest", label: "Rainforest Gin" },
  { id: "signature", label: "Signature Dry Gin" },
  { id: "vodka", label: "Vodka" },
  { id: "wet-season", label: "Wet Season" }
]

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

function resolveGinCategory(batch: GinBatchRecord): string {
  const recipe = batch.recipe || batch.display_name || batch.sku || ""
  const batchId = batch.run_id || batch.batch_id || ""
  const value = (recipe + " " + batchId).toLowerCase()
  
  if (value.includes("signature") || value.includes("-sd-")) return "signature"
  if (value.includes("rainforest") || value.includes("-rf-")) return "rainforest"
  if (value.includes("navy") || value.includes("-ns-")) return "navy"
  if (value.includes("merchant") || value.includes("mae") || value.includes("-mm-")) return "merchant"
  
  // Check for Wet Season - must come before dry season check
  if (value.includes("wet") || value.includes("-ws")) return "wet-season"
  
  // Check for Dry Season - must come before generic "season" check
  if (value.includes("dry season") || value.includes("-dry-")) return "dry-season"
  
  // Oaks Kitchen Gin batches: if they contain "-oaks-" in batch_id and don't have "dry" in name, they're Wet Season
  // This covers batches from wetseason.json: SPIRIT-GIN-OAKS-005, SPIRIT-GIN-OAKS-02, SPIRIT-GIN-OAKS-03, SPIRIT-GIN-OAKS-0X, etc.
  if (value.includes("oaks kitchen") && !value.includes("dry season")) {
    const batchIdLower = batchId.toLowerCase()
    if (batchIdLower.includes("-oaks-") && !batchIdLower.includes("-dry-")) {
      return "wet-season"
    }
  }
  
  // Generic "season" check (but not if already matched above)
  if (value.includes("season")) return "dry-season"
  
  if (value.includes("vodka")) return "vodka"
  if (value.includes("ethanol") || value.includes("liq")) return "ethanol"
  if (value.includes("cane spirit") || value.includes("cane")) return "cane-spirit"
  if (value.includes("trial")) return "trial"
  return "other"
}

// --- Component: Sidebar ---
const Sidebar: React.FC<{
  active: string
  onSelect: (id: string) => void
  isCollapsed: boolean
  onToggle: () => void
}> = ({ active, onSelect, isCollapsed, onToggle }) => {
  return (
    <aside className={`border-r border-stone-200 bg-stone-50 transition-all ${isCollapsed ? 'w-12' : 'w-64'}`}>
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          {!isCollapsed && (
            <h2 className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
              Gin Categories
            </h2>
          )}
          <button
            onClick={onToggle}
            className="text-stone-400 hover:text-stone-600 transition"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>
        {!isCollapsed && (
          <ul className="space-y-1">
            {GIN_CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => onSelect(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                    cat.id === active
                      ? "bg-white shadow-sm text-stone-900 font-medium"
                      : "text-stone-600 hover:bg-white hover:text-stone-900"
                  }`}
                >
                  {cat.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}

// --- Component: Run Card ---
const RunCard: React.FC<{
  run: GinBatchRecord
  onSelect: () => void
}> = ({ run, onSelect }) => {
  const heartsABV = run.hearts_abv_percent ?? 0
  const heartsLAL = run.hearts_lal ?? (run.hearts_volume_l != null && heartsABV > 0 ? run.hearts_volume_l * (heartsABV / 100) : 0)
  const heartsVolume = run.hearts_volume_l ?? (heartsLAL != null && heartsABV > 0 ? heartsLAL / (heartsABV / 100) : 0)
  const chargeVolume = run.charge_total_volume_l ?? 0
  const chargeABV = run.charge_total_abv_percent ?? 0

  // Determine status badge
  const status = run.status || 'completed'
  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-300' },
    finalized: { label: 'Finalized', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' }
  }
  const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.completed

  return (
    <button
      onClick={onSelect}
      className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-3 hover:border-amber-700 transition text-left w-full"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs uppercase tracking-wide text-stone-400">
              {run.recipe || run.display_name || run.sku}
            </p>
            <span className={`text-[0.65rem] px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-stone-900">
            {run.run_id || run.batch_id}
          </h3>
        </div>
        <span className="text-xs text-stone-400">{formatDate(run.date)}</span>
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
        <p>Still: {run.still_used || "Carrie"}</p>
        <p>Charge: {formatNumber(chargeVolume, 0)} L @ {formatNumber(chargeABV, 1)}%</p>
      </div>
    </button>
  )
}

function BatchesPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedBatchId = searchParams?.get('batch') ?? null
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ginBatches, setGinBatches] = useState<GinBatchRecord[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("rainforest")
  const [selectedRunId, setSelectedRunId] = useState<string | null>(requestedBatchId)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [batchListCollapsed, setBatchListCollapsed] = useState(false)
  const [sortOrder, setSortOrder] = useState<'oldest-first' | 'newest-first'>('oldest-first')

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

        const payload: { gin: GinBatchRecord[]; rum: any[] } = await response.json()
        const batches = payload.gin ?? []
        setGinBatches(batches)
        
        // Auto-select first batch if none selected
        if (!selectedRunId && batches.length > 0) {
          const firstBatch = batches[0]
          setSelectedRunId(firstBatch.run_id ?? firstBatch.batch_id ?? null)
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        const message = err instanceof Error ? err.message : "Failed to load batches"
        console.error("❌ Error loading batches:", err)
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => controller.abort()
  }, [])

  // Filter batches by category and sort by date
  const filteredRuns = ginBatches
    .filter((batch) => resolveGinCategory(batch) === activeCategory)
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0
      const dateB = b.date ? new Date(b.date).getTime() : 0

      if (sortOrder === 'oldest-first') {
        return dateA - dateB // Oldest first
      } else {
        return dateB - dateA // Newest first
      }
    })

  const selectedRun = ginBatches.find((r) => (r.run_id || r.batch_id) === selectedRunId) || null

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-stone-100 scrollbar-hide">
      {/* Top Navigation Bar */}
      <div className="mx-2 mt-2 mb-2 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-stone-900">Production Batches</h1>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-amber-700 text-white rounded-md text-sm font-medium"
            >
              Gin / Vodka / Ethanol
            </button>
            <button
              onClick={() => router.push('/dashboard/production/rum')}
              className="px-4 py-2 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-md text-sm font-medium"
            >
              Rum
            </button>
            <button
              onClick={() => router.push('/dashboard/batches/old-roberta')}
              className="px-4 py-2 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-md text-sm font-medium"
            >
              Old Roberta
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          active={activeCategory}
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onSelect={(id) => {
            setActiveCategory(id)
            const first = ginBatches.find(r => resolveGinCategory(r) === id)
            setSelectedRunId(first ? (first.run_id ?? first.batch_id ?? null) : null)
          }}
        />
      <main className="flex-1 flex">
        <div className={`border-r border-stone-200 p-6 overflow-auto transition-all ${batchListCollapsed ? 'w-12' : 'w-[28rem]'}`}>
          <div className="flex items-center justify-between mb-4">
            {!batchListCollapsed && (
              <h1 className="text-lg font-semibold text-stone-900">
                Gin Batches
              </h1>
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
          )}
          {!batchListCollapsed && (
            <>
              {loading && (
                <div className="mb-4 text-sm text-stone-500">Loading from Supabase...</div>
              )}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="grid gap-4">
                {filteredRuns.length === 0 ? (
                  <p className="text-sm text-stone-400">No runs for this category.</p>
                ) : (
                  filteredRuns.map((run) => (
                    <RunCard
                      key={run.run_id || run.batch_id}
                      run={run}
                      onSelect={() =>
                        setSelectedRunId(run.run_id ?? run.batch_id ?? null)
                      }
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>
        <DetailPanel run={selectedRun} onClose={() => setSelectedRunId(null)} />
      </main>
      </div>
    </div>
  )
}

export default function BatchesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper" /></div>}>
      <BatchesPageInner />
    </Suspense>
  )
}
