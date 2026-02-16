'use client'

import { useRecipeDetail } from '../hooks/useRecipeDetail'
import { RecipeMetaHeader } from './recipe-detail/RecipeMetaHeader'
import { IngredientsTable } from './recipe-detail/IngredientsTable'

interface RecipeDetailProps {
  recipeId: string
  embedded?: boolean
  view?: 'all' | 'ingredients' | 'calculator' | 'summary'
  onRecipeUpdated?: () => void
}

export function RecipeDetail({ recipeId, embedded = false, view = 'all', onRecipeUpdated }: RecipeDetailProps) {
  const d = useRecipeDetail(recipeId, onRecipeUpdated)

  if (d.loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (d.error || !d.recipe) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error: {d.error || 'Recipe not found'}</p>
        <button onClick={() => d.router.back()} className="mt-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Go Back</button>
      </div>
    )
  }

  if (embedded && view === 'ingredients') {
    return (
      <div className="space-y-5">
        <RecipeMetaHeader
          recipeName={d.recipe.name}
          parsedMeta={d.parsedMeta}
          editingMeta={d.editingMeta}
          metaDraftDescription={d.metaDraftDescription}
          setMetaDraftDescription={d.setMetaDraftDescription}
          metaDraftNotes={d.metaDraftNotes}
          setMetaDraftNotes={d.setMetaDraftNotes}
          savingMeta={d.savingMeta}
          enterMetaEditMode={d.enterMetaEditMode}
          cancelMetaEdit={d.cancelMetaEdit}
          saveMetaEdits={d.saveMetaEdits}
        />
        <IngredientsTable
          recipe={d.recipe}
          editing={d.editing}
          editRows={d.editRows}
          setEditRows={d.setEditRows}
          saving={d.saving}
          editError={d.editError}
          deletingId={d.deletingId}
          showAddRow={d.showAddRow}
          setShowAddRow={d.setShowAddRow}
          allItems={d.allItems}
          newIngItemId={d.newIngItemId}
          setNewIngItemId={d.setNewIngItemId}
          newIngQty={d.newIngQty}
          setNewIngQty={d.setNewIngQty}
          newIngUom={d.newIngUom}
          setNewIngUom={d.setNewIngUom}
          newIngNotes={d.newIngNotes}
          setNewIngNotes={d.setNewIngNotes}
          addingIng={d.addingIng}
          enterEditMode={d.enterEditMode}
          cancelEdit={d.cancelEdit}
          saveEdits={d.saveEdits}
          handleDeleteIngredient={d.handleDeleteIngredient}
          handleAddIngredient={d.handleAddIngredient}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          {!embedded && (
            <button onClick={() => d.router.back()} className="text-blue-600 hover:text-blue-800 mb-2">Back to Recipes</button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{d.recipe.name}</h1>
          {embedded && (
            <div className="mt-2">
              <label htmlFor="embedded_batch_l" className="block text-sm text-gray-600 mb-1">Batelada (L)</label>
              <input type="number" min="1" step="0.1" id="embedded_batch_l" value={d.batchTargetL} onChange={(e) => d.setBatchTargetL(Number(e.target.value))}
                className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
          {!embedded && d.recipe.notes && <p className="text-gray-500 mt-1 text-sm">{d.recipe.notes}</p>}
        </div>
        {!embedded && (
          <button onClick={d.handleStartBatch} disabled={d.loadingStock} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">Start Batch</button>
        )}
      </div>

      {/* Batch Size Calculator */}
      {(view === 'all' || view === 'calculator') && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Batch Calculator</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="target_batch_size" className="block text-sm font-medium text-gray-700 mb-1">Target Batch Size (L)</label>
              <input type="number" min="1" step="0.1" id="target_batch_size" value={d.batchTargetL} onChange={(e) => d.setBatchTargetL(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1">Recipe Base Size</p>
              <p className="px-3 py-2 bg-white border border-gray-300 rounded-md">
                {d.recipe.name.includes('Rainforest Gin') ? '546' :
                 d.recipe.name.includes('Signature Dry Gin') ? '495' :
                 d.recipe.name.includes('Navy Strength Gin') ? '426' :
                 d.recipe.name.includes('MM Gin') ? '729' :
                 d.recipe.name.includes('Dry Season Gin') ? '404' :
                 d.recipe.name.includes('Wet Season Gin') ? '485' : '100'} L
              </p>
            </div>
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1">Scale Factor</p>
              <p className="px-3 py-2 bg-white border border-gray-300 rounded-md">{d.scaleFactor.toFixed(2)}x</p>
            </div>
          </div>
          {d.lalWarning && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm">{d.lalWarning.replace('⚠️ ', '')}</p>
            </div>
          )}
        </div>
      )}

      {/* Ingredients by Step */}
      {(view === 'all' || view === 'ingredients') && (
        <div className="space-y-6">
          {embedded ? (
            d.displayedSteps.map(step => {
              const stepScaled = d.groupedByStep[step]
              if (!stepScaled || stepScaled.length === 0) return null
              return (
                <div key={step} className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4 capitalize">{step} ({stepScaled.length} ingredients)</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="text-left py-2 pr-4">Ingredient</th>
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
            d.displayedSteps.map(step => {
              const stepScaled = d.groupedByStep[step]
              if (!stepScaled || stepScaled.length === 0) return null
              return (
                <div key={step} className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4 capitalize">{step} ({stepScaled.length} ingredients)</h3>
                  <div className="space-y-3">
                    {stepScaled.map((ingredient) => (
                      <div key={ingredient.ingredient_id} className={`p-4 rounded-lg border ${ingredient.scaled_quantity >= ingredient.original_quantity ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
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
