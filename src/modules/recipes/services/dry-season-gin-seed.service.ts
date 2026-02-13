import { createClient } from '@/lib/supabase/client'
import { getOrganizationId } from '@/lib/auth/get-org-id'

interface DrySeasonGinItem {
  name: string
  default_uom: string
  is_alcohol: boolean
  abv_pct?: number
}

interface DrySeasonGinIngredient {
  recipe: string
  step: string
  item: string
  qty: number
  uom: string
  notes?: string
}

export class DrySeasonGinSeedService {
  private supabase = createClient()

  async seedDrySeasonGinData(): Promise<{ itemsCreated: number; itemsUpdated: number; recipeCreated: boolean }> {
    const organizationId = await getOrganizationId()

    // Seed items
    const items: DrySeasonGinItem[] = [
      { name: 'Ethanol 81.4%', default_uom: 'L', is_alcohol: true, abv_pct: 81.4 },
      { name: 'Water', default_uom: 'L', is_alcohol: false },
      { name: 'Juniper', default_uom: 'g', is_alcohol: false },
      { name: 'Coriander Seed', default_uom: 'g', is_alcohol: false },
      { name: 'Angelica', default_uom: 'g', is_alcohol: false },
      { name: 'Cardamon', default_uom: 'g', is_alcohol: false },
      { name: 'Lemongrass', default_uom: 'g', is_alcohol: false },
      { name: 'Mandarin', default_uom: 'g', is_alcohol: false },
      { name: 'Mandarin Skin', default_uom: 'g', is_alcohol: false },
      { name: 'Turmeric', default_uom: 'g', is_alcohol: false },
      { name: 'Rosella Flower', default_uom: 'g', is_alcohol: false },
      { name: 'Holy Basil', default_uom: 'g', is_alcohol: false },
      { name: 'Thai Basil', default_uom: 'g', is_alcohol: false },
      { name: 'Kaffir Lime Leaf', default_uom: 'g', is_alcohol: false }
    ]

    let itemsCreated = 0
    let itemsUpdated = 0

    for (const item of items) {
      const { data: existingItem } = await this.supabase
        .from('items')
        .select('id')
        .eq('name', item.name)
        .eq('organization_id', organizationId)
        .single()

      if (existingItem) {
        // Update existing item
        await this.supabase
          .from('items')
          .update({
            unit: item.default_uom,
            is_alcohol: item.is_alcohol,
            abv_pct: item.abv_pct || null,
            category: item.is_alcohol ? 'spirit' : 'botanical'
          })
          .eq('id', existingItem.id)
        itemsUpdated++
      } else {
        // Create new item
        const { error } = await this.supabase
          .from('items')
          .insert([{
            name: item.name,
            unit: item.default_uom,
            is_alcohol: item.is_alcohol,
            abv_pct: item.abv_pct || null,
            category: item.is_alcohol ? 'spirit' : 'botanical',
            organization_id: organizationId
          }])

        if (error) {
          console.warn(`Failed to create item ${item.name}:`, error.message)
        } else {
          itemsCreated++
        }
      }
    }

    // Seed recipe and ingredients
    const recipeName = 'Dry Season Gin (40%)'
    const ingredients: DrySeasonGinIngredient[] = [
      { recipe: recipeName, step: 'maceration', item: 'Ethanol 81.4%', qty: 199, uom: 'L', notes: 'Pre-proof charge @ 81.4% ABV' },
      { recipe: recipeName, step: 'maceration', item: 'Juniper', qty: 6250, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Coriander Seed', qty: 625, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Angelica', qty: 167, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Cardamon', qty: 83, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Lemongrass', qty: 1167, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Mandarin', qty: 1667, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Mandarin Skin', qty: 1200, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Turmeric', qty: 500, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Rosella Flower', qty: 1667, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Holy Basil', qty: 167, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Thai Basil', qty: 1000, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Kaffir Lime Leaf', qty: 333, uom: 'g' },
      { recipe: recipeName, step: 'proofing', item: 'Water', qty: 205, uom: 'L', notes: 'Add to reach 40% ABV target' }
    ]

    let recipeCreated = false

    // Check if recipe exists
    const { data: existingRecipe } = await this.supabase
      .from('recipes')
      .select('id')
      .eq('name', recipeName)
      .eq('organization_id', organizationId)
      .single()

    let recipeId: string

    if (existingRecipe) {
      recipeId = existingRecipe.id
      // Clear existing ingredients
      await this.supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', recipeId)
      
      // Update recipe with description and target ABV
      await this.supabase
        .from('recipes')
        .update({
          description: 'Inspired by the hot, arid months of the tropical dry season, this gin captures the essence of Southeast Asian spice markets and dried herbs. The botanical blend features warming spices like turmeric and cardamom, aromatic lemongrass, and exotic elements like rosella flower and Thai basil. The dry, spicy character is balanced with traditional gin botanicals, creating a complex and warming spirit perfect for those who enjoy bold, spiced flavors. Each sip transports you to bustling Asian markets filled with fragrant spices and dried botanicals.',
          notes: 'Dry Season Gin (40%) with baseline 404L @ 40% ABV. LAL: 161.986L from 199L @ 81.4%'
        })
        .eq('id', recipeId)
    } else {
      // Create new recipe
      const { data: newRecipe, error: recipeError } = await this.supabase
        .from('recipes')
        .insert([{
          name: recipeName,
          organization_id: organizationId,
          description: 'Inspired by the hot, arid months of the tropical dry season, this gin captures the essence of Southeast Asian spice markets and dried herbs. The botanical blend features warming spices like turmeric and cardamom, aromatic lemongrass, and exotic elements like rosella flower and Thai basil. The dry, spicy character is balanced with traditional gin botanicals, creating a complex and warming spirit perfect for those who enjoy bold, spiced flavors. Each sip transports you to bustling Asian markets filled with fragrant spices and dried botanicals.',
          notes: 'Dry Season Gin (40%) with baseline 404L @ 40% ABV. LAL: 161.986L from 199L @ 81.4%'
        }])
        .select('id')
        .single()

      if (recipeError) {
        throw new Error(`Failed to create recipe: ${recipeError.message}`)
      }
      recipeId = newRecipe.id
      recipeCreated = true
    }

    // Add ingredients
    const ingredientInserts = []
    for (const ingredient of ingredients) {
      // Find item by name
      const { data: item } = await this.supabase
        .from('items')
        .select('id')
        .eq('name', ingredient.item)
        .eq('organization_id', organizationId)
        .single()

      if (!item) {
        console.warn(`Item not found: ${ingredient.item}`)
        continue
      }

      ingredientInserts.push({
        organization_id: organizationId,
        recipe_id: recipeId,
        item_id: item.id,
        qty_per_batch: ingredient.qty,
        uom: ingredient.uom,
        step: ingredient.step,
        notes: ingredient.notes || null
      })
    }

    if (ingredientInserts.length > 0) {
      const { error: ingredientsError } = await this.supabase
        .from('recipe_ingredients')
        .insert(ingredientInserts)

      if (ingredientsError) {
        throw new Error(`Failed to create recipe ingredients: ${ingredientsError.message}`)
      }
    }

    return { itemsCreated, itemsUpdated, recipeCreated }
  }
}
