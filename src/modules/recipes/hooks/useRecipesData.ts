'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { RecipeRepository } from '../services/recipe.repository'
import { InventorySeedService } from '../services/inventory-seed.service'
import { MasterInventorySeedService } from '../services/master-inventory-seed.service'
import { RainforestGinSeedService } from '../services/rainforest-gin-seed.service'
import { SignatureGinSeedService } from '../services/signature-gin-seed.service'
import { NavyGinSeedService } from '../services/navy-gin-seed.service'
import { MMGinSeedService } from '../services/mm-gin-seed.service'
import { DrySeasonGinSeedService } from '../services/dry-season-gin-seed.service'
import { WetSeasonGinSeedService } from '../services/wet-season-gin-seed.service'
import { JsonRecipeImportService } from '../services/json-import.service'
import type { Recipe } from '../types/recipe.types'
import {
  PROVIDED_RECIPES_JSON,
  FORMULATION_RECIPES,
  REQUIRED_FORMULATION_NAMES,
  BATCH_BASELINE_MAP,
} from '../constants/seed-data'

export function useRecipesData() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeveloperTools, setShowDeveloperTools] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'updated'>('name')
  const [ginOnly, setGinOnly] = useState(false)
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)

  // Import state
  const [jsonInput, setJsonInput] = useState('')
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  // Create recipe state
  const [creatingRecipe, setCreatingRecipe] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newRecipeName, setNewRecipeName] = useState('')
  const [newRecipeDescription, setNewRecipeDescription] = useState('Experiment / Flavour trial | Experimental – Not for Sale')
  const [newRecipeNotes, setNewRecipeNotes] = useState('')
  const [newRecipeBaseL, setNewRecipeBaseL] = useState('0.2')
  const [newRecipeTargetAbvPct, setNewRecipeTargetAbvPct] = useState('')

  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
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

  const missingFormulationNames = useMemo(() => {
    const existing = new Set((recipes || []).map((r) => String(r?.name || '').trim()))
    return REQUIRED_FORMULATION_NAMES.filter((n) => !existing.has(n))
  }, [recipes])

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

  const selectedRecipe = useMemo(() => recipes.find(r => r.id === selectedRecipeId) ?? null, [recipes, selectedRecipeId])

  // --- Callbacks ---

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
      const result = await jsonImportService.importFromJson(PROVIDED_RECIPES_JSON)
      setImportMessage(`Import completed: ${result.created} created, ${result.updated} updated`)
      await loadRecipes()
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Failed to import provided JSON')
    } finally {
      setImporting(false)
    }
  }, [jsonImportService, loadRecipes])

  const handleImportFormulations = useCallback(async () => {
    try {
      setImporting(true)
      setImportMessage(null)
      setImportError(null)
      const result = await jsonImportService.importFromJson(FORMULATION_RECIPES as any)
      setImportMessage(`Formulations import completed: ${result.created} created, ${result.updated} updated`)
      await loadRecipes()
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Failed to import formulation recipes')
    } finally {
      setImporting(false)
    }
  }, [jsonImportService, loadRecipes])

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

  const importFormulationsServerSide = useCallback(async () => {
    const res = await fetch('/api/recipes/formulations/import', { method: 'POST' })
    const json = await res.json().catch(() => null)
    if (!res.ok || !json?.success) {
      const msg = String(json?.message || 'Failed to import formulation recipes')
      throw new Error(msg)
    }
    return json as { success: true; created: number; updated: number }
  }, [])

  const handleImportMissing = useCallback(async () => {
    try {
      setImportError(null)
      setImportMessage(null)
      setImporting(true)
      const result = await importFormulationsServerSide()
      setImportMessage(`Formulations import completed: ${result.created} created, ${result.updated} updated`)
      await loadRecipes()
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Failed to import formulation recipes')
    } finally {
      setImporting(false)
    }
  }, [importFormulationsServerSide, loadRecipes])

  // Generic seed runner
  const runSeed = useCallback(async (label: string, fn: () => Promise<any>) => {
    try {
      setSeeding(true)
      const result = await fn()
      const msg = result.itemsCreated !== undefined
        ? `${label} seeded successfully!\nItems: ${result.itemsCreated} created, ${result.itemsUpdated} updated\nRecipe: ${result.recipeCreated ? 'Created' : 'Updated'}`
        : result.lots !== undefined
        ? `${label} seeded successfully!\nLots: ${result.lots} created\nTransactions: ${result.transactions} created`
        : `${label} seeded successfully!\nItems: ${result.created} created, ${result.updated} updated`
      alert(msg)
      await loadRecipes()
    } catch (err) {
      alert(`Failed to seed ${label}: ` + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSeeding(false)
    }
  }, [loadRecipes])

  const seedMasterInventory = useCallback(() => runSeed('Master inventory', () => masterInventorySeedService.seedMasterInventory()), [runSeed, masterInventorySeedService])
  const seedInventoryData = useCallback(() => runSeed('Inventory', () => inventorySeedService.seedInventoryData()), [runSeed, inventorySeedService])
  const seedRainforestGin = useCallback(() => runSeed('Rainforest Gin', () => rainforestGinSeedService.seedRainforestGinData()), [runSeed, rainforestGinSeedService])
  const seedSignatureGin = useCallback(() => runSeed('Signature Dry Gin', () => signatureGinSeedService.seedSignatureGinData()), [runSeed, signatureGinSeedService])
  const seedNavyGin = useCallback(() => runSeed('Navy Strength Gin', () => navyGinSeedService.seedNavyGinData()), [runSeed, navyGinSeedService])
  const seedMMGin = useCallback(() => runSeed('MM Gin (Merchant Mae)', () => mmGinSeedService.seedMMGinData()), [runSeed, mmGinSeedService])
  const seedDrySeasonGin = useCallback(() => runSeed('Dry Season Gin (40%)', () => drySeasonGinSeedService.seedDrySeasonGinData()), [runSeed, drySeasonGinSeedService])
  const seedWetSeasonGin = useCallback(() => runSeed('Wet Season Gin (42%)', () => wetSeasonGinSeedService.seedWetSeasonGinData()), [runSeed, wetSeasonGinSeedService])

  const handleRecipeView = useCallback((recipe: Recipe) => {
    setSelectedRecipeId(recipe.id)
  }, [])

  const handleStartBatch = useCallback((recipe: Recipe) => {
    let baselineL = 100
    for (const [key, value] of Object.entries(BATCH_BASELINE_MAP)) {
      if (recipe.name.includes(key)) {
        baselineL = value
        break
      }
    }
    const params = new URLSearchParams({
      recipeId: recipe.id,
      batchTargetL: baselineL.toString()
    })
    router.push(`/dashboard/production/start-batch?${params}`)
  }, [router])

  const toggleDeveloperTools = useCallback(() => {
    setShowDeveloperTools(prev => !prev)
  }, [])

  const resolveOrganizationId = useCallback(async (): Promise<string> => {
    const { getOrganizationId } = await import('@/lib/auth/get-org-id')
    return getOrganizationId()
  }, [])

  const handleCreateRecipe = useCallback(async () => {
    try {
      setCreateError(null)
      setCreatingRecipe(true)

      const name = newRecipeName.trim()
      if (!name) throw new Error('Recipe name is required')

      const orgId = await resolveOrganizationId()
      const baselineFinalL = newRecipeBaseL.trim() ? parseFloat(newRecipeBaseL) : null
      const targetAbvPct = newRecipeTargetAbvPct.trim() ? parseFloat(newRecipeTargetAbvPct) : null

      const created = await recipeRepo.createRecipe({
        organization_id: orgId,
        name,
        description: (newRecipeDescription || '').trim() || null,
        notes: (newRecipeNotes || '').trim() || null,
        baseline_final_l: Number.isFinite(baselineFinalL as any) ? baselineFinalL : null,
        target_abv: Number.isFinite(targetAbvPct as any) ? (targetAbvPct! / 100) : null,
      } as any)

      await loadRecipes()
      setSelectedRecipeId(created.id)
      setShowCreateModal(false)
      setNewRecipeName('')
      setNewRecipeNotes('')
      setNewRecipeTargetAbvPct('')
      setNewRecipeBaseL('0.2')
      setNewRecipeDescription('Experiment / Flavour trial | Experimental – Not for Sale')
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Failed to create recipe')
    } finally {
      setCreatingRecipe(false)
    }
  }, [newRecipeName, newRecipeDescription, newRecipeNotes, newRecipeBaseL, newRecipeTargetAbvPct, recipeRepo, resolveOrganizationId, loadRecipes])

  const openCreateModal = useCallback(() => {
    setCreateError(null)
    setShowCreateModal(true)
  }, [])

  const closeCreateModal = useCallback(() => setShowCreateModal(false), [])

  const clearError = useCallback(() => {
    setError(null)
    setRecipes([])
  }, [])

  // --- Effects ---

  useEffect(() => {
    loadRecipes()
  }, [loadRecipes])

  // Auto-import formulation recipe cards in dev if they are missing
  const autoImportRan = useRef(false)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    if (importing) return
    if (autoImportRan.current) return
    if (!Array.isArray(recipes)) return

    const existingNames = new Set(recipes.map((r) => (r?.name ?? '').trim()))
    const anyMissing = REQUIRED_FORMULATION_NAMES.some((n) => !existingNames.has(n))
    if (!anyMissing) return

    let cancelled = false
    ;(async () => {
      try {
        setImporting(true)
        setImportMessage(null)
        setImportError(null)

        const result = await jsonImportService.importFromJson(FORMULATION_RECIPES as any)
        if (cancelled) return

        setImportMessage(`Formulations import completed: ${result.created} created, ${result.updated} updated`)
        await loadRecipes()
        autoImportRan.current = true
      } catch (e) {
        if (cancelled) return
        setImportError(e instanceof Error ? e.message : 'Failed to import formulation recipes')
      } finally {
        if (cancelled) return
        setImporting(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [recipes, importing, jsonImportService, loadRecipes])

  return {
    // Data
    recipes,
    loading,
    error,
    displayedRecipes,
    selectedRecipe,
    selectedRecipeId,
    missingFormulationNames,

    // UI state
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    ginOnly,
    setGinOnly,
    showDeveloperTools,
    showCreateModal,
    importing,
    importMessage,
    importError,
    seeding,
    creatingRecipe,
    createError,

    // Create recipe form
    newRecipeName,
    setNewRecipeName,
    newRecipeDescription,
    setNewRecipeDescription,
    newRecipeNotes,
    setNewRecipeNotes,
    newRecipeBaseL,
    setNewRecipeBaseL,
    newRecipeTargetAbvPct,
    setNewRecipeTargetAbvPct,

    // Import
    jsonInput,
    setJsonInput,

    // Actions
    loadRecipes,
    handleRecipeView,
    handleStartBatch,
    handleImportProvidedJson,
    handleImportFormulations,
    handleImportJson,
    handleImportMissing,
    handleCreateRecipe,
    openCreateModal,
    closeCreateModal,
    toggleDeveloperTools,
    clearError,
    setSelectedRecipeId,

    // Seed actions
    seedMasterInventory,
    seedInventoryData,
    seedRainforestGin,
    seedSignatureGin,
    seedNavyGin,
    seedMMGin,
    seedDrySeasonGin,
    seedWetSeasonGin,
  }
}
