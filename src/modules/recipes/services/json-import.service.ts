import { createClient } from '@/lib/supabase/client'

interface JsonBotanical {
  name: string
  weight_g: number
}

interface JsonRecipe {
  name: string
  botanicals: JsonBotanical[]
  total_cost?: number | null
  last_batch_volume: {
    alcohol_l: number
    abv_percent: number
    water_l: number
    total_l?: number
  }
}

interface JsonPayload {
  recipes: JsonRecipe[]
}

export class JsonRecipeImportService {
  private supabase = createClient()

  private normalizeName(name: string): string {
    const map: Record<string, string> = {
      // common standardizations
      'Coriander': 'Coriander Seed',
      'Liquorice': 'Liquorice Root',
      'Orange': 'Orange peel',
      'Lemon': 'Lemon peel',
      'Kaffir Fruit Rind': 'Kaffir Lime Rind',
      'Kaffir Leaves': 'Kaffir Lime Leaf',
      // keep spelling consistent with existing seeds
      'Cardamom': 'Cardamon',
    }
    const trimmed = name.trim()
    return map[trimmed] || trimmed
  }

  private async resolveOrganizationId(): Promise<string> {
    if (process.env.NODE_ENV === 'development') {
      return '00000000-0000-0000-0000-000000000001'
    }
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()
    if (!profile?.organization_id) throw new Error('User has no organization')
    return profile.organization_id
  }

  private async ensureItem(name: string, orgId: string, opts?: { uom?: string, isAlcohol?: boolean, abvPct?: number | null, category?: string }) {
    const uom = opts?.uom ?? 'g'
    const isAlcohol = opts?.isAlcohol ?? false
    const abvPct = opts?.abvPct ?? null
    const category = opts?.category ?? (isAlcohol ? 'spirit' : 'botanical')

    const { data: existing } = await this.supabase
      .from('items')
      .select('id')
      .eq('name', name)
      .eq('organization_id', orgId)
      .single()

    if (existing) return existing.id

    const { data: created, error } = await this.supabase
      .from('items')
      .insert([{ name, organization_id: orgId, default_uom: uom, is_alcohol: isAlcohol, abv_pct: abvPct, category }])
      .select('id')
      .single()

    if (error) throw new Error(`Failed to create item ${name}: ${error.message}`)
    return created.id
  }

  public async importFromJson(payload: JsonPayload): Promise<{ created: number; updated: number }> {
    const orgId = await this.resolveOrganizationId()
    let created = 0
    let updated = 0

    for (const r of payload.recipes) {
      const name = r.name.trim()
      const targetAbv = r.last_batch_volume?.abv_percent ? r.last_batch_volume.abv_percent / 100 : null
      const baselineFinalL = 1000

      // upsert recipe by name + org
      const { data: existing } = await this.supabase
        .from('recipes')
        .select('id')
        .eq('name', name)
        .eq('organization_id', orgId)
        .single()

      let recipeId: string
      if (existing) {
        const { data: updatedRecipe, error: updErr } = await this.supabase
          .from('recipes')
          .update({ target_abv: targetAbv, baseline_final_l: baselineFinalL })
          .eq('id', existing.id)
          .select('id')
          .single()
        if (updErr) throw new Error(`Failed to update recipe ${name}: ${updErr.message}`)
        recipeId = updatedRecipe.id
        updated++
      } else {
        const { data: newRecipe, error: insErr } = await this.supabase
          .from('recipes')
          .insert([{ name, organization_id: orgId, target_abv: targetAbv, baseline_final_l: baselineFinalL }])
          .select('id')
          .single()
        if (insErr) throw new Error(`Failed to create recipe ${name}: ${insErr.message}`)
        recipeId = newRecipe.id
        created++
      }

      // clear existing ingredients
      const { error: delErr } = await this.supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', recipeId)
        .eq('organization_id', orgId)
      if (delErr) throw new Error(`Failed to clear ingredients for ${name}: ${delErr.message}`)

      // ensure base items
      const ethanolId = await this.ensureItem('Ethanol 82%', orgId, { uom: 'L', isAlcohol: true, abvPct: 82, category: 'spirit' })
      const waterId = await this.ensureItem('Water', orgId, { uom: 'L', isAlcohol: false, category: 'other' })

      // insert botanicals
      for (const b of r.botanicals) {
        const bName = this.normalizeName(b.name)
        const itemId = await this.ensureItem(bName, orgId, { uom: 'g', isAlcohol: false, category: 'botanical' })
        const { error: insIngErr } = await this.supabase
          .from('recipe_ingredients')
          .insert([{ organization_id: orgId, recipe_id: recipeId, item_id: itemId, qty_per_batch: b.weight_g, uom: 'g', step: 'maceration' }])
        if (insIngErr) throw new Error(`Failed to add ingredient ${bName} to ${name}: ${insIngErr.message}`)
      }

      // insert ethanol
      if (typeof r.last_batch_volume?.alcohol_l === 'number' && r.last_batch_volume.alcohol_l > 0) {
        const { error: insEthanolErr } = await this.supabase
          .from('recipe_ingredients')
          .insert([{ organization_id: orgId, recipe_id: recipeId, item_id: ethanolId, qty_per_batch: r.last_batch_volume.alcohol_l, uom: 'L', step: 'maceration' }])
        if (insEthanolErr) throw new Error(`Failed to add ethanol to ${name}: ${insEthanolErr.message}`)
      }

      // insert water
      if (typeof r.last_batch_volume?.water_l === 'number' && r.last_batch_volume.water_l > 0) {
        const { error: insWaterErr } = await this.supabase
          .from('recipe_ingredients')
          .insert([{ organization_id: orgId, recipe_id: recipeId, item_id: waterId, qty_per_batch: r.last_batch_volume.water_l, uom: 'L', step: 'proofing' }])
        if (insWaterErr) throw new Error(`Failed to add water to ${name}: ${insWaterErr.message}`)
      }
    }

    return { created, updated }
  }
}
