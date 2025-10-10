'use client'

import { useState, useEffect } from 'react'
import { ComprehensiveRecipeService } from '@/modules/recipes/services/comprehensive-recipe.service'
import { Recipe, InventoryItem, ProductionBatch } from '@/modules/recipes/types/comprehensive-recipe.types'

export default function ComprehensiveRecipesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [activeTab, setActiveTab] = useState<'recipes' | 'inventory' | 'production'>('recipes')
  const [isSeeding, setIsSeeding] = useState(false)

  const recipeService = new ComprehensiveRecipeService()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [recipesData, inventoryData] = await Promise.all([
        recipeService.getAllRecipes(),
        recipeService.getAllInventoryItems()
      ])
      
      setRecipes(recipesData)
      setInventory(inventoryData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSeedAllRecipes = async () => {
    try {
      setIsSeeding(true)
      setError(null)
      
      const result = await recipeService.seedAllGinRecipes()
      
      alert(`Recipes seeded successfully!\nRecipes created: ${result.recipesCreated}\nItems created: ${result.itemsCreated}`)
      
      // Reload data
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed recipes')
    } finally {
      setIsSeeding(false)
    }
  }

  const handleStartProduction = async (recipe: Recipe) => {
    try {
      setLoading(true)
      
      // Check production feasibility
      const feasibility = await recipeService.checkProductionFeasibility(recipe.id, 1)
      
      if (!feasibility.feasible) {
        alert(`Cannot start production. Missing ingredients:\n${feasibility.missingIngredients.map(ing => 
          `${ing.name}: Need ${ing.required}${ing.unit}, have ${ing.available}${ing.unit}`
        ).join('\n')}`)
        return
      }

      if (feasibility.warnings.length > 0) {
        const proceed = confirm(`Warnings:\n${feasibility.warnings.join('\n')}\n\nProceed anyway?`)
        if (!proceed) return
      }

      // Create production batch
      const batch: Omit<ProductionBatch, 'id'> = {
        recipeId: recipe.id,
        recipeName: recipe.name,
        batchNumber: `${recipe.name}-${Date.now()}`,
        targetVolume: recipe.batchVolume,
        startDate: new Date(),
        status: 'in_progress',
        ingredientsUsed: recipe.ingredients.map(ing => ({
          ingredientId: ing.id,
          ingredientName: ing.name,
          quantityUsed: ing.quantity,
          unit: ing.unit
        })),
        totalCost: recipe.totalCost,
        notes: `Production batch for ${recipe.name}`
      }

      const createdBatch = await recipeService.createProductionBatch(batch)
      
      // Execute the batch (consume ingredients)
      await recipeService.executeProductionBatch(createdBatch.id, batch.ingredientsUsed)
      
      alert(`Production batch started successfully!\nBatch ID: ${createdBatch.id}\nCost: $${recipe.totalCost.toFixed(2)}`)
      
      // Reload inventory to reflect changes
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start production')
    } finally {
      setLoading(false)
    }
  }

  const getLowStockItems = () => {
    return inventory.filter(item => item.currentStock <= item.minThreshold)
  }

  const getStatusBadge = (item: InventoryItem) => {
    if (item.currentStock === 0) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">⚠️ OUT</span>
    }
    if (item.currentStock <= item.minThreshold) {
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
          <h1 className="text-3xl font-bold text-gray-900">Comprehensive Gin Recipe System</h1>
          <p className="text-gray-600 mt-2">Complete integration of all 6 gin recipes with inventory management</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSeedAllRecipes}
            disabled={isSeeding}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSeeding ? 'Seeding...' : 'Seed All Gin Recipes'}
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
                      {item.name} ({item.currentStock} {item.unit}, min: {item.minThreshold})
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
            <h3 className="text-lg font-medium text-gray-900">Complete Inventory</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min/Max</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {item.currentStock.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.minThreshold}/{item.maxThreshold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${item.pricePerUnit.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item)}
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Production Management</h3>
          <p className="text-blue-700 text-sm mb-4">
            Production batches are automatically created when you start production from a recipe.
            All ingredient consumption is tracked and inventory is updated in real-time.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
              <span className="text-blue-800">Select recipe and check ingredient availability</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
              <span className="text-blue-800">Start production batch with automatic inventory deduction</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
              <span className="text-blue-800">Track costs and generate compliance reports</span>
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
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{ingredient.category}</div>
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
