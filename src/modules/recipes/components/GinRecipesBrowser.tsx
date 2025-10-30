'use client'

import { useMemo, useState } from 'react'
import { ginRecipesDataset } from '../data/gin-recipes.dataset'

function formatNumber(value: number | null | undefined, options?: Intl.NumberFormatOptions) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-AU', options).format(value)
}

export function GinRecipesBrowser() {
  const recipes = useMemo(() => [...ginRecipesDataset.recipes].sort((a, b) => a.name.localeCompare(b.name)), [])
  const [selectedIndex, setSelectedIndex] = useState(recipes.length > 0 ? 0 : -1)
  const selectedRecipe = selectedIndex >= 0 ? recipes[selectedIndex] : null

  const summary = useMemo(() => {
    if (!selectedRecipe) return null
    const totalWeight = selectedRecipe.botanicals.reduce((sum, item) => sum + (item.weight_g || 0), 0)
    const totalCost = selectedRecipe.botanicals.reduce((sum, item) => sum + (item.price_per_batch || 0), 0)
    return { totalWeight, totalCost }
  }, [selectedRecipe])

  if (recipes.length === 0) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-yellow-900">
        No gin recipes available yet. Import the dataset to get started.
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Gin Recipes</h2>
            <span className="text-xs font-medium text-gray-400">{recipes.length} total</span>
          </div>
        </div>
        <ul className="divide-y divide-gray-200">
          {recipes.map((recipe, index) => {
            const isSelected = index === selectedIndex
            return (
              <li key={recipe.name}>
                <button
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left transition ${
                    isSelected
                      ? 'bg-blue-600/10 text-blue-700 ring-1 ring-inset ring-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <div className="font-medium text-gray-900">{recipe.name}</div>
                    <div className="text-xs text-gray-500">
                      {formatNumber(recipe.last_batch.volume_l)} L · {recipe.botanicals.length} botanicals
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-500">
                    {recipe.total_cost != null ? `A$${formatNumber(recipe.total_cost, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {selectedRecipe ? (
          <div className="flex h-full flex-col">
            <div className="space-y-4 border-b border-gray-100 p-6">
              <header className="space-y-1">
                <h2 className="text-2xl font-semibold text-gray-900">{selectedRecipe.name}</h2>
                <p className="text-sm text-gray-500">
                  {formatNumber(selectedRecipe.last_batch.volume_l)} L @ {formatNumber(selectedRecipe.last_batch.abv_percent)}% ABV · Water {formatNumber(selectedRecipe.last_batch.water_l)} L
                </p>
              </header>

              <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-200 px-3 py-2">
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Total cost</dt>
                  <dd className="text-base font-semibold text-gray-900">{selectedRecipe.total_cost != null ? `A$${formatNumber(selectedRecipe.total_cost, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}</dd>
                </div>
                <div className="rounded-lg border border-gray-200 px-3 py-2">
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Batch volume</dt>
                  <dd className="text-base font-semibold text-gray-900">{formatNumber(selectedRecipe.last_batch.volume_l)} L</dd>
                </div>
                <div className="rounded-lg border border-gray-200 px-3 py-2">
                  <dt className="text-xs uppercase tracking-wide text-gray-500">ABV</dt>
                  <dd className="text-base font-semibold text-gray-900">{formatNumber(selectedRecipe.last_batch.abv_percent)}%</dd>
                </div>
                <div className="rounded-lg border border-gray-200 px-3 py-2">
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Water added</dt>
                  <dd className="text-base font-semibold text-gray-900">{formatNumber(selectedRecipe.last_batch.water_l)} L</dd>
                </div>
              </dl>
            </div>

            <section className="flex-1 overflow-hidden p-6 pt-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Botanicals</h3>
              <div className="mt-3 overflow-hidden rounded-lg border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left font-semibold">Name</th>
                      <th scope="col" className="px-4 py-2 text-right font-semibold">Weight (g)</th>
                      <th scope="col" className="px-4 py-2 text-right font-semibold">Price/kg</th>
                      <th scope="col" className="px-4 py-2 text-right font-semibold">Price/batch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {selectedRecipe.botanicals.map((botanical) => (
                      <tr key={botanical.name}>
                        <td className="px-4 py-2 font-medium text-gray-900">{botanical.name}</td>
                        <td className="px-4 py-2 text-right text-gray-700">{formatNumber(botanical.weight_g)}</td>
                        <td className="px-4 py-2 text-right text-gray-700">
                          {botanical.price_per_kg != null ? `A$${formatNumber(botanical.price_per_kg, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-700">
                          {botanical.price_per_batch != null ? `A$${formatNumber(botanical.price_per_batch, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {summary && (
                    <tfoot className="bg-gray-50 text-sm font-semibold text-gray-700">
                      <tr>
                        <td className="px-4 py-2 text-right" colSpan={1}>
                          Totals
                        </td>
                        <td className="px-4 py-2 text-right">{formatNumber(summary.totalWeight)}</td>
                        <td className="px-4 py-2 text-right">—</td>
                        <td className="px-4 py-2 text-right">A${formatNumber(summary.totalCost, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </section>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedIndex(-1)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                <span aria-hidden="true">←</span>
                Back to recipes
              </button>
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-lg border border-blue-500 bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                ✎ Edit (coming soon)
              </button>
            </footer>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-gray-500">
            <span className="text-4xl">🧪</span>
            <p className="text-sm">Select a recipe from the list to view its botanicals and batch stats.</p>
          </div>
        )}
      </div>
    </div>
  )
}
