import { createClient } from '@/lib/supabase/client'
import { EthanolSelection } from '../components/EthanolBatchSelector'
import { BotanicalSelection } from '../components/BotanicalSelector'
import { PackagingSelection } from '../components/PackagingSelector'

export interface BatchMaterialsInput {
  organization_id: string
  batch_id: string
  batch_type: 'gin' | 'vodka' | 'rum' | 'cane_spirit'
  ethanol?: EthanolSelection
  water_quantity_l?: number
  created_by: string
}

export interface BatchBotanicalsInput {
  organization_id: string
  batch_id: string
  batch_type: 'gin' | 'vodka' | 'rum' | 'cane_spirit'
  botanicals: BotanicalSelection[]
  created_by: string
}

export interface BatchPackagingInput {
  organization_id: string
  batch_id: string
  batch_type: 'gin' | 'vodka' | 'rum' | 'cane_spirit'
  packaging: PackagingSelection[]
  created_by: string
}

export class InventoryIntegrationService {
  private supabase = createClient()

  /**
   * Save batch materials (ethanol, water) and deduct from inventory
   */
  async saveBatchMaterials(input: BatchMaterialsInput): Promise<{ success: boolean; error?: string }> {
    try {
      const materials = []

      // Add ethanol if provided
      if (input.ethanol) {
        materials.push({
          organization_id: input.organization_id,
          batch_id: input.batch_id,
          batch_type: input.batch_type,
          material_type: 'ethanol',
          inventory_item_id: input.ethanol.inventory_item_id,
          item_name: input.ethanol.item_name,
          quantity_l: input.ethanol.quantity_l,
          abv: input.ethanol.abv,
          cost_per_unit: input.ethanol.cost_per_unit,
          total_cost: input.ethanol.total_cost,
          supplier: input.ethanol.supplier,
          lot_number: input.ethanol.lot_number
        })

        // Create inventory movement (OUT)
        await this.createInventoryMovement({
          organization_id: input.organization_id,
          item_id: input.ethanol.inventory_item_id,
          movement_type: 'OUT',
          quantity_change: -input.ethanol.quantity_l,
          unit: 'L',
          reference_type: 'batch',
          reference_id: input.batch_id,
          batch_type: input.batch_type,
          cost_per_unit: input.ethanol.cost_per_unit,
          total_cost: input.ethanol.total_cost,
          supplier: input.ethanol.supplier,
          created_by: input.created_by
        })

        // Deduct from inventory lots
        await this.deductFromInventory(input.ethanol.inventory_item_id, input.ethanol.quantity_l)
      }

      // Add water if provided
      if (input.water_quantity_l && input.water_quantity_l > 0) {
        materials.push({
          organization_id: input.organization_id,
          batch_id: input.batch_id,
          batch_type: input.batch_type,
          material_type: 'water',
          item_name: 'Water',
          quantity_l: input.water_quantity_l,
          abv: 0,
          cost_per_unit: 0,
          total_cost: 0
        })
      }

      // Insert batch materials
      if (materials.length > 0) {
        const { error } = await this.supabase
          .from('batch_materials')
          .insert(materials)

        if (error) throw error
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error saving batch materials:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Save batch botanicals and deduct from inventory
   */
  async saveBatchBotanicals(input: BatchBotanicalsInput): Promise<{ success: boolean; error?: string }> {
    try {
      if (input.botanicals.length === 0) {
        return { success: true }
      }

      const botanicals = input.botanicals.map(bot => ({
        organization_id: input.organization_id,
        batch_id: input.batch_id,
        batch_type: input.batch_type,
        inventory_item_id: bot.inventory_item_id,
        botanical_name: bot.botanical_name,
        quantity_g: bot.quantity_g,
        cost_per_kg: bot.cost_per_kg,
        total_cost: bot.total_cost,
        supplier: bot.supplier,
        lot_number: bot.lot_number,
        expiry_date: bot.expiry_date
      }))

      // Insert batch botanicals
      const { error } = await this.supabase
        .from('batch_botanicals')
        .insert(botanicals)

      if (error) throw error

      // Create inventory movements and deduct stock
      for (const bot of input.botanicals) {
        await this.createInventoryMovement({
          organization_id: input.organization_id,
          item_id: bot.inventory_item_id,
          movement_type: 'OUT',
          quantity_change: -(bot.quantity_g / 1000), // Convert g to kg
          unit: 'kg',
          reference_type: 'batch',
          reference_id: input.batch_id,
          batch_type: input.batch_type,
          cost_per_unit: bot.cost_per_kg,
          total_cost: bot.total_cost,
          supplier: bot.supplier,
          created_by: input.created_by
        })

        // Deduct from inventory (convert g to kg)
        await this.deductFromInventory(bot.inventory_item_id, bot.quantity_g / 1000)
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error saving batch botanicals:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Save batch packaging and deduct from inventory
   */
  async saveBatchPackaging(input: BatchPackagingInput): Promise<{ success: boolean; error?: string }> {
    try {
      if (input.packaging.length === 0) {
        return { success: true }
      }

      const packaging = input.packaging.map(pkg => ({
        organization_id: input.organization_id,
        batch_id: input.batch_id,
        batch_type: input.batch_type,
        packaging_type: pkg.packaging_type,
        inventory_item_id: pkg.inventory_item_id,
        item_name: pkg.item_name,
        quantity_used: pkg.quantity_used,
        cost_per_unit: pkg.cost_per_unit,
        total_cost: pkg.total_cost,
        supplier: pkg.supplier,
        lot_number: pkg.lot_number
      }))

      // Insert batch packaging
      const { error } = await this.supabase
        .from('batch_packaging')
        .insert(packaging)

      if (error) throw error

      // Create inventory movements and deduct stock
      for (const pkg of input.packaging) {
        await this.createInventoryMovement({
          organization_id: input.organization_id,
          item_id: pkg.inventory_item_id,
          movement_type: 'OUT',
          quantity_change: -pkg.quantity_used,
          unit: 'units',
          reference_type: 'batch',
          reference_id: input.batch_id,
          batch_type: input.batch_type,
          cost_per_unit: pkg.cost_per_unit,
          total_cost: pkg.total_cost,
          supplier: pkg.supplier,
          created_by: input.created_by
        })

        // Deduct from inventory
        await this.deductFromInventory(pkg.inventory_item_id, pkg.quantity_used)
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error saving batch packaging:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Calculate and save batch costs
   */
  async calculateBatchCosts(
    organization_id: string,
    batch_id: string,
    batch_type: 'gin' | 'vodka' | 'rum' | 'cane_spirit'
  ): Promise<{ success: boolean; total_cost: number; error?: string }> {
    try {
      // Get ethanol cost
      const { data: materials } = await this.supabase
        .from('batch_materials')
        .select('total_cost')
        .eq('batch_id', batch_id)
        .eq('batch_type', batch_type)

      const ethanol_cost = materials?.reduce((sum, m) => sum + (m.total_cost || 0), 0) || 0

      // Get botanical cost
      const { data: botanicals } = await this.supabase
        .from('batch_botanicals')
        .select('total_cost')
        .eq('batch_id', batch_id)
        .eq('batch_type', batch_type)

      const botanical_cost = botanicals?.reduce((sum, b) => sum + (b.total_cost || 0), 0) || 0

      // Get packaging cost
      const { data: packaging } = await this.supabase
        .from('batch_packaging')
        .select('total_cost')
        .eq('batch_id', batch_id)
        .eq('batch_type', batch_type)

      const packaging_cost = packaging?.reduce((sum, p) => sum + (p.total_cost || 0), 0) || 0

      const total_cost = ethanol_cost + botanical_cost + packaging_cost

      // Upsert batch costs
      const { error } = await this.supabase
        .from('batch_costs')
        .upsert({
          organization_id,
          batch_id,
          batch_type,
          ethanol_cost,
          botanical_cost,
          packaging_cost,
          other_materials_cost: 0,
          total_cost,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      return { success: true, total_cost }
    } catch (error: any) {
      console.error('Error calculating batch costs:', error)
      return { success: false, total_cost: 0, error: error.message }
    }
  }

  /**
   * Create inventory movement record
   */
  private async createInventoryMovement(movement: {
    organization_id: string
    item_id: string
    movement_type: 'IN' | 'OUT' | 'ADJUSTMENT'
    quantity_change: number
    unit: string
    reference_type?: string
    reference_id?: string
    batch_type?: string
    cost_per_unit?: number
    total_cost?: number
    supplier?: string
    created_by: string
  }) {
    const { error } = await this.supabase
      .from('inventory_movements')
      .insert(movement)

    if (error) {
      console.error('Error creating inventory movement:', error)
      throw error
    }
  }

  /**
   * Deduct quantity from inventory lots (FIFO)
   */
  private async deductFromInventory(item_id: string, quantity: number) {
    // Get lots for this item, ordered by received_date (FIFO)
    const { data: lots, error: lotsError } = await this.supabase
      .from('lots')
      .select('id, qty')
      .eq('item_id', item_id)
      .gt('qty', 0)
      .order('received_date', { ascending: true })

    if (lotsError) throw lotsError

    let remaining = quantity

    for (const lot of lots || []) {
      if (remaining <= 0) break

      const lotQty = parseFloat(lot.qty as any)
      const deduction = Math.min(remaining, lotQty)
      const newQty = lotQty - deduction

      // Update lot quantity
      const { error: updateError } = await this.supabase
        .from('lots')
        .update({ qty: newQty })
        .eq('id', lot.id)

      if (updateError) throw updateError

      remaining -= deduction
    }

    if (remaining > 0) {
      console.warn(`Insufficient inventory for item ${item_id}. Short by ${remaining}`)
    }
  }
}
