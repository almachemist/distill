'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProductionRepository } from '@/modules/production/services/production.repository'
import { RecipeRepository } from '@/modules/recipes/services/recipe.repository'
import type { BatchCalculation } from '@/modules/production/types/production.types'

export default function StartBatchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const recipeId = searchParams.get('recipeId')
  const batchTargetL = searchParams.get('batchTargetL')
  
  const [recipes, setRecipes] = useState<Array<{id: string, name: string}>>([])
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipeId || '')
  const [targetLiters, setTargetLiters] = useState(batchTargetL ? parseInt(batchTargetL) : 100)
  const [calculation, setCalculation] = useState<BatchCalculation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const productionRepo = new ProductionRepository()
  const recipeRepo = new RecipeRepository()

  const loadRecipes = useCallback(async () => {
    try {
      const data = await recipeRepo.fetchRecipes()
      setRecipes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes')
    }
  }, [recipeRepo])

  const calculateBatch = useCallback(async () => {
    if (!selectedRecipeId || targetLiters <= 0) return

    try {
      setLoading(true)
      setError(null)
      const calc = await productionRepo.calculateBatch(selectedRecipeId, targetLiters)
      setCalculation(calc)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate batch')
    } finally {
      setLoading(false)
    }
  }, [selectedRecipeId, targetLiters, productionRepo])

  useEffect(() => {
    loadRecipes()
  }, [loadRecipes])

  useEffect(() => {
    if (selectedRecipeId && targetLiters > 0) {
      calculateBatch()
    }
  }, [calculateBatch])

  const handleStartBatch = async () => {
    if (!calculation) return

    try {
      setLoading(true)
      
      // Create production order
      const order = await productionRepo.createProductionOrder({
        recipe_id: calculation.recipe_id,
        product_name: `Batch ${calculation.batch_target_l}L - ${new Date().toLocaleDateString()}`,
        batch_target_l: calculation.batch_target_l,
        status: 'planned',
        notes: `Batch of ${calculation.batch_target_l}L`
      })

      // Execute the batch
      await productionRepo.executeBatch(order.id, calculation, 'Batch started from UI')

      router.push(`/dashboard/production/batch-summary?orderId=${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start batch')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Start Production Batch</h1>
          <p className="text-gray-600 mt-2">Calculate ingredients and start a new gin production batch</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Batch Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe
              </label>
              <select
                value={selectedRecipeId}
                onChange={(e) => setSelectedRecipeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a recipe</option>
                {recipes.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Volume (Liters)
              </label>
              <input
                type="number"
                value={targetLiters}
                onChange={(e) => setTargetLiters(parseInt(e.target.value) || 0)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={calculateBatch}
              disabled={!selectedRecipeId || targetLiters <= 0 || loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Calculating...' : 'Calculate Batch'}
            </button>
          </div>
        </div>

        {/* Calculation Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Batch Calculation</h2>
          
          {calculation ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-800">Target Volume:</span>
                  <span className="text-lg font-semibold text-blue-900">{calculation.batch_target_l}L</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm font-medium text-blue-800">Scale Factor:</span>
                  <span className="text-sm text-blue-700">{calculation.scale_factor.toFixed(2)}x</span>
                </div>
              </div>

              {calculation.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-yellow-800 mb-2">Warnings:</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {calculation.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Ingredients Required:</h3>
                {calculation.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{ingredient.item.name}</div>
                      <div className="text-sm text-gray-600">Step {ingredient.step}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${ingredient.is_sufficient ? 'text-green-600' : 'text-red-600'}`}>
                        {ingredient.required_quantity.toFixed(2)} {ingredient.uom}
                      </div>
                      {ingredient.shortage > 0 && (
                        <div className="text-xs text-red-500">
                          Shortage: {ingredient.shortage.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleStartBatch}
                disabled={loading || calculation.warnings.some(w => w.includes('Insufficient stock'))}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Starting Batch...' : 'Start Production Batch'}
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Select a recipe and target volume to see batch calculation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
