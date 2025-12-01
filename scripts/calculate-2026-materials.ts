/**
 * Calculate ALL materials needed for 2026 production
 * Bottles, Labels, Corks, Caps, Sleeves, Cartons - EVERYTHING
 */

import productionPlan from '../data/production_plan_2026_v4.json'

interface MaterialRequirement {
  sku: string
  name: string
  category: string
  quantity_needed: number
  current_stock: number
  to_order: number
  buffer_30_percent: number
  recommended_order: number
}

// Product to packaging mapping
const PACKAGING_MAP: Record<string, {
  bottle_700?: string
  bottle_200?: string
  label_700?: string
  label_200?: string
  cork_700?: string
  cork_200?: string
  cap_700?: string
  cap_200?: string
  sleeve_700?: string
  sleeve_200?: string
  carton_700?: string
  carton_200?: string
}> = {
  'Rainforest Gin': {
    bottle_700: 'BTL-GIN-700',
    bottle_200: 'BTL-GIN-200',
    label_700: 'LBL-RF-700',
    label_200: 'LBL-RF-200',
    cork_700: 'CORK-WOOD',
    cork_200: 'CORK-WOOD',
    sleeve_700: 'SLEEVE-RF',
    carton_700: 'CARTON-6PACK',
    carton_200: 'CARTON-12PACK'
  },
  'Signature Gin': {
    bottle_700: 'BTL-GIN-700',
    bottle_200: 'BTL-GIN-200',
    label_700: 'LBL-SIG-700',
    label_200: 'LBL-SIG-200',
    cork_700: 'CORK-WOOD',
    cork_200: 'CORK-WOOD',
    sleeve_700: 'SLEEVE-SIG',
    carton_700: 'CARTON-6PACK',
    carton_200: 'CARTON-12PACK'
  },
  'Navy Gin': {
    bottle_700: 'BTL-GIN-700',
    bottle_200: 'BTL-GIN-200',
    label_700: 'LBL-NAVY-700',
    label_200: 'LBL-NAVY-200',
    cork_700: 'CORK-WOOD',
    cork_200: 'CORK-WOOD',
    sleeve_700: 'SLEEVE-NAVY',
    carton_700: 'CARTON-6PACK',
    carton_200: 'CARTON-12PACK'
  },
  'Wet Season Gin': {
    bottle_700: 'BTL-GIN-700',
    label_700: 'LBL-WET-700',
    cork_700: 'CORK-WOOD',
    sleeve_700: 'SLEEVE-WET',
    carton_700: 'CARTON-6PACK'
  },
  'Dry Season Gin': {
    bottle_700: 'BTL-GIN-700',
    label_700: 'LBL-DR-700',
    cork_700: 'CORK-WOOD',
    sleeve_700: 'SLEEVE-DRY',
    carton_700: 'CARTON-6PACK'
  },
  'Australian Cane Spirit': {
    bottle_700: 'BTL-SPIRIT-700',
    bottle_200: 'BTL-SPIRIT-200',
    label_700: 'LBL-CANE-700',
    label_200: 'LBL-CANE-200',
    cork_700: 'CORK-WOOD',
    cork_200: 'CORK-WOOD',
    carton_700: 'CARTON-6PACK',
    carton_200: 'CARTON-12PACK'
  },
  'Merchant Mae Gin': {
    bottle_700: 'MM-GIN-700',
    label_700: 'LBL-MMGIN-700',
    cap_700: 'CAP-SCREW-BLACK',
    carton_700: 'CARTON-6PACK'
  },
  'Merchant Mae Vodka': {
    bottle_700: 'MM-VODKA-700',
    label_700: 'LBL-MMVODKA-700',
    cap_700: 'CAP-SCREW-BLACK',
    carton_700: 'CARTON-6PACK'
  },
  'Merchant Mae White Rum': {
    bottle_700: 'MM-RUM-700',
    label_700: 'LBL-MMWHITE-700',
    cap_700: 'CAP-SCREW-BLACK',
    carton_700: 'CARTON-6PACK'
  },
  'Merchant Mae Dark Rum': {
    bottle_700: 'MM-RUM-700',
    label_700: 'LBL-MMDARK-700',
    cap_700: 'CAP-SCREW-BLACK',
    carton_700: 'CARTON-6PACK'
  },
  'Coffee Liqueur': {
    bottle_700: 'BTL-SPIRIT-700',
    label_700: 'LBL-COFFEE-700',
    cork_700: 'CORK-WOOD',
    carton_700: 'CARTON-6PACK'
  },
  'Spiced Rum': {
    bottle_700: 'BTL-RUM-700',
    bottle_200: 'BTL-RUM-200',
    label_700: 'LBL-SPICED-700',
    label_200: 'LBL-SPICED-200',
    cork_700: 'CORK-WOOD',
    cork_200: 'CORK-WOOD',
    carton_700: 'CARTON-6PACK',
    carton_200: 'CARTON-12PACK'
  },
  'Pineapple Rum': {
    bottle_700: 'BTL-RUM-700',
    bottle_200: 'BTL-RUM-200',
    label_700: 'LBL-PINE-700',
    label_200: 'LBL-PINE-200',
    cork_700: 'CORK-WOOD',
    cork_200: 'CORK-WOOD',
    carton_700: 'CARTON-6PACK',
    carton_200: 'CARTON-12PACK'
  },
  'Reserve Cask Rum': {
    bottle_700: 'BTL-RUM-700',
    label_700: 'LBL-RESERVE-700',
    cork_700: 'CORK-WOOD',
    carton_700: 'CARTON-6PACK'
  }
}

function calculateMaterials() {
  const materials = new Map<string, MaterialRequirement>()

  // Process each product in the production plan
  for (const plan of productionPlan.production_plans) {
    const product = plan.product
    const packaging = PACKAGING_MAP[product]

    if (!packaging) {
      console.warn(`⚠️  No packaging mapping for: ${product}`)
      continue
    }

    // Calculate total bottles needed from production schedule
    for (const batch of plan.production_schedule) {
      const bottles_700 = batch.bottles_700ml || 0
      const bottles_200 = batch.bottles_200ml || 0

      // Add 700ml materials
      if (bottles_700 > 0) {
        if (packaging.bottle_700) addMaterial(materials, packaging.bottle_700, 'Bottles', bottles_700)
        if (packaging.label_700) addMaterial(materials, packaging.label_700, 'Labels', bottles_700)
        if (packaging.cork_700) addMaterial(materials, packaging.cork_700, 'Corks', bottles_700)
        if (packaging.cap_700) addMaterial(materials, packaging.cap_700, 'Caps', bottles_700)
        if (packaging.sleeve_700) addMaterial(materials, packaging.sleeve_700, 'Sleeves', bottles_700)
        if (packaging.carton_700) addMaterial(materials, packaging.carton_700, 'Cartons', Math.ceil(bottles_700 / 6))
      }

      // Add 200ml materials
      if (bottles_200 > 0) {
        if (packaging.bottle_200) addMaterial(materials, packaging.bottle_200, 'Bottles', bottles_200)
        if (packaging.label_200) addMaterial(materials, packaging.label_200, 'Labels', bottles_200)
        if (packaging.cork_200) addMaterial(materials, packaging.cork_200, 'Corks', bottles_200)
        if (packaging.cap_200) addMaterial(materials, packaging.cap_200, 'Caps', bottles_200)
        if (packaging.sleeve_200) addMaterial(materials, packaging.sleeve_200, 'Sleeves', bottles_200)
        if (packaging.carton_200) addMaterial(materials, packaging.carton_200, 'Cartons', Math.ceil(bottles_200 / 12))
      }
    }
  }

  return Array.from(materials.values()).sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
}

function addMaterial(map: Map<string, MaterialRequirement>, sku: string, category: string, quantity: number) {
  if (!map.has(sku)) {
    map.set(sku, {
      sku,
      name: sku,
      category,
      quantity_needed: 0,
      current_stock: 0,
      to_order: 0,
      buffer_30_percent: 0,
      recommended_order: 0
    })
  }
  const material = map.get(sku)!
  material.quantity_needed += quantity
}

// Run calculation
const materials = calculateMaterials()

console.log('\n🎯 2026 PRODUCTION MATERIALS REQUIREMENTS\n')
console.log('=' .repeat(80))

let totalItems = 0
for (const category of ['Bottles', 'Labels', 'Corks', 'Caps', 'Sleeves', 'Cartons']) {
  const items = materials.filter(m => m.category === category)
  if (items.length === 0) continue

  console.log(`\n📦 ${category.toUpperCase()}:`)
  console.log('-'.repeat(80))

  for (const item of items) {
    console.log(`  ${item.sku.padEnd(25)} ${item.quantity_needed.toLocaleString().padStart(10)} units`)
    totalItems += item.quantity_needed
  }
}

console.log('\n' + '='.repeat(80))
console.log(`\n✅ TOTAL MATERIALS NEEDED: ${totalItems.toLocaleString()} items\n`)

// Save to JSON
import { writeFileSync } from 'fs'
writeFileSync(
  'data/materials_requirements_2026.json',
  JSON.stringify({ generated_at: new Date().toISOString(), materials }, null, 2)
)

console.log('💾 Saved to: data/materials_requirements_2026.json\n')

