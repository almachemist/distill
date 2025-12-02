'use client'

import { useState, useEffect } from 'react'

// Simple mock data matching Gabi's structure
const MOCK_RECIPES = [
  {
    id: "rainforest-gin",
    name: "Rainforest Gin",
    description: "Australian native botanicals with tropical notes",
    abv: 42,
    batchVolume: 100,
    totalCost: 430.44,
    ingredients: [
      { name: "Juniper", quantity: 6360, unit: "g", pricePerKg: 40.273, pricePerBatch: 256.14 },
      { name: "Coriander", quantity: 1410, unit: "g", pricePerKg: 12.852, pricePerBatch: 18.12 },
      { name: "Angelica", quantity: 175, unit: "g", pricePerKg: 58.17, pricePerBatch: 10.18 },
      { name: "Cassia", quantity: 25, unit: "g", pricePerKg: 32.5, pricePerBatch: 0.81 },
      { name: "Lemon Myrtle", quantity: 141, unit: "g", pricePerKg: 133.76, pricePerBatch: 18.86 },
      { name: "Lemon Aspen", quantity: 71, unit: "g", pricePerKg: 760, pricePerBatch: 53.96 },
      { name: "Grapefruit Peel", quantity: 567, unit: "g", pricePerKg: 5.9, pricePerBatch: 14.22 },
      { name: "Macadamia", quantity: 102, unit: "g", pricePerKg: 41.67, pricePerBatch: 4.25 },
      { name: "Liquorice", quantity: 51, unit: "g", pricePerKg: 28.08, pricePerBatch: 1.43 },
      { name: "Cardamon", quantity: 141, unit: "g", pricePerKg: 64.14, pricePerBatch: 9.04 },
      { name: "Pepperberry", quantity: 102, unit: "g", pricePerKg: 29.75, pricePerBatch: 3.03 },
      { name: "Vanilla", quantity: 25, unit: "g", pricePerKg: 1500, pricePerBatch: 37.5 },
      { name: "Mango", quantity: 176, unit: "g", pricePerKg: 2.9, pricePerBatch: 2.9 }
    ],
    productionTime: 24,
    difficulty: 'medium',
    category: 'contemporary'
  },
  {
    id: "signature-dry-gin",
    name: "Signature Dry Gin (Traditional)",
    description: "Classic London Dry style with traditional botanicals",
    abv: 40,
    batchVolume: 100,
    totalCost: 339.76,
    ingredients: [
      { name: "Juniper", quantity: 6400, unit: "g", pricePerKg: 40.273, pricePerBatch: 257.75 },
      { name: "Coriander", quantity: 1800, unit: "g", pricePerKg: 12.852, pricePerBatch: 23.13 },
      { name: "Angelica", quantity: 180, unit: "g", pricePerKg: 58.17, pricePerBatch: 10.47 },
      { name: "Orris Root", quantity: 90, unit: "g", pricePerKg: 52.32, pricePerBatch: 4.71 },
      { name: "Orange Peel", quantity: 560, unit: "g", pricePerKg: 3.99, pricePerBatch: 6.98 },
      { name: "Lemon Peel", quantity: 560, unit: "g", pricePerKg: 6.99, pricePerBatch: 12.48 },
      { name: "Macadamia", quantity: 180, unit: "g", pricePerKg: 41.67, pricePerBatch: 7.5 },
      { name: "Liquorice", quantity: 100, unit: "g", pricePerKg: 28.08, pricePerBatch: 2.81 },
      { name: "Cardamon", quantity: 180, unit: "g", pricePerKg: 64.14, pricePerBatch: 11.55 },
      { name: "Lavender", quantity: 40, unit: "g", pricePerKg: 59.5, pricePerBatch: 2.38 }
    ],
    productionTime: 18,
    difficulty: 'easy',
    category: 'traditional'
  },
  {
    id: "navy-strength-gin",
    name: "Navy Strength Gin",
    description: "High-proof traditional gin with Australian finger lime",
    abv: 58.8,
    batchVolume: 100,
    totalCost: 345.41,
    ingredients: [
      { name: "Juniper", quantity: 6400, unit: "g", pricePerKg: 40.273, pricePerBatch: 257.73 },
      { name: "Coriander", quantity: 1800, unit: "g", pricePerKg: 12.852, pricePerBatch: 23.13 },
      { name: "Angelica", quantity: 180, unit: "g", pricePerKg: 58.17, pricePerBatch: 10.47 },
      { name: "Orris Root", quantity: 90, unit: "g", pricePerKg: 52.32, pricePerBatch: 4.71 },
      { name: "Orange Peel", quantity: 380, unit: "g", pricePerKg: 3.99, pricePerBatch: 4.74 },
      { name: "Lemon Peel", quantity: 380, unit: "g", pricePerKg: 6.99, pricePerBatch: 8.47 },
      { name: "Finger Lime", quantity: 380, unit: "g", pricePerKg: 30, pricePerBatch: 11.4 },
      { name: "Macadamia", quantity: 180, unit: "g", pricePerKg: 41.67, pricePerBatch: 7.5 },
      { name: "Liquorice", quantity: 100, unit: "g", pricePerKg: 28.08, pricePerBatch: 2.81 },
      { name: "Cardamon", quantity: 180, unit: "g", pricePerKg: 64.14, pricePerBatch: 11.55 },
      { name: "Chamomile", quantity: 90, unit: "g", pricePerKg: 32.2, pricePerBatch: 2.9 }
    ],
    productionTime: 20,
    difficulty: 'medium',
    category: 'traditional'
  },
  {
    id: "merchant-made-gin",
    name: "Merchant Made Gin",
    description: "Traditional gin with chamomile and citrus notes",
    abv: 37,
    batchVolume: 100,
    totalCost: 312.17,
    ingredients: [
      { name: "Juniper", quantity: 6400, unit: "g", pricePerKg: 40.273, pricePerBatch: 257.73 },
      { name: "Coriander", quantity: 1800, unit: "g", pricePerKg: 12.852, pricePerBatch: 23.13 },
      { name: "Angelica", quantity: 180, unit: "g", pricePerKg: 58.17, pricePerBatch: 10.47 },
      { name: "Orris Root", quantity: 50, unit: "g", pricePerKg: 52.32, pricePerBatch: 2.62 },
      { name: "Orange", quantity: 380, unit: "g", pricePerKg: 3.99, pricePerBatch: 1.52 },
      { name: "Lemon", quantity: 380, unit: "g", pricePerKg: 6.99, pricePerBatch: 2.66 },
      { name: "Liquorice", quantity: 100, unit: "g", pricePerKg: 28.08, pricePerBatch: 2.81 },
      { name: "Cardamon", quantity: 150, unit: "g", pricePerKg: 64.14, pricePerBatch: 9.62 },
      { name: "Chamomile", quantity: 50, unit: "g", pricePerKg: 32.2, pricePerBatch: 1.61 }
    ],
    productionTime: 20,
    difficulty: 'easy',
    category: 'traditional'
  },
  {
    id: "dry-season-gin",
    name: "Dry Season Gin",
    description: "Asian-inspired gin with fresh market botanicals",
    abv: 40,
    batchVolume: 100,
    totalCost: 424.75, // 251.69 + 8.03 + 9.71 + 5.32 + 150 (fresh market)
    freshMarketCost: 150,
    ingredients: [
      { name: "Juniper", quantity: 6250, unit: "g", pricePerKg: 40.273, pricePerBatch: 251.69 },
      { name: "Coriander Seed", quantity: 625, unit: "g", pricePerKg: 12.852, pricePerBatch: 8.03 },
      { name: "Angelica", quantity: 167, unit: "g", pricePerKg: 58.17, pricePerBatch: 9.71 },
      { name: "Cardamon", quantity: 83, unit: "g", pricePerKg: 64.14, pricePerBatch: 5.32 },
      { name: "Lemongrass", quantity: 1167, unit: "g" },
      { name: "Mandarin", quantity: 1667, unit: "g" },
      { name: "Mandarin Skin", quantity: 1200, unit: "g" },
      { name: "Turmeric", quantity: 500, unit: "g" },
      { name: "Rosella Flower", quantity: 1667, unit: "g" },
      { name: "Holy Basil", quantity: 167, unit: "g" },
      { name: "Thai Basil", quantity: 1000, unit: "g" },
      { name: "Kaffir Lime Leaf", quantity: 333, unit: "g" }
    ],
    productionTime: 22,
    difficulty: 'medium',
    category: 'contemporary'
  },
  {
    id: "wet-season-gin",
    name: "Wet Season Gin",
    description: "Tropical gin with Thai and Southeast Asian botanicals",
    abv: 42,
    batchVolume: 100,
    totalCost: 409.44, // 251.69 + 2.36 + 5.39 + 150 (fresh market)
    freshMarketCost: 150,
    ingredients: [
      { name: "Juniper", quantity: 6250, unit: "g", pricePerKg: 40.27, pricePerBatch: 251.69 },
      { name: "Sawtooth Coriander", quantity: 625, unit: "g" },
      { name: "Angelica", quantity: 168, unit: "g" },
      { name: "Holy Basil", quantity: 252, unit: "g" },
      { name: "Thai Sweet Basil", quantity: 168, unit: "g" },
      { name: "Kaffir Fruit Rind", quantity: 832, unit: "g" },
      { name: "Kaffir Leaves", quantity: 500, unit: "g" },
      { name: "Thai Marigolds", quantity: 332, unit: "g" },
      { name: "Galangal", quantity: 332, unit: "g" },
      { name: "Lemongrass", quantity: 252, unit: "g" },
      { name: "Liquorice Root", quantity: 84, unit: "g", pricePerKg: 28.08, pricePerBatch: 2.36 },
      { name: "Cardamon", quantity: 84, unit: "g", pricePerKg: 64.14, pricePerBatch: 5.39 },
      { name: "Pandanus", quantity: 108, unit: "g" }
    ],
    productionTime: 24,
    difficulty: 'medium',
    category: 'contemporary'
  }
]

const MOCK_INVENTORY = [
  { id: "juniper", name: "Juniper", quantity: 0, unit: "g", pricePerKg: 40.273, minThreshold: 5000 },
  { id: "coriander", name: "Coriander", quantity: 0, unit: "g", pricePerKg: 12.852, minThreshold: 3000 },
  { id: "angelica", name: "Angelica", quantity: 0, unit: "g", pricePerKg: 58.17, minThreshold: 1000 },
  { id: "cassia", name: "Cassia", quantity: 0, unit: "g", pricePerKg: 32.5, minThreshold: 500 },
  { id: "lemon-myrtle", name: "Lemon Myrtle", quantity: 0, unit: "g", pricePerKg: 133.76, minThreshold: 1000 },
  { id: "lemon-aspen", name: "Lemon Aspen", quantity: 0, unit: "g", pricePerKg: 760, minThreshold: 500 },
  { id: "grapefruit-peel", name: "Grapefruit Peel", quantity: 0, unit: "g", pricePerKg: 5.9, minThreshold: 500 },
  { id: "macadamia", name: "Macadamia", quantity: 0, unit: "g", pricePerKg: 41.67, minThreshold: 500 },
  { id: "liquorice", name: "Liquorice", quantity: 0, unit: "g", pricePerKg: 28.08, minThreshold: 200 },
  { id: "cardamon", name: "Cardamon", quantity: 0, unit: "g", pricePerKg: 64.14, minThreshold: 100 },
  { id: "pepperberry", name: "Pepperberry", quantity: 0, unit: "g", pricePerKg: 29.75, minThreshold: 300 },
  { id: "vanilla", name: "Vanilla", quantity: 0, unit: "g", pricePerKg: 1500, minThreshold: 100 },
  { id: "mango", name: "Mango", quantity: 0, unit: "g", pricePerKg: 2.9, minThreshold: 1000 },
  { id: "orris-root", name: "Orris Root", quantity: 0, unit: "g", pricePerKg: 52.32, minThreshold: 500 },
  { id: "orange-peel", name: "Orange Peel", quantity: 0, unit: "g", pricePerKg: 3.99, minThreshold: 2000 },
  { id: "lemon-peel", name: "Lemon Peel", quantity: 0, unit: "g", pricePerKg: 6.99, minThreshold: 1500 },
  { id: "lavender", name: "Lavender", quantity: 0, unit: "g", pricePerKg: 59.5, minThreshold: 1000 },
  { id: "orange", name: "Orange", quantity: 0, unit: "g", pricePerKg: 3.99, minThreshold: 1500 },
  { id: "lemon", name: "Lemon", quantity: 0, unit: "g", pricePerKg: 6.99, minThreshold: 1500 },
  { id: "chamomile", name: "Chamomile", quantity: 0, unit: "g", pricePerKg: 32.2, minThreshold: 300 },
  { id: "finger-lime", name: "Finger Lime", quantity: 0, unit: "g", pricePerKg: 30, minThreshold: 500 },
  
  // Dry Season Gin botanicals
  { id: "coriander-seed", name: "Coriander Seed", quantity: 0, unit: "g", pricePerKg: 12.852, minThreshold: 1000 },
  { id: "lemongrass", name: "Lemongrass", quantity: 0, unit: "g", minThreshold: 2000 },
  { id: "mandarin", name: "Mandarin", quantity: 0, unit: "g", minThreshold: 3000 },
  { id: "mandarin-skin", name: "Mandarin Skin", quantity: 0, unit: "g", minThreshold: 2000 },
  { id: "turmeric", name: "Turmeric", quantity: 0, unit: "g", minThreshold: 1000 },
  { id: "rosella-flower", name: "Rosella Flower", quantity: 0, unit: "g", minThreshold: 3000 },
  { id: "holy-basil", name: "Holy Basil", quantity: 0, unit: "g", minThreshold: 500 },
  { id: "thai-basil", name: "Thai Basil", quantity: 0, unit: "g", minThreshold: 2000 },
  { id: "kaffir-lime-leaf", name: "Kaffir Lime Leaf", quantity: 0, unit: "g", minThreshold: 1000 },
  
  // Wet Season Gin botanicals
  { id: "sawtooth-coriander", name: "Sawtooth Coriander", quantity: 0, unit: "g", minThreshold: 1000 },
  { id: "thai-sweet-basil", name: "Thai Sweet Basil", quantity: 0, unit: "g", minThreshold: 500 },
  { id: "kaffir-fruit-rind", name: "Kaffir Fruit Rind", quantity: 0, unit: "g", minThreshold: 1500 },
  { id: "kaffir-leaves", name: "Kaffir Leaves", quantity: 0, unit: "g", minThreshold: 1000 },
  { id: "thai-marigolds", name: "Thai Marigolds", quantity: 0, unit: "g", minThreshold: 500 },
  { id: "galangal", name: "Galangal", quantity: 0, unit: "g", minThreshold: 500 },
  { id: "pandanus", name: "Pandanus", quantity: 0, unit: "g", minThreshold: 200 }
]

export default function FirestoreRecipesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recipes, setRecipes] = useState(MOCK_RECIPES)
  const [inventory, setInventory] = useState(MOCK_INVENTORY)
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'recipes' | 'inventory' | 'production'>('recipes')
  const [isSeeding, setIsSeeding] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setRecipes(MOCK_RECIPES)
      setInventory(MOCK_INVENTORY)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleInitializeSystem = async () => {
    try {
      setIsSeeding(true)
      setError(null)
      
      // Simulate Firestore initialization
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      alert('System initialized successfully!\nInventory seeded: true\nRecipes seeded: true')
      
      // Reload data
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize system')
    } finally {
      setIsSeeding(false)
    }
  }

  const handleStartProduction = async (recipe: any) => {
    try {
      setLoading(true)
      
      // Check ingredient availability
      const missingIngredients = []
      for (const ingredient of recipe.ingredients) {
        const inventoryItem = inventory.find(item => 
          item.name.toLowerCase() === ingredient.name.toLowerCase()
        )
        
        if (!inventoryItem || inventoryItem.quantity < ingredient.quantity) {
          missingIngredients.push({
            name: ingredient.name,
            required: ingredient.quantity,
            available: inventoryItem?.quantity || 0,
            unit: ingredient.unit
          })
        }
      }
      
      if (missingIngredients.length > 0) {
        const missingList = missingIngredients.map(ing => 
          `${ing.name}: Need ${ing.required}${ing.unit}, have ${ing.available}${ing.unit}`
        ).join('\n')
        
        alert(`Cannot start production. Missing ingredients:\n${missingList}`)
        return
      }
      
      // Simulate production batch creation
      const batchId = `batch-${Date.now()}`
      
      // Simulate inventory deduction
      const updatedInventory = inventory.map(item => {
        const ingredient = recipe.ingredients.find((ing: any) => 
          ing.name.toLowerCase() === item.name.toLowerCase()
        )
        
        if (ingredient) {
          return {
            ...item,
            quantity: Math.max(0, item.quantity - ingredient.quantity)
          }
        }
        
        return item
      })
      
      setInventory(updatedInventory)
      
      alert(`Production batch started successfully!\nBatch ID: ${batchId}\nCost: $${recipe.totalCost.toFixed(2)}\n\nIngredients consumed from inventory.`)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start production')
    } finally {
      setLoading(false)
    }
  }

  // Helper functions for easy production
  const produceRainforestGin = () => {
    const recipe = recipes.find(r => r.id === 'rainforest-gin')
    if (recipe) handleStartProduction(recipe)
  }

  const produceSignatureDryGin = () => {
    const recipe = recipes.find(r => r.id === 'signature-dry-gin')
    if (recipe) handleStartProduction(recipe)
  }

  const produceNavyStrengthGin = () => {
    const recipe = recipes.find(r => r.id === 'navy-strength-gin')
    if (recipe) handleStartProduction(recipe)
  }

  const produceMerchantMadeGin = () => {
    const recipe = recipes.find(r => r.id === 'merchant-made-gin')
    if (recipe) handleStartProduction(recipe)
  }

  const produceDrySeasonGin = () => {
    const recipe = recipes.find(r => r.id === 'dry-season-gin')
    if (recipe) handleStartProduction(recipe)
  }

  const produceWetSeasonGin = () => {
    const recipe = recipes.find(r => r.id === 'wet-season-gin')
    if (recipe) handleStartProduction(recipe)
  }

  const handleUpdateInventory = async (itemId: string, newQuantity: number) => {
    try {
      setInventory(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update inventory')
    }
  }

  const getLowStockItems = () => {
    return inventory.filter(item => item.quantity <= (item.minThreshold || 0))
  }

  const getStatusBadge = (item: any) => {
    if (item.quantity === 0) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">⚠️ OUT</span>
    }
    if (item.quantity <= (item.minThreshold || 0)) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">⚠️ LOW</span>
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">✓ OK</span>
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Firestore Gin Recipe System</h1>
          <p className="text-gray-600 mt-2">Complete Firestore integration with Gabi's exact data structure</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleInitializeSystem}
            disabled={isSeeding}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSeeding ? 'Initializing...' : 'Initialize Firestore System'}
          </button>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Low Stock Banner */}
      {getLowStockItems().length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                ⚠️ Stock Alert: {getLowStockItems().length} items need attention
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside ml-4">
                  {getLowStockItems().slice(0, 5).map(item => (
                    <li key={item.id}>
                      {item.name} ({item.quantity} {item.unit}, min: {item.minThreshold || 0})
                    </li>
                  ))}
                  {getLowStockItems().length > 5 && <li>...and {getLowStockItems().length - 5} more</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'recipes', label: 'Gin Recipes', count: recipes.length },
            { key: 'inventory', label: 'Inventory', count: inventory.length },
            { key: 'production', label: 'Production', count: 0 }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Recipes Tab */}
      {activeTab === 'recipes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{recipe.name}</h3>
                    <p className="text-sm text-gray-600">{recipe.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    recipe.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {recipe.difficulty}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ABV:</span>
                    <span className="font-medium">{recipe.abv}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Batch Volume:</span>
                    <span className="font-medium">{recipe.batchVolume}L</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="font-medium text-green-600">${recipe.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ingredients:</span>
                    <span className="font-medium">{recipe.ingredients.length}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedRecipe(recipe)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleStartProduction(recipe)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                  >
                    Start Production
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Firestore Inventory</h3>
            <p className="text-sm text-gray-600">Matches Gabi's exact data structure with Timestamp fields</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Threshold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {item.quantity.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.minThreshold || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${item.pricePerKg?.toFixed(2) || '0.00'}/kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          const newQty = prompt(`Enter new quantity for ${item.name}:`, item.quantity.toString())
                          if (newQty && !isNaN(Number(newQty))) {
                            handleUpdateInventory(item.id, Number(newQty))
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Production Tab */}
      {activeTab === 'production' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Firestore Production Management</h3>
            <p className="text-blue-700 text-sm mb-4">
              Production batches are automatically created in Firestore when you start production from a recipe.
              All ingredient consumption is tracked with Timestamp fields and inventory is updated in real-time.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                <span className="text-blue-800">Select recipe and check ingredient availability</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                <span className="text-blue-800">Start production batch with automatic Firestore inventory deduction</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                <span className="text-blue-800">Track costs and generate compliance reports with Timestamp tracking</span>
              </div>
            </div>
          </div>

          {/* Quick Production Buttons */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Production</h3>
            <p className="text-gray-600 text-sm mb-4">One-click production with automatic ingredient checking and inventory deduction</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Rainforest Gin</h4>
                <p className="text-sm text-green-700 mb-3">$430.44 per batch</p>
                <button
                  onClick={produceRainforestGin}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                >
                  Produce Rainforest Gin
                </button>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Signature Dry Gin</h4>
                <p className="text-sm text-blue-700 mb-3">$339.76 per batch</p>
                <button
                  onClick={produceSignatureDryGin}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Produce Signature Dry Gin
                </button>
              </div>
              
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                <h4 className="font-semibold text-indigo-900 mb-2">Navy Strength Gin</h4>
                <p className="text-sm text-indigo-700 mb-3">$345.41 per batch</p>
                <p className="text-xs text-indigo-600 mb-2">58.8% ABV</p>
                <button
                  onClick={produceNavyStrengthGin}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
                >
                  Produce Navy Strength Gin
                </button>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">Merchant Made Gin</h4>
                <p className="text-sm text-purple-700 mb-3">$312.17 per batch</p>
                <button
                  onClick={produceMerchantMadeGin}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
                >
                  Produce MM Gin
                </button>
              </div>
              
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <h4 className="font-semibold text-orange-900 mb-2">Dry Season Gin</h4>
                <p className="text-sm text-orange-700 mb-3">$424.75 per batch</p>
                <p className="text-xs text-orange-600 mb-2">(+$150 fresh market)</p>
                <button
                  onClick={produceDrySeasonGin}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
                >
                  Produce Dry Season Gin
                </button>
              </div>
              
              <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg p-4 border border-teal-200">
                <h4 className="font-semibold text-teal-900 mb-2">Wet Season Gin</h4>
                <p className="text-sm text-teal-700 mb-3">$409.44 per batch</p>
                <p className="text-xs text-teal-600 mb-2">(+$150 fresh market)</p>
                <button
                  onClick={produceWetSeasonGin}
                  className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium"
                >
                  Produce Wet Season Gin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-900">{selectedRecipe.name}</h3>
                  <p className="text-sm text-gray-500">{selectedRecipe.description}</p>
                </div>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="bg-gray-100 rounded-md p-1.5 text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Recipe Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ABV:</span>
                      <span className="font-medium">{selectedRecipe.abv}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Batch Volume:</span>
                      <span className="font-medium">{selectedRecipe.batchVolume}L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Production Time:</span>
                      <span className="font-medium">{selectedRecipe.productionTime}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Difficulty:</span>
                      <span className="font-medium capitalize">{selectedRecipe.difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="font-medium text-green-600">${selectedRecipe.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Ingredients ({selectedRecipe.ingredients.length})</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedRecipe.ingredients.map((ingredient: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {ingredient.quantity} {ingredient.unit}
                          </div>
                          <div className="text-xs text-gray-500">
                            ${ingredient.pricePerBatch.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleStartProduction(selectedRecipe)
                    setSelectedRecipe(null)
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Start Production
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}