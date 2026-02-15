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
  status: 'CRITICAL' | 'LOW' | 'ADEQUATE' | 'GOOD'
  uom: string
  stock_after_batch?: number // Stock remaining after this batch is produced
}

interface BatchWithMaterials extends Batch {
  materials: MaterialNeed[]
  botanicals: MaterialNeed[]
  packaging: MaterialNeed[]
}

interface StockTimeline {
  material_name: string
  category: string
  uom: string
  initial_stock: number
  batches: {
    batch_index: number
    product: string
    month: string
    consumed: number
    stock_after: number
    runs_out: boolean
  }[]
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

export default function ProductionPlanning2026Page() {
  const [batches, setBatches] = useState<BatchWithMaterials[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStock, setCurrentStock] = useState<Map<string, number>>(new Map())
  const [stockTimelines, setStockTimelines] = useState<StockTimeline[]>([])

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

        // Process all batches
        const allBatches: BatchWithMaterials[] = []

        for (const productPlan of plan.production_plans) {
          for (const batch of productPlan.production_schedule) {
            const batchWithMaterials = calculateBatchMaterials(batch, stockMap)
            allBatches.push(batchWithMaterials)
          }
        }

        // Sort by month
        allBatches.sort((a, b) => a.scheduled_month - b.scheduled_month)

        // Calculate stock timelines (cumulative consumption)
        const timelines = calculateStockTimelines(allBatches, stockMap)

        setBatches(allBatches)
        setStockTimelines(timelines)
        setLoading(false)
      } catch (error) {
        console.error('Error loading production planning data:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  function calculateStockTimelines(batches: BatchWithMaterials[], stockMap: Map<string, number>): StockTimeline[] {
    const materialConsumption = new Map<string, StockTimeline>()

    // Process each batch in order
    batches.forEach((batch, batchIndex) => {
      const allMaterials = [...batch.packaging, ...batch.botanicals]

      allMaterials.forEach(material => {
        if (!materialConsumption.has(material.name)) {
          materialConsumption.set(material.name, {
            material_name: material.name,
            category: material.category,
            uom: material.uom,
            initial_stock: stockMap.get(material.name) || 0,
            batches: []
          })
        }

        const timeline = materialConsumption.get(material.name)!
        const previousStock = timeline.batches.length > 0
          ? timeline.batches[timeline.batches.length - 1].stock_after
          : timeline.initial_stock

        const stockAfter = previousStock - material.needed
        const runsOut = stockAfter <= 0

        timeline.batches.push({
          batch_index: batchIndex,
          product: batch.product,
          month: batch.scheduled_month_name,
          consumed: material.needed,
          stock_after: stockAfter,
          runs_out: runsOut
        })
      })
    })

    return Array.from(materialConsumption.values())
  }

  function calculateBatchMaterials(batch: Batch, stockMap: Map<string, number>): BatchWithMaterials {
    const materials: MaterialNeed[] = []
    const botanicals: MaterialNeed[] = []
    const packaging: MaterialNeed[] = []

    // Calculate packaging needs
    if (batch.bottles_700ml > 0) {
      packaging.push(createMaterialNeed('Bottle 700ml', 'Packaging', batch.bottles_700ml, stockMap, 'units'))
      packaging.push(createMaterialNeed('Cork - Wood', 'Packaging', batch.bottles_700ml, stockMap, 'units'))

      // Carton 6-Pack: Every 6 bottles of 700ml need 1 carton
      const cartonsNeeded = Math.ceil(batch.bottles_700ml / 6)
      packaging.push(createMaterialNeed('Carton 6-Pack', 'Packaging', cartonsNeeded, stockMap, 'units'))
    }

    if (batch.bottles_200ml > 0) {
      packaging.push(createMaterialNeed('Bottle 200ml', 'Packaging', batch.bottles_200ml, stockMap, 'units'))
    }

    // Calculate botanical needs for gin batches
    if (batch.production_type === 'GIN') {
      const recipe = GIN_RECIPES[batch.product]
      if (recipe) {
        for (const botanical of recipe) {
          botanicals.push(createMaterialNeed(botanical.name, 'Botanicals', botanical.weight_g, stockMap, 'g'))
        }
      }
    }

    return { ...batch, materials, botanicals, packaging }
  }

  function createMaterialNeed(
    name: string,
    category: string,
    needed: number,
    stockMap: Map<string, number>,
    uom: string
  ): MaterialNeed {
    const current = stockMap.get(name) || 0
    const shortage = Math.max(0, needed - current)
    
    let status: 'CRITICAL' | 'LOW' | 'ADEQUATE' | 'GOOD' = 'GOOD'
    if (current === 0) status = 'CRITICAL'
    else if (current < needed * 0.5) status = 'LOW'
    else if (current < needed) status = 'ADEQUATE'

    return { name, category, needed, current_stock: current, shortage, status, uom }
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
          <h1 className="text-3xl font-semibold text-[#1A1A1A]">2026 Production Planning</h1>
          <p className="text-sm text-[#C07A50] mt-1">Batch-by-batch materials planning with inventory comparison</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl shadow-sm border border-[#C07A50] bg-white p-6">
            <p className="text-xs text-[#C07A50] uppercase tracking-wide font-medium">Total Batches</p>
            <p className="text-3xl font-semibold text-[#1A1A1A] mt-2">{batches.length}</p>
            <p className="text-xs text-[#C07A50]/60 mt-1">Across all products</p>
          </div>

          <div className="rounded-xl shadow-sm border border-[#C07A50] bg-white p-6">
            <p className="text-xs text-[#C07A50] uppercase tracking-wide font-medium">Total Bottles</p>
            <p className="text-3xl font-semibold text-[#1A1A1A] mt-2">
              {batches.reduce((sum, b) => sum + b.total_bottles, 0).toLocaleString()}
            </p>
            <p className="text-xs text-[#C07A50]/60 mt-1">All sizes combined</p>
          </div>

          <div className="rounded-xl shadow-sm border border-[#C07A50] bg-white p-6">
            <p className="text-xs text-[#C07A50] uppercase tracking-wide font-medium">Gin Batches</p>
            <p className="text-3xl font-semibold text-[#1A1A1A] mt-2">
              {batches.filter(b => b.production_type === 'GIN').length}
            </p>
            <p className="text-xs text-[#C07A50]/60 mt-1">Botanical tracking</p>
          </div>

          <div className="rounded-xl shadow-sm border border-[#C07A50] bg-white p-6">
            <p className="text-xs text-[#C07A50] uppercase tracking-wide font-medium">Production Months</p>
            <p className="text-3xl font-semibold text-[#1A1A1A] mt-2">
              {new Set(batches.map(b => b.scheduled_month_name)).size}
            </p>
            <p className="text-xs text-[#C07A50]/60 mt-1">Jan - Jul 2026</p>
          </div>
        </div>

        {/* Tabs by Month */}
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="bg-[#EDE3D8] p-1 rounded-xl inline-flex gap-1 flex-wrap border border-[#C07A50]/20">
            <TabsTrigger
              value="timeline"
              className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-[#C07A50] data-[state=active]:text-[#1A1A1A] text-[#C07A50] transition-all duration-150"
            >
              Stock Timeline
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-[#C07A50] data-[state=active]:text-[#1A1A1A] text-[#C07A50] transition-all duration-150"
            >
              All Batches
            </TabsTrigger>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map(month => (
              <TabsTrigger
                key={month}
                value={month}
                className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-[#C07A50] data-[state=active]:text-[#1A1A1A] text-[#C07A50] transition-all duration-150"
              >
                {month}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="timeline" className="mt-6">
            <StockTimelineView timelines={stockTimelines} batches={batches} />
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <BatchList batches={batches} />
          </TabsContent>

          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map(month => (
            <TabsContent key={month} value={month} className="mt-6">
              <BatchList batches={batches.filter(b => b.scheduled_month_name === month)} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

function BatchList({ batches }: { batches: BatchWithMaterials[] }) {
  if (batches.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
        <p className="text-sm text-neutral-400">No batches scheduled for this period</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {batches.map((batch, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          {/* Batch Header */}
          <div className="bg-gradient-to-r from-neutral-50 to-white px-6 py-5 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">{batch.product}</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  Batch {batch.batch_number} of {batch.total_batches} • {batch.scheduled_month_name} 2026 • {batch.production_type}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500 uppercase tracking-wide">Total Bottles</p>
                <p className="text-2xl font-semibold text-neutral-900">{batch.total_bottles.toLocaleString()}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  {batch.bottles_700ml > 0 && `${batch.bottles_700ml} × 700ml`}
                  {batch.bottles_700ml > 0 && batch.bottles_200ml > 0 && ' + '}
                  {batch.bottles_200ml > 0 && `${batch.bottles_200ml} × 200ml`}
                </p>
              </div>
            </div>
          </div>

          {/* Materials Tables */}
          <div className="p-6 space-y-6">
            {/* Packaging */}
            {batch.packaging.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wide">Packaging</h4>
                <MaterialsTable materials={batch.packaging} />
              </div>
            )}

            {/* Botanicals */}
            {batch.botanicals.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wide">Botanicals</h4>
                <MaterialsTable materials={batch.botanicals} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function MaterialsTable({ materials }: { materials: MaterialNeed[] }) {
  return (
    <table className="w-full">
      <thead className="bg-neutral-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Material
          </th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Needed
          </th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Current Stock
          </th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Shortage
          </th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Status
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-copper-15 bg-white">
        {materials.map((material, idx) => (
          <tr key={idx} className="hover:bg-neutral-50 transition-colors duration-150">
            <td className="px-4 py-3 text-sm text-neutral-900 font-medium">{material.name}</td>
            <td className="px-4 py-3 text-sm text-right font-semibold text-neutral-900 tabular-nums">
              {material.needed.toLocaleString()} {material.uom}
            </td>
            <td className="px-4 py-3 text-sm text-right text-neutral-600 tabular-nums">
              {material.current_stock.toLocaleString()} {material.uom}
            </td>
            <td className="px-4 py-3 text-sm text-right font-semibold text-copper tabular-nums">
              {material.shortage > 0 ? `${material.shortage.toLocaleString()} ${material.uom}` : '-'}
            </td>
            <td className="px-4 py-3 text-right">
              <StatusBadge status={material.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    CRITICAL: 'bg-beige text-copper',
    LOW: 'bg-beige text-copper',
    ADEQUATE: 'bg-beige text-graphite',
    GOOD: 'bg-beige text-graphite',
  }

  return (
    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium ${colors[status as keyof typeof colors]}`}>
      {status}
    </span>
  )
}

function StockTimelineView({ timelines, batches }: { timelines: StockTimeline[]; batches: BatchWithMaterials[] }) {
  // Group by category
  const byCategory = timelines.reduce((acc, timeline) => {
    if (!acc[timeline.category]) acc[timeline.category] = []
    acc[timeline.category].push(timeline)
    return acc
  }, {} as Record<string, StockTimeline[]>)

  const categories = ['Packaging', 'Botanicals']

  return (
    <div className="space-y-8">
      {categories.map(category => {
        const items = byCategory[category] || []
        if (items.length === 0) return null

        return (
          <div key={category} className="bg-beige rounded-xl shadow-sm border border-copper overflow-hidden">
            {/* Category Header */}
            <div className="bg-white px-6 py-4 border-b border-copper-20">
              <h3 className="text-lg font-semibold text-graphite">{category}</h3>
              <p className="text-sm text-copper mt-1">
                Stock consumption timeline • {items.length} materials tracked
              </p>
            </div>

            {/* Timeline Tables */}
            <div className="p-6 space-y-8">
              {items.map(timeline => (
                <div key={timeline.material_name} className="space-y-3">
                  {/* Material Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-graphite">{timeline.material_name}</h4>
                      <p className="text-xs text-copper/70 mt-1">
                        Initial Stock: <span className="font-semibold text-graphite">{timeline.initial_stock.toLocaleString()} {timeline.uom}</span>
                      </p>
                    </div>
                    {timeline.batches.some(b => b.runs_out) && (
                      <span className="inline-flex px-3 py-1 rounded-lg text-xs font-medium bg-copper-5 text-copper border border-copper-30">
                        Runs Out
                      </span>
                    )}
                  </div>

                  {/* Timeline Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white border-b border-copper-20">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-copper uppercase">Batch</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-copper uppercase">Product</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-copper uppercase">Month</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-copper uppercase">Consumed</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-copper uppercase">Stock After</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-copper uppercase">Missing</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-copper uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-copper-20">
                        {timeline.batches.map((batch, idx) => {
                          const missing = batch.stock_after < 0 ? Math.abs(batch.stock_after) : 0
                          return (
                            <tr
                              key={idx}
                              className={`hover:bg-white/50 transition-colors duration-150 ${
                                batch.runs_out ? 'bg-copper-5' : 'bg-white'
                              }`}
                            >
                              <td className="px-4 py-3 text-copper/70 font-medium">#{batch.batch_index + 1}</td>
                              <td className="px-4 py-3 text-graphite font-medium">{batch.product}</td>
                              <td className="px-4 py-3 text-copper/70">{batch.month}</td>
                              <td className="px-4 py-3 text-right text-copper font-semibold tabular-nums">
                                -{batch.consumed.toLocaleString()} {timeline.uom}
                              </td>
                              <td className={`px-4 py-3 text-right font-semibold tabular-nums ${
                                batch.stock_after <= 0 ? 'text-copper' : 'text-graphite'
                              }`}>
                                {batch.stock_after.toLocaleString()} {timeline.uom}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-copper tabular-nums">
                                {missing > 0 ? `${missing.toLocaleString()} ${timeline.uom}` : '-'}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {batch.runs_out ? (
                                  <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-copper-5 text-copper border border-copper-30">
                                    OUT
                                  </span>
                                ) : (
                                  <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-beige text-graphite border border-copper-20">
                                    OK
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Final Stock Summary */}
                  <div className="flex items-center justify-between pt-2 border-t border-copper-20">
                    <p className="text-xs text-copper/70">
                      After {timeline.batches.length} batches
                    </p>
                    <p className={`text-sm font-semibold ${
                      timeline.batches[timeline.batches.length - 1].stock_after <= 0 ? 'text-copper' : 'text-graphite'
                    }`}>
                      Final Stock: {timeline.batches[timeline.batches.length - 1].stock_after.toLocaleString()} {timeline.uom}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
