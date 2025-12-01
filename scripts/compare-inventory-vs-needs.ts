/**
 * Compare current inventory vs 2026 production needs
 * Shows what to order and when
 */

import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'
import materialsData from '../data/materials_requirements_2026.json'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface ComparisonResult {
  sku: string
  name: string
  category: string
  needed_2026: number
  current_stock: number
  shortage: number
  buffer_30_percent: number
  recommended_order: number
  status: 'CRITICAL' | 'LOW' | 'ADEQUATE' | 'GOOD'
}

async function getCurrentInventory() {
  const stockMap = new Map<string, number>()

  // Get all items
  const { data: items, error: itemsError } = await supabase
    .from('items')
    .select('id, name')

  if (itemsError) {
    console.error('Error fetching items:', itemsError)
    return stockMap
  }

  // Get stock for each item
  for (const item of items) {
    const { data: txns, error: txnsError } = await supabase
      .from('inventory_txns')
      .select('quantity, txn_type')
      .eq('item_id', item.id)

    if (txnsError) continue

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

  return stockMap
}

async function compareInventory() {
  console.log('\n🔍 Fetching current inventory from Supabase...\n')
  const currentStock = await getCurrentInventory()

  const results: ComparisonResult[] = []

  for (const material of materialsData.materials) {
    const current = currentStock.get(material.sku) || 0
    const needed = material.quantity_needed
    const shortage = Math.max(0, needed - current)
    const buffer = Math.ceil(shortage * 0.3)
    const recommended = shortage + buffer

    let status: ComparisonResult['status'] = 'GOOD'
    if (current === 0 && needed > 0) status = 'CRITICAL'
    else if (shortage > needed * 0.5) status = 'CRITICAL'
    else if (shortage > 0) status = 'LOW'
    else if (current < needed * 1.2) status = 'ADEQUATE'

    results.push({
      sku: material.sku,
      name: material.name,
      category: material.category,
      needed_2026: needed,
      current_stock: current,
      shortage,
      buffer_30_percent: buffer,
      recommended_order: recommended,
      status
    })
  }

  return results.sort((a, b) => {
    const statusOrder = { CRITICAL: 0, LOW: 1, ADEQUATE: 2, GOOD: 3 }
    return statusOrder[a.status] - statusOrder[b.status] || b.shortage - a.shortage
  })
}

async function main() {
  const results = await compareInventory()

  console.log('\n📊 INVENTORY vs 2026 PRODUCTION NEEDS\n')
  console.log('='.repeat(100))

  // Group by status
  for (const status of ['CRITICAL', 'LOW', 'ADEQUATE', 'GOOD'] as const) {
    const items = results.filter(r => r.status === status)
    if (items.length === 0) continue

    const emoji = status === 'CRITICAL' ? '🚨' : status === 'LOW' ? '⚠️' : status === 'ADEQUATE' ? '📦' : '✅'
    console.log(`\n${emoji} ${status} (${items.length} items)`)
    console.log('-'.repeat(100))

    for (const item of items) {
      console.log(
        `  ${item.sku.padEnd(25)} ` +
        `Need: ${item.needed_2026.toString().padStart(6)} | ` +
        `Have: ${item.current_stock.toString().padStart(6)} | ` +
        `Short: ${item.shortage.toString().padStart(6)} | ` +
        `ORDER: ${item.recommended_order.toString().padStart(6)} (with 30% buffer)`
      )
    }
  }

  console.log('\n' + '='.repeat(100))

  // Summary
  const critical = results.filter(r => r.status === 'CRITICAL')
  const low = results.filter(r => r.status === 'LOW')
  const totalToOrder = results.reduce((sum, r) => sum + r.recommended_order, 0)

  console.log(`\n📈 SUMMARY:`)
  console.log(`   🚨 Critical items: ${critical.length}`)
  console.log(`   ⚠️  Low items: ${low.length}`)
  console.log(`   📦 Total to order: ${totalToOrder.toLocaleString()} items`)
  console.log(`\n`)

  // Save results
  writeFileSync(
    'data/inventory_comparison_2026.json',
    JSON.stringify({ generated_at: new Date().toISOString(), results }, null, 2)
  )

  console.log('💾 Saved to: data/inventory_comparison_2026.json\n')
}

main().catch(console.error)

