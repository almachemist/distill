export interface Batch {
  product: string
  batch_number: number
  total_batches: number
  bottles_700ml: number
  bottles_200ml: number
  total_bottles: number
  production_type: string
  scheduled_month: number
  scheduled_month_name: string
}

export interface MaterialNeed {
  name: string
  category: string
  needed: number
  current_stock: number
  shortage: number
  stock_after: number
  status: 'CRITICAL' | 'LOW' | 'ADEQUATE' | 'GOOD'
  uom: string
}

export interface BatchWithMaterials extends Batch {
  materials: MaterialNeed[]
  botanicals: MaterialNeed[]
  packaging: MaterialNeed[]
}

export interface PurchaseItem {
  name: string
  category: string
  uom: string
  shortage: number
}
