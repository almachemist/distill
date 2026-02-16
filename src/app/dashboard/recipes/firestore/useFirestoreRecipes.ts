'use client'

import { useState, useEffect, useCallback } from 'react'
import { MOCK_RECIPES, MOCK_INVENTORY } from './firestore-data'
import type { MockRecipe, MockInventoryItem } from './firestore-data'

export function useFirestoreRecipes() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recipes, setRecipes] = useState(MOCK_RECIPES)
  const [inventory, setInventory] = useState(MOCK_INVENTORY)
  const [selectedRecipe, setSelectedRecipe] = useState<MockRecipe | null>(null)
  const [activeTab, setActiveTab] = useState<'recipes' | 'inventory' | 'production'>('recipes')
  const [isSeeding, setIsSeeding] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await new Promise(resolve => setTimeout(resolve, 500))
      setRecipes(MOCK_RECIPES)
      setInventory(MOCK_INVENTORY)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleInitializeSystem = useCallback(async () => {
    try {
      setIsSeeding(true)
      setError(null)
      await new Promise(resolve => setTimeout(resolve, 1500))
      alert('System initialized successfully!\nInventory seeded: true\nRecipes seeded: true')
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize system')
    } finally {
      setIsSeeding(false)
    }
  }, [loadData])

  const handleStartProduction = useCallback(async (recipe: MockRecipe) => {
    try {
      setLoading(true)
      const missingIngredients: { name: string; required: number; available: number; unit: string }[] = []
      for (const ingredient of recipe.ingredients) {
        const inventoryItem = inventory.find(item => item.name.toLowerCase() === ingredient.name.toLowerCase())
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
      const batchId = `batch-${Date.now()}`
      const updatedInventory = inventory.map(item => {
        const ingredient = recipe.ingredients.find((ing) => ing.name.toLowerCase() === item.name.toLowerCase())
        if (ingredient) {
          return { ...item, quantity: Math.max(0, item.quantity - ingredient.quantity) }
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
  }, [inventory])

  const handleUpdateInventory = useCallback(async (itemId: string, newQuantity: number) => {
    try {
      setInventory(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update inventory')
    }
  }, [])

  const getLowStockItems = useCallback(() => {
    return inventory.filter(item => item.quantity <= (item.minThreshold || 0))
  }, [inventory])

  return {
    loading, error, recipes, inventory,
    selectedRecipe, setSelectedRecipe,
    activeTab, setActiveTab,
    isSeeding,
    loadData, handleInitializeSystem, handleStartProduction, handleUpdateInventory,
    getLowStockItems,
  }
}
