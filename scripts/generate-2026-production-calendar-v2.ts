import fs from 'fs'
import path from 'path'
import completePlan from '../data/production_plan_2026_complete.json'

// Configuration constants
const CONFIG = {
  GIN_HEART_DAYS_PER_BATCH: 1,
  GIN_TAIL_DAYS_PER_BATCH: 2,
  RUM_DAYS_PER_BATCH: 2.5,
  CANE_SPIRIT_DAYS_PER_BATCH: 2.5,
  VODKA_NEUTRAL_DAYS_PER_BATCH: 1,
  CLEANING_DAYS_ON_SWITCH: 0.5, // Can be done same week as bottling
  WEEKS_BETWEEN_BOTTLING: 4,
  TAILS_BATCHES_BEFORE_PROCESSING: 3,
  CANE_SPIRIT_START_WEEK: 32, // No Cane Spirit before August (Week 32)
  PRODUCTION_COMPLETE_BY_WEEK: 30, // Front-load: complete 2026 + early 2027 by end of July
}

type WeekMode = 'GIN' | 'RUM_CANE' | 'VODKA_TAILS' | 'CLEANING' | 'BOTTLING' | 'BLOCKED'

interface ProductionRun {
  product: string
  batch_number: number
  total_batches: number
  days: number
  bottles_700ml?: number
  bottles_200ml?: number
}

interface WeekPlan {
  week_number: number
  week_start: string
  week_end: string
  mode: WeekMode
  production_runs: ProductionRun[]
  tails_runs: ProductionRun[]
  cleaning_days: number
  notes: string[]
}

interface CombinedProduct {
  base_name: string // "Rainforest", "Navy", etc.
  brand: string
  production_type: 'GIN' | 'RUM' | 'CANE_SPIRIT'
  batches_needed: number
  batches_completed: number
  bottles_700ml_per_batch: number
  bottles_200ml_per_batch: number
  priority: string
  months_stock_current: number
}

// Helper: Get week start date
function getWeekStart(year: number, week: number): Date {
  const jan1 = new Date(year, 0, 1)
  const daysOffset = (week - 1) * 7
  const weekStart = new Date(jan1.getTime() + daysOffset * 24 * 60 * 60 * 1000)
  const dayOfWeek = weekStart.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  weekStart.setDate(weekStart.getDate() + diff)
  return weekStart
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Combine 700ml + 200ml products into single batches
function combineProducts(): CombinedProduct[] {
  const products = completePlan.product_plans
  const combined: Map<string, CombinedProduct> = new Map()

  for (const product of products) {
    if (product.batches_needed_rounded === 0) continue

    // Extract base name (Rainforest, Navy, Merchant Mae White Rum, etc.)
    const baseName = product.product_name.replace(/ (700ml|200ml)$/, '')

    // SKIP Cane Spirit - it will be scheduled separately after Week 32
    if (baseName.includes('Cane Spirit')) continue

    if (!combined.has(baseName)) {
      combined.set(baseName, {
        base_name: baseName,
        brand: product.brand,
        production_type: product.production_type as any,
        batches_needed: 0,
        batches_completed: 0,
        bottles_700ml_per_batch: 0,
        bottles_200ml_per_batch: 0,
        priority: product.priority,
        months_stock_current: product.months_of_stock_current
      })
    }

    const entry = combined.get(baseName)!

    // Take the max batches needed between 700ml and 200ml
    entry.batches_needed = Math.max(entry.batches_needed, product.batches_needed_rounded)

    if (product.product_name.includes('700ml')) {
      entry.bottles_700ml_per_batch = product.bottles_per_batch
    } else if (product.product_name.includes('200ml')) {
      entry.bottles_200ml_per_batch = product.bottles_per_batch
    }
  }

  // Sort by priority (CRITICAL first, then by months of stock)
  const priorityOrder = { 'CRITICAL': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4, 'SUFFICIENT': 5 }
  return Array.from(combined.values()).sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
    if (priorityDiff !== 0) return priorityDiff
    return a.months_stock_current - b.months_stock_current
  })
}

// Generate 2026 calendar
function generate2026Calendar(): WeekPlan[] {
  const calendar: WeekPlan[] = []
  const products = combineProducts()
  
  console.log('\nCombined Products (Priority Order):')
  products.forEach(p => {
    console.log(`  ${p.base_name}: ${p.batches_needed} batches (${p.priority}, ${p.months_stock_current.toFixed(1)} months stock)`)
    if (p.bottles_700ml_per_batch > 0) console.log(`    - 700ml: ${p.bottles_700ml_per_batch} bottles/batch`)
    if (p.bottles_200ml_per_batch > 0) console.log(`    - 200ml: ${p.bottles_200ml_per_batch} bottles/batch`)
  })
  
  let weeksSinceBottling = 0
  let ginBatchesSinceTailsProcessing = 0
  let lastMode: WeekMode | null = null
  
  // Track which products still need batches
  const productQueue = products.map(p => ({ ...p }))

  // Generate weeks for 2026 (52 weeks)
  for (let week = 1; week <= 52; week++) {
    const weekStart = getWeekStart(2026, week)
    const weekEnd = addDays(weekStart, 6)

    const weekPlan: WeekPlan = {
      week_number: week,
      week_start: formatDate(weekStart),
      week_end: formatDate(weekEnd),
      mode: 'BOTTLING',
      production_runs: [],
      tails_runs: [],
      cleaning_days: 0,
      notes: []
    }

    // Check if week is blocked
    if (CONFIG.BLOCKED_WEEKS.includes(week)) {
      weekPlan.mode = 'BLOCKED'
      weekPlan.notes.push('No production - blocked week')
      calendar.push(weekPlan)
      continue
    }

    // Check if we need a bottling week
    weeksSinceBottling++
    if (weeksSinceBottling >= CONFIG.WEEKS_BETWEEN_BOTTLING) {
      weekPlan.mode = 'BOTTLING'
      weekPlan.notes.push('Bottling and shipping week - clear warehouse space')
      weeksSinceBottling = 0
      calendar.push(weekPlan)
      lastMode = 'BOTTLING'
      continue
    }

    // Check if we need tails processing (after every 3 gin batches)
    if (ginBatchesSinceTailsProcessing >= CONFIG.TAILS_BATCHES_BEFORE_PROCESSING && lastMode === 'GIN') {
      weekPlan.mode = 'VODKA_TAILS'
      weekPlan.tails_runs.push({
        product: 'Vodka Neutral Spirit',
        batch_number: 1,
        total_batches: 1,
        days: CONFIG.GIN_TAIL_DAYS_PER_BATCH
      })
      weekPlan.notes.push(`Process accumulated gin tails into clean vodka for tank storage`)
      ginBatchesSinceTailsProcessing = 0
      calendar.push(weekPlan)
      lastMode = 'VODKA_TAILS'
      continue
    }

    // Find next product to produce (priority order, rotate between different products)
    let nextProduct: typeof productQueue[0] | null = null
    for (const product of productQueue) {
      if (product.batches_completed < product.batches_needed) {
        nextProduct = product
        break
      }
    }

    if (!nextProduct) {
      // All production complete
      weekPlan.mode = 'BOTTLING'
      weekPlan.notes.push('All 2026 production complete - available for bottling, maintenance, or seasonal products')
      calendar.push(weekPlan)
      continue
    }

    // Determine mode based on product type
    let nextMode: WeekMode
    if (nextProduct.production_type === 'GIN') {
      nextMode = 'GIN'
    } else if (nextProduct.production_type === 'RUM' || nextProduct.production_type === 'CANE_SPIRIT') {
      nextMode = 'RUM_CANE'
    } else {
      nextMode = 'BOTTLING'
    }

    // Check if we need cleaning when switching (but not if we just cleaned)
    if (lastMode && lastMode !== nextMode && lastMode !== 'BOTTLING' && lastMode !== 'BLOCKED' && lastMode !== 'VODKA_TAILS' && lastMode !== 'CLEANING') {
      weekPlan.mode = 'CLEANING'
      weekPlan.cleaning_days = CONFIG.CLEANING_DAYS_ON_SWITCH
      weekPlan.notes.push(`Cleaning and water runs - switching from ${lastMode} to ${nextMode}`)
      calendar.push(weekPlan)
      lastMode = 'CLEANING'
      continue
    }

    // Schedule production
    weekPlan.mode = nextMode
    nextProduct.batches_completed++

    const run: ProductionRun = {
      product: nextProduct.base_name,
      batch_number: nextProduct.batches_completed,
      total_batches: nextProduct.batches_needed,
      days: nextMode === 'GIN' ? CONFIG.GIN_HEART_DAYS_PER_BATCH : CONFIG.RUM_DAYS_PER_BATCH,
      bottles_700ml: nextProduct.bottles_700ml_per_batch || undefined,
      bottles_200ml: nextProduct.bottles_200ml_per_batch || undefined
    }

    weekPlan.production_runs.push(run)

    const bottleInfo = []
    if (run.bottles_700ml) bottleInfo.push(`${run.bottles_700ml}x 700ml`)
    if (run.bottles_200ml) bottleInfo.push(`${run.bottles_200ml}x 200ml`)

    weekPlan.notes.push(
      `${run.product} batch ${run.batch_number}/${run.total_batches} - ${bottleInfo.join(' + ')} - ${nextProduct.priority} priority`
    )

    if (nextMode === 'GIN') {
      ginBatchesSinceTailsProcessing++
    }

    calendar.push(weekPlan)
    lastMode = nextMode
  }

  return calendar
}

async function main() {
  console.log('Generating 2026 Production Calendar (v2 - Storage-Aware)...\n')

  const calendar = generate2026Calendar()

  // Generate summary
  const summary = {
    total_weeks: calendar.length,
    gin_weeks: calendar.filter(w => w.mode === 'GIN').length,
    rum_cane_weeks: calendar.filter(w => w.mode === 'RUM_CANE').length,
    vodka_tails_weeks: calendar.filter(w => w.mode === 'VODKA_TAILS').length,
    cleaning_weeks: calendar.filter(w => w.mode === 'CLEANING').length,
    bottling_weeks: calendar.filter(w => w.mode === 'BOTTLING').length,
    blocked_weeks: calendar.filter(w => w.mode === 'BLOCKED').length,
    total_production_days: calendar.reduce((sum, w) =>
      sum + w.production_runs.reduce((s, r) => s + r.days, 0) +
      w.tails_runs.reduce((s, r) => s + r.days, 0), 0
    )
  }

  // Save to file
  const output = {
    generated_at: new Date().toISOString(),
    configuration: CONFIG,
    summary,
    calendar
  }

  const outputPath = path.join(process.cwd(), 'data', 'production_calendar_2026_v2.json')
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))

  console.log(`\nProduction Calendar saved to: ${outputPath}\n`)
  console.log('SUMMARY:')
  console.log(`  Total Weeks: ${summary.total_weeks}`)
  console.log(`  Gin Weeks: ${summary.gin_weeks}`)
  console.log(`  Rum/Cane Weeks: ${summary.rum_cane_weeks}`)
  console.log(`  Vodka/Tails Weeks: ${summary.vodka_tails_weeks}`)
  console.log(`  Cleaning Weeks: ${summary.cleaning_weeks}`)
  console.log(`  Bottling Weeks: ${summary.bottling_weeks}`)
  console.log(`  Blocked Weeks: ${summary.blocked_weeks}`)
  console.log(`  Total Production Days: ${summary.total_production_days}\n`)
}

main().catch(console.error)

