import { createClient } from '@/lib/supabase/client'

export interface InventoryItem {
  name: string
  category: 'raw' | 'packaging' | 'product'
  type: 'ethanol' | 'botanical' | 'bottle' | 'label' | 'gin' | 'water' | 'closure' | 'box'
  quantity: number
  unit: 'kg' | 'L' | 'units'
  minThreshold: number
  lastUpdated?: string
  notes?: string
}

export class SimplifiedInventorySeedService {
  private supabase = createClient()

  async seedSimplifiedInventory(): Promise<{ created: number; updated: number }> {
    // Simplified inventory structure focused on production logic
    const inventoryItems = [
      // RAW MATERIALS
      // Ethanol varieties
      { name: 'Ethanol 80.6%', category: 'raw', type: 'ethanol', unit: 'L', minThreshold: 50 },
      { name: 'Ethanol 81.3%', category: 'raw', type: 'ethanol', unit: 'L', minThreshold: 50 },
      { name: 'Ethanol 81.4%', category: 'raw', type: 'ethanol', unit: 'L', minThreshold: 50 },
      { name: 'Ethanol 82%', category: 'raw', type: 'ethanol', unit: 'L', minThreshold: 50 },
      { name: 'Neutral Grain Spirit', category: 'raw', type: 'ethanol', unit: 'L', minThreshold: 100 },
      
      // Water
      { name: 'Water', category: 'raw', type: 'water', unit: 'L', minThreshold: 1000 },
      
      // Botanicals (grouped together)
      { name: 'Juniper', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 3 },
      { name: 'Coriander', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 2 },
      { name: 'Angelica', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 1 },
      { name: 'Cardamon', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 1 },
      { name: 'Liquorice', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 1 },
      { name: 'Orris Root', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 0.5 },
      { name: 'Orange Peel', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 2 },
      { name: 'Lemon Peel', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 2 },
      { name: 'Grapefruit Peel', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 1 },
      { name: 'Lavender', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 0.5 },
      { name: 'Chamomile', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 0.5 },
      
      // Australian Botanicals
      { name: 'Lemon Myrtle', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 1 },
      { name: 'Lemon Aspen', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 0.5 },
      { name: 'Macadamia', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 1 },
      { name: 'Pepperberry', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 0.5 },
      { name: 'Cassia', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 0.5 },
      { name: 'Vanilla', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 0.2 },
      { name: 'Mango', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 1 },
      
      // Asian Botanicals
      { name: 'Sawtooth Coriander', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 1 },
      { name: 'Holy Basil', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 1 },
      { name: 'Thai Sweet Basil', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 1 },
      { name: 'Kaffir Fruit Rind', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 2 },
      { name: 'Kaffir Leaves', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 1 },
      { name: 'Thai Marigolds', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 1 },
      { name: 'Galangal', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 1 },
      { name: 'Lemongrass', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 1 },
      { name: 'Pandanus', category: 'raw', type: 'botanical', unit: 'kg', minThreshold: 0.5 },

      // PACKAGING MATERIALS
      // Bottles
      { name: '700ml Bottle (Clear)', category: 'packaging', type: 'bottle', unit: 'units', minThreshold: 500 },
      { name: '200ml Bottle', category: 'packaging', type: 'bottle', unit: 'units', minThreshold: 200 },
      
      // Closures
      { name: 'Bottle Cork', category: 'packaging', type: 'closure', unit: 'units', minThreshold: 1000 },
      { name: 'Plastic Lid (Tamper)', category: 'packaging', type: 'closure', unit: 'units', minThreshold: 1000 },
      { name: 'Cap (Screw Top)', category: 'packaging', type: 'closure', unit: 'units', minThreshold: 1000 },
      
      // Labels
      { name: 'Label (Front)', category: 'packaging', type: 'label', unit: 'units', minThreshold: 2000 },
      { name: 'Label (Back)', category: 'packaging', type: 'label', unit: 'units', minThreshold: 2000 },
      
      // Boxes and Cartons
      { name: 'Gift Box (1 Bottle)', category: 'packaging', type: 'box', unit: 'units', minThreshold: 200 },
      { name: 'Carton (6 Bottles)', category: 'packaging', type: 'box', unit: 'units', minThreshold: 100 },
      { name: 'Shrink Wrap', category: 'packaging', type: 'box', unit: 'units', minThreshold: 50 },

      // FINISHED PRODUCTS
      { name: 'Signature Dry Gin (Traditional)', category: 'product', type: 'gin', unit: 'L', minThreshold: 20 },
      { name: 'Navy Strength Gin', category: 'product', type: 'gin', unit: 'L', minThreshold: 15 },
      { name: 'Rainforest Gin (42%)', category: 'product', type: 'gin', unit: 'L', minThreshold: 20 },
      { name: 'MM Gin', category: 'product', type: 'gin', unit: 'L', minThreshold: 25 },
      { name: 'Dry Season Gin (40%)', category: 'product', type: 'gin', unit: 'L', minThreshold: 20 },
      { name: 'Wet Season Gin (42%)', category: 'product', type: 'gin', unit: 'L', minThreshold: 20 }
    ]

    try {
      let organizationId: string
      
      if (process.env.NODE_ENV === 'development') {
        organizationId = '00000000-0000-0000-0000-000000000001'
      } else {
        const { data: profile } = await this.supabase
          .from('profiles')
          .select('organization_id')
          .single()

        if (!profile?.organization_id) {
          throw new Error('User organization not found')
        }
        organizationId = profile.organization_id
      }

      let created = 0
      let updated = 0

      for (const item of inventoryItems) {
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
                default_uom: item.unit,
                is_alcohol: item.type === 'ethanol' || item.type === 'gin'
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
                default_uom: item.unit,
                is_alcohol: item.type === 'ethanol' || item.type === 'gin'
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
      console.error('Failed to seed simplified inventory:', error)
      throw error
    }
  }

  // Create initial stock lots with realistic quantities
  async createInitialStockLots(): Promise<{ lotsCreated: number }> {
    try {
      let organizationId: string
      
      if (process.env.NODE_ENV === 'development') {
        organizationId = '00000000-0000-0000-0000-000000000001'
      } else {
        const { data: profile } = await this.supabase
          .from('profiles')
          .select('organization_id')
          .single()

        if (!profile?.organization_id) {
          throw new Error('User organization not found')
        }
        organizationId = profile.organization_id
      }

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
          
          // Determine initial quantity based on item category and type
          let initialQuantity = 0
          if (item.category === 'raw') {
            if (item.name.includes('Ethanol') || item.name === 'Neutral Grain Spirit') {
              initialQuantity = 1000 // 1000L of spirits
            } else if (item.name === 'Water') {
              initialQuantity = 10000 // 10000L of water
            } else {
              initialQuantity = 10 // 10kg of botanicals
            }
          } else if (item.category === 'packaging') {
            if (item.name.includes('Bottle')) {
              initialQuantity = 1000 // 1000 bottles
            } else if (item.name.includes('Label')) {
              initialQuantity = 2000 // 2000 labels
            } else if (item.name.includes('Cork') || item.name.includes('Cap') || item.name.includes('Lid')) {
              initialQuantity = 1500 // 1500 closures
            } else {
              initialQuantity = 200 // 200 boxes/cartons
            }
          } else if (item.category === 'product') {
            initialQuantity = 0 // No initial finished products
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


