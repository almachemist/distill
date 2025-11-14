#!/usr/bin/env tsx

/**
 * Generate December 2025 Production Calendar
 *
 * December 2025 Productions:
 * 1. Coffee Liqueur - Bottling Run (priority, early December)
 * 2. Navy Strength Gin - Small batch 1/1 (20L in Simini still, 200ml bottles only)
 * 3. Merchant Mae White Rum - Batch 1/3 (this becomes the first batch, so 2026 only has 2/3 and 3/3)
 * 4. Spiced Rum - Bottling Run (remaining stock from tank, end of December)
 */

import fs from 'fs'
import path from 'path'

interface WeekPlan {
  week_number: number
  week_start: string
  week_end: string
  month: number
  month_name: string
  mode: string
  production_runs: ProductionRun[]
  bottling: boolean
  bottling_tasks?: string[]
  notes: string[]
  tank_allocations: string[]
}

interface ProductionRun {
  product: string
  batch_number: number
  total_batches: number
  production_type: string
  receiving_tank?: string
  notes?: string
}

// Helper to format dates
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

// Helper to get week start (Monday)
const getWeekStart = (year: number, week: number): Date => {
  const jan1 = new Date(year, 0, 1)
  const daysOffset = (week - 1) * 7
  const weekStart = new Date(jan1.getTime() + daysOffset * 24 * 60 * 60 * 1000)
  
  // Adjust to Monday
  const day = weekStart.getDay()
  const diff = day === 0 ? -6 : 1 - day
  weekStart.setDate(weekStart.getDate() + diff)
  
  return weekStart
}

console.log('╔════════════════════════════════════════════════════════════════╗')
console.log('║                                                                ║')
console.log('║              DECEMBER 2025 PRODUCTION CALENDAR                 ║')
console.log('║                                                                ║')
console.log('╚════════════════════════════════════════════════════════════════╝')
console.log('')

const calendar: WeekPlan[] = []

// December 2025 is weeks 49-52 of 2025
// Week 49: Dec 1-7
// Week 50: Dec 8-14
// Week 51: Dec 15-21
// Week 52: Dec 22-28
// Week 53: Dec 29-31 (partial week into 2026)

const decemberWeeks = [
  { week: 49, start: '2025-12-01', end: '2025-12-07' },
  { week: 50, start: '2025-12-08', end: '2025-12-14' },
  { week: 51, start: '2025-12-15', end: '2025-12-21' },
  { week: 52, start: '2025-12-22', end: '2025-12-28' },
  { week: 53, start: '2025-12-29', end: '2025-12-31' }
]

// Week 49: Coffee Liqueur Bottling (priority)
calendar.push({
  week_number: 49,
  week_start: '2025-12-01',
  week_end: '2025-12-07',
  month: 12,
  month_name: 'Dec',
  mode: 'BOTTLING',
  production_runs: [],
  bottling: true,
  bottling_tasks: ['Bottle Coffee Liqueur'],
  notes: [
    'Coffee Liqueur - Bottling Run',
    'Priority bottling for holiday season',
    'Full week dedicated to bottling'
  ],
  tank_allocations: []
})

// Week 50: Navy Strength Gin - Small Batch (20L in Simini still)
// NO TANK USED - Direct collection and bottling
calendar.push({
  week_number: 50,
  week_start: '2025-12-08',
  week_end: '2025-12-14',
  month: 12,
  month_name: 'Dec',
  mode: 'GIN',
  production_runs: [{
    product: 'Navy Strength Gin',
    batch_number: 1,
    total_batches: 1,
    production_type: 'GIN',
    receiving_tank: 'None',
    notes: '20L batch in Simini still - Direct bottling to 200ml bottles only'
  }],
  bottling: false,
  notes: [
    'Navy Strength Gin - Small Batch 1/1',
    '20L batch in Simini still (not main still)',
    'For 200ml bottles only',
    'Direct collection and bottling - no tank storage'
  ],
  tank_allocations: []
})

// Week 51: Merchant Mae White Rum - Batch 1/3
calendar.push({
  week_number: 51,
  week_start: '2025-12-15',
  week_end: '2025-12-21',
  month: 12,
  month_name: 'Dec',
  mode: 'RUM',
  production_runs: [{
    product: 'Merchant Mae White Rum',
    batch_number: 1,
    total_batches: 3,
    production_type: 'RUM',
    receiving_tank: 'T-330-A'
  }],
  bottling: false,
  notes: [
    'Merchant Mae White Rum - Batch 1/3',
    'First batch of 2026 production cycle',
    'Hearts → T-330-A'
  ],
  tank_allocations: [
    'T-400: Navy Strength Gin (2w)',
    'T-330-A: Merchant Mae White Rum (1w)'
  ]
})

// Week 52: Spiced Rum Bottling (small amount left in tank)
calendar.push({
  week_number: 52,
  week_start: '2025-12-22',
  week_end: '2025-12-28',
  month: 12,
  month_name: 'Dec',
  mode: 'BOTTLING',
  production_runs: [],
  bottling: true,
  bottling_tasks: ['Bottle Spiced Rum (remaining stock from tank)'],
  notes: [
    'Spiced Rum - Bottling Run',
    'Small amount left in tank from previous batch',
    'Holiday period - light operations'
  ],
  tank_allocations: [
    'T-400: Navy Strength Gin (3w)',
    'T-330-A: Merchant Mae White Rum (2w)'
  ]
})

// Save calendar
const outputPath = path.join(process.cwd(), 'data', 'production_calendar_december_2025.json')
fs.writeFileSync(outputPath, JSON.stringify({ calendar }, null, 2))

console.log('✅ December 2025 calendar generated!')
console.log(`✅ Saved to: ${outputPath}`)
console.log('')
console.log('Summary:')
console.log('  Week 49: Coffee Liqueur Bottling')
console.log('  Week 50: Navy Strength Gin (Small Batch 1/1)')
console.log('  Week 51: Merchant Mae White Rum (Batch 1/3)')
console.log('  Week 52: Spiced Rum Bottling (remaining stock from tank)')
console.log('')

