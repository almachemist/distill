/**
 * RECIPE REPOSITORY
 * 
 * Manages production recipes in Supabase.
 * Recipes are reusable templates for creating production batches.
 */

import { createClient } from '@/lib/supabase/client'
import type { Recipe, GinVodkaSpiritRecipe, RumCaneSpiritRecipe } from '@/types/recipe-schemas'
import type { ProductType } from '@/types/production-schemas'

async function getSupabase() {
  const mod = await import('@/lib/supabase/client')
  return mod.createClient()
}

// ============================================================================
// RECIPE QUERIES
// ============================================================================

/**
 * Get all active recipes
 */
export async function getActiveRecipes(): Promise<Recipe[]> {
  try {
    const sb = await getSupabase()
    const { data, error } = await sb
      .from('production_recipes')
      .select('*')
      .eq('is_active', true)
      .order('recipe_name', { ascending: true })
    
    if (error) {
      console.error('Error fetching recipes:', error)
      return []
    }
    
    return (data ?? []).map((row: any) => ({
      id: row.id,
      recipeName: row.recipe_name,
      productType: row.product_type as ProductType,
      description: row.description,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isActive: row.is_active,
      ...row.data,
    })) as Recipe[]
  } catch (error) {
    console.error('Error in getActiveRecipes:', error)
    return []
  }
}

/**
 * Get recipes by product type
 */
export async function getRecipesByType(productType: ProductType): Promise<Recipe[]> {
  try {
    console.log('Fetching recipes for type:', productType)
    const sb = await getSupabase()
    const { data, error } = await sb
      .from('production_recipes')
      .select('*')
      .eq('product_type', productType)
      .eq('is_active', true)
      .order('recipe_name', { ascending: true })

    if (error) {
      console.error('Error fetching recipes by type:', error)
      return []
    }

    console.log(`Found ${data?.length || 0} recipes for type ${productType}:`, data)

    return (data ?? []).map((row: any) => ({
      id: row.id,
      recipeName: row.recipe_name,
      productType: row.product_type as ProductType,
      description: row.description,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isActive: row.is_active,
      ...row.data,
    })) as Recipe[]
  } catch (error) {
    console.error('Error in getRecipesByType:', error)
    return []
  }
}

/**
 * Get recipes for Gin/Vodka/Spirits
 */
export async function getGinVodkaSpiritRecipes(): Promise<GinVodkaSpiritRecipe[]> {
  const ginRecipes = await getRecipesByType('gin')
  const vodkaRecipes = await getRecipesByType('vodka')
  const otherRecipes = await getRecipesByType('other')
  
  return [...ginRecipes, ...vodkaRecipes, ...otherRecipes] as GinVodkaSpiritRecipe[]
}

/**
 * Get recipes for Rum/Cane Spirit
 */
export async function getRumCaneSpiritRecipes(): Promise<RumCaneSpiritRecipe[]> {
  const rumRecipes = await getRecipesByType('rum')
  const caneRecipes = await getRecipesByType('cane_spirit')
  
  return [...rumRecipes, ...caneRecipes] as RumCaneSpiritRecipe[]
}

/**
 * Get a specific recipe by ID
 */
export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    const sb = await getSupabase()
    const { data, error } = await sb
      .from('production_recipes')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !data) {
      console.error('Error fetching recipe:', error)
      return null
    }
    
    return {
      id: data.id,
      recipeName: data.recipe_name,
      productType: data.product_type as ProductType,
      description: data.description,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isActive: data.is_active,
      ...data.data,
    } as Recipe
  } catch (error) {
    console.error('Error in getRecipeById:', error)
    return null
  }
}

/**
 * Create a new recipe
 */
export async function createRecipe(recipe: Partial<Recipe>): Promise<Recipe | null> {
  try {
    const { id, recipeName, productType, description, notes, createdAt, updatedAt, isActive, ...recipeData } = recipe
    
    const sb = await getSupabase()
    const { data, error } = await sb
      .from('production_recipes')
      .insert({
        recipe_name: recipeName,
        product_type: productType,
        description,
        notes,
        data: recipeData,
        is_active: isActive ?? true,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating recipe:', error)
      return null
    }
    
    return {
      id: data.id,
      recipeName: data.recipe_name,
      productType: data.product_type as ProductType,
      description: data.description,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isActive: data.is_active,
      ...data.data,
    } as Recipe
  } catch (error) {
    console.error('Error in createRecipe:', error)
    return null
  }
}

/**
 * Update a recipe
 */
export async function updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe | null> {
  try {
    const { recipeName, productType, description, notes, isActive, ...recipeData } = updates
    
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }
    
    if (recipeName) updateData.recipe_name = recipeName
    if (productType) updateData.product_type = productType
    if (description !== undefined) updateData.description = description
    if (notes !== undefined) updateData.notes = notes
    if (isActive !== undefined) updateData.is_active = isActive
    if (Object.keys(recipeData).length > 0) updateData.data = recipeData
    
    const sb = await getSupabase()
    const { data, error } = await sb
      .from('production_recipes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating recipe:', error)
      return null
    }
    
    return {
      id: data.id,
      recipeName: data.recipe_name,
      productType: data.product_type as ProductType,
      description: data.description,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isActive: data.is_active,
      ...data.data,
    } as Recipe
  } catch (error) {
    console.error('Error in updateRecipe:', error)
    return null
  }
}

/**
 * Archive a recipe (set is_active to false)
 */
export async function archiveRecipe(id: string): Promise<boolean> {
  try {
    const sb = await getSupabase()
    const { error } = await sb
      .from('production_recipes')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) {
      console.error('Error archiving recipe:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error in archiveRecipe:', error)
    return false
  }
}
