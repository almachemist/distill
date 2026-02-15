/**
 * RUM PRODUCT RECIPE SEED SERVICE
 *
 * Seeds rum product recipes (flavored, spiced, dark rums) into Supabase
 * These are finishing recipes (base spirit + ingredients), not fermentation/distillation recipes
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { RUM_PRODUCT_RECIPES } from '../data/rum-product-recipes.dataset'

export class RumProductSeedService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  /**
   * Seed all rum product recipes to Supabase
   */
  async seedAllRumProductRecipes(): Promise<{ success: boolean; message: string; count: number }> {
    try {
      console.log('🍹 Starting rum product recipe seed...')
      
      // Get organization ID
      const orgId = await this.getOrganizationId()
      if (!orgId) {
        throw new Error('No organization found. Please create an organization first.')
      }

      let successCount = 0
      const errors: string[] = []

      for (const recipe of RUM_PRODUCT_RECIPES) {
        try {
          await this.seedRumProductRecipe(recipe, orgId)
          successCount++
          console.log(`✅ Seeded: ${recipe.name}`)
        } catch (error) {
          const errorMsg = `Failed to seed ${recipe.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
          console.error(`❌ ${errorMsg}`)
          errors.push(errorMsg)
        }
      }

      const message = errors.length > 0
        ? `Seeded ${successCount}/${RUM_PRODUCT_RECIPES.length} recipes. Errors: ${errors.join('; ')}`
        : `Successfully seeded all ${successCount} rum product recipes!`

      return {
        success: errors.length === 0,
        message,
        count: successCount
      }
    } catch (error) {
      console.error('❌ Rum product recipe seed failed:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        count: 0
      }
    }
  }

  /**
   * Seed a single rum product recipe
   */
  private async seedRumProductRecipe(recipe: typeof RUM_PRODUCT_RECIPES[0], organizationId: string) {
    // Check if recipe already exists
    const { data: existing } = await this.supabase
      .from('recipes')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('name', recipe.name)
      .single()

    let recipeId: string

    if (existing) {
      // Update existing recipe
      recipeId = existing.id
      
      const { error: updateError } = await this.supabase
        .from('recipes')
        .update({
          notes: recipe.notes || `${recipe.category} rum product recipe`,
          description: this.getRecipeDescription(recipe),
          updated_at: new Date().toISOString()
        })
        .eq('id', recipeId)

      if (updateError) throw updateError
      
      // Delete existing ingredients
      await this.supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', recipeId)
        .eq('organization_id', organizationId)
    } else {
      // Create new recipe
      const { data: newRecipe, error: recipeError } = await this.supabase
        .from('recipes')
        .insert([{
          organization_id: organizationId,
          name: recipe.name,
          notes: recipe.notes || `${recipe.category} rum product recipe`,
          description: this.getRecipeDescription(recipe)
        }])
        .select()
        .single()

      if (recipeError) throw recipeError
      if (!newRecipe) throw new Error('Failed to create recipe')
      
      recipeId = newRecipe.id
    }

    // Create or get ingredient items and add to recipe
    for (const ingredient of recipe.ingredients) {
      const itemId = await this.getOrCreateItem(ingredient.name, organizationId)
      
      // Determine quantity and unit
      const qty = ingredient.amount_ml || ingredient.amount_g || 0
      const uom = ingredient.amount_ml ? 'ml' : 'g'
      
      // Insert recipe ingredient
      const { error: ingredientError } = await this.supabase
        .from('recipe_ingredients')
        .insert([{
          organization_id: organizationId,
          recipe_id: recipeId,
          item_id: itemId,
          qty_per_batch: qty,
          uom: uom,
          step: 'blending', // Rum products are blended/mixed
          notes: ingredient.note || null
        }])

      if (ingredientError) throw ingredientError
    }
  }

  /**
   * Get or create an item in the items table
   */
  private async getOrCreateItem(itemName: string, organizationId: string): Promise<string> {
    // Check if item exists
    const { data: existing } = await this.supabase
      .from('items')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('name', itemName)
      .single()

    if (existing) {
      return existing.id
    }

    // Create new item
    const { data: newItem, error } = await this.supabase
      .from('items')
      .insert([{
        organization_id: organizationId,
        name: itemName,
        category: this.getCategoryForIngredient(itemName),
        default_uom: itemName.toLowerCase().includes('glycer') ? 'ml' : 
                     itemName.toLowerCase().includes('flavour') || itemName.toLowerCase().includes('flavor') ? 'ml' :
                     itemName.toLowerCase().includes('colour') || itemName.toLowerCase().includes('color') ? 'ml' :
                     itemName.toLowerCase().includes('essence') ? 'ml' : 'g',
        is_alcohol: false
      }])
      .select()
      .single()

    if (error) throw error
    if (!newItem) throw new Error(`Failed to create item: ${itemName}`)

    return newItem.id
  }

  /**
   * Get category for ingredient
   */
  private getCategoryForIngredient(itemName: string): string {
    const name = itemName.toLowerCase()
    if (name.includes('flavour') || name.includes('flavor') || name.includes('essence')) return 'flavoring'
    if (name.includes('glycer')) return 'additive'
    if (name.includes('colour') || name.includes('color') || name.includes('caramel')) return 'additive'
    if (name.includes('peel')) return 'botanical'
    return 'spice'
  }

  /**
   * Get description for recipe
   */
  private getRecipeDescription(recipe: typeof RUM_PRODUCT_RECIPES[0]): string {
    const descriptions = {
      'Pineapple Rum': 'Tropical pineapple-flavored rum with natural flavoring and glycerin for smoothness',
      'Spiced Rum': 'Traditional spiced rum with cinnamon, cardamom, cloves, star anise, citrus peels, and vanilla',
      'Merchant Made Dark Rum': 'Rich dark rum with caramel color and flavor for depth and sweetness'
    }
    return descriptions[recipe.name as keyof typeof descriptions] || `${recipe.category} rum product`
  }

  /**
   * Get organization ID
   */
  private async getOrganizationId(): Promise<string | null> {
    const { data } = await this.supabase
      .from('organizations')
      .select('id')
      .limit(1)
      .single()

    return data?.id || null
  }
}

