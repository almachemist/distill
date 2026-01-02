'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RecipeRepository } from '../services/recipe.repository'
import type { RecipeWithIngredients, ScaledIngredient } from '../types/recipe.types'

interface RecipeDetailProps {
  recipeId: string
  embedded?: boolean
  view?: 'all' | 'ingredients' | 'calculator' | 'summary'
}

export function RecipeDetail({ recipeId, embedded = false, view = 'all' }: RecipeDetailProps) {
  const [recipe, setRecipe] = useState<RecipeWithIngredients | null>(null)
  const [scaledIngredients, setScaledIngredients] = useState<ScaledIngredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [batchTargetL, setBatchTargetL] = useState(100) // Will be set based on recipe
  const [scaleFactor, setScaleFactor] = useState(1)
  const [loadingStock, setLoadingStock] = useState(false)
  const [lalWarning, setLalWarning] = useState<string | null>(null)

  const router = useRouter()
  const recipeRepo = useMemo(() => new RecipeRepository(), [])

  const loadRecipe = useCallback(async () => {
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
  }, [recipeRepo, recipeId])

  useEffect(() => {
    loadRecipe()
  }, [loadRecipe])

  useEffect(() => {
    if (recipe) {
      // Set default batch target based on recipe baseline volume
      const defaultBatchL = (typeof recipe.baseline_final_l === 'number' && recipe.baseline_final_l > 0)
        ? recipe.baseline_final_l
        : 1000
      setBatchTargetL(defaultBatchL)
    }
  }, [recipe])

  const calculateScaledIngredients = useCallback(async () => {
    if (!recipe) return

    try {
      setLoadingStock(true)
      
      // Determine baseline based on recipe baseline volume (default 1000L)
      const recipeBaseL = (typeof recipe.baseline_final_l === 'number' && recipe.baseline_final_l > 0) ? recipe.baseline_final_l : 1000
      const targetABV = typeof recipe.target_abv === 'number' ? recipe.target_abv : 0.42

      // Compute baseline LAL from ethanol ingredient if available
      const ethanolIng = (recipe.ingredients || []).find(ing => ing.item.is_alcohol)
      const ethanolAbvFraction = ethanolIng && typeof ethanolIng.item.abv_pct === 'number' ? ethanolIng.item.abv_pct / 100 : 0.82
      const baselineLAL = ethanolIng ? ethanolIng.qty_per_batch * ethanolAbvFraction : 0

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
        scaled.push({
          ingredient_id: ingredient.id,
          item: ingredient.item,
          original_quantity: ingredient.qty_per_batch,
          scaled_quantity: scaledQty,
          uom: ingredient.uom,
          step: ingredient.step
        })
      }

      setScaledIngredients(scaled)
    } catch (err) {
      console.error('Failed to calculate scaled ingredients:', err)
    } finally {
      setLoadingStock(false)
    }
  }, [recipe, batchTargetL])

  useEffect(() => {
    if (recipe) {
      calculateScaledIngredients()
    }
  }, [recipe, calculateScaledIngredients])

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
          {!embedded && (
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-800 mb-2"
            >
              Back to Recipes
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{recipe.name}</h1>
          {embedded && (
            <div className="mt-2">
              <label htmlFor="embedded_batch_l" className="block text-sm text-gray-600 mb-1">Batelada (L)</label>
              <input
                type="number"
                min="1"
                step="0.1"
                id="embedded_batch_l"
                value={batchTargetL}
                onChange={(e) => setBatchTargetL(Number(e.target.value))}
                className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {!embedded && recipe.notes && (
            <p className="text-gray-500 mt-1 text-sm">{recipe.notes}</p>
          )}
        </div>
        {!embedded && (
          <button
            onClick={handleStartBatch}
            disabled={loadingStock}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Start Batch
          </button>
        )}
      </div>

      {/* Batch Size Calculator */}
      {(view === 'all' || view === 'calculator') && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Batch Calculator</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="target_batch_size" className="block text-sm font-medium text-gray-700 mb-1">
              Target Batch Size (L)
            </label>
            <input
              type="number"
              min="1"
              step="0.1"
              id="target_batch_size"
              value={batchTargetL}
              onChange={(e) => setBatchTargetL(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-1">Recipe Base Size</p>
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
            <p className="block text-sm font-medium text-gray-700 mb-1">Scale Factor</p>
            <p className="px-3 py-2 bg-white border border-gray-300 rounded-md">
              {scaleFactor.toFixed(2)}x
            </p>
          </div>
        </div>
        
          {/* LAL Conservation Warning */}
          {lalWarning && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm">{lalWarning.replace('⚠️ ', '')}</p>
            </div>
          )}
        </div>
      )}

      {/* Ingredients by Step */}
      {(view === 'all' || view === 'ingredients') && (
        <div className="space-y-6">
          {embedded ? (
            stepOrder.map(step => {
              const stepScaled = groupedByStep[step]
              if (!stepScaled || stepScaled.length === 0) return null
              return (
                <div key={step} className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4 capitalize">
                    {step} ({stepScaled.length} ingredients)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="text-left py-2 pr-4">Botânico</th>
                          <th className="text-right py-2 pr-4">Quantidade</th>
                          <th className="text-left py-2">Unidade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {stepScaled.map((ingredient) => (
                          <tr key={ingredient.ingredient_id}>
                            <td className="py-2 pr-4 text-gray-900">{ingredient.item.name}</td>
                            <td className="py-2 pr-4 text-right font-medium">{ingredient.scaled_quantity.toFixed(2)}</td>
                            <td className="py-2 text-gray-700">{ingredient.uom}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })
          ) : (
            stepOrder.map(step => {
              const stepScaled = groupedByStep[step]
              if (!stepScaled || stepScaled.length === 0) return null
              return (
                <div key={step} className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4 capitalize">
                    {step} ({stepScaled.length} ingredients)
                  </h3>
                  <div className="space-y-3">
                    {stepScaled.map((ingredient) => (
                      <div
                        key={ingredient.ingredient_id}
                        className={`p-4 rounded-lg border ${ingredient.scaled_quantity >= ingredient.original_quantity ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{ingredient.item.name}</h4>
                            <div className="mt-1 text-sm text-gray-600">
                              <span className="font-medium">{ingredient.scaled_quantity.toFixed(2)} {ingredient.uom}</span>
                              <span className="ml-2 text-gray-500">(base: {ingredient.original_quantity} {ingredient.uom})</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      
    </div>
  )
}
