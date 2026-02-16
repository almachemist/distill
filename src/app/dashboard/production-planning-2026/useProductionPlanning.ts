'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Batch, MaterialNeed, BatchWithMaterials, StockTimeline } from './planning-types'

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
  name: string, category: string, needed: number, stockMap: Map<string, number>, uom: string
): MaterialNeed {
  const current = stockMap.get(name) || 0
  const shortage = Math.max(0, needed - current)
  let status: MaterialNeed['status'] = 'GOOD'
  if (current === 0) status = 'CRITICAL'
  else if (current < needed * 0.5) status = 'LOW'
  else if (current < needed) status = 'ADEQUATE'
  return { name, category, needed, current_stock: current, shortage, status, uom }
}

function calculateBatchMaterials(batch: Batch, stockMap: Map<string, number>): BatchWithMaterials {
  const materials: MaterialNeed[] = []
  const botanicals: MaterialNeed[] = []
  const packaging: MaterialNeed[] = []

  if (batch.bottles_700ml > 0) {
    packaging.push(createMaterialNeed('Bottle 700ml', 'Packaging', batch.bottles_700ml, stockMap, 'units'))
    packaging.push(createMaterialNeed('Cork - Wood', 'Packaging', batch.bottles_700ml, stockMap, 'units'))
    const cartonsNeeded = Math.ceil(batch.bottles_700ml / 6)
    packaging.push(createMaterialNeed('Carton 6-Pack', 'Packaging', cartonsNeeded, stockMap, 'units'))
  }
  if (batch.bottles_200ml > 0) {
    packaging.push(createMaterialNeed('Bottle 200ml', 'Packaging', batch.bottles_200ml, stockMap, 'units'))
  }
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

function calculateStockTimelines(batches: BatchWithMaterials[], stockMap: Map<string, number>): StockTimeline[] {
  const materialConsumption = new Map<string, StockTimeline>()

  batches.forEach((batch, batchIndex) => {
    const allMaterials = [...batch.packaging, ...batch.botanicals]
    allMaterials.forEach(material => {
      if (!materialConsumption.has(material.name)) {
        materialConsumption.set(material.name, {
          material_name: material.name, category: material.category,
          uom: material.uom, initial_stock: stockMap.get(material.name) || 0, batches: []
        })
      }
      const timeline = materialConsumption.get(material.name)!
      const previousStock = timeline.batches.length > 0
        ? timeline.batches[timeline.batches.length - 1].stock_after
        : timeline.initial_stock
      const stockAfter = previousStock - material.needed
      timeline.batches.push({
        batch_index: batchIndex, product: batch.product, month: batch.scheduled_month_name,
        consumed: material.needed, stock_after: stockAfter, runs_out: stockAfter <= 0
      })
    })
  })

  return Array.from(materialConsumption.values())
}

export function useProductionPlanning() {
  const [batches, setBatches] = useState<BatchWithMaterials[]>([])
  const [loading, setLoading] = useState(true)
  const [stockTimelines, setStockTimelines] = useState<StockTimeline[]>([])

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

        const allBatches: BatchWithMaterials[] = []
        for (const productPlan of plan.production_plans) {
          for (const batch of productPlan.production_schedule) {
            allBatches.push(calculateBatchMaterials(batch, stockMap))
          }
        }
        allBatches.sort((a, b) => a.scheduled_month - b.scheduled_month)

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

  return { batches, loading, stockTimelines }
}
