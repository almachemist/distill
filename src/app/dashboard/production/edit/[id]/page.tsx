"use client"

import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { getDraftBatch, updateDraftBatch } from '@/modules/production/services/production-draft.repository'
import { getRecipeById } from '@/modules/production/services/recipe.repository'
import { DynamicProductionForm } from '@/modules/production/components/DynamicProductionForm'
import type { ProductionBatch, GinVodkaSpiritBatch } from '@/types/production-schemas'
import { isGinVodkaSpiritBatch } from '@/types/production-schemas'
import type { Recipe } from '@/types/recipe-schemas'

function EditProductionContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const id = params.id as string
  const recipeId = searchParams.get('recipeId')
  
  const [batch, setBatch] = useState<ProductionBatch | null>(null)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [id, recipeId])

  async function loadData() {
    setIsLoading(true)
    try {
      // Load batch - getDraftBatch will try both tables if productType not specified
      const productType = searchParams.get('type') as any
      const batchData = await getDraftBatch(id, productType)
      if (batchData) {
        setBatch(batchData)

        // Load recipe from URL param OR from batch data (only for gin/vodka batches)
        let recipeIdToLoad = recipeId
        if (!recipeIdToLoad && isGinVodkaSpiritBatch(batchData)) {
          recipeIdToLoad = batchData.recipeId || null
        }

        if (recipeIdToLoad) {
          const recipeData = await getRecipeById(recipeIdToLoad)
          if (recipeData) {
            setRecipe(recipeData)
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave() {
    if (!batch) return

    setIsSaving(true)
    try {
      // Get productType from batch or URL
      const productType = batch.productType || (searchParams.get('type') as any)
      console.log('handleSave - About to save batch:', {
        id: batch.id,
        productType,
        batchKeys: Object.keys(batch),
        batchSample: JSON.stringify(batch).substring(0, 300)
      })
      const result = await updateDraftBatch(batch.id!, batch, productType)
      console.log('handleSave - Save result:', result ? 'Success' : 'Failed')

      if (!result) {
        alert('Failed to save batch. Check console for details.')
      }
    } catch (error) {
      console.error('Error saving batch:', error)
      alert('Error saving batch: ' + (error as any)?.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
          <p className="mt-4 text-neutral-600">Loading batch...</p>
        </div>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Batch not found</h2>
          <p className="text-neutral-600 mb-6">The batch you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/dashboard/production/new')}
            className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800"
          >
            Back to Production
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/dashboard/production/new')}
                className="text-sm text-neutral-600 hover:text-neutral-900 mb-2 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Production
              </button>
              <h1 className="text-2xl font-semibold text-neutral-900">
                Edit Production Batch
              </h1>
              <p className="mt-1 text-sm text-neutral-600">
                {batch.id} - {batch.productType}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {recipe && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  Using recipe: {recipe.recipeName}
                </h3>
                {recipe.description && (
                  <p className="text-sm text-blue-700 mt-1">{recipe.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <DynamicProductionForm
          batch={batch as GinVodkaSpiritBatch}
          recipe={recipe}
          onUpdate={(updatedBatch) => setBatch(updatedBatch)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>
    </div>
  )
}

export default function EditProductionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50" />}> 
      <EditProductionContent />
    </Suspense>
  )
}
