'use client'

import { useState } from 'react'
import { RumRecipeCalculatorService, type CalculatorOutput } from '../services/rum-recipe-calculator.service'

const calculator = new RumRecipeCalculatorService()

export function RumRecipeCalculator() {
  const [inputVolume, setInputVolume] = useState<string>('96')
  const [inputABV, setInputABV] = useState<string>('60')
  const [selectedRecipe, setSelectedRecipe] = useState<string>('pineapple_rum')
  const [result, setResult] = useState<CalculatorOutput | null>(null)
  const [error, setError] = useState<string | null>(null)

  const recipes = calculator.getAvailableRecipes()

  const handleCalculate = () => {
    try {
      setError(null)
      
      const volume = parseFloat(inputVolume)
      const abv = parseFloat(inputABV)

      if (isNaN(volume) || volume <= 0) {
        setError('Please enter a valid volume')
        return
      }

      if (isNaN(abv) || abv <= 0 || abv > 100) {
        setError('Please enter a valid ABV (0-100)')
        return
      }

      const output = calculator.calculate({
        input_volume_l: volume,
        input_abv: abv,
        recipe_name: selectedRecipe
      })

      setResult(output)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed')
      setResult(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold">Rum Recipe Calculator</h2>
        <p className="text-amber-100 mt-1">Calculate water dilution and ingredient scaling</p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter Your Rum Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Volume Input */}
          <div>
            <label htmlFor="rum_volume" className="block text-sm font-medium text-gray-700 mb-2">
              Rum Volume (L)
            </label>
            <input
              type="number"
              id="rum_volume"
              value={inputVolume}
              onChange={(e) => setInputVolume(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="96"
              step="0.1"
            />
          </div>

          {/* ABV Input */}
          <div>
            <label htmlFor="current_abv" className="block text-sm font-medium text-gray-700 mb-2">
              Current ABV (%)
            </label>
            <input
              type="number"
              id="current_abv"
              value={inputABV}
              onChange={(e) => setInputABV(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="60"
              step="0.1"
            />
          </div>

          {/* Recipe Selection */}
          <div>
            <label htmlFor="recipe_select" className="block text-sm font-medium text-gray-700 mb-2">
              Recipe
            </label>
            <select
              id="recipe_select"
              value={selectedRecipe}
              onChange={(e) => setSelectedRecipe(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {recipes.map(recipe => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={handleCalculate}
          className="mt-6 w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          Calculate
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            Error: {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Dilution Results */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dilution Calculation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-blue-700">Water to Add</div>
                <div className="text-2xl font-bold text-blue-900">{result.water_to_add_l.toFixed(2)} L</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-green-700">Final Volume</div>
                <div className="text-2xl font-bold text-green-900">{result.total_volume_l.toFixed(2)} L</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-purple-700">Target ABV</div>
                <div className="text-2xl font-bold text-purple-900">{result.target_abv.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Scaling Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scaling Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Master Batch Size:</span>
                <span className="ml-2 font-semibold text-gray-900">{result.master_batch_l} L</span>
              </div>
              <div>
                <span className="text-gray-600">Scale Factor:</span>
                <span className="ml-2 font-semibold text-gray-900">{result.scale_factor.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scaled Ingredients</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Ingredient</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Original</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Scaled Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {result.ingredients.map((ing, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{ing.name}</td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {ing.original_amount.toFixed(2)} {ing.original_unit}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-amber-600">
                        {ing.scaled_amount.toFixed(2)} {ing.scaled_unit}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{ing.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
