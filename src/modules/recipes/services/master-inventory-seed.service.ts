import { createClient } from '@/lib/supabase/client'
import type { ItemCsvRow } from '../types/recipe.types'

type SupabaseProfileRow = {
  organization_id: string | null
}

type SupabaseItemRow = {
  id: string
  name: string
  category: string | null
  default_uom: string | null
  is_alcohol: boolean | null
}

type CategorizedItems = Record<string, SupabaseItemRow[]>

export class MasterInventorySeedService {
  private supabase = createClient()

  async seedMasterInventory(): Promise<{ created: number; updated: number }> {
    // Master inventory list for distillery
    const masterInventoryList: ItemCsvRow[] = [
      { name: 'Neutral Grain Spirit', category: 'neutral_spirit', uom: 'L', is_alcohol: true },
      { name: 'Ethanol (food grade)', category: 'neutral_spirit', uom: 'L', is_alcohol: true },
      { name: 'Water', category: 'other', uom: 'L', is_alcohol: false },
      { name: '700ml Bottle (clear)', category: 'packaging_bottle', uom: 'each', is_alcohol: false },
      { name: '200ml Bottle', category: 'packaging_bottle', uom: 'each', is_alcohol: false },
      { name: 'Bottle Cork', category: 'packaging_closure', uom: 'each', is_alcohol: false },
      { name: 'Plastic Lid (tamper)', category: 'packaging_closure', uom: 'each', is_alcohol: false },
      { name: 'Cap (screw top)', category: 'packaging_closure', uom: 'each', is_alcohol: false },
      { name: 'Label (front)', category: 'packaging_label', uom: 'each', is_alcohol: false },
      { name: 'Label (back)', category: 'packaging_label', uom: 'each', is_alcohol: false },
      { name: 'Gift Box (1 bottle)', category: 'packaging_box', uom: 'each', is_alcohol: false },
      { name: 'Carton (6 bottles)', category: 'packaging_carton', uom: 'each', is_alcohol: false },
      { name: 'Shrink Wrap', category: 'packaging_other', uom: 'each', is_alcohol: false }
    ]

    try {
      // Get current user's organization
      let organizationId: string

      if (process.env.NODE_ENV === 'development') {
        organizationId = '00000000-0000-0000-0000-000000000001'
      } else {
        const { data: profile, error: profileError } = await this.supabase
          .from('profiles')
          .select('organization_id')
          .single< SupabaseProfileRow >()

        if (profileError) {
          throw profileError
        }

        if (!profile?.organization_id) {
          throw new Error('User organization not found')
        }
        organizationId = profile.organization_id
      }

      let created = 0
      let updated = 0

      for (const item of masterInventoryList) {
        try {
          // Try to find existing item by name
          const { data: existingItem } = await this.supabase
            .from('items')
            .select('id')
            .eq('organization_id', organizationId)
            .eq('name', item.name)
            .single()

          if (existingItem) {
            // Update existing item
            const { error } = await this.supabase
              .from('items')
              .update({
                category: item.category,
                default_uom: item.uom,
                is_alcohol: item.is_alcohol
              })
              .eq('id', existingItem.id)

            if (error) {
              console.warn(`Failed to update item ${item.name}:`, error.message)
            } else {
              updated++
            }
          } else {
            // Create new item
            const { error } = await this.supabase
              .from('items')
              .insert([{
                organization_id: organizationId,
                name: item.name,
                category: item.category,
                default_uom: item.uom,
                is_alcohol: item.is_alcohol
              }])

            if (error) {
              console.warn(`Failed to create item ${item.name}:`, error.message)
            } else {
              created++
            }
          }
        } catch (error) {
          console.warn(`Error processing item ${item.name}:`, error)
        }
      }

      return { created, updated }

    } catch (error) {
      console.error('Failed to seed master inventory:', error)
      throw error
    }
  }

  // Get items by category for easier organization
  async getItemsByCategory(): Promise<CategorizedItems> {
    const { data: items, error } = await this.supabase
      .from('items')
      .select('*')
      .order('category, name')

    if (error) {
      throw new Error(`Failed to fetch items: ${error.message}`)
    }

    // Group items by category
    const typedItems = (items ?? []) as SupabaseItemRow[]
    const categorizedItems = typedItems.reduce<CategorizedItems>((acc, item) => {
      const category = item.category ?? 'uncategorized'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    }, {} as CategorizedItems)

    return categorizedItems
  }

  // Get packaging items for production flows
  async getPackagingItems(): Promise<SupabaseItemRow[]> {
    const { data: items, error } = await this.supabase
      .from('items')
      .select('*')
      .like('category', 'packaging_%')
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch packaging items: ${error.message}`)
    }

    return (items ?? []) as SupabaseItemRow[]
  }

  // Get alcohol items for distillation flows
  async getAlcoholItems(): Promise<SupabaseItemRow[]> {
    const { data: items, error } = await this.supabase
      .from('items')
      .select('*')
      .eq('is_alcohol', true)
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch alcohol items: ${error.message}`)
    }

    return (items ?? []) as SupabaseItemRow[]
  }
}
