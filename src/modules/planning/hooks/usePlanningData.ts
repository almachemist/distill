import pricingData from '@/../data/pricing_catalogue_2025.json'
import salesData from '@/../data/sales_summary_2025.json'
import type { PricingCatalogueJson, PricingProductRecord } from '../types/pricing.types'
import type { SalesCategoryMap, SalesItemSummary } from '../types/sales.types'

export interface PlanningDataset {
  pricing: PricingProductRecord[]
  sales: SalesItemSummary[]
  salesByCategory: Array<{ category: string; totalNetSales: number; totalUnits: number }>
  totalNetSales: number
  totalUnitsSold: number
}

const catalogue = pricingData as PricingCatalogueJson
const salesMap = salesData as SalesCategoryMap

const flattenPricing = (): PricingProductRecord[] => {
  const records: PricingProductRecord[] = []
  for (const [category, products] of Object.entries(catalogue)) {
    for (const [productName, product] of Object.entries(products)) {
      records.push({
        category,
        product_name: productName,
        sku: (product as any).sku ?? null,
        variation: (product as any).variation ?? null,
        volume_ml: typeof product.volume_ml === 'number' ? product.volume_ml : null,
        abv: typeof product.abv === 'number' ? product.abv : null,
        wholesale_ex_gst: typeof product.wholesale_ex_gst === 'number' ? product.wholesale_ex_gst : null,
        rrp: typeof product.rrp === 'number' ? product.rrp : null,
        moq: typeof product.moq === 'string' ? product.moq : null,
        metadata: product.metadata ?? {}
      })
    }
  }
  return records
}

const flattenSales = (): SalesItemSummary[] => {
  const items: SalesItemSummary[] = []
  for (const [category, entries] of Object.entries(salesMap)) {
    for (const entry of entries) {
      items.push({
        category,
        item_name: entry.item_name,
        item_variation: entry.item_variation ?? null,
        sku: entry.sku ?? null,
        items_sold: entry.items_sold ?? null,
        product_sales: entry.product_sales ?? null,
        refunds: entry.refunds ?? null,
        discounts_and_comps: entry.discounts_and_comps ?? null,
        net_sales: entry.net_sales ?? null,
        tax: entry.tax ?? null,
        gross_sales: entry.gross_sales ?? null,
        units_sold: entry.units_sold ?? null
      })
    }
  }
  return items
}

export const usePlanningData = (): PlanningDataset => {
  const pricing = flattenPricing()
  const sales = flattenSales()

  const salesByCategoryMap = new Map<string, { totalNetSales: number; totalUnits: number }>()
  let totalNetSales = 0
  let totalUnitsSold = 0

  for (const sale of sales) {
    const net = sale.net_sales ?? 0
    const units = sale.units_sold ?? sale.items_sold ?? 0

    totalNetSales += net
    totalUnitsSold += units

    const current = salesByCategoryMap.get(sale.category) ?? { totalNetSales: 0, totalUnits: 0 }
    current.totalNetSales += net
    current.totalUnits += units
    salesByCategoryMap.set(sale.category, current)
  }

  const salesByCategory = Array.from(salesByCategoryMap.entries()).map(([category, aggregates]) => ({
    category,
    totalNetSales: aggregates.totalNetSales,
    totalUnits: aggregates.totalUnits
  }))

  return {
    pricing,
    sales,
    salesByCategory,
    totalNetSales,
    totalUnitsSold
  }
}
