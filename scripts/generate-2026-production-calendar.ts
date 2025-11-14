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
  CLEANING_DAYS_ON_SWITCH: 1,
  WEEKS_BETWEEN_BOTTLING: 3,
  VODKA_LITRES_PER_NEUTRAL_RUN: 200,
}

type WeekMode = 'GIN' | 'RUM_CANE' | 'VODKA_TAILS' | 'CLEANING' | 'BOTTLING'

interface ProductionRun {
  product: string
  days: number
}

interface WeekPlan {
  week_number: number
  week_start: string
  week_end: string
  mode: WeekMode
  hearts_runs: ProductionRun[]
  tails_runs: ProductionRun[]
  cleaning_days: number
  bottling_focus: string[]
  notes: string[]
}

interface ProductDistillationNeeds {
  product_name: string
  sku_code: string
  production_type: string
  batches_needed: number
  heart_days: number
  tail_days: number
  rum_cane_days: number
  priority: string
  recommended_quarter: string
}

// Helper: Get ISO week start date
function getWeekStart(year: number, week: number): Date {
  const jan4 = new Date(year, 0, 4)
  const weekStart = new Date(jan4)
  weekStart.setDate(jan4.getDate() - jan4.getDay() + 1 + (week - 1) * 7)
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

// Calculate distillation needs for each product
function calculateDistillationNeeds(): ProductDistillationNeeds[] {
  const needs: ProductDistillationNeeds[] = []
  
  for (const product of completePlan.product_plans) {
    if (product.batches_needed_rounded === 0) continue
    
    const need: ProductDistillationNeeds = {
      product_name: product.product_name,
      sku_code: product.sku_code,
      production_type: product.production_type,
      batches_needed: product.batches_needed_rounded,
      heart_days: 0,
      tail_days: 0,
      rum_cane_days: 0,
      priority: product.priority,
      recommended_quarter: product.recommended_quarter
    }
    
    if (product.production_type === 'GIN') {
      need.heart_days = product.batches_needed_rounded * CONFIG.GIN_HEART_DAYS_PER_BATCH
      need.tail_days = product.batches_needed_rounded * CONFIG.GIN_TAIL_DAYS_PER_BATCH
    } else if (product.production_type === 'RUM') {
      need.rum_cane_days = product.batches_needed_rounded * CONFIG.RUM_DAYS_PER_BATCH
    } else if (product.production_type === 'CANE_SPIRIT') {
      need.rum_cane_days = product.batches_needed_rounded * CONFIG.CANE_SPIRIT_DAYS_PER_BATCH
    } else if (product.production_type === 'VODKA') {
      // Vodka comes from gin tails, handled separately
      need.tail_days = product.batches_needed_rounded * CONFIG.VODKA_NEUTRAL_DAYS_PER_BATCH
    }
    
    needs.push(need)
  }
  
  return needs
}

// Generate 2026 weekly calendar
function generate2026Calendar(): WeekPlan[] {
  const calendar: WeekPlan[] = []
  const distillationNeeds = calculateDistillationNeeds()
  
  // Separate by type
  const ginNeeds = distillationNeeds.filter(n => n.production_type === 'GIN')
  const rumCaneNeeds = distillationNeeds.filter(n => n.production_type === 'RUM' || n.production_type === 'CANE_SPIRIT')
  const vodkaNeeds = distillationNeeds.filter(n => n.production_type === 'VODKA')
  
  // Calculate total days needed
  const totalGinHeartDays = ginNeeds.reduce((sum, n) => sum + n.heart_days, 0)
  const totalGinTailDays = ginNeeds.reduce((sum, n) => sum + n.tail_days, 0)
  const totalRumCaneDays = rumCaneNeeds.reduce((sum, n) => sum + n.rum_cane_days, 0)
  const totalVodkaDays = vodkaNeeds.reduce((sum, n) => sum + n.tail_days, 0)
  
  console.log('\nDistillation Days Required:')
  console.log(`  Gin Hearts: ${totalGinHeartDays} days`)
  console.log(`  Gin Tails: ${totalGinTailDays} days`)
  console.log(`  Rum/Cane: ${totalRumCaneDays} days`)
  console.log(`  Vodka Neutral: ${totalVodkaDays} days\n`)
  
  // Track remaining work
  let remainingGinHearts = totalGinHeartDays
  let remainingGinTails = totalGinTailDays
  let remainingRumCane = totalRumCaneDays
  let remainingVodka = totalVodkaDays
  
  let currentGinIndex = 0
  let currentRumCaneIndex = 0
  
  let lastMode: WeekMode | null = null
  let weeksSinceBottling = 0
  
  // Generate weeks for 2026 (52 weeks)
  for (let week = 1; week <= 52; week++) {
    const weekStart = getWeekStart(2026, week)
    const weekEnd = addDays(weekStart, 6)

    const weekPlan: WeekPlan = {
      week_number: week,
      week_start: formatDate(weekStart),
      week_end: formatDate(weekEnd),
      mode: 'BOTTLING',
      hearts_runs: [],
      tails_runs: [],
      cleaning_days: 0,
      bottling_focus: [],
      notes: []
    }

    // Determine if we need a bottling week
    weeksSinceBottling++
    if (weeksSinceBottling >= CONFIG.WEEKS_BETWEEN_BOTTLING) {
      weekPlan.mode = 'BOTTLING'
      weekPlan.notes.push('Regular bottling and tank turnaround week')
      weekPlan.bottling_focus = ['All products in tanks']
      weeksSinceBottling = 0
      calendar.push(weekPlan)
      lastMode = 'BOTTLING'
      continue
    }

    // Decide next mode based on priority and remaining work
    // Strategy: Do all gin first (CRITICAL/HIGH priority), then rum/cane
    let nextMode: WeekMode | null = null

    if (remainingGinHearts > 0 || remainingGinTails > 0) {
      nextMode = 'GIN'
    } else if (remainingVodka > 0) {
      nextMode = 'VODKA_TAILS'
    } else if (remainingRumCane > 0) {
      nextMode = 'RUM_CANE'
    }

    // Check if we need cleaning when switching product types
    let needsCleaning = false
    if (lastMode && nextMode && lastMode !== nextMode && lastMode !== 'BOTTLING' && lastMode !== 'CLEANING') {
      if ((lastMode === 'GIN' && (nextMode === 'RUM_CANE' || nextMode === 'VODKA_TAILS')) ||
          (lastMode === 'RUM_CANE' && (nextMode === 'GIN' || nextMode === 'VODKA_TAILS')) ||
          (lastMode === 'VODKA_TAILS' && (nextMode === 'RUM_CANE' || nextMode === 'GIN'))) {
        needsCleaning = true
      }
    }

    if (needsCleaning) {
      weekPlan.mode = 'CLEANING'
      weekPlan.cleaning_days = CONFIG.CLEANING_DAYS_ON_SWITCH
      weekPlan.notes.push(`Cleaning and water runs - switching from ${lastMode} to ${nextMode}`)
      calendar.push(weekPlan)
      lastMode = 'CLEANING'
      continue
    }

    // If no work remaining, mark as available
    if (!nextMode) {
      weekPlan.mode = 'BOTTLING'
      weekPlan.notes.push('Production complete - available for bottling or maintenance')
      calendar.push(weekPlan)
      continue
    }

    // Allocate work for this week
    weekPlan.mode = nextMode

    if (nextMode === 'GIN') {
      // Allocate gin hearts (max 1 batch per week = 1 day)
      if (remainingGinHearts > 0 && currentGinIndex < ginNeeds.length) {
        const product = ginNeeds[currentGinIndex]
        const daysToAllocate = Math.min(CONFIG.GIN_HEART_DAYS_PER_BATCH, remainingGinHearts)

        weekPlan.hearts_runs.push({
          product: product.product_name,
          days: daysToAllocate
        })

        remainingGinHearts -= daysToAllocate

        if (remainingGinHearts <= 0 || daysToAllocate >= product.heart_days) {
          currentGinIndex++
        }
      }

      // Allocate gin tails (can do 2-3 days per week)
      const maxTailDays = 5 - (weekPlan.hearts_runs.reduce((sum, r) => sum + r.days, 0))
      if (remainingGinTails > 0 && maxTailDays > 0) {
        const daysToAllocate = Math.min(maxTailDays, remainingGinTails, CONFIG.GIN_TAIL_DAYS_PER_BATCH * 2)

        weekPlan.tails_runs.push({
          product: 'Gin Tails (combined batches)',
          days: daysToAllocate
        })

        remainingGinTails -= daysToAllocate
      }

      weekPlan.notes.push('Gin production week')

    } else if (nextMode === 'RUM_CANE') {
      // Allocate rum/cane (max 1 batch per week = 2.5 days)
      if (remainingRumCane > 0 && currentRumCaneIndex < rumCaneNeeds.length) {
        const product = rumCaneNeeds[currentRumCaneIndex]
        const daysToAllocate = Math.min(CONFIG.RUM_DAYS_PER_BATCH, remainingRumCane, 5)

        weekPlan.hearts_runs.push({
          product: product.product_name,
          days: daysToAllocate
        })

        remainingRumCane -= daysToAllocate

        if (daysToAllocate >= product.rum_cane_days) {
          currentRumCaneIndex++
        }
      }

      weekPlan.notes.push('Rum/Cane Spirit production week')

    } else if (nextMode === 'VODKA_TAILS') {
      // Allocate vodka neutral runs (process accumulated gin tails)
      const daysToAllocate = Math.min(5, remainingVodka)

      weekPlan.tails_runs.push({
        product: 'Vodka Neutral Runs (from gin tails)',
        days: daysToAllocate
      })

      remainingVodka -= daysToAllocate
      weekPlan.notes.push('Vodka neutral spirit production from accumulated gin tails')
    }

    calendar.push(weekPlan)
    lastMode = nextMode
  }

  return calendar
}

async function main() {
  console.log('Generating 2026 Production Calendar...\n')

  const calendar = generate2026Calendar()
  const distillationNeeds = calculateDistillationNeeds()

  // Generate summary
  const summary = {
    total_weeks: calendar.length,
    gin_weeks: calendar.filter(w => w.mode === 'GIN').length,
    rum_cane_weeks: calendar.filter(w => w.mode === 'RUM_CANE').length,
    vodka_weeks: calendar.filter(w => w.mode === 'VODKA_TAILS').length,
    cleaning_weeks: calendar.filter(w => w.mode === 'CLEANING').length,
    bottling_weeks: calendar.filter(w => w.mode === 'BOTTLING').length,
    total_heart_days: calendar.reduce((sum, w) => sum + w.hearts_runs.reduce((s, r) => s + r.days, 0), 0),
    total_tail_days: calendar.reduce((sum, w) => sum + w.tails_runs.reduce((s, r) => s + r.days, 0), 0),
    total_cleaning_days: calendar.reduce((sum, w) => sum + w.cleaning_days, 0)
  }

  // Save to file
  const output = {
    generated_at: new Date().toISOString(),
    configuration: CONFIG,
    summary,
    distillation_needs: distillationNeeds,
    calendar
  }

  const outputPath = path.join(process.cwd(), 'data', 'production_calendar_2026.json')
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))

  console.log(`Production Calendar saved to: ${outputPath}\n`)
  console.log('SUMMARY:')
  console.log(`  Total Weeks: ${summary.total_weeks}`)
  console.log(`  Gin Weeks: ${summary.gin_weeks}`)
  console.log(`  Rum/Cane Weeks: ${summary.rum_cane_weeks}`)
  console.log(`  Vodka Weeks: ${summary.vodka_weeks}`)
  console.log(`  Cleaning Weeks: ${summary.cleaning_weeks}`)
  console.log(`  Bottling Weeks: ${summary.bottling_weeks}`)
  console.log(`  Total Heart Days: ${summary.total_heart_days}`)
  console.log(`  Total Tail Days: ${summary.total_tail_days}`)
  console.log(`  Total Cleaning Days: ${summary.total_cleaning_days}\n`)
}

main().catch(console.error)


