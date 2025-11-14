import fs from 'fs'
import path from 'path'

// Load data
const demandAnalysisPath = path.join(process.cwd(), 'data', 'demand_and_stock_analysis_2026.json')
const productionPlanPath = path.join(process.cwd(), 'data', 'production_plan_2026_v4.json')

const demandAnalysis = JSON.parse(fs.readFileSync(demandAnalysisPath, 'utf-8'))
const productionPlan = JSON.parse(fs.readFileSync(productionPlanPath, 'utf-8'))

console.log('╔════════════════════════════════════════════════════════════════╗')
console.log('║                                                                ║')
console.log('║         2026 PRODUCTION PLAN VERIFICATION                      ║')
console.log('║         Checking for under/over production                     ║')
console.log('║                                                                ║')
console.log('╚════════════════════════════════════════════════════════════════╝\n')

interface MonthlyStock {
  month: number
  month_name: string
  starting_stock: number
  production: number
  demand: number
  ending_stock: number
  months_of_stock: number
  status: string
}

interface ProductAnalysis {
  product: string
  priority: string
  current_stock: number
  total_demand_2026: number
  batches_needed: number
  bottles_per_batch: number
  stock_projection: MonthlyStock[]
}

// Analyze each product
const issues: string[] = []
const warnings: string[] = []
const ok: string[] = []

for (const plan of productionPlan.production_plans as ProductAnalysis[]) {
  const { product, stock_projection, batches_needed, total_demand_2026, current_stock } = plan
  
  // Check for stockouts
  const stockouts = stock_projection.filter(m => m.ending_stock < 0)
  const criticalLow = stock_projection.filter(m => m.status === 'CRITICAL' || m.status === 'LOW')
  
  // Check if we end the year with negative stock
  const dec2026 = stock_projection.find(m => m.month === 12)
  
  if (stockouts.length > 0) {
    issues.push(`❌ ${product}: STOCKOUT in ${stockouts.map(s => s.month_name).join(', ')}`)
  } else if (dec2026 && dec2026.ending_stock < 0) {
    issues.push(`❌ ${product}: Ends 2026 with NEGATIVE stock (${dec2026.ending_stock})`)
  } else if (criticalLow.length > 3) {
    warnings.push(`⚠️  ${product}: ${criticalLow.length} months with LOW/CRITICAL stock`)
  } else if (batches_needed === 0 && total_demand_2026 > current_stock) {
    issues.push(`❌ ${product}: NO PRODUCTION planned but demand (${total_demand_2026}) > stock (${current_stock})`)
  } else if (batches_needed === 0 && total_demand_2026 > 0) {
    ok.push(`✅ ${product}: No production needed (stock: ${current_stock}, demand: ${total_demand_2026})`)
  } else {
    ok.push(`✅ ${product}: ${batches_needed} batches planned`)
  }
}

// Print results
console.log('\n🔴 CRITICAL ISSUES (Must fix):')
console.log('═'.repeat(70))
if (issues.length === 0) {
  console.log('  None! 🎉')
} else {
  issues.forEach(i => console.log(`  ${i}`))
}

console.log('\n⚠️  WARNINGS (Review recommended):')
console.log('═'.repeat(70))
if (warnings.length === 0) {
  console.log('  None!')
} else {
  warnings.forEach(w => console.log(`  ${w}`))
}

console.log('\n✅ OK (No issues):')
console.log('═'.repeat(70))
ok.forEach(o => console.log(`  ${o}`))

// Summary by priority
console.log('\n\n📊 PRODUCTION SUMMARY BY PRIORITY:')
console.log('═'.repeat(70))

const byPriority = {
  CRITICAL: productionPlan.production_plans.filter((p: ProductAnalysis) => p.priority === 'CRITICAL'),
  HIGH: productionPlan.production_plans.filter((p: ProductAnalysis) => p.priority === 'HIGH'),
  MEDIUM: productionPlan.production_plans.filter((p: ProductAnalysis) => p.priority === 'MEDIUM'),
  LOW: productionPlan.production_plans.filter((p: ProductAnalysis) => p.priority === 'LOW')
}

for (const [priority, products] of Object.entries(byPriority)) {
  console.log(`\n${priority}:`)
  for (const p of products as ProductAnalysis[]) {
    const dec = p.stock_projection.find(m => m.month === 12)
    console.log(`  ${p.product.padEnd(30)} | Batches: ${p.batches_needed} | Dec stock: ${dec?.ending_stock || 'N/A'}`)
  }
}

console.log('\n')

