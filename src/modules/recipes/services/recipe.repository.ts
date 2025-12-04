import { createClient } from '@/lib/supabase/client'
import type { 
  Recipe, 
  RecipeInsert, 
  RecipeUpdate,
  RecipeWithIngredients,
  RecipeIngredient,
  RecipeIngredientInsert,
  Item,
  ItemInsert,
  ItemCsvRow,
  RecipeCsvRow
} from '../types/recipe.types'

export class RecipeRepository {
  private supabase = createClient()

  /**
   * Get all recipes for the current organization
   */
  async fetchRecipes(): Promise<Recipe[]> {
    try {
      // Development: force dev organization to match seeded data; Production: use user's organization
      let organizationId: string
      if (process.env.NODE_ENV === 'development') {
        organizationId = '00000000-0000-0000-0000-000000000001'
      } else {
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
        organizationId = profile.organization_id
      }

      const { data, error } = await this.supabase
        .from('recipes')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name')

      if (error) {
        throw new Error(`Failed to fetch recipes: ${error.message || 'Unknown database error'}`)
      }

      return data || []
    } catch (err) {
      // Surface errors so UI can display them, even in development
      throw err
    }
  }

  /**
   * Get a single recipe with all its ingredients
   */
  async fetchRecipeWithIngredients(recipeId: string): Promise<RecipeWithIngredients | null> {
    // Development: force dev organization; Production: use user's organization
    let organizationId: string
    if (process.env.NODE_ENV === 'development') {
      organizationId = '00000000-0000-0000-0000-000000000001'
    } else {
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
        throw new Error('User organization not found')
      }
      organizationId = profile.organization_id
    }

    // Fetch recipe with organization filter
    const { data: recipe, error: recipeError } = await this.supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .eq('organization_id', organizationId)
      .single()

    if (recipeError) {
      throw new Error(`Failed to fetch recipe: ${recipeError.message}`)
    }

    if (!recipe) {
      return null
    }

    // Fetch ingredients with proper JOIN and organization filter
    const { data: ingredients, error: ingredientsError } = await this.supabase
      .from('recipe_ingredients')
      .select(`
        id,
        recipe_id,
        item_id,
        qty_per_batch,
        uom,
        step,
        notes,
        created_at,
        items!inner (
          id,
          name,
          category,
          default_uom,
          is_alcohol,
          abv_pct
        )
      `)
      .eq('recipe_id', recipeId)
      .eq('organization_id', organizationId)
      .order('step, created_at')

    if (ingredientsError) {
      throw new Error(`Failed to fetch recipe ingredients: ${ingredientsError.message}`)
    }

    return {
      ...recipe,
      ingredients: (ingredients || []).map((ing: any) => ({
        ...ing,
        item: (Array.isArray(ing.items) ? ing.items[0] : ing.items) as Item
      }))
    }
  }

  /**
   * Get ingredients for a specific recipe
   */
  async fetchRecipeIngredients(recipeId: string): Promise<RecipeIngredient[]> {
    const { data, error } = await this.supabase
      .from('recipe_ingredients')
      .select(`
        *,
        items (*)
      `)
      .eq('recipe_id', recipeId)
      .order('step, created_at')

    if (error) {
      throw new Error(`Failed to fetch recipe ingredients: ${error.message}`)
    }

    return (data ?? []).map((ing: any) => ({
      ...ing,
      item: (Array.isArray(ing.items) ? ing.items[0] : ing.items) as Item
    }))
  }

  /**
   * Create a new recipe
   */
  async createRecipe(recipe: RecipeInsert): Promise<Recipe> {
    const { data, error } = await this.supabase
      .from('recipes')
      .insert([recipe])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create recipe: ${error.message}`)
    }

    return data
  }

  /**
   * Update an existing recipe
   */
  async updateRecipe(id: string, recipe: RecipeUpdate): Promise<Recipe> {
    const { data, error } = await this.supabase
      .from('recipes')
      .update(recipe)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update recipe: ${error.message}`)
    }

    return data
  }

  /**
   * Delete a recipe and all its ingredients
   */
  async deleteRecipe(id: string): Promise<void> {
    // First delete all ingredients
    const { error: ingredientsError } = await this.supabase
      .from('recipe_ingredients')
      .delete()
      .eq('recipe_id', id)

    if (ingredientsError) {
      throw new Error(`Failed to delete recipe ingredients: ${ingredientsError.message}`)
    }

    // Then delete the recipe
    const { error } = await this.supabase
      .from('recipes')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete recipe: ${error.message}`)
    }
  }

  /**
   * Add an ingredient to a recipe
   */
  async addRecipeIngredient(ingredient: RecipeIngredientInsert): Promise<RecipeIngredient> {
    const { data, error } = await this.supabase
      .from('recipe_ingredients')
      .insert([ingredient])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add recipe ingredient: ${error.message}`)
    }

    return data
  }

  /**
   * Update a recipe ingredient
   */
  async updateRecipeIngredient(id: string, ingredient: Partial<RecipeIngredientInsert>): Promise<RecipeIngredient> {
    const { data, error } = await this.supabase
      .from('recipe_ingredients')
      .update(ingredient)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update recipe ingredient: ${error.message}`)
    }

    return data
  }

  /**
   * Remove an ingredient from a recipe
   */
  async removeRecipeIngredient(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('recipe_ingredients')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to remove recipe ingredient: ${error.message}`)
    }
  }

  /**
   * Get all items
   */
  async fetchItems(): Promise<Item[]> {
    const { data, error } = await this.supabase
      .from('items')
      .select('*')
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch items: ${error.message}`)
    }

    return data
  }

  /**
   * Create a new item
   */
  async createItem(item: ItemInsert): Promise<Item> {
    const { data, error } = await this.supabase
      .from('items')
      .insert([item])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create item: ${error.message}`)
    }

    return data
  }

  /**
   * Upsert items from CSV data
   * If an item with the same name exists, it will be updated
   */
  async upsertItemsFromCsv(csvData: ItemCsvRow[]): Promise<{ created: number; updated: number }> {
    let created = 0
    let updated = 0

    for (const row of csvData) {
      try {
        // Try to find existing item by name
        const { data: existingItem } = await this.supabase
          .from('items')
          .select('id')
          .eq('name', row.name)
          .single()

        if (existingItem) {
          // Update existing item
          await this.supabase
            .from('items')
            .update({
              category: row.category,
              default_uom: row.uom,
              is_alcohol: row.is_alcohol
            })
            .eq('id', existingItem.id)
          updated++
        } else {
          // Create new item
          const { error } = await this.supabase
            .from('items')
            .insert([{
              name: row.name,
              category: row.category,
              default_uom: row.uom,
              is_alcohol: row.is_alcohol
            }])

          if (error) {
            console.warn(`Failed to create item ${row.name}:`, error.message)
          } else {
            created++
          }
        }
      } catch (error) {
        console.warn(`Error processing item ${row.name}:`, error)
      }
    }

    return { created, updated }
  }

  /**
   * Upsert recipes and ingredients from CSV data
   */
  async upsertRecipesFromCsv(csvData: RecipeCsvRow[]): Promise<{ created: number; updated: number }> {
    let created = 0
    let updated = 0

    // Group by recipe name
    const recipeGroups = csvData.reduce((acc, row) => {
      if (!acc[row.recipe_name]) {
        acc[row.recipe_name] = []
      }
      acc[row.recipe_name].push(row)
      return acc
    }, {} as Record<string, RecipeCsvRow[]>)

    for (const [recipeName, ingredients] of Object.entries(recipeGroups)) {
      try {
        // Try to find existing recipe
        let recipe: Recipe
        const { data: existingRecipe } = await this.supabase
          .from('recipes')
          .select('*')
          .eq('name', recipeName)
          .single()

        if (existingRecipe) {
          recipe = existingRecipe
          updated++
        } else {
          // Create new recipe
          const { data: newRecipe, error } = await this.supabase
            .from('recipes')
            .insert([{
              name: recipeName,
              notes: `Imported recipe with ${ingredients.length} ingredients`
            }])
            .select()
            .single()

          if (error) {
            console.warn(`Failed to create recipe ${recipeName}:`, error.message)
            continue
          }
          recipe = newRecipe
          created++
        }

        // Clear existing ingredients and add new ones
        await this.supabase
          .from('recipe_ingredients')
          .delete()
          .eq('recipe_id', recipe.id)

        // Add ingredients
        for (const ingredient of ingredients) {
          // Find item by name
          const { data: item } = await this.supabase
            .from('items')
            .select('id')
            .eq('name', ingredient.item_name)
            .single()

          if (!item) {
            console.warn(`Item not found: ${ingredient.item_name} for recipe ${recipeName}`)
            continue
          }

          await this.supabase
            .from('recipe_ingredients')
            .insert([{
              recipe_id: recipe.id,
              item_id: item.id,
              qty_per_batch: ingredient.qty_per_batch,
              uom: ingredient.uom,
              step: ingredient.step
            }])
        }
      } catch (error) {
        console.warn(`Error processing recipe ${recipeName}:`, error)
      }
    }

    return { created, updated }
  }

  /**
   * Search recipes by name
   */
  async searchRecipes(searchTerm: string): Promise<Recipe[]> {
    const { data, error } = await this.supabase
      .from('recipes')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .order('name')

    if (error) {
      throw new Error(`Failed to search recipes: ${error.message}`)
    }

    return data
  }

  /**
   * Get recipe by name
   */
  async getRecipeByName(name: string): Promise<Recipe | null> {
    const { data, error } = await this.supabase
      .from('recipes')
      .select('*')
      .eq('name', name)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null
      }
      throw new Error(`Failed to get recipe by name: ${error.message}`)
    }

    return data
  }
}
