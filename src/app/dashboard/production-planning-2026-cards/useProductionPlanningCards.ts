'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Batch, MaterialNeed, BatchWithMaterials, PurchaseItem } from './planning-cards-types'

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

function createMaterialNeed(
  name: string, category: string, needed: number,
  initialStock: Map<string, number>, runningStock: Map<string, number>, uom: string
): MaterialNeed {
  const current = runningStock.get(name) || 0
  const stockAfter = current - needed
  runningStock.set(name, stockAfter)
  const shortage = Math.max(0, needed - current)

  let status: MaterialNeed['status'] = 'GOOD'
  if (current === 0 || stockAfter <= 0) status = 'CRITICAL'
  else if (current < needed * 0.5) status = 'LOW'
  else if (current < needed) status = 'ADEQUATE'

  return { name, category, needed, current_stock: current, shortage, stock_after: stockAfter, status, uom }
}

function calculateBatchMaterials(
  batch: Batch, initialStock: Map<string, number>, runningStock: Map<string, number>
): BatchWithMaterials {
  const materials: MaterialNeed[] = []
  const botanicals: MaterialNeed[] = []
  const packaging: MaterialNeed[] = []

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

export function aggregateShortages(batches: BatchWithMaterials[]): PurchaseItem[] {
  const map = new Map<string, PurchaseItem>()
  for (const b of batches) {
    const all = ([] as MaterialNeed[]).concat(b.packaging, b.botanicals)
    for (const m of all) {
      const s = Math.max(0, m.shortage)
      if (s <= 0) continue
      const key = `${m.name}|${m.uom}|${m.category}`
      const prev = map.get(key)
      if (prev) { prev.shortage += s }
      else { map.set(key, { name: m.name, category: m.category, uom: m.uom, shortage: s }) }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.shortage - a.shortage)
}

export function aggregateShortagesForMonth(batches: BatchWithMaterials[], monthName: string): PurchaseItem[] {
  return aggregateShortages(batches.filter(b => b.scheduled_month_name === monthName))
}

export function buildPurchaseCsv(items: PurchaseItem[]): string {
  const header = ['Item Name', 'Category', 'Shortage', 'UOM'].join(',')
  const rows = items.map(i => [i.name, i.category, i.shortage, i.uom].join(','))
  return [header].concat(rows).join('\n')
}

export function useProductionPlanningCards() {
  const [batches, setBatches] = useState<BatchWithMaterials[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStock, setCurrentStock] = useState<Map<string, number>>(new Map())
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])
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
        const response = await fetch('/production_plan_2026_v4.json')
        const plan = await response.json()

        const { data: items } = await supabase.from('items').select('id, name, category, default_uom')
        const { data: allTxns } = await supabase.from('inventory_txns').select('item_id, quantity, txn_type')

        const stockMap = new Map<string, number>()
        if (items && allTxns) {
          const txnsByItem = new Map<string, typeof allTxns>()
          for (const txn of allTxns) {
            if (!txnsByItem.has(txn.item_id)) txnsByItem.set(txn.item_id, [])
            txnsByItem.get(txn.item_id)!.push(txn)
          }
          for (const item of items) {
            const txns = txnsByItem.get(item.id) || []
            let stock = 0
            for (const txn of txns) {
              if (txn.txn_type === 'RECEIVE' || txn.txn_type === 'PRODUCE' || txn.txn_type === 'ADJUST') stock += Number(txn.quantity)
              else if (txn.txn_type === 'CONSUME' || txn.txn_type === 'DESTROY') stock -= Number(txn.quantity)
            }
            stockMap.set(item.name, stock)
          }
        }

        setCurrentStock(stockMap)

        const allBatches: BatchWithMaterials[] = []
        const runningStock = new Map<string, number>(stockMap)
        for (const productPlan of plan.production_plans) {
          for (const batch of productPlan.production_schedule) {
            allBatches.push(calculateBatchMaterials(batch, stockMap, runningStock))
          }
        }
        allBatches.sort((a, b) => a.scheduled_month - b.scheduled_month)
        setBatches(allBatches)

        const agg = aggregateShortages(allBatches)
        setPurchaseItems(agg)
        setPurchaseCsvUri('data:text/csv;charset=utf-8,' + encodeURIComponent(buildPurchaseCsv(agg)))
        const botanicalsOnly = agg.filter(i => i.category === 'Botanicals')
        setBotanicalsCsvUri('data:text/csv;charset=utf-8,' + encodeURIComponent(buildPurchaseCsv(botanicalsOnly)))
        setLoading(false)
      } catch (error) {
        console.error('Error loading production planning data:', error)
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return {
    batches, loading, currentStock, purchaseItems,
    purchaseCsvUri, botanicalsCsvUri, months, getMonthStats,
  }
}
