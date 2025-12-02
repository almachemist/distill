import pricingData from '@/../data/pricing_catalogue_2025.json'
import salesAnalytics from '@/../data/sales_analytics_2025.json'
import type { PricingCatalogueJson, PricingProductRecord } from '../types/pricing.types'
import type { SalesItemSummary } from '../types/sales.types'

export interface PlanningDataset {
  pricing: PricingProductRecord[]
  sales: SalesItemSummary[]
  salesByCategory: Array<{ category: string; totalNetSales: number; totalUnits: number }>
  totalNetSales: number
  totalUnitsSold: number
}

const catalogue = pricingData as unknown as PricingCatalogueJson

interface SalesAnalytics {
  summary: {
    totalNetSales: number
    totalUnits: number
    totalSalesCount: number
  }
  byProduct: Array<{
    item: string
    totalUnits: number
    totalNetSales: number
    totalSalesCount: number
    avgPrice: number
  }>
  byChannel: any[]
  byCustomer: any[]
  byMonth: any[]
  crossAnalysis: any
}

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
  const analytics: any = salesAnalytics

  // Convert sales analytics data to the expected format
  for (const product of analytics.byProduct) {
    items.push({
      category: 'Products', // Default category since analytics doesn't have categories
      item_name: product.item,
      item_variation: null,
      sku: null,
      items_sold: product.totalUnits,
      product_sales: product.totalNetSales,
      refunds: 0,
      discounts_and_comps: 0,
      net_sales: product.totalNetSales,
      tax: 0,
      gross_sales: product.totalNetSales,
      units_sold: product.totalUnits
    })
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
