import { createClient } from '@/lib/supabase/client'
import type { 
  ProductionOrder, 
  ProductionOrderInsert, 
  ProductionOrderUpdate,
  ProductionOrderListItem,
  ProductionOrderDetails,
  BatchCalculation,
  BatchIngredient,
  LotAllocation,
  StockMovement
} from '../types/production.types'
import type { Recipe, RecipeIngredientWithItem, LotWithStock } from '@/modules/recipes/types/recipe.types'
import { StockRepository } from '@/modules/inventory/services/stock.repository'

export class ProductionRepository {
  private supabase = createClient()
  private stockRepo = new StockRepository()

  /**
   * Get all production orders with recipe details
   */
  async fetchProductionOrders(): Promise<ProductionOrderListItem[]> {
    const { data, error } = await this.supabase
      .from('production_orders')
      .select(`
        *,
        recipes (
          id,
          name,
          notes
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch production orders: ${error.message}`)
    }

    return data.map(order => ({
      ...order,
      recipe: order.recipes as Recipe
    }))
  }

  /**
   * Get a single production order with full details
   */
  async fetchProductionOrderDetails(orderId: string): Promise<ProductionOrderDetails | null> {
    const { data, error } = await this.supabase
      .from('production_orders')
      .select(`
        *,
        recipes (
          id,
          name,
          notes,
          recipe_ingredients (
            *,
            items (*)
          )
        )
      `)
      .eq('id', orderId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null
      }
      throw new Error(`Failed to fetch production order: ${error.message}`)
    }

      return {
        ...data,
        recipe: {
          ...data.recipes as Recipe,
          ingredients: (data.recipes as Recipe & { recipe_ingredients: Array<{ items: Item }> }).recipe_ingredients.map((ing) => ({
            ...ing,
            item: ing.items
          }))
        }
      }
  }

  /**
   * Create a new production order
   */
  async createProductionOrder(order: ProductionOrderInsert): Promise<ProductionOrder> {
    // Get organization ID
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

    const orderWithOrg = {
      ...order,
      organization_id: organizationId
    }

    const { data, error } = await this.supabase
      .from('production_orders')
      .insert([orderWithOrg])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create production order: ${error.message}`)
    }

    return data
  }

  /**
   * Update a production order
   */
  async updateProductionOrder(id: string, order: ProductionOrderUpdate): Promise<ProductionOrder> {
    const { data, error } = await this.supabase
      .from('production_orders')
      .update(order)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update production order: ${error.message}`)
    }

    return data
  }

  /**
   * Delete a production order
   */
  async deleteProductionOrder(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('production_orders')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete production order: ${error.message}`)
    }
  }

  /**
   * Calculate batch requirements and check stock availability
   */
  async calculateBatch(recipeId: string, batchTargetL: number): Promise<BatchCalculation> {
    // Get recipe with ingredients
    const { data: recipe, error: recipeError } = await this.supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (
          *,
          items (*)
        )
      `)
      .eq('id', recipeId)
      .single()

    if (recipeError) {
      throw new Error(`Failed to get recipe: ${recipeError.message}`)
    }

    // Assume recipe is per 100L unless specified otherwise
    const recipeBaseL = 100
    const scaleFactor = batchTargetL / recipeBaseL

    const ingredients: BatchIngredient[] = []
    let totalCost = 0
    const warnings: string[] = []

    for (const recipeIngredient of (recipe as Recipe & { recipe_ingredients: RecipeIngredientWithItem[] }).recipe_ingredients) {
      const ingredient = recipeIngredient
      const requiredQuantity = ingredient.qty_per_batch * scaleFactor

      // Get available lots for this item
      const availableLots = await this.getLotsWithStock(ingredient.item_id)
      
      // Calculate total available stock
      const totalAvailable = availableLots.reduce((sum, lot) => sum + lot.current_stock, 0)
      const shortage = Math.max(0, requiredQuantity - totalAvailable)
      const isInternal = shortage === 0

      // Calculate cost if lots have cost data
      const avgCost = availableLots.reduce((sum, lot, _, arr) => {
        return sum + (lot.cost_per_unit || 0) / arr.length
      }, 0)
      totalCost += requiredQuantity * avgCost

      // Auto-select lots (FIFO - oldest first)
      const selectedLots: LotAllocation[] = []
      let remainingNeeded = requiredQuantity

      for (const lot of availableLots.sort((a, b) => 
        new Date(a.received_date || a.created_at!).getTime() - 
        new Date(b.received_date || b.created_at!).getTime()
      )) {
        if (remainingNeeded <= 0) break

        const allocateQty = Math.min(remainingNeeded, lot.current_stock)
        if (allocateQty > 0) {
          selectedLots.push({
            lot_id: lot.id,
            lot_number: lot.lot_number,
            allocated_quantity: allocateQty,
            uom: ingredient.uom
          })
          remainingNeeded -= allocateQty
        }
      }

      // Add warnings
      if (shortage > 0) {
        warnings.push(`Insufficient stock for ${ingredient.item.name}: need ${requiredQuantity}, have ${totalAvailable}`)
      }

      // Check for near-expiry lots
      const expiringSoon = availableLots.filter(lot => {
        if (!lot.expiry_date) return false
        const daysToExpiry = Math.ceil(
          (new Date(lot.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
        return daysToExpiry <= 30 && daysToExpiry > 0
      })

      if (expiringSoon.length > 0) {
        warnings.push(`${ingredient.item.name} has lots expiring within 30 days`)
      }

      ingredients.push({
        ingredient_id: ingredient.id,
        item: ingredient.item,
        required_quantity: requiredQuantity,
        uom: ingredient.uom,
        step: ingredient.step,
        available_lots: availableLots.map(lot => ({
          lot: lot,
          current_stock: lot.current_stock
        })),
        selected_lots: selectedLots,
        shortage,
        is_sufficient: isInternal
      })
    }

    return {
      recipe_id: recipeId,
      batch_target_l: batchTargetL,
      scale_factor: scaleFactor,
      ingredients,
      total_cost: totalCost,
      warnings
    }
  }

  /**
   * Execute a production batch by consuming the allocated stock
   */
  async executeBatch(
    orderId: string, 
    batchCalculation: BatchCalculation,
    notes?: string
  ): Promise<void> {
    // Validate all allocations have sufficient stock
    for (const ingredient of batchCalculation.ingredients) {
      for (const allocation of ingredient.selected_lots) {
        const currentStock = await this.stockRepo.getLotStock(allocation.lot_id)
        if (currentStock < allocation.allocated_quantity) {
          throw new Error(
            `Insufficient stock in lot ${allocation.lot_number} for ${ingredient.item.name}. ` +
            `Required: ${allocation.allocated_quantity}, Available: ${currentStock}`
          )
        }
      }
    }

    // Create consumption transactions
    const movements: StockMovement[] = []
    for (const ingredient of batchCalculation.ingredients) {
      for (const allocation of ingredient.selected_lots) {
        movements.push({
          item_id: ingredient.item.id,
          lot_id: allocation.lot_id,
          quantity: allocation.allocated_quantity,
          uom: allocation.uom,
          txn_type: 'CONSUME',
          reference_id: orderId,
          reference_type: 'production_order',
          notes: notes || `Production consumption for batch ${batchCalculation.batch_target_l}L`
        })
      }
    }

    // Execute all transactions
    for (const movement of movements) {
      await this.stockRepo.createTransaction({
        item_id: movement.item_id,
        lot_id: movement.lot_id,
        txn_type: movement.txn_type,
        quantity: movement.quantity,
        uom: movement.uom,
        reference_id: movement.reference_id,
        reference_type: movement.reference_type,
        notes: movement.notes
      })
    }

    // Update production order status
    await this.updateProductionOrder(orderId, {
      status: 'in_process'
    })
  }

  /**
   * Get production orders by status
   */
  async getOrdersByStatus(status: string): Promise<ProductionOrderListItem[]> {
    const { data, error } = await this.supabase
      .from('production_orders')
      .select(`
        *,
        recipes (
          id,
          name,
          notes
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch production orders by status: ${error.message}`)
    }

    return data.map(order => ({
      ...order,
      recipe: order.recipes as Recipe
    }))
  }

  /**
   * Complete a production order
   */
  async completeOrder(orderId: string, notes?: string): Promise<void> {
    await this.updateProductionOrder(orderId, {
      status: 'complete'
    })

    // Could add logic here to create PRODUCE transactions for the output
    // This would depend on the specific distillery's workflow
  }

  /**
   * Get lots with stock for an item
   */
  async getLotsWithStock(itemId: string): Promise<LotWithStock[]> {
    // Get organization ID for filtering
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

    const { data: lots, error } = await this.supabase
      .from('lots')
      .select('*')
      .eq('item_id', itemId)
      .eq('organization_id', organizationId)

    if (error) {
      throw new Error(`Failed to get lots: ${error.message}`)
    }

    const lotsWithStock: LotWithStock[] = []
    for (const lot of lots) {
      const currentStock = await this.getLotStock(lot.id)
      if (currentStock > 0) {
        lotsWithStock.push({
          ...lot,
          current_stock: currentStock
        })
      }
    }

    return lotsWithStock
  }

  /**
   * Get current stock for a lot
   */
  async getLotStock(lotId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('inventory_txns')
      .select('qty, txn_type')
      .eq('lot_id', lotId)

    if (error) {
      throw new Error(`Failed to get lot stock: ${error.message}`)
    }

    let total = 0
    data.forEach(txn => {
      switch (txn.txn_type) {
        case 'RECEIVE':
        case 'PRODUCE':
        case 'ADJUST':
          total += txn.qty
          break
        case 'CONSUME':
        case 'TRANSFER':
        case 'DESTROY':
          total -= txn.qty
          break
      }
    })

    return total
  }

  /**
   * Create a stock transaction
   */
  async createTransaction(transaction: {
    item_id: string
    lot_id?: string
    txn_type: 'RECEIVE' | 'PRODUCE' | 'CONSUME' | 'TRANSFER' | 'DESTROY' | 'ADJUST'
    quantity: number
    uom: string
    reference_id?: string
    reference_type?: string
    notes?: string
  }): Promise<void> {
    // Get organization ID
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

    const { error } = await this.supabase
      .from('inventory_txns')
      .insert({
        organization_id: organizationId,
        item_id: transaction.item_id,
        lot_id: transaction.lot_id || null,
        txn_type: transaction.txn_type,
        quantity: transaction.quantity,
        uom: transaction.uom,
        reference_id: transaction.reference_id || null,
        reference_type: transaction.reference_type || null,
        note: transaction.notes || null,
        dt: new Date().toISOString()
      })

    if (error) {
      throw new Error(`Failed to create transaction: ${error.message}`)
    }
  }
}



