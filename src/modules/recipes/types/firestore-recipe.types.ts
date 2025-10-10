import { Timestamp } from "firebase/firestore"

// Firestore-compatible inventory structure matching Gabi's data
export interface FirestoreInventoryItem {
  id: string
  name: string
  quantity: number
  unit: 'g' | 'kg' | 'L' | 'ml' | 'units'
  lastUpdated: Timestamp
  category?: 'botanical' | 'spirit' | 'water' | 'packaging' | 'other'
  pricePerKg?: number
  minThreshold?: number
  maxThreshold?: number
  supplier?: string
  notes?: string
}

// Firestore-compatible recipe structure
export interface FirestoreRecipe {
  id: string
  name: string
  description?: string
  abv: number
  batchVolume: number
  totalCost: number
  ingredients: FirestoreIngredient[]
  productionTime?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  category?: 'traditional' | 'contemporary' | 'experimental'
  createdAt: Timestamp
  updatedAt: Timestamp
  isActive: boolean
  notes?: string
}

export interface FirestoreIngredient {
  name: string
  quantity: number
  unit: 'g' | 'kg' | 'L' | 'ml'
  pricePerKg: number
  pricePerBatch: number
  category?: 'botanical' | 'spirit' | 'water' | 'other'
  supplier?: string
  notes?: string
}

// Complete inventory matching Gabi's Firestore structure
export const FIRESTORE_INVENTORY: FirestoreInventoryItem[] = [
  { id: "juniper", name: "Juniper", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 40.273, minThreshold: 5000, maxThreshold: 100000 },
  { id: "coriander", name: "Coriander", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 12.852, minThreshold: 3000, maxThreshold: 60000 },
  { id: "angelica", name: "Angelica", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 58.17, minThreshold: 1000, maxThreshold: 20000 },
  { id: "cassia", name: "Cassia", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 32.5, minThreshold: 500, maxThreshold: 10000 },
  { id: "lemon-myrtle", name: "Lemon Myrtle", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 133.76, minThreshold: 1000, maxThreshold: 12000 },
  { id: "lemon-aspen", name: "Lemon Aspen", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 760, minThreshold: 500, maxThreshold: 8000 },
  { id: "grapefruit-peel", name: "Grapefruit Peel", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 5.9, minThreshold: 500, maxThreshold: 8000 },
  { id: "macadamia", name: "Macadamia", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 41.67, minThreshold: 500, maxThreshold: 6000 },
  { id: "liquorice", name: "Liquorice", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 28.08, minThreshold: 200, maxThreshold: 4000 },
  { id: "cardamon", name: "Cardamon", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 64.14, minThreshold: 100, maxThreshold: 2000 },
  { id: "pepperberry", name: "Pepperberry", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 29.75, minThreshold: 300, maxThreshold: 4000 },
  { id: "vanilla", name: "Vanilla", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 1500, minThreshold: 100, maxThreshold: 2000 },
  { id: "mango", name: "Mango", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 2.9, minThreshold: 1000, maxThreshold: 15000 },
  
  // Additional botanicals for other recipes
  { id: "orris-root", name: "Orris Root", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 52.32, minThreshold: 500, maxThreshold: 10000 },
  { id: "orange-peel", name: "Orange Peel", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 3.99, minThreshold: 2000, maxThreshold: 30000 },
  { id: "lemon-peel", name: "Lemon Peel", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 6.99, minThreshold: 1500, maxThreshold: 25000 },
  { id: "lavender", name: "Lavender", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 59.5, minThreshold: 1000, maxThreshold: 15000 },
  { id: "chamomile", name: "Chamomile", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 40, minThreshold: 300, maxThreshold: 6000 },
  
  // Asian botanicals
  { id: "sawtooth-coriander", name: "Sawtooth Coriander", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 40, minThreshold: 1000, maxThreshold: 20000 },
  { id: "holy-basil", name: "Holy Basil", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 35, minThreshold: 1000, maxThreshold: 15000 },
  { id: "thai-sweet-basil", name: "Thai Sweet Basil", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 30, minThreshold: 1000, maxThreshold: 12000 },
  { id: "kaffir-fruit-rind", name: "Kaffir Fruit Rind", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 45, minThreshold: 500, maxThreshold: 10000 },
  { id: "kaffir-leaves", name: "Kaffir Leaves", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 50, minThreshold: 500, maxThreshold: 8000 },
  { id: "thai-marigolds", name: "Thai Marigolds", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 25, minThreshold: 300, maxThreshold: 6000 },
  { id: "galangal", name: "Galangal", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 40, minThreshold: 500, maxThreshold: 8000 },
  { id: "lemongrass", name: "Lemongrass", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 20, minThreshold: 1000, maxThreshold: 12000 },
  { id: "pandanus", name: "Pandanus", quantity: 0, unit: "g", lastUpdated: Timestamp.now(), category: 'botanical', pricePerKg: 60, minThreshold: 200, maxThreshold: 4000 },
  
  // Base spirits and water
  { id: "ethanol-80.6", name: "Ethanol 80.6%", quantity: 0, unit: "L", lastUpdated: Timestamp.now(), category: 'spirit', pricePerKg: 8.50, minThreshold: 100, maxThreshold: 2000 },
  { id: "ethanol-81.3", name: "Ethanol 81.3%", quantity: 0, unit: "L", lastUpdated: Timestamp.now(), category: 'spirit', pricePerKg: 8.50, minThreshold: 100, maxThreshold: 2000 },
  { id: "ethanol-81.4", name: "Ethanol 81.4%", quantity: 0, unit: "L", lastUpdated: Timestamp.now(), category: 'spirit', pricePerKg: 8.50, minThreshold: 100, maxThreshold: 2000 },
  { id: "ethanol-82", name: "Ethanol 82%", quantity: 0, unit: "L", lastUpdated: Timestamp.now(), category: 'spirit', pricePerKg: 8.50, minThreshold: 100, maxThreshold: 2000 },
  { id: "water", name: "Water", quantity: 0, unit: "L", lastUpdated: Timestamp.now(), category: 'water', pricePerKg: 0.01, minThreshold: 1000, maxThreshold: 20000 },
  
  // Packaging materials
  { id: "bottle-700ml", name: "700ml Bottle", quantity: 0, unit: "units", lastUpdated: Timestamp.now(), category: 'packaging', pricePerKg: 0.50, minThreshold: 500, maxThreshold: 5000 },
  { id: "bottle-200ml", name: "200ml Bottle", quantity: 0, unit: "units", lastUpdated: Timestamp.now(), category: 'packaging', pricePerKg: 0.30, minThreshold: 200, maxThreshold: 2000 },
  { id: "cork", name: "Bottle Cork", quantity: 0, unit: "units", lastUpdated: Timestamp.now(), category: 'packaging', pricePerKg: 0.20, minThreshold: 1000, maxThreshold: 10000 },
  { id: "cap-screw", name: "Screw Cap", quantity: 0, unit: "units", lastUpdated: Timestamp.now(), category: 'packaging', pricePerKg: 0.15, minThreshold: 1000, maxThreshold: 10000 },
  { id: "label-front", name: "Front Label", quantity: 0, unit: "units", lastUpdated: Timestamp.now(), category: 'packaging', pricePerKg: 0.10, minThreshold: 2000, maxThreshold: 20000 },
  { id: "label-back", name: "Back Label", quantity: 0, unit: "units", lastUpdated: Timestamp.now(), category: 'packaging', pricePerKg: 0.10, minThreshold: 2000, maxThreshold: 20000 },
  { id: "gift-box", name: "Gift Box", quantity: 0, unit: "units", lastUpdated: Timestamp.now(), category: 'packaging', pricePerKg: 2.00, minThreshold: 200, maxThreshold: 2000 },
  { id: "carton-6pack", name: "6-Pack Carton", quantity: 0, unit: "units", lastUpdated: Timestamp.now(), category: 'packaging', pricePerKg: 1.50, minThreshold: 100, maxThreshold: 1000 }
]

// Complete Gin Recipes with CORRECT production data from Gabi's sheet
export const FIRESTORE_RECIPES: FirestoreRecipe[] = [
  {
    id: "rainforest-gin",
    name: "Rainforest Gin",
    description: "Australian native botanicals with tropical notes",
    abv: 42,
    batchVolume: 100,
    totalCost: 430.44,
    ingredients: [
      { name: "Juniper", quantity: 6360, unit: "g", pricePerKg: 40.273, pricePerBatch: 256.14, category: 'botanical' },
      { name: "Coriander", quantity: 1410, unit: "g", pricePerKg: 12.852, pricePerBatch: 18.12, category: 'botanical' },
      { name: "Angelica", quantity: 175, unit: "g", pricePerKg: 58.17, pricePerBatch: 10.18, category: 'botanical' },
      { name: "Cassia", quantity: 25, unit: "g", pricePerKg: 32.5, pricePerBatch: 0.81, category: 'botanical' },
      { name: "Lemon Myrtle", quantity: 141, unit: "g", pricePerKg: 133.76, pricePerBatch: 18.86, category: 'botanical' },
      { name: "Lemon Aspen", quantity: 71, unit: "g", pricePerKg: 760, pricePerBatch: 53.96, category: 'botanical' },
      { name: "Grapefruit Peel", quantity: 567, unit: "g", pricePerKg: 5.9, pricePerBatch: 14.22, category: 'botanical' },
      { name: "Macadamia", quantity: 102, unit: "g", pricePerKg: 41.67, pricePerBatch: 4.25, category: 'botanical' },
      { name: "Liquorice", quantity: 51, unit: "g", pricePerKg: 28.08, pricePerBatch: 1.43, category: 'botanical' },
      { name: "Cardamon", quantity: 141, unit: "g", pricePerKg: 64.14, pricePerBatch: 9.04, category: 'botanical' },
      { name: "Pepperberry", quantity: 102, unit: "g", pricePerKg: 29.75, pricePerBatch: 3.03, category: 'botanical' },
      { name: "Vanilla", quantity: 25, unit: "g", pricePerKg: 1500, pricePerBatch: 37.5, category: 'botanical' },
      { name: "Mango", quantity: 176, unit: "g", pricePerKg: 2.9, pricePerBatch: 2.9, category: 'botanical' }
    ],
    productionTime: 24,
    difficulty: 'medium',
    category: 'contemporary',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isActive: true,
    notes: "Australian native botanicals create a unique tropical profile"
  },
  {
    id: "signature-dry-gin",
    name: "Signature Dry Gin (Traditional)",
    description: "Classic London Dry style with traditional botanicals",
    abv: 40,
    batchVolume: 100,
    totalCost: 339.76,
    ingredients: [
      { name: "Juniper", quantity: 6400, unit: "g", pricePerKg: 40.273, pricePerBatch: 257.75, category: 'botanical' },
      { name: "Coriander", quantity: 1800, unit: "g", pricePerKg: 12.852, pricePerBatch: 23.13, category: 'botanical' },
      { name: "Angelica", quantity: 180, unit: "g", pricePerKg: 58.17, pricePerBatch: 10.47, category: 'botanical' },
      { name: "Orris Root", quantity: 90, unit: "g", pricePerKg: 52.32, pricePerBatch: 4.71, category: 'botanical' },
      { name: "Orange Peel", quantity: 560, unit: "g", pricePerKg: 3.99, pricePerBatch: 6.98, category: 'botanical' },
      { name: "Lemon Peel", quantity: 560, unit: "g", pricePerKg: 6.99, pricePerBatch: 12.48, category: 'botanical' },
      { name: "Macadamia", quantity: 180, unit: "g", pricePerKg: 41.67, pricePerBatch: 7.5, category: 'botanical' },
      { name: "Liquorice", quantity: 100, unit: "g", pricePerKg: 28.08, pricePerBatch: 2.81, category: 'botanical' },
      { name: "Cardamon", quantity: 180, unit: "g", pricePerKg: 64.14, pricePerBatch: 11.55, category: 'botanical' },
      { name: "Lavender", quantity: 40, unit: "g", pricePerKg: 59.5, pricePerBatch: 2.38, category: 'botanical' }
    ],
    productionTime: 18,
    difficulty: 'easy',
    category: 'traditional',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isActive: true,
    notes: "Classic London Dry style with traditional botanicals"
  }
]

// Utility functions for Firestore integration
export const updateInventoryQuantity = (inventory: FirestoreInventoryItem[], itemId: string, newQuantity: number): FirestoreInventoryItem[] => {
  return inventory.map(item => 
    item.id === itemId 
      ? { ...item, quantity: newQuantity, lastUpdated: Timestamp.now() }
      : item
  )
}

export const consumeIngredientsForProduction = (
  inventory: FirestoreInventoryItem[], 
  ingredients: FirestoreIngredient[]
): FirestoreInventoryItem[] => {
  return inventory.map(item => {
    const ingredient = ingredients.find(ing => ing.name.toLowerCase() === item.name.toLowerCase())
    
    if (ingredient) {
      // Convert units if necessary (g to g, kg to g, etc.)
      let quantityToConsume = ingredient.quantity
      
      if (ingredient.unit === 'kg' && item.unit === 'g') {
        quantityToConsume = ingredient.quantity * 1000
      } else if (ingredient.unit === 'g' && item.unit === 'kg') {
        quantityToConsume = ingredient.quantity / 1000
      }
      
      return {
        ...item,
        quantity: Math.max(0, item.quantity - quantityToConsume),
        lastUpdated: Timestamp.now()
      }
    }
    
    return item
  })
}

export const getLowStockItems = (inventory: FirestoreInventoryItem[]): FirestoreInventoryItem[] => {
  return inventory.filter(item => item.quantity <= (item.minThreshold || 0))
}

export const calculateRecipeCost = (ingredients: FirestoreIngredient[]): number => {
  return ingredients.reduce((total, ingredient) => total + ingredient.pricePerBatch, 0)
}

// Helper function for easy recipe production
export const produceRecipe = async (
  recipeId: string, 
  firestoreService: any, // FirestoreRecipeService instance
  batchVolume?: number
): Promise<{ success: boolean; batchId?: string; message: string }> => {
  try {
    // Get the recipe
    const recipe = FIRESTORE_RECIPES.find(r => r.id === recipeId)
    if (!recipe) {
      return { success: false, message: `Recipe ${recipeId} not found` }
    }

    // Check production feasibility
    const feasibility = await firestoreService.checkProductionFeasibility(recipeId)
    
    if (!feasibility.feasible) {
      const missingList = feasibility.missingIngredients.map(ing => 
        `${ing.name}: Need ${ing.required}${ing.unit}, have ${ing.available}${ing.unit}`
      ).join('\n')
      
      return { 
        success: false, 
        message: `Cannot start production. Missing ingredients:\n${missingList}` 
      }
    }

    if (feasibility.warnings.length > 0) {
      console.warn('Production warnings:', feasibility.warnings)
    }

    // Create production batch
    const targetVolume = batchVolume || recipe.batchVolume
    const batchId = await firestoreService.createProductionBatch({
      recipeId: recipe.id,
      recipeName: recipe.name,
      batchNumber: `${recipe.name}-${Date.now()}`,
      targetVolume: targetVolume,
      ingredients: recipe.ingredients,
      notes: `Production batch for ${recipe.name} (${targetVolume}L)`
    })

    // Execute the batch (consume ingredients)
    await firestoreService.executeProductionBatch(batchId)
    
    return { 
      success: true, 
      batchId, 
      message: `Production batch started successfully!\nBatch ID: ${batchId}\nCost: $${recipe.totalCost.toFixed(2)}` 
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Failed to start production: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Quick production functions for each recipe
export const produceRainforestGin = (firestoreService: any, batchVolume?: number) => 
  produceRecipe('rainforest-gin', firestoreService, batchVolume)

export const produceSignatureDryGin = (firestoreService: any, batchVolume?: number) => 
  produceRecipe('signature-dry-gin', firestoreService, batchVolume)

// Export for easy Firestore integration
export const FIRESTORE_COLLECTIONS = {
  inventory: FIRESTORE_INVENTORY,
  recipes: FIRESTORE_RECIPES
}
