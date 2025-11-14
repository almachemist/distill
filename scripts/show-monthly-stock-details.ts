import fs from 'fs'
import path from 'path'

const productionPlanPath = path.join(process.cwd(), 'data', 'production_plan_2026_v4.json')
const productionPlan = JSON.parse(fs.readFileSync(productionPlanPath, 'utf-8'))

console.log('╔════════════════════════════════════════════════════════════════╗')
console.log('║         MONTHLY STOCK PROJECTIONS - KEY PRODUCTS              ║')
console.log('╚════════════════════════════════════════════════════════════════╝\n')

const keyProducts = [
  'Merchant Mae Vodka',
  'Signature Gin',
  'Rainforest Gin',
  'Merchant Mae White Rum',
  'Merchant Mae Dark Rum',
  'Australian Cane Spirit'
]

for (const productName of keyProducts) {
  const plan = productionPlan.production_plans.find((p: any) => p.product === productName)
  
  if (!plan) {
    console.log(`❌ ${productName}: NOT FOUND\n`)
    continue
  }
  
  console.log(`\n${'═'.repeat(70)}`)
  console.log(`📦 ${productName}`)
  console.log(`${'═'.repeat(70)}`)
  console.log(`Current stock: ${plan.current_stock} bottles`)
  console.log(`Total demand 2026: ${plan.total_demand_2026} bottles`)
  console.log(`Batches planned: ${plan.batches_needed}`)
  console.log(`Bottles per batch: ${plan.bottles_per_batch}`)
  console.log(`Total production: ${plan.batches_needed * plan.bottles_per_batch} bottles`)
  console.log('')
  
  // Show month by month
  console.log('Month | Start  | Prod   | Demand | End    | Months | Status')
  console.log('------|--------|--------|--------|--------|--------|--------')
  
  for (const month of plan.stock_projection) {
    const start = month.starting_stock.toString().padStart(6)
    const prod = month.production.toString().padStart(6)
    const demand = month.demand.toString().padStart(6)
    const end = month.ending_stock.toString().padStart(6)
    const months = month.months_of_stock.toFixed(1).padStart(6)
    const status = month.status.padEnd(8)
    
    console.log(`${month.month_name.padEnd(5)} | ${start} | ${prod} | ${demand} | ${end} | ${months} | ${status}`)
  }
  
  // Show when production happens
  if (plan.production_schedule && plan.production_schedule.length > 0) {
    console.log('\nProduction schedule:')
    for (const batch of plan.production_schedule) {
      console.log(`  • ${batch.scheduled_month_name}: Batch ${batch.batch_number}/${plan.batches_needed} (${batch.total_bottles} bottles)`)
    }
  }
}

console.log('\n')

