import { createClient } from '@/lib/supabase/client'
import { getOrganizationId } from '@/lib/auth/get-org-id'

export class CompleteInventorySeedService {
  private supabase = createClient()

  async seedCompleteInventory(): Promise<{ created: number; updated: number }> {
    // Complete inventory list combining all recipes and master inventory
    const completeInventoryList = [
      // Base spirits and water
      { name: 'Neutral Grain Spirit', category: 'neutral_spirit', uom: 'L', is_alcohol: true },
      { name: 'Ethanol (food grade)', category: 'neutral_spirit', uom: 'L', is_alcohol: true },
      { name: 'Ethanol 80.6%', category: 'neutral_spirit', uom: 'L', is_alcohol: true },
      { name: 'Ethanol 81.3%', category: 'neutral_spirit', uom: 'L', is_alcohol: true },
      { name: 'Ethanol 81.4%', category: 'neutral_spirit', uom: 'L', is_alcohol: true },
      { name: 'Ethanol 82%', category: 'neutral_spirit', uom: 'L', is_alcohol: true },
      { name: 'Water', category: 'other', uom: 'L', is_alcohol: false },

      // Core gin botanicals (from all recipes)
      { name: 'Juniper', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Coriander', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Angelica', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Cardamon', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Liquorice', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Liquorice Root', category: 'botanical', uom: 'g', is_alcohol: false },

      // Traditional botanicals
      { name: 'Orris Root', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Orange peel', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Lemon peel', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Grapefruit peel', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Lavender', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Chamomile', category: 'botanical', uom: 'g', is_alcohol: false },

      // Australian botanicals (Rainforest Gin)
      { name: 'Cassia', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Lemon Myrtle', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Lemon Aspen', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Macadamia', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Pepperberry', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Vanilla', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Mango', category: 'botanical', uom: 'g', is_alcohol: false },

      // Asian botanicals (Dry Season Gin)
      { name: 'Sawtooth Coriander', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Holy Basil', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Thai Sweet Basil', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Kaffir Fruit Rind', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Kaffir Leaves', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Thai Marigolds', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Galangal', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Lemongrass', category: 'botanical', uom: 'g', is_alcohol: false },
      { name: 'Pandanus', category: 'botanical', uom: 'g', is_alcohol: false },

      // Packaging items
      { name: '700ml Bottle (clear)', category: 'packaging_bottle', uom: 'each', is_alcohol: false },
      { name: '200ml Bottle', category: 'packaging_bottle', uom: 'each', is_alcohol: false },
      { name: 'Bottle Cork', category: 'packaging_closure', uom: 'each', is_alcohol: false },
      { name: 'Plastic Lid (tamper)', category: 'packaging_closure', uom: 'each', is_alcohol: false },
      { name: 'Cap (screw top)', category: 'packaging_closure', uom: 'each', is_alcohol: false },
      { name: 'Label (front)', category: 'packaging_label', uom: 'each', is_alcohol: false },
      { name: 'Label (back)', category: 'packaging_label', uom: 'each', is_alcohol: false },
      { name: 'Gift Box (1 bottle)', category: 'packaging_box', uom: 'each', is_alcohol: false },
      { name: 'Carton (6 bottles)', category: 'packaging_carton', uom: 'each', is_alcohol: false },
      { name: 'Shrink Wrap', category: 'packaging_other', uom: 'each', is_alcohol: false },

      // Finished products
      { name: 'Rainforest Gin (42%)', category: 'finished_good', uom: 'L', is_alcohol: true },
      { name: 'Signature Dry Gin (Traditional)', category: 'finished_good', uom: 'L', is_alcohol: true },
      { name: 'Navy Strength Gin', category: 'finished_good', uom: 'L', is_alcohol: true },
      { name: 'MM Gin', category: 'finished_good', uom: 'L', is_alcohol: true },
      { name: 'Dry Season Gin (40%)', category: 'finished_good', uom: 'L', is_alcohol: true },
      { name: 'Wet Season Gin (42%)', category: 'finished_good', uom: 'L', is_alcohol: true }
    ]

    try {
      const organizationId = await getOrganizationId()

      let created = 0
      let updated = 0

      for (const item of completeInventoryList) {
        try {
          // Try to find existing item by name
          const { data: existingItem } = await this.supabase
            .from('items')
            .select('id')
            .eq('organization_id', organizationId)
            .eq('name', item.name)
            .single()

          if (existingItem) {
            // Update existing item
            const { error } = await this.supabase
              .from('items')
              .update({
                category: item.category,
                default_uom: item.uom,
                is_alcohol: item.is_alcohol
              })
              .eq('id', existingItem.id)

            if (error) {
              console.warn(`Failed to update item ${item.name}:`, error.message)
            } else {
              updated++
            }
          } else {
            // Create new item
            const { error } = await this.supabase
              .from('items')
              .insert([{
                organization_id: organizationId,
                name: item.name,
                category: item.category,
                default_uom: item.uom,
                is_alcohol: item.is_alcohol
              }])

            if (error) {
              console.warn(`Failed to create item ${item.name}:`, error.message)
            } else {
              created++
            }
          }
        } catch (error) {
          console.warn(`Error processing item ${item.name}:`, error)
        }
      }

      return { created, updated }

    } catch (error) {
      console.error('Failed to seed complete inventory:', error)
      throw error
    }
  }

  // Create initial stock lots for all items
  async createInitialStockLots(): Promise<{ lotsCreated: number }> {
    try {
      const organizationId = await getOrganizationId()

      // Get all items
      const { data: items, error: itemsError } = await this.supabase
        .from('items')
        .select('id, name, category, default_uom, is_alcohol')
        .eq('organization_id', organizationId)

      if (itemsError) {
        throw new Error(`Failed to fetch items: ${itemsError.message}`)
      }

      let lotsCreated = 0

      for (const item of items) {
        try {
          // Create initial lot for each item
          const lotCode = `INIT-${item.name.replace(/\s+/g, '-').toUpperCase()}-001`
          
          // Determine initial quantity based on item type
          let initialQuantity = 0
          if (item.category === 'neutral_spirit') {
            initialQuantity = 1000 // 1000L of base spirits
          } else if (item.category === 'botanical') {
            initialQuantity = 5000 // 5000g of botanicals
          } else if (item.category === 'packaging_bottle') {
            initialQuantity = 1000 // 1000 bottles
          } else if (item.category === 'packaging_closure') {
            initialQuantity = 2000 // 2000 closures
          } else if (item.category === 'packaging_label') {
            initialQuantity = 2000 // 2000 labels
          } else if (item.category === 'packaging_box') {
            initialQuantity = 500 // 500 boxes
          } else if (item.category === 'packaging_carton') {
            initialQuantity = 200 // 200 cartons
          } else if (item.category === 'packaging_other') {
            initialQuantity = 1000 // 1000 units
          } else if (item.name === 'Water') {
            initialQuantity = 10000 // 10000L of water
          } else if (item.category === 'finished_good') {
            initialQuantity = 0 // No initial finished goods
          }

          // Create lot
          const { data: lot, error: lotError } = await this.supabase
            .from('lots')
            .insert([{
              organization_id: organizationId,
              item_id: item.id,
              lot_code: lotCode,
              received_date: new Date().toISOString(),
              note: 'Initial inventory lot'
            }])
            .select('id')
            .single()

          if (lotError) {
            console.warn(`Failed to create lot for ${item.name}:`, lotError.message)
            continue
          }

          // Create initial receive transaction if quantity > 0
          if (initialQuantity > 0) {
            const { error: txnError } = await this.supabase
              .from('inventory_txns')
              .insert([{
                organization_id: organizationId,
                item_id: item.id,
                lot_id: lot.id,
                txn_type: 'RECEIVE',
                quantity: initialQuantity,
                uom: item.default_uom,
                note: 'Initial inventory setup',
                dt: new Date().toISOString()
              }])

            if (txnError) {
              console.warn(`Failed to create transaction for ${item.name}:`, txnError.message)
            } else {
              lotsCreated++
            }
          }

        } catch (error) {
          console.warn(`Error creating lot for ${item.name}:`, error)
        }
      }

      return { lotsCreated }

    } catch (error) {
      console.error('Failed to create initial stock lots:', error)
      throw error
    }
  }
}


