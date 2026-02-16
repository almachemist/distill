'use client'

import { useMemo, useState } from 'react'
import { RUM_PRODUCT_RECIPES } from '../data/rum-product-recipes.dataset'

const formatNumber = (value: number | null | undefined, options?: Intl.NumberFormatOptions) => {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-AU', options).format(value)
}

export function RumProductRecipesBrowser() {
  const recipes = useMemo(() => [...RUM_PRODUCT_RECIPES].sort((a, b) => a.name.localeCompare(b.name)), [])
  const [selectedIndex, setSelectedIndex] = useState(recipes.length > 0 ? 0 : -1)
  const selectedRecipe = selectedIndex >= 0 ? recipes[selectedIndex] : null

  const getCategoryBadge = (category: string) => {
    const badges = {
      flavored: 'bg-purple-100 text-purple-800',
      spiced: 'bg-orange-100 text-orange-800',
      dark: 'bg-amber-100 text-amber-800',
      liqueur: 'bg-pink-100 text-pink-800'
    }
    return badges[category as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* Left sidebar - Recipe list */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Rum Product Recipes</h2>
            <span className="text-xs font-medium text-gray-400">{recipes.length} total</span>
          </div>
        </div>
        <ul className="divide-y divide-gray-200">
          {recipes.map((recipe, index) => {
            const isSelected = index === selectedIndex
            return (
              <li key={recipe.id}>
                <button
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left transition ${
                    isSelected
                      ? 'bg-copper/10 text-copper ring-1 ring-inset ring-copper'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{recipe.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatNumber(recipe.base_spirit.target_volume_l)} L · {recipe.ingredients.length} ingredients
                    </div>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryBadge(recipe.category)}`}>
                      {recipe.category}
                    </span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Right panel - Recipe details */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {selectedRecipe ? (
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="space-y-4 border-b border-gray-100 p-6">
              <header className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900">{selectedRecipe.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryBadge(selectedRecipe.category)}`}>
                    {selectedRecipe.category}
                  </span>
                </div>
                {selectedRecipe.added_on && (
                  <p className="text-sm text-gray-500">Added on {selectedRecipe.added_on}</p>
                )}
              </header>

              {/* Base Spirit Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase">Target Volume</div>
                  <div className="text-lg font-semibold text-gray-900">{formatNumber(selectedRecipe.base_spirit.target_volume_l)} L</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase">Base ABV</div>
                  <div className="text-lg font-semibold text-gray-900">{formatNumber(selectedRecipe.base_spirit.source_abv_percent)}%</div>
                </div>
                {selectedRecipe.base_spirit.source_volume_l && (
                  <>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase">Source Volume</div>
                      <div className="text-lg font-semibold text-gray-900">{formatNumber(selectedRecipe.base_spirit.source_volume_l)} L</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase">Scaling Factor</div>
                      <div className="text-lg font-semibold text-gray-900">{formatNumber(selectedRecipe.base_spirit.scaling_factor, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Ingredients Table */}
            <div className="flex-1 overflow-auto p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Ingredient</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700">Scaled Amount</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedRecipe.ingredients.map((ingredient, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{ingredient.name}</td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {ingredient.amount_ml ? `${formatNumber(ingredient.amount_ml)} ml` : 
                           ingredient.amount_g ? `${formatNumber(ingredient.amount_g)} g` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {ingredient.scaled_amount_ml ? `${formatNumber(ingredient.scaled_amount_ml, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ml` : 
                           ingredient.scaled_amount_g ? `${formatNumber(ingredient.scaled_amount_g, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} g` : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{ingredient.note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedRecipe.notes && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-amber-900 mb-1">Notes</h4>
                  <p className="text-sm text-amber-800">{selectedRecipe.notes}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-12 text-center">
            <p className="text-gray-500">Select a recipe to view details</p>
          </div>
        )}
      </div>
    </div>
  )
}
