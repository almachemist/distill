'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RecipeRepository } from '../services/recipe.repository'
import { InventorySeedService } from '../services/inventory-seed.service'
import { MasterInventorySeedService } from '../services/master-inventory-seed.service'
import { RainforestGinSeedService } from '../services/rainforest-gin-seed.service'
import { SignatureGinSeedService } from '../services/signature-gin-seed.service'
import { NavyGinSeedService } from '../services/navy-gin-seed.service'
import { MMGinSeedService } from '../services/mm-gin-seed.service'
import { DrySeasonGinSeedService } from '../services/dry-season-gin-seed.service'
import { WetSeasonGinSeedService } from '../services/wet-season-gin-seed.service'
import type { Recipe } from '../types/recipe.types'

interface RecipeCardProps {
  recipe: Recipe
  onView: () => void
  onStartBatch: () => void
}

function RecipeCard({ recipe, onView, onStartBatch }: RecipeCardProps) {
  // Extract baseline info from recipe name for display
  let targetAbv = '42%'
  let baselineL = '100L'
  
  if (recipe.name.includes('Rainforest')) {
    targetAbv = '42%'
    baselineL = '546L'
  } else if (recipe.name.includes('Signature')) {
    targetAbv = '42%'
    baselineL = '495L'
  } else if (recipe.name.includes('Navy')) {
    targetAbv = '58.9%'
    baselineL = '426L'
  } else if (recipe.name.includes('MM Gin')) {
    targetAbv = '37.5%'
    baselineL = '729L'
  } else if (recipe.name.includes('Dry Season')) {
    targetAbv = '40%'
    baselineL = '404L'
  } else if (recipe.name.includes('Wet Season')) {
    targetAbv = '42%'
    baselineL = '485L'
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
         onClick={onView}>
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
            {recipe.name}
          </h3>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {targetAbv} ABV
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {baselineL} baseline
            </span>
          </div>
        </div>

        {/* Description if available */}
        {recipe.description && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {recipe.description}
          </p>
        )}

        {/* Last updated */}
        <p className="text-xs text-gray-500">
          Updated {new Date(recipe.updated_at || recipe.created_at).toLocaleDateString()}
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onView()
            }}
            className="flex-1 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            View Recipe
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onStartBatch()
            }}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Batch
          </button>
        </div>
      </div>
    </div>
  )
}

export function RecipesList() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeveloperTools, setShowDeveloperTools] = useState(false)
  const [seeding, setSeeding] = useState(false)
  
  const router = useRouter()
  const recipeRepo = new RecipeRepository()
  const inventorySeedService = new InventorySeedService()
  const masterInventorySeedService = new MasterInventorySeedService()
  const rainforestGinSeedService = new RainforestGinSeedService()
  const signatureGinSeedService = new SignatureGinSeedService()
  const navyGinSeedService = new NavyGinSeedService()
  const mmGinSeedService = new MMGinSeedService()
  const drySeasonGinSeedService = new DrySeasonGinSeedService()
  const wetSeasonGinSeedService = new WetSeasonGinSeedService()

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    loadRecipes()
  }, [])

  const loadRecipes = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Loading recipes...')
      const data = await recipeRepo.fetchRecipes()
      console.log('Recipes loaded successfully:', data)
      setRecipes(data)
    } catch (err) {
      console.error('Error loading recipes:', err)
      setError(err instanceof Error ? err.message : 'Failed to load recipes')
    } finally {
      setLoading(false)
    }
  }

  const handleRecipeView = (recipe: Recipe) => {
    router.push(`/dashboard/recipes/${recipe.id}`)
  }

  const handleStartBatch = (recipe: Recipe) => {
    // Get baseline based on recipe name for pre-filling
    let baselineL = 100
    if (recipe.name.includes('Rainforest')) baselineL = 546
    else if (recipe.name.includes('Signature')) baselineL = 495
    else if (recipe.name.includes('Navy')) baselineL = 426
    else if (recipe.name.includes('MM Gin')) baselineL = 729
    else if (recipe.name.includes('Dry Season')) baselineL = 404
    else if (recipe.name.includes('Wet Season')) baselineL = 485

    const params = new URLSearchParams({
      recipeId: recipe.id,
      batchTargetL: baselineL.toString()
    })
    router.push(`/dashboard/production/start-batch?${params}`)
  }

  // Developer seed functions
  const seedMasterInventory = async () => {
    try {
      setSeeding(true)
      const results = await masterInventorySeedService.seedMasterInventory()
      alert(`Master inventory seeded successfully!\nItems: ${results.created} created, ${results.updated} updated`)
    } catch (err) {
      alert('Failed to seed master inventory: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSeeding(false)
    }
  }

  const seedInventoryData = async () => {
    try {
      setSeeding(true)
      const results = await inventorySeedService.seedInventoryData()
      alert(`Inventory seeded successfully!\nLots: ${results.lots} created\nTransactions: ${results.transactions} created`)
    } catch (err) {
      alert('Failed to seed inventory: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSeeding(false)
    }
  }

  // Individual gin seed functions  
  const seedRainforestGin = async () => {
    try {
      setSeeding(true)
      const result = await rainforestGinSeedService.seedRainforestGinData()
      alert(`Rainforest Gin seeded successfully!\nItems: ${result.itemsCreated} created, ${result.itemsUpdated} updated\nRecipe: ${result.recipeCreated ? 'Created' : 'Updated'}`)
      await loadRecipes()
    } catch (error) {
      alert('Failed to seed Rainforest Gin: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSeeding(false)
    }
  }

  const seedSignatureGin = async () => {
    try {
      setSeeding(true)
      const result = await signatureGinSeedService.seedSignatureGinData()
      alert(`Signature Dry Gin seeded successfully!\nItems: ${result.itemsCreated} created, ${result.itemsUpdated} updated\nRecipe: ${result.recipeCreated ? 'Created' : 'Updated'}`)
      await loadRecipes()
    } catch (error) {
      alert('Failed to seed Signature Dry Gin: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSeeding(false)
    }
  }

  const seedNavyGin = async () => {
    try {
      setSeeding(true)
      const result = await navyGinSeedService.seedNavyGinData()
      alert(`Navy Strength Gin seeded successfully!\nItems: ${result.itemsCreated} created, ${result.itemsUpdated} updated\nRecipe: ${result.recipeCreated ? 'Created' : 'Updated'}`)
      await loadRecipes()
    } catch (error) {
      alert('Failed to seed Navy Strength Gin: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSeeding(false)
    }
  }

  const seedMMGin = async () => {
    try {
      setSeeding(true)
      const result = await mmGinSeedService.seedMMGinData()
      alert(`MM Gin (Merchant Mae) seeded successfully!\nItems: ${result.itemsCreated} created, ${result.itemsUpdated} updated\nRecipe: ${result.recipeCreated ? 'Created' : 'Updated'}`)
      await loadRecipes()
    } catch (error) {
      alert('Failed to seed MM Gin: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSeeding(false)
    }
  }

  const seedDrySeasonGin = async () => {
    try {
      setSeeding(true)
      const result = await drySeasonGinSeedService.seedDrySeasonGinData()
      alert(`Dry Season Gin (40%) seeded successfully!\nItems: ${result.itemsCreated} created, ${result.itemsUpdated} updated\nRecipe: ${result.recipeCreated ? 'Created' : 'Updated'}`)
      await loadRecipes()
    } catch (error) {
      alert('Failed to seed Dry Season Gin: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSeeding(false)
    }
  }

  const seedWetSeasonGin = async () => {
    try {
      setSeeding(true)
      const result = await wetSeasonGinSeedService.seedWetSeasonGinData()
      alert(`Wet Season Gin (42%) seeded successfully!\nItems: ${result.itemsCreated} created, ${result.itemsUpdated} updated\nRecipe: ${result.recipeCreated ? 'Created' : 'Updated'}`)
      await loadRecipes()
    } catch (error) {
      alert('Failed to seed Wet Season Gin: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSeeding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-red-800">
              Failed to load recipes
            </h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-red-600 mt-2 p-2 bg-red-100 rounded">
                <strong>Debug:</strong> Check browser console for detailed error information. This might be due to missing data in the database.
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={loadRecipes}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={() => {setError(null); setRecipes([])}}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              Continue Without Data
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipes</h1>
          <p className="text-gray-600 mt-1">Manage your gin recipes and start production batches</p>
        </div>

        {/* Main Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeveloperTools(!showDeveloperTools)}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-colors"
          >
            🌱 Seed Data
          </button>
          <button
            onClick={() => router.push('/dashboard/recipes/new')}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Recipe
          </button>
        </div>
      </div>

      {/* Seed Data Section (Collapsible) */}
      {showDeveloperTools && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">🌱 Seed Sample Data</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-green-800 mb-2">🧪 Base Ingredients</h4>
              <p className="text-green-700 text-sm mb-3">First, create the base ingredients (ethanol, botanicals, water):</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={seedMasterInventory}
                  disabled={seeding}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  ✨ Create Ingredients
                </button>
                <button
                  onClick={seedInventoryData}
                  disabled={seeding}
                  className="px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  Seed Inventory
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-green-800 mb-2">🍸 Gin Recipes</h4>
              <p className="text-green-700 text-sm mb-3">Then, create the 6 gin recipes with their ingredients:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <button
                  onClick={seedRainforestGin}
                  disabled={seeding}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  🌧️ Rainforest Gin (42%)
                </button>
                <button
                  onClick={seedSignatureGin}
                  disabled={seeding}
                  className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  🏛️ Signature Gin (42%)
                </button>
                <button
                  onClick={seedNavyGin}
                  disabled={seeding}
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                  ⚓ Navy Strength (58.9%)
                </button>
                <button
                  onClick={seedMMGin}
                  disabled={seeding}
                  className="px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 font-medium"
                >
                  👑 MM Gin (37.5%)
                </button>
                <button
                  onClick={seedDrySeasonGin}
                  disabled={seeding}
                  className="px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 font-medium"
                >
                  ☀️ Dry Season (40%)
                </button>
                <button
                  onClick={seedWetSeasonGin}
                  disabled={seeding}
                  className="px-3 py-2 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 font-medium"
                >
                  🌧️ Wet Season (42%)
                </button>
              </div>
            </div>
            
            {seeding && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Seeding data...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No recipes match your search' : 'No recipes yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms to find what you\'re looking for.'
                : 'Get started by creating your first recipe or seeding some demo data.'
              }
            </p>
            {!searchTerm && (
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/dashboard/recipes/new')}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Recipe
                </button>
                {typeof window !== 'undefined' && (
                  <div className="text-sm text-gray-500">
                    or use Developer Tools above to seed sample recipes
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onView={() => handleRecipeView(recipe)}
              onStartBatch={() => handleStartBatch(recipe)}
            />
          ))}
        </div>
      )}
    </div>
  )
}