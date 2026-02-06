'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RecipeRepository } from '../services/recipe.repository'
import type { RecipeWithIngredients, ScaledIngredient, Item } from '../types/recipe.types'

interface RecipeDetailProps {
  recipeId: string
  embedded?: boolean
  view?: 'all' | 'ingredients' | 'calculator' | 'summary'
  onRecipeUpdated?: () => void
}

export function RecipeDetail({ recipeId, embedded = false, view = 'all', onRecipeUpdated }: RecipeDetailProps) {
  const [recipe, setRecipe] = useState<RecipeWithIngredients | null>(null)
  const [scaledIngredients, setScaledIngredients] = useState<ScaledIngredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [batchTargetL, setBatchTargetL] = useState(100) // Will be set based on recipe
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

  // Re-sync editRows when recipe changes while still in edit mode
  useEffect(() => {
    if (editing && recipe && pendingEditRefresh) {
      setEditRows(
        (recipe.ingredients || []).map((ing) => ({
          id: ing.id,
          qty: ing.qty_per_batch,
          uom: ing.uom,
          notes: ing.notes || '',
        }))
      )
      setPendingEditRefresh(false)
    }
  }, [editing, recipe, pendingEditRefresh])

  const router = useRouter()
  const recipeRepo = useMemo(() => new RecipeRepository(), [])

  const loadRecipe = useCallback(async () => {
    try {
      setLoading(true)
      const data = await recipeRepo.fetchRecipeWithIngredients(recipeId)
      if (!data) {
        setError('Recipe not found')
        return
      }
      setRecipe(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipe')
    } finally {
      setLoading(false)
    }
  }, [recipeRepo, recipeId])

  useEffect(() => {
    loadRecipe()
  }, [loadRecipe])

  useEffect(() => {
    if (recipe) {
      // Set default batch target based on recipe baseline volume
      const defaultBatchL = (typeof recipe.baseline_final_l === 'number' && recipe.baseline_final_l > 0)
        ? recipe.baseline_final_l
        : 1000
      setBatchTargetL(defaultBatchL)
    }
  }, [recipe])

  const enterEditMode = useCallback(async () => {
    if (!recipe) return
    setEditError(null)
    setEditRows(
      (recipe.ingredients || []).map((ing) => ({
        id: ing.id,
        qty: ing.qty_per_batch,
        uom: ing.uom,
        notes: ing.notes || '',
      }))
    )
    setShowAddRow(false)
    setNewIngItemId('')
    setNewIngQty('')
    setNewIngUom('')
    setNewIngNotes('')
    // Load items for the add-ingredient dropdown
    try {
      const items = await recipeRepo.fetchItems()
      setAllItems(items)
    } catch {
      // non-critical
    }
    setEditing(true)
  }, [recipe, recipeRepo])

  const cancelEdit = useCallback(() => {
    setEditing(false)
    setEditError(null)
    setShowAddRow(false)
  }, [])

  const enterMetaEditMode = useCallback(() => {
    if (!recipe) return
    setEditError(null)
    setMetaDraftDescription(recipe.description || '')
    setMetaDraftNotes(recipe.notes || '')
    setEditingMeta(true)
  }, [recipe])

  const cancelMetaEdit = useCallback(() => {
    setEditingMeta(false)
    setEditError(null)
  }, [])

  const saveMetaEdits = useCallback(async () => {
    if (!recipe) return
    setSavingMeta(true)
    setEditError(null)
    try {
      await recipeRepo.updateRecipe(recipe.id, {
        description: metaDraftDescription,
        notes: metaDraftNotes,
      })
      setEditingMeta(false)
      await loadRecipe()
      onRecipeUpdated?.()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to save recipe details')
    } finally {
      setSavingMeta(false)
    }
  }, [recipe, recipeRepo, metaDraftDescription, metaDraftNotes, loadRecipe, onRecipeUpdated])

  const saveEdits = useCallback(async () => {
    if (!recipe) return
    setSaving(true)
    setEditError(null)
    try {
      for (const row of editRows) {
        const original = recipe.ingredients.find((i) => i.id === row.id)
        if (!original) continue
        const changed =
          original.qty_per_batch !== row.qty ||
          original.uom !== row.uom ||
          (original.notes || '') !== row.notes
        if (changed) {
          await recipeRepo.updateRecipeIngredient(row.id, {
            qty_per_batch: row.qty,
            uom: row.uom,
            notes: row.notes || null,
          } as any)
        }
      }
      setEditing(false)
      await loadRecipe()
      onRecipeUpdated?.()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }, [recipe, editRows, recipeRepo, loadRecipe, onRecipeUpdated])

  const handleDeleteIngredient = useCallback(async (ingredientId: string) => {
    setDeletingId(ingredientId)
    setEditError(null)
    try {
      await recipeRepo.removeRecipeIngredient(ingredientId)
      setEditRows((prev) => prev.filter((r) => r.id !== ingredientId))
      await loadRecipe()
      setPendingEditRefresh(true)
      onRecipeUpdated?.()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to remove ingredient')
    } finally {
      setDeletingId(null)
    }
  }, [recipeRepo, loadRecipe, onRecipeUpdated])

  const handleAddIngredient = useCallback(async () => {
    if (!recipe || !newIngItemId || !newIngQty) return
    setAddingIng(true)
    setEditError(null)
    try {
      const orgId = recipe.organization_id
      await recipeRepo.addRecipeIngredient({
        organization_id: orgId,
        recipe_id: recipe.id,
        item_id: newIngItemId,
        qty_per_batch: parseFloat(newIngQty),
        uom: newIngUom || 'g',
        step: 'blend',
        notes: newIngNotes || null,
      } as any)
      setNewIngItemId('')
      setNewIngQty('')
      setNewIngUom('')
      setNewIngNotes('')
      setShowAddRow(false)
      await loadRecipe()
      setPendingEditRefresh(true)
      onRecipeUpdated?.()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to add ingredient')
    } finally {
      setAddingIng(false)
    }
  }, [recipe, newIngItemId, newIngQty, newIngUom, newIngNotes, recipeRepo, loadRecipe, onRecipeUpdated])

  const calculateScaledIngredients = useCallback(async () => {
    if (!recipe) return

    try {
      setLoadingStock(true)
      
      // Determine baseline based on recipe baseline volume (default 1000L)
      const recipeBaseL = (typeof recipe.baseline_final_l === 'number' && recipe.baseline_final_l > 0) ? recipe.baseline_final_l : 1000
      const targetABV = typeof recipe.target_abv === 'number' ? recipe.target_abv : 0.42

      // Compute baseline LAL from ethanol ingredient if available
      const ethanolIng = (recipe.ingredients || []).find(ing => ing.item.is_alcohol)
      const ethanolAbvFraction = ethanolIng && typeof ethanolIng.item.abv_pct === 'number' ? ethanolIng.item.abv_pct / 100 : 0.82
      const baselineLAL = ethanolIng ? ethanolIng.qty_per_batch * ethanolAbvFraction : 0

      const newScaleFactor = batchTargetL / recipeBaseL
      setScaleFactor(newScaleFactor)

      // LAL conservation check for gin recipes
      if (baselineLAL > 0) {
        const expectedLAL = batchTargetL * targetABV
        const actualLAL = baselineLAL * newScaleFactor
        const tolerance = batchTargetL * 0.01 // 1% tolerance
        
        if (Math.abs(expectedLAL - actualLAL) > tolerance) {
          const difference = actualLAL - expectedLAL
          const targetAbvPercent = (targetABV * 100).toFixed(1)
          setLalWarning(
            `⚠️ LAL Conservation Warning: Expected ${expectedLAL.toFixed(1)}L LAL, got ${actualLAL.toFixed(1)}L LAL (${difference > 0 ? '+' : ''}${difference.toFixed(1)}L difference). This may affect target ABV of ${targetAbvPercent}%.`
          )
        } else {
          setLalWarning(null)
        }
      } else {
        setLalWarning(null)
      }

      const scaled: ScaledIngredient[] = []

      for (const ingredient of recipe.ingredients) {
        const scaledQty = ingredient.qty_per_batch * newScaleFactor
        scaled.push({
          ingredient_id: ingredient.id,
          item: ingredient.item,
          original_quantity: ingredient.qty_per_batch,
          scaled_quantity: scaledQty,
          uom: ingredient.uom,
          step: ingredient.step
        })
      }

      setScaledIngredients(scaled)
    } catch (err) {
      console.error('Failed to calculate scaled ingredients:', err)
    } finally {
      setLoadingStock(false)
    }
  }, [recipe, batchTargetL])

  useEffect(() => {
    if (recipe) {
      calculateScaledIngredients()
    }
  }, [recipe, calculateScaledIngredients])

  const handleStartBatch = () => {
    const params = new URLSearchParams({
      recipeId: recipe!.id,
      batchTargetL: batchTargetL.toString()
    })
    router.push(`/dashboard/production/start-batch?${params}`)
  }

  const groupedByStep = scaledIngredients.reduce((acc, ingredient) => {
    if (!acc[ingredient.step]) {
      acc[ingredient.step] = []
    }
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
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error: {error || 'Recipe not found'}</p>
        <button 
          onClick={() => router.back()}
          className="mt-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Go Back
        </button>
      </div>
    )
  }

  const parsedMeta = (() => {
    const description = (recipe.description || '').trim()
    const [recipeTypeRaw, statusRaw] = description.split('|').map((s) => s.trim()).filter(Boolean)

    const lines = String(recipe.notes || '').split('\n').map((l) => l.trim()).filter(Boolean)
    const createdLine = lines.find((l) => l.toLowerCase().startsWith('created:'))
    const traceLine = lines.find((l) => l.toLowerCase().startsWith('traceability:'))

    const createdDate = createdLine ? createdLine.replace(/^created:\s*/i, '').trim() : null
    const traceabilityNotes = traceLine ? traceLine.replace(/^traceability:\s*/i, '').trim() : null

    const otherNotes = lines
      .filter((l) => l !== createdLine && l !== traceLine)
      .join('\n')
      .trim()

    const targetBatchSizeL = (typeof recipe.baseline_final_l === 'number' && Number.isFinite(recipe.baseline_final_l))
      ? recipe.baseline_final_l
      : null

    const finalAbvProvidedPct = (typeof recipe.target_abv === 'number' && Number.isFinite(recipe.target_abv))
      ? recipe.target_abv * 100
      : null

    return {
      recipeType: recipeTypeRaw || null,
      status: statusRaw || null,
      createdDate,
      traceabilityNotes,
      otherNotes: otherNotes || null,
      targetBatchSizeL,
      finalAbvProvidedPct,
    }
  })()

  if (embedded && view === 'ingredients') {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">{recipe.name}</h2>

          <div className="flex flex-wrap items-center justify-between gap-2">
            {(parsedMeta.recipeType || parsedMeta.status) && !editingMeta && (
              <div className="flex flex-wrap gap-2 text-sm">
                {parsedMeta.recipeType && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-800">
                    {parsedMeta.recipeType}
                  </span>
                )}
                {parsedMeta.status && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                    {parsedMeta.status}
                  </span>
                )}
              </div>
            )}

            {!editingMeta ? (
              <button
                type="button"
                onClick={enterMetaEditMode}
                className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
              >
                Edit recipe details
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveMetaEdits}
                  disabled={savingMeta}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {savingMeta ? 'Saving…' : 'Save details'}
                </button>
                <button
                  type="button"
                  onClick={cancelMetaEdit}
                  disabled={savingMeta}
                  className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {parsedMeta.createdDate && (
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Created</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{parsedMeta.createdDate}</div>
            </div>
          )}
          {parsedMeta.targetBatchSizeL != null && (
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Target batch size</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{parsedMeta.targetBatchSizeL} L</div>
            </div>
          )}
          {parsedMeta.finalAbvProvidedPct != null && (
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Final ABV (provided)</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{parsedMeta.finalAbvProvidedPct.toFixed(2)}%</div>
            </div>
          )}
        </div>

        {editingMeta ? (
          <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Type / Status (description)</div>
              <textarea
                value={metaDraftDescription}
                onChange={(e) => setMetaDraftDescription(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Notes</div>
              <textarea
                value={metaDraftNotes}
                onChange={(e) => setMetaDraftNotes(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ) : (
          <>
            {parsedMeta.traceabilityNotes && (
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Traceability</div>
                <div className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{parsedMeta.traceabilityNotes}</div>
              </div>
            )}

            {parsedMeta.otherNotes && (
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Notes</div>
                <div className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{parsedMeta.otherNotes}</div>
              </div>
            )}
          </>
        )}

        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Ingredients</h3>
            {!editing ? (
              <button
                type="button"
                onClick={enterEditMode}
                className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveEdits}
                  disabled={saving}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {editError && (
            <div className="mx-4 mt-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {editError}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Ingredient</th>
                  <th className="px-4 py-3 text-right font-semibold">Quantity</th>
                  <th className="px-4 py-3 text-left font-semibold">Unit</th>
                  <th className="px-4 py-3 text-right font-semibold">ABV</th>
                  <th className="px-4 py-3 text-left font-semibold">Notes</th>
                  {editing && <th className="px-4 py-3 text-center font-semibold w-16"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {(recipe.ingredients || []).map((ing) => {
                  const abv = typeof ing.item?.abv_pct === 'number' ? ing.item.abv_pct : null
                  const editRow = editRows.find((r) => r.id === ing.id)

                  if (editing && editRow) {
                    return (
                      <tr key={ing.id} className="bg-blue-50/30">
                        <td className="px-4 py-2 font-medium text-gray-900">{ing.item?.name || '—'}</td>
                        <td className="px-4 py-2 text-right">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={editRow.qty}
                            onChange={(e) =>
                              setEditRows((prev) =>
                                prev.map((r) =>
                                  r.id === ing.id ? { ...r, qty: parseFloat(e.target.value) || 0 } : r
                                )
                              )
                            }
                            className="w-24 rounded border border-gray-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editRow.uom}
                            onChange={(e) =>
                              setEditRows((prev) =>
                                prev.map((r) =>
                                  r.id === ing.id ? { ...r, uom: e.target.value } : r
                                )
                              )
                            }
                            className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2 text-right text-gray-700">{abv != null ? `${abv}%` : '—'}</td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editRow.notes}
                            onChange={(e) =>
                              setEditRows((prev) =>
                                prev.map((r) =>
                                  r.id === ing.id ? { ...r, notes: e.target.value } : r
                                )
                              )
                            }
                            placeholder="—"
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteIngredient(ing.id)}
                            disabled={deletingId === ing.id}
                            className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                            title="Remove ingredient"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )
                  }

                  return (
                    <tr key={ing.id}>
                      <td className="px-4 py-3 font-medium text-gray-900">{ing.item?.name || '—'}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{Number.isFinite(ing.qty_per_batch) ? ing.qty_per_batch : '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{ing.uom || '—'}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{abv != null ? `${abv}%` : '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{ing.notes || '—'}</td>
                    </tr>
                  )
                })}

                {/* Add ingredient row */}
                {editing && showAddRow && (
                  <tr className="bg-green-50/30">
                    <td className="px-4 py-2">
                      <select
                        value={newIngItemId}
                        onChange={(e) => setNewIngItemId(e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select item…</option>
                        {allItems
                          .filter((it) => !(recipe.ingredients || []).some((ing) => ing.item_id === it.id))
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((it) => (
                            <option key={it.id} value={it.id}>
                              {it.name}{it.is_alcohol && it.abv_pct ? ` (${it.abv_pct}%)` : ''}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={newIngQty}
                        onChange={(e) => setNewIngQty(e.target.value)}
                        placeholder="0"
                        className="w-24 rounded border border-gray-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={newIngUom}
                        onChange={(e) => setNewIngUom(e.target.value)}
                        placeholder="g"
                        className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2 text-right text-gray-400">—</td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={newIngNotes}
                        onChange={(e) => setNewIngNotes(e.target.value)}
                        placeholder="Optional"
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={handleAddIngredient}
                        disabled={addingIng || !newIngItemId || !newIngQty}
                        className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-500 disabled:opacity-40"
                      >
                        {addingIng ? '…' : 'Add'}
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add ingredient button */}
          {editing && !showAddRow && (
            <div className="border-t border-gray-100 px-4 py-3">
              <button
                type="button"
                onClick={() => setShowAddRow(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add ingredient
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          {!embedded && (
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-800 mb-2"
            >
              Back to Recipes
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{recipe.name}</h1>
          {embedded && (
            <div className="mt-2">
              <label htmlFor="embedded_batch_l" className="block text-sm text-gray-600 mb-1">Batelada (L)</label>
              <input
                type="number"
                min="1"
                step="0.1"
                id="embedded_batch_l"
                value={batchTargetL}
                onChange={(e) => setBatchTargetL(Number(e.target.value))}
                className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {!embedded && recipe.notes && (
            <p className="text-gray-500 mt-1 text-sm">{recipe.notes}</p>
          )}
        </div>
        {!embedded && (
          <button
            onClick={handleStartBatch}
            disabled={loadingStock}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Start Batch
          </button>
        )}
      </div>

      {/* Batch Size Calculator */}
      {(view === 'all' || view === 'calculator') && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Batch Calculator</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="target_batch_size" className="block text-sm font-medium text-gray-700 mb-1">
              Target Batch Size (L)
            </label>
            <input
              type="number"
              min="1"
              step="0.1"
              id="target_batch_size"
              value={batchTargetL}
              onChange={(e) => setBatchTargetL(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-1">Recipe Base Size</p>
            <p className="px-3 py-2 bg-white border border-gray-300 rounded-md">
              {recipe.name.includes('Rainforest Gin') ? '546' : 
               recipe.name.includes('Signature Dry Gin') ? '495' : 
               recipe.name.includes('Navy Strength Gin') ? '426' : 
               recipe.name.includes('MM Gin') ? '729' : 
               recipe.name.includes('Dry Season Gin') ? '404' :
               recipe.name.includes('Wet Season Gin') ? '485' : '100'} L
            </p>
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-1">Scale Factor</p>
            <p className="px-3 py-2 bg-white border border-gray-300 rounded-md">
              {scaleFactor.toFixed(2)}x
            </p>
          </div>
        </div>
        
          {/* LAL Conservation Warning */}
          {lalWarning && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm">{lalWarning.replace('⚠️ ', '')}</p>
            </div>
          )}
        </div>
      )}

      {/* Ingredients by Step */}
      {(view === 'all' || view === 'ingredients') && (
        <div className="space-y-6">
          {embedded ? (
            displayedSteps.map(step => {
              const stepScaled = groupedByStep[step]
              if (!stepScaled || stepScaled.length === 0) return null
              return (
                <div key={step} className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4 capitalize">
                    {step} ({stepScaled.length} ingredients)
                  </h3>
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
            displayedSteps.map(step => {
              const stepScaled = groupedByStep[step]
              if (!stepScaled || stepScaled.length === 0) return null
              return (
                <div key={step} className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4 capitalize">
                    {step} ({stepScaled.length} ingredients)
                  </h3>
                  <div className="space-y-3">
                    {stepScaled.map((ingredient) => (
                      <div
                        key={ingredient.ingredient_id}
                        className={`p-4 rounded-lg border ${ingredient.scaled_quantity >= ingredient.original_quantity ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                      >
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
