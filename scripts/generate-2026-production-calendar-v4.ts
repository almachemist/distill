import fs from 'fs'
import path from 'path'

// Load production plan V4 (demand-based)
const productionPlanPath = path.join(process.cwd(), 'data', 'production_plan_2026_v4.json')
const productionPlan = JSON.parse(fs.readFileSync(productionPlanPath, 'utf-8'))

// Load tank inventory
const tankInventoryPath = path.join(process.cwd(), 'data', 'tank_inventory.json')
const tankInventory = JSON.parse(fs.readFileSync(tankInventoryPath, 'utf-8'))

// Load demand analysis for stock projections
const demandAnalysisPath = path.join(process.cwd(), 'data', 'demand_and_stock_analysis_2026.json')
const demandAnalysis = JSON.parse(fs.readFileSync(demandAnalysisPath, 'utf-8'))

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

type WeekMode = 'GIN' | 'RUM' | 'VODKA' | 'CANE_SPIRIT' | 'LIQUEUR' | 'BOTTLING' | 'ADMIN' | 'RESERVE_RUM_BLEND' | 'RESERVE_RUM_BOTTLE'

interface ProductionRun {
  product: string
  batch_number: number
  total_batches: number
  production_type: string
  scheduled_month: number
  scheduled_month_name: string
  receiving_tank?: string
}

interface WeekPlan {
  week_number: number
  week_start: string
  week_end: string
  month: number
  month_name: string
  mode: WeekMode
  production_runs: ProductionRun[]
  bottling: boolean
  bottling_tasks?: string[]
  notes: string[]
  tank_allocations: string[]
  stock_projection?: {
    product: string
    starting_stock: number
    production_this_week: number
    demand_this_week: number
    ending_stock: number
    months_of_stock: number
    status: string
  }[]
}

interface TankStatus {
  tank_id: string
  capacity_l: number
  occupied: boolean
  contents?: string
  weeks_occupied: number
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

function getMonthFromWeek(week: number): number {
  // Approximate: 4.33 weeks per month
  return Math.min(12, Math.ceil(week / 4.33))
}

// Initialize tank status
function initializeTanks(): TankStatus[] {
  const movableTanks = tankInventory.tanks.filter((t: any) => t.movable_under_still && t.has_lid)
  return movableTanks.map((t: any) => ({
    tank_id: t.id,
    capacity_l: t.capacity_l,
    occupied: false,
    weeks_occupied: 0
  }))
}

// Allocate tank for a batch
function allocateTank(tanks: TankStatus[], productName: string): string | null {
  const availableTank = tanks.find(t => !t.occupied)
  
  if (availableTank) {
    availableTank.occupied = true
    availableTank.contents = productName
    availableTank.weeks_occupied = 0
    return availableTank.tank_id
  }
  
  return null
}

// Free tanks during bottling weeks
function freeTanks(tanks: TankStatus[]): void {
  tanks.forEach(t => {
    if (t.occupied && t.weeks_occupied >= 2) {
      t.occupied = false
      t.contents = undefined
      t.weeks_occupied = 0
    }
  })
}

// Age tanks
function ageTanks(tanks: TankStatus[]): void {
  tanks.forEach(t => {
    if (t.occupied) {
      t.weeks_occupied++
    }
  })
}

// Get occupied tanks summary
function getOccupiedTanks(tanks: TankStatus[]): string[] {
  return tanks
    .filter(t => t.occupied)
    .map(t => `${t.tank_id}: ${t.contents} (${t.weeks_occupied}w)`)
}

console.log('╔════════════════════════════════════════════════════════════════╗')
console.log('║                                                                ║')
console.log('║         2026 PRODUCTION CALENDAR V4 - DEMAND-BASED             ║')
console.log('║                                                                ║')
console.log('╚════════════════════════════════════════════════════════════════╝\n')

console.log('Loading production plan V4...')
console.log(`Total products with production: ${productionPlan.production_plans.filter((p: any) => p.batches_needed > 0).length}`)
console.log(`Total batches scheduled: ${productionPlan.production_plans.reduce((sum: number, p: any) => sum + p.batches_needed, 0)}\n`)

// Organize batches by month
const batchesByMonth = new Map<number, ProductionRun[]>()

for (const plan of productionPlan.production_plans) {
  if (plan.batches_needed === 0) continue

  for (const batch of plan.production_schedule) {
    if (!batchesByMonth.has(batch.scheduled_month)) {
      batchesByMonth.set(batch.scheduled_month, [])
    }
    batchesByMonth.get(batch.scheduled_month)!.push({
      product: batch.product,
      batch_number: batch.batch_number,
      total_batches: batch.total_batches || plan.batches_needed,
      production_type: batch.production_type,
      scheduled_month: batch.scheduled_month,
      scheduled_month_name: batch.scheduled_month_name
    })
  }
}

console.log('Batches by month:')
for (let month = 1; month <= 12; month++) {
  const batches = batchesByMonth.get(month) || []
  if (batches.length > 0) {
    console.log(`  ${MONTH_NAMES[month - 1]}: ${batches.length} batches`)
  }
}
console.log('')

// Generate calendar
const calendar: WeekPlan[] = []
const tanks = initializeTanks()

console.log('Generating week-by-week calendar...\n')

// Track which batches have been scheduled
const scheduledBatches = new Set<string>()

for (let week = 1; week <= 52; week++) {
  const weekStart = getWeekStart(2026, week)
  const weekEnd = addDays(weekStart, 6)
  const month = getMonthFromWeek(week)
  const monthName = MONTH_NAMES[month - 1]

  // Determine week mode
  let mode: WeekMode = 'ADMIN'
  const productionRuns: ProductionRun[] = []
  let bottling = false
  let bottlingTasks: string[] = []
  const notes: string[] = []

  // OPERATIONAL CONSTRAINTS - Fixed weeks at start of year

  // Week 1: Administrative reset (no production)
  if (week === 1) {
    mode = 'ADMIN'
    notes.push('New Year - Administrative reset')
    notes.push('Maintenance, deep cleaning, stocktake, barrel checks')
    notes.push('No distillation this week')

    calendar.push({
      week_number: week,
      week_start: formatDate(weekStart),
      week_end: formatDate(weekEnd),
      month,
      month_name: monthName,
      mode,
      production_runs: [],
      bottling: false,
      notes,
      tank_allocations: getOccupiedTanks(tanks)
    })
    continue
  }

  // Week 2: Reserve Rum - Blending & Selection
  if (week === 2) {
    mode = 'RESERVE_RUM_BLEND'
    notes.push('Reserve Cask Rum - Barrel selection & blending')
    notes.push('Tasting, selecting, blending premium barrels')
    notes.push('Full week dedicated to this process')

    calendar.push({
      week_number: week,
      week_start: formatDate(weekStart),
      week_end: formatDate(weekEnd),
      month,
      month_name: monthName,
      mode,
      production_runs: [],
      bottling: false,
      notes,
      tank_allocations: getOccupiedTanks(tanks)
    })

    // Mark Reserve Rum as scheduled (remove from demand-based queue)
    scheduledBatches.add('Reserve Cask Rum-1')
    continue
  }

  // Week 3: Reserve Rum - Manual Bottling
  if (week === 3) {
    mode = 'RESERVE_RUM_BOTTLE'
    notes.push('Reserve Cask Rum - Manual bottling')
    notes.push('Slow, careful bottling of premium product')
    notes.push('Full week for bottling process')

    calendar.push({
      week_number: week,
      week_start: formatDate(weekStart),
      week_end: formatDate(weekEnd),
      month,
      month_name: monthName,
      mode,
      production_runs: [],
      bottling: false,
      notes,
      tank_allocations: getOccupiedTanks(tanks)
    })
    continue
  }

  // Weeks 4-6: Vodka production (3 batches)
  if (week >= 4 && week <= 6) {
    const vodkaBatchNumber = week - 3 // Batch 1, 2, 3
    const tank = allocateTank(tanks, 'Merchant Mae Vodka')

    if (tank) {
      mode = 'VODKA'
      productionRuns.push({
        product: 'Merchant Mae Vodka',
        batch_number: vodkaBatchNumber,
        total_batches: 6,
        production_type: 'VODKA',
        scheduled_month: 1,
        scheduled_month_name: 'Jan',
        receiving_tank: tank
      })
      notes.push(`Merchant Mae Vodka - Batch ${vodkaBatchNumber}/6`)
      notes.push(`Neutral spirit → ${tank}`)

      // Mark as scheduled
      scheduledBatches.add(`Merchant Mae Vodka-${vodkaBatchNumber}`)
    }

    calendar.push({
      week_number: week,
      week_start: formatDate(weekStart),
      week_end: formatDate(weekEnd),
      month,
      month_name: monthName,
      mode,
      production_runs: productionRuns,
      bottling: false,
      notes,
      tank_allocations: getOccupiedTanks(tanks)
    })

    ageTanks(tanks)
    continue
  }

  // After week 6: Continue with demand-based scheduling

  // Get ALL unscheduled batches (not just this month)
  // This allows us to schedule all 20 batches across the year
  const allUnscheduledBatches: ProductionRun[] = []
  for (const [m, batches] of batchesByMonth.entries()) {
    for (const batch of batches) {
      const key = `${batch.product}-${batch.batch_number}`
      if (!scheduledBatches.has(key)) {
        allUnscheduledBatches.push(batch)
      }
    }
  }

  // Filter batches that are ready to be scheduled (not in future months)
  // IMPORTANT: Don't schedule batches that are planned for future months
  const readyBatches = allUnscheduledBatches.filter(batch => {
    // Only schedule if we're in or past the scheduled month
    return batch.scheduled_month <= month
  })

  // Prioritize batches from current month, then earlier months
  const availableBatches = readyBatches.sort((a, b) => {
    // Current month first
    if (a.scheduled_month === month && b.scheduled_month !== month) return -1
    if (b.scheduled_month === month && a.scheduled_month !== month) return 1
    // Then earlier months (overdue)
    if (a.scheduled_month < month && b.scheduled_month >= month) return -1
    if (b.scheduled_month < month && a.scheduled_month >= month) return 1
    // Then by scheduled month
    return a.scheduled_month - b.scheduled_month
  })

  // Check if we should do bottling this week
  // NEW LOGIC: Bottling happens WITHIN production weeks, not as exclusive weeks
  const allTanksOccupied = tanks.every(t => t.occupied)
  const moreBatchesToSchedule = availableBatches.length > 0
  const shouldBottle = allTanksOccupied && moreBatchesToSchedule

  if (availableBatches.length > 0) {
    // Schedule ONLY 1 batch per week (only 1 still!)
    const availableTankCount = tanks.filter(t => !t.occupied).length

    if (availableTankCount > 0) {
      // Take only the first batch
      const batch = availableBatches[0]
      const tank = allocateTank(tanks, batch.product)

      if (tank) {
        batch.receiving_tank = tank
        productionRuns.push(batch)
        scheduledBatches.add(`${batch.product}-${batch.batch_number}`)

        mode = batch.production_type as WeekMode
        notes.push(`${batch.product} - Batch ${batch.batch_number}/${batch.total_batches}`)
        notes.push(`Hearts → ${tank}`)

        // Check if we should also bottle this week (bottling happens alongside production)
        if (shouldBottle) {
          bottling = true
          const occupiedTanks = tanks.filter(t => t.occupied && t.contents !== batch.product)
          bottlingTasks = occupiedTanks.map(t => `Bottle ${t.contents}`)
          notes.push(`Also bottling: ${occupiedTanks.map(t => t.contents).join(', ')}`)

          // Free the tanks that were bottled (but not the one we just filled)
          tanks.forEach(t => {
            if (t.occupied && t.contents !== batch.product) {
              t.occupied = false
              t.contents = undefined
              t.weeks_occupied = 0
            }
          })
        }
      } else {
        // No tank available but we have batches to schedule - force bottling this week
        notes.push('All tanks occupied - bottling needed before next production')
      }
    } else if (shouldBottle) {
      // All tanks occupied - do bottling to free up space
      mode = 'ADMIN'
      bottling = true
      const occupiedTanks = tanks.filter(t => t.occupied)
      bottlingTasks = occupiedTanks.map(t => `Bottle ${t.contents}`)
      notes.push('Bottling week - free tanks for next production')
      notes.push(`Bottling: ${occupiedTanks.map(t => t.contents).join(', ')}`)
      freeTanks(tanks)
    }
  } else {
    // No production scheduled
    notes.push('Non-distillation week')

    // Check if there are tanks to bottle
    const occupiedTanks = tanks.filter(t => t.occupied)
    if (occupiedTanks.length > 0) {
      bottling = true
      bottlingTasks = occupiedTanks.map(t => `Bottle ${t.contents}`)
      notes.push(`Bottling: ${occupiedTanks.map(t => t.contents).join(', ')}`)
    } else {
      notes.push('Activities: Cleaning, prep, maintenance')
    }
  }

  // Age tanks
  ageTanks(tanks)

  const weekPlan: WeekPlan = {
    week_number: week,
    week_start: formatDate(weekStart),
    week_end: formatDate(weekEnd),
    month,
    month_name: monthName,
    mode,
    production_runs: productionRuns,
    bottling,
    bottling_tasks: bottlingTasks.length > 0 ? bottlingTasks : undefined,
    notes,
    tank_allocations: getOccupiedTanks(tanks)
  }

  calendar.push(weekPlan)
}

console.log(`\n✅ Calendar generated: ${calendar.length} weeks\n`)

// Summary statistics
const productionWeeks = calendar.filter(w => w.production_runs.length > 0).length
const bottlingWeeks = calendar.filter(w => w.bottling).length
const adminWeeks = calendar.filter(w => w.mode === 'ADMIN' && !w.bottling).length

console.log('Calendar Summary:')
console.log(`  Production weeks: ${productionWeeks}`)
console.log(`  Bottling weeks: ${bottlingWeeks}`)
console.log(`  Admin/prep weeks: ${adminWeeks}`)
console.log(`  Total batches scheduled: ${scheduledBatches.size}`)

// Check if all batches were scheduled
const totalBatchesNeeded = productionPlan.production_plans.reduce((sum: number, p: any) => sum + p.batches_needed, 0)
if (scheduledBatches.size < totalBatchesNeeded) {
  console.log(`\n⚠️ WARNING: Only ${scheduledBatches.size}/${totalBatchesNeeded} batches scheduled!`)
  console.log('Some batches could not be scheduled due to tank constraints.')
} else {
  console.log(`\n✅ All ${totalBatchesNeeded} batches successfully scheduled!`)
}

// Save calendar
const outputPath = path.join(process.cwd(), 'data', 'production_calendar_2026_v4.json')
fs.writeFileSync(outputPath, JSON.stringify({
  generated_at: new Date().toISOString(),
  source: 'production_plan_2026_v4.json',
  methodology: 'Demand-based planning with month-by-month stock simulation',
  calendar
}, null, 2))

console.log(`\n✅ Calendar saved to: ${outputPath}`)

// Display first few weeks
console.log('\n\nFirst 10 weeks preview:')
console.log('═'.repeat(90))

for (const week of calendar.slice(0, 10)) {
  console.log(`\nWeek ${week.week_number} (${week.week_start} to ${week.week_end}) - ${week.month_name}`)
  console.log(`Mode: ${week.mode}`)

  if (week.production_runs.length > 0) {
    console.log('Production:')
    week.production_runs.forEach(run => {
      console.log(`  - ${run.product} (Batch ${run.batch_number}/${run.total_batches}) → ${run.receiving_tank}`)
    })
  }

  if (week.bottling) {
    console.log('Bottling: Yes')
  }

  if (week.tank_allocations.length > 0) {
    console.log('Tanks occupied:')
    week.tank_allocations.forEach(tank => console.log(`  - ${tank}`))
  }

  if (week.notes.length > 0) {
    console.log('Notes:')
    week.notes.forEach(note => console.log(`  - ${note}`))
  }
}

console.log('\n')

