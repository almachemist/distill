import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from "firebase/firestore"
import { db } from '@/lib/firebase/config' // You'll need to set this up
import { 
  FirestoreInventoryItem, 
  FirestoreRecipe, 
  FirestoreIngredient,
  FIRESTORE_INVENTORY,
  FIRESTORE_RECIPES,
  updateInventoryQuantity,
  consumeIngredientsForProduction,
  getLowStockItems,
  calculateRecipeCost
} from '../types/firestore-recipe.types'

export class FirestoreRecipeService {
  private inventoryCollection = 'inventory'
  private recipesCollection = 'recipes'
  private productionCollection = 'production_batches'

  // Inventory Management
  async getAllInventoryItems(): Promise<FirestoreInventoryItem[]> {
    try {
      const inventoryRef = collection(db, this.inventoryCollection)
      const snapshot = await getDocs(inventoryRef)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FirestoreInventoryItem))
    } catch (error) {
      console.error('Error fetching inventory:', error)
      // Return mock data if Firestore fails
      return FIRESTORE_INVENTORY
    }
  }

  async getInventoryItem(itemId: string): Promise<FirestoreInventoryItem | null> {
    try {
      const itemRef = doc(db, this.inventoryCollection, itemId)
      const itemSnap = await getDoc(itemRef)
      
      if (itemSnap.exists()) {
        return {
          id: itemSnap.id,
          ...itemSnap.data()
        } as FirestoreInventoryItem
      }
      
      return null
    } catch (error) {
      console.error('Error fetching inventory item:', error)
      return null
    }
  }

  async updateInventoryItem(itemId: string, updates: Partial<FirestoreInventoryItem>): Promise<void> {
    try {
      const itemRef = doc(db, this.inventoryCollection, itemId)
      await updateDoc(itemRef, {
        ...updates,
        lastUpdated: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating inventory item:', error)
      throw error
    }
  }

  async updateInventoryQuantity(itemId: string, newQuantity: number): Promise<void> {
    try {
      const itemRef = doc(db, this.inventoryCollection, itemId)
      await updateDoc(itemRef, {
        quantity: newQuantity,
        lastUpdated: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating inventory quantity:', error)
      throw error
    }
  }

  async seedInventory(): Promise<void> {
    try {
      const batch = []
      
      for (const item of FIRESTORE_INVENTORY) {
        const itemRef = doc(db, this.inventoryCollection, item.id)
        batch.push(setDoc(itemRef, item))
      }
      
      await Promise.all(batch)
      console.log('Inventory seeded successfully')
    } catch (error) {
      console.error('Error seeding inventory:', error)
      throw error
    }
  }

  // Recipe Management
  async getAllRecipes(): Promise<FirestoreRecipe[]> {
    try {
      const recipesRef = collection(db, this.recipesCollection)
      const q = query(recipesRef, where('isActive', '==', true), orderBy('name'))
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FirestoreRecipe))
    } catch (error) {
      console.error('Error fetching recipes:', error)
      // Return mock data if Firestore fails
      return FIRESTORE_RECIPES
    }
  }

  async getRecipe(recipeId: string): Promise<FirestoreRecipe | null> {
    try {
      const recipeRef = doc(db, this.recipesCollection, recipeId)
      const recipeSnap = await getDoc(recipeRef)
      
      if (recipeSnap.exists()) {
        return {
          id: recipeSnap.id,
          ...recipeSnap.data()
        } as FirestoreRecipe
      }
      
      return null
    } catch (error) {
      console.error('Error fetching recipe:', error)
      return null
    }
  }

  async createRecipe(recipe: Omit<FirestoreRecipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const recipesRef = collection(db, this.recipesCollection)
      const docRef = await addDoc(recipesRef, {
        ...recipe,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      
      return docRef.id
    } catch (error) {
      console.error('Error creating recipe:', error)
      throw error
    }
  }

  async updateRecipe(recipeId: string, updates: Partial<FirestoreRecipe>): Promise<void> {
    try {
      const recipeRef = doc(db, this.recipesCollection, recipeId)
      await updateDoc(recipeRef, {
        ...updates,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating recipe:', error)
      throw error
    }
  }

  async seedRecipes(): Promise<void> {
    try {
      const batch = []
      
      for (const recipe of FIRESTORE_RECIPES) {
        const recipeRef = doc(db, this.recipesCollection, recipe.id)
        batch.push(setDoc(recipeRef, recipe))
      }
      
      await Promise.all(batch)
      console.log('Recipes seeded successfully')
    } catch (error) {
      console.error('Error seeding recipes:', error)
      throw error
    }
  }

  // Production Management
  async createProductionBatch(batchData: {
    recipeId: string
    recipeName: string
    batchNumber: string
    targetVolume: number
    ingredients: FirestoreIngredient[]
    notes?: string
  }): Promise<string> {
    try {
      const batchesRef = collection(db, this.productionCollection)
      const docRef = await addDoc(batchesRef, {
        ...batchData,
        status: 'in_progress',
        startDate: Timestamp.now(),
        totalCost: calculateRecipeCost(batchData.ingredients),
        createdAt: Timestamp.now()
      })
      
      return docRef.id
    } catch (error) {
      console.error('Error creating production batch:', error)
      throw error
    }
  }

  async executeProductionBatch(batchId: string): Promise<void> {
    try {
      // Get the batch
      const batchRef = doc(db, this.productionCollection, batchId)
      const batchSnap = await getDoc(batchRef)
      
      if (!batchSnap.exists()) {
        throw new Error('Production batch not found')
      }
      
      const batch = batchSnap.data()
      
      // Update inventory by consuming ingredients
      const inventory = await this.getAllInventoryItems()
      const updatedInventory = consumeIngredientsForProduction(inventory, batch.ingredients)
      
      // Update all inventory items
      const updatePromises = updatedInventory.map(item => 
        this.updateInventoryQuantity(item.id, item.quantity)
      )
      
      await Promise.all(updatePromises)
      
      // Update batch status
      await updateDoc(batchRef, {
        status: 'completed',
        endDate: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      
      console.log(`Production batch ${batchId} completed successfully`)
    } catch (error) {
      console.error('Error executing production batch:', error)
      throw error
    }
  }

  // Utility Methods
  async getLowStockItems(): Promise<FirestoreInventoryItem[]> {
    const inventory = await this.getAllInventoryItems()
    return getLowStockItems(inventory)
  }

  async checkProductionFeasibility(recipeId: string): Promise<{
    feasible: boolean
    missingIngredients: Array<{ name: string; required: number; available: number; unit: string }>
    warnings: string[]
  }> {
    try {
      const recipe = await this.getRecipe(recipeId)
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
            required: ingredient.quantity,
            available: 0,
            unit: ingredient.unit
          })
          continue
        }

        const requiredQuantity = ingredient.quantity
        const availableQuantity = inventoryItem.quantity

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

  // Complete system initialization
  async initializeSystem(): Promise<{ inventorySeeded: boolean; recipesSeeded: boolean }> {
    try {
      await this.seedInventory()
      await this.seedRecipes()
      
      return {
        inventorySeeded: true,
        recipesSeeded: true
      }
    } catch (error) {
      console.error('Error initializing system:', error)
      throw error
    }
  }
}
