import fs from 'fs'
import path from 'path'

// Load demand and stock analysis
const analysisPath = path.join(process.cwd(), 'data', 'demand_and_stock_analysis_2026.json')
const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'))

// Load batch yields
const batchYieldsPath = path.join(process.cwd(), 'data', 'bottles_per_batch.json')
const batchYields = JSON.parse(fs.readFileSync(batchYieldsPath, 'utf-8'))

// Map product families to batch yields
const BATCH_YIELDS: Record<string, { bottles_700ml: number; bottles_200ml: number; total: number }> = {
  'Signature Gin': {
    bottles_700ml: batchYields.bottles_per_batch.Signature_700,
    bottles_200ml: batchYields.bottles_per_batch.Signature_200,
    total: batchYields.bottles_per_batch.Signature_700 + batchYields.bottles_per_batch.Signature_200,
  },
  'Rainforest Gin': {
    bottles_700ml: batchYields.bottles_per_batch.Rainforest_700,
    bottles_200ml: batchYields.bottles_per_batch.Rainforest_200,
    total: batchYields.bottles_per_batch.Rainforest_700 + batchYields.bottles_per_batch.Rainforest_200,
  },
  'Navy Gin': {
    bottles_700ml: batchYields.bottles_per_batch.Navy_700,
    bottles_200ml: batchYields.bottles_per_batch.Navy_200,
    total: batchYields.bottles_per_batch.Navy_700 + batchYields.bottles_per_batch.Navy_200,
  },
  'Wet Season Gin': {
    bottles_700ml: batchYields.bottles_per_batch.Wet_Season_700,
    bottles_200ml: 0,
    total: batchYields.bottles_per_batch.Wet_Season_700,
  },
  'Dry Season Gin': {
    bottles_700ml: batchYields.bottles_per_batch.Dry_Season_700,
    bottles_200ml: 0,
    total: batchYields.bottles_per_batch.Dry_Season_700,
  },
  'Merchant Mae Gin': {
    bottles_700ml: batchYields.bottles_per_batch.Merchant_Mae_Gin,
    bottles_200ml: 0,
    total: batchYields.bottles_per_batch.Merchant_Mae_Gin,
  },
  'Merchant Mae Vodka': {
    bottles_700ml: batchYields.bottles_per_batch.Merchant_Mae_Vodka,
    bottles_200ml: 0,
    total: batchYields.bottles_per_batch.Merchant_Mae_Vodka,
  },
  'Merchant Mae White Rum': {
    bottles_700ml: batchYields.bottles_per_batch.Merchant_Mae_White_Rum,
    bottles_200ml: 0,
    total: batchYields.bottles_per_batch.Merchant_Mae_White_Rum,
  },
  'Merchant Mae Dark Rum': {
    bottles_700ml: batchYields.bottles_per_batch.Merchant_Mae_Dark_Rum,
    bottles_200ml: 0,
    total: batchYields.bottles_per_batch.Merchant_Mae_Dark_Rum,
  },
  'Spiced Rum': {
    bottles_700ml: batchYields.bottles_per_batch.Spiced_700,
    bottles_200ml: batchYields.bottles_per_batch.Spiced_200,
    total: batchYields.bottles_per_batch.Spiced_700 + batchYields.bottles_per_batch.Spiced_200,
  },
  'Pineapple Rum': {
    bottles_700ml: batchYields.bottles_per_batch.Pineapple_700,
    bottles_200ml: batchYields.bottles_per_batch.Pineapple_200,
    total: batchYields.bottles_per_batch.Pineapple_700 + batchYields.bottles_per_batch.Pineapple_200,
  },
  'Reserve Cask Rum': {
    bottles_700ml: batchYields.bottles_per_batch.Reserve_Rum_700,
    bottles_200ml: 0,
    total: batchYields.bottles_per_batch.Reserve_Rum_700,
  },
  'Australian Cane Spirit': {
    bottles_700ml: batchYields.bottles_per_batch.Cane_Spirit_700,
    bottles_200ml: batchYields.bottles_per_batch.Cane_Spirit_200,
    total: batchYields.bottles_per_batch.Cane_Spirit_700 + batchYields.bottles_per_batch.Cane_Spirit_200,
  },
  'Coffee Liqueur': {
    bottles_700ml: batchYields.bottles_per_batch.Coffee_Liqueur_700,
    bottles_200ml: 0,
    total: batchYields.bottles_per_batch.Coffee_Liqueur_700,
  },
}

// Production types
const PRODUCTION_TYPES: Record<string, 'GIN' | 'RUM' | 'VODKA' | 'CANE_SPIRIT' | 'LIQUEUR'> = {
  'Signature Gin': 'GIN',
  'Rainforest Gin': 'GIN',
  'Navy Gin': 'GIN',
  'Wet Season Gin': 'GIN',
  'Dry Season Gin': 'GIN',
  'Merchant Mae Gin': 'GIN',
  'Merchant Mae Vodka': 'VODKA',
  'Merchant Mae White Rum': 'RUM',
  'Merchant Mae Dark Rum': 'RUM',
  'Spiced Rum': 'RUM',
  'Pineapple Rum': 'RUM',
  'Reserve Cask Rum': 'RUM',
  'Australian Cane Spirit': 'CANE_SPIRIT',
  'Coffee Liqueur': 'LIQUEUR',
}

interface ProductionBatch {
  product: string
  batch_number: number
  total_batches?: number
  bottles_700ml: number
  bottles_200ml: number
  total_bottles: number
  production_type: string
  scheduled_month: number
  scheduled_month_name: string
}

interface ProductionPlan {
  product: string
  priority: string
  current_stock: number
  total_demand_2026: number
  batches_needed: number
  bottles_per_batch: number
  production_schedule: ProductionBatch[]
  stock_projection: {
    month: number
    month_name: string
    starting_stock: number
    production: number
    demand: number
    ending_stock: number
    months_of_stock: number
    status: string
  }[]
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

console.log('╔════════════════════════════════════════════════════════════════╗')
console.log('║                                                                ║')
console.log('║         2026 PRODUCTION PLAN - WITH BATCH SCHEDULING           ║')
console.log('║                                                                ║')
console.log('╚════════════════════════════════════════════════════════════════╝\n')

const productionPlans: ProductionPlan[] = []

// Process each product
for (const productAnalysis of analysis.product_analyses) {
  const family = productAnalysis.family
  const batchYield = BATCH_YIELDS[family]
  
  if (!batchYield) {
    console.log(`⚠️ No batch yield data for ${family}, skipping...`)
    continue
  }
  
  const totalDemand = productAnalysis.demand_analysis.total_2026_forecast
  let currentStock = productAnalysis.current_stock_nov_2025
  const avgMonthlyDemand = totalDemand / 12

  // SPECIAL CASE: Merchant Mae White Rum Batch 1/3 was produced in December 2025
  // Add that production to starting stock for 2026 planning
  if (family === 'Merchant Mae White Rum') {
    currentStock += batchYield.total // Add December 2025 batch to starting stock
    console.log(`  ⚠️ SPECIAL: White Rum Batch 1/3 produced in Dec 2025, adding ${batchYield.total} to starting stock`)
  }

  // Calculate how many batches needed for 2026
  const bottlesNeeded = Math.max(0, totalDemand - currentStock)
  let batchesNeeded = Math.ceil(bottlesNeeded / batchYield.total)

  // Add buffer batches for 2027 if ending stock is low
  const projectedEndStock = currentStock + (batchesNeeded * batchYield.total) - totalDemand
  const endMonthsOfStock = avgMonthlyDemand > 0 ? projectedEndStock / avgMonthlyDemand : 999

  let bufferBatches = 0
  if (endMonthsOfStock < productAnalysis.buffer_months && productAnalysis.priority !== 'LOW') {
    // Add batches to reach buffer target
    const bufferTarget = avgMonthlyDemand * productAnalysis.buffer_months
    const bufferNeeded = Math.max(0, bufferTarget - projectedEndStock)
    bufferBatches = Math.ceil(bufferNeeded / batchYield.total)
    batchesNeeded += bufferBatches
  }
  
  console.log(`\n${family} (${productAnalysis.priority} priority)`)
  console.log(`  Current Stock: ${currentStock} bottles`)
  console.log(`  2026 Demand: ${totalDemand} bottles`)
  console.log(`  Batches Needed: ${batchesNeeded} batches`)
  if (bufferBatches > 0) {
    console.log(`    → 2026 demand: ${batchesNeeded - bufferBatches} batches`)
    console.log(`    → 2027 buffer: ${bufferBatches} batches`)
  }

  // Schedule production batches
  const productionSchedule: ProductionBatch[] = []

  if (batchesNeeded > 0) {
    // Determine when to schedule based on priority and stockout timing
    const stockoutMonth = productAnalysis.stock_simulation_2026.find((s: any) => s.status === 'STOCKOUT')
    const criticalMonth = productAnalysis.stock_simulation_2026.find((s: any) => s.status === 'CRITICAL')

    let startMonth = 1 // Default to January
    let spreadMonths = 2 // How many months to spread batches across

    if (stockoutMonth) {
      // Schedule before stockout month
      startMonth = Math.max(1, stockoutMonth.month - 2)
      spreadMonths = 2
    } else if (criticalMonth) {
      // Schedule before critical month
      startMonth = Math.max(1, criticalMonth.month - 1)
      spreadMonths = 3
    } else if (productAnalysis.priority === 'CRITICAL') {
      // Critical: front-load in Q1
      startMonth = 1
      spreadMonths = 3
    } else if (productAnalysis.priority === 'HIGH') {
      // High priority: Q1-Q2
      startMonth = 1
      spreadMonths = 4
    } else {
      // Lower priority: Q2-Q3
      startMonth = 4
      spreadMonths = 3
    }

    // Special rules
    if (family === 'Australian Cane Spirit') {
      // Cane Spirit only after August (month 8 = August, so we want month 9+ for "after August")
      startMonth = Math.max(9, startMonth)
      spreadMonths = 2
    }

    // SPECIAL CASE: White Rum - January is occupied by Vodka (weeks 4-6)
    // Schedule White Rum for April instead to ensure correct chronological order
    if (family === 'Merchant Mae White Rum') {
      startMonth = 4 // April - after Vodka production in January
      spreadMonths = 1 // Keep batches close together
    }

    // For buffer batches, schedule later in the year
    const demandBatches = batchesNeeded - bufferBatches

    // Schedule batches - spread evenly across months
    for (let i = 0; i < batchesNeeded; i++) {
      let scheduledMonth: number

      if (i < demandBatches) {
        // Demand batches: schedule early
        const monthOffset = Math.floor((i * spreadMonths) / Math.max(1, demandBatches))
        // Cap at July UNLESS it's Cane Spirit (which must be after August)
        const maxMonth = family === 'Australian Cane Spirit' ? 12 : 7
        scheduledMonth = Math.min(maxMonth, startMonth + monthOffset)
      } else {
        // Buffer batches: schedule in Q2-Q3 (Apr-Jul) UNLESS it's Cane Spirit
        const bufferIndex = i - demandBatches
        if (family === 'Australian Cane Spirit') {
          scheduledMonth = Math.min(12, 9 + bufferIndex) // Sep-Dec for Cane Spirit
        } else {
          scheduledMonth = Math.min(7, 4 + bufferIndex) // Apr-Jul for others
        }
      }

      // SPECIAL CASE: White Rum batch numbering starts at 2 (batch 1 was Dec 2025)
      const batchNumber = family === 'Merchant Mae White Rum' ? i + 2 : i + 1
      const totalBatches = family === 'Merchant Mae White Rum' ? batchesNeeded + 1 : batchesNeeded

      productionSchedule.push({
        product: family,
        batch_number: batchNumber,
        total_batches: totalBatches,
        bottles_700ml: batchYield.bottles_700ml,
        bottles_200ml: batchYield.bottles_200ml,
        total_bottles: batchYield.total,
        production_type: PRODUCTION_TYPES[family],
        scheduled_month: scheduledMonth,
        scheduled_month_name: MONTH_NAMES[scheduledMonth - 1],
      })
    }

    console.log(`  Production Schedule:`)
    productionSchedule.forEach(batch => {
      const totalBatches = batch.total_batches || batchesNeeded
      console.log(`    - Batch ${batch.batch_number}/${totalBatches}: ${batch.scheduled_month_name} 2026`)
    })
  } else {
    console.log(`  ✅ No production needed - sufficient stock`)
  }

  // Simulate stock with production
  const stockProjection = []
  let stock = currentStock

  for (let month = 1; month <= 12; month++) {
    const demand = productAnalysis.demand_analysis.monthly_2026_forecast[month - 1].demand
    const production = productionSchedule
      .filter(b => b.scheduled_month === month)
      .reduce((sum, b) => sum + b.total_bottles, 0)

    const ending_stock = Math.max(0, stock + production - demand)
    const avg_monthly_demand = totalDemand / 12
    const months_of_stock = avg_monthly_demand > 0 ? ending_stock / avg_monthly_demand : 999

    let status = 'OK'
    if (ending_stock === 0) status = 'STOCKOUT'
    else if (ending_stock < avg_monthly_demand) status = 'CRITICAL'
    else if (ending_stock < avg_monthly_demand * productAnalysis.buffer_months) status = 'LOW'

    stockProjection.push({
      month,
      month_name: MONTH_NAMES[month - 1],
      starting_stock: stock,
      production,
      demand,
      ending_stock,
      months_of_stock,
      status,
    })

    stock = ending_stock
  }

  productionPlans.push({
    product: family,
    priority: productAnalysis.priority,
    current_stock: currentStock,
    total_demand_2026: totalDemand,
    batches_needed: batchesNeeded,
    bottles_per_batch: batchYield.total,
    production_schedule: productionSchedule,
    stock_projection: stockProjection,
  })
}

// Display summary
console.log('\n\n╔════════════════════════════════════════════════════════════════╗')
console.log('║                                                                ║')
console.log('║                    PRODUCTION SUMMARY 2026                     ║')
console.log('║                                                                ║')
console.log('╚════════════════════════════════════════════════════════════════╝\n')

// Group by production type
const byType = new Map<string, ProductionPlan[]>()
for (const plan of productionPlans) {
  const type = PRODUCTION_TYPES[plan.product]
  if (!byType.has(type)) byType.set(type, [])
  byType.get(type)!.push(plan)
}

// Display by type
for (const [type, plans] of byType.entries()) {
  const totalBatches = plans.reduce((sum, p) => sum + p.batches_needed, 0)
  if (totalBatches === 0) continue

  console.log(`\n${type} PRODUCTION:`)
  console.log('─'.repeat(60))

  for (const plan of plans.filter(p => p.batches_needed > 0)) {
    console.log(`\n  ${plan.product}: ${plan.batches_needed} batches`)
    plan.production_schedule.forEach(batch => {
      console.log(`    → ${batch.scheduled_month_name}: Batch ${batch.batch_number}`)
    })
  }
}

// Monthly production schedule
console.log('\n\n╔════════════════════════════════════════════════════════════════╗')
console.log('║                                                                ║')
console.log('║                  MONTHLY PRODUCTION SCHEDULE                   ║')
console.log('║                                                                ║')
console.log('╚════════════════════════════════════════════════════════════════╝\n')

for (let month = 1; month <= 12; month++) {
  const monthName = MONTH_NAMES[month - 1]
  const monthBatches = productionPlans
    .flatMap(p => p.production_schedule)
    .filter(b => b.scheduled_month === month)

  if (monthBatches.length === 0) continue

  console.log(`\n${monthName} 2026:`)

  // Group by type
  const ginBatches = monthBatches.filter(b => b.production_type === 'GIN')
  const rumBatches = monthBatches.filter(b => b.production_type === 'RUM')
  const vodkaBatches = monthBatches.filter(b => b.production_type === 'VODKA')
  const caneBatches = monthBatches.filter(b => b.production_type === 'CANE_SPIRIT')
  const liqueurBatches = monthBatches.filter(b => b.production_type === 'LIQUEUR')

  if (ginBatches.length > 0) {
    console.log(`  GIN (${ginBatches.length} batches):`)
    ginBatches.forEach(b => console.log(`    - ${b.product}`))
  }

  if (rumBatches.length > 0) {
    console.log(`  RUM (${rumBatches.length} batches):`)
    rumBatches.forEach(b => console.log(`    - ${b.product}`))
  }

  if (vodkaBatches.length > 0) {
    console.log(`  VODKA (${vodkaBatches.length} batches):`)
    vodkaBatches.forEach(b => console.log(`    - ${b.product}`))
  }

  if (caneBatches.length > 0) {
    console.log(`  CANE SPIRIT (${caneBatches.length} batches):`)
    caneBatches.forEach(b => console.log(`    - ${b.product}`))
  }

  if (liqueurBatches.length > 0) {
    console.log(`  LIQUEUR (${liqueurBatches.length} batches):`)
    liqueurBatches.forEach(b => console.log(`    - ${b.product}`))
  }
}

// Overall statistics
console.log('\n\n╔════════════════════════════════════════════════════════════════╗')
console.log('║                                                                ║')
console.log('║                      OVERALL STATISTICS                        ║')
console.log('║                                                                ║')
console.log('╚════════════════════════════════════════════════════════════════╝\n')

const totalBatches = productionPlans.reduce((sum, p) => sum + p.batches_needed, 0)

const ginBatches = productionPlans.filter(p => PRODUCTION_TYPES[p.product] === 'GIN').reduce((sum, p) => sum + p.batches_needed, 0)
const rumBatches = productionPlans.filter(p => PRODUCTION_TYPES[p.product] === 'RUM').reduce((sum, p) => sum + p.batches_needed, 0)
const vodkaBatches = productionPlans.filter(p => PRODUCTION_TYPES[p.product] === 'VODKA').reduce((sum, p) => sum + p.batches_needed, 0)
const caneBatches = productionPlans.filter(p => PRODUCTION_TYPES[p.product] === 'CANE_SPIRIT').reduce((sum, p) => sum + p.batches_needed, 0)

console.log(`Total Batches: ${totalBatches}`)
console.log(`\nBy Type:`)
console.log(`  Gin: ${ginBatches} batches`)
console.log(`  Rum: ${rumBatches} batches`)
console.log(`  Vodka: ${vodkaBatches} batches`)
console.log(`  Cane Spirit: ${caneBatches} batches`)

// Save production plan
const outputPath = path.join(process.cwd(), 'data', 'production_plan_2026_v4.json')
fs.writeFileSync(outputPath, JSON.stringify({
  generated_at: new Date().toISOString(),
  production_plans: productionPlans,
}, null, 2))

console.log(`\n\n✅ Production plan saved to: ${outputPath}\n`)

