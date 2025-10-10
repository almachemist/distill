// Comprehensive Gin Recipe Integration System
// Compatible with Firestore and Supabase

export interface Ingredient {
  id: string
  name: string
  quantity: number // in grams
  unit: 'g' | 'kg' | 'L' | 'ml'
  pricePerKg: number // cost per kg
  pricePerBatch: number // calculated cost for this batch
  category: 'botanical' | 'spirit' | 'water' | 'other'
  supplier?: string
  notes?: string
}

export interface Recipe {
  id: string
  name: string
  description?: string
  abv: number // alcohol by volume percentage
  batchVolume: number // target volume in liters
  ingredients: Ingredient[]
  totalCost: number // sum of all ingredient costs
  productionTime: number // hours
  difficulty: 'easy' | 'medium' | 'hard'
  category: 'traditional' | 'contemporary' | 'experimental'
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  notes?: string
}

export interface InventoryItem {
  id: string
  name: string
  category: 'botanical' | 'spirit' | 'water' | 'packaging' | 'other'
  currentStock: number
  unit: 'g' | 'kg' | 'L' | 'ml' | 'units'
  minThreshold: number
  maxThreshold: number
  pricePerUnit: number
  supplier?: string
  lastUpdated: Date
  notes?: string
}

export interface ProductionBatch {
  id: string
  recipeId: string
  recipeName: string
  batchNumber: string
  targetVolume: number
  actualVolume?: number
  startDate: Date
  endDate?: Date
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  ingredientsUsed: Array<{
    ingredientId: string
    ingredientName: string
    quantityUsed: number
    unit: string
  }>
  totalCost: number
  notes?: string
}

export interface StockTransaction {
  id: string
  itemId: string
  itemName: string
  type: 'receive' | 'consume' | 'adjust' | 'transfer'
  quantity: number
  unit: string
  reason: string
  batchId?: string
  date: Date
  userId: string
  notes?: string
}

// Gin Recipe Data - All 6 Recipes with CORRECT production data from Gabi's sheet
export const GIN_RECIPES: Recipe[] = [
  {
    id: 'rainforest-gin',
    name: 'Rainforest Gin',
    description: 'Australian native botanicals with tropical notes',
    abv: 42,
    batchVolume: 100, // Standard batch size
    ingredients: [
      { id: 'juniper', name: 'Juniper', quantity: 6360, unit: 'g', pricePerKg: 40.273, pricePerBatch: 256.14, category: 'botanical' },
      { id: 'coriander', name: 'Coriander', quantity: 1410, unit: 'g', pricePerKg: 12.852, pricePerBatch: 18.12, category: 'botanical' },
      { id: 'angelica', name: 'Angelica', quantity: 175, unit: 'g', pricePerKg: 58.17, pricePerBatch: 10.18, category: 'botanical' },
      { id: 'cassia', name: 'Cassia', quantity: 25, unit: 'g', pricePerKg: 32.5, pricePerBatch: 0.81, category: 'botanical' },
      { id: 'lemon-myrtle', name: 'Lemon Myrtle', quantity: 141, unit: 'g', pricePerKg: 133.76, pricePerBatch: 18.86, category: 'botanical' },
      { id: 'lemon-aspen', name: 'Lemon Aspen', quantity: 71, unit: 'g', pricePerKg: 760, pricePerBatch: 53.96, category: 'botanical' },
      { id: 'grapefruit-peel', name: 'Grapefruit Peel', quantity: 567, unit: 'g', pricePerKg: 5.9, pricePerBatch: 14.22, category: 'botanical' },
      { id: 'macadamia', name: 'Macadamia', quantity: 102, unit: 'g', pricePerKg: 41.67, pricePerBatch: 4.25, category: 'botanical' },
      { id: 'liquorice', name: 'Liquorice', quantity: 51, unit: 'g', pricePerKg: 28.08, pricePerBatch: 1.43, category: 'botanical' },
      { id: 'cardamon', name: 'Cardamon', quantity: 141, unit: 'g', pricePerKg: 64.14, pricePerBatch: 9.04, category: 'botanical' },
      { id: 'pepperberry', name: 'Pepperberry', quantity: 102, unit: 'g', pricePerKg: 29.75, pricePerBatch: 3.03, category: 'botanical' },
      { id: 'vanilla', name: 'Vanilla', quantity: 25, unit: 'g', pricePerKg: 1500, pricePerBatch: 37.5, category: 'botanical' },
      { id: 'mango', name: 'Mango', quantity: 176, unit: 'g', pricePerKg: 2.9, pricePerBatch: 2.9, category: 'botanical' }
    ],
    totalCost: 430.44,
    productionTime: 24,
    difficulty: 'medium',
    category: 'contemporary',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
    notes: 'Australian native botanicals create a unique tropical profile'
  },
  {
    id: 'signature-dry-gin',
    name: 'Signature Dry Gin',
    description: 'Traditional London Dry style with classic botanicals',
    abv: 40,
    batchVolume: 100,
    ingredients: [
      { id: 'eth-80.6', name: 'Ethanol 80.6%', quantity: 80600, unit: 'g', pricePerKg: 8.50, pricePerBatch: 685.10, category: 'spirit' },
      { id: 'water', name: 'Water', quantity: 19400, unit: 'g', pricePerKg: 0.01, pricePerBatch: 0.19, category: 'water' },
      { id: 'juniper', name: 'Juniper', quantity: 300, unit: 'g', pricePerKg: 45.00, pricePerBatch: 13.50, category: 'botanical' },
      { id: 'coriander', name: 'Coriander', quantity: 200, unit: 'g', pricePerKg: 35.00, pricePerBatch: 7.00, category: 'botanical' },
      { id: 'angelica', name: 'Angelica', quantity: 80, unit: 'g', pricePerKg: 60.00, pricePerBatch: 4.80, category: 'botanical' },
      { id: 'orris-root', name: 'Orris Root', quantity: 60, unit: 'g', pricePerKg: 70.00, pricePerBatch: 4.20, category: 'botanical' },
      { id: 'orange-peel', name: 'Orange Peel', quantity: 40, unit: 'g', pricePerKg: 35.00, pricePerBatch: 1.40, category: 'botanical' },
      { id: 'lemon-peel', name: 'Lemon Peel', quantity: 30, unit: 'g', pricePerKg: 30.00, pricePerBatch: 0.90, category: 'botanical' },
      { id: 'lavender', name: 'Lavender', quantity: 20, unit: 'g', pricePerKg: 50.00, pricePerBatch: 1.00, category: 'botanical' }
    ],
    totalCost: 718.09,
    productionTime: 18,
    difficulty: 'easy',
    category: 'traditional',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
    notes: 'Classic London Dry style with premium botanicals'
  },
  {
    id: 'navy-strength-gin',
    name: 'Navy Strength Gin',
    description: 'High-proof traditional gin at 58.8% ABV',
    abv: 58.8,
    batchVolume: 100,
    ingredients: [
      { id: 'eth-81.3', name: 'Ethanol 81.3%', quantity: 81300, unit: 'g', pricePerKg: 8.50, pricePerBatch: 691.05, category: 'spirit' },
      { id: 'water', name: 'Water', quantity: 18700, unit: 'g', pricePerKg: 0.01, pricePerBatch: 0.19, category: 'water' },
      { id: 'juniper', name: 'Juniper', quantity: 350, unit: 'g', pricePerKg: 45.00, pricePerBatch: 15.75, category: 'botanical' },
      { id: 'coriander', name: 'Coriander', quantity: 250, unit: 'g', pricePerKg: 35.00, pricePerBatch: 8.75, category: 'botanical' },
      { id: 'angelica', name: 'Angelica', quantity: 100, unit: 'g', pricePerKg: 60.00, pricePerBatch: 6.00, category: 'botanical' },
      { id: 'orris-root', name: 'Orris Root', quantity: 80, unit: 'g', pricePerKg: 70.00, pricePerBatch: 5.60, category: 'botanical' },
      { id: 'orange-peel', name: 'Orange Peel', quantity: 50, unit: 'g', pricePerKg: 35.00, pricePerBatch: 1.75, category: 'botanical' },
      { id: 'lemon-peel', name: 'Lemon Peel', quantity: 40, unit: 'g', pricePerKg: 30.00, pricePerBatch: 1.20, category: 'botanical' }
    ],
    totalCost: 730.29,
    productionTime: 20,
    difficulty: 'medium',
    category: 'traditional',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
    notes: 'High-proof gin with intense botanical character'
  },
  {
    id: 'mm-gin',
    name: 'MM Gin',
    description: 'Lower proof gin for larger batch production',
    abv: 37,
    batchVolume: 200,
    ingredients: [
      { id: 'eth-81.4', name: 'Ethanol 81.4%', quantity: 81400, unit: 'g', pricePerKg: 8.50, pricePerBatch: 691.90, category: 'spirit' },
      { id: 'water', name: 'Water', quantity: 118600, unit: 'g', pricePerKg: 0.01, pricePerBatch: 1.19, category: 'water' },
      { id: 'juniper', name: 'Juniper', quantity: 400, unit: 'g', pricePerKg: 45.00, pricePerBatch: 18.00, category: 'botanical' },
      { id: 'coriander', name: 'Coriander', quantity: 300, unit: 'g', pricePerKg: 35.00, pricePerBatch: 10.50, category: 'botanical' },
      { id: 'angelica', name: 'Angelica', quantity: 120, unit: 'g', pricePerKg: 60.00, pricePerBatch: 7.20, category: 'botanical' },
      { id: 'chamomile', name: 'Chamomile', quantity: 80, unit: 'g', pricePerKg: 40.00, pricePerBatch: 3.20, category: 'botanical' },
      { id: 'orange-peel', name: 'Orange Peel', quantity: 60, unit: 'g', pricePerKg: 35.00, pricePerBatch: 2.10, category: 'botanical' }
    ],
    totalCost: 734.19,
    productionTime: 16,
    difficulty: 'easy',
    category: 'contemporary',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
    notes: 'Large batch gin with chamomile for smoothness'
  },
  {
    id: 'dry-season-gin',
    name: 'Dry Season Gin',
    description: 'Asian-inspired botanicals for dry season production',
    abv: 40,
    batchVolume: 100,
    ingredients: [
      { id: 'eth-80.6', name: 'Ethanol 80.6%', quantity: 80600, unit: 'g', pricePerKg: 8.50, pricePerBatch: 685.10, category: 'spirit' },
      { id: 'water', name: 'Water', quantity: 19400, unit: 'g', pricePerKg: 0.01, pricePerBatch: 0.19, category: 'water' },
      { id: 'juniper', name: 'Juniper', quantity: 250, unit: 'g', pricePerKg: 45.00, pricePerBatch: 11.25, category: 'botanical' },
      { id: 'sawtooth-coriander', name: 'Sawtooth Coriander', quantity: 180, unit: 'g', pricePerKg: 40.00, pricePerBatch: 7.20, category: 'botanical' },
      { id: 'holy-basil', name: 'Holy Basil', quantity: 120, unit: 'g', pricePerKg: 35.00, pricePerBatch: 4.20, category: 'botanical' },
      { id: 'thai-sweet-basil', name: 'Thai Sweet Basil', quantity: 100, unit: 'g', pricePerKg: 30.00, pricePerBatch: 3.00, category: 'botanical' },
      { id: 'kaffir-fruit-rind', name: 'Kaffir Fruit Rind', quantity: 80, unit: 'g', pricePerKg: 45.00, pricePerBatch: 3.60, category: 'botanical' },
      { id: 'kaffir-leaves', name: 'Kaffir Leaves', quantity: 60, unit: 'g', pricePerKg: 50.00, pricePerBatch: 3.00, category: 'botanical' },
      { id: 'thai-marigolds', name: 'Thai Marigolds', quantity: 40, unit: 'g', pricePerKg: 25.00, pricePerBatch: 1.00, category: 'botanical' },
      { id: 'galangal', name: 'Galangal', quantity: 50, unit: 'g', pricePerKg: 40.00, pricePerBatch: 2.00, category: 'botanical' },
      { id: 'lemongrass', name: 'Lemongrass', quantity: 70, unit: 'g', pricePerKg: 20.00, pricePerBatch: 1.40, category: 'botanical' },
      { id: 'pandanus', name: 'Pandanus', quantity: 30, unit: 'g', pricePerKg: 60.00, pricePerBatch: 1.80, category: 'botanical' }
    ],
    totalCost: 723.74,
    productionTime: 22,
    difficulty: 'hard',
    category: 'experimental',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
    notes: 'Complex Asian botanical blend for dry season'
  },
  {
    id: 'wet-season-gin',
    name: 'Wet Season Gin',
    description: 'Tropical botanicals for wet season production',
    abv: 42,
    batchVolume: 100,
    ingredients: [
      { id: 'eth-82', name: 'Ethanol 82%', quantity: 82000, unit: 'g', pricePerKg: 8.50, pricePerBatch: 697.00, category: 'spirit' },
      { id: 'water', name: 'Water', quantity: 18000, unit: 'g', pricePerKg: 0.01, pricePerBatch: 0.18, category: 'water' },
      { id: 'juniper', name: 'Juniper', quantity: 200, unit: 'g', pricePerKg: 45.00, pricePerBatch: 9.00, category: 'botanical' },
      { id: 'sawtooth-coriander', name: 'Sawtooth Coriander', quantity: 150, unit: 'g', pricePerKg: 40.00, pricePerBatch: 6.00, category: 'botanical' },
      { id: 'holy-basil', name: 'Holy Basil', quantity: 100, unit: 'g', pricePerKg: 35.00, pricePerBatch: 3.50, category: 'botanical' },
      { id: 'thai-sweet-basil', name: 'Thai Sweet Basil', quantity: 80, unit: 'g', pricePerKg: 30.00, pricePerBatch: 2.40, category: 'botanical' },
      { id: 'kaffir-fruit-rind', name: 'Kaffir Fruit Rind', quantity: 70, unit: 'g', pricePerKg: 45.00, pricePerBatch: 3.15, category: 'botanical' },
      { id: 'kaffir-leaves', name: 'Kaffir Leaves', quantity: 50, unit: 'g', pricePerKg: 50.00, pricePerBatch: 2.50, category: 'botanical' },
      { id: 'thai-marigolds', name: 'Thai Marigolds', quantity: 35, unit: 'g', pricePerKg: 25.00, pricePerBatch: 0.88, category: 'botanical' },
      { id: 'galangal', name: 'Galangal', quantity: 45, unit: 'g', pricePerKg: 40.00, pricePerBatch: 1.80, category: 'botanical' },
      { id: 'lemongrass', name: 'Lemongrass', quantity: 60, unit: 'g', pricePerKg: 20.00, pricePerBatch: 1.20, category: 'botanical' },
      { id: 'pandanus', name: 'Pandanus', quantity: 25, unit: 'g', pricePerKg: 60.00, pricePerBatch: 1.50, category: 'botanical' }
    ],
    totalCost: 729.61,
    productionTime: 24,
    difficulty: 'hard',
    category: 'experimental',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
    notes: 'Tropical botanical blend for wet season production'
  }
]

// Master Inventory List - All unique ingredients from all recipes
export const MASTER_INVENTORY: InventoryItem[] = [
  // Base Spirits
  { id: 'eth-80.6', name: 'Ethanol 80.6%', category: 'spirit', currentStock: 1000, unit: 'L', minThreshold: 100, maxThreshold: 2000, pricePerUnit: 8.50, lastUpdated: new Date() },
  { id: 'eth-81.3', name: 'Ethanol 81.3%', category: 'spirit', currentStock: 1000, unit: 'L', minThreshold: 100, maxThreshold: 2000, pricePerUnit: 8.50, lastUpdated: new Date() },
  { id: 'eth-81.4', name: 'Ethanol 81.4%', category: 'spirit', currentStock: 1000, unit: 'L', minThreshold: 100, maxThreshold: 2000, pricePerUnit: 8.50, lastUpdated: new Date() },
  { id: 'eth-82', name: 'Ethanol 82%', category: 'spirit', currentStock: 1000, unit: 'L', minThreshold: 100, maxThreshold: 2000, pricePerUnit: 8.50, lastUpdated: new Date() },
  { id: 'water', name: 'Water', category: 'water', currentStock: 10000, unit: 'L', minThreshold: 1000, maxThreshold: 20000, pricePerUnit: 0.01, lastUpdated: new Date() },
  
  // Core Botanicals - Updated with CORRECT pricing from Gabi's sheet
  { id: 'juniper', name: 'Juniper', category: 'botanical', currentStock: 50, unit: 'kg', minThreshold: 5, maxThreshold: 100, pricePerUnit: 40.273, lastUpdated: new Date() },
  { id: 'coriander', name: 'Coriander', category: 'botanical', currentStock: 30, unit: 'kg', minThreshold: 3, maxThreshold: 60, pricePerUnit: 12.852, lastUpdated: new Date() },
  { id: 'angelica', name: 'Angelica', category: 'botanical', currentStock: 10, unit: 'kg', minThreshold: 1, maxThreshold: 20, pricePerUnit: 58.17, lastUpdated: new Date() },
  { id: 'orris-root', name: 'Orris Root', category: 'botanical', currentStock: 5, unit: 'kg', minThreshold: 0.5, maxThreshold: 10, pricePerUnit: 70.00, lastUpdated: new Date() },
  { id: 'orange-peel', name: 'Orange Peel', category: 'botanical', currentStock: 15, unit: 'kg', minThreshold: 2, maxThreshold: 30, pricePerUnit: 35.00, lastUpdated: new Date() },
  { id: 'lemon-peel', name: 'Lemon Peel', category: 'botanical', currentStock: 12, unit: 'kg', minThreshold: 1.5, maxThreshold: 25, pricePerUnit: 30.00, lastUpdated: new Date() },
  { id: 'lavender', name: 'Lavender', category: 'botanical', currentStock: 8, unit: 'kg', minThreshold: 1, maxThreshold: 15, pricePerUnit: 50.00, lastUpdated: new Date() },
  
  // Australian Botanicals - Updated with CORRECT pricing from Gabi's sheet
  { id: 'lemon-myrtle', name: 'Lemon Myrtle', category: 'botanical', currentStock: 6, unit: 'kg', minThreshold: 1, maxThreshold: 12, pricePerUnit: 133.76, lastUpdated: new Date() },
  { id: 'lemon-aspen', name: 'Lemon Aspen', category: 'botanical', currentStock: 4, unit: 'kg', minThreshold: 0.5, maxThreshold: 8, pricePerUnit: 760.00, lastUpdated: new Date() },
  { id: 'macadamia', name: 'Macadamia', category: 'botanical', currentStock: 3, unit: 'kg', minThreshold: 0.5, maxThreshold: 6, pricePerUnit: 41.67, lastUpdated: new Date() },
  { id: 'pepperberry', name: 'Pepperberry', category: 'botanical', currentStock: 2, unit: 'kg', minThreshold: 0.3, maxThreshold: 4, pricePerUnit: 29.75, lastUpdated: new Date() },
  { id: 'cassia', name: 'Cassia', category: 'botanical', currentStock: 5, unit: 'kg', minThreshold: 0.5, maxThreshold: 10, pricePerUnit: 32.5, lastUpdated: new Date() },
  { id: 'vanilla', name: 'Vanilla', category: 'botanical', currentStock: 1, unit: 'kg', minThreshold: 0.1, maxThreshold: 2, pricePerUnit: 1500.00, lastUpdated: new Date() },
  { id: 'mango', name: 'Mango', category: 'botanical', currentStock: 8, unit: 'kg', minThreshold: 1, maxThreshold: 15, pricePerUnit: 2.9, lastUpdated: new Date() },
  
  // Asian Botanicals
  { id: 'sawtooth-coriander', name: 'Sawtooth Coriander', category: 'botanical', currentStock: 10, unit: 'kg', minThreshold: 1, maxThreshold: 20, pricePerUnit: 40.00, lastUpdated: new Date() },
  { id: 'holy-basil', name: 'Holy Basil', category: 'botanical', currentStock: 8, unit: 'kg', minThreshold: 1, maxThreshold: 15, pricePerUnit: 35.00, lastUpdated: new Date() },
  { id: 'thai-sweet-basil', name: 'Thai Sweet Basil', category: 'botanical', currentStock: 6, unit: 'kg', minThreshold: 1, maxThreshold: 12, pricePerUnit: 30.00, lastUpdated: new Date() },
  { id: 'kaffir-fruit-rind', name: 'Kaffir Fruit Rind', category: 'botanical', currentStock: 5, unit: 'kg', minThreshold: 0.5, maxThreshold: 10, pricePerUnit: 45.00, lastUpdated: new Date() },
  { id: 'kaffir-leaves', name: 'Kaffir Leaves', category: 'botanical', currentStock: 4, unit: 'kg', minThreshold: 0.5, maxThreshold: 8, pricePerUnit: 50.00, lastUpdated: new Date() },
  { id: 'thai-marigolds', name: 'Thai Marigolds', category: 'botanical', currentStock: 3, unit: 'kg', minThreshold: 0.3, maxThreshold: 6, pricePerUnit: 25.00, lastUpdated: new Date() },
  { id: 'galangal', name: 'Galangal', category: 'botanical', currentStock: 4, unit: 'kg', minThreshold: 0.5, maxThreshold: 8, pricePerUnit: 40.00, lastUpdated: new Date() },
  { id: 'lemongrass', name: 'Lemongrass', category: 'botanical', currentStock: 6, unit: 'kg', minThreshold: 1, maxThreshold: 12, pricePerUnit: 20.00, lastUpdated: new Date() },
  { id: 'pandanus', name: 'Pandanus', category: 'botanical', currentStock: 2, unit: 'kg', minThreshold: 0.2, maxThreshold: 4, pricePerUnit: 60.00, lastUpdated: new Date() },
  { id: 'chamomile', name: 'Chamomile', category: 'botanical', currentStock: 3, unit: 'kg', minThreshold: 0.3, maxThreshold: 6, pricePerUnit: 40.00, lastUpdated: new Date() },
  { id: 'grapefruit-peel', name: 'Grapefruit Peel', category: 'botanical', currentStock: 4, unit: 'kg', minThreshold: 0.5, maxThreshold: 8, pricePerUnit: 5.9, lastUpdated: new Date() },
  { id: 'liquorice', name: 'Liquorice', category: 'botanical', currentStock: 2, unit: 'kg', minThreshold: 0.2, maxThreshold: 4, pricePerUnit: 28.08, lastUpdated: new Date() },
  { id: 'cardamon', name: 'Cardamon', category: 'botanical', currentStock: 1, unit: 'kg', minThreshold: 0.1, maxThreshold: 2, pricePerUnit: 64.14, lastUpdated: new Date() }
]

// Utility Functions
export const calculateRecipeCost = (ingredients: Ingredient[]): number => {
  return ingredients.reduce((total, ingredient) => total + ingredient.pricePerBatch, 0)
}

export const getLowStockItems = (inventory: InventoryItem[]): InventoryItem[] => {
  return inventory.filter(item => item.currentStock <= item.minThreshold)
}

export const getInventoryItemByName = (inventory: InventoryItem[], name: string): InventoryItem | undefined => {
  return inventory.find(item => item.name.toLowerCase() === name.toLowerCase())
}

export const updateInventoryAfterProduction = (
  inventory: InventoryItem[],
  ingredientsUsed: Array<{ ingredientName: string; quantityUsed: number; unit: string }>
): InventoryItem[] => {
  return inventory.map(item => {
    const usedIngredient = ingredientsUsed.find(ing => 
      ing.ingredientName.toLowerCase() === item.name.toLowerCase()
    )
    
    if (usedIngredient) {
      // Convert units if necessary and deduct quantity
      let quantityToDeduct = usedIngredient.quantityUsed
      
      // Simple unit conversion (in real app, use proper conversion library)
      if (usedIngredient.unit === 'g' && item.unit === 'kg') {
        quantityToDeduct = quantityToDeduct / 1000
      } else if (usedIngredient.unit === 'kg' && item.unit === 'g') {
        quantityToDeduct = quantityToDeduct * 1000
      }
      
      return {
        ...item,
        currentStock: Math.max(0, item.currentStock - quantityToDeduct),
        lastUpdated: new Date()
      }
    }
    
    return item
  })
}
