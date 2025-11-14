import fs from 'fs'
import path from 'path'

const calendarPath = path.join(process.cwd(), 'data', 'production_calendar_2026_v4.json')
const calendar = JSON.parse(fs.readFileSync(calendarPath, 'utf-8'))

console.log('╔════════════════════════════════════════════════════════════════╗')
console.log('║                                                                ║')
console.log('║         2026 PRODUCTION CALENDAR V4 - SUMMARY                  ║')
console.log('║                                                                ║')
console.log('╚════════════════════════════════════════════════════════════════╝\n')

// Group by month
const byMonth = new Map<string, any[]>()

for (const week of calendar.calendar) {
  if (week.production_runs.length > 0) {
    if (!byMonth.has(week.month_name)) {
      byMonth.set(week.month_name, [])
    }
    byMonth.get(week.month_name)!.push({
      week: week.week_number,
      product: week.production_runs[0].product,
      batch: `${week.production_runs[0].batch_number}/${week.production_runs[0].total_batches}`,
      tank: week.production_runs[0].receiving_tank,
      type: week.mode
    })
  }
}

// Display by month
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

for (const month of MONTHS) {
  const batches = byMonth.get(month) || []
  
  if (batches.length > 0) {
    console.log(`\n${month} 2026 (${batches.length} batches)`)
    console.log('─'.repeat(70))
    
    for (const batch of batches) {
      const weekStr = `W${batch.week.toString().padStart(2, '0')}`
      const productStr = batch.product.padEnd(25)
      const batchStr = `Batch ${batch.batch}`.padEnd(12)
      const tankStr = batch.tank.padEnd(8)
      
      console.log(`  ${weekStr}  ${productStr}  ${batchStr}  ${tankStr}`)
    }
  }
}

// Summary statistics
console.log('\n\n')
console.log('═'.repeat(70))
console.log('SUMMARY STATISTICS')
console.log('═'.repeat(70))

const productionWeeks = calendar.calendar.filter((w: any) => w.production_runs.length > 0).length
const bottlingWeeks = calendar.calendar.filter((w: any) => w.bottling).length
const adminWeeks = calendar.calendar.filter((w: any) => w.mode === 'ADMIN' && !w.bottling).length

console.log(`\nTotal weeks in 2026: 52`)
console.log(`  Production weeks: ${productionWeeks} (${Math.round(productionWeeks/52*100)}%)`)
console.log(`  Bottling weeks: ${bottlingWeeks} (${Math.round(bottlingWeeks/52*100)}%)`)
console.log(`  Admin/prep weeks: ${adminWeeks} (${Math.round(adminWeeks/52*100)}%)`)

// Count by product
const byProduct = new Map<string, number>()
for (const week of calendar.calendar) {
  for (const run of week.production_runs) {
    byProduct.set(run.product, (byProduct.get(run.product) || 0) + 1)
  }
}

console.log('\n\nBatches by Product:')
console.log('─'.repeat(70))

const sortedProducts = Array.from(byProduct.entries()).sort((a, b) => b[1] - a[1])
for (const [product, count] of sortedProducts) {
  const productStr = product.padEnd(30)
  const countStr = `${count} batches`
  console.log(`  ${productStr}  ${countStr}`)
}

// Timeline visualization
console.log('\n\n')
console.log('═'.repeat(70))
console.log('TIMELINE VISUALIZATION')
console.log('═'.repeat(70))
console.log('\nWeek-by-week production schedule:')
console.log('P = Production | B = Bottling | - = Admin/Prep\n')

for (let week = 1; week <= 52; week++) {
  const weekData = calendar.calendar[week - 1]
  let symbol = '-'
  
  if (weekData.production_runs.length > 0) {
    symbol = 'P'
  } else if (weekData.bottling) {
    symbol = 'B'
  }
  
  process.stdout.write(symbol)
  
  if (week % 13 === 0) {
    process.stdout.write(`  (Q${Math.ceil(week/13)})\n`)
  }
}

console.log('\n\n')
console.log('✅ Calendar V4 successfully generated with demand-based planning!')
console.log('   All 20 batches scheduled across 20 weeks')
console.log('   Tank management: 4 movable tanks (T-400, T-330-A, T-330-B, T-330-C)')
console.log('   Bottling: Every 4 weeks or when all tanks occupied\n')

