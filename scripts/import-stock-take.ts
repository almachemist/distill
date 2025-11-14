import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in .env.local')
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface StockTakeData {
  date: string
  stock_take: {
    devils: Array<{
      product: string
      sizes?: Array<{ ml: number; quantity: number }>
      quantity?: number
    }>
    merchant_mae: Array<{
      product: string
      types?: Array<{ package: string; quantity: number }>
      sizes?: Array<{ ml: number; quantity: number }>
      quantity?: number
    }>
  }
}

async function getOrganizationId(): Promise<string> {
  const { data, error } = await supabase
    .from('organizations')
    .select('id')
    .limit(1)
    .single()

  if (error || !data) {
    throw new Error('No organization found')
  }

  return data.id
}

async function createOrGetItem(
  orgId: string,
  name: string,
  category: string,
  brand: string
): Promise<string> {
  // Check if item exists
  const { data: existing } = await supabase
    .from('items')
    .select('id')
    .eq('organization_id', orgId)
    .eq('name', name)
    .eq('category', category)
    .single()

  if (existing) {
    return existing.id
  }

  // Create new item
  const { data: newItem, error } = await supabase
    .from('items')
    .insert({
      organization_id: orgId,
      name,
      category,
      default_uom: 'bottles',
      is_alcohol: true
    })
    .select('id')
    .single()

  if (error || !newItem) {
    throw new Error(`Failed to create item: ${name}`)
  }

  console.log(`✅ Created item: ${name}`)
  return newItem.id
}

async function recordStockTake(
  orgId: string,
  itemId: string,
  quantity: number,
  date: string,
  note: string
): Promise<void> {
  // Use ADJUST transaction type for stock take
  const { error } = await supabase
    .from('inventory_txns')
    .insert({
      organization_id: orgId,
      item_id: itemId,
      txn_type: 'ADJUST',
      quantity,
      uom: 'bottles',
      dt: date,
      note
    })

  if (error) {
    throw new Error(`Failed to record stock take: ${error.message}`)
  }
}

async function main() {
  console.log('🚀 Starting stock take import...\n')

  // Load stock take data
  const stockTakePath = path.join(process.cwd(), 'data', 'stock_take_2025-11-13.json')
  const stockTakeData: StockTakeData = JSON.parse(fs.readFileSync(stockTakePath, 'utf-8'))

  const orgId = await getOrganizationId()
  console.log(`📊 Organization ID: ${orgId}\n`)

  let totalItems = 0
  let totalBottles = 0

  // Process Devils Thumb products
  console.log('🔥 Processing Devils Thumb products...\n')
  for (const product of stockTakeData.stock_take.devils) {
    if (product.sizes) {
      for (const size of product.sizes) {
        const itemName = `${product.product} ${size.ml}ml`
        const itemId = await createOrGetItem(orgId, itemName, 'Spirits', 'Devils Thumb')
        await recordStockTake(
          orgId,
          itemId,
          size.quantity,
          stockTakeData.date,
          `Stock take 13/11/2025 - Devils Thumb ${product.product} ${size.ml}ml`
        )
        console.log(`  📦 ${itemName}: ${size.quantity} bottles`)
        totalItems++
        totalBottles += size.quantity
      }
    } else if (product.quantity) {
      const itemName = product.product
      const itemId = await createOrGetItem(orgId, itemName, 'Spirits', 'Devils Thumb')
      await recordStockTake(
        orgId,
        itemId,
        product.quantity,
        stockTakeData.date,
        `Stock take 13/11/2025 - Devils Thumb ${product.product}`
      )
      console.log(`  📦 ${itemName}: ${product.quantity} units`)
      totalItems++
      totalBottles += product.quantity
    }
  }

  // Process Merchant Mae products
  console.log('\n🏴‍☠️ Processing Merchant Mae products...\n')
  for (const product of stockTakeData.stock_take.merchant_mae) {
    if (product.types) {
      for (const type of product.types) {
        const itemName = `Merchant Mae ${product.product} ${type.package}`
        const itemId = await createOrGetItem(orgId, itemName, 'Spirits', 'Merchant Mae')
        await recordStockTake(
          orgId,
          itemId,
          type.quantity,
          stockTakeData.date,
          `Stock take 13/11/2025 - Merchant Mae ${product.product} ${type.package}`
        )
        console.log(`  📦 ${itemName}: ${type.quantity} units`)
        totalItems++
        totalBottles += type.quantity
      }
    } else if (product.sizes) {
      for (const size of product.sizes) {
        const itemName = `Merchant Mae ${product.product} ${size.ml}ml`
        const itemId = await createOrGetItem(orgId, itemName, 'Spirits', 'Merchant Mae')
        await recordStockTake(
          orgId,
          itemId,
          size.quantity,
          stockTakeData.date,
          `Stock take 13/11/2025 - Merchant Mae ${product.product} ${size.ml}ml`
        )
        console.log(`  📦 ${itemName}: ${size.quantity} bottles`)
        totalItems++
        totalBottles += size.quantity
      }
    } else if (product.quantity) {
      const itemName = `Merchant Mae ${product.product}`
      const itemId = await createOrGetItem(orgId, itemName, 'Spirits', 'Merchant Mae')
      await recordStockTake(
        orgId,
        itemId,
        product.quantity,
        stockTakeData.date,
        `Stock take 13/11/2025 - Merchant Mae ${product.product}`
      )
      console.log(`  📦 ${itemName}: ${product.quantity} units`)
      totalItems++
      totalBottles += product.quantity
    }
  }

  console.log('\n✅ Stock take import complete!\n')
  console.log(`📊 Summary:`)
  console.log(`   - Total SKUs: ${totalItems}`)
  console.log(`   - Total Units: ${totalBottles}`)
}

main().catch(console.error)

