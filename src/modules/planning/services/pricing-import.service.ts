import { createClient } from '@/lib/supabase/client'
import { getOrganizationId } from '@/lib/auth/get-org-id'
import type { PricingCatalogueJson, PricingProductRecord } from '../types/pricing.types'

export class PricingImportService {
  private supabase = createClient()

  private async resolveOrganizationId(): Promise<string> {
    return getOrganizationId()
  }

  private flattenCatalogue(catalogue: PricingCatalogueJson): PricingProductRecord[] {
    const records: PricingProductRecord[] = []
    for (const [category, products] of Object.entries(catalogue)) {
      for (const [productName, data] of Object.entries(products)) {
        records.push({
          category,
          product_name: productName,
          sku: (data as any).sku ?? null,
          variation: (data as any).variation ?? null,
          volume_ml: typeof data.volume_ml === 'number' ? data.volume_ml : null,
          abv: typeof data.abv === 'number' ? data.abv : null,
          wholesale_ex_gst: typeof data.wholesale_ex_gst === 'number' ? data.wholesale_ex_gst : null,
          rrp: typeof data.rrp === 'number' ? data.rrp : null,
          moq: typeof data.moq === 'string' ? data.moq : null,
          metadata: data.metadata ?? {}
        })
      }
    }
    return records
  }

  public async importCatalogue(catalogue: PricingCatalogueJson): Promise<{ upserted: number }> {
    const organizationId = await this.resolveOrganizationId()
    const records = this.flattenCatalogue(catalogue)

    if (records.length === 0) {
      return { upserted: 0 }
    }

    const payload = records.map(record => ({
      organization_id: organizationId,
      category: record.category,
      product_name: record.product_name,
      sku: record.sku,
      variation: record.variation,
      volume_ml: record.volume_ml,
      abv: record.abv,
      wholesale_ex_gst: record.wholesale_ex_gst,
      rrp: record.rrp,
      moq: record.moq,
      metadata: record.metadata
    }))

    const { error } = await this.supabase
      .from('product_pricing')
      .upsert(payload, {
        onConflict: 'organization_id,product_name,variation,sku'
      })
    if (error) {
      throw new Error(`Failed to upsert product pricing: ${error.message}`)
    }

    return { upserted: records.length }
  }
}
