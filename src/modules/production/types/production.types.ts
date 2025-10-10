import { Database } from '@/types/supabase'
import { Recipe, RecipeIngredient, Item } from '@/modules/recipes/types/recipe.types'

// Re-export core types
export type ProductionOrder = Database['public']['Tables']['production_orders']['Row']
export type ProductionOrderInsert = Database['public']['Tables']['production_orders']['Insert']
export type ProductionOrderUpdate = Database['public']['Tables']['production_orders']['Update']

export type InventoryTxn = Database['public']['Tables']['inventory_txns']['Row']
export type InventoryTxnInsert = Database['public']['Tables']['inventory_txns']['Insert']

export type Lot = Database['public']['Tables']['lots']['Row']

// Production-specific types
export type ProductionOrderStatus = 'planned' | 'released' | 'in_process' | 'complete'

export interface ProductionOrderListItem extends ProductionOrder {
  recipe: Recipe
}

export interface ProductionOrderDetails extends ProductionOrder {
  recipe: Recipe & {
    ingredients: (RecipeIngredient & {
      item: Item
    })[]
  }
}

// Batch calculation types
export interface BatchCalculation {
  recipe_id: string
  batch_target_l: number
  scale_factor: number
  ingredients: BatchIngredient[]
  total_cost: number
  warnings: string[]
}

export interface BatchIngredient {
  ingredient_id: string
  item: Item
  required_quantity: number
  uom: string
  step: string
  available_lots: LotStock[]
  selected_lots: LotAllocation[]
  shortage: number
  is_sufficient: boolean
}

export interface LotStock {
  lot: Lot
  current_stock: number
}

export interface LotAllocation {
  lot_id: string
  lot_number: string
  allocated_quantity: number
  uom: string
}

// Stock management types
export interface StockLevel {
  item_id: string
  item: Item
  total_stock: number
  available_lots: LotStock[]
}

export interface StockMovement {
  item_id: string
  lot_id: string | null
  quantity: number
  uom: string
  txn_type: 'RECEIVE' | 'PRODUCE' | 'CONSUME' | 'TRANSFER' | 'DESTROY' | 'ADJUST'
  reference_id?: string
  reference_type?: string
  notes?: string
}

// Production flow types
export interface ProductionStep {
  id: string
  name: string
  step_type: 'maceration' | 'distillation' | 'proofing' | 'bottling'
  ingredients: BatchIngredient[]
  status: 'pending' | 'in_progress' | 'complete'
  started_at?: string
  completed_at?: string
  notes?: string
}

export interface ProductionRun {
  production_order: ProductionOrder
  recipe: Recipe
  steps: ProductionStep[]
  current_step: number
  total_consumed: StockMovement[]
  status: ProductionOrderStatus
}

// Validation types
export interface ValidationResult {
  is_valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  type: 'insufficient_stock' | 'missing_lot' | 'invalid_quantity'
  item_id: string
  item_name: string
  message: string
  required_quantity?: number
  available_quantity?: number
}

export interface ValidationWarning {
  type: 'expiry_soon' | 'high_cost' | 'lot_mismatch'
  item_id: string
  item_name: string
  message: string
  lot_id?: string
}



