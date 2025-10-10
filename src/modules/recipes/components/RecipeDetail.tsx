'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RecipeRepository } from '../services/recipe.repository'
import { StockRepository } from '../services/stock.repository'
import type { RecipeWithIngredients, ScaledIngredient, LotWithStock } from '../types/recipe.types'

interface RecipeDetailProps {
  recipeId: string
}

export function RecipeDetail({ recipeId }: RecipeDetailProps) {
  const [recipe, setRecipe] = useState<RecipeWithIngredients | null>(null)
  const [scaledIngredients, setScaledIngredients] = useState<ScaledIngredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [batchTargetL, setBatchTargetL] = useState(100) // Will be set based on recipe
  const [scaleFactor, setScaleFactor] = useState(1)
  const [loadingStock, setLoadingStock] = useState(false)
  const [lalWarning, setLalWarning] = useState<string | null>(null)

  const router = useRouter()
  const recipeRepo = new RecipeRepository()
  const stockRepo = new StockRepository()

  useEffect(() => {
    loadRecipe()
  }, [recipeId])

  useEffect(() => {
    if (recipe) {
      // Set default batch target based on recipe type
      let defaultBatchL = 100
      if (recipe.name.includes('Rainforest Gin')) {
        defaultBatchL = 546
      } else if (recipe.name.includes('Signature Dry Gin')) {
        defaultBatchL = 495
      } else if (recipe.name.includes('Navy Strength Gin')) {
        defaultBatchL = 426
      } else if (recipe.name.includes('MM Gin')) {
        defaultBatchL = 729
      } else if (recipe.name.includes('Dry Season Gin')) {
        defaultBatchL = 404
      } else if (recipe.name.includes('Wet Season Gin')) {
        defaultBatchL = 485
      }
      setBatchTargetL(defaultBatchL)
    }
  }, [recipe])

  useEffect(() => {
    if (recipe) {
      calculateScaledIngredients()
    }
  }, [recipe, batchTargetL])

  const loadRecipe = async () => {
    try {
      setLoading(true)
      const data = await recipeRepo.fetchRecipeWithIngredients(recipeId)
      if (!data) {
        setError('Recipe not found')
        return
      }
      setRecipe(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipe')
    } finally {
      setLoading(false)
    }
  }

  const calculateScaledIngredients = async () => {
    if (!recipe) return

    try {
      setLoadingStock(true)
      
      // Determine baseline based on recipe name
      let recipeBaseL = 100 // Default baseline
      let baselineLAL = 0
      let targetABV = 0.42 // Default ABV
      
      if (recipe.name.includes('Rainforest Gin')) {
        recipeBaseL = 546
        baselineLAL = 229.6 // 280L @ 82% = 229.6 LAL
        targetABV = 0.42
      } else if (recipe.name.includes('Signature Dry Gin')) {
        recipeBaseL = 495
        baselineLAL = 207.95 // 258L @ 80.6% = 207.95 LAL
        targetABV = 0.42
      } else if (recipe.name.includes('Navy Strength Gin')) {
        recipeBaseL = 426
        baselineLAL = 250.92 // 306L @ 82% = 250.92 LAL
        targetABV = 0.589 // Navy Strength at 58.9%
      } else if (recipe.name.includes('MM Gin')) {
        recipeBaseL = 729
        baselineLAL = 272.24 // 332L @ 82% = 272.24 LAL
        targetABV = 0.375 // MM Gin at 37.5%
      } else if (recipe.name.includes('Dry Season Gin')) {
        recipeBaseL = 404
        baselineLAL = 161.986 // 199L @ 81.4% = 161.986 LAL
        targetABV = 0.40 // Dry Season Gin at 40%
      } else if (recipe.name.includes('Wet Season Gin')) {
        recipeBaseL = 485
        baselineLAL = 203.96 // 251L @ 81.3% = 203.96 LAL
        targetABV = 0.42 // Wet Season Gin at 42%
      }
      
      const newScaleFactor = batchTargetL / recipeBaseL
      setScaleFactor(newScaleFactor)

      // LAL conservation check for gin recipes
      if (baselineLAL > 0) {
        const expectedLAL = batchTargetL * targetABV
        const actualLAL = baselineLAL * newScaleFactor
        const tolerance = batchTargetL * 0.01 // 1% tolerance
        
        if (Math.abs(expectedLAL - actualLAL) > tolerance) {
          const difference = actualLAL - expectedLAL
          const targetAbvPercent = (targetABV * 100).toFixed(1)
          setLalWarning(
            `⚠️ LAL Conservation Warning: Expected ${expectedLAL.toFixed(1)}L LAL, got ${actualLAL.toFixed(1)}L LAL (${difference > 0 ? '+' : ''}${difference.toFixed(1)}L difference). This may affect target ABV of ${targetAbvPercent}%.`
          )
        } else {
          setLalWarning(null)
        }
      } else {
        setLalWarning(null)
      }

      const scaled: ScaledIngredient[] = []

      for (const ingredient of recipe.ingredients) {
        const scaledQty = ingredient.qty_per_batch * newScaleFactor
        
        // Get available lots for this item
        const availableLots = await stockRepo.getLotsForItem(ingredient.item_id)
        const totalAvailable = availableLots.reduce((sum, lot) => sum + lot.on_hand, 0)
        const isSufficient = totalAvailable >= scaledQty

        scaled.push({
          id: ingredient.id,
          item_id: ingredient.item_id,
          item: ingredient.item,
          qty_per_batch: ingredient.qty_per_batch,
          scaled_quantity: scaledQty,
          uom: ingredient.uom,
          step: ingredient.step,
          available_lots: availableLots.map(lot => ({
            ...lot,
            current_stock: lot.on_hand
          })),
          selected_lots: [], // Will be set in production order screen
          is_sufficient: isSufficient
        })
      }

      setScaledIngredients(scaled)
    } catch (err) {
      console.error('Failed to calculate scaled ingredients:', err)
    } finally {
      setLoadingStock(false)
    }
  }

  const handleStartBatch = () => {
    const params = new URLSearchParams({
      recipeId: recipe!.id,
      batchTargetL: batchTargetL.toString()
    })
    router.push(`/dashboard/production/start-batch?${params}`)
  }

  const groupedByStep = scaledIngredients.reduce((acc, ingredient) => {
    if (!acc[ingredient.step]) {
      acc[ingredient.step] = []
    }
    acc[ingredient.step].push(ingredient)
    return acc
  }, {} as Record<string, ScaledIngredient[]>)

  const stepOrder = ['maceration', 'distillation', 'proofing', 'bottling']

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error: {error || 'Recipe not found'}</p>
        <button 
          onClick={() => router.back()}
          className="mt-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Back to Recipes
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{recipe.name}</h1>
          {recipe.description && (
            <p className="text-gray-600 mt-2 max-w-3xl">{recipe.description}</p>
          )}
          {recipe.notes && (
            <p className="text-gray-500 mt-1 text-sm">{recipe.notes}</p>
          )}
        </div>
        <button
          onClick={handleStartBatch}
          disabled={loadingStock}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          Start Batch
        </button>
      </div>

      {/* Batch Size Calculator */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Batch Calculator</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Batch Size (L)
            </label>
            <input
              type="number"
              min="1"
              step="0.1"
              value={batchTargetL}
              onChange={(e) => setBatchTargetL(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipe Base Size
            </label>
            <p className="px-3 py-2 bg-white border border-gray-300 rounded-md">
              {recipe.name.includes('Rainforest Gin') ? '546' : 
               recipe.name.includes('Signature Dry Gin') ? '495' : 
               recipe.name.includes('Navy Strength Gin') ? '426' : 
               recipe.name.includes('MM Gin') ? '729' : 
               recipe.name.includes('Dry Season Gin') ? '404' :
               recipe.name.includes('Wet Season Gin') ? '485' : '100'} L
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scale Factor
            </label>
            <p className="px-3 py-2 bg-white border border-gray-300 rounded-md">
              {scaleFactor.toFixed(2)}x
            </p>
          </div>
        </div>
        
        {/* LAL Conservation Warning */}
        {lalWarning && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">{lalWarning}</p>
          </div>
        )}
      </div>

      {/* Ingredients by Step */}
      <div className="space-y-6">
        {stepOrder.map(step => {
          const stepIngredients = groupedByStep[step]
          if (!stepIngredients || stepIngredients.length === 0) return null

          return (
            <div key={step} className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 capitalize">
                {step} ({stepIngredients.length} ingredients)
              </h3>
              
              <div className="space-y-3">
                {stepIngredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className={`p-4 rounded-lg border ${
                      ingredient.is_sufficient 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {ingredient.item.name}
                        </h4>
                        <div className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">
                            {ingredient.scaled_quantity.toFixed(2)} {ingredient.uom}
                          </span>
                          <span className="ml-2 text-gray-500">
                            (base: {ingredient.qty_per_batch} {ingredient.uom})
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        {loadingStock ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        ) : (
                          <div className="text-sm">
                            <div className={`font-medium ${
                              ingredient.is_sufficient ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {ingredient.is_sufficient ? '✓ Available' : '⚠ Insufficient'}
                            </div>
                            <div className="text-gray-600">
                              {ingredient.available_lots.reduce((sum, lot) => sum + lot.current_stock, 0).toFixed(2)} {ingredient.uom} in stock
                            </div>
                            <div className="text-gray-500">
                              {ingredient.available_lots.length} lot(s)
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Batch Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-blue-700 font-medium">Total Ingredients</div>
            <div className="text-blue-900">{scaledIngredients.length}</div>
          </div>
          <div>
            <div className="text-blue-700 font-medium">Sufficient Stock</div>
            <div className="text-blue-900">
              {scaledIngredients.filter(i => i.is_sufficient).length}
            </div>
          </div>
          <div>
            <div className="text-blue-700 font-medium">Insufficient Stock</div>
            <div className="text-blue-900">
              {scaledIngredients.filter(i => !i.is_sufficient).length}
            </div>
          </div>
          <div>
            <div className="text-blue-700 font-medium">Batch Size</div>
            <div className="text-blue-900">{batchTargetL} L</div>
          </div>
        </div>
      </div>
    </div>
  )
}
