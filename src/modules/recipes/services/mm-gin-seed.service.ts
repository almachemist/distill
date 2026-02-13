import { createClient } from '@/lib/supabase/client'
import { getOrganizationId } from '@/lib/auth/get-org-id'

interface MMGinItem {
  name: string
  default_uom: string
  is_alcohol: boolean
  abv_pct?: number
}

interface MMGinIngredient {
  recipe: string
  step: string
  item: string
  qty: number
  uom: string
  notes?: string
}

export class MMGinSeedService {
  private supabase = createClient()

  async seedMMGinData(): Promise<{ itemsCreated: number; itemsUpdated: number; recipeCreated: boolean }> {
    // Get organization ID
    const organizationId = await getOrganizationId()

    // Seed items
    const items: MMGinItem[] = [
      { name: 'Ethanol 82%', default_uom: 'L', is_alcohol: true, abv_pct: 82 },
      { name: 'Water', default_uom: 'L', is_alcohol: false },
      { name: 'Juniper', default_uom: 'g', is_alcohol: false },
      { name: 'Coriander', default_uom: 'g', is_alcohol: false },
      { name: 'Angelica', default_uom: 'g', is_alcohol: false },
      { name: 'Orris Root', default_uom: 'g', is_alcohol: false },
      { name: 'Orange peel', default_uom: 'g', is_alcohol: false },
      { name: 'Lemon peel', default_uom: 'g', is_alcohol: false },
      { name: 'Liquorice', default_uom: 'g', is_alcohol: false },
      { name: 'Cardamon', default_uom: 'g', is_alcohol: false },
      { name: 'Chamomile', default_uom: 'g', is_alcohol: false }
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
    const recipeName = 'MM Gin'
    const ingredients: MMGinIngredient[] = [
      { recipe: recipeName, step: 'maceration', item: 'Ethanol 82%', qty: 332, uom: 'L', notes: 'Pre-proof charge @ 82% ABV' },
      { recipe: recipeName, step: 'maceration', item: 'Juniper', qty: 6400, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Coriander', qty: 1800, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Angelica', qty: 180, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Orris Root', qty: 50, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Orange peel', qty: 380, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Lemon peel', qty: 380, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Liquorice', qty: 100, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Cardamon', qty: 150, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Chamomile', qty: 50, uom: 'g' },
      { recipe: recipeName, step: 'proofing', item: 'Water', qty: 397, uom: 'L', notes: 'Proofing to 37.5% ABV' }
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
          description: 'Named "Merchant Mae" after a pioneering female entrepreneur, this approachable gin is crafted at 37.5% ABV for smooth sipping and versatile mixing. The recipe focuses on accessibility while maintaining botanical complexity, featuring classic gin botanicals with subtle floral notes from chamomile. This gin strikes a perfect balance between tradition and innovation, making it an ideal choice for both gin newcomers and experienced enthusiasts. Its lower proof makes it exceptionally smooth and perfect for long drinks or sipping neat.',
          notes: 'MM Gin (Merchant Mae) with baseline 729L @ 37.5% ABV. LAL: 272.24L from 332L @ 82%'
        })
        .eq('id', recipeId)
    } else {
      // Create new recipe
      const { data: newRecipe, error: recipeError } = await this.supabase
        .from('recipes')
        .insert([{
          name: recipeName,
          organization_id: organizationId,
          description: 'Named "Merchant Mae" after a pioneering female entrepreneur, this approachable gin is crafted at 37.5% ABV for smooth sipping and versatile mixing. The recipe focuses on accessibility while maintaining botanical complexity, featuring classic gin botanicals with subtle floral notes from chamomile. This gin strikes a perfect balance between tradition and innovation, making it an ideal choice for both gin newcomers and experienced enthusiasts. Its lower proof makes it exceptionally smooth and perfect for long drinks or sipping neat.',
          notes: 'MM Gin (Merchant Mae) with baseline 729L @ 37.5% ABV. LAL: 272.24L from 332L @ 82%'
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
