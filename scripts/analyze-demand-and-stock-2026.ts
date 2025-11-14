import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

// Product family mapping - combines 700ml + 200ml + pouches into families
const PRODUCT_FAMILIES: Record<string, string> = {
  // Gins
  'Rainforest Gin 700ml': 'Rainforest Gin',
  'Rainforest Gin 200ml': 'Rainforest Gin',
  'Navy Strength Gin 700ml': 'Navy Gin',
  'Navy Strength Gin 200ml': 'Navy Gin',
  'Signature Dry Gin 700ml': 'Signature Gin',
  'Signature Dry Gin 200ml': 'Signature Gin',
  'Wet Season Gin 700ml': 'Wet Season Gin',
  'Dry Season Gin 700ml': 'Dry Season Gin',
  'Merchant Mae Gin 700ml': 'Merchant Mae Gin',
  'Merchant Mae Gin 200ml': 'Merchant Mae Gin',
  
  // Vodka
  'Merchant Mae Vodka 700ml': 'Merchant Mae Vodka',
  'Merchant Mae Vodka 200ml': 'Merchant Mae Vodka',
  'Merchant Mae Vodka Pouch': 'Merchant Mae Vodka',
  
  // Rums
  'Merchant Mae White Rum 700ml': 'Merchant Mae White Rum',
  'Merchant Mae White Rum 200ml': 'Merchant Mae White Rum',
  'Merchant Mae Dark Rum 700ml': 'Merchant Mae Dark Rum',
  'Merchant Mae Dark Rum 200ml': 'Merchant Mae Dark Rum',
  'Spiced Rum 700ml': 'Spiced Rum',
  'Pineapple Rum 700ml': 'Pineapple Rum',
  'Reserve Cask Rum': 'Reserve Cask Rum',
  
  // Cane Spirit
  'Australian Cane Spirit 700ml': 'Australian Cane Spirit',
  
  // Limited Release
  'Coffee Liqueur': 'Coffee Liqueur',
}

// Product priorities
const PRODUCT_PRIORITIES: Record<string, { priority: string; buffer_months: number }> = {
  'Merchant Mae Vodka': { priority: 'CRITICAL', buffer_months: 1.5 },
  'Rainforest Gin': { priority: 'CRITICAL', buffer_months: 1.5 },
  'Navy Gin': { priority: 'HIGH', buffer_months: 1.5 },
  'Signature Gin': { priority: 'HIGH', buffer_months: 1.5 },
  'Merchant Mae Gin': { priority: 'HIGH', buffer_months: 1.5 },
  'Wet Season Gin': { priority: 'MEDIUM', buffer_months: 1.0 },
  'Dry Season Gin': { priority: 'MEDIUM', buffer_months: 1.0 },
  'Merchant Mae White Rum': { priority: 'HIGH', buffer_months: 1.0 },
  'Merchant Mae Dark Rum': { priority: 'HIGH', buffer_months: 1.0 },
  'Spiced Rum': { priority: 'MEDIUM', buffer_months: 1.0 },
  'Pineapple Rum': { priority: 'LOW', buffer_months: 1.0 },
  'Reserve Cask Rum': { priority: 'LOW', buffer_months: 1.0 },
  'Australian Cane Spirit': { priority: 'HIGH', buffer_months: 1.0 },
  'Coffee Liqueur': { priority: 'LOW', buffer_months: 1.0 },
}

interface SalesRecord {
  Date: string
  Item: string
  Qty: string
  Count: string
}

interface MonthlyDemand {
  month: number // 1-12
  year: number
  demand: number
}

interface ProductDemand {
  family: string
  monthly_2025: MonthlyDemand[]
  total_2025: number
  avg_monthly_2025: number
  monthly_2026_forecast: MonthlyDemand[]
  total_2026_forecast: number
}

interface StockSimulation {
  month: number
  month_name: string
  starting_stock: number
  production: number
  demand: number
  ending_stock: number
  months_of_stock: number
  buffer_target: number
  status: 'OK' | 'LOW' | 'CRITICAL' | 'STOCKOUT'
}

interface ProductAnalysis {
  family: string
  priority: string
  buffer_months: number
  current_stock_nov_2025: number
  demand_analysis: ProductDemand
  stock_simulation_2026: StockSimulation[]
  production_needed: {
    total_bottles: number
    batches_needed: number
    timing: string
  }
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function parseDate(dateStr: string): Date {
  const [month, day, year] = dateStr.split('/')
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
}

function parseQuantity(qtyStr: string): number {
  // Handle formats like "3,0" or "3.0" or "3"
  const cleaned = qtyStr.replace(/,/g, '.')
  return parseFloat(cleaned) || 0
}

console.log('Analyzing 2025 Sales Data and Forecasting 2026 Demand...\n')

// Load 2025 sales data
const salesCsvPath = path.join(process.cwd(), 'data', 'items-2025-01-01-2026-01-01(in).csv')
const salesCsv = fs.readFileSync(salesCsvPath, 'utf-8')
const salesRecords: SalesRecord[] = parse(salesCsv, {
  columns: true,
  skip_empty_lines: true,
})

console.log(`Loaded ${salesRecords.length} sales records from 2025\n`)

// Group sales by product family and month
const salesByFamilyAndMonth = new Map<string, Map<string, number>>()

for (const record of salesRecords) {
  const family = PRODUCT_FAMILIES[record.Item]
  if (!family) continue // Skip non-spirit items
  
  const date = parseDate(record.Date)
  const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  const qty = parseQuantity(record.Count || record.Qty)
  
  if (!salesByFamilyAndMonth.has(family)) {
    salesByFamilyAndMonth.set(family, new Map())
  }
  
  const familyMap = salesByFamilyAndMonth.get(family)!
  familyMap.set(monthKey, (familyMap.get(monthKey) || 0) + qty)
}

console.log(`Found ${salesByFamilyAndMonth.size} product families in sales data\n`)
console.log('Product Families:')
salesByFamilyAndMonth.forEach((_, family) => {
  console.log(`  - ${family}`)
})
console.log()

// Calculate demand analysis for each product
const demandAnalyses: ProductDemand[] = []

for (const [family, monthlyMap] of salesByFamilyAndMonth.entries()) {
  const monthly_2025: MonthlyDemand[] = []
  let total_2025 = 0
  
  // Extract monthly data for 2025
  for (let month = 1; month <= 12; month++) {
    const monthKey = `2025-${String(month).padStart(2, '0')}`
    const demand = monthlyMap.get(monthKey) || 0
    monthly_2025.push({ month, year: 2025, demand })
    total_2025 += demand
  }
  
  const avg_monthly_2025 = total_2025 / 12
  
  // Forecast 2026 with 10% growth, preserving seasonality
  const monthly_2026_forecast: MonthlyDemand[] = monthly_2025.map(m => ({
    month: m.month,
    year: 2026,
    demand: Math.round(m.demand * 1.10), // 10% growth
  }))
  
  const total_2026_forecast = monthly_2026_forecast.reduce((sum, m) => sum + m.demand, 0)
  
  demandAnalyses.push({
    family,
    monthly_2025,
    total_2025,
    avg_monthly_2025,
    monthly_2026_forecast,
    total_2026_forecast,
  })
}

console.log('2025 Sales Summary by Product Family:\n')
demandAnalyses
  .sort((a, b) => b.total_2025 - a.total_2025)
  .forEach(analysis => {
    console.log(`${analysis.family}:`)
    console.log(`  2025 Total: ${analysis.total_2025} bottles`)
    console.log(`  2025 Avg/Month: ${Math.round(analysis.avg_monthly_2025)} bottles`)
    console.log(`  2026 Forecast: ${analysis.total_2026_forecast} bottles (+10%)`)
    console.log()
  })

// Load current stock (Nov 2025)
const stockTakePath = path.join(process.cwd(), 'data', 'stock_take_2025-11-13.json')
const stockTake = JSON.parse(fs.readFileSync(stockTakePath, 'utf-8'))

// Product name mapping for stock take
const STOCK_NAME_TO_FAMILY: Record<string, string> = {
  'Rainforest': 'Rainforest Gin',
  'Signature': 'Signature Gin',
  'Navy': 'Navy Gin',
  'Cane Spirit': 'Australian Cane Spirit',
  'Wet Season': 'Wet Season Gin',
  'Dry Season': 'Dry Season Gin',
  'MM Gin': 'Merchant Mae Gin',
  'MM Vodka': 'Merchant Mae Vodka',
  'MM White Rum': 'Merchant Mae White Rum',
  'MM Dark Rum': 'Merchant Mae Dark Rum',
  'Spiced Rum': 'Spiced Rum',
  'Pineapple Rum': 'Pineapple Rum',
  'Reserve Rum': 'Reserve Cask Rum',
  'Coffee Liqueur': 'Coffee Liqueur',
}

// Map stock to product families
const currentStock = new Map<string, number>()

// Process Devils Thumb products
for (const item of stockTake.stock_take.devils) {
  const family = STOCK_NAME_TO_FAMILY[item.product]
  if (family) {
    const totalQty = item.sizes.reduce((sum: number, size: any) => sum + size.quantity, 0)
    currentStock.set(family, (currentStock.get(family) || 0) + totalQty)
  }
}

// Process Merchant Mae products
for (const item of stockTake.stock_take.merchant_mae) {
  const family = STOCK_NAME_TO_FAMILY[item.product]
  if (family) {
    const totalQty = item.sizes.reduce((sum: number, size: any) => sum + size.quantity, 0)
    currentStock.set(family, (currentStock.get(family) || 0) + totalQty)
  }
}

console.log('Current Stock (Nov 2025) by Product Family:\n')
currentStock.forEach((qty, family) => {
  console.log(`  ${family}: ${qty} bottles`)
})
console.log()

// Simulate stock depletion for 2026 (NO production scheduled yet)
console.log('═══════════════════════════════════════════════════════════════')
console.log('STOCK SIMULATION 2026 - WITHOUT PRODUCTION')
console.log('═══════════════════════════════════════════════════════════════\n')

const productAnalyses: ProductAnalysis[] = []

for (const demandAnalysis of demandAnalyses) {
  const family = demandAnalysis.family
  const priorityInfo = PRODUCT_PRIORITIES[family] || { priority: 'LOW', buffer_months: 1.0 }
  const starting_stock = currentStock.get(family) || 0

  const simulation: StockSimulation[] = []
  let stock = starting_stock

  for (let month = 1; month <= 12; month++) {
    const demand = demandAnalysis.monthly_2026_forecast[month - 1].demand
    const production = 0 // No production scheduled yet
    const ending_stock = Math.max(0, stock - demand)

    const avg_monthly_demand = demandAnalysis.total_2026_forecast / 12
    const months_of_stock = avg_monthly_demand > 0 ? ending_stock / avg_monthly_demand : 999
    const buffer_target = avg_monthly_demand * priorityInfo.buffer_months

    let status: 'OK' | 'LOW' | 'CRITICAL' | 'STOCKOUT' = 'OK'
    if (ending_stock === 0) status = 'STOCKOUT'
    else if (ending_stock < avg_monthly_demand) status = 'CRITICAL'
    else if (ending_stock < buffer_target) status = 'LOW'

    simulation.push({
      month,
      month_name: MONTH_NAMES[month - 1],
      starting_stock: stock,
      production,
      demand,
      ending_stock,
      months_of_stock,
      buffer_target,
      status,
    })

    stock = ending_stock
  }

  productAnalyses.push({
    family,
    priority: priorityInfo.priority,
    buffer_months: priorityInfo.buffer_months,
    current_stock_nov_2025: starting_stock,
    demand_analysis: demandAnalysis,
    stock_simulation_2026: simulation,
    production_needed: {
      total_bottles: 0, // Will calculate later
      batches_needed: 0,
      timing: 'TBD',
    },
  })
}

// Sort by priority and show critical products first
const priorityOrder = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 }
productAnalyses.sort((a, b) => {
  const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 5
  const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 5
  if (aPriority !== bPriority) return aPriority - bPriority
  return b.current_stock_nov_2025 - a.current_stock_nov_2025
})

// Display simulation results
for (const analysis of productAnalyses) {
  console.log(`\n${analysis.family} (${analysis.priority} priority)`)
  console.log(`Current Stock: ${analysis.current_stock_nov_2025} bottles`)
  console.log(`2026 Forecast Demand: ${analysis.demand_analysis.total_2026_forecast} bottles`)
  console.log(`Buffer Target: ${analysis.buffer_months} months of stock\n`)

  console.log('Month | Start | Prod | Demand | End | Months | Status')
  console.log('------|-------|------|--------|-----|--------|--------')

  for (const sim of analysis.stock_simulation_2026) {
    const statusIcon = {
      OK: '✅',
      LOW: '⚠️',
      CRITICAL: '🔴',
      STOCKOUT: '❌',
    }[sim.status]

    console.log(
      `${sim.month_name.padEnd(5)} | ${String(sim.starting_stock).padStart(5)} | ${String(sim.production).padStart(4)} | ${String(sim.demand).padStart(6)} | ${String(sim.ending_stock).padStart(3)} | ${sim.months_of_stock.toFixed(1).padStart(6)} | ${statusIcon} ${sim.status}`
    )
  }

  // Find when stock runs out
  const stockoutMonth = analysis.stock_simulation_2026.find(s => s.status === 'STOCKOUT')
  const criticalMonth = analysis.stock_simulation_2026.find(s => s.status === 'CRITICAL')

  if (stockoutMonth) {
    console.log(`\n⚠️ STOCKOUT in ${stockoutMonth.month_name} 2026!`)
  } else if (criticalMonth) {
    console.log(`\n⚠️ CRITICAL stock level in ${criticalMonth.month_name} 2026`)
  }
}

// Save full analysis
const outputPath = path.join(process.cwd(), 'data', 'demand_and_stock_analysis_2026.json')
fs.writeFileSync(outputPath, JSON.stringify({
  generated_at: new Date().toISOString(),
  product_analyses: productAnalyses
}, null, 2))
console.log(`\n\nFull analysis saved to: ${outputPath}\n`)

