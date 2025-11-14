import fs from 'fs'
import path from 'path'
import completePlan from '../data/production_plan_2026_complete.json'
import tankInventory from '../data/tank_inventory.json'

// REAL DISTILLERY CONSTRAINTS - Based on Gabi's actual workflow
const CONFIG = {
  GIN_HEART_DAYS_PER_BATCH: 1,
  GIN_TAIL_DAYS_PER_BATCH: 2,
  RUM_DAYS_PER_BATCH: 2.5,
  VODKA_NEUTRAL_DAYS_PER_BATCH: 1,
  TAILS_BATCHES_BEFORE_PROCESSING: 3, // Process tails after 3-4 gin batches
  CANE_SPIRIT_START_WEEK: 32, // No Cane Spirit before August (already produced in Oct 2025)
  PRODUCTION_COMPLETE_BY_WEEK: 30, // Front-load: complete all 2026 + early 2027 by end of July
}

// TYPICAL BATCH YIELDS (based on historical data)
const TYPICAL_YIELDS = {
  GIN_HEARTS_L: 290, // ~290L hearts at 80% ABV per gin batch
  GIN_HEARTS_ABV: 80,
  RUM_HEARTS_L: 250, // ~250L hearts at 75% ABV per rum batch
  RUM_HEARTS_ABV: 75,
  VODKA_HEARTS_L: 200, // ~200L vodka at 96% ABV per tails processing
  VODKA_HEARTS_ABV: 96,
}

type WeekMode = 'GIN' | 'RUM_CANE' | 'VODKA_TAILS' | 'BOTTLING' | 'ADMIN'

interface ProductionRun {
  product: string
  batch_number: number
  total_batches: number
  days: number
  bottles_700ml?: number
  bottles_200ml?: number
  hearts_volume_l?: number
  hearts_abv_percent?: number
  receiving_tank?: string
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
  tank_allocations?: string[]
}

interface TankStatus {
  tank_id: string
  capacity_l: number
  occupied: boolean
  contents?: string
  volume_l?: number
  weeks_occupied?: number
}

interface CombinedProduct {
  base_name: string
  brand: string
  production_type: 'GIN' | 'RUM' | 'CANE_SPIRIT'
  batches_needed: number
  batches_completed: number
  bottles_700ml_per_batch: number
  bottles_200ml_per_batch: number
  priority: string
  months_stock_current: number
}

// Helper functions
function getWeekStart(year: number, week: number): Date {
  const jan1 = new Date(year, 0, 1)
  const daysOffset = (week - 1) * 7
  const weekStart = new Date(jan1.getTime() + daysOffset * 24 * 60 * 60 * 1000)
  return weekStart
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Combine 700ml + 200ml products into single batches
function combineProducts(): CombinedProduct[] {
  const products = completePlan.product_plans
  const combined: Map<string, CombinedProduct> = new Map()
  
  for (const product of products) {
    if (product.batches_needed_rounded === 0) continue
    
    const baseName = product.product_name.replace(/ (700ml|200ml)$/, '')
    
    // SKIP Cane Spirit - scheduled separately after Week 32
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
    entry.batches_needed = Math.max(entry.batches_needed, product.batches_needed_rounded)
    
    if (product.product_name.includes('700ml')) {
      entry.bottles_700ml_per_batch = product.bottles_per_batch
    } else if (product.product_name.includes('200ml')) {
      entry.bottles_200ml_per_batch = product.bottles_per_batch
    }
  }
  
  // Sort by priority
  const priorityOrder = { 'CRITICAL': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4, 'SUFFICIENT': 5 }
  return Array.from(combined.values()).sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
    if (priorityDiff !== 0) return priorityDiff
    return a.months_stock_current - b.months_stock_current
  })
}

// Get next gin product using rotation (never same gin twice in a row)
function getNextGinProduct(ginProducts: CombinedProduct[], lastGinProduct: string | null): CombinedProduct | null {
  // Find gins that still need batches
  const availableGins = ginProducts.filter(g => g.batches_completed < g.batches_needed)
  if (availableGins.length === 0) return null
  
  // If only one gin left, return it
  if (availableGins.length === 1) return availableGins[0]
  
  // Rotate: find a different gin than the last one
  const differentGin = availableGins.find(g => g.base_name !== lastGinProduct)
  return differentGin || availableGins[0]
}

// Get next rum product
function getNextRumProduct(rumProducts: CombinedProduct[]): CombinedProduct | null {
  return rumProducts.find(r => r.batches_completed < r.batches_needed) || null
}

// Initialize tank status
function initializeTanks(): TankStatus[] {
  const movableTanks = tankInventory.tanks.filter(t => t.movable_under_still && t.has_lid)
  return movableTanks.map(t => ({
    tank_id: t.id,
    capacity_l: t.capacity_l,
    occupied: false,
    weeks_occupied: 0
  }))
}

// Allocate tank for a batch
function allocateTank(tanks: TankStatus[], volumeNeeded: number, productName: string): string | null {
  // Find first available tank with enough capacity
  const availableTank = tanks.find(t => !t.occupied && t.capacity_l >= volumeNeeded)

  if (availableTank) {
    availableTank.occupied = true
    availableTank.contents = productName
    availableTank.volume_l = volumeNeeded
    availableTank.weeks_occupied = 0
    return availableTank.tank_id
  }

  return null // No tank available
}

// Free tanks during bottling weeks
function freeTanks(tanks: TankStatus[]): void {
  tanks.forEach(t => {
    if (t.occupied) {
      t.occupied = false
      t.contents = undefined
      t.volume_l = undefined
      t.weeks_occupied = 0
    }
  })
}

// Age tanks (increment weeks occupied)
function ageTanks(tanks: TankStatus[]): void {
  tanks.forEach(t => {
    if (t.occupied && t.weeks_occupied !== undefined) {
      t.weeks_occupied++
    }
  })
}

// Generate 2026 calendar with REAL workflow
function generate2026Calendar(): WeekPlan[] {
  const calendar: WeekPlan[] = []
  const products = combineProducts()

  console.log('\nCombined Products (Priority Order):')
  products.forEach(p => {
    console.log(`  ${p.base_name}: ${p.batches_needed} batches (${p.priority}, ${p.months_stock_current.toFixed(1)} months stock)`)
    if (p.bottles_700ml_per_batch > 0) console.log(`    - 700ml: ${p.bottles_700ml_per_batch} bottles/batch`)
    if (p.bottles_200ml_per_batch > 0) console.log(`    - 200ml: ${p.bottles_200ml_per_batch} bottles/batch`)
  })

  // Separate gins and rums
  const ginProducts = products.filter(p => p.production_type === 'GIN')
  const rumProducts = products.filter(p => p.production_type === 'RUM')

  let ginBatchesSinceTailsProcessing = 0
  let lastGinProduct: string | null = null
  let lastMode: WeekMode | null = null

  // Initialize tank tracking
  const tanks = initializeTanks()
  console.log('\nAvailable Tanks for Spirit Collection:')
  tanks.forEach(t => console.log(`  ${t.tank_id}: ${t.capacity_l}L`))

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

    // RULE 1: Week 1 = Bottling + Admin (start immediately, no idle week)
    if (week === 1) {
      weekPlan.mode = 'BOTTLING'
      weekPlan.notes.push('Bottling existing stock + admin + preparation for production')
      freeTanks(tanks) // Free all tanks during bottling week
      calendar.push(weekPlan)
      lastMode = 'BOTTLING'
      continue
    }

    // Age tanks each week
    ageTanks(tanks)

    // Check if we need to free tanks (every 3 weeks or when all tanks occupied)
    const allTanksOccupied = tanks.every(t => t.occupied)
    const shouldBottle = (week % 3 === 0) || allTanksOccupied

    if (shouldBottle && tanks.some(t => t.occupied && (t.weeks_occupied || 0) >= 2)) {
      const occupiedTanks = tanks.filter(t => t.occupied && (t.weeks_occupied || 0) >= 2)
      weekPlan.notes.push('Bottling + tank turnover during non-distillation hours')
      occupiedTanks.forEach(t => {
        weekPlan.notes.push(`  → Bottling ${t.contents} from ${t.tank_id} (${t.volume_l}L)`)
        t.occupied = false
        t.contents = undefined
        t.volume_l = undefined
        t.weeks_occupied = 0
      })
    }

    // RULE 2: Check if we need tails processing (after 3-4 gin batches)
    if (ginBatchesSinceTailsProcessing >= CONFIG.TAILS_BATCHES_BEFORE_PROCESSING) {
      weekPlan.mode = 'VODKA_TAILS'
      weekPlan.tails_runs.push({
        product: 'Vodka Neutral Spirit',
        batch_number: 1,
        total_batches: 1,
        days: CONFIG.GIN_TAIL_DAYS_PER_BATCH
      })
      weekPlan.notes.push(`Process accumulated gin tails → neutral spirit → vodka for tank storage`)
      ginBatchesSinceTailsProcessing = 0
      calendar.push(weekPlan)
      lastMode = 'VODKA_TAILS'
      continue
    }

    // RULE 3: Rotate between gin and rum to manage storage
    // Priority: Gin → Rum → Gin → Rum (never same gin twice in a row)

    let nextProduct: CombinedProduct | null = null
    let nextMode: WeekMode = 'BOTTLING'

    // Try to alternate between gin and rum
    if (lastMode === 'GIN' || lastMode === 'VODKA_TAILS' || lastMode === null) {
      // Try rum first
      nextProduct = getNextRumProduct(rumProducts)
      if (nextProduct) {
        nextMode = 'RUM_CANE'
      } else {
        // No rum available, get next gin
        nextProduct = getNextGinProduct(ginProducts, lastGinProduct)
        if (nextProduct) nextMode = 'GIN'
      }
    } else {
      // Last was rum, try gin first
      nextProduct = getNextGinProduct(ginProducts, lastGinProduct)
      if (nextProduct) {
        nextMode = 'GIN'
      } else {
        // No gin available, get next rum
        nextProduct = getNextRumProduct(rumProducts)
        if (nextProduct) nextMode = 'RUM_CANE'
      }
    }

    // RULE 4: If all production complete before Week 30, mark as available
    if (!nextProduct) {
      if (week < CONFIG.PRODUCTION_COMPLETE_BY_WEEK) {
        weekPlan.mode = 'ADMIN'
        weekPlan.notes.push('All 2026 production complete early - available for 2027 pre-production, maintenance, or seasonal products')
      } else {
        weekPlan.mode = 'BOTTLING'
        weekPlan.notes.push('Bottling, stock management, and preparation for Cane Spirit season')
      }
      calendar.push(weekPlan)
      continue
    }

    // RULE 5: Schedule production with tank allocation
    weekPlan.mode = nextMode
    nextProduct.batches_completed++

    // Determine expected hearts volume
    let heartsVolume = 0
    let heartsABV = 0
    if (nextMode === 'GIN') {
      heartsVolume = TYPICAL_YIELDS.GIN_HEARTS_L
      heartsABV = TYPICAL_YIELDS.GIN_HEARTS_ABV
    } else if (nextMode === 'RUM_CANE') {
      heartsVolume = TYPICAL_YIELDS.RUM_HEARTS_L
      heartsABV = TYPICAL_YIELDS.RUM_HEARTS_ABV
    }

    // Allocate tank
    const allocatedTank = allocateTank(tanks, heartsVolume, nextProduct.base_name)

    const run: ProductionRun = {
      product: nextProduct.base_name,
      batch_number: nextProduct.batches_completed,
      total_batches: nextProduct.batches_needed,
      days: nextMode === 'GIN' ? CONFIG.GIN_HEART_DAYS_PER_BATCH : CONFIG.RUM_DAYS_PER_BATCH,
      bottles_700ml: nextProduct.bottles_700ml_per_batch || undefined,
      bottles_200ml: nextProduct.bottles_200ml_per_batch || undefined,
      hearts_volume_l: heartsVolume,
      hearts_abv_percent: heartsABV,
      receiving_tank: allocatedTank || 'NO TANK AVAILABLE ⚠️'
    }

    weekPlan.production_runs.push(run)

    // Add tank allocation note
    if (allocatedTank) {
      weekPlan.tank_allocations = [`${nextProduct.base_name} hearts → ${allocatedTank} (${heartsVolume}L @ ${heartsABV}%)`]
    } else {
      weekPlan.notes.push('⚠️ WARNING: No tank available for this batch!')
    }

    const bottleInfo = []
    if (run.bottles_700ml) bottleInfo.push(`${run.bottles_700ml}x 700ml`)
    if (run.bottles_200ml) bottleInfo.push(`${run.bottles_200ml}x 200ml`)

    weekPlan.notes.push(
      `${run.product} batch ${run.batch_number}/${run.total_batches} - ${bottleInfo.join(' + ')} - ${nextProduct.priority} priority`
    )

    if (nextMode === 'GIN') {
      ginBatchesSinceTailsProcessing++
      lastGinProduct = nextProduct.base_name
    }

    calendar.push(weekPlan)
    lastMode = nextMode
  }

  return calendar
}

async function main() {
  console.log('Generating 2026 Production Calendar (v3 - Real Workflow)...\n')

  const calendar = generate2026Calendar()

  // Generate summary
  const summary = {
    total_weeks: calendar.length,
    gin_weeks: calendar.filter(w => w.mode === 'GIN').length,
    rum_cane_weeks: calendar.filter(w => w.mode === 'RUM_CANE').length,
    vodka_tails_weeks: calendar.filter(w => w.mode === 'VODKA_TAILS').length,
    bottling_weeks: calendar.filter(w => w.mode === 'BOTTLING').length,
    admin_weeks: calendar.filter(w => w.mode === 'ADMIN').length,
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

  const outputPath = path.join(process.cwd(), 'data', 'production_calendar_2026_v3.json')
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))

  console.log(`\nProduction Calendar saved to: ${outputPath}\n`)
  console.log('SUMMARY:')
  console.log(`  Total Weeks: ${summary.total_weeks}`)
  console.log(`  Gin Weeks: ${summary.gin_weeks}`)
  console.log(`  Rum/Cane Weeks: ${summary.rum_cane_weeks}`)
  console.log(`  Vodka/Tails Weeks: ${summary.vodka_tails_weeks}`)
  console.log(`  Bottling Weeks: ${summary.bottling_weeks}`)
  console.log(`  Admin Weeks: ${summary.admin_weeks}`)
  console.log(`  Total Production Days: ${summary.total_production_days}\n`)
}

main().catch(console.error)


