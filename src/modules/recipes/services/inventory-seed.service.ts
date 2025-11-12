import { createClient } from '@/lib/supabase/client'
import type { LotInsert, InventoryTxnInsert } from '../types/recipe.types'

export class InventorySeedService {
  private supabase = createClient()

  async seedInventoryData(): Promise<{ lots: number; transactions: number }> {
    try {
      // Get current user's organization
      let organizationId: string
      
      // In development mode, use mock organization ID
      if (process.env.NODE_ENV === 'development') {
        organizationId = '00000000-0000-0000-0000-000000000001'
      } else {
        const { data: profileData } = await this.supabase
          .from('profiles')
          .select('organization_id')
          .single()

        const profile = profileData as { organization_id: string | null } | null

        if (!profile?.organization_id) {
          throw new Error('User organization not found')
        }
        organizationId = profile.organization_id
      }

      // Get items that should exist
      const { data: itemsData } = await this.supabase
        .from('items')
        .select('id, name')
        .eq('organization_id', organizationId)

      const items = (itemsData ?? []) as Array<{ id: string; name: string }>

      if (!items || items.length === 0) {
        throw new Error('No items found. Please seed items first.')
      }

      let lotsCreated = 0
      let transactionsCreated = 0

      // Define sample inventory data
      const inventoryData = [
        {
          itemName: 'Juniper Berries',
          lotNumber: 'JB-2024-001',
          receivedDate: '2024-01-15',
          supplier: 'Botanical Supplies Ltd',
          costPerUnit: 45.50,
          initialStock: 50.0,
          uom: 'kg',
          notes: 'Premium quality juniper berries from Macedonia'
        },
        {
          itemName: 'Coriander Seeds',
          lotNumber: 'CS-2024-001',
          receivedDate: '2024-01-15',
          supplier: 'Botanical Supplies Ltd',
          costPerUnit: 28.75,
          initialStock: 30.0,
          uom: 'kg',
          notes: 'Fresh coriander seeds from India'
        },
        {
          itemName: 'Angelica Root',
          lotNumber: 'AR-2024-001',
          receivedDate: '2024-01-20',
          supplier: 'Herbal Extracts Co',
          costPerUnit: 95.00,
          initialStock: 15.0,
          uom: 'kg',
          notes: 'Organic angelica root from Germany'
        },
        {
          itemName: 'Orris Root',
          lotNumber: 'OR-2024-001',
          receivedDate: '2024-01-20',
          supplier: 'Herbal Extracts Co',
          costPerUnit: 120.00,
          initialStock: 10.0,
          uom: 'kg',
          notes: 'Premium orris root from Italy'
        },
        {
          itemName: 'Lemon Peel',
          lotNumber: 'LP-2024-001',
          receivedDate: '2024-01-25',
          supplier: 'Citrus Processors',
          costPerUnit: 15.50,
          initialStock: 25.0,
          uom: 'kg',
          notes: 'Dried lemon peel from organic lemons'
        },
        {
          itemName: 'Orange Peel',
          lotNumber: 'OP-2024-001',
          receivedDate: '2024-01-25',
          supplier: 'Citrus Processors',
          costPerUnit: 14.25,
          initialStock: 20.0,
          uom: 'kg',
          notes: 'Dried orange peel from Valencia oranges'
        },
        {
          itemName: 'Cardamom',
          lotNumber: 'CD-2024-001',
          receivedDate: '2024-01-30',
          supplier: 'Spice Merchants Ltd',
          costPerUnit: 180.00,
          initialStock: 5.0,
          uom: 'kg',
          notes: 'Premium green cardamom from Guatemala'
        },
        {
          itemName: 'Cassia Bark',
          lotNumber: 'CB-2024-001',
          receivedDate: '2024-01-30',
          supplier: 'Spice Merchants Ltd',
          costPerUnit: 25.00,
          initialStock: 8.0,
          uom: 'kg',
          notes: 'Cassia bark from Vietnam'
        },
        {
          itemName: 'Neutral Spirit 96%',
          lotNumber: 'NS-2024-001',
          receivedDate: '2024-02-01',
          supplier: 'Premium Distillers',
          costPerUnit: 8.50,
          initialStock: 1000.0,
          uom: 'L',
          notes: '96% neutral grain spirit'
        },
        {
          itemName: 'Water',
          lotNumber: 'W-2024-001',
          receivedDate: '2024-02-01',
          supplier: 'Municipal Water',
          costPerUnit: 0.02,
          initialStock: 5000.0,
          uom: 'L',
          notes: 'Filtered municipal water'
        }
      ]

      // Process each inventory item
      for (const invData of inventoryData) {
        const item = items.find(i => i.name === invData.itemName)
        if (!item) {
          console.warn(`Item not found: ${invData.itemName}`)
          continue
        }

        // Check if lot already exists
        const { data: existingLotData } = await this.supabase
          .from('lots')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('item_id', item.id)
          .eq('code', invData.lotNumber)
          .single()

        const existingLot = existingLotData as { id: string } | null

        let lotId: string

        if (existingLot) {
          lotId = existingLot.id
        } else {
          // Create new lot
          const lotNoteParts = [invData.supplier, invData.notes]
            .filter(Boolean)
            .join(' – ')

          const lotData: LotInsert = {
            organization_id: organizationId,
            item_id: item.id,
            code: invData.lotNumber,
            received_date: invData.receivedDate,
            note: lotNoteParts || null,
            qty: invData.initialStock,
            invoice_url: null
          }

          const { data: newLotData, error: lotError } = await this.supabase
            .from('lots')
            .insert([lotData])
            .select('id')
            .single()

          if (lotError) {
            console.error(`Failed to create lot for ${invData.itemName}:`, lotError)
            continue
          }

          const newLot = newLotData as { id: string } | null

          if (!newLot) {
            console.error(`Lot insert returned no data for ${invData.itemName}`)
            continue
          }

          lotId = newLot.id
          lotsCreated++
        }

        // Check if RECEIVE transaction already exists
        const { data: existingTxnData } = await this.supabase
          .from('inventory_txns')
          .select('id')
          .eq('lot_id', lotId)
          .eq('txn_type', 'RECEIVE')
          .eq('note', 'Initial stock receipt')

        const existingTxn = (existingTxnData ?? []) as Array<{ id: string }>

        if (existingTxn.length > 0) {
          console.log(`RECEIVE transaction already exists for lot ${invData.lotNumber}`)
          continue
        }

        // Create RECEIVE transaction
        const txnData: InventoryTxnInsert = {
          organization_id: organizationId,
          item_id: item.id,
          lot_id: lotId,
          txn_type: 'RECEIVE',
          quantity: invData.initialStock,
          uom: invData.uom,
          note: 'Initial stock receipt',
          dt: invData.receivedDate ?? null
        }

        const { error: txnError } = await this.supabase
          .from('inventory_txns')
          .insert([txnData])

        if (txnError) {
          console.error(`Failed to create transaction for ${invData.itemName}:`, txnError)
          continue
        }

        transactionsCreated++
      }

      return { lots: lotsCreated, transactions: transactionsCreated }

    } catch (error) {
      console.error('Failed to seed inventory data:', error)
      throw error
    }
  }
}
