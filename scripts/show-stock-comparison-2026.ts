import fs from 'fs'
import path from 'path'

// Load production plan
const planPath = path.join(process.cwd(), 'data', 'production_plan_2026_v4.json')
const plan = JSON.parse(fs.readFileSync(planPath, 'utf-8'))

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

console.log('╔════════════════════════════════════════════════════════════════════════════════════════╗')
console.log('║                                                                                        ║')
console.log('║                    STOCK PROJECTION 2026 - WITH vs WITHOUT PRODUCTION                  ║')
console.log('║                                                                                        ║')
console.log('╚════════════════════════════════════════════════════════════════════════════════════════╝\n')

// Show critical products first
const criticalProducts = [
  'Merchant Mae Vodka',
  'Rainforest Gin',
  'Merchant Mae Gin',
  'Merchant Mae White Rum',
  'Merchant Mae Dark Rum',
]

for (const productName of criticalProducts) {
  const productPlan = plan.production_plans.find((p: any) => p.product === productName)
  if (!productPlan) continue
  
  console.log(`\n${'═'.repeat(90)}`)
  console.log(`${productName} (${productPlan.priority} priority)`)
  console.log(`${'═'.repeat(90)}`)
  console.log(`Current Stock: ${productPlan.current_stock} bottles`)
  console.log(`2026 Demand: ${productPlan.total_demand_2026} bottles`)
  console.log(`Batches Needed: ${productPlan.batches_needed} batches`)

  if (productPlan.production_schedule.length > 0) {
    console.log(`\nProduction Schedule:`)
    productPlan.production_schedule.forEach((batch: any) => {
      console.log(`  → ${batch.scheduled_month_name}: Batch ${batch.batch_number}`)
    })
  }
  
  console.log(`\n${'─'.repeat(90)}`)
  console.log('Month | Start | Production | Demand | End Stock | Months | Status')
  console.log(`${'─'.repeat(90)}`)
  
  for (const projection of productPlan.stock_projection) {
    const statusIcons: Record<string, string> = {
      OK: '✅',
      LOW: '⚠️',
      CRITICAL: '🔴',
      STOCKOUT: '❌',
    }
    const statusIcon = statusIcons[projection.status as string] || '  '
    
    const prodStr = projection.production > 0 ? `+${projection.production}` : '0'
    
    console.log(
      `${projection.month_name.padEnd(5)} | ${String(projection.starting_stock).padStart(5)} | ${prodStr.padStart(10)} | ${String(projection.demand).padStart(6)} | ${String(projection.ending_stock).padStart(9)} | ${projection.months_of_stock.toFixed(1).padStart(6)} | ${statusIcon} ${projection.status}`
    )
  }
  
  // Summary
  const finalStock = productPlan.stock_projection[11].ending_stock
  const finalMonths = productPlan.stock_projection[11].months_of_stock
  
  console.log(`\n📊 End of 2026: ${finalStock} bottles (${finalMonths.toFixed(1)} months of stock)`)
  
  const stockouts = productPlan.stock_projection.filter((p: any) => p.status === 'STOCKOUT')
  if (stockouts.length > 0) {
    console.log(`⚠️ WARNING: ${stockouts.length} months with stockouts!`)
  } else {
    console.log(`✅ No stockouts in 2026!`)
  }
}

// Show other products with production
console.log(`\n\n${'═'.repeat(90)}`)
console.log('OTHER PRODUCTS WITH PRODUCTION SCHEDULED')
console.log(`${'═'.repeat(90)}\n`)

const otherProducts = plan.production_plans.filter((p: any) => 
  !criticalProducts.includes(p.product) && p.batches_needed > 0
)

for (const productPlan of otherProducts) {
  console.log(`\n${productPlan.product} (${productPlan.priority} priority)`)
  console.log(`  Current Stock: ${productPlan.current_stock} bottles`)
  console.log(`  2026 Demand: ${productPlan.total_demand_2026} bottles`)
  console.log(`  Batches Needed: ${productPlan.batches_needed} batches`)
  console.log(`  Production Schedule:`)
  productPlan.production_schedule.forEach((batch: any) => {
    console.log(`    → ${batch.scheduled_month_name}: Batch ${batch.batch_number}`)
  })

  const finalStock = productPlan.stock_projection[11].ending_stock
  const finalMonths = productPlan.stock_projection[11].months_of_stock
  console.log(`  End of 2026: ${finalStock} bottles (${finalMonths.toFixed(1)} months of stock)`)
}

// Show products with sufficient stock
console.log(`\n\n${'═'.repeat(90)}`)
console.log('PRODUCTS WITH SUFFICIENT STOCK (NO PRODUCTION NEEDED)')
console.log(`${'═'.repeat(90)}\n`)

const sufficientProducts = plan.production_plans.filter((p: any) => p.batches_needed === 0)

for (const productPlan of sufficientProducts) {
  const finalStock = productPlan.stock_projection[11].ending_stock
  const finalMonths = productPlan.stock_projection[11].months_of_stock
  
  console.log(`${productPlan.product}:`)
  console.log(`  Current: ${productPlan.current_stock} bottles → End 2026: ${finalStock} bottles (${finalMonths.toFixed(1)} months)`)
}

console.log('\n')

