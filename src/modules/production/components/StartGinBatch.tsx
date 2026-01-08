'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { StockRepository } from '@/modules/inventory/services/stock.repository'
import { RecipeRepository } from '@/modules/recipes/services/recipe.repository'
import type { RecipeWithIngredients } from '@/modules/recipes/types/recipe.types'

interface LotAllocation {
  lot_id: string
  lot_code: string
  qty: number
  uom: string
}

interface IngredientAllocation {
  ingredient_id: string
  item_id: string
  item_name: string
  required_qty: number
  uom: string
  allocations: LotAllocation[]
  is_complete: boolean
}

interface LotsPickerProps {
  itemId: string
  itemName: string
  requiredQty: number
  defaultUom: string
  onAllocationsChange: (allocations: LotAllocation[]) => void
}

function LotsPicker({ itemId, itemName, requiredQty, defaultUom, onAllocationsChange }: LotsPickerProps) {
  const [lots, setLots] = useState<Awaited<ReturnType<StockRepository['getLotsForItem']>>>([])
  const [allocs, setAllocs] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const repo = new StockRepository()
    setLoading(true)
    repo.getLotsForItem(itemId)
      .then(setLots)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load lots'))
      .finally(() => setLoading(false))
  }, [itemId])

  useEffect(() => {
    const allocations: LotAllocation[] = Object.entries(allocs)
      .filter(([, qty]) => qty > 0)
      .map(([lotId, qty]) => {
        const lot = lots.find(l => l.lot_id === lotId)!
        return { lot_id: lotId, lot_code: lot?.lot_code || '', qty, uom: defaultUom }
      })
    onAllocationsChange(allocations)
  }, [allocs, lots, defaultUom, onAllocationsChange])

  const totalAllocated = Object.values(allocs).reduce((sum, q) => sum + q, 0)
  const remaining = Math.max(0, requiredQty - totalAllocated)

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="font-medium text-gray-900">{itemName}</div>
        <div className="text-sm text-gray-700">Required: {requiredQty} {defaultUom} • Remaining: {remaining.toFixed(2)} {defaultUom}</div>
      </div>
      {error && <div className="text-red-700 text-sm mb-2">{error}</div>}
      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : (
        <div className="space-y-2">
          {lots.length === 0 && (
            <div className="text-sm text-gray-500">No lots with stock</div>
          )}
          {lots.map(lot => (
            <div key={lot.lot_id} className="grid grid-cols-5 gap-2 items-center">
              <div className="text-sm text-gray-900">{lot.lot_code}</div>
              <div className="text-sm text-gray-700">On hand: {lot.on_hand.toFixed(2)} {defaultUom}</div>
              <input
                type="number"
                step="0.1"
                min="0"
                max={lot.on_hand}
                value={allocs[lot.lot_id] ?? ''}
                onChange={(e) => {
                  const v = parseFloat(e.target.value)
                  setAllocs(a => ({ ...a, [lot.lot_id]: isNaN(v) ? 0 : Math.min(v, lot.on_hand) }))
                }}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <button
                type="button"
                onClick={() => setAllocs(a => ({ ...a, [lot.lot_id]: Math.min(remaining, lot.on_hand) }))}
                className="px-2 py-1 text-sm border rounded"
              >Max</button>
              <button
                type="button"
                onClick={() => setAllocs(a => { const rest = { ...a }; delete rest[lot.lot_id]; return rest })}
                className="px-2 py-1 text-sm border rounded"
              >Clear</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function StartGinBatch() {
  const [recipe, setRecipe] = useState<RecipeWithIngredients | null>(null)
  const [batchTargetL, setBatchTargetL] = useState(100)
  const [scaleFactor, setScaleFactor] = useState(1)
  const [ingredientAllocations, setIngredientAllocations] = useState<IngredientAllocation[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams() as URLSearchParams | null
  const recipeId = searchParams?.get('recipeId')
  const urlBatchTargetL = searchParams?.get('batchTargetL')

  const stockRepo = useMemo(() => new StockRepository(), [])
  const recipeRepo = useMemo(() => new RecipeRepository(), [])

  const loadRecipe = useCallback(async () => {
    try {
      setLoading(true)
      const recipeData = await recipeRepo.fetchRecipeWithIngredients(recipeId!)
      if (!recipeData) {
        setError('Recipe not found')
        return
      }
      setRecipe(recipeData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipe')
    } finally {
      setLoading(false)
    }
  }, [recipeRepo, recipeId])

  useEffect(() => {
    if (recipeId) {
      loadRecipe()
    } else {
      setError('Recipe ID is required')
      setLoading(false)
    }
  }, [recipeId, loadRecipe])

  useEffect(() => {
    if (urlBatchTargetL) {
      setBatchTargetL(Number(urlBatchTargetL))
    }
  }, [urlBatchTargetL])

  const calculateScaledIngredients = useCallback(() => {
    if (!recipe) return

    let recipeBaseL = 100
    if (recipe.name.includes('Rainforest Gin')) {
      recipeBaseL = 546
    } else if (recipe.name.includes('Signature Dry Gin')) {
      recipeBaseL = 495
    } else if (recipe.name.includes('Navy Strength Gin')) {
      recipeBaseL = 426
    } else if (recipe.name.includes('MM Gin')) {
      recipeBaseL = 729
    } else if (recipe.name.includes('Dry Season Gin')) {
      recipeBaseL = 404
    } else if (recipe.name.includes('Wet Season Gin')) {
      recipeBaseL = 485
    }
    
    const newScaleFactor = batchTargetL / recipeBaseL
    setScaleFactor(newScaleFactor)

    const relevantIngredients = recipe.ingredients

    const allocations: IngredientAllocation[] = relevantIngredients.map(ingredient => ({
      ingredient_id: ingredient.id,
      item_id: ingredient.item_id,
      item_name: ingredient.item.name,
      required_qty: ingredient.qty_per_batch * newScaleFactor,
      uom: ingredient.uom,
      allocations: [],
      is_complete: false
    }))

    setIngredientAllocations(allocations)
  }, [recipe, batchTargetL])

  useEffect(() => {
    if (recipe) {
      calculateScaledIngredients()
    }
  }, [recipe, batchTargetL, calculateScaledIngredients])

 

  const updateIngredientAllocations = (ingredientId: string, allocations: LotAllocation[]) => {
    setIngredientAllocations(prev => prev.map(ing => {
      if (ing.ingredient_id === ingredientId) {
        const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.qty, 0)
        const isComplete = Math.abs(totalAllocated - ing.required_qty) < 0.001
        return { ...ing, allocations, is_complete: isComplete }
      }
      return ing
    }))
  }

  const canConfirm = () => {
    return ingredientAllocations.every(ing => ing.is_complete) && ingredientAllocations.length > 0
  }

  const handleConfirm = async () => {
    if (!canConfirm()) return

    try {
      setSubmitting(true)

      // Prepare all CONSUME transactions
      const transactions = []
      for (const ingredient of ingredientAllocations) {
        for (const allocation of ingredient.allocations) {
          transactions.push({
            txn_type: 'CONSUME' as const,
            item_id: ingredient.item_id,
            lot_id: allocation.lot_id,
            qty: allocation.qty,
            uom: allocation.uom,
            note: `Gin batch production - ${recipe?.name} - ${batchTargetL}L batch`
          })
        }
      }

      // Post all transactions as a batch
      await stockRepo.postBatchTxns(transactions)

      // Redirect to batch summary
      router.push(`/dashboard/production/batch-summary?recipe=${recipe?.name}&target=${batchTargetL}&transactions=${transactions.length}`)

    } catch (err) {
      alert('Failed to start batch: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSubmitting(false)
    }
  }

  const groupedByStep = ingredientAllocations.reduce((acc, ingredient) => {
    const recipeIngredient = recipe?.ingredients.find(ri => ri.id === ingredient.ingredient_id)
    const step = recipeIngredient?.step || 'unknown'
    
    if (!acc[step]) {
      acc[step] = []
    }
    acc[step].push(ingredient)
    return acc
  }, {} as Record<string, IngredientAllocation[]>)

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
          <h1 className="text-2xl font-bold text-gray-900">Start Gin Batch</h1>
          <p className="text-gray-600 mt-1">
            Recipe: {recipe.name} • Scale: {scaleFactor.toFixed(2)}x
          </p>
        </div>
      </div>

      {/* Batch Size Input */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label htmlFor="gin_batch_target_l" className="block text-sm font-medium text-gray-700 mb-2">
          Batch Target (L)
        </label>
        <input
          type="number"
          min="1"
          step="0.1"
          id="gin_batch_target_l"
          value={batchTargetL}
          onChange={(e) => setBatchTargetL(Number(e.target.value))}
          className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="ml-3 text-sm text-gray-600">
          (Recipe base: 100L)
        </span>
      </div>

      {/* Ingredient Checklist by Step */}
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
                  <LotsPicker
                    key={ingredient.ingredient_id}
                    itemId={ingredient.item_id}
                    itemName={ingredient.item_name}
                    requiredQty={ingredient.required_qty}
                    defaultUom={ingredient.uom}
                    onAllocationsChange={(allocations) => 
                      updateIngredientAllocations(ingredient.ingredient_id, allocations)
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
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Batch Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
          <div>
            <div className="text-blue-700 font-medium">Ingredients</div>
            <div className="text-blue-900">{ingredientAllocations.length}</div>
          </div>
          <div>
            <div className="text-blue-700 font-medium">Complete</div>
            <div className="text-blue-900">
              {ingredientAllocations.filter(ing => ing.is_complete).length}
            </div>
          </div>
          <div>
            <div className="text-blue-700 font-medium">Batch Size</div>
            <div className="text-blue-900">{batchTargetL}L</div>
          </div>
          <div>
            <div className="text-blue-700 font-medium">Ready</div>
            <div className={canConfirm() ? 'text-green-700' : 'text-red-700'}>
              {canConfirm() ? '✓ Yes' : '✗ No'}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => router.back()}
            disabled={submitting}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm() || submitting}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? 'Starting Batch...' : 'Confirm & Start Batch'}
          </button>
        </div>
      </div>
    </div>
  )
}
