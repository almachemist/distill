'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RecipeRepository } from '@/modules/recipes/services/recipe.repository'

export default function PreparationPage() {
  const router = useRouter()
  const recipeRepo = new RecipeRepository()
  
  const [recipes, setRecipes] = useState<Array<{id: string, name: string}>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [productType, setProductType] = useState<'gin' | 'vodka' | 'ethanol'>('gin')
  const [selectedRecipeId, setSelectedRecipeId] = useState('')
  const [batchId, setBatchId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('')
  const [ethanolVolume, setEthanolVolume] = useState(500)
  const [ethanolABV, setEthanolABV] = useState(96)
  const [waterVolume, setWaterVolume] = useState(500)
  const [stillUsed, setStillUsed] = useState('Carrie')
  const [otherComponents, setOtherComponents] = useState<Array<{name: string, volume: number, abv: number}>>([])
  const [notes, setNotes] = useState('')

  // Calculations
  const calculateLAL = (volume: number, abv: number): number => {
    return Math.round((volume * abv / 100) * 10) / 10
  }

  const ethanolLAL = calculateLAL(ethanolVolume, ethanolABV)
  const otherLAL = otherComponents.reduce((sum, comp) => sum + calculateLAL(comp.volume, comp.abv), 0)
  const totalVolume = ethanolVolume + waterVolume + otherComponents.reduce((sum, c) => sum + c.volume, 0)
  const totalLAL = ethanolLAL + otherLAL
  const avgABV = totalVolume > 0 ? (totalLAL / totalVolume) * 100 : 0

  const loadRecipes = useCallback(async () => {
    try {
      const data = await recipeRepo.fetchRecipes()
      setRecipes(data)
      if (data.length > 0 && !selectedRecipeId) {
        setSelectedRecipeId(data[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes')
    }
  }, [recipeRepo, selectedRecipeId])

  useEffect(() => {
    loadRecipes()
  }, [loadRecipes])

  const addOtherComponent = () => {
    setOtherComponents([...otherComponents, { name: '', volume: 0, abv: 0 }])
  }

  const updateOtherComponent = (index: number, field: 'name' | 'volume' | 'abv', value: string | number) => {
    const updated = [...otherComponents]
    updated[index] = { ...updated[index], [field]: value }
    setOtherComponents(updated)
  }

  const removeOtherComponent = (index: number) => {
    setOtherComponents(otherComponents.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    // Validation based on product type
    if (productType === 'gin' && !selectedRecipeId) {
      setError('Please select a gin recipe')
      return
    }
    if (!batchId) {
      setError('Please enter a Batch ID')
      return
    }

    // Save to localStorage for now (later we'll save to DB)
    const components = [
      {
        name: 'Ethanol',
        type: 'ethanol',
        volume_l: ethanolVolume,
        abv_percent: ethanolABV,
        lal: ethanolLAL
      },
      {
        name: 'Water',
        type: 'water',
        volume_l: waterVolume,
        abv_percent: 0,
        lal: 0
      },
      ...otherComponents.map((c: any) => ({
        name: c.name,
        type: 'other',
        volume_l: c.volume,
        abv_percent: c.abv || 0,
        lal: (c.volume * (c.abv || 0)) / 100
      }))
    ]
    
    const preparationData = {
      productType,
      recipeId: selectedRecipeId || null,
      batchId,
      date,
      startTime,
      stillUsed,
      components,
      totalVolume,
      averageABV: avgABV,
      totalLAL,
      notes
    }
    
    localStorage.setItem('distillation_preparation', JSON.stringify(preparationData))
    
    // Navigate based on product type
    if (productType === 'gin') {
      // Gin goes to botanical steeping
      router.push(`/dashboard/production/botanical-steeping?recipeId=${selectedRecipeId}&batchId=${batchId}`)
    } else {
      // Vodka and Ethanol skip botanical steeping, go directly to heating
      router.push(`/dashboard/production/heating?batchId=${batchId}`)
    }
  }

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId)

  return (
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-graphite/50">
          <span className="text-copper font-semibold">Preparation</span>
          <span>→</span>
          <span>Botanical Steeping</span>
          <span>→</span>
          <span>Heating</span>
          <span>→</span>
          <span>Distillation Cuts</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-graphite">Preparation</h1>
          <p className="text-sm text-graphite/70 mt-1">Define ethanol, water, and still setup</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-6">
          {/* Product Type Selection */}
          <div>
            <label className="block text-sm font-medium text-graphite mb-2">
              Product Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['gin', 'vodka', 'ethanol'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setProductType(type)
                    if (type !== 'gin') setSelectedRecipeId('') // Clear recipe for vodka/ethanol
                  }}
                  className={`px-4 py-3 rounded-lg font-medium transition-all capitalize ${
                    productType === type
                      ? 'bg-copper text-white shadow-md'
                      : 'bg-copper-10 text-graphite hover:bg-copper-20 border border-copper-30'
                  }`}
                >
                  {type === 'ethanol' ? 'Ethanol (Recovery)' : type}
                </button>
              ))}
            </div>
            <p className="text-xs text-graphite/50 mt-2">
              {productType === 'gin' && 'Botanical-infused neutral spirit'}
              {productType === 'vodka' && 'Pure neutral spirit, no botanicals'}
              {productType === 'ethanol' && 'Re-distillation of tails/feints for recovery'}
            </p>
          </div>

          {/* Recipe Selection (only for Gin) */}
          {productType === 'gin' && (
            <div>
              <label className="block text-sm font-medium text-graphite mb-2">
                Recipe
              </label>
              <select
                value={selectedRecipeId}
                onChange={(e) => setSelectedRecipeId(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              >
                <option value="">Select a gin recipe</option>
                {recipes.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Batch ID */}
          <div>
            <label className="block text-sm font-medium text-graphite mb-2">
              Batch ID
            </label>
            <input
              type="text"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              placeholder="e.g., SPIRIT-GIN-RF-031"
              className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>
          </div>

          {/* Ethanol */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-2">
                Ethanol Added (L)
              </label>
              <input
                type="number"
                value={ethanolVolume}
                onChange={(e) => setEthanolVolume(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite mb-2">
                Ethanol ABV (%)
              </label>
              <input
                type="number"
                value={ethanolABV}
                onChange={(e) => setEthanolABV(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>
          </div>

          {/* Water */}
          <div>
            <label className="block text-sm font-medium text-graphite mb-2">
              Water Added (L)
            </label>
            <input
              type="number"
              value={waterVolume}
              onChange={(e) => setWaterVolume(Number(e.target.value))}
              className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
            />
          </div>

          {/* Still Used */}
          <div>
            <label className="block text-sm font-medium text-graphite mb-2">
              Still Used
            </label>
            <select
              value={stillUsed}
              onChange={(e) => setStillUsed(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
            >
              <option value="Carrie">Carrie</option>
              <option value="Keri">Keri</option>
              <option value="Josephine">Josephine</option>
            </select>
          </div>

          {/* Other Components */}
          <div>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-graphite">
                  Other Components (Optional)
                </label>
                <button
                  onClick={addOtherComponent}
                  type="button"
                  className="text-sm text-copper hover:text-copper/80 font-medium"
                >
                  + Add Component
                </button>
              </div>
              <p className="text-xs text-graphite/50">
                Add any additional liquids to the charge, such as: feints/tails from previous runs, saltwater, gin heads, or recovered ethanol. Do not add botanicals here.
              </p>
            </div>
            
            {otherComponents.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-copper-30">
                      <th className="text-left py-2 px-2 font-medium text-graphite/70 text-xs uppercase">Component Name</th>
                      <th className="text-right py-2 px-2 font-medium text-graphite/70 text-xs uppercase">Volume (L)</th>
                      <th className="text-right py-2 px-2 font-medium text-graphite/70 text-xs uppercase">ABV (%)</th>
                      <th className="text-right py-2 px-2 font-medium text-graphite/70 text-xs uppercase">LAL</th>
                      <th className="py-2 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherComponents.map((comp, i) => {
                      const lal = ((comp.volume || 0) * (comp.abv || 0)) / 100
                      return (
                        <tr key={i} className="border-b border-copper-15">
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={comp.name}
                              onChange={(e) => updateOtherComponent(i, 'name', e.target.value)}
                              placeholder="e.g., Feints, Saltwater, Gin Heads"
                              className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite text-sm"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              step="0.1"
                              value={comp.volume || ''}
                              onChange={(e) => updateOtherComponent(i, 'volume', Number(e.target.value))}
                              placeholder="0.0"
                              className="w-24 px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite text-sm text-right"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              step="0.1"
                              value={comp.abv || ''}
                              onChange={(e) => updateOtherComponent(i, 'abv', Number(e.target.value))}
                              placeholder="0.0"
                              className="w-20 px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite text-sm text-right"
                            />
                          </td>
                          <td className="py-2 px-2 text-right text-graphite/70 font-mono text-sm">
                            {lal.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-right">
                            <button
                              type="button"
                              onClick={() => removeOtherComponent(i)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium border border-red-200 transition-colors"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-graphite mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Warm-up 70°C previous day; 50°C at 06:00; turn on 35A..."
              className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite resize-none"
            />
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-br from-beige to-copper-5 rounded-xl p-5 border border-copper-15">
            <h3 className="text-sm font-semibold text-graphite mb-3">Charge Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-graphite/70 mb-1">Total Volume</div>
                <div className="text-2xl font-bold text-graphite">{totalVolume.toFixed(1)} L</div>
              </div>
              <div>
                <div className="text-xs text-graphite/70 mb-1">Average ABV</div>
                <div className="text-2xl font-bold text-copper">{avgABV.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-xs text-graphite/70 mb-1">Total LAL</div>
                <div className="text-2xl font-bold text-graphite">{totalLAL.toFixed(1)}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedRecipeId || !batchId}
              className="px-6 py-3 bg-copper hover:bg-copper/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save & Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
