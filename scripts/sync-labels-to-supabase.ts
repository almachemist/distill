// Script to sync label inventory from data/inventory.json to Supabase items table
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function syncLabelsToSupabase() {
  console.log('🔄 Syncing labels from inventory.json to Supabase...\n')

  // Get organization_id from existing items
  const { data: existingItems, error: orgError } = await supabase
    .from('items')
    .select('organization_id')
    .limit(1)
    .single()

  if (orgError || !existingItems) {
    console.error('❌ Could not find organization_id. Please check your items table.')
    process.exit(1)
  }

  const organizationId = existingItems.organization_id
  console.log(`✅ Using organization_id: ${organizationId}\n`)

  // Load inventory.json
  const inventoryPath = path.join(__dirname, '../data/inventory.json')
  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'))

  // Filter only label items
  const labels = inventory.filter((item: any) => item.category === 'Labels')

  console.log(`📦 Found ${labels.length} label items in inventory.json\n`)

  let added = 0
  let updated = 0
  let errors = 0

  for (const label of labels) {
    try {
      // Check if item already exists in Supabase
      const { data: existing, error: fetchError } = await supabase
        .from('items')
        .select('id, name')
        .eq('name', label.name)
        .maybeSingle()

      if (fetchError) {
        console.error(`❌ Error checking ${label.name}:`, fetchError.message)
        errors++
        continue
      }

      if (existing) {
        // Update existing item with current stock
        const { error: updateError } = await supabase
          .from('inventory_txns')
          .insert({
            item_id: existing.id,
            txn_type: 'ADJUST',
            quantity: label.currentStock,
            notes: `Initial stock sync from inventory.json - ${new Date().toISOString()}`
          })

        if (updateError) {
          console.error(`❌ Error updating stock for ${label.name}:`, updateError.message)
          errors++
        } else {
          console.log(`✅ Updated: ${label.name} → ${label.currentStock} units`)
          updated++
        }
      } else {
        // Insert new item
        const { data: newItem, error: insertError } = await supabase
          .from('items')
          .insert({
            name: label.name,
            category: 'packaging', // Supabase uses 'packaging' category
            default_uom: label.unit || 'unit',
            is_alcohol: false,
            organization_id: organizationId
          })
          .select()
          .single()

        if (insertError) {
          console.error(`❌ Error inserting ${label.name}:`, insertError.message)
          errors++
          continue
        }

        // Add initial stock transaction
        if (label.currentStock > 0) {
          const { error: txnError } = await supabase
            .from('inventory_txns')
            .insert({
              item_id: newItem.id,
              txn_type: 'RECEIVE',
              quantity: label.currentStock,
              notes: `Initial stock from inventory.json - ${new Date().toISOString()}`
            })

          if (txnError) {
            console.error(`❌ Error adding stock for ${label.name}:`, txnError.message)
            errors++
          }
        }

        console.log(`✅ Added: ${label.name} → ${label.currentStock} units`)
        added++
      }
    } catch (err) {
      console.error(`❌ Unexpected error for ${label.name}:`, err)
      errors++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 SYNC SUMMARY:')
  console.log(`  ✅ Added: ${added} items`)
  console.log(`  🔄 Updated: ${updated} items`)
  console.log(`  ❌ Errors: ${errors}`)
  console.log('='.repeat(60))

  if (errors === 0) {
    console.log('\n✅ All labels synced successfully!')
  } else {
    console.log(`\n⚠️  Completed with ${errors} errors`)
  }
}

syncLabelsToSupabase().catch(console.error)

