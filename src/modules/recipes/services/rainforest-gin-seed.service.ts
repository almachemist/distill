import { createClient } from '@/lib/supabase/client'

interface RainforestGinItem {
  name: string
  default_uom: string
  is_alcohol: boolean
  abv_pct?: number
}

interface RainforestGinIngredient {
  recipe: string
  step: string
  item: string
  qty: number
  uom: string
  notes?: string
}

export class RainforestGinSeedService {
  private supabase = createClient()

  async seedRainforestGinData(): Promise<{ itemsCreated: number; itemsUpdated: number; recipeCreated: boolean }> {
    // Get organization ID
    let organizationId: string
    if (process.env.NODE_ENV === 'development') {
      organizationId = '00000000-0000-0000-0000-000000000001'
    } else {
      const { data: userOrg, error: orgError } = await this.supabase
        .from('profiles')
        .select('organization_id')
        .single()

      if (orgError || !userOrg) {
        throw new Error('User organization not found.')
      }
      organizationId = userOrg.organization_id
    }

    // Seed items
    const items: RainforestGinItem[] = [
      { name: 'Ethanol 82%', default_uom: 'L', is_alcohol: true, abv_pct: 82 },
      { name: 'Water', default_uom: 'L', is_alcohol: false },
      { name: 'Juniper', default_uom: 'g', is_alcohol: false },
      { name: 'Coriander', default_uom: 'g', is_alcohol: false },
      { name: 'Angelica', default_uom: 'g', is_alcohol: false },
      { name: 'Cassia', default_uom: 'g', is_alcohol: false },
      { name: 'Lemon Myrtle', default_uom: 'g', is_alcohol: false },
      { name: 'Lemon Aspen', default_uom: 'g', is_alcohol: false },
      { name: 'Grapefruit peel', default_uom: 'g', is_alcohol: false },
      { name: 'Macadamia', default_uom: 'g', is_alcohol: false },
      { name: 'Liquorice', default_uom: 'g', is_alcohol: false },
      { name: 'Cardamon', default_uom: 'g', is_alcohol: false },
      { name: 'Pepperberry', default_uom: 'g', is_alcohol: false },
      { name: 'Vanilla', default_uom: 'g', is_alcohol: false },
      { name: 'Mango', default_uom: 'g', is_alcohol: false }
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
    const recipeName = 'Rainforest Gin (42%)'
    const ingredients: RainforestGinIngredient[] = [
      { recipe: recipeName, step: 'maceration', item: 'Ethanol 82%', qty: 280, uom: 'L', notes: 'Pre-proof charge @ 82% ABV' },
      { recipe: recipeName, step: 'maceration', item: 'Juniper', qty: 6360, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Coriander', qty: 1410, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Angelica', qty: 175, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Cassia', qty: 25, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Lemon Myrtle', qty: 141, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Lemon Aspen', qty: 71, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Grapefruit peel', qty: 567, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Macadamia', qty: 102, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Liquorice', qty: 51, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Cardamon', qty: 141, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Pepperberry', qty: 102, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Vanilla', qty: 25, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Mango', qty: 176, uom: 'g' },
      { recipe: recipeName, step: 'proofing', item: 'Water', qty: 266, uom: 'L', notes: 'Add to reach 42% ABV' }
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
      // Update existing recipe with description
      await this.supabase
        .from('recipes')
        .update({
          description: 'An adventurous botanical gin that takes you deep into the Australian rainforest. This unique expression features native Australian botanicals including lemon myrtle, lemon aspen, macadamia, and pepperberry, creating a distinctly Australian gin experience. The tropical and earthy notes are balanced with traditional gin botanicals, offering a complex flavor profile that captures the essence of the rainforest canopy. Perfect for those seeking an exotic and locally-inspired gin with bold, native flavors.',
          notes: 'Rainforest Gin with baseline 546L @ 42% ABV. LAL: 229.6L from 280L @ 82%'
        })
        .eq('id', recipeId)
      // Clear existing ingredients
      await this.supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', recipeId)
    } else {
      // Create new recipe
      const { data: newRecipe, error: recipeError } = await this.supabase
        .from('recipes')
        .insert([{
          name: recipeName,
          organization_id: organizationId,
          description: 'An adventurous botanical gin that takes you deep into the Australian rainforest. This unique expression features native Australian botanicals including lemon myrtle, lemon aspen, macadamia, and pepperberry, creating a distinctly Australian gin experience. The tropical and earthy notes are balanced with traditional gin botanicals, offering a complex flavor profile that captures the essence of the rainforest canopy. Perfect for those seeking an exotic and locally-inspired gin with bold, native flavors.',
          notes: 'Rainforest Gin with baseline 546L @ 42% ABV. LAL: 229.6L from 280L @ 82%'
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
