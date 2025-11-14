import * as fs from 'fs'
import * as path from 'path'
import salesAnalytics from '../data/sales_analytics_2025.json'
import planningData from '../data/production_planning_2026.json'
import bottlesPerBatch from '../data/bottles_per_batch.json'

interface ProductionPlan {
  product_name: string
  sku_code: string
  brand: string
  
  // Sales Analysis
  sales_2025_actual: number
  sales_2025_value: number
  avg_monthly_sales: number
  sales_2026_projected: number // 10% growth
  
  // Stock Position
  current_stock_nov_13: number
  stock_after_dec_sales: number
  
  // Production Requirements
  production_needed_units: number
  bottles_per_batch: number
  batches_needed: number
  batches_needed_rounded: number
  total_production_units: number
  
  // Stock Coverage
  months_of_stock_current: number
  months_of_stock_after_production: number
  safety_buffer_months: number
  
  // Priority & Scheduling
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SUFFICIENT'
  recommended_quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'NONE'
  recommended_month: string
  
  // Production Notes
  notes: string[]
  production_type: 'GIN' | 'RUM' | 'VODKA' | 'CANE_SPIRIT' | 'LIQUEUR' | 'WHISKY'
  equipment_needed: string[]
}

interface QuarterlySchedule {
  quarter: string
  months: string[]
  total_batches: number
  total_units: number
  products: Array<{
    product: string
    batches: number
    units: number
    priority: string
  }>
  equipment_usage: {
    gin_still_days: number
    rum_still_days: number
    fermentation_tanks: number
  }
}

const GROWTH_RATE = 0.10 // 10% growth
const SAFETY_BUFFER_MONTHS = 6 // Target 6 months safety stock
const BATCH_PRODUCTION_DAYS = 3 // Average days per batch (fermentation + distillation + bottling)

function normalizeProductName(salesName: string): string {
  const name = salesName.toLowerCase()
  
  // Gins
  if (name.includes('rainforest') && name.includes('700')) return 'Rainforest_700'
  if (name.includes('rainforest') && name.includes('200')) return 'Rainforest_200'
  if (name.includes('signature') && name.includes('700')) return 'Signature_700'
  if (name.includes('signature') && name.includes('200')) return 'Signature_200'
  if (name.includes('navy') && name.includes('700')) return 'Navy_700'
  if (name.includes('navy') && name.includes('200')) return 'Navy_200'
  if (name.includes('wet season') && name.includes('700')) return 'Wet_Season_700'
  if (name.includes('dry season') && name.includes('700')) return 'Dry_Season_700'
  
  // Rums
  if (name.includes('pineapple') && name.includes('700')) return 'Pineapple_700'
  if (name.includes('pineapple') && name.includes('200')) return 'Pineapple_200'
  if (name.includes('spiced') && name.includes('700')) return 'Spiced_700'
  if (name.includes('spiced') && name.includes('200')) return 'Spiced_200'
  if (name.includes('reserve') && name.includes('rum')) return 'Reserve_Rum_700'
  
  // Cane Spirit
  if (name.includes('cane') && name.includes('700')) return 'Cane_Spirit_700'
  if (name.includes('cane') && name.includes('200')) return 'Cane_Spirit_200'
  
  // Coffee Liqueur
  if (name.includes('coffee')) return 'Coffee_Liqueur_700'
  
  // Merchant Mae
  if (name.includes('merchant') && name.includes('gin')) return 'Merchant_Mae_Gin'
  if (name.includes('merchant') && name.includes('vodka')) return 'Merchant_Mae_Vodka'
  if (name.includes('merchant') && name.includes('white')) return 'Merchant_Mae_White_Rum'
  if (name.includes('merchant') && name.includes('dark')) return 'Merchant_Mae_Dark_Rum'
  
  return salesName
}

function getProductionType(productName: string): 'GIN' | 'RUM' | 'VODKA' | 'CANE_SPIRIT' | 'LIQUEUR' | 'WHISKY' {
  if (productName.includes('Gin')) return 'GIN'
  if (productName.includes('Rum')) return 'RUM'
  if (productName.includes('Vodka')) return 'VODKA'
  if (productName.includes('Cane')) return 'CANE_SPIRIT'
  if (productName.includes('Coffee')) return 'LIQUEUR'
  if (productName.includes('Whisky')) return 'WHISKY'
  return 'GIN'
}

function getEquipmentNeeded(productionType: string): string[] {
  switch (productionType) {
    case 'GIN':
      return ['Gin Still', 'Botanicals', 'Neutral Spirit Base', 'Bottling Line']
    case 'RUM':
      return ['Rum Still', 'Fermentation Tank', 'Molasses/Sugar', 'Bottling Line']
    case 'VODKA':
      return ['Vodka Column Still', 'Neutral Spirit Base', 'Bottling Line']
    case 'CANE_SPIRIT':
      return ['Rum Still', 'Fermentation Tank', 'Sugar Cane', 'Bottling Line']
    case 'LIQUEUR':
      return ['Mixing Tank', 'Coffee/Ingredients', 'Neutral Spirit Base', 'Bottling Line']
    default:
      return ['Production Equipment', 'Bottling Line']
  }
}

function determinePriority(monthsRemaining: number): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SUFFICIENT' {
  if (monthsRemaining < 1) return 'CRITICAL'
  if (monthsRemaining < 2) return 'HIGH'
  if (monthsRemaining < 4) return 'MEDIUM'
  if (monthsRemaining < 6) return 'LOW'
  return 'SUFFICIENT'
}

function recommendQuarter(priority: string, monthsRemaining: number): { quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'NONE', month: string } {
  if (priority === 'CRITICAL' || priority === 'HIGH') {
    return { quarter: 'Q1', month: 'January 2026' }
  }
  if (priority === 'MEDIUM') {
    return { quarter: 'Q2', month: 'April 2026' }
  }
  if (priority === 'LOW') {
    return { quarter: 'Q3', month: 'July 2026' }
  }
  return { quarter: 'NONE', month: 'Not needed in 2026' }
}

async function main() {
  console.log('🚀 Generating comprehensive 2026 Production Plan...\n')

  const productionPlans: ProductionPlan[] = []
  const bottleCapacity = bottlesPerBatch.bottles_per_batch as Record<string, number>

  // Process each product from planning data
  for (const product of planningData.products) {
    const normalizedName = normalizeProductName(product.product_name)
    const bottlesPerBatchValue = bottleCapacity[normalizedName] || 500 // Default fallback

    // Calculate 2026 projections with 10% growth
    const sales2026Projected = Math.round(product.total_units_sold_2025 * (1 + GROWTH_RATE))
    
    // Calculate production needed
    const productionNeeded = Math.max(0, sales2026Projected - product.stock_after_dec_sales)
    const batchesNeeded = productionNeeded / bottlesPerBatchValue
    const batchesRounded = Math.ceil(batchesNeeded)
    const totalProduction = batchesRounded * bottlesPerBatchValue

    // Calculate stock coverage
    const monthsAfterProduction = product.avg_monthly_sales > 0
      ? (product.stock_after_dec_sales + totalProduction) / product.avg_monthly_sales
      : 999

    const priority = determinePriority(product.months_of_stock_remaining)
    const scheduling = recommendQuarter(priority, product.months_of_stock_remaining)
    const productionType = getProductionType(product.product_name)

    const notes: string[] = []
    if (product.months_of_stock_remaining < 2) {
      notes.push('⚠️ URGENT - Stock critically low')
    }
    if (batchesRounded > 5) {
      notes.push(`📦 Large production run - ${batchesRounded} batches needed`)
    }
    if (product.avg_monthly_sales > 100) {
      notes.push('📈 High-demand product')
    }
    if (monthsAfterProduction > 12) {
      notes.push('✅ Production will provide 12+ months coverage')
    }

    productionPlans.push({
      product_name: product.product_name,
      sku_code: normalizedName,
      brand: product.brand,
      sales_2025_actual: product.total_units_sold_2025,
      sales_2025_value: product.total_sales_2025,
      avg_monthly_sales: product.avg_monthly_sales,
      sales_2026_projected: sales2026Projected,
      current_stock_nov_13: product.current_stock,
      stock_after_dec_sales: product.stock_after_dec_sales,
      production_needed_units: productionNeeded,
      bottles_per_batch: bottlesPerBatchValue,
      batches_needed: batchesNeeded,
      batches_needed_rounded: batchesRounded,
      total_production_units: totalProduction,
      months_of_stock_current: product.months_of_stock_remaining,
      months_of_stock_after_production: monthsAfterProduction,
      safety_buffer_months: SAFETY_BUFFER_MONTHS,
      priority,
      recommended_quarter: scheduling.quarter,
      recommended_month: scheduling.month,
      notes,
      production_type: productionType,
      equipment_needed: getEquipmentNeeded(productionType)
    })
  }

  // Sort by priority
  const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, SUFFICIENT: 4 }
  productionPlans.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  // Generate quarterly schedules
  const quarters: QuarterlySchedule[] = [
    { quarter: 'Q1 2026', months: ['January', 'February', 'March'], total_batches: 0, total_units: 0, products: [], equipment_usage: { gin_still_days: 0, rum_still_days: 0, fermentation_tanks: 0 } },
    { quarter: 'Q2 2026', months: ['April', 'May', 'June'], total_batches: 0, total_units: 0, products: [], equipment_usage: { gin_still_days: 0, rum_still_days: 0, fermentation_tanks: 0 } },
    { quarter: 'Q3 2026', months: ['July', 'August', 'September'], total_batches: 0, total_units: 0, products: [], equipment_usage: { gin_still_days: 0, rum_still_days: 0, fermentation_tanks: 0 } },
    { quarter: 'Q4 2026', months: ['October', 'November', 'December'], total_batches: 0, total_units: 0, products: [], equipment_usage: { gin_still_days: 0, rum_still_days: 0, fermentation_tanks: 0 } }
  ]

  for (const plan of productionPlans) {
    if (plan.recommended_quarter === 'NONE') continue

    const quarterIndex = parseInt(plan.recommended_quarter.substring(1)) - 1
    const quarter = quarters[quarterIndex]

    quarter.total_batches += plan.batches_needed_rounded
    quarter.total_units += plan.total_production_units
    quarter.products.push({
      product: plan.product_name,
      batches: plan.batches_needed_rounded,
      units: plan.total_production_units,
      priority: plan.priority
    })

    // Calculate equipment usage
    const productionDays = plan.batches_needed_rounded * BATCH_PRODUCTION_DAYS
    if (plan.production_type === 'GIN') {
      quarter.equipment_usage.gin_still_days += productionDays
    } else if (plan.production_type === 'RUM' || plan.production_type === 'CANE_SPIRIT') {
      quarter.equipment_usage.rum_still_days += productionDays
      quarter.equipment_usage.fermentation_tanks += plan.batches_needed_rounded
    }
  }

  // Calculate summary statistics
  const summary = {
    total_products: productionPlans.length,
    products_needing_production: productionPlans.filter(p => p.batches_needed_rounded > 0).length,
    total_batches_2026: productionPlans.reduce((sum, p) => sum + p.batches_needed_rounded, 0),
    total_units_2026: productionPlans.reduce((sum, p) => sum + p.total_production_units, 0),
    total_sales_2025: productionPlans.reduce((sum, p) => sum + p.sales_2025_value, 0),
    projected_sales_2026: productionPlans.reduce((sum, p) => sum + (p.sales_2025_value * 1.1), 0),
    by_priority: {
      critical: productionPlans.filter(p => p.priority === 'CRITICAL').length,
      high: productionPlans.filter(p => p.priority === 'HIGH').length,
      medium: productionPlans.filter(p => p.priority === 'MEDIUM').length,
      low: productionPlans.filter(p => p.priority === 'LOW').length,
      sufficient: productionPlans.filter(p => p.priority === 'SUFFICIENT').length
    },
    by_production_type: {
      gin: productionPlans.filter(p => p.production_type === 'GIN').reduce((sum, p) => sum + p.batches_needed_rounded, 0),
      rum: productionPlans.filter(p => p.production_type === 'RUM').reduce((sum, p) => sum + p.batches_needed_rounded, 0),
      vodka: productionPlans.filter(p => p.production_type === 'VODKA').reduce((sum, p) => sum + p.batches_needed_rounded, 0),
      cane_spirit: productionPlans.filter(p => p.production_type === 'CANE_SPIRIT').reduce((sum, p) => sum + p.batches_needed_rounded, 0),
      liqueur: productionPlans.filter(p => p.production_type === 'LIQUEUR').reduce((sum, p) => sum + p.batches_needed_rounded, 0)
    }
  }

  // Save complete plan
  const outputPath = path.join(process.cwd(), 'data', 'production_plan_2026_complete.json')
  fs.writeFileSync(outputPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    assumptions: {
      growth_rate: GROWTH_RATE,
      safety_buffer_months: SAFETY_BUFFER_MONTHS,
      batch_production_days: BATCH_PRODUCTION_DAYS
    },
    summary,
    quarterly_schedule: quarters,
    product_plans: productionPlans
  }, null, 2))

  console.log(`✅ Complete 2026 Production Plan saved to: ${outputPath}\n`)

  // Print executive summary
  console.log('═══════════════════════════════════════════════════════════')
  console.log('           2026 PRODUCTION PLAN - EXECUTIVE SUMMARY')
  console.log('═══════════════════════════════════════════════════════════\n')

  console.log(`📊 OVERVIEW:`)
  console.log(`   Total Products: ${summary.total_products}`)
  console.log(`   Products Needing Production: ${summary.products_needing_production}`)
  console.log(`   Total Batches Required: ${summary.total_batches_2026}`)
  console.log(`   Total Units to Produce: ${summary.total_units_2026.toLocaleString()}\n`)

  console.log(`💰 FINANCIAL:`)
  console.log(`   2025 Sales (Actual): $${summary.total_sales_2025.toLocaleString()}`)
  console.log(`   2026 Sales (Projected +10%): $${summary.projected_sales_2026.toLocaleString()}\n`)

  console.log(`🚨 PRIORITY BREAKDOWN:`)
  console.log(`   CRITICAL: ${summary.by_priority.critical} products`)
  console.log(`   HIGH: ${summary.by_priority.high} products`)
  console.log(`   MEDIUM: ${summary.by_priority.medium} products`)
  console.log(`   LOW: ${summary.by_priority.low} products`)
  console.log(`   SUFFICIENT: ${summary.by_priority.sufficient} products\n`)

  console.log(`🏭 PRODUCTION BY TYPE:`)
  console.log(`   Gin Batches: ${summary.by_production_type.gin}`)
  console.log(`   Rum Batches: ${summary.by_production_type.rum}`)
  console.log(`   Vodka Batches: ${summary.by_production_type.vodka}`)
  console.log(`   Cane Spirit Batches: ${summary.by_production_type.cane_spirit}`)
  console.log(`   Liqueur Batches: ${summary.by_production_type.liqueur}\n`)

  console.log(`📅 QUARTERLY SCHEDULE:\n`)
  for (const quarter of quarters) {
    console.log(`${quarter.quarter}:`)
    console.log(`   Batches: ${quarter.total_batches}`)
    console.log(`   Units: ${quarter.total_units.toLocaleString()}`)
    console.log(`   Gin Still Days: ${quarter.equipment_usage.gin_still_days}`)
    console.log(`   Rum Still Days: ${quarter.equipment_usage.rum_still_days}`)
    console.log(`   Fermentation Tanks Needed: ${quarter.equipment_usage.fermentation_tanks}`)
    console.log(`   Products: ${quarter.products.length}\n`)
  }

  console.log('═══════════════════════════════════════════════════════════\n')
}

main().catch(console.error)

