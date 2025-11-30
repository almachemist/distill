// Script to add stock quantities for labels
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addLabelStock() {
  console.log('📦 Adding stock quantities for labels...\n')

  // Get organization_id
  const { data: existingItems, error: orgError } = await supabase
    .from('items')
    .select('organization_id')
    .limit(1)
    .single()

  if (orgError || !existingItems) {
    console.error('❌ Could not find organization_id')
    process.exit(1)
  }

  const organizationId = existingItems.organization_id
  console.log(`✅ Using organization_id: ${organizationId}\n`)

  // Load inventory.json
  const inventoryPath = path.join(__dirname, '../data/inventory.json')
  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'))

  // Filter only label items with stock > 0
  const labels = inventory.filter((item: any) =>
    item.category === 'Labels' && item.currentStock > 0
  )

  console.log(`Found ${labels.length} labels with stock to add\n`)

  let success = 0
  let errors = 0

  for (const label of labels) {
    try {
      // Find the item in Supabase by name
      const { data: item, error: findError } = await supabase
        .from('items')
        .select('id, name')
        .eq('name', label.name)
        .single()

      if (findError || !item) {
        console.error(`❌ Could not find item: ${label.name}`)
        errors++
        continue
      }

      // Add RECEIVE transaction for initial stock
      const { error: txnError } = await supabase
        .from('inventory_txns')
        .insert({
          item_id: item.id,
          txn_type: 'RECEIVE',
          quantity: label.currentStock,
          uom: label.unit || 'unit',
          organization_id: organizationId
        })

      if (txnError) {
        console.error(`❌ Error adding stock for ${label.name}:`, txnError.message)
        errors++
      } else {
        console.log(`✅ ${label.name}: ${label.currentStock} units`)
        success++
      }
    } catch (err) {
      console.error(`❌ Unexpected error for ${label.name}:`, err)
      errors++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY:')
  console.log(`  ✅ Success: ${success}`)
  console.log(`  ❌ Errors: ${errors}`)
  console.log('='.repeat(60))
}

addLabelStock().catch(console.error)

