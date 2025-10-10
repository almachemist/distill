import { createClient } from '@/lib/supabase/client'

interface WetSeasonGinItem {
  name: string
  default_uom: string
  is_alcohol: boolean
  abv_pct?: number
}

interface WetSeasonGinIngredient {
  recipe: string
  step: string
  item: string
  qty: number
  uom: string
  notes?: string
}

export class WetSeasonGinSeedService {
  private supabase = createClient()

  async seedWetSeasonGinData(): Promise<{ itemsCreated: number; itemsUpdated: number; recipeCreated: boolean }> {
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
    const items: WetSeasonGinItem[] = [
      { name: 'Ethanol 81.3%', default_uom: 'L', is_alcohol: true, abv_pct: 81.3 },
      { name: 'Water', default_uom: 'L', is_alcohol: false },
      { name: 'Juniper', default_uom: 'g', is_alcohol: false },
      { name: 'Sawtooth Coriander', default_uom: 'g', is_alcohol: false },
      { name: 'Angelica', default_uom: 'g', is_alcohol: false },
      { name: 'Holy Basil', default_uom: 'g', is_alcohol: false },
      { name: 'Thai Sweet Basil', default_uom: 'g', is_alcohol: false },
      { name: 'Kaffir Fruit Rind', default_uom: 'g', is_alcohol: false },
      { name: 'Kaffir Leaves', default_uom: 'g', is_alcohol: false },
      { name: 'Thai Marigolds', default_uom: 'g', is_alcohol: false },
      { name: 'Galangal', default_uom: 'g', is_alcohol: false },
      { name: 'Lemongrass', default_uom: 'g', is_alcohol: false },
      { name: 'Liquorice Root', default_uom: 'g', is_alcohol: false },
      { name: 'Cardamon', default_uom: 'g', is_alcohol: false },
      { name: 'Pandanus', default_uom: 'g', is_alcohol: false }
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
    const recipeName = 'Wet Season Gin (42%)'
    const ingredients: WetSeasonGinIngredient[] = [
      { recipe: recipeName, step: 'maceration', item: 'Ethanol 81.3%', qty: 251, uom: 'L', notes: 'Pre-proof charge' },
      { recipe: recipeName, step: 'maceration', item: 'Juniper', qty: 6250, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Sawtooth Coriander', qty: 625, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Angelica', qty: 168, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Holy Basil', qty: 252, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Thai Sweet Basil', qty: 168, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Kaffir Fruit Rind', qty: 832, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Kaffir Leaves', qty: 500, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Thai Marigolds', qty: 332, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Galangal', qty: 332, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Lemongrass', qty: 252, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Liquorice Root', qty: 84, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Cardamon', qty: 84, uom: 'g' },
      { recipe: recipeName, step: 'maceration', item: 'Pandanus', qty: 108, uom: 'g' },
      { recipe: recipeName, step: 'proofing', item: 'Water', qty: 234, uom: 'L', notes: 'Add to reach 42% ABV target' }
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
          description: 'Celebrating the lush, tropical wet season, this gin embodies the green abundance and fresh vitality of monsoon months. The botanical selection focuses on fresh herbs and tropical elements - featuring multiple varieties of basil (holy and Thai sweet), aromatic kaffir lime leaves and fruit rind, galangal, and exotic pandanus. This gin offers a fresh, herbaceous, and tropical character that is both refreshing and complex. Perfect for those who appreciate bright, fresh flavors and the aromatic complexity of Southeast Asian cuisine.',
          notes: 'Wet Season Gin (42%) with baseline 485L @ 42% ABV. LAL: 203.96L from 251L @ 81.3%'
        })
        .eq('id', recipeId)
    } else {
      // Create new recipe
      const { data: newRecipe, error: recipeError } = await this.supabase
        .from('recipes')
        .insert([{
          name: recipeName,
          organization_id: organizationId,
          description: 'Celebrating the lush, tropical wet season, this gin embodies the green abundance and fresh vitality of monsoon months. The botanical selection focuses on fresh herbs and tropical elements - featuring multiple varieties of basil (holy and Thai sweet), aromatic kaffir lime leaves and fruit rind, galangal, and exotic pandanus. This gin offers a fresh, herbaceous, and tropical character that is both refreshing and complex. Perfect for those who appreciate bright, fresh flavors and the aromatic complexity of Southeast Asian cuisine.',
          notes: 'Wet Season Gin (42%) with baseline 485L @ 42% ABV. LAL: 203.96L from 251L @ 81.3%'
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
