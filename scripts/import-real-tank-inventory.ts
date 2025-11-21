/**
 * Import Real Tank Inventory Data
 * 
 * Imports the 8 real tanks from Gabi's distillery with current contents,
 * ABV, volumes, and statuses.
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dscmknufpfhxjcanzdsr.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment')
  console.error('Make sure .env.local contains SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const ORGANIZATION_ID = '00000000-0000-0000-0000-000000000001'

const realTanks = [
  {
    tank_id: 'T-330-01',
    name: 'Tank 330L #1',
    capacity_l: 330,
    type: 'steel',
    has_lid: true,
    product: 'Rum Blend',
    volume: 51,
    abv: 63.0,
    batch: null,
    batch_id: null,
    status: 'holding',
    notes: 'Rum blend holding for proofing'
  },
  {
    tank_id: 'T-330-02',
    name: 'Tank 330L #2',
    capacity_l: 330,
    type: 'steel',
    has_lid: true,
    product: 'Vodka',
    volume: 250,
    abv: 86.7,
    batch: null,
    batch_id: null,
    status: 'pending_redistillation',
    notes: '2nd distillation; to be redistilled'
  },
  {
    tank_id: 'T-615-01',
    name: 'Tank 615L #1',
    capacity_l: 615,
    type: 'steel',
    has_lid: true,
    product: 'White Rum',
    volume: null,
    abv: null,
    batch: null,
    batch_id: null,
    status: 'holding',
    notes: 'White rum holding'
  },
  {
    tank_id: 'T-330-03',
    name: 'Tank 330L #3',
    capacity_l: 330,
    type: 'steel',
    has_lid: true,
    product: 'Vodka',
    volume: 233,
    abv: 80.0,
    batch: null,
    batch_id: null,
    status: 'pending_redistillation',
    notes: 'Distilled twice; to be redistilled'
  },
  {
    tank_id: 'T-400-CS-01',
    name: 'Tank 400L Cane Spirit #1',
    capacity_l: 400,
    type: 'steel',
    has_lid: true,
    product: 'Cane Spirit',
    volume: 20,
    abv: 64.5,
    batch: '25-01',
    batch_id: 'CS-25-01',
    status: 'holding',
    notes: 'Cane Spirit batch 25-01'
  },
  {
    tank_id: 'T-317-CS-02',
    name: 'Tank 317L Cane Spirit #2',
    capacity_l: 317,
    type: 'steel',
    has_lid: false,
    product: 'Cane Spirit',
    volume: null,
    abv: null,
    batch: '25-02',
    batch_id: 'CS-25-02',
    status: 'holding',
    notes: 'Cane Spirit batch 25-02 - no lid, low priority'
  },
  {
    tank_id: 'T-100-INF-COFFEE-01',
    name: 'Tank 100L Coffee Infusion #1',
    capacity_l: 100,
    type: 'steel',
    has_lid: true,
    product: 'Coffee Liqueur',
    volume: 30,
    abv: 44.0,
    batch: null,
    batch_id: null,
    status: 'infusing',
    infusion_type: 'coffee',
    extra_materials: { coffee_kg: 3 },
    started_on: '2025-11-17',
    notes: 'Coffee liqueur infusion - 3kg coffee'
  },
  {
    tank_id: 'T-230-INF-COFFEE-02',
    name: 'Tank 230L Coffee Infusion #2',
    capacity_l: 230,
    type: 'steel',
    has_lid: true,
    product: 'Coffee Liqueur',
    volume: null,
    abv: null,
    batch: null,
    batch_id: null,
    status: 'infusing',
    infusion_type: 'coffee',
    notes: 'Coffee liqueur infusion'
  }
]

async function importTanks() {
  console.log('🚀 Starting real tank inventory import...\n')

  let successCount = 0
  let errorCount = 0

  for (const tank of realTanks) {
    try {
      const { data, error } = await supabase
        .from('tanks')
        .upsert({
          organization_id: ORGANIZATION_ID,
          tank_id: tank.tank_id,
          tank_name: tank.name,
          tank_type: 'spirits', // Default tank type
          capacity_l: tank.capacity_l,
          type: tank.type,
          has_lid: tank.has_lid,
          product: tank.product,
          current_volume_l: tank.volume,
          current_abv: tank.abv,
          batch: tank.batch,
          batch_id: tank.batch_id,
          status: tank.status,
          infusion_type: (tank as any).infusion_type,
          extra_materials: (tank as any).extra_materials,
          started_on: (tank as any).started_on,
          notes: tank.notes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'tank_id,organization_id'
        })
        .select()

      if (error) {
        console.error(`❌ Error importing ${tank.tank_id}:`, error.message)
        errorCount++
      } else {
        console.log(`✅ Imported ${tank.tank_id} - ${tank.name}`)
        successCount++
      }
    } catch (err: any) {
      console.error(`❌ Exception importing ${tank.tank_id}:`, err.message)
      errorCount++
    }
  }

  console.log(`\n📊 Import Summary:`)
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log(`   📦 Total: ${realTanks.length}`)
}

importTanks()
  .then(() => {
    console.log('\n✅ Tank inventory import complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error)
    process.exit(1)
  })

