import { createClient } from '@/lib/supabase/client'
import type {
  Item,
  LotWithStock,
  InventoryTxnInsert,
  TxnType,
  StockCheckResult,
  ConsumeRequest,
  InventoryTxn
} from '../types/recipe.types'

export class StockRepository {
  private supabase = createClient()

  /**
   * Get current stock level for an item by summing all transactions
   */
  async getOnHand(itemId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('inventory_txns')
      .select('quantity, txn_type')
      .eq('item_id', itemId)

    if (error) {
      throw new Error(`Failed to get stock level: ${error.message}`)
    }

    let total = 0
    data.forEach(txn => {
      switch (txn.txn_type) {
        case 'RECEIVE':
        case 'PRODUCE':
          total += txn.quantity
          break
        case 'CONSUME':
        case 'TRANSFER':
        case 'DESTROY':
        case 'ADJUST':
          total -= txn.quantity
          break
      }
    })

    return total
  }

  /**
   * Get stock level for a specific lot
   */
  async getLotStock(lotId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('inventory_txns')
      .select('quantity, txn_type')
      .eq('lot_id', lotId)

    if (error) {
      throw new Error(`Failed to get lot stock: ${error.message}`)
    }

    let total = 0
    data.forEach(txn => {
      switch (txn.txn_type) {
        case 'RECEIVE':
        case 'PRODUCE':
          total += txn.quantity
          break
        case 'CONSUME':
        case 'TRANSFER':
        case 'DESTROY':
        case 'ADJUST':
          total -= txn.quantity
          break
      }
    })

    return total
  }

  /**
   * Get all lots for an item with current stock levels
   */
  async getLotsWithStock(itemId: string): Promise<LotWithStock[]> {
    const { data: lots, error } = await this.supabase
      .from('lots')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get lots: ${error.message}`)
    }

    // Get stock for each lot
    const lotsWithStock: LotWithStock[] = []
    for (const lot of lots) {
      const stock = await this.getLotStock(lot.id)
      if (stock > 0) { // Only include lots with positive stock
        lotsWithStock.push({
          ...lot,
          current_stock: stock
        })
      }
    }

    return lotsWithStock
  }

  /**
   * Check if sufficient stock is available for required items
   */
  async checkStockAvailability(requirements: { itemId: string; quantity: number }[]): Promise<StockCheckResult[]> {
    const results: StockCheckResult[] = []

    for (const req of requirements) {
      const available = await this.getOnHand(req.itemId)
      const shortage = Math.max(0, req.quantity - available)
      
      // Get item details
      const { data: item, error } = await this.supabase
        .from('items')
        .select('*')
        .eq('id', req.itemId)
        .single<Item>()

      if (error) {
        throw new Error(`Failed to get item details: ${error.message}`)
      }

      results.push({
        item_id: req.itemId,
        item,
        required_quantity: req.quantity,
        available_quantity: available,
        is_sufficient: shortage === 0,
        shortage
      })
    }

    return results
  }

  /**
   * Post consumption transactions for a production order
   * All transactions are posted atomically - if any fail, all are rolled back
   */
  async postConsumeTxns(request: ConsumeRequest): Promise<void> {
    // First validate all lots have sufficient stock
    for (const txn of request.transactions) {
      const lotStock = await this.getLotStock(txn.lot_id)
      if (lotStock < txn.quantity) {
        throw new Error(
          `Insufficient stock in lot ${txn.lot_id}. Required: ${txn.quantity}, Available: ${lotStock}`
        )
      }
    }

    // Prepare all transactions
    const transactions: InventoryTxnInsert[] = request.transactions.map(txn => ({
      item_id: txn.item_id,
      lot_id: txn.lot_id,
      txn_type: 'CONSUME' as TxnType,
      quantity: txn.quantity,
      uom: txn.uom,
      reference_id: request.production_order_id,
      reference_type: 'production_order',
      notes: `Production consumption for order ${request.production_order_id}`
    }))

    // Post all transactions atomically
    const { error } = await this.supabase
      .from('inventory_txns')
      .insert<InventoryTxnInsert[]>(transactions)

    if (error) {
      throw new Error(`Failed to post consumption transactions: ${error.message}`)
    }
  }

  /**
   * Get all items with their current stock levels
   */
  async getItemsWithStock(): Promise<Array<Item & { current_stock: number }>> {
    const { data: items, error } = await this.supabase
      .from('items')
      .select('*')
      .order('name')

    if (error) {
      throw new Error(`Failed to get items: ${error.message}`)
    }

    const itemsWithStock = []
    for (const item of items) {
      const stock = await this.getOnHand(item.id)
      itemsWithStock.push({
        ...item,
        current_stock: stock
      })
    }

    return itemsWithStock
  }

  /**
   * Create a new inventory transaction
   */
  async createTransaction(transaction: InventoryTxnInsert): Promise<void> {
    // If this is a consumption, verify stock availability
    if (transaction.txn_type === 'CONSUME' && transaction.lot_id) {
      const lotStock = await this.getLotStock(transaction.lot_id)
      if (lotStock < transaction.quantity) {
        throw new Error(
          `Insufficient stock in lot ${transaction.lot_id}. Required: ${transaction.quantity}, Available: ${lotStock}`
        )
      }
    }

    const { error } = await this.supabase
      .from('inventory_txns')
      .insert([transaction])

    if (error) {
      throw new Error(`Failed to create transaction: ${error.message}`)
    }
  }

  /**
   * Get transaction history for an item
   */
  async getTransactionHistory(itemId: string, limit = 50): Promise<InventoryTxnInsert[]> {
    const { data, error } = await this.supabase
      .from('inventory_txns')
      .select(`
        *,
        lots (
          lot_number
        )
      `)
      .eq('item_id', itemId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to get transaction history: ${error.message}`)
    }

    return data
  }
}



