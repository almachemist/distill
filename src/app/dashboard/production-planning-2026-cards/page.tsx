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

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      // Load production plan
      const response = await fetch('/production_plan_2026_v4.json')
      const plan = await response.json()

      // Load current inventory
      const { data: items } = await supabase.from('items').select('id, name, category, default_uom')
      const stockMap = new Map<string, number>()

      if (items) {
        for (const item of items) {
          const { data: txns } = await supabase
            .from('inventory_txns')
            .select('quantity, txn_type')
            .eq('item_id', item.id)

          let stock = 0
          if (txns) {
            for (const txn of txns) {
              if (txn.txn_type === 'RECEIVE' || txn.txn_type === 'PRODUCE' || txn.txn_type === 'ADJUST') {
                stock += Number(txn.quantity)
              } else if (txn.txn_type === 'CONSUME' || txn.txn_type === 'DESTROY') {
                stock -= Number(txn.quantity)
              }
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
      setLoading(false)
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
      packaging.push(createMaterialNeed('Cork - Wood', 'Packaging', batch.bottles_700ml, initialStock, runningStock, 'units'))
    }

    if (batch.bottles_200ml > 0) {
      packaging.push(createMaterialNeed('Bottle 200ml', 'Packaging', batch.bottles_200ml, initialStock, runningStock, 'units'))
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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto"></div>
          <p className="mt-4 text-sm text-neutral-500">Loading production plan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-neutral-900">2026 Production Planning (Cards View)</h1>
          <p className="text-sm text-neutral-500 mt-1">Batch cards with materials listed inside • Alternative layout</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl shadow-sm border border-neutral-200 bg-white p-6">
            <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Total Batches</p>
            <p className="text-3xl font-semibold text-neutral-900 mt-2">{batches.length}</p>
            <p className="text-xs text-neutral-400 mt-1">Across all products</p>
          </div>

          <div className="rounded-xl shadow-sm border border-neutral-200 bg-white p-6">
            <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Total Bottles</p>
            <p className="text-3xl font-semibold text-neutral-900 mt-2">
              {batches.reduce((sum, b) => sum + b.total_bottles, 0).toLocaleString()}
            </p>
            <p className="text-xs text-neutral-400 mt-1">All sizes combined</p>
          </div>

          <div className="rounded-xl shadow-sm border border-neutral-200 bg-white p-6">
            <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Gin Batches</p>
            <p className="text-3xl font-semibold text-green-600 mt-2">
              {batches.filter(b => b.production_type === 'GIN').length}
            </p>
            <p className="text-xs text-neutral-400 mt-1">Botanical tracking</p>
          </div>

          <div className="rounded-xl shadow-sm border border-neutral-200 bg-white p-6">
            <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Production Months</p>
            <p className="text-3xl font-semibold text-neutral-900 mt-2">
              {new Set(batches.map(b => b.scheduled_month_name)).size}
            </p>
            <p className="text-xs text-neutral-400 mt-1">Jan - Jul 2026</p>
          </div>
        </div>

        {/* Tabs by Month */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-neutral-100 p-1 rounded-xl inline-flex gap-1 flex-wrap">
            <TabsTrigger
              value="all"
              className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-150"
            >
              All Batches
            </TabsTrigger>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map(month => (
              <TabsTrigger
                key={month}
                value={month}
                className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-150"
              >
                {month}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <BatchCardsGrid batches={batches} />
          </TabsContent>

          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map(month => (
            <TabsContent key={month} value={month} className="mt-6">
              <BatchCardsGrid batches={batches.filter(b => b.scheduled_month_name === month)} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

function BatchCardsGrid({ batches }: { batches: BatchWithMaterials[] }) {
  if (batches.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
        <p className="text-sm text-neutral-400">No batches scheduled for this period</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {batches.map((batch, index) => (
        <BatchCard key={index} batch={batch} batchNumber={index + 1} />
      ))}
    </div>
  )
}

function BatchCard({ batch, batchNumber }: { batch: BatchWithMaterials; batchNumber: number }) {
  const allMaterials = [...batch.packaging, ...batch.botanicals]
  const criticalMaterials = allMaterials.filter(m => m.status === 'CRITICAL')
  const hasCritical = criticalMaterials.length > 0

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-150 hover:shadow-md ${
      hasCritical ? 'border-red-300' : 'border-neutral-200'
    }`}>
      {/* Card Header */}
      <div className={`px-6 py-5 border-b ${
        hasCritical ? 'bg-red-50 border-red-200' : 'bg-gradient-to-r from-neutral-50 to-white border-neutral-200'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-neutral-900 text-white text-sm font-semibold">
                {batchNumber}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">{batch.product}</h3>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Batch {batch.batch_number} of {batch.total_batches} • {batch.scheduled_month_name} 2026
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Bottles</p>
            <p className="text-2xl font-semibold text-neutral-900">{batch.total_bottles.toLocaleString()}</p>
            <p className="text-xs text-neutral-400 mt-1">
              {batch.bottles_700ml > 0 && `${batch.bottles_700ml} × 700ml`}
              {batch.bottles_700ml > 0 && batch.bottles_200ml > 0 && ' + '}
              {batch.bottles_200ml > 0 && `${batch.bottles_200ml} × 200ml`}
            </p>
          </div>
        </div>

        {hasCritical && (
          <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-red-100 border border-red-200 rounded-lg">
            <span className="text-red-700 text-sm font-medium">⚠️ {criticalMaterials.length} material(s) out of stock</span>
          </div>
        )}
      </div>

      {/* Card Body - Materials */}
      <div className="p-6 space-y-6">
        {/* Packaging Section */}
        {batch.packaging.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Packaging</h4>
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
            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Botanicals</h4>
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
      material.status === 'CRITICAL' ? 'bg-red-50 border-red-200' :
      material.status === 'LOW' ? 'bg-orange-50 border-orange-200' :
      material.status === 'ADEQUATE' ? 'bg-yellow-50 border-yellow-200' :
      'bg-green-50 border-green-200'
    }`}>
      <div className="flex-1">
        <p className="text-sm font-medium text-neutral-900">{material.name}</p>
        <p className="text-xs text-neutral-500 mt-0.5">
          Need: <span className="font-semibold text-neutral-700">{material.needed.toLocaleString()} {material.uom}</span>
          {' • '}
          Current: <span className="font-semibold text-neutral-700">{material.current_stock.toLocaleString()} {material.uom}</span>
        </p>
      </div>
      <div className="text-right mr-4">
        <p className={`text-sm font-semibold tabular-nums ${
          material.stock_after <= 0 ? 'text-red-700' :
          material.stock_after < material.needed ? 'text-orange-600' :
          'text-green-700'
        }`}>
          {material.stock_after.toLocaleString()} {material.uom}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5">after batch</p>
      </div>
      {missing > 0 && (
        <div className="text-right mr-4">
          <p className="text-sm font-bold text-red-700 tabular-nums">
            {missing.toLocaleString()} {material.uom}
          </p>
          <p className="text-xs text-red-600 mt-0.5 font-medium">MISSING</p>
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
    CRITICAL: 'bg-red-100 text-red-700 border-red-300',
    LOW: 'bg-orange-100 text-orange-700 border-orange-300',
    ADEQUATE: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    GOOD: 'bg-green-100 text-green-700 border-green-300',
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

