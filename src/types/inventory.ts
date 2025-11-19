export type InventoryCategory =
  | 'Spirits'
  | 'Packaging'
  | 'Labels'
  | 'Botanicals'
  | 'RawMaterials'

export type InventoryUnit = 'bottle' | 'carton' | 'pack' | 'g' | 'kg' | 'L' | 'ml' | 'unit'

export type InventoryItem = {
  id: string
  sku: string
  name: string
  category: InventoryCategory
  unit: InventoryUnit
  currentStock: number
  minStock?: number
  type?: string
  supplierId?: string
  // Optional denormalized supplier fields for last purchase/invoice tracking
  supplierContact?: string
  lastInvoiceNumber?: string
  lastInvoiceDate?: string
  lastPurchaseCost?: number
  attachmentUrl?: string
  lotNumber?: string
  expiryDate?: string
  notes?: string
}

export type Supplier = {
  id: string
  name: string
  contactName?: string
  email?: string
  phone?: string
  notes?: string
}

