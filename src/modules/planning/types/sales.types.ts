export interface SalesItemSummary {
  category: string
  item_name: string
  item_variation: string | null
  sku: string | null
  items_sold: number | null
  product_sales: number | null
  refunds: number | null
  discounts_and_comps: number | null
  net_sales: number | null
  tax: number | null
  gross_sales: number | null
  units_sold: number | null
}

export type SalesCategoryMap = Record<string, Array<Omit<SalesItemSummary, 'category'>>>
