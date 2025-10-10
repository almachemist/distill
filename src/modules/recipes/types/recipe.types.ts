import { Database } from '@/types/supabase'

// Re-export core types from Supabase
export type Recipe = Database['public']['Tables']['recipes']['Row']
export type RecipeInsert = Database['public']['Tables']['recipes']['Insert']
export type RecipeUpdate = Database['public']['Tables']['recipes']['Update']

export type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']
export type RecipeIngredientInsert = Database['public']['Tables']['recipe_ingredients']['Insert']
export type RecipeIngredientUpdate = Database['public']['Tables']['recipe_ingredients']['Update']

export type Item = Database['public']['Tables']['items']['Row']
export type ItemInsert = Database['public']['Tables']['items']['Insert']
export type ItemUpdate = Database['public']['Tables']['items']['Update']

export type Lot = Database['public']['Tables']['lots']['Row']
export type LotInsert = Database['public']['Tables']['lots']['Insert']

export type InventoryTxn = Database['public']['Tables']['inventory_txns']['Row']
export type InventoryTxnInsert = Database['public']['Tables']['inventory_txns']['Insert']

// Extended types with relationships
export interface RecipeWithIngredients extends Recipe {
  ingredients: RecipeIngredientWithItem[]
}

export interface RecipeIngredientWithItem extends RecipeIngredient {
  item: Item
}

export interface ItemWithStock extends Item {
  current_stock: number
  available_lots: LotWithStock[]
}

export interface LotWithStock extends Lot {
  current_stock: number
}

// Transaction types
export type TxnType = 'RECEIVE' | 'PRODUCE' | 'CONSUME' | 'TRANSFER' | 'DESTROY' | 'ADJUST'

export interface StockTransaction {
  id?: string
  dt?: string
  txn_type: TxnType
  item_id: string
  lot_id?: string
  quantity: number
  uom: string
  note?: string
  reference_id?: string
  reference_type?: string
}

// CSV import types
export interface ItemCsvRow {
  name: string
  category: string
  uom: string
  is_alcohol: boolean
}

export interface RecipeCsvRow {
  recipe_name: string
  item_name: string
  qty_per_batch: number
  uom: string
  step: string
}

// Recipe scaling types
export interface RecipeScale {
  recipe_id: string
  target_volume: number
  scale_factor: number
  scaled_ingredients: ScaledIngredient[]
}

export interface ScaledIngredient {
  ingredient_id: string
  item: Item
  original_quantity: number
  scaled_quantity: number
  uom: string
  step: string
}

// Stock level types
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

// Validation types
export interface RecipeValidation {
  is_valid: boolean
  errors: string[]
  warnings: string[]
}

export interface StockValidation {
  item_id: string
  item_name: string
  required_quantity: number
  available_quantity: number
  is_sufficient: boolean
  shortage: number
}

// Search and filter types
export interface RecipeFilter {
  name?: string
  category?: string
  has_ingredients?: boolean
}

export interface ItemFilter {
  name?: string
  category?: string
  is_alcohol?: boolean
  has_stock?: boolean
}

// Batch production types
export interface BatchIngredient {
  ingredient_id: string
  item: Item
  required_quantity: number
  uom: string
  step: string
  available_lots: LotWithStock[]
  selected_lots: LotAllocation[]
  shortage: number
  is_sufficient: boolean
}

export interface LotAllocation {
  lot_id: string
  lot_number: string
  allocated_quantity: number
  uom: string
}

export interface BatchCalculation {
  recipe_id: string
  batch_target_l: number
  scale_factor: number
  ingredients: BatchIngredient[]
  total_cost: number
  warnings: string[]
}




