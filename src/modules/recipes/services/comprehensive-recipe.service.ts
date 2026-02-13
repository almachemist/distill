import { createClient } from '@/lib/supabase/client'
import { getOrganizationId } from '@/lib/auth/get-org-id'
import {
  Recipe,
  Ingredient,
  InventoryItem,
  ProductionBatch,
  StockTransaction,
  GIN_RECIPES,
  MASTER_INVENTORY,
  calculateRecipeCost,
  getLowStockItems
} from '../types/comprehensive-recipe.types'

type SupabaseRecipeIngredientItemRow = {
  id?: string
  name: string
  default_uom: string | null
  price_per_kg: number | null
  category: string | null
  supplier: string | null
  notes: string | null
}

type SupabaseRecipeIngredientRow = {
  item_id: string
  qty_per_batch: number
  step: number | null
  items: SupabaseRecipeIngredientItemRow
}

type SupabaseRecipeRow = {
  id: string
  name: string
  description: string | null
  abv: number
  batch_volume: number
  production_time: number | null
  difficulty: string | null
  category: string | null
  created_at: string
  updated_at: string
  is_active: boolean
  notes: string | null
  recipe_ingredients: SupabaseRecipeIngredientRow[]
}

type SupabaseItemRow = {
  id: string
  name: string
  category: string | null
  default_uom: string
  min_threshold: number | null
  max_threshold: number | null
  price_per_unit: number | null
  supplier: string | null
  notes: string | null
  updated_at: string
}

type SupabaseInventoryTxnRow = {
  qty: number
  txn_type: 'RECEIVE' | 'PRODUCE' | 'ADJUST' | 'CONSUME' | 'TRANSFER' | 'DESTROY'
}

type SupabaseStockTransactionRow = {
  id: string
  item_id: string
  txn_type: 'RECEIVE' | 'PRODUCE' | 'ADJUST' | 'CONSUME' | 'TRANSFER' | 'DESTROY'
  qty: number
  uom: string
  note: string | null
  batch_id: string | null
  dt: string
  user_id: string | null
  items: { name: string }
}

const normalizeRecipeDifficulty = (value: string | null): Recipe['difficulty'] => {
  const normalized = value?.toLowerCase()
  if (normalized === 'easy' || normalized === 'medium' || normalized === 'hard') {
    return normalized
  }
  return 'medium'
}

const normalizeRecipeCategory = (value: string | null): Recipe['category'] => {
  const normalized = value?.toLowerCase()
  if (normalized === 'traditional' || normalized === 'contemporary' || normalized === 'experimental') {
    return normalized
  }
  return 'traditional'
}

const mapRecipeIngredient = (ingredient: SupabaseRecipeIngredientRow): Ingredient => {
  const unit = ingredient.items.default_uom
  const normalizedUnit: Ingredient['unit'] = unit === 'kg' || unit === 'g' || unit === 'L' || unit === 'ml' ? unit : 'g'

  const category = ingredient.items.category
  const normalizedCategory: Ingredient['category'] =
    category === 'botanical' || category === 'spirit' || category === 'water' || category === 'other'
      ? category
      : 'other'

  const pricePerKg = ingredient.items.price_per_kg ?? 0

  return {
    id: ingredient.item_id,
    name: ingredient.items.name,
    quantity: ingredient.qty_per_batch,
    unit: normalizedUnit,
    pricePerKg,
    pricePerBatch: (ingredient.qty_per_batch * pricePerKg) / 1000,
    category: normalizedCategory,
    supplier: ingredient.items.supplier ?? undefined,
    notes: ingredient.items.notes ?? undefined
  }
}

export class ComprehensiveRecipeService {
  private supabase = createClient()

  // Recipe Management
  async getAllRecipes(): Promise<Recipe[]> {
    try {
      const { data, error } = await this.supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            *,
            items (*)
          )
        `)
        .eq('is_active', true)
        .order('name')

      if (error) throw error

      // Transform Supabase data to our Recipe format
      return (data as SupabaseRecipeRow[]).map((recipe) => {
        const ingredients = recipe.recipe_ingredients.map(mapRecipeIngredient)

        return {
          id: recipe.id,
          name: recipe.name,
          description: recipe.description ?? undefined,
          abv: recipe.abv,
          batchVolume: recipe.batch_volume,
          ingredients,
          totalCost: calculateRecipeCost(ingredients),
          productionTime: recipe.production_time || 24,
          difficulty: normalizeRecipeDifficulty(recipe.difficulty),
          category: normalizeRecipeCategory(recipe.category),
          createdAt: new Date(recipe.created_at),
          updatedAt: new Date(recipe.updated_at),
          isActive: recipe.is_active,
          notes: recipe.notes ?? undefined
        }
      })
    } catch (error) {
      console.error('Error fetching recipes:', error)
      // Return mock data if database fails
      return GIN_RECIPES
    }
  }

  async getRecipeById(recipeId: string): Promise<Recipe | null> {
    try {
      const { data, error } = await this.supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            *,
            items (*)
          )
        `)
        .eq('id', recipeId)
        .single()

      if (error) throw error

      const recipe = data as SupabaseRecipeRow
      const ingredients = recipe.recipe_ingredients.map(mapRecipeIngredient)

      return {
        id: data.id,
        name: data.name,
        description: data.description ?? undefined,
        abv: data.abv,
        batchVolume: data.batch_volume,
        ingredients,
        totalCost: calculateRecipeCost(ingredients),
        productionTime: data.production_time || 24,
        difficulty: normalizeRecipeDifficulty(data.difficulty),
        category: normalizeRecipeCategory(data.category),
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        isActive: data.is_active,
        notes: data.notes ?? undefined
      }
    } catch (error) {
      console.error('Error fetching recipe:', error)
      return GIN_RECIPES.find(r => r.id === recipeId) || null
    }
  }

  async createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recipe> {
    try {
      const organizationId = await getOrganizationId()

      // Create recipe
      const { data: recipeData, error: recipeError } = await this.supabase
        .from('recipes')
        .insert([{
          organization_id: organizationId,
          name: recipe.name,
          description: recipe.description,
          abv: recipe.abv,
          batch_volume: recipe.batchVolume,
          production_time: recipe.productionTime,
          difficulty: recipe.difficulty,
          category: recipe.category,
          is_active: recipe.isActive,
          notes: recipe.notes
        }])
        .select()
        .single()

      if (recipeError) throw recipeError

      // Create recipe ingredients
      const ingredientInserts = recipe.ingredients.map(ingredient => ({
        recipe_id: recipeData.id,
        item_id: ingredient.id,
        qty_per_batch: ingredient.quantity,
        step: 1 // Default step
      }))

      const { error: ingredientsError } = await this.supabase
        .from('recipe_ingredients')
        .insert(ingredientInserts)

      if (ingredientsError) throw ingredientsError

      return {
        ...recipe,
        id: recipeData.id,
        createdAt: new Date(recipeData.created_at),
        updatedAt: new Date(recipeData.updated_at)
      }
    } catch (error) {
      console.error('Error creating recipe:', error)
      throw error
    }
  }

  // Inventory Management
  async getAllInventoryItems(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await this.supabase
        .from('items')
        .select('*')
        .order('name')

      if (error) throw error

      // Transform to our format and get current stock
      const itemsWithStock = await Promise.all(
        (data as SupabaseItemRow[]).map(async (item) => {
          const stockLevel = await this.getCurrentStock(item.id)
          const category = item.category ?? 'other'
          const normalizedCategory: InventoryItem['category'] =
            category === 'botanical' ||
            category === 'spirit' ||
            category === 'water' ||
            category === 'packaging' ||
            category === 'other'
              ? category
              : 'other'

          const unit = item.default_uom
          const normalizedUnit: InventoryItem['unit'] =
            unit === 'g' || unit === 'kg' || unit === 'L' || unit === 'ml' || unit === 'units' ? unit : 'g'

          return {
            id: item.id,
            name: item.name,
            category: normalizedCategory,
            currentStock: stockLevel,
            unit: normalizedUnit,
            minThreshold: item.min_threshold ?? 0,
            maxThreshold: item.max_threshold ?? 1000,
            pricePerUnit: item.price_per_unit ?? 0,
            supplier: item.supplier ?? undefined,
            lastUpdated: new Date(item.updated_at),
            notes: item.notes ?? undefined
          }
        })
      )

      return itemsWithStock
    } catch (error) {
      console.error('Error fetching inventory:', error)
      // Return mock data if database fails
      return MASTER_INVENTORY
    }
  }

  async getCurrentStock(itemId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('inventory_txns')
        .select('qty, txn_type')
        .eq('item_id', itemId)

      if (error) throw error

      let total = 0
      const transactions = (data ?? []) as SupabaseInventoryTxnRow[]
      for (const txn of transactions) {
        switch (txn.txn_type) {
          case 'RECEIVE':
          case 'PRODUCE':
          case 'ADJUST':
            total += txn.qty
            break
          case 'CONSUME':
          case 'TRANSFER':
          case 'DESTROY':
            total -= txn.qty
            break
        }
      }

      return total
    } catch (error) {
      console.error('Error getting stock:', error)
      return 0
    }
  }

  async updateInventoryItem(itemId: string, updates: Partial<InventoryItem>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('items')
        .update({
          name: updates.name,
          category: updates.category,
          default_uom: updates.unit,
          min_threshold: updates.minThreshold,
          max_threshold: updates.maxThreshold,
          price_per_unit: updates.pricePerUnit,
          supplier: updates.supplier,
          notes: updates.notes
        })
        .eq('id', itemId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating inventory item:', error)
      throw error
    }
  }

  // Production Management
  async createProductionBatch(batch: Omit<ProductionBatch, 'id'>): Promise<ProductionBatch> {
    try {
      const organizationId = await getOrganizationId()

      const { data, error } = await this.supabase
        .from('production_orders')
        .insert([{
          organization_id: organizationId,
          recipe_id: batch.recipeId,
          product_name: batch.recipeName,
          batch_target_l: batch.targetVolume,
          status: batch.status,
          notes: batch.notes
        }])
        .select()
        .single()

      if (error) throw error

      return {
        ...batch,
        id: data.id
      }
    } catch (error) {
      console.error('Error creating production batch:', error)
      throw error
    }
  }

  async executeProductionBatch(batchId: string, ingredientsUsed: Array<{
    ingredientId: string
    ingredientName: string
    quantityUsed: number
    unit: string
  }>): Promise<void> {
    try {
      // Create consume transactions for each ingredient
      const transactions = ingredientsUsed.map(ingredient => ({
        item_id: ingredient.ingredientId,
        txn_type: 'CONSUME' as const,
        quantity: ingredient.quantityUsed,
        uom: ingredient.unit,
        note: `Production batch ${batchId}: ${ingredient.ingredientName}`,
        batch_id: batchId
      }))

      const { error } = await this.supabase
        .from('inventory_txns')
        .insert(transactions)

      if (error) throw error

      // Update production order status
      await this.supabase
        .from('production_orders')
        .update({ status: 'completed' })
        .eq('id', batchId)

    } catch (error) {
      console.error('Error executing production batch:', error)
      throw error
    }
  }

  // Stock Management
  async createStockTransaction(transaction: Omit<StockTransaction, 'id'>): Promise<void> {
    try {
      const organizationId = await getOrganizationId()

      const { error } = await this.supabase
        .from('inventory_txns')
        .insert([{
          organization_id: organizationId,
          item_id: transaction.itemId,
          txn_type: transaction.type.toUpperCase(),
          quantity: transaction.quantity,
          uom: transaction.unit,
          note: transaction.reason,
          batch_id: transaction.batchId,
          dt: transaction.date.toISOString()
        }])

      if (error) throw error
    } catch (error) {
      console.error('Error creating stock transaction:', error)
      throw error
    }
  }

  async getStockTransactions(itemId?: string): Promise<StockTransaction[]> {
    try {
      let query = this.supabase
        .from('inventory_txns')
        .select(`
          *,
          items (name)
        `)
        .order('dt', { ascending: false })

      if (itemId) {
        query = query.eq('item_id', itemId)
      }

      const { data, error } = await query

      if (error) throw error

      return (data as SupabaseStockTransactionRow[]).map((txn) => {
        const normalizedType = txn.txn_type.toLowerCase()
        const allowedTypes: Array<'receive' | 'consume' | 'adjust' | 'transfer'> = ['receive', 'consume', 'adjust', 'transfer']
        const type = allowedTypes.includes(normalizedType as typeof allowedTypes[number])
          ? (normalizedType as typeof allowedTypes[number])
          : 'adjust'

        return {
          id: txn.id,
          itemId: txn.item_id,
          itemName: txn.items.name,
          type,
          quantity: txn.qty,
          unit: txn.uom,
          reason: txn.note ?? '',
          batchId: txn.batch_id ?? undefined,
          date: new Date(txn.dt),
          userId: txn.user_id ?? 'system',
          notes: txn.note ?? undefined
        }
      })
    } catch (error) {
      console.error('Error fetching stock transactions:', error)
      return []
    }
  }

  // Utility Methods
  async getLowStockItems(): Promise<InventoryItem[]> {
    const inventory = await this.getAllInventoryItems()
    return getLowStockItems(inventory)
  }

  async checkProductionFeasibility(recipeId: string, batchSize: number): Promise<{
    feasible: boolean
    missingIngredients: Array<{ name: string; required: number; available: number; unit: string }>
    warnings: string[]
  }> {
    try {
      const recipe = await this.getRecipeById(recipeId)
      if (!recipe) {
        throw new Error('Recipe not found')
      }

      const inventory = await this.getAllInventoryItems()
      const missingIngredients: Array<{ name: string; required: number; available: number; unit: string }> = []
      const warnings: string[] = []

      for (const ingredient of recipe.ingredients) {
        const inventoryItem = inventory.find(item => 
          item.name.toLowerCase() === ingredient.name.toLowerCase()
        )

        if (!inventoryItem) {
          missingIngredients.push({
            name: ingredient.name,
            required: ingredient.quantity * batchSize,
            available: 0,
            unit: ingredient.unit
          })
          continue
        }

        const requiredQuantity = ingredient.quantity * batchSize
        const availableQuantity = inventoryItem.currentStock

        // Convert units for comparison
        let requiredInInventoryUnit = requiredQuantity
        let availableInRequiredUnit = availableQuantity

        if (ingredient.unit === 'g' && inventoryItem.unit === 'kg') {
          requiredInInventoryUnit = requiredQuantity / 1000
        } else if (ingredient.unit === 'kg' && inventoryItem.unit === 'g') {
          availableInRequiredUnit = availableQuantity * 1000
        }

        if (availableInRequiredUnit < requiredInInventoryUnit) {
          missingIngredients.push({
            name: ingredient.name,
            required: requiredQuantity,
            available: availableQuantity,
            unit: ingredient.unit
          })
        } else if (availableInRequiredUnit < requiredInInventoryUnit * 1.2) {
          warnings.push(`${ingredient.name} is close to minimum stock level`)
        }
      }

      return {
        feasible: missingIngredients.length === 0,
        missingIngredients,
        warnings
      }
    } catch (error) {
      console.error('Error checking production feasibility:', error)
      throw error
    }
  }

  // Seed all gin recipes into the database
  async seedAllGinRecipes(): Promise<{ recipesCreated: number; itemsCreated: number }> {
    try {
      let recipesCreated = 0
      let itemsCreated = 0

      // First, ensure all inventory items exist
      for (const item of MASTER_INVENTORY) {
        try {
          const { error } = await this.supabase
            .from('items')
            .upsert([{
              id: item.id,
              name: item.name,
              category: item.category,
              default_uom: item.unit,
              min_threshold: item.minThreshold,
              max_threshold: item.maxThreshold,
              price_per_unit: item.pricePerUnit,
              supplier: item.supplier,
              notes: item.notes,
              is_alcohol: item.category === 'spirit'
            }], { onConflict: 'id' })

          if (!error) itemsCreated++
        } catch (error) {
          console.warn(`Failed to create item ${item.name}:`, error)
        }
      }

      // Then create all recipes
      for (const recipe of GIN_RECIPES) {
        try {
          await this.createRecipe(recipe)
          recipesCreated++
        } catch (error) {
          console.warn(`Failed to create recipe ${recipe.name}:`, error)
        }
      }

      return { recipesCreated, itemsCreated }
    } catch (error) {
      console.error('Error seeding gin recipes:', error)
      throw error
    }
  }
}
