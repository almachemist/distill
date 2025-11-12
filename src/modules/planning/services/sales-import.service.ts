import { createClient } from '@/lib/supabase/client'
import type { SalesCategoryMap, SalesItemSummary } from '../types/sales.types'

const DEV_ORG_ID = '00000000-0000-0000-0000-000000000001'

type Granularity = 'monthly' | 'annual'

interface ImportOptions {
  periodStart: string
  periodEnd: string
  periodGranularity: Granularity
  importBatch?: string
}

export class SalesImportService {
  private supabase = createClient()

  private async resolveOrganizationId(): Promise<string> {
    if (process.env.NODE_ENV === 'development') {
      return DEV_ORG_ID
    }
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()
    if (!profile?.organization_id) {
      throw new Error('User has no organization')
    }
    return profile.organization_id
  }

  private flattenSales(map: SalesCategoryMap): SalesItemSummary[] {
    const records: SalesItemSummary[] = []
    for (const [category, items] of Object.entries(map)) {
      for (const item of items) {
        records.push({
          category,
          item_name: item.item_name,
          item_variation: item.item_variation ?? null,
          sku: item.sku ?? null,
          items_sold: item.items_sold ?? null,
          product_sales: item.product_sales ?? null,
          refunds: item.refunds ?? null,
          discounts_and_comps: item.discounts_and_comps ?? null,
          net_sales: item.net_sales ?? null,
          tax: item.tax ?? null,
          gross_sales: item.gross_sales ?? null,
          units_sold: item.units_sold ?? null
        })
      }
    }
    return records
  }

  public async importSalesSummary(map: SalesCategoryMap, options: ImportOptions): Promise<{ upserted: number }> {
    const organizationId = await this.resolveOrganizationId()
    const records = this.flattenSales(map)

    if (records.length === 0) {
      return { upserted: 0 }
    }

    const { periodStart, periodEnd, periodGranularity, importBatch } = options

    const payload = records.map(record => ({
      organization_id: organizationId,
      category: record.category,
      item_name: record.item_name,
      item_variation: record.item_variation ?? '',
      sku: record.sku ?? '',
      period_start: periodStart,
      period_end: periodEnd,
      period_granularity: periodGranularity,
      items_sold: record.items_sold,
      units_sold: record.units_sold,
      product_sales: record.product_sales,
      refunds: record.refunds,
      discounts_and_comps: record.discounts_and_comps,
      net_sales: record.net_sales,
      tax: record.tax,
      gross_sales: record.gross_sales,
      import_batch: importBatch ?? null,
      raw_payload: record
    }))

    const { error } = await this.supabase
      .from('sales_items')
      .upsert(payload, {
        ignoreDuplicates: false,
        onConflict: 'organization_id,period_start,period_end,category,item_name,item_variation,sku'
      })

    if (error) {
      throw new Error(`Failed to upsert sales items: ${error.message}`)
    }

    return { upserted: records.length }
  }
}
