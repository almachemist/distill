export interface PricingProductMetadata {
  updated?: string
  discontinued?: boolean
  notes?: string
  [key: string]: unknown
}

export interface PricingProductRecord {
  category: string
  product_name: string
  sku: string | null
  variation: string | null
  volume_ml: number | null
  abv: number | null
  wholesale_ex_gst: number | null
  rrp: number | null
  moq: string | null
  metadata: PricingProductMetadata
}

export interface PricingCatalogueJson {
  [category: string]: {
    [productName: string]: {
      wholesale_ex_gst?: number | null
      rrp?: number | null
      volume_ml?: number | null
      abv?: number | null
      moq?: string | null
      content?: unknown
      metadata?: PricingProductMetadata
    } & Record<string, unknown>
  }
}
