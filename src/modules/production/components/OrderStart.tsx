'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProductionRepository } from '../services/production.repository'
import { RecipeRepository } from '@/modules/recipes/services/recipe.repository'
import type { 
  BatchCalculation, 
  BatchIngredient, 
  LotAllocation 
} from '../types/production.types'
import type { Recipe } from '@/modules/recipes/types/recipe.types'

export function OrderStart() {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [batchCalc, setBatchCalc] = useState<BatchCalculation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [productName, setProductName] = useState('')
  const [creating, setCreating] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const recipeId = searchParams.get('recipeId')
  const batchTargetL = Number(searchParams.get('batchTargetL')) || 100

  const productionRepo = new ProductionRepository()
  const recipeRepo = new RecipeRepository()

  useEffect(() => {
    if (recipeId) {
      loadData()
    } else {
      setError('Recipe ID is required')
      setLoading(false)
    }
  }, [recipeId])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load recipe details
      const recipeData = await recipeRepo.fetchRecipeWithIngredients(recipeId!)
      if (!recipeData) {
        setError('Recipe not found')
        return
      }
      setRecipe(recipeData)
      setProductName(recipeData.name + ' - ' + new Date().toLocaleDateString())

      // Calculate batch requirements
      const calculation = await productionRepo.calculateBatch(recipeId!, batchTargetL)
      setBatchCalc(calculation)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const updateLotAllocation = (ingredientIndex: number, lotAllocations: LotAllocation[]) => {
    if (!batchCalc) return

    const updatedCalc = { ...batchCalc }
    updatedCalc.ingredients[ingredientIndex].selected_lots = lotAllocations
    setBatchCalc(updatedCalc)
  }

  const canConfirm = () => {
    if (!batchCalc) return false
    
    return batchCalc.ingredients.every(ingredient => {
      const totalAllocated = ingredient.selected_lots.reduce((sum, lot) => sum + lot.allocated_quantity, 0)
      return Math.abs(totalAllocated - ingredient.required_quantity) < 0.001 // Account for floating point precision
    })
  }

  const handleConfirm = async () => {
    if (!batchCalc || !recipe || !canConfirm()) return

    try {
      setCreating(true)

      // Create production order
      const order = await productionRepo.createProductionOrder({
        recipe_id: recipe.id,
        product_name: productName,
        batch_target_l: batchCalc.batch_target_l,
        status: 'planned',
        organization_id: '00000000-0000-0000-0000-000000000001' // TODO: Get from auth context
      })

      // Execute the batch (consume inventory)
      await productionRepo.executeBatch(order.id, batchCalc, 
        `Production started for ${productName}`
      )

      // Redirect to production orders list
      router.push('/dashboard/production/orders')
      
    } catch (err) {
      alert('Failed to start production: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setCreating(false)
    }
  }

  const groupedByStep = batchCalc?.ingredients.reduce((acc, ingredient, index) => {
    if (!acc[ingredient.step]) {
      acc[ingredient.step] = []
    }
    acc[ingredient.step].push({ ...ingredient, originalIndex: index })
    return acc
  }, {} as Record<string, (BatchIngredient & { originalIndex: number })[]>) || {}

  const stepOrder = ['maceration', 'distillation', 'proofing', 'bottling']

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !recipe || !batchCalc) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error: {error || 'Failed to load data'}</p>
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
            ← Back to Recipe
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Start Production Batch</h1>
          <p className="text-gray-600 mt-1">
            Recipe: {recipe.name} • Target: {batchCalc.batch_target_l}L • Scale: {batchCalc.scale_factor.toFixed(2)}x
          </p>
        </div>
      </div>

      {/* Product Name */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Name
        </label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter product name..."
        />
      </div>

      {/* Warnings */}
      {batchCalc.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Warnings</h3>
          <ul className="space-y-1">
            {batchCalc.warnings.map((warning, index) => (
              <li key={index} className="text-yellow-700 text-sm">
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

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
              
              <div className="space-y-4">
                {stepIngredients.map((ingredient) => (
                  <IngredientLotPicker
                    key={ingredient.ingredient_id}
                    ingredient={ingredient}
                    onUpdateAllocations={(allocations) => 
                      updateLotAllocation(ingredient.originalIndex, allocations)
                    }
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary and Confirm */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Production Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
          <div>
            <div className="text-blue-700 font-medium">Total Ingredients</div>
            <div className="text-blue-900">{batchCalc.ingredients.length}</div>
          </div>
          <div>
            <div className="text-blue-700 font-medium">Batch Size</div>
            <div className="text-blue-900">{batchCalc.batch_target_l}L</div>
          </div>
          <div>
            <div className="text-blue-700 font-medium">Estimated Cost</div>
            <div className="text-blue-900">${batchCalc.total_cost.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-blue-700 font-medium">Ready to Start</div>
            <div className={canConfirm() ? 'text-green-700' : 'text-red-700'}>
              {canConfirm() ? '✓ Yes' : '✗ No'}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => router.back()}
            disabled={creating}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm() || creating || !productName.trim()}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {creating ? 'Starting...' : 'Confirm & Start Production'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Component for picking lots for each ingredient
function IngredientLotPicker({ 
  ingredient, 
  onUpdateAllocations 
}: { 
  ingredient: BatchIngredient & { originalIndex: number }
  onUpdateAllocations: (allocations: LotAllocation[]) => void 
}) {
  const [allocations, setAllocations] = useState<LotAllocation[]>(ingredient.selected_lots)

  useEffect(() => {
    onUpdateAllocations(allocations)
  }, [allocations, onUpdateAllocations])

  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.allocated_quantity, 0)
  const remaining = ingredient.required_quantity - totalAllocated
  const isComplete = Math.abs(remaining) < 0.001

  const addLotAllocation = (lotId: string) => {
    const lot = ingredient.available_lots.find(l => l.lot.id === lotId)
    if (!lot) return

    const existingAlloc = allocations.find(a => a.lot_id === lotId)
    if (existingAlloc) return // Already allocated

    const allocateQty = Math.min(remaining > 0 ? remaining : 0, lot.current_stock)
    if (allocateQty <= 0) return

    setAllocations([...allocations, {
      lot_id: lotId,
      lot_number: lot.lot.code || (lot.lot as any).lot_number || lotId,
      allocated_quantity: allocateQty,
      uom: ingredient.uom
    }])
  }

  const updateAllocation = (lotId: string, quantity: number) => {
    setAllocations(allocations.map(alloc => 
      alloc.lot_id === lotId ? { ...alloc, allocated_quantity: quantity } : alloc
    ))
  }

  const removeAllocation = (lotId: string) => {
    setAllocations(allocations.filter(alloc => alloc.lot_id !== lotId))
  }

  return (
    <div className={`p-4 rounded-lg border ${
      isComplete ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{ingredient.item.name}</h4>
          <div className="text-sm text-gray-600">
            Required: {ingredient.required_quantity.toFixed(2)} {ingredient.uom}
          </div>
        </div>
        <div className="text-right text-sm">
          <div className={`font-medium ${isComplete ? 'text-green-700' : 'text-orange-700'}`}>
            Allocated: {totalAllocated.toFixed(2)} {ingredient.uom}
          </div>
          {!isComplete && (
            <div className="text-red-600">
              Remaining: {remaining.toFixed(2)} {ingredient.uom}
            </div>
          )}
        </div>
      </div>

      {/* Current Allocations */}
      {allocations.length > 0 && (
        <div className="mb-3">
          <div className="text-sm font-medium text-gray-700 mb-2">Selected Lots:</div>
          <div className="space-y-2">
            {allocations.map((alloc) => (
              <div key={alloc.lot_id} className="flex items-center justify-between bg-white p-2 rounded border">
                <span className="text-sm">{alloc.lot_number}</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={alloc.allocated_quantity}
                    onChange={(e) => updateAllocation(alloc.lot_id, Number(e.target.value))}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-500">{alloc.uom}</span>
                  <button
                    onClick={() => removeAllocation(alloc.lot_id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Lots */}
      {!isComplete && ingredient.available_lots.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Available Lots:</div>
          <div className="space-y-1">
            {ingredient.available_lots
              .filter(lot => !allocations.find(a => a.lot_id === lot.lot.id))
              .map((lot) => (
                <div key={lot.lot.id} className="flex items-center justify-between bg-white p-2 rounded border">
                  <div className="text-sm">
                    <span className="font-medium">{lot.lot.lot_number}</span>
                    {lot.lot.received_date && (
                      <span className="text-gray-500 ml-2">
                        ({new Date(lot.lot.received_date).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {lot.current_stock.toFixed(2)} {ingredient.uom}
                    </span>
                    <button
                      onClick={() => addLotAllocation(lot.lot.id)}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* No lots warning */}
      {ingredient.available_lots.length === 0 && (
        <div className="text-sm text-red-600">
          ⚠ No lots available for this item
        </div>
      )}
    </div>
  )
}



