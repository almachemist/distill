// Script to update label stock with CORRECT quantities
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// CORRECT label quantities from user
const CORRECT_LABEL_STOCK: Record<string, number> = {
  "Rainforest_700": 2300,
  "Rainforest_200": 600,
  "Signature_700": 930,
  "Signature_200": 1200,
  "Navy_700": 1200,
  "Navy_200": 1200,
  "CaneSpirit_700": 1300,
  "CaneSpirit_200": 800,
  "WetSeason_700": 1700,
  "DrySeason_700": 1700,
  "PineappleRum_200": 1800,
  "PineappleRum_700": 430,
  "SpicedRum_200": 1900,
  "SpicedRum_700": 1100,
  "MerchantMade_Gin_Bottle": 800,
  "MerchantMade_Vodka_Bottle": 150,
  "MerchantMade_WhiteRum": 0,
  "MerchantMade_DarkRum": 500,
  "ReserveCask_Rum_700": 300,
  "CoffeeLiqueur_700": 1800,
  "MM_BerryBurst": 2000,
  "MM_GoldenSunrise": 2000,
  "Beige_Label_MultiSpirit_700": 2000
}

// Map product keys to label names in Supabase
const LABEL_NAME_MAP: Record<string, string> = {
  "Rainforest_700": "Label - Rainforest Gin 700ml",
  "Rainforest_200": "Label - Rainforest Gin 200ml",
  "Signature_700": "Label - Signature Dry Gin 700ml",
  "Signature_200": "Label - Signature Dry Gin 200ml",
  "Navy_700": "Label - Navy Strength Gin 700ml",
  "Navy_200": "Label - Navy Strength Gin 200ml",
  "CaneSpirit_700": "Label - Cane Spirit 700ml",
  "CaneSpirit_200": "Label - Cane Spirit 200ml",
  "WetSeason_700": "Label - Wet Season Rum 700ml",
  "DrySeason_700": "Label - Dry Season Rum 700ml",
  "PineappleRum_200": "Label - Pineapple Rum 200ml",
  "PineappleRum_700": "Label - Pineapple Rum 700ml",
  "SpicedRum_200": "Label - Spiced Rum 200ml",
  "SpicedRum_700": "Label - Spiced Rum 700ml",
  "MerchantMade_Gin_Bottle": "Label - Merchant Mae Gin 700ml",
  "MerchantMade_Vodka_Bottle": "Label - Merchant Mae Vodka 700ml",
  "MerchantMade_WhiteRum": "Label - Merchant Mae White Rum 700ml",
  "MerchantMade_DarkRum": "Label - Merchant Mae Dark Rum 700ml",
  "ReserveCask_Rum_700": "Label - Reserve Cask Rum 700ml",
  "CoffeeLiqueur_700": "Label - Coffee Liqueur 700ml",
  "MM_BerryBurst": "Label - Merchant Mae Berry Burst Vodka 700ml",
  "MM_GoldenSunrise": "Label - Merchant Mae Golden Sunrise Vodka 700ml",
  "Beige_Label_MultiSpirit_700": "Label - Beige Multi-Spirit 700ml"
}

async function updateLabelStock() {
  console.log('🔄 Updating label stock with CORRECT quantities...\n')

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

  let updated = 0
  let created = 0
  let errors = 0

  for (const [key, correctQty] of Object.entries(CORRECT_LABEL_STOCK)) {
    const labelName = LABEL_NAME_MAP[key]
    
    if (!labelName) {
      console.log(`⚠️  Skipping ${key} - no label name mapping`)
      continue
    }

    try {
      // Find the item
      const { data: item, error: findError } = await supabase
        .from('items')
        .select('id, name')
        .eq('name', labelName)
        .maybeSingle()

      if (findError) {
        console.error(`❌ Error finding ${labelName}:`, findError.message)
        errors++
        continue
      }

      if (!item) {
        // Create new item if it doesn't exist
        const { data: newItem, error: createError } = await supabase
          .from('items')
          .insert({
            name: labelName,
            category: 'packaging',
            default_uom: 'unit',
            is_alcohol: false,
            organization_id: organizationId
          })
          .select()
          .single()

        if (createError) {
          console.error(`❌ Error creating ${labelName}:`, createError.message)
          errors++
          continue
        }

        console.log(`✅ Created: ${labelName}`)
        
        // Add stock if > 0
        if (correctQty > 0) {
          const { error: txnError } = await supabase
            .from('inventory_txns')
            .insert({
              item_id: newItem.id,
              txn_type: 'RECEIVE',
              quantity: correctQty,
              uom: 'unit',
              organization_id: organizationId
            })

          if (txnError) {
            console.error(`❌ Error adding stock:`, txnError.message)
            errors++
          } else {
            console.log(`   Stock: ${correctQty} units`)
            created++
          }
        }
        continue
      }

      // Get current stock
      const { data: txns } = await supabase
        .from('inventory_txns')
        .select('quantity, txn_type')
        .eq('item_id', item.id)

      let currentStock = 0
      if (txns) {
        for (const txn of txns) {
          if (txn.txn_type === 'RECEIVE' || txn.txn_type === 'PRODUCE' || txn.txn_type === 'ADJUST') {
            currentStock += Number(txn.quantity)
          } else if (txn.txn_type === 'CONSUME' || txn.txn_type === 'DESTROY') {
            currentStock -= Number(txn.quantity)
          }
        }
      }

      const difference = correctQty - currentStock

      if (difference !== 0) {
        // Add adjustment transaction
        const { error: adjustError } = await supabase
          .from('inventory_txns')
          .insert({
            item_id: item.id,
            txn_type: 'ADJUST',
            quantity: difference,
            uom: 'unit',
            organization_id: organizationId
          })

        if (adjustError) {
          console.error(`❌ Error adjusting ${labelName}:`, adjustError.message)
          errors++
        } else {
          console.log(`✅ ${labelName}: ${currentStock} → ${correctQty} (${difference > 0 ? '+' : ''}${difference})`)
          updated++
        }
      } else {
        console.log(`✓  ${labelName}: ${currentStock} (already correct)`)
      }

    } catch (err) {
      console.error(`❌ Unexpected error for ${labelName}:`, err)
      errors++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY:')
  console.log(`  ✅ Updated: ${updated}`)
  console.log(`  ➕ Created: ${created}`)
  console.log(`  ❌ Errors: ${errors}`)
  console.log('='.repeat(60))
}

updateLabelStock().catch(console.error)

