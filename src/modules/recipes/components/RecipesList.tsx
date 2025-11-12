'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RecipeRepository } from '../services/recipe.repository'
import { InventorySeedService } from '../services/inventory-seed.service'
import { MasterInventorySeedService } from '../services/master-inventory-seed.service'
import { RainforestGinSeedService } from '../services/rainforest-gin-seed.service'
import { SignatureGinSeedService } from '../services/signature-gin-seed.service'
import { NavyGinSeedService } from '../services/navy-gin-seed.service'
import { MMGinSeedService } from '../services/mm-gin-seed.service'
import { DrySeasonGinSeedService } from '../services/dry-season-gin-seed.service'
import { WetSeasonGinSeedService } from '../services/wet-season-gin-seed.service'
import type { Recipe } from '../types/recipe.types'
import { RecipeDetail } from './RecipeDetail'
import { JsonRecipeImportService } from '../services/json-import.service'

export function RecipesList() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeveloperTools, setShowDeveloperTools] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'updated'>('name')
  const [ginOnly, setGinOnly] = useState(false)
  
  const router = useRouter()
  const recipeRepo = useMemo(() => new RecipeRepository(), [])
  const inventorySeedService = useMemo(() => new InventorySeedService(), [])
  const masterInventorySeedService = useMemo(() => new MasterInventorySeedService(), [])
  const rainforestGinSeedService = useMemo(() => new RainforestGinSeedService(), [])
  const signatureGinSeedService = useMemo(() => new SignatureGinSeedService(), [])
  const navyGinSeedService = useMemo(() => new NavyGinSeedService(), [])
  const mmGinSeedService = useMemo(() => new MMGinSeedService(), [])
  const drySeasonGinSeedService = useMemo(() => new DrySeasonGinSeedService(), [])
  const wetSeasonGinSeedService = useMemo(() => new WetSeasonGinSeedService(), [])
  const jsonImportService = useMemo(() => new JsonRecipeImportService(), [])

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const displayedRecipes = filteredRecipes
    .filter(r => !ginOnly || r.name.toLowerCase().includes('gin'))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      const at = new Date(a.updated_at || a.created_at || '').getTime()
      const bt = new Date(b.updated_at || b.created_at || '').getTime()
      return bt - at
    })

  // Selection for right-side embedded details
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)

  // Dev JSON import UI state
  const [jsonInput, setJsonInput] = useState('')
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  // Provided JSON (from user)
  const providedJson = `{
  "recipes": [
    {
      "name": "Rainforest Gin",
      "botanicals": [
        { "name": "Juniper", "weight_g": 6360, "price_per_kg": 40.273, "price_per_batch": 256.14 },
        { "name": "Coriander", "weight_g": 1410, "price_per_kg": 12.852, "price_per_batch": 18.12 },
        { "name": "Angelica", "weight_g": 175, "price_per_kg": 58.17, "price_per_batch": 10.18 },
        { "name": "Cassia", "weight_g": 25, "price_per_kg": 32.5, "price_per_batch": 0.81 },
        { "name": "Lemon Myrtle", "weight_g": 141, "price_per_kg": 133.76, "price_per_batch": 18.86 },
        { "name": "Lemon Aspen", "weight_g": 71, "price_per_kg": 760, "price_per_batch": 53.96 },
        { "name": "Grapefruit peel", "weight_g": 567, "price_per_kg": 5.9, "price_per_batch": 14.22 },
        { "name": "Macadamia", "weight_g": 102, "price_per_kg": 41.67, "price_per_batch": 4.25 },
        { "name": "Liquorice", "weight_g": 51, "price_per_kg": 28.08, "price_per_batch": 1.43 },
        { "name": "Cardamon", "weight_g": 141, "price_per_kg": 64.14, "price_per_batch": 9.04 },
        { "name": "Pepperberry", "weight_g": 102, "price_per_kg": 29.75, "price_per_batch": 3.03 },
        { "name": "Vanilla", "weight_g": 25, "price_per_kg": 1500, "price_per_batch": 37.5 },
        { "name": "Mango", "weight_g": 176, "price_per_kg": 2.9, "price_per_batch": 2.9 }
      ],
      "total_cost": 430.44,
      "last_batch_volume": {
        "alcohol_l": 280,
        "abv_percent": 82,
        "water_l": 266
      }
    },
    {
      "name": "Signature Dry Gin",
      "botanicals": [
        { "name": "Juniper", "weight_g": 6400, "price_per_kg": 40.273, "price_per_batch": 257.75 },
        { "name": "Coriander", "weight_g": 1800, "price_per_kg": 12.852, "price_per_batch": 23.13 },
        { "name": "Angelica", "weight_g": 180, "price_per_kg": 58.17, "price_per_batch": 10.47 },
        { "name": "Orris Root", "weight_g": 90, "price_per_kg": 52.32, "price_per_batch": 4.71 },
        { "name": "Orange peel", "weight_g": 560, "price_per_kg": 3.99, "price_per_batch": 6.98 },
        { "name": "Lemon peel", "weight_g": 560, "price_per_kg": 6.99, "price_per_batch": 12.48 },
        { "name": "Macadamia", "weight_g": 180, "price_per_kg": 41.67, "price_per_batch": 7.5 },
        { "name": "Liquorice", "weight_g": 100, "price_per_kg": 28.08, "price_per_batch": 2.81 },
        { "name": "Cardamon", "weight_g": 180, "price_per_kg": 64.14, "price_per_batch": 11.55 },
        { "name": "Lavender", "weight_g": 40, "price_per_kg": 59.5, "price_per_batch": 2.38 }
      ],
      "total_cost": 339.76,
      "last_batch_volume": {
        "alcohol_l": 258,
        "abv_percent": 80.6,
        "water_l": 237
      }
    },
    {
      "name": "Navy Strength Gin",
      "botanicals": [
        { "name": "Juniper", "weight_g": 6400, "price_per_kg": 40.273, "price_per_batch": 257.73 },
        { "name": "Coriander", "weight_g": 1800, "price_per_kg": 12.852, "price_per_batch": 23.13 },
        { "name": "Angelica", "weight_g": 180, "price_per_kg": 58.17, "price_per_batch": 10.47 },
        { "name": "Orris Root", "weight_g": 90, "price_per_kg": 52.32, "price_per_batch": 4.71 },
        { "name": "Orange peel", "weight_g": 380, "price_per_kg": 3.99, "price_per_batch": 4.74 },
        { "name": "Lemon peel", "weight_g": 380, "price_per_kg": 6.99, "price_per_batch": 8.47 },
        { "name": "Finger Lime", "weight_g": 380, "price_per_kg": 30, "price_per_batch": 11.4 },
        { "name": "Macadamia", "weight_g": 180, "price_per_kg": 41.67, "price_per_batch": 7.5 },
        { "name": "Liquorice", "weight_g": 100, "price_per_kg": 28.08, "price_per_batch": 2.81 },
        { "name": "Cardamon", "weight_g": 180, "price_per_kg": 64.14, "price_per_batch": 11.55 },
        { "name": "Chamomile", "weight_g": 90, "price_per_kg": 32.2, "price_per_batch": 2.9 }
      ],
      "total_cost": 345.41,
      "last_batch_volume": {
        "alcohol_l": 306,
        "abv_percent": 82,
        "water_l": 120
      }
    },
    {
      "name": "MM Gin",
      "botanicals": [
        { "name": "Juniper", "weight_g": 6400, "price_per_kg": 40.273, "price_per_batch": 257.73 },
        { "name": "Coriander", "weight_g": 1800, "price_per_kg": 12.852, "price_per_batch": 23.13 },
        { "name": "Angelica", "weight_g": 180, "price_per_kg": 58.17, "price_per_batch": 10.47 },
        { "name": "Orris Root", "weight_g": 50, "price_per_kg": 52.32, "price_per_batch": 2.62 },
        { "name": "Orange", "weight_g": 380, "price_per_kg": 3.99, "price_per_batch": 1.52 },
        { "name": "Lemon", "weight_g": 380, "price_per_kg": 6.99, "price_per_batch": 2.66 },
        { "name": "Liquorice", "weight_g": 100, "price_per_kg": 28.08, "price_per_batch": 2.81 },
        { "name": "Cardamon", "weight_g": 150, "price_per_kg": 64.14, "price_per_batch": 9.62 },
        { "name": "Chamomile", "weight_g": 50, "price_per_kg": 32.2, "price_per_batch": 1.61 }
      ],
      "total_cost": 312.17,
      "last_batch_volume": {
        "alcohol_l": 332,
        "abv_percent": 82,
        "water_l": 397
      }
    },
    {
      "name": "Dry Season Gin",
      "botanicals": [
        { "name": "Juniper", "weight_g": 6250, "price_per_kg": 40.273, "price_per_batch": 251.69 },
        { "name": "Coriander Seed", "weight_g": 625, "price_per_kg": 12.852, "price_per_batch": 8.03 },
        { "name": "Angelica", "weight_g": 167, "price_per_kg": 58.17, "price_per_batch": 9.71 },
        { "name": "Cardamon", "weight_g": 83, "price_per_kg": 64.14, "price_per_batch": 5.32 },
        { "name": "Lemongrass", "weight_g": 1167 },
        { "name": "Mandarin", "weight_g": 1667 },
        { "name": "Mandarin Skin", "weight_g": 1200 },
        { "name": "Turmeric", "weight_g": 500 },
        { "name": "Rosella Flower", "weight_g": 1667 },
        { "name": "Holy Basil", "weight_g": 167 },
        { "name": "Thai Basil", "weight_g": 1000 },
        { "name": "Kaffir Lime Leaf", "weight_g": 333 }
      ],
      "total_cost": null,
      "last_batch_volume": {
        "alcohol_l": 199,
        "abv_percent": 81.4,
        "water_l": 205,
        "total_l": 404
      }
    },
    {
      "name": "Wet Season Gin",
      "botanicals": [
        { "name": "Juniper", "weight_g": 6250, "price_per_kg": 40.27, "price_per_batch": 251.69 },
        { "name": "Sawtooth Coriander", "weight_g": 625 },
        { "name": "Angelica", "weight_g": 168 },
        { "name": "Holy Basil", "weight_g": 252 },
        { "name": "Thai Sweet Basil", "weight_g": 168 },
        { "name": "Kaffir Fruit Rind", "weight_g": 832 },
        { "name": "Kaffir Leaves", "weight_g": 500 },
        { "name": "Thai Marigolds", "weight_g": 332 },
        { "name": "Galangal", "weight_g": 332 },
        { "name": "Lemongrass", "weight_g": 252 },
        { "name": "Liquorice Root", "weight_g": 84, "price_per_kg": 28.08, "price_per_batch": 2.36 },
        { "name": "Cardamon", "weight_g": 84, "price_per_kg": 64.14, "price_per_batch": 5.39 },
        { "name": "Pandanus", "weight_g": 108 }
      ],
      "total_cost": null,
      "last_batch_volume": {
        "alcohol_l": 251,
        "abv_percent": 81.3,
        "water_l": 234,
        "total_l": 485
      }
    }
  ]
}`

const loadRecipes = useCallback(async () => {
  try {
    setLoading(true)
    setError(null)
    const data = await recipeRepo.fetchRecipes()
    setRecipes(data)
    if (!selectedRecipeId && data && data.length > 0) {
      setSelectedRecipeId(data[0].id)
    }
  } catch (err) {
    console.error('Error loading recipes:', err)
    setError(err instanceof Error ? err.message : 'Failed to load recipes')
  } finally {
    setLoading(false)
  }
}, [recipeRepo, selectedRecipeId])

const handleImportProvidedJson = useCallback(async () => {
  try {
    setImporting(true)
    setImportMessage(null)
    setImportError(null)
    const payload = JSON.parse(providedJson)
    const result = await jsonImportService.importFromJson(payload)
    setImportMessage(`Import completed: ${result.created} created, ${result.updated} updated`)
    await loadRecipes()
  } catch (e) {
    setImportError(e instanceof Error ? e.message : 'Failed to import provided JSON')
  } finally {
    setImporting(false)
  }
}, [jsonImportService, providedJson, loadRecipes])

const handleImportJson = useCallback(async () => {
  try {
    setImporting(true)
    setImportMessage(null)
    setImportError(null)
    const payload = JSON.parse(jsonInput)
    const result = await jsonImportService.importFromJson(payload)
    setImportMessage(`Import completed: ${result.created} created, ${result.updated} updated`)
    await loadRecipes()
  } catch (e) {
    setImportError(e instanceof Error ? e.message : 'Failed to import JSON')
  } finally {
    setImporting(false)
  }
}, [jsonImportService, jsonInput, loadRecipes])

useEffect(() => {
  loadRecipes()
}, [loadRecipes])

// Auto-import provided JSON in dev if there are no recipes
const autoImportRan = useRef(false)
useEffect(() => {
  if (process.env.NODE_ENV === 'development' && recipes.length === 0 && !importing && !autoImportRan.current) {
    autoImportRan.current = true
    handleImportProvidedJson()
  }
}, [recipes.length, importing, handleImportProvidedJson])

const handleRecipeView = useCallback((recipe: Recipe) => {
  setSelectedRecipeId(recipe.id)
}, [])

const handleStartBatch = useCallback(
  (recipe: Recipe) => {
    let baselineL = 100
    if (recipe.name.includes('Rainforest')) baselineL = 546
    else if (recipe.name.includes('Signature')) baselineL = 495
    else if (recipe.name.includes('Navy')) baselineL = 426
    else if (recipe.name.includes('MM Gin')) baselineL = 729
    else if (recipe.name.includes('Dry Season')) baselineL = 404
    else if (recipe.name.includes('Wet Season')) baselineL = 485

    const params = new URLSearchParams({
      recipeId: recipe.id,
      batchTargetL: baselineL.toString()
    })
    router.push(`/dashboard/production/start-batch?${params}`)
  },
  [router]
)

const seedMasterInventory = useCallback(async () => {
  try {
    setSeeding(true)
    const results = await masterInventorySeedService.seedMasterInventory()
    alert(`Master inventory seeded successfully!\nItems: ${results.created} created, ${results.updated} updated`)
  } catch (err) {
    alert('Failed to seed master inventory: ' + (err instanceof Error ? err.message : 'Unknown error'))
  } finally {
    setSeeding(false)
  }
}, [masterInventorySeedService])

const seedInventoryData = useCallback(async () => {
  try {
    setSeeding(true)
    const results = await inventorySeedService.seedInventoryData()
    alert(`Inventory seeded successfully!\nLots: ${results.lots} created\nTransactions: ${results.transactions} created`)
  } catch (err) {
    alert('Failed to seed inventory: ' + (err instanceof Error ? err.message : 'Unknown error'))
  } finally {
    setSeeding(false)
  }
}, [inventorySeedService])

const seedRainforestGin = useCallback(async () => {
  try {
    setSeeding(true)
    const result = await rainforestGinSeedService.seedRainforestGinData()
    alert(`Rainforest Gin seeded successfully!\nItems: ${result.itemsCreated} created, ${result.itemsUpdated} updated\nRecipe: ${result.recipeCreated ? 'Created' : 'Updated'}`)
    await loadRecipes()
  } catch (error) {
    alert('Failed to seed Rainforest Gin: ' + (error instanceof Error ? error.message : 'Unknown error'))
  } finally {
    setSeeding(false)
  }
}, [rainforestGinSeedService, loadRecipes])

const seedSignatureGin = useCallback(async () => {
  try {
    setSeeding(true)
    const result = await signatureGinSeedService.seedSignatureGinData()
    alert(`Signature Dry Gin seeded successfully!\nItems: ${result.itemsCreated} created, ${result.itemsUpdated} updated\nRecipe: ${result.recipeCreated ? 'Created' : 'Updated'}`)
    await loadRecipes()
  } catch (error) {
    alert('Failed to seed Signature Dry Gin: ' + (error instanceof Error ? error.message : 'Unknown error'))
  } finally {
    setSeeding(false)
  }
}, [signatureGinSeedService, loadRecipes])

const seedNavyGin = useCallback(async () => {
  try {
    setSeeding(true)
    const result = await navyGinSeedService.seedNavyGinData()
    alert(`Navy Strength Gin seeded successfully!\nItems: ${result.itemsCreated} created, ${result.itemsUpdated} updated\nRecipe: ${result.recipeCreated ? 'Created' : 'Updated'}`)
    await loadRecipes()
  } catch (error) {
    alert('Failed to seed Navy Strength Gin: ' + (error instanceof Error ? error.message : 'Unknown error'))
  } finally {
    setSeeding(false)
  }
}, [navyGinSeedService, loadRecipes])

const seedMMGin = useCallback(async () => {
  try {
    setSeeding(true)
    const result = await mmGinSeedService.seedMMGinData()
    alert(`MM Gin (Merchant Mae) seeded successfully!\nItems: ${result.itemsCreated} created, ${result.itemsUpdated} updated\nRecipe: ${result.recipeCreated ? 'Created' : 'Updated'}`)
    await loadRecipes()
  } catch (error) {
    alert('Failed to seed MM Gin: ' + (error instanceof Error ? error.message : 'Unknown error'))
  } finally {
    setSeeding(false)
  }
}, [mmGinSeedService, loadRecipes])

const seedDrySeasonGin = useCallback(async () => {
  try {
    setSeeding(true)
    const result = await drySeasonGinSeedService.seedDrySeasonGinData()
    alert(`Dry Season Gin (40%) seeded successfully!\nItems: ${result.itemsCreated} created, ${result.itemsUpdated} updated\nRecipe: ${result.recipeCreated ? 'Created' : 'Updated'}`)
    await loadRecipes()
  } catch (error) {
    alert('Failed to seed Dry Season Gin: ' + (error instanceof Error ? error.message : 'Unknown error'))
  } finally {
    setSeeding(false)
  }
}, [drySeasonGinSeedService, loadRecipes])

const seedWetSeasonGin = useCallback(async () => {
  try {
    setSeeding(true)
    const result = await wetSeasonGinSeedService.seedWetSeasonGinData()
    alert(`Wet Season Gin (42%) seeded successfully!\nItems: ${result.itemsCreated} created, ${result.itemsUpdated} updated\nRecipe: ${result.recipeCreated ? 'Created' : 'Updated'}`)
    await loadRecipes()
  } catch (error) {
    alert('Failed to seed Wet Season Gin: ' + (error instanceof Error ? error.message : 'Unknown error'))
  } finally {
    setSeeding(false)
  }
}, [wetSeasonGinSeedService, loadRecipes])

const toggleDeveloperTools = useCallback(() => {
  setShowDeveloperTools(prev => !prev)
}, [])

const selectedRecipe = useMemo(() => recipes.find(r => r.id === selectedRecipeId) ?? null, [recipes, selectedRecipeId])

if (loading) {
  return (
    <div className="flex justify-center items-center min-h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}

if (error) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-red-800">Failed to load recipes</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-red-600 mt-2 p-2 bg-red-100 rounded">
              <strong>Debug:</strong> Check browser console for detailed error information. This might be due to missing data in the database.
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={loadRecipes}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={handleImportJson}
            disabled={importing || !jsonInput.trim()}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {importing ? 'Importing...' : 'Import JSON'}
          </button>
          <button
            onClick={handleImportProvidedJson}
            disabled={importing}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Import Provided JSON
          </button>
          {importMessage && <span className="text-sm text-green-800">{importMessage}</span>}
          {importError && <span className="text-sm text-red-700">{importError}</span>}
          <button 
            onClick={() => { setError(null); setRecipes([]) }}
            className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
          >
            Continue Without Data
          </button>
        </div>
      </div>
    </div>
  )
}

  return (
    <div className="space-y-8">
      {/* Search & Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="max-w-md flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span>Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'updated')}
              className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
            >
              <option value="name">Name</option>
              <option value="updated">Recently updated</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={ginOnly}
              onChange={(e) => setGinOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Show only gin</span>
          </label>
          <button
            type="button"
            onClick={toggleDeveloperTools}
            className="rounded-lg border border-dashed border-blue-400 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            {showDeveloperTools ? 'Hide developer tools' : 'Show developer tools'}
          </button>
        </div>
      </div>

      {showDeveloperTools && (
        <div className="space-y-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={seedMasterInventory}
              disabled={seeding}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              Seed master inventory
            </button>
            <button
              type="button"
              onClick={seedInventoryData}
              disabled={seeding}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              Seed inventory data
            </button>
            <button
              type="button"
              onClick={seedRainforestGin}
              disabled={seeding}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              Seed Rainforest Gin
            </button>
            <button
              type="button"
              onClick={seedSignatureGin}
              disabled={seeding}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              Seed Signature Dry Gin
            </button>
            <button
              type="button"
              onClick={seedNavyGin}
              disabled={seeding}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              Seed Navy Strength Gin
            </button>
            <button
              type="button"
              onClick={seedMMGin}
              disabled={seeding}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              Seed MM Gin
            </button>
            <button
              type="button"
              onClick={seedDrySeasonGin}
              disabled={seeding}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              Seed Dry Season Gin
            </button>
            <button
              type="button"
              onClick={seedWetSeasonGin}
              disabled={seeding}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              Seed Wet Season Gin
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-700" htmlFor="recipes-json-input">
              Import recipes JSON
            </label>
            <textarea
              id="recipes-json-input"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste recipes JSON here"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleImportJson}
                disabled={importing || !jsonInput.trim()}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
              >
                {importing ? 'Importing…' : 'Import JSON'}
              </button>
              <button
                type="button"
                onClick={handleImportProvidedJson}
                disabled={importing}
                className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 disabled:opacity-60"
              >
                Import provided sample
              </button>
            </div>
            {(importMessage || importError) && (
              <div className="text-sm">
                {importMessage && <p className="text-emerald-700">{importMessage}</p>}
                {importError && <p className="text-red-600">{importError}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recipes List + Embedded Details */}
      {displayedRecipes.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">
              {searchTerm ? 'Nenhuma receita corresponde à sua busca' : 'Nenhuma receita disponível'}
            </h3>
            {searchTerm && (
              <p className="text-sm">Tente ajustar os termos de pesquisa.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {displayedRecipes.map((recipe) => (
                  <li key={recipe.id}>
                    <button
                      onClick={() => handleRecipeView(recipe)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 ${selectedRecipeId === recipe.id ? 'bg-blue-50' : ''}`}
                    >
                      <div className="font-medium text-gray-900">{recipe.name}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Details (Ingredients only) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="space-y-4 p-4">
                {selectedRecipeId && (
                  <>
                    <RecipeDetail recipeId={selectedRecipeId} embedded view={'ingredients'} />
                    {selectedRecipe && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleStartBatch(selectedRecipe)}
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
                        >
                          Start batch from recipe
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}