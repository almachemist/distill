import { createClient } from '@/lib/supabase/client'
import { 
  Recipe, 
  Ingredient, 
  InventoryItem, 
  ProductionBatch, 
  StockTransaction,
  GIN_RECIPES,
  MASTER_INVENTORY,
  calculateRecipeCost,
  getLowStockItems,
  updateInventoryAfterProduction
} from '../types/comprehensive-recipe.types'

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
      return data.map(recipe => ({
        id: recipe.id,
        name: recipe.name,
        description: recipe.description,
        abv: recipe.abv,
        batchVolume: recipe.batch_volume,
        ingredients: recipe.recipe_ingredients.map((ri: any) => ({
          id: ri.item_id,
          name: ri.items.name,
          quantity: ri.qty_per_batch,
          unit: ri.items.default_uom,
          pricePerKg: ri.items.price_per_kg || 0,
          pricePerBatch: (ri.qty_per_batch * (ri.items.price_per_kg || 0)) / 1000, // Convert g to kg
          category: ri.items.category,
          supplier: ri.items.supplier,
          notes: ri.items.notes
        })),
        totalCost: calculateRecipeCost(recipe.recipe_ingredients.map((ri: any) => ({
          id: ri.item_id,
          name: ri.items.name,
          quantity: ri.qty_per_batch,
          unit: ri.items.default_uom,
          pricePerKg: ri.items.price_per_kg || 0,
          pricePerBatch: (ri.qty_per_batch * (ri.items.price_per_kg || 0)) / 1000,
          category: ri.items.category,
          supplier: ri.items.supplier,
          notes: ri.items.notes
        }))),
        productionTime: recipe.production_time || 24,
        difficulty: recipe.difficulty || 'medium',
        category: recipe.category || 'traditional',
        createdAt: new Date(recipe.created_at),
        updatedAt: new Date(recipe.updated_at),
        isActive: recipe.is_active,
        notes: recipe.notes
      }))
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

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        abv: data.abv,
        batchVolume: data.batch_volume,
        ingredients: data.recipe_ingredients.map((ri: any) => ({
          id: ri.item_id,
          name: ri.items.name,
          quantity: ri.qty_per_batch,
          unit: ri.items.default_uom,
          pricePerKg: ri.items.price_per_kg || 0,
          pricePerBatch: (ri.qty_per_batch * (ri.items.price_per_kg || 0)) / 1000,
          category: ri.items.category,
          supplier: ri.items.supplier,
          notes: ri.items.notes
        })),
        totalCost: calculateRecipeCost(data.recipe_ingredients.map((ri: any) => ({
          id: ri.item_id,
          name: ri.items.name,
          quantity: ri.qty_per_batch,
          unit: ri.items.default_uom,
          pricePerKg: ri.items.price_per_kg || 0,
          pricePerBatch: (ri.qty_per_batch * (ri.items.price_per_kg || 0)) / 1000,
          category: ri.items.category,
          supplier: ri.items.supplier,
          notes: ri.items.notes
        }))),
        productionTime: data.production_time || 24,
        difficulty: data.difficulty || 'medium',
        category: data.category || 'traditional',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        isActive: data.is_active,
        notes: data.notes
      }
    } catch (error) {
      console.error('Error fetching recipe:', error)
      return GIN_RECIPES.find(r => r.id === recipeId) || null
    }
  }

  async createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recipe> {
    try {
      let organizationId: string
      
      if (process.env.NODE_ENV === 'development') {
        organizationId = '00000000-0000-0000-0000-000000000001'
      } else {
        const { data: profile } = await this.supabase
          .from('profiles')
          .select('organization_id')
          .single()

        if (!profile?.organization_id) {
          throw new Error('User organization not found')
        }
        organizationId = profile.organization_id
      }

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
        data.map(async (item) => {
          const stockLevel = await this.getCurrentStock(item.id)
          return {
            id: item.id,
            name: item.name,
            category: item.category,
            currentStock: stockLevel,
            unit: item.default_uom,
            minThreshold: item.min_threshold || 0,
            maxThreshold: item.max_threshold || 1000,
            pricePerUnit: item.price_per_unit || 0,
            supplier: item.supplier,
            lastUpdated: new Date(item.updated_at),
            notes: item.notes
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
      data.forEach(txn => {
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
      })

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
      let organizationId: string
      
      if (process.env.NODE_ENV === 'development') {
        organizationId = '00000000-0000-0000-0000-000000000001'
      } else {
        const { data: profile } = await this.supabase
          .from('profiles')
          .select('organization_id')
          .single()

        if (!profile?.organization_id) {
          throw new Error('User organization not found')
        }
        organizationId = profile.organization_id
      }

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
      let organizationId: string
      
      if (process.env.NODE_ENV === 'development') {
        organizationId = '00000000-0000-0000-0000-000000000001'
      } else {
        const { data: profile } = await this.supabase
          .from('profiles')
          .select('organization_id')
          .single()

        if (!profile?.organization_id) {
          throw new Error('User organization not found')
        }
        organizationId = profile.organization_id
      }

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

      return data.map(txn => ({
        id: txn.id,
        itemId: txn.item_id,
        itemName: txn.items.name,
        type: txn.txn_type.toLowerCase() as 'receive' | 'consume' | 'adjust' | 'transfer',
        quantity: txn.qty,
        unit: txn.uom,
        reason: txn.note,
        batchId: txn.batch_id,
        date: new Date(txn.dt),
        userId: txn.user_id || 'system',
        notes: txn.note
      }))
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
