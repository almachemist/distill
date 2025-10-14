// packaging.types.ts
export interface PackagingItem {
  id: string
  name: string
  unitCostAUD: number
  quantityPerCase?: number
  supplier?: string
  notes?: string
  category?: 'bottle' | 'closure' | 'label' | 'box' | 'insert' | 'seal'
}

export interface PackagingCostBreakdown {
  bottleCost: number
  closureCost: number
  labelCost: number
  boxCost: number
  insertCost: number
  sealCost: number
  totalCost: number
}

export interface BottlePackaging {
  bottleId: string
  closureId: string
  labelIds: string[]
  boxId?: string
  insertIds?: string[]
  sealIds?: string[]
}



