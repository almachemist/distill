import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in .env.local')
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface SalesAnalytics {
  summary: {
    totalNetSales: number
    totalUnits: number
    totalSalesCount: number
  }
  byProduct: Array<{
    item: string
    totalNetSales: number
    totalUnits: number
    salesCount: number
    avgPrice: number
  }>
  byMonth: Array<{
    month: number
    monthName: string
    totalNetSales: number
    totalUnits: number
    salesCount: number
    isProjected?: boolean
  }>
}

interface StockItem {
  name: string
  current_stock: number
  brand: string
}

interface ProductionBatch {
  batch_id: string
  recipe_name: string
  created_at: string
  final_lal?: number
  final_abv?: number
  bottles_produced?: number
}

interface ProductAnalysis {
  product_name: string
  brand: string
  
  // Sales data (2025)
  total_units_sold_2025: number
  total_sales_2025: number
  avg_monthly_sales: number
  sales_trend: string
  
  // Stock data (13 Nov 2025)
  current_stock: number
  stock_after_dec_sales: number // Adjusted for December projection
  
  // Production history
  total_batches_produced: number
  total_bottles_produced: number
  avg_batch_size: number
  last_production_date?: string
  
  // Planning metrics
  months_of_stock_remaining: number
  recommended_production_2026: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'SUFFICIENT'
  notes: string[]
}

async function getOrgId(): Promise<string> {
  const { data } = await supabase.from('organizations').select('id').limit(1).single()
  return data?.id || '00000000-0000-0000-0000-000000000001'
}

async function getStockData(orgId: string): Promise<StockItem[]> {
  const { data: items } = await supabase
    .from('items')
    .select('id, name')
    .eq('organization_id', orgId)

  if (!items) return []

  const stockItems: StockItem[] = []

  for (const item of items) {
    const { data: txns } = await supabase
      .from('inventory_txns')
      .select('quantity, txn_type')
      .eq('item_id', item.id)

    let currentStock = 0
    for (const txn of txns || []) {
      if (txn.txn_type === 'RECEIVE' || txn.txn_type === 'PRODUCE' || txn.txn_type === 'ADJUST') {
        currentStock += Number(txn.quantity)
      } else if (txn.txn_type === 'CONSUME' || txn.txn_type === 'DESTROY') {
        currentStock -= Number(txn.quantity)
      }
    }

    const brand = item.name.includes('Merchant Mae') ? 'Merchant Mae' : 'Devils Thumb'
    
    stockItems.push({
      name: item.name,
      current_stock: currentStock,
      brand
    })
  }

  return stockItems
}

async function getProductionHistory(orgId: string): Promise<ProductionBatch[]> {
  // Get all production batches from various tables
  const batches: ProductionBatch[] = []

  // Rum batches
  const { data: rumBatches } = await supabase
    .from('rum_production_runs')
    .select('run_id, created_at')
    .eq('organization_id', orgId)

  for (const batch of rumBatches || []) {
    batches.push({
      batch_id: batch.run_id,
      recipe_name: 'Rum',
      created_at: batch.created_at
    })
  }

  // Gin batches - Signature
  const { data: sigBatches } = await supabase
    .from('signature_batches')
    .select('batch_id, created_at, final_lal, final_abv')
    .eq('organization_id', orgId)

  for (const batch of sigBatches || []) {
    batches.push({
      batch_id: batch.batch_id,
      recipe_name: 'Signature Dry Gin',
      created_at: batch.created_at,
      final_lal: batch.final_lal,
      final_abv: batch.final_abv
    })
  }

  // Add other gin types...
  const ginTables = [
    { table: 'rainforest_gin_batches', name: 'Rainforest Gin' },
    { table: 'navy_gin_batches', name: 'Navy Strength Gin' },
    { table: 'wet_season_gin_batches', name: 'Wet Season Gin' },
    { table: 'dry_season_gin_batches', name: 'Dry Season Gin' }
  ]

  for (const ginType of ginTables) {
    const { data: ginBatches } = await supabase
      .from(ginType.table)
      .select('batch_id, created_at, final_lal, final_abv')
      .eq('organization_id', orgId)

    for (const batch of ginBatches || []) {
      batches.push({
        batch_id: batch.batch_id,
        recipe_name: ginType.name,
        created_at: batch.created_at,
        final_lal: batch.final_lal,
        final_abv: batch.final_abv
      })
    }
  }

  return batches
}

function normalizeProductName(salesName: string): string {
  // Map sales item names to stock item names
  const name = salesName.toLowerCase()

  // Gins
  if (name.includes('rainforest') && name.includes('700')) return 'Rainforest 700ml'
  if (name.includes('rainforest') && name.includes('200')) return 'Rainforest 200ml'
  if (name.includes('signature') && name.includes('700')) return 'Signature 700ml'
  if (name.includes('signature') && name.includes('200')) return 'Signature 200ml'
  if (name.includes('navy') && name.includes('700')) return 'Navy 700ml'
  if (name.includes('navy') && name.includes('200')) return 'Navy 200ml'

  // Rums
  if (name.includes('wet season') && name.includes('700')) return 'Wet Season 700ml'
  if (name.includes('dry season') && name.includes('700')) return 'Dry Season 700ml'
  if (name.includes('pineapple') && name.includes('700')) return 'Pineapple Rum 700ml'
  if (name.includes('pineapple') && name.includes('200')) return 'Pineapple Rum 200ml'
  if (name.includes('spiced') && name.includes('700')) return 'Spiced Rum 700ml'
  if (name.includes('spiced') && name.includes('200')) return 'Spiced Rum 200ml'
  if (name.includes('reserve') && name.includes('700')) return 'Reserve Cask Rum 700ml'

  // Cane Spirit
  if (name.includes('cane') && name.includes('700')) return 'Cane Spirit 700ml'
  if (name.includes('cane') && name.includes('200')) return 'Cane Spirit 200ml'

  // Coffee Liqueur
  if (name.includes('coffee') && name.includes('700')) return 'Coffee Liqueur 700ml'

  // Merchant Mae
  if (name.includes('merchant') && name.includes('gin') && name.includes('bottle')) return 'Merchant Mae Gin Bottle'
  if (name.includes('merchant') && name.includes('gin') && name.includes('pouch')) return 'Merchant Mae Gin Pouches'
  if (name.includes('merchant') && name.includes('vodka') && name.includes('bottle')) return 'Merchant Mae Vodka Bottle'
  if (name.includes('merchant') && name.includes('vodka') && name.includes('pouch')) return 'Merchant Mae Vodka Pouches'
  if (name.includes('merchant') && name.includes('white')) return 'Merchant Mae White Rum Bottle'
  if (name.includes('merchant') && name.includes('dark')) return 'Merchant Mae Dark Rum Bottle'

  return salesName
}

async function main() {
  console.log('🚀 Starting comprehensive production planning analysis...\n')

  const orgId = await getOrgId()
  console.log(`📊 Organization ID: ${orgId}\n`)

  // Load sales analytics
  const salesPath = path.join(process.cwd(), 'data', 'sales_analytics_2025.json')
  const salesAnalytics: SalesAnalytics = JSON.parse(fs.readFileSync(salesPath, 'utf-8'))
  console.log(`✅ Loaded sales analytics: ${salesAnalytics.byProduct.length} products\n`)

  // Load stock data
  const stockData = await getStockData(orgId)
  console.log(`✅ Loaded stock data: ${stockData.length} items\n`)

  // Load production history
  const productionHistory = await getProductionHistory(orgId)
  console.log(`✅ Loaded production history: ${productionHistory.length} batches\n`)

  // Get December sales data to adjust stock
  const decemberMonth = salesAnalytics.byMonth.find(m => m.month === 12)
  const decemberUnits = decemberMonth?.totalUnits || 0
  console.log(`📅 December 2025 projected sales: ${decemberUnits} units\n`)

  // Analyze each product
  const productAnalyses: ProductAnalysis[] = []

  for (const salesProduct of salesAnalytics.byProduct) {
    const normalizedName = normalizeProductName(salesProduct.item)
    const stockItem = stockData.find(s => s.name === normalizedName)

    if (!stockItem) {
      console.log(`⚠️  No stock match for: ${salesProduct.item}`)
      continue
    }

    // Calculate sales metrics
    const avgMonthlySales = salesProduct.totalUnits / 11 // Jan-Nov 2025

    // Estimate December sales for this product (proportional to total)
    const productDecSales = decemberUnits > 0
      ? Math.round((salesProduct.totalUnits / salesAnalytics.summary.totalUnits) * decemberUnits)
      : 0

    const stockAfterDec = Math.max(0, stockItem.current_stock - productDecSales)

    // Calculate months of stock remaining
    const monthsRemaining = avgMonthlySales > 0
      ? stockAfterDec / avgMonthlySales
      : 999

    // Determine priority
    let priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'SUFFICIENT' = 'SUFFICIENT'
    if (monthsRemaining < 2) priority = 'HIGH'
    else if (monthsRemaining < 4) priority = 'MEDIUM'
    else if (monthsRemaining < 6) priority = 'LOW'

    // Calculate recommended production (aim for 12 months of stock)
    const targetStock = avgMonthlySales * 12
    const recommendedProduction = Math.max(0, targetStock - stockAfterDec)

    // Get production history for this product
    const relatedBatches = productionHistory.filter(b => {
      const batchName = b.recipe_name.toLowerCase()
      const productName = normalizedName.toLowerCase()
      return productName.includes(batchName.split(' ')[0])
    })

    const notes: string[] = []
    if (monthsRemaining < 3) notes.push('⚠️ Low stock - urgent production needed')
    if (avgMonthlySales > 100) notes.push('📈 High demand product')
    if (relatedBatches.length === 0) notes.push('🆕 No production history found')

    productAnalyses.push({
      product_name: normalizedName,
      brand: stockItem.brand,
      total_units_sold_2025: salesProduct.totalUnits,
      total_sales_2025: salesProduct.totalNetSales,
      avg_monthly_sales: Math.round(avgMonthlySales * 10) / 10,
      sales_trend: 'stable', // TODO: Calculate trend
      current_stock: stockItem.current_stock,
      stock_after_dec_sales: stockAfterDec,
      total_batches_produced: relatedBatches.length,
      total_bottles_produced: 0, // TODO: Calculate from batches
      avg_batch_size: 0,
      last_production_date: relatedBatches[0]?.created_at,
      months_of_stock_remaining: Math.round(monthsRemaining * 10) / 10,
      recommended_production_2026: Math.round(recommendedProduction),
      priority,
      notes
    })
  }

  // Sort by priority
  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2, SUFFICIENT: 3 }
  productAnalyses.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  // Save analysis
  const outputPath = path.join(process.cwd(), 'data', 'production_planning_2026.json')
  fs.writeFileSync(outputPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    summary: {
      total_products: productAnalyses.length,
      high_priority: productAnalyses.filter(p => p.priority === 'HIGH').length,
      medium_priority: productAnalyses.filter(p => p.priority === 'MEDIUM').length,
      low_priority: productAnalyses.filter(p => p.priority === 'LOW').length,
      sufficient_stock: productAnalyses.filter(p => p.priority === 'SUFFICIENT').length,
      total_production_needed: productAnalyses.reduce((sum, p) => sum + p.recommended_production_2026, 0)
    },
    products: productAnalyses
  }, null, 2))

  console.log(`\n✅ Analysis complete! Saved to: ${outputPath}\n`)

  // Print summary
  console.log('📊 PRODUCTION PLANNING SUMMARY:\n')
  console.log(`Total Products Analyzed: ${productAnalyses.length}`)
  console.log(`HIGH Priority: ${productAnalyses.filter(p => p.priority === 'HIGH').length}`)
  console.log(`MEDIUM Priority: ${productAnalyses.filter(p => p.priority === 'MEDIUM').length}`)
  console.log(`LOW Priority: ${productAnalyses.filter(p => p.priority === 'LOW').length}`)
  console.log(`SUFFICIENT Stock: ${productAnalyses.filter(p => p.priority === 'SUFFICIENT').length}`)
  console.log(`\nTotal Units to Produce in 2026: ${productAnalyses.reduce((sum, p) => sum + p.recommended_production_2026, 0).toLocaleString()}`)
}

main().catch(console.error)

