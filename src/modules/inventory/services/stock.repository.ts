import { createClient } from '@/lib/supabase/client'
import type { TxnType } from '@/modules/recipes/types/recipe.types'

export interface StockLevel {
  item_id: string
  item_name: string
  category: string
  uom: string
  is_alcohol: boolean
  total_on_hand: number
}

export interface LotStock {
  lot_id: string
  lot_code: string
  item_id: string
  received_date: string | null
  on_hand: number
  note?: string
}

export interface InventoryTxn {
  id?: string
  dt?: string
  txn_type: TxnType
  item_id: string
  lot_id?: string
  qty: number
  uom: string
  note?: string
}

export class StockRepository {
  private supabase = createClient()

  /**
   * Get total on-hand quantity for an item across all lots
   * SUM of inventory_txns by sign (RECEIVE+PRODUCE+ADJUST - CONSUME-TRANSFER-DESTROY)
   */
  async onHand(itemId: string): Promise<number> {
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

    const { data, error } = await this.supabase
      .from('inventory_txns')
      .select('quantity, txn_type')
      .eq('item_id', itemId)
      .eq('organization_id', organizationId)

    if (error) {
      throw new Error(`Failed to get on-hand quantity: ${error.message}`)
    }

    const total = (data ?? []).reduce((acc: number, txn: any) => {
      switch (txn.txn_type) {
        case 'RECEIVE':
        case 'PRODUCE':
          return acc + Number(txn.quantity ?? 0)
        case 'CONSUME':
        case 'TRANSFER':
        case 'DESTROY':
        case 'ADJUST':
          return acc - Number(txn.quantity ?? 0)
        default:
          return acc
      }
    }, 0)

    return total
  }

  /**
   * Get on-hand quantity for a specific lot
   */
  async onHandByLot(itemId: string, lotId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('inventory_txns')
      .select('quantity, txn_type')
      .eq('item_id', itemId)
      .eq('lot_id', lotId)

    if (error) {
      throw new Error(`Failed to get lot on-hand quantity: ${error.message}`)
    }

    const total = (data ?? []).reduce((acc: number, txn: any) => {
      switch (txn.txn_type) {
        case 'RECEIVE':
        case 'PRODUCE':
          return acc + Number(txn.quantity ?? 0)
        case 'CONSUME':
        case 'TRANSFER':
        case 'DESTROY':
        case 'ADJUST':
          return acc - Number(txn.quantity ?? 0)
        default:
          return acc
      }
    }, 0)

    return total
  }

  /**
   * Post batch transactions with client-side negative stock prevention
   */
  async postBatchTxns(transactions: InventoryTxn[]): Promise<void> {
    // First, validate all transactions to prevent negative stock
    const stockChecks = new Map<string, number>() // itemId -> current stock
    const lotChecks = new Map<string, number>() // lotId -> current stock

    // Get current stock levels for all affected items/lots
    for (const txn of transactions) {
      // Check item-level stock
      if (!stockChecks.has(txn.item_id)) {
        const currentStock = await this.onHand(txn.item_id)
        stockChecks.set(txn.item_id, currentStock)
      }

      // Check lot-level stock if lot is specified
      if (txn.lot_id && !lotChecks.has(txn.lot_id)) {
        const currentLotStock = await this.onHandByLot(txn.item_id, txn.lot_id)
        lotChecks.set(txn.lot_id, currentLotStock)
      }
    }

    // Validate each transaction
    for (const txn of transactions) {
      const isNegativeOperation = ['CONSUME', 'TRANSFER', 'DESTROY'].includes(txn.txn_type)
      
      if (isNegativeOperation) {
        // Check item-level stock
        const currentItemStock = stockChecks.get(txn.item_id)!
        if (currentItemStock < txn.qty) {
          throw new Error(
            `Insufficient stock for item ${txn.item_id}. Required: ${txn.qty}, Available: ${currentItemStock}`
          )
        }

        // Check lot-level stock if specified
        if (txn.lot_id) {
          const currentLotStock = lotChecks.get(txn.lot_id)!
          if (currentLotStock < txn.qty) {
            throw new Error(
              `Insufficient stock in lot ${txn.lot_id}. Required: ${txn.qty}, Available: ${currentLotStock}`
            )
          }
          // Update running lot total
          lotChecks.set(txn.lot_id, currentLotStock - txn.qty)
        }

        // Update running item total
        stockChecks.set(txn.item_id, currentItemStock - txn.qty)
      }
    }

    // All validations passed, now insert the transactions
    const dbTransactions = transactions.map(txn => ({
      dt: txn.dt || new Date().toISOString(),
      txn_type: txn.txn_type,
      item_id: txn.item_id,
      lot_id: txn.lot_id || null,
      quantity: txn.qty,
      uom: txn.uom,
      note: txn.note || null
    }))

    const { error } = await this.supabase
      .from('inventory_txns')
      .insert(dbTransactions)

    if (error) {
      throw new Error(`Failed to post batch transactions: ${error.message}`)
    }
  }

  /**
   * Get all items with their on-hand quantities
   */
  async getStockLevels(): Promise<StockLevel[]> {
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

    const { data: items, error } = await this.supabase
      .from('items')
      .select('id, name, category, default_uom, is_alcohol')
      .eq('organization_id', organizationId)
      .order('name')

    if (error) {
      throw new Error(`Failed to get items: ${error.message}`)
    }

    const stockLevels: StockLevel[] = []
    for (const item of items) {
      const onHand = await this.onHand(item.id)
      stockLevels.push({
        item_id: item.id,
        item_name: item.name,
        category: item.category || 'other',
        uom: item.default_uom,
        is_alcohol: item.is_alcohol || false,
        total_on_hand: onHand
      })
    }

    return stockLevels
  }

  /**
   * Get lots for an item with their on-hand quantities
   */
  async getLotsForItem(itemId: string): Promise<LotStock[]> {
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
      .select('id, code, item_id, received_date, note')
      .eq('item_id', itemId)
      .eq('organization_id', organizationId)
      .order('received_date', { ascending: false })

    if (error) {
      throw new Error(`Failed to get lots: ${error.message}`)
    }

    const lotStocks: LotStock[] = []
    for (const lot of lots) {
      const onHand = await this.onHandByLot(itemId, lot.id)
      if (onHand > 0) { // Only return lots with positive stock
        lotStocks.push({
          lot_id: lot.id,
          lot_code: lot.code,
          item_id: lot.item_id,
          received_date: lot.received_date,
          on_hand: onHand,
          note: lot.note
        })
      }
    }

    return lotStocks
  }

  /**
   * Get recent transactions for an item or lot
   */
  async getRecentTransactions(itemId: string, lotId?: string, limit = 20): Promise<any[]> {
    let query = this.supabase
      .from('inventory_txns')
      .select('*')
      .eq('item_id', itemId)

    if (lotId) {
      query = query.eq('lot_id', lotId)
    }

    const { data, error } = await query
      .order('dt', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to get transactions: ${error.message}`)
    }

    return data
  }

  /**
   * Create a new lot for receiving goods
   */
  async createLot(itemId: string, code: string, qty: number, uom: string, note?: string): Promise<string> {
    // Get user's organization
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('organization_id')
      .single()

    if (!profile?.organization_id) {
      throw new Error('User organization not found')
    }

    // Create the lot
    const { data: lot, error: lotError } = await this.supabase
      .from('lots')
      .insert({
        organization_id: profile.organization_id,
        item_id: itemId,
        code: code,
        qty: qty,
        received_date: new Date().toISOString(),
        note: note
      })
      .select('id')
      .single()

    if (lotError) {
      throw new Error(`Failed to create lot: ${lotError.message}`)
    }

    // Create RECEIVE transaction
    await this.postBatchTxns([{
      txn_type: 'RECEIVE',
      item_id: itemId,
      lot_id: lot.id,
      qty: qty,
      uom: uom,
      note: note || 'Initial lot receipt'
    }])

    return lot.id
  }

  /**
   * Create a single stock transaction
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
