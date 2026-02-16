'use client'

import type { RecipeWithIngredients, Item } from '../../types/recipe.types'

interface IngredientsTableProps {
  recipe: RecipeWithIngredients
  editing: boolean
  editRows: { id: string; qty: number; uom: string; notes: string }[]
  setEditRows: React.Dispatch<React.SetStateAction<{ id: string; qty: number; uom: string; notes: string }[]>>
  saving: boolean
  editError: string | null
  deletingId: string | null
  showAddRow: boolean
  setShowAddRow: (v: boolean) => void
  allItems: Item[]
  newIngItemId: string
  setNewIngItemId: (v: string) => void
  newIngQty: string
  setNewIngQty: (v: string) => void
  newIngUom: string
  setNewIngUom: (v: string) => void
  newIngNotes: string
  setNewIngNotes: (v: string) => void
  addingIng: boolean
  enterEditMode: () => void
  cancelEdit: () => void
  saveEdits: () => void
  handleDeleteIngredient: (id: string) => void
  handleAddIngredient: () => void
}

export function IngredientsTable({
  recipe, editing, editRows, setEditRows, saving, editError, deletingId,
  showAddRow, setShowAddRow, allItems,
  newIngItemId, setNewIngItemId, newIngQty, setNewIngQty, newIngUom, setNewIngUom, newIngNotes, setNewIngNotes, addingIng,
  enterEditMode, cancelEdit, saveEdits, handleDeleteIngredient, handleAddIngredient,
}: IngredientsTableProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Ingredients</h3>
        {!editing ? (
          <button type="button" onClick={enterEditMode} className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200">Edit</button>
        ) : (
          <div className="flex gap-2">
            <button type="button" onClick={saveEdits} disabled={saving} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={cancelEdit} disabled={saving} className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
          </div>
        )}
      </div>

      {editError && (
        <div className="mx-4 mt-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{editError}</div>
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
                      <input type="number" step="any" min="0" value={editRow.qty}
                        onChange={(e) => setEditRows((prev) => prev.map((r) => r.id === ing.id ? { ...r, qty: parseFloat(e.target.value) || 0 } : r))}
                        className="w-24 rounded border border-gray-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="text" value={editRow.uom}
                        onChange={(e) => setEditRows((prev) => prev.map((r) => r.id === ing.id ? { ...r, uom: e.target.value } : r))}
                        className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700">{abv != null ? `${abv}%` : '—'}</td>
                    <td className="px-4 py-2">
                      <input type="text" value={editRow.notes}
                        onChange={(e) => setEditRows((prev) => prev.map((r) => r.id === ing.id ? { ...r, notes: e.target.value } : r))}
                        placeholder="—"
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button type="button" onClick={() => handleDeleteIngredient(ing.id)} disabled={deletingId === ing.id}
                        className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-40" title="Remove ingredient">
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
                  <select value={newIngItemId} onChange={(e) => setNewIngItemId(e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select item…</option>
                    {allItems
                      .filter((it) => !(recipe.ingredients || []).some((ing) => ing.item_id === it.id))
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((it) => (
                        <option key={it.id} value={it.id}>{it.name}{it.is_alcohol && it.abv_pct ? ` (${it.abv_pct}%)` : ''}</option>
                      ))}
                  </select>
                </td>
                <td className="px-4 py-2 text-right">
                  <input type="number" step="any" min="0" value={newIngQty} onChange={(e) => setNewIngQty(e.target.value)} placeholder="0"
                    className="w-24 rounded border border-gray-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </td>
                <td className="px-4 py-2">
                  <input type="text" value={newIngUom} onChange={(e) => setNewIngUom(e.target.value)} placeholder="g"
                    className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </td>
                <td className="px-4 py-2 text-right text-gray-400">—</td>
                <td className="px-4 py-2">
                  <input type="text" value={newIngNotes} onChange={(e) => setNewIngNotes(e.target.value)} placeholder="Optional"
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </td>
                <td className="px-4 py-2 text-center">
                  <button type="button" onClick={handleAddIngredient} disabled={addingIng || !newIngItemId || !newIngQty}
                    className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-500 disabled:opacity-40">
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
          <button type="button" onClick={() => setShowAddRow(true)} className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add ingredient
          </button>
        </div>
      )}
    </div>
  )
}
