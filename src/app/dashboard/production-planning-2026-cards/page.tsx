'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Batch {
  product: string
  batch_number: number
  total_batches: number
  bottles_700ml: number
  bottles_200ml: number
  total_bottles: number
  production_type: string
  scheduled_month: number
  scheduled_month_name: string
}

interface MaterialNeed {
  name: string
  category: string
  needed: number
  current_stock: number
  shortage: number
  stock_after: number
  status: 'CRITICAL' | 'LOW' | 'ADEQUATE' | 'GOOD'
  uom: string
}

interface BatchWithMaterials extends Batch {
  materials: MaterialNeed[]
  botanicals: MaterialNeed[]
  packaging: MaterialNeed[]
}

// Gin recipes - botanicals per batch
const GIN_RECIPES: Record<string, { name: string; weight_g: number }[]> = {
  'Rainforest Gin': [
    { name: 'Juniper Berries', weight_g: 6360 },
    { name: 'Coriander Seed', weight_g: 1410 },
    { name: 'Angelica Root', weight_g: 175 },
    { name: 'Cassia', weight_g: 25 },
    { name: 'Lemon Myrtle', weight_g: 141 },
    { name: 'Lemon Aspen', weight_g: 71 },
    { name: 'Grapefruit Peel', weight_g: 567 },
    { name: 'Macadamia', weight_g: 102 },
    { name: 'Orris Root', weight_g: 71 },
  ],
  'Signature Dry Gin (Traditional)': [
    { name: 'Juniper Berries', weight_g: 6400 },
    { name: 'Coriander Seed', weight_g: 1800 },
    { name: 'Angelica Root', weight_g: 180 },
    { name: 'Orris Root', weight_g: 90 },
    { name: 'Orange Peel', weight_g: 560 },
    { name: 'Lemon Peel', weight_g: 560 },
    { name: 'Macadamia', weight_g: 180 },
    { name: 'Liquorice', weight_g: 100 },
    { name: 'Cardamom', weight_g: 150 },
    { name: 'Lavender', weight_g: 100 },
  ],
  'Merchant Mae Gin': [
    { name: 'Juniper Berries', weight_g: 6400 },
    { name: 'Coriander Seed', weight_g: 1800 },
    { name: 'Angelica Root', weight_g: 180 },
    { name: 'Orris Root', weight_g: 50 },
    { name: 'Orange Peel', weight_g: 380 },
    { name: 'Lemon Peel', weight_g: 380 },
    { name: 'Liquorice', weight_g: 100 },
    { name: 'Cardamom', weight_g: 150 },
    { name: 'Chamomile', weight_g: 50 },
  ],
}

export default function ProductionPlanning2026CardsPage() {
  const [batches, setBatches] = useState<BatchWithMaterials[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStock, setCurrentStock] = useState<Map<string, number>>(new Map())
  const [purchaseItems, setPurchaseItems] = useState<Array<{ name: string; category: string; uom: string; shortage: number }>>([])
  const [purchaseCsvUri, setPurchaseCsvUri] = useState<string | null>(null)
  const [botanicalsCsvUri, setBotanicalsCsvUri] = useState<string | null>(null)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

  const getMonthStats = (monthName: string) => {
    const items = aggregateShortagesForMonth(batches, monthName)
    const shortage = items.reduce((sum, i) => sum + i.shortage, 0)
    return { count: items.length, shortage }
  }

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()

        // Load production plan
        const response = await fetch('/production_plan_2026_v4.json')
        const plan = await response.json()

        // Load current inventory - OPTIMIZED: Get all items and all transactions in 2 queries
        const { data: items } = await supabase.from('items').select('id, name, category, default_uom')
        const { data: allTxns } = await supabase.from('inventory_txns').select('item_id, quantity, txn_type')

        const stockMap = new Map<string, number>()

        if (items && allTxns) {
          // Group transactions by item_id
          const txnsByItem = new Map<string, typeof allTxns>()
          for (const txn of allTxns) {
            if (!txnsByItem.has(txn.item_id)) {
              txnsByItem.set(txn.item_id, [])
            }
            txnsByItem.get(txn.item_id)!.push(txn)
          }

          // Calculate stock for each item
          for (const item of items) {
            const txns = txnsByItem.get(item.id) || []
            let stock = 0
            for (const txn of txns) {
              if (txn.txn_type === 'RECEIVE' || txn.txn_type === 'PRODUCE' || txn.txn_type === 'ADJUST') {
                stock += Number(txn.quantity)
              } else if (txn.txn_type === 'CONSUME' || txn.txn_type === 'DESTROY') {
                stock -= Number(txn.quantity)
              }
            }
            stockMap.set(item.name, stock)
          }
        }

        setCurrentStock(stockMap)

        // Process all batches with cumulative stock tracking
        const allBatches: BatchWithMaterials[] = []
        const runningStock = new Map<string, number>(stockMap) // Clone initial stock

        for (const productPlan of plan.production_plans) {
          for (const batch of productPlan.production_schedule) {
            const batchWithMaterials = calculateBatchMaterials(batch, stockMap, runningStock)
            allBatches.push(batchWithMaterials)
          }
        }

        // Sort by month
        allBatches.sort((a, b) => a.scheduled_month - b.scheduled_month)

        setBatches(allBatches)
        const agg = aggregateShortages(allBatches)
        setPurchaseItems(agg)
        const csv = buildPurchaseCsv(agg)
        setPurchaseCsvUri('data:text/csv;charset=utf-8,' + encodeURIComponent(csv))
        const botanicalsOnly = agg.filter(i => i.category === 'Botanicals')
        const botanicalsCsv = buildPurchaseCsv(botanicalsOnly)
        setBotanicalsCsvUri('data:text/csv;charset=utf-8,' + encodeURIComponent(botanicalsCsv))
        setLoading(false)
      } catch (error) {
        console.error('Error loading production planning data:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  function calculateBatchMaterials(
    batch: Batch,
    initialStock: Map<string, number>,
    runningStock: Map<string, number>
  ): BatchWithMaterials {
    const materials: MaterialNeed[] = []
    const botanicals: MaterialNeed[] = []
    const packaging: MaterialNeed[] = []

    // Calculate packaging needs
    if (batch.bottles_700ml > 0) {
      packaging.push(createMaterialNeed('Bottle 700ml', 'Packaging', batch.bottles_700ml, initialStock, runningStock, 'units'))
      packaging.push(createMaterialNeed('Cork 700ml', 'Packaging', batch.bottles_700ml, initialStock, runningStock, 'units'))
      packaging.push(createMaterialNeed('Tamper Sleeve 700ml', 'Packaging', batch.bottles_700ml, initialStock, runningStock, 'units'))
      const cartonsNeeded = Math.ceil(batch.bottles_700ml / 6)
      packaging.push(createMaterialNeed('Carton 6-pack 700ml', 'Packaging', cartonsNeeded, initialStock, runningStock, 'units'))
      packaging.push(createMaterialNeed(`Label 700ml - ${batch.product}`, 'Packaging', batch.bottles_700ml, initialStock, runningStock, 'units'))
    }

    if (batch.bottles_200ml > 0) {
      packaging.push(createMaterialNeed('Bottle 200ml', 'Packaging', batch.bottles_200ml, initialStock, runningStock, 'units'))
      packaging.push(createMaterialNeed('Cap 200ml', 'Packaging', batch.bottles_200ml, initialStock, runningStock, 'units'))
      packaging.push(createMaterialNeed('Tamper Sleeve 200ml', 'Packaging', batch.bottles_200ml, initialStock, runningStock, 'units'))
      packaging.push(createMaterialNeed(`Label 200ml - ${batch.product}`, 'Packaging', batch.bottles_200ml, initialStock, runningStock, 'units'))
    }

    const bottles1000 = (batch as any).bottles_1000ml || 0
    if (bottles1000 > 0) {
      packaging.push(createMaterialNeed('Bottle 1000ml', 'Packaging', bottles1000, initialStock, runningStock, 'units'))
      packaging.push(createMaterialNeed('Cork 1000ml', 'Packaging', bottles1000, initialStock, runningStock, 'units'))
      packaging.push(createMaterialNeed('Tamper Sleeve 1000ml', 'Packaging', bottles1000, initialStock, runningStock, 'units'))
      packaging.push(createMaterialNeed(`Label 1000ml - ${batch.product}`, 'Packaging', bottles1000, initialStock, runningStock, 'units'))
    }

    // Calculate botanical needs for gin batches
    if (batch.production_type === 'GIN') {
      const recipe = GIN_RECIPES[batch.product]
      if (recipe) {
        for (const botanical of recipe) {
          botanicals.push(createMaterialNeed(botanical.name, 'Botanicals', botanical.weight_g, initialStock, runningStock, 'g'))
        }
      }
    }

    return { ...batch, materials, botanicals, packaging }
  }

  function createMaterialNeed(
    name: string,
    category: string,
    needed: number,
    initialStock: Map<string, number>,
    runningStock: Map<string, number>,
    uom: string
  ): MaterialNeed {
    const initial = initialStock.get(name) || 0
    const current = runningStock.get(name) || 0
    const stockAfter = current - needed

    // Update running stock for next batch
    runningStock.set(name, stockAfter)

    const shortage = Math.max(0, needed - current)

    let status: 'CRITICAL' | 'LOW' | 'ADEQUATE' | 'GOOD' = 'GOOD'
    if (current === 0 || stockAfter <= 0) status = 'CRITICAL'
    else if (current < needed * 0.5) status = 'LOW'
    else if (current < needed) status = 'ADEQUATE'

    return { name, category, needed, current_stock: current, shortage, stock_after: stockAfter, status, uom }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copper mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading production plan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-graphite">2026 Production Planning (Cards View)</h1>
          <p className="text-sm text-copper mt-1">Batch cards with materials listed inside • Alternative layout</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl shadow-sm border border-copper bg-white p-6">
            <p className="text-xs text-copper uppercase tracking-wide font-medium">Total Batches</p>
            <p className="text-3xl font-semibold text-graphite mt-2">{batches.length}</p>
            <p className="text-xs text-copper/60 mt-1">Across all products</p>
          </div>

          <div className="rounded-xl shadow-sm border border-copper bg-white p-6">
            <p className="text-xs text-copper uppercase tracking-wide font-medium">Total Bottles</p>
            <p className="text-3xl font-semibold text-graphite mt-2">
              {batches.reduce((sum, b) => sum + b.total_bottles, 0).toLocaleString()}
            </p>
            <p className="text-xs text-copper/60 mt-1">All sizes combined</p>
          </div>

          <div className="rounded-xl shadow-sm border border-copper bg-white p-6">
            <p className="text-xs text-copper uppercase tracking-wide font-medium">Gin Batches</p>
            <p className="text-3xl font-semibold text-graphite mt-2">
              {batches.filter(b => b.production_type === 'GIN').length}
            </p>
            <p className="text-xs text-copper/60 mt-1">Botanical tracking</p>
          </div>

          <div className="rounded-xl shadow-sm border border-copper bg-white p-6">
            <p className="text-xs text-copper uppercase tracking-wide font-medium">Production Months</p>
            <p className="text-3xl font-semibold text-graphite mt-2">
              {new Set(batches.map(b => b.scheduled_month_name)).size}
            </p>
            <p className="text-xs text-copper/60 mt-1">Jan - Jul 2026</p>
          </div>
        </div>

        {/* Purchasing Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-xl shadow-sm border border-copper bg-white p-6">
            <p className="text-xs text-copper uppercase tracking-wide font-medium">Items To Purchase</p>
            <p className="text-3xl font-semibold text-graphite mt-2">{purchaseItems.length}</p>
            <p className="text-xs text-copper/60 mt-1">Across packaging and botanicals</p>
          </div>
          <div className="rounded-xl shadow-sm border border-copper bg-white p-6">
            <p className="text-xs text-copper uppercase tracking-wide font-medium">Total Shortage</p>
            <p className="text-3xl font-semibold text-graphite mt-2">
              {purchaseItems.reduce((sum, i) => sum + i.shortage, 0).toLocaleString()}
            </p>
            <p className="text-xs text-copper/60 mt-1">Sum of shortages by item</p>
          </div>
          <div className="rounded-xl shadow-sm border border-copper bg-white p-6">
            <p className="text-xs text-copper uppercase tracking-wide font-medium">Export</p>
            <a
              href={purchaseCsvUri || '#'}
              download="purchase_plan_2026.csv"
              className="mt-2 inline-flex items-center px-4 py-2 rounded-lg border border-copper-30 text-graphite hover:bg-copper-10 transition text-sm font-medium"
            >
              Download Purchasing CSV
            </a>
            <a
              href={botanicalsCsvUri || '#'}
              download="botanicals_plan_2026.csv"
              className="mt-2 inline-flex items-center px-4 py-2 rounded-lg border border-copper-30 text-graphite hover:bg-copper-10 transition text-sm font-medium"
            >
              Download Botanicals CSV
            </a>
          </div>
        </div>

        {/* Tabs by Month */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-beige p-1 rounded-xl inline-flex gap-1 flex-wrap border border-copper-20">
            <TabsTrigger
              value="all"
              className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-copper data-[state=active]:text-graphite text-copper transition-all duration-150"
            >
              All Batches
            </TabsTrigger>
            {months.map(month => {
              const stats = getMonthStats(month)
              return (
              <TabsTrigger
                key={month}
                value={month}
                className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-copper data-[state=active]:text-graphite text-copper transition-all duration-150"
              >
                <span className="inline-flex items-center gap-2">
                  <span>{month}</span>
                  {stats.count > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-copper-20 text-xs text-copper bg-copper-5">
                      {stats.count}
                    </span>
                  )}
                  {stats.shortage > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-copper-20 text-xs text-copper bg-copper-5">
                      {stats.shortage.toLocaleString()}
                    </span>
                  )}
                </span>
              </TabsTrigger>
            )})}
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <BatchCardsGrid batches={batches} currentStock={currentStock} />
          </TabsContent>

          {months.map(month => (
            <TabsContent key={month} value={month} className="mt-6">
              <MonthPurchasingSummary
                items={aggregateShortagesForMonth(batches, month)}
                monthName={month}
              />
              <BatchCardsGrid batches={batches.filter(b => b.scheduled_month_name === month)} currentStock={currentStock} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

function BatchCardsGrid({ batches, currentStock }: { batches: BatchWithMaterials[]; currentStock: Map<string, number> }) {
  if (batches.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-[#C07A50] p-12 text-center">
        <p className="text-sm text-[#C07A50]/60">No batches scheduled for this period</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {batches.map((batch, index) => (
        <BatchCard key={index} batch={batch} batchNumber={index + 1} currentStock={currentStock} />
      ))}
    </div>
  )
}

function BatchCard({ batch, batchNumber, currentStock }: { batch: BatchWithMaterials; batchNumber: number; currentStock: Map<string, number> }) {
  const allMaterials = [...batch.packaging, ...batch.botanicals]
  const criticalMaterials = allMaterials.filter(m => m.status === 'CRITICAL')
  const hasCritical = criticalMaterials.length > 0
  const fg700 = currentStock.get(`${batch.product} 700ml`) || 0
  const fg200 = currentStock.get(`${batch.product} 200ml`) || 0
  const fg1000 = currentStock.get(`${batch.product} 1000ml`) || 0
  const fgTotal = fg700 + fg200 + fg1000
  const bottles1000 = (batch as any).bottles_1000ml || 0
  const plannedTotal = batch.total_bottles || (batch.bottles_700ml + batch.bottles_200ml + bottles1000)
  const progressPct = plannedTotal > 0 ? Math.min(100, (fgTotal / plannedTotal) * 100) : 0

  return (
    <div className="bg-beige rounded-xl shadow-sm border border-copper transition-all duration-150 hover:shadow-md">
      {/* Card Header */}
      <div className="px-6 py-5 border-b border-copper-20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-graphite text-white text-sm font-semibold">
                {batchNumber}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-graphite">{batch.product}</h3>
                <p className="text-sm text-copper mt-0.5">
                  Batch {batch.batch_number} of {batch.total_batches} • {batch.scheduled_month_name} 2026
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-copper uppercase tracking-wide">Bottles</p>
            <p className="text-2xl font-semibold text-graphite">{batch.total_bottles.toLocaleString()}</p>
            <p className="text-xs text-copper/60 mt-1">
              {batch.bottles_700ml > 0 && `${batch.bottles_700ml} × 700ml`}
              {batch.bottles_700ml > 0 && batch.bottles_200ml > 0 && ' + '}
              {batch.bottles_200ml > 0 && `${batch.bottles_200ml} × 200ml`}
            </p>
            <div className="mt-2">
              <div className="h-2 bg-copper-10 rounded-full overflow-hidden">
                <div className="h-full bg-copper rounded-full transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="text-xs text-copper/70 mt-1">
                {fgTotal.toLocaleString()} on hand of {plannedTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {hasCritical && (
          <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-copper-5 border border-copper-30 rounded-lg">
            <span className="text-copper text-sm font-medium">{criticalMaterials.length} material(s) missing</span>
          </div>
        )}
      </div>

      {/* Card Body - Materials */}
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <a
            href={`/dashboard/production/bottling/new?product=${encodeURIComponent(batch.product)}&search=${encodeURIComponent(batch.product)}`}
            className="inline-flex items-center px-3 py-2 rounded-lg border border-copper-30 text-graphite hover:bg-copper-10 transition text-sm font-medium"
          >
            Start Bottling
          </a>
          {batch.production_type === 'GIN' && (
            <a
              href={`/dashboard/production/start-batch?productType=gin&recipe=${encodeURIComponent(batch.product)}`}
              className="inline-flex items-center px-3 py-2 rounded-lg border border-copper-30 text-graphite hover:bg-copper-10 transition text-sm font-medium"
            >
              Start Gin Batch
            </a>
          )}
        </div>
        {/* Packaging Section */}
        {batch.packaging.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-copper uppercase tracking-wide mb-3">Packaging</h4>
            <div className="space-y-2">
              {batch.packaging.map((material, idx) => (
                <MaterialRow key={idx} material={material} />
              ))}
            </div>
          </div>
        )}

        {/* Botanicals Section */}
        {batch.botanicals.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-copper uppercase tracking-wide mb-3">Botanicals</h4>
            <div className="space-y-2">
              {batch.botanicals.map((material, idx) => (
                <MaterialRow key={idx} material={material} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MaterialRow({ material }: { material: MaterialNeed }) {
  const missing = material.stock_after < 0 ? Math.abs(material.stock_after) : 0

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-150 ${
      material.status === 'CRITICAL' ? 'bg-copper-5 border-copper-20' :
      'bg-white border-copper-20'
    }`}>
      <div className="flex-1">
        <p className="text-sm font-medium text-graphite">{material.name}</p>
        <p className="text-xs text-copper/70 mt-0.5">
          Need: <span className="font-semibold text-graphite">{material.needed.toLocaleString()} {material.uom}</span>
          {' • '}
          Current: <span className="font-semibold text-graphite">{material.current_stock.toLocaleString()} {material.uom}</span>
        </p>
      </div>
      <div className="text-right mr-4">
        <p className={`text-sm font-semibold tabular-nums ${
          material.stock_after <= 0 ? 'text-copper' : 'text-graphite'
        }`}>
          {material.stock_after.toLocaleString()} {material.uom}
        </p>
        <p className="text-xs text-copper/60 mt-0.5">after batch</p>
      </div>
      {missing > 0 && (
        <div className="text-right mr-4">
          <p className="text-sm font-bold text-copper tabular-nums">
            {missing.toLocaleString()} {material.uom}
          </p>
          <p className="text-xs text-copper mt-0.5 font-medium">MISSING</p>
        </div>
      )}
      <div className="ml-4">
        <StatusBadge status={material.status} />
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    CRITICAL: 'bg-copper-5 text-copper border-copper-30',
    LOW: 'bg-copper-5 text-copper border-copper-30',
    ADEQUATE: 'bg-beige text-graphite border-copper-20',
    GOOD: 'bg-beige text-graphite border-copper-20',
  }

  const labels = {
    CRITICAL: 'OUT',
    LOW: 'LOW',
    ADEQUATE: 'OK',
    GOOD: 'OK',
  }

  return (
    <span className={`inline-flex px-2 py-1 rounded border text-xs font-semibold ${colors[status as keyof typeof colors]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  )
}

function aggregateShortages(batches: BatchWithMaterials[]): Array<{ name: string; category: string; uom: string; shortage: number }> {
  const map = new Map<string, { name: string; category: string; uom: string; shortage: number }>()
  for (const b of batches) {
    const all = ([] as MaterialNeed[]).concat(b.packaging, b.botanicals)
    for (const m of all) {
      const s = Math.max(0, m.shortage)
      if (s <= 0) continue
      const key = `${m.name}|${m.uom}|${m.category}`
      const prev = map.get(key)
      if (prev) {
        prev.shortage += s
      } else {
        map.set(key, { name: m.name, category: m.category, uom: m.uom, shortage: s })
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.shortage - a.shortage)
}

function buildPurchaseCsv(items: Array<{ name: string; category: string; uom: string; shortage: number }>): string {
  const header = ['Item Name', 'Category', 'Shortage', 'UOM'].join(',')
  const rows = items.map(i => [i.name, i.category, i.shortage, i.uom].join(','))
  return [header].concat(rows).join('\n')
}

function aggregateShortagesForMonth(batches: BatchWithMaterials[], monthName: string): Array<{ name: string; category: string; uom: string; shortage: number }> {
  const filtered = batches.filter(b => b.scheduled_month_name === monthName)
  return aggregateShortages(filtered)
}

function MonthPurchasingSummary({ items, monthName }: { items: Array<{ name: string; category: string; uom: string; shortage: number }>; monthName: string }) {
  const totalShortage = items.reduce((sum, i) => sum + i.shortage, 0)
  const csv = 'data:text/csv;charset=utf-8,' + encodeURIComponent(buildPurchaseCsv(items))
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="rounded-xl shadow-sm border border-copper bg-white p-4">
        <p className="text-xs text-copper uppercase tracking-wide font-medium">{monthName} Items</p>
        <p className="text-2xl font-semibold text-graphite mt-1">{items.length}</p>
      </div>
      <div className="rounded-xl shadow-sm border border-copper bg-white p-4">
        <p className="text-xs text-copper uppercase tracking-wide font-medium">{monthName} Shortage</p>
        <p className="text-2xl font-semibold text-graphite mt-1">{totalShortage.toLocaleString()}</p>
      </div>
      <div className="rounded-xl shadow-sm border border-copper bg-white p-4">
        <p className="text-xs text-copper uppercase tracking-wide font-medium">{monthName} Export</p>
        <a
          href={csv}
          download={`purchase_${monthName.toLowerCase()}_2026.csv`}
          className="mt-2 inline-flex items-center px-4 py-2 rounded-lg border border-copper-30 text-graphite hover:bg-copper-10 transition text-sm font-medium"
        >
          Download CSV
        </a>
      </div>
    </div>
  )
}
