'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createDraftBatch } from '../services/production-draft.repository'
import { getGinVodkaSpiritRecipes, getRumCaneSpiritRecipes } from '../services/recipe.repository'
import type { ProductType } from '@/types/production-schemas'
import type { Recipe } from '@/types/recipe-schemas'

interface NewProductionModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

type ProductCategory = 'gin_vodka' | 'rum_cane'
type Step = 'category' | 'recipe'

export function NewProductionModal({
  isOpen,
  onClose,
  onCreated,
}: NewProductionModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('category')
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setStep('category')
      setSelectedCategory(null)
      setSelectedRecipe(null)
      setRecipes([])
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedCategory) {
      loadRecipes()
    }
  }, [selectedCategory])

  async function loadRecipes() {
    setIsLoading(true)
    try {
      if (selectedCategory === 'gin_vodka') {
        const data = await getGinVodkaSpiritRecipes()
        console.log('Loaded gin/vodka recipes:', data)
        setRecipes(data)
      } else if (selectedCategory === 'rum_cane') {
        const data = await getRumCaneSpiritRecipes()
        console.log('Loaded rum/cane recipes:', data)
        setRecipes(data)
      }
    } catch (error) {
      console.error('Error loading recipes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleCategorySelect(category: ProductCategory) {
    setSelectedCategory(category)
    setStep('recipe')
  }

  async function handleCreateBatch() {
    if (!selectedRecipe) return

    setIsCreating(true)
    try {
      const batch = await createDraftBatch(selectedRecipe.productType, selectedRecipe)
      if (batch) {
        onCreated()
        // Navigate to edit page with recipe reference
        router.push(`/dashboard/production/edit/${batch.id}?recipeId=${selectedRecipe.id}`)
      }
    } catch (error) {
      console.error('Error creating batch:', error)
    } finally {
      setIsCreating(false)
    }
  }

  function handleBack() {
    setStep('category')
    setSelectedCategory(null)
    setSelectedRecipe(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
          {/* Step 1: Category Selection */}
          {step === 'category' && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-neutral-900">
                  What are you producing?
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Select the category of product
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <button
                  onClick={() => handleCategorySelect('gin_vodka')}
                  className="p-8 rounded-lg border-2 border-neutral-200 hover:border-amber-600 hover:bg-amber-50 transition-all text-left group"
                >
                  <div className="text-lg font-semibold text-neutral-900 mb-2">
                    Gin / Vodka / Spirits
                  </div>
                  <div className="text-sm text-neutral-600">
                    Botanical spirits, neutral spirits, and distilled products
                  </div>
                </button>

                <button
                  onClick={() => handleCategorySelect('rum_cane')}
                  className="p-8 rounded-lg border-2 border-neutral-200 hover:border-amber-600 hover:bg-amber-50 transition-all text-left group"
                >
                  <div className="text-lg font-semibold text-neutral-900 mb-2">
                    Rum / Cane Spirit
                  </div>
                  <div className="text-sm text-neutral-600">
                    Molasses rum, cane juice spirits, and aged products
                  </div>
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {/* Step 2: Recipe Selection */}
          {step === 'recipe' && (
            <>
              <div className="mb-6">
                <button
                  onClick={handleBack}
                  className="text-sm text-neutral-600 hover:text-neutral-900 mb-4 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <h2 className="text-xl font-semibold text-neutral-900">
                  Select Recipe
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Choose a recipe to use as a template for your production batch
                </p>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
                  <p className="mt-2 text-sm text-neutral-600">Loading recipes...</p>
                </div>
              ) : recipes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-600">No recipes found for this category.</p>
                  <p className="text-sm text-neutral-500 mt-2">
                    You can create a batch without a recipe template.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 mb-6 max-h-96 overflow-y-auto">
                  {recipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => setSelectedRecipe(recipe)}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-left
                        ${
                          selectedRecipe?.id === recipe.id
                            ? 'border-amber-600 bg-amber-50'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }
                      `}
                    >
                      <div className="font-semibold text-neutral-900">{recipe.recipeName}</div>
                      {recipe.description && (
                        <div className="text-sm text-neutral-600 mt-1">{recipe.description}</div>
                      )}
                      <div className="text-xs text-neutral-500 mt-2 capitalize">
                        {recipe.productType.replace('_', ' ')}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleBack}
                  disabled={isCreating}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateBatch}
                  disabled={!selectedRecipe || isCreating}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-700 border border-transparent rounded-md hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create Batch'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

