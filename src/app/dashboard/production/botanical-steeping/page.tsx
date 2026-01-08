'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RecipeRepository } from '@/modules/recipes/services/recipe.repository'
import type { RecipeWithIngredients } from '@/modules/recipes/types/recipe.types'

interface Botanical {
  name: string
  weight_g: number
  adjusted_weight_g?: number
  notes?: string
}

function BotanicalSteepingContent() {
  const router = useRouter()
  const searchParams = useSearchParams() as URLSearchParams | null
  const recipeId = searchParams?.get('recipeId')
  const batchId = searchParams?.get('batchId')
  
  const [recipe, setRecipe] = useState<RecipeWithIngredients | null>(null)
  const [botanicals, setBotanicals] = useState<Botanical[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [temperature, setTemperature] = useState('')
  const [notes, setNotes] = useState('')

  // Calculate steeping duration
  const calculateDuration = (): string => {
    if (!startTime || !endTime) return '—'
    
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)
    
    let hours = endH - startH
    let minutes = endM - startM
    
    if (minutes < 0) {
      hours -= 1
      minutes += 60
    }
    
    if (hours < 0) {
      hours += 24 // crossed midnight
    }
    
    return `${hours}h ${minutes}m`
  }

  useEffect(() => {
    if (!recipeId || hasLoaded) return

    console.log('🔍 Loading recipe:', recipeId)
    
    const loadRecipe = async () => {
      try {
        setLoading(true)
        setError(null)
        setHasLoaded(true)
        console.log('📡 Fetching recipe from repository...')
        
        // Create repository instance
        const recipeRepo = new RecipeRepository()
        
        // Add timeout to prevent infinite hang
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
        )
        
        const data = await Promise.race([
          recipeRepo.fetchRecipeWithIngredients(recipeId),
          timeoutPromise
        ]) as RecipeWithIngredients | null
        
        console.log('✅ Recipe data received:', data)
        
        if (!data) {
          setError('Recipe not found')
          setLoading(false)
          return
        }
        
        setRecipe(data)
        
        // Extract botanicals from recipe ingredients
        const botanicalIngredients = data.ingredients
          .filter(ing => ing.item?.category === 'botanical')
          .map(ing => ({
            name: ing.item.name,
            weight_g: ing.qty_per_batch,
            adjusted_weight_g: ing.qty_per_batch
          }))
        
        setBotanicals(botanicalIngredients)
        
        if (botanicalIngredients.length === 0) {
          console.warn('No botanicals found for this recipe. Recipe may not have ingredients configured.')
        }
      } catch (err) {
        console.error('Error loading recipe:', err)
        setError(err instanceof Error ? err.message : 'Failed to load recipe. Please check your authentication.')
      } finally {
        setLoading(false)
      }
    }

    loadRecipe()
  }, [recipeId, hasLoaded])

  const updateBotanicalWeight = (index: number, weight: number) => {
    const updated = [...botanicals]
    updated[index] = { ...updated[index], adjusted_weight_g: weight }
    setBotanicals(updated)
  }

  const updateBotanicalNotes = (index: number, notes: string) => {
    const updated = [...botanicals]
    updated[index] = { ...updated[index], notes }
    setBotanicals(updated)
  }

  const totalWeight = botanicals.reduce((sum, b) => sum + (b.adjusted_weight_g || b.weight_g), 0)

  const handleSubmit = () => {
    if (!recipeId || !batchId) {
      setError('Missing recipe or batch ID')
      return
    }

    // Save to localStorage for now
    const steepingData = {
      recipeId,
      batchId,
      date,
      startTime,
      endTime,
      duration: calculateDuration(),
      temperature,
      botanicals,
      totalWeight,
      notes
    }
    
    localStorage.setItem('distillation_steeping', JSON.stringify(steepingData))
    
    // Navigate to heating phase
    router.push(`/dashboard/production/heating?recipeId=${recipeId}&batchId=${batchId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <div className="text-graphite">Loading recipe...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-graphite/50">
          <span>Preparation</span>
          <span>→</span>
          <span className="text-copper font-semibold">Botanical Steeping</span>
          <span>→</span>
          <span>Heating</span>
          <span>→</span>
          <span>Distillation Cuts</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-graphite">Botanical Steeping</h1>
          <p className="text-sm text-graphite/70 mt-1">
            {recipe?.name || 'Loading...'} — {batchId || 'No Batch ID'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-6">
          {/* Time & Temperature */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="steeping_date" className="block text-sm font-medium text-graphite mb-2">
                Date
              </label>
              <input
                id="steeping_date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>
            <div>
              <label htmlFor="steeping_temp" className="block text-sm font-medium text-graphite mb-2">
                Temperature (°C)
              </label>
              <input
                id="steeping_temp"
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="Optional"
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="steeping_start_time" className="block text-sm font-medium text-graphite mb-2">
                Start Time
              </label>
              <input
                id="steeping_start_time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>
            <div>
              <label htmlFor="steeping_end_time" className="block text-sm font-medium text-graphite mb-2">
                End Time
              </label>
              <input
                id="steeping_end_time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>
            <div>
              <div className="block text-sm font-medium text-graphite mb-2">
                Duration
              </div>
              <div className="w-full px-4 py-3 bg-beige border border-copper-15 rounded-lg text-graphite font-medium" aria-live="polite">
                {calculateDuration()}
              </div>
            </div>
          </div>

          {/* Botanicals Table */}
          {botanicals.length > 0 ? (
            <div className="rounded-lg border border-copper-15 overflow-hidden">
              <div className="bg-copper-10 px-4 py-3 border-b border-copper-15">
                <h3 className="font-semibold text-graphite">
                  {recipe?.name} — Botanicals
                </h3>
                <p className="text-xs text-graphite/70 mt-1">
                  Total Weight: {totalWeight.toFixed(0)}g
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-copper-5 border-b border-copper-15">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-graphite">Botanical</th>
                      <th className="text-right py-3 px-4 font-medium text-graphite">Recipe Weight (g)</th>
                      <th className="text-right py-3 px-4 font-medium text-graphite">Actual Weight (g)</th>
                      <th className="text-left py-3 px-4 font-medium text-graphite">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-copper-15">
                    {botanicals.map((botanical, i) => (
                      <tr key={i} className="hover:bg-beige">
                        <td className="py-3 px-4 text-graphite font-medium">{botanical.name}</td>
                        <td className="text-right py-3 px-4 text-graphite/70">{botanical.weight_g.toFixed(1)}</td>
                        <td className="text-right py-3 px-4">
                          <input
                            type="number"
                            value={botanical.adjusted_weight_g || botanical.weight_g}
                            onChange={(e) => updateBotanicalWeight(i, Number(e.target.value))}
                            className="w-24 px-3 py-2 text-right bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={botanical.notes || ''}
                            onChange={(e) => updateBotanicalNotes(i, e.target.value)}
                            placeholder="Optional notes..."
                            className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite text-sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
              <p className="text-graphite font-medium mb-2">No botanicals configured for this recipe</p>
              <p className="text-sm text-graphite/70">
                This recipe doesn't have botanical ingredients yet. Please select a different recipe or add ingredients to "{recipe?.name}".
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="steeping_notes" className="block text-sm font-medium text-graphite mb-2">
              Notes
            </label>
            <textarea
              id="steeping_notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Observations, aromas, texture..."
              className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <button
              onClick={() => router.push(`/dashboard/production/start-batch?recipeId=${recipeId}&batchId=${batchId}`)}
              className="px-6 py-3 bg-copper-10 hover:bg-copper-20 text-graphite rounded-lg font-medium transition-colors border border-copper-30"
            >
              ← Back to Preparation
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !recipeId || !batchId}
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

export default function BotanicalSteepingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-beige p-6" />}> 
      <BotanicalSteepingContent />
    </Suspense>
  )
}
