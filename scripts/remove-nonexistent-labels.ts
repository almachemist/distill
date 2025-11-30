// Script to remove non-existent labels from Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const LABELS_TO_REMOVE = [
  'Label - Wet Season Rum 200ml',
  'Label - Dry Season Rum 200ml'
]

async function removeNonexistentLabels() {
  console.log('🗑️  Removing non-existent labels from Supabase...\n')

  for (const labelName of LABELS_TO_REMOVE) {
    try {
      // Find the item
      const { data: item, error: findError } = await supabase
        .from('items')
        .select('id, name')
        .eq('name', labelName)
        .maybeSingle()

      if (findError) {
        console.error(`❌ Error finding ${labelName}:`, findError.message)
        continue
      }

      if (!item) {
        console.log(`⚠️  ${labelName} - not found (already removed?)`)
        continue
      }

      // Delete all transactions for this item first
      const { error: txnDeleteError } = await supabase
        .from('inventory_txns')
        .delete()
        .eq('item_id', item.id)

      if (txnDeleteError) {
        console.error(`❌ Error deleting transactions for ${labelName}:`, txnDeleteError.message)
        continue
      }

      // Delete the item
      const { error: itemDeleteError } = await supabase
        .from('items')
        .delete()
        .eq('id', item.id)

      if (itemDeleteError) {
        console.error(`❌ Error deleting ${labelName}:`, itemDeleteError.message)
        continue
      }

      console.log(`✅ Removed: ${labelName}`)

    } catch (err) {
      console.error(`❌ Unexpected error for ${labelName}:`, err)
    }
  }

  console.log('\n✅ Done!')
}

removeNonexistentLabels().catch(console.error)

