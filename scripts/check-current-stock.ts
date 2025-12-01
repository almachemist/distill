import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkStock() {
  console.log('\n📦 CHECKING CURRENT STOCK IN DATABASE...\n')

  const { data: items } = await supabase
    .from('items')
    .select('id, name, category, default_uom')
    .order('name')

  if (!items) {
    console.log('No items found')
    return
  }

  const stockData: Record<string, number> = {}

  for (const item of items) {
    const { data: txns } = await supabase
      .from('inventory_txns')
      .select('quantity, txn_type')
      .eq('item_id', item.id)

    let stock = 0
    if (txns) {
      for (const txn of txns) {
        if (txn.txn_type === 'RECEIVE' || txn.txn_type === 'PRODUCE' || txn.txn_type === 'ADJUST') {
          stock += Number(txn.quantity)
        } else if (txn.txn_type === 'CONSUME' || txn.txn_type === 'DESTROY') {
          stock -= Number(txn.quantity)
        }
      }
    }

    if (stock > 0 || item.category === 'Packaging' || item.category === 'Botanicals') {
      stockData[item.name] = stock
    }
  }

  console.log('PACKAGING:')
  console.log('  Carton 6-Pack:', stockData['Carton 6-Pack'] || 0)
  console.log('  Bottle 700ml:', stockData['Bottle 700ml'] || 0)
  console.log('  Bottle 200ml:', stockData['Bottle 200ml'] || 0)
  console.log('  Cork - Wood:', stockData['Cork - Wood'] || 0)

  console.log('\nBOTANICALS:')
  const botanicals = Object.keys(stockData)
    .filter(name => items.find(i => i.name === name && i.category === 'Botanicals'))
    .sort()
  
  for (const name of botanicals) {
    console.log(`  ${name}: ${stockData[name]}`)
  }

  console.log('\n\n✅ DONE')
}

checkStock()

