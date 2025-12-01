/**
 * Add packaging and botanical inventory to Supabase
 * Includes ALL botanicals from all gin recipes (even with 0 quantity)
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'SET' : 'MISSING')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const organizationId = '00000000-0000-0000-0000-000000000001'

// Complete list of ALL botanicals used across ALL gin recipes
const ALL_GIN_BOTANICALS = [
  // Core botanicals (used in most gins)
  'juniper_berries_g',
  'coriander_g',
  'angelica_root',
  'orris_root_g',
  
  // Citrus
  'orange_peel',
  'lemon_peel',
  'lemon_myrtle_g',
  'lemon_aspen',
  'grapefruit_peel',
  'finger_lime',
  'mandarin',
  'mandarin_skin',
  'kaffir_fruit_rind',
  'kaffir_leaves',
  
  // Spices
  'cinnamon_g',
  'cardamom_g',
  'cassia',
  'star_anise',
  'cloves',
  'licorice_g',
  'vanilla',
  
  // Herbs & Flowers
  'lavender_g',
  'chamomile_g',
  'holy_basil',
  'thai_sweet_basil',
  'sawtooth_coriander',
  'thai_marigolds',
  'rosella_flower',
  
  // Roots & Others
  'macadamia_g',
  'galangal',
  'turmeric',
  'lemongrass',
  'pandanus'
]

// Current stock provided by user
const CURRENT_STOCK = {
  // Packaging
  boxes_6_units: 465,
  bottles_700ml: 2028,
  corks: 6912,
  
  // Botanicals (from user)
  vanilla: 0,
  star_anise: 0,
  cloves: 0,
  cinnamon_g: 140,
  macadamia_g: 270,
  orris_root_g: 214,
  chamomile_g: 205,
  cardamom_g: 95,
  lemon_myrtle_g: 86,
  licorice_g: 664,
  lavender_g: 250,
  juniper_berries_g: 4000,
  coriander_g: 10000,
  angelica_root: 0,
  
  // Additional botanicals from recipes (not provided = 0)
  orange_peel: 0,
  lemon_peel: 0,
  lemon_aspen: 0,
  grapefruit_peel: 0,
  finger_lime: 0,
  mandarin: 0,
  mandarin_skin: 0,
  kaffir_fruit_rind: 0,
  kaffir_leaves: 0,
  cassia: 0,
  holy_basil: 0,
  thai_sweet_basil: 0,
  sawtooth_coriander: 0,
  thai_marigolds: 0,
  rosella_flower: 0,
  galangal: 0,
  turmeric: 0,
  lemongrass: 0,
  pandanus: 0
}

// Mapping SKU to friendly name
const ITEM_NAMES: Record<string, { name: string; category: string; uom: string }> = {
  boxes_6_units: { name: 'Carton 6-Pack', category: 'Packaging', uom: 'units' },
  bottles_700ml: { name: 'Bottle 700ml', category: 'Packaging', uom: 'units' },
  corks: { name: 'Cork - Wood', category: 'Packaging', uom: 'units' },
  
  // Botanicals
  juniper_berries_g: { name: 'Juniper Berries', category: 'Botanicals', uom: 'g' },
  coriander_g: { name: 'Coriander Seed', category: 'Botanicals', uom: 'g' },
  angelica_root: { name: 'Angelica Root', category: 'Botanicals', uom: 'g' },
  orris_root_g: { name: 'Orris Root', category: 'Botanicals', uom: 'g' },
  orange_peel: { name: 'Orange Peel', category: 'Botanicals', uom: 'g' },
  lemon_peel: { name: 'Lemon Peel', category: 'Botanicals', uom: 'g' },
  lemon_myrtle_g: { name: 'Lemon Myrtle', category: 'Botanicals', uom: 'g' },
  lemon_aspen: { name: 'Lemon Aspen', category: 'Botanicals', uom: 'g' },
  grapefruit_peel: { name: 'Grapefruit Peel', category: 'Botanicals', uom: 'g' },
  finger_lime: { name: 'Finger Lime', category: 'Botanicals', uom: 'g' },
  mandarin: { name: 'Mandarin', category: 'Botanicals', uom: 'g' },
  mandarin_skin: { name: 'Mandarin Skin', category: 'Botanicals', uom: 'g' },
  kaffir_fruit_rind: { name: 'Kaffir Fruit Rind', category: 'Botanicals', uom: 'g' },
  kaffir_leaves: { name: 'Kaffir Leaves', category: 'Botanicals', uom: 'g' },
  cinnamon_g: { name: 'Cinnamon', category: 'Botanicals', uom: 'g' },
  cardamom_g: { name: 'Cardamom', category: 'Botanicals', uom: 'g' },
  cassia: { name: 'Cassia', category: 'Botanicals', uom: 'g' },
  star_anise: { name: 'Star Anise', category: 'Botanicals', uom: 'g' },
  cloves: { name: 'Cloves', category: 'Botanicals', uom: 'g' },
  licorice_g: { name: 'Liquorice', category: 'Botanicals', uom: 'g' },
  vanilla: { name: 'Vanilla', category: 'Botanicals', uom: 'g' },
  lavender_g: { name: 'Lavender', category: 'Botanicals', uom: 'g' },
  chamomile_g: { name: 'Chamomile', category: 'Botanicals', uom: 'g' },
  holy_basil: { name: 'Holy Basil', category: 'Botanicals', uom: 'g' },
  thai_sweet_basil: { name: 'Thai Sweet Basil', category: 'Botanicals', uom: 'g' },
  sawtooth_coriander: { name: 'Sawtooth Coriander', category: 'Botanicals', uom: 'g' },
  thai_marigolds: { name: 'Thai Marigolds', category: 'Botanicals', uom: 'g' },
  rosella_flower: { name: 'Rosella Flower', category: 'Botanicals', uom: 'g' },
  macadamia_g: { name: 'Macadamia', category: 'Botanicals', uom: 'g' },
  galangal: { name: 'Galangal', category: 'Botanicals', uom: 'g' },
  turmeric: { name: 'Turmeric', category: 'Botanicals', uom: 'g' },
  lemongrass: { name: 'Lemongrass', category: 'Botanicals', uom: 'g' },
  pandanus: { name: 'Pandanus', category: 'Botanicals', uom: 'g' }
}

async function addInventory() {
  console.log('\n📦 Adding Packaging & Botanicals Inventory to Supabase...\n')

  let itemsCreated = 0
  let itemsUpdated = 0
  let stockAdded = 0

  for (const [sku, quantity] of Object.entries(CURRENT_STOCK)) {
    const itemInfo = ITEM_NAMES[sku]
    if (!itemInfo) {
      console.warn(`⚠️  No mapping for SKU: ${sku}`)
      continue
    }

    // Check if item exists
    const { data: existingItem } = await supabase
      .from('items')
      .select('id, name')
      .eq('name', itemInfo.name)
      .eq('organization_id', organizationId)
      .single()

    let itemId: string

    if (existingItem) {
      itemId = existingItem.id
      itemsUpdated++
      console.log(`✓ Found: ${itemInfo.name}`)
    } else {
      // Create item
      const { data: newItem, error } = await supabase
        .from('items')
        .insert([{
          name: itemInfo.name,
          category: itemInfo.category,
          default_uom: itemInfo.uom,
          is_alcohol: false,
          organization_id: organizationId
        }])
        .select('id')
        .single()

      if (error) {
        console.error(`❌ Error creating ${itemInfo.name}:`, error.message)
        continue
      }

      itemId = newItem.id
      itemsCreated++
      console.log(`✅ Created: ${itemInfo.name}`)
    }

    // Add stock transaction (only if quantity > 0)
    if (quantity > 0) {
      const { error: txnError } = await supabase
        .from('inventory_txns')
        .insert([{
          item_id: itemId,
          txn_type: 'RECEIVE',
          quantity: quantity,
          uom: itemInfo.uom,
          organization_id: organizationId
        }])

      if (txnError) {
        console.error(`❌ Error adding stock for ${itemInfo.name}:`, txnError.message)
      } else {
        stockAdded++
        console.log(`   → Added ${quantity} ${itemInfo.uom}`)
      }
    } else {
      console.log(`   → Stock: 0 ${itemInfo.uom} (no transaction added)`)
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log(`\n✅ COMPLETE!`)
  console.log(`   📦 Items created: ${itemsCreated}`)
  console.log(`   ♻️  Items updated: ${itemsUpdated}`)
  console.log(`   📊 Stock transactions added: ${stockAdded}`)
  console.log(`\n`)
}

addInventory().catch(console.error)

