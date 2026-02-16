'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RecipeRepository } from '../services/recipe.repository'
import type { RecipeWithIngredients, ScaledIngredient, Item } from '../types/recipe.types'

export function useRecipeDetail(recipeId: string, onRecipeUpdated?: () => void) {
  const [recipe, setRecipe] = useState<RecipeWithIngredients | null>(null)
  const [scaledIngredients, setScaledIngredients] = useState<ScaledIngredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [batchTargetL, setBatchTargetL] = useState(100)
  const [scaleFactor, setScaleFactor] = useState(1)
  const [loadingStock, setLoadingStock] = useState(false)
  const [lalWarning, setLalWarning] = useState<string | null>(null)

  // Edit mode state
  const [editing, setEditing] = useState(false)
  const [editRows, setEditRows] = useState<{ id: string; qty: number; uom: string; notes: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [allItems, setAllItems] = useState<Item[]>([])
  const [showAddRow, setShowAddRow] = useState(false)
  const [newIngItemId, setNewIngItemId] = useState('')
  const [newIngQty, setNewIngQty] = useState('')
  const [newIngUom, setNewIngUom] = useState('')
  const [newIngNotes, setNewIngNotes] = useState('')
  const [addingIng, setAddingIng] = useState(false)
  const [pendingEditRefresh, setPendingEditRefresh] = useState(false)

  // Recipe-level metadata editing
  const [editingMeta, setEditingMeta] = useState(false)
  const [metaDraftDescription, setMetaDraftDescription] = useState('')
  const [metaDraftNotes, setMetaDraftNotes] = useState('')
  const [savingMeta, setSavingMeta] = useState(false)

  const router = useRouter()
  const recipeRepo = useMemo(() => new RecipeRepository(), [])

  // Re-sync editRows when recipe changes while still in edit mode
  useEffect(() => {
    if (editing && recipe && pendingEditRefresh) {
      setEditRows(
        (recipe.ingredients || []).map((ing) => ({
          id: ing.id, qty: ing.qty_per_batch, uom: ing.uom, notes: ing.notes || '',
        }))
      )
      setPendingEditRefresh(false)
    }
  }, [editing, recipe, pendingEditRefresh])

  const loadRecipe = useCallback(async () => {
    try {
      setLoading(true)
      const data = await recipeRepo.fetchRecipeWithIngredients(recipeId)
      if (!data) { setError('Recipe not found'); return }
      setRecipe(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipe')
    } finally {
      setLoading(false)
    }
  }, [recipeRepo, recipeId])

  useEffect(() => { loadRecipe() }, [loadRecipe])

  useEffect(() => {
    if (recipe) {
      const defaultBatchL = (typeof recipe.baseline_final_l === 'number' && recipe.baseline_final_l > 0)
        ? recipe.baseline_final_l : 1000
      setBatchTargetL(defaultBatchL)
    }
  }, [recipe])

  const enterEditMode = useCallback(async () => {
    if (!recipe) return
    setEditError(null)
    setEditRows(
      (recipe.ingredients || []).map((ing) => ({
        id: ing.id, qty: ing.qty_per_batch, uom: ing.uom, notes: ing.notes || '',
      }))
    )
    setShowAddRow(false)
    setNewIngItemId(''); setNewIngQty(''); setNewIngUom(''); setNewIngNotes('')
    try {
      const items = await recipeRepo.fetchItems()
      setAllItems(items)
    } catch { /* non-critical */ }
    setEditing(true)
  }, [recipe, recipeRepo])

  const cancelEdit = useCallback(() => {
    setEditing(false); setEditError(null); setShowAddRow(false)
  }, [])

  const enterMetaEditMode = useCallback(() => {
    if (!recipe) return
    setEditError(null)
    setMetaDraftDescription(recipe.description || '')
    setMetaDraftNotes(recipe.notes || '')
    setEditingMeta(true)
  }, [recipe])

  const cancelMetaEdit = useCallback(() => {
    setEditingMeta(false); setEditError(null)
  }, [])

  const saveMetaEdits = useCallback(async () => {
    if (!recipe) return
    setSavingMeta(true); setEditError(null)
    try {
      await recipeRepo.updateRecipe(recipe.id, { description: metaDraftDescription, notes: metaDraftNotes })
      setEditingMeta(false)
      await loadRecipe()
      onRecipeUpdated?.()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to save recipe details')
    } finally { setSavingMeta(false) }
  }, [recipe, recipeRepo, metaDraftDescription, metaDraftNotes, loadRecipe, onRecipeUpdated])

  const saveEdits = useCallback(async () => {
    if (!recipe) return
    setSaving(true); setEditError(null)
    try {
      for (const row of editRows) {
        const original = recipe.ingredients.find((i) => i.id === row.id)
        if (!original) continue
        const changed = original.qty_per_batch !== row.qty || original.uom !== row.uom || (original.notes || '') !== row.notes
        if (changed) {
          await recipeRepo.updateRecipeIngredient(row.id, { qty_per_batch: row.qty, uom: row.uom, notes: row.notes || null } as any)
        }
      }
      setEditing(false)
      await loadRecipe()
      onRecipeUpdated?.()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally { setSaving(false) }
  }, [recipe, editRows, recipeRepo, loadRecipe, onRecipeUpdated])

  const handleDeleteIngredient = useCallback(async (ingredientId: string) => {
    setDeletingId(ingredientId); setEditError(null)
    try {
      await recipeRepo.removeRecipeIngredient(ingredientId)
      setEditRows((prev) => prev.filter((r) => r.id !== ingredientId))
      await loadRecipe()
      setPendingEditRefresh(true)
      onRecipeUpdated?.()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to remove ingredient')
    } finally { setDeletingId(null) }
  }, [recipeRepo, loadRecipe, onRecipeUpdated])

  const handleAddIngredient = useCallback(async () => {
    if (!recipe || !newIngItemId || !newIngQty) return
    setAddingIng(true); setEditError(null)
    try {
      await recipeRepo.addRecipeIngredient({
        organization_id: recipe.organization_id, recipe_id: recipe.id, item_id: newIngItemId,
        qty_per_batch: parseFloat(newIngQty), uom: newIngUom || 'g', step: 'blend', notes: newIngNotes || null,
      } as any)
      setNewIngItemId(''); setNewIngQty(''); setNewIngUom(''); setNewIngNotes('')
      setShowAddRow(false)
      await loadRecipe()
      setPendingEditRefresh(true)
      onRecipeUpdated?.()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to add ingredient')
    } finally { setAddingIng(false) }
  }, [recipe, newIngItemId, newIngQty, newIngUom, newIngNotes, recipeRepo, loadRecipe, onRecipeUpdated])

  const calculateScaledIngredients = useCallback(async () => {
    if (!recipe) return
    try {
      setLoadingStock(true)
      const recipeBaseL = (typeof recipe.baseline_final_l === 'number' && recipe.baseline_final_l > 0) ? recipe.baseline_final_l : 1000
      const targetABV = typeof recipe.target_abv === 'number' ? recipe.target_abv : 0.42
      const ethanolIng = (recipe.ingredients || []).find(ing => ing.item.is_alcohol)
      const ethanolAbvFraction = ethanolIng && typeof ethanolIng.item.abv_pct === 'number' ? ethanolIng.item.abv_pct / 100 : 0.82
      const baselineLAL = ethanolIng ? ethanolIng.qty_per_batch * ethanolAbvFraction : 0
      const newScaleFactor = batchTargetL / recipeBaseL
      setScaleFactor(newScaleFactor)

      if (baselineLAL > 0) {
        const expectedLAL = batchTargetL * targetABV
        const actualLAL = baselineLAL * newScaleFactor
        const tolerance = batchTargetL * 0.01
        if (Math.abs(expectedLAL - actualLAL) > tolerance) {
          const difference = actualLAL - expectedLAL
          const targetAbvPercent = (targetABV * 100).toFixed(1)
          setLalWarning(
            `⚠️ LAL Conservation Warning: Expected ${expectedLAL.toFixed(1)}L LAL, got ${actualLAL.toFixed(1)}L LAL (${difference > 0 ? '+' : ''}${difference.toFixed(1)}L difference). This may affect target ABV of ${targetAbvPercent}%.`
          )
        } else { setLalWarning(null) }
      } else { setLalWarning(null) }

      const scaled: ScaledIngredient[] = recipe.ingredients.map(ingredient => ({
        ingredient_id: ingredient.id, item: ingredient.item, original_quantity: ingredient.qty_per_batch,
        scaled_quantity: ingredient.qty_per_batch * newScaleFactor, uom: ingredient.uom, step: ingredient.step,
      }))
      setScaledIngredients(scaled)
    } catch (err) {
      console.error('Failed to calculate scaled ingredients:', err)
    } finally { setLoadingStock(false) }
  }, [recipe, batchTargetL])

  useEffect(() => { if (recipe) calculateScaledIngredients() }, [recipe, calculateScaledIngredients])

  const handleStartBatch = useCallback(() => {
    const params = new URLSearchParams({ recipeId: recipe!.id, batchTargetL: batchTargetL.toString() })
    router.push(`/dashboard/production/start-batch?${params}`)
  }, [recipe, batchTargetL, router])

  const groupedByStep = scaledIngredients.reduce((acc, ingredient) => {
    if (!acc[ingredient.step]) acc[ingredient.step] = []
    acc[ingredient.step].push(ingredient)
    return acc
  }, {} as Record<string, ScaledIngredient[]>)

  const stepOrder = ['maceration', 'distillation', 'proofing', 'bottling']
  const displayedSteps = useMemo(() => {
    const present = Object.keys(groupedByStep)
    const ordered = stepOrder.filter((s) => present.includes(s))
    const extras = present.filter((s) => !stepOrder.includes(s)).sort((a, b) => a.localeCompare(b))
    return [...ordered, ...extras]
  }, [groupedByStep])

  const parsedMeta = useMemo(() => {
    if (!recipe) return { recipeType: null, status: null, createdDate: null, traceabilityNotes: null, otherNotes: null, targetBatchSizeL: null, finalAbvProvidedPct: null }
    const description = (recipe.description || '').trim()
    const [recipeTypeRaw, statusRaw] = description.split('|').map((s) => s.trim()).filter(Boolean)
    const lines = String(recipe.notes || '').split('\n').map((l) => l.trim()).filter(Boolean)
    const createdLine = lines.find((l) => l.toLowerCase().startsWith('created:'))
    const traceLine = lines.find((l) => l.toLowerCase().startsWith('traceability:'))
    const createdDate = createdLine ? createdLine.replace(/^created:\s*/i, '').trim() : null
    const traceabilityNotes = traceLine ? traceLine.replace(/^traceability:\s*/i, '').trim() : null
    const otherNotes = lines.filter((l) => l !== createdLine && l !== traceLine).join('\n').trim()
    const targetBatchSizeL = (typeof recipe.baseline_final_l === 'number' && Number.isFinite(recipe.baseline_final_l)) ? recipe.baseline_final_l : null
    const finalAbvProvidedPct = (typeof recipe.target_abv === 'number' && Number.isFinite(recipe.target_abv)) ? recipe.target_abv * 100 : null
    return { recipeType: recipeTypeRaw || null, status: statusRaw || null, createdDate, traceabilityNotes, otherNotes: otherNotes || null, targetBatchSizeL, finalAbvProvidedPct }
  }, [recipe])

  return {
    recipe, loading, error, batchTargetL, setBatchTargetL, scaleFactor, loadingStock, lalWarning,
    scaledIngredients, groupedByStep, displayedSteps, parsedMeta,
    editing, editRows, setEditRows, saving, editError, deletingId,
    allItems, showAddRow, setShowAddRow, newIngItemId, setNewIngItemId,
    newIngQty, setNewIngQty, newIngUom, setNewIngUom, newIngNotes, setNewIngNotes, addingIng,
    editingMeta, metaDraftDescription, setMetaDraftDescription, metaDraftNotes, setMetaDraftNotes, savingMeta,
    enterEditMode, cancelEdit, saveEdits, handleDeleteIngredient, handleAddIngredient,
    enterMetaEditMode, cancelMetaEdit, saveMetaEdits,
    handleStartBatch, router,
  }
}
