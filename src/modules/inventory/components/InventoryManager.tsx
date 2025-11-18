"use client"

import { useEffect, useMemo, useState } from 'react'
import type { InventoryItem, InventoryCategory, Supplier } from '@/types/inventory'

const CATEGORIES: (InventoryCategory | 'All')[] = ['All','Spirits','Packaging','Labels','Botanicals','RawMaterials']
const UNITS = ['bottle','carton','pack','g','kg','L','ml','unit'] as const

export default function InventoryManager() {
  const [category, setCategory] = useState<(InventoryCategory | 'All')>('All')
  const [items, setItems] = useState<InventoryItem[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [edit, setEdit] = useState<InventoryItem | null>(null)
  const [creating, setCreating] = useState<boolean>(false)
  const [draft, setDraft] = useState<Partial<InventoryItem>>({})
  const [serverMsg, setServerMsg] = useState<string | null>(null)

  const [addingSupplier, setAddingSupplier] = useState(false)
  const [supDraft, setSupDraft] = useState<Partial<Supplier>>({})
  const [showMovements, setShowMovements] = useState(false)
  const [movements, setMovements] = useState<any[]>([])
  const [loadingMov, setLoadingMov] = useState(false)
  const [adjusting, setAdjusting] = useState<InventoryItem | null>(null)
  const [adjDraft, setAdjDraft] = useState<{ delta?: number; reason?: string; note?: string }>({})
  const [submittingAdj, setSubmittingAdj] = useState(false)
  const [adjMsg, setAdjMsg] = useState<string | null>(null)


  const filtered = useMemo(() => {
    if (category === 'All') return items
    return items.filter(i => i.category === category)
  }, [items, category])

  async function loadAll() {
    try {
      setLoading(true)
      setError(null)
      const invUrl = `/api/inventory${category !== 'All' ? `?category=${category}` : ''}${category !== 'All' ? '&' : '?'}derived=1`
      const [itemsRes, suppRes] = await Promise.all([
        fetch(invUrl, { cache: 'no-store' }),
        fetch('/api/suppliers', { cache: 'no-store' })
      ])
      if (!itemsRes.ok) throw new Error('Failed to load inventory')
      if (!suppRes.ok) throw new Error('Failed to load suppliers')
      setItems(await itemsRes.json())
      setSuppliers(await suppRes.json())
    } catch (e: any) {
      setError(e?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function saveSupplier() {
    try {
      if (!supDraft.name) throw new Error('Supplier name is required')
      const res = await fetch('/api/suppliers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(supDraft) })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'Failed to create supplier')
      }
      setAddingSupplier(false)
      setSupDraft({})
      await loadAll()
    } catch (e: any) {
      alert(e?.message || 'Failed to create supplier')
    }
  }

  async function loadMovements() {
    try {
      setLoadingMov(true)
      const res = await fetch('/api/inventory/movements?limit=100', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load movements')
      setMovements(await res.json())
    } catch (e: any) {
      console.error(e)
  async function submitAdjustment() {
    if (!adjusting) return
    try {
      setSubmittingAdj(true)
      setAdjMsg(null)
      const delta = Number(adjDraft.delta)
      if (!Number.isFinite(delta) || delta === 0) {
        setAdjMsg('Please enter a non-zero number')
        setSubmittingAdj(false)
        return
      }
      const res = await fetch('/api/inventory/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: `manual-adjust:${adjusting.sku || adjusting.id}`,
          reason: adjDraft.reason || 'adjustment',
          changes: [{ sku: adjusting.sku || adjusting.id, delta, note: adjDraft.note }]
        })
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setAdjMsg(j.error || 'Failed to apply adjustment')
        return
      }
      setAdjusting(null)
      setAdjDraft({})
      await loadAll()
    } catch (e: any) {
      setAdjMsg(e?.message || 'Failed to adjust')
    } finally {
      setSubmittingAdj(false)
    }
  }

    } finally {
      setLoadingMov(false)
    }
  }

  useEffect(() => { loadAll() }, [category])

  function supName(id?: string) {
    if (!id) return '—'
    return suppliers.find(s => s.id === id)?.name || id
  }

  function stockClass(it: InventoryItem) {
    if (it.currentStock < 0) return 'text-red-600'
    if (it.minStock != null && it.currentStock <= it.minStock) return 'text-orange-600'
    return 'text-gray-900'
  }

  async function saveEdit() {
    if (!edit) return
    setServerMsg(null)

    // 1) If stock changed, create a movement to reach the desired level
    const desired = draft.currentStock
    if (desired != null && !Number.isNaN(Number(desired)) && Number(desired) !== edit.currentStock) {
      const delta = Number(desired) - Number(edit.currentStock)
      const mvRes = await fetch('/api/inventory/movements', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: `manual:${edit.sku || edit.id}`,
          reason: 'adjustment',
          changes: [{ sku: edit.sku || edit.id, delta, note: draft.notes || 'Manual adjustment' }]
        })
      })
      if (!mvRes.ok) {
        const j = await mvRes.json().catch(() => ({}))
        setServerMsg(j.error || 'Failed to adjust stock')
        return
      }
    }

    // 2) Patch non-stock fields
    const nonStockPatch: any = {}
    if (draft.minStock !== undefined) nonStockPatch.minStock = draft.minStock
    if (draft.supplierId !== undefined) nonStockPatch.supplierId = draft.supplierId
    if (draft.lastInvoiceNumber !== undefined) nonStockPatch.lastInvoiceNumber = draft.lastInvoiceNumber
    if (draft.lastInvoiceDate !== undefined) nonStockPatch.lastInvoiceDate = draft.lastInvoiceDate
    if (draft.lastPurchaseCost !== undefined) nonStockPatch.lastPurchaseCost = draft.lastPurchaseCost
    if (draft.notes !== undefined) nonStockPatch.notes = draft.notes

    if (Object.keys(nonStockPatch).length > 0) {
      const res = await fetch(`/api/inventory/${edit.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nonStockPatch) })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setServerMsg(j.error || 'Failed to update details')
        return
      }
    }

    setEdit(null)
    setDraft({})
    await loadAll()
  }

  async function deleteItem(it: InventoryItem) {
    if (!confirm(`Delete ${it.name}?`)) return
    const res = await fetch(`/api/inventory/${it.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j.error || 'Failed to delete')
      return
    }
    await loadAll()
  }

  async function saveCreate() {
    const payload = {
      id: draft.id || draft.sku,
      sku: draft.sku,
      name: draft.name,
      category: draft.category,
      unit: draft.unit,
      currentStock: Number(draft.currentStock ?? 0),
      minStock: Number.isFinite(draft.minStock as any) ? draft.minStock : undefined,
      supplierId: draft.supplierId || undefined,
      type: draft.type || undefined,
    }
    const res = await fetch('/api/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j.error || 'Failed to create')
      return
    }
    setCreating(false)
    setDraft({})
    await loadAll()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600 text-sm">Baseline de Novembro 2025 + movimentos (sem negativos)</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-md border" onClick={() => { setAddingSupplier(true); setSupDraft({}) }}>Add Supplier</button>
          <button className="px-4 py-2 rounded-md bg-gray-900 text-white" onClick={() => { setCreating(true); setDraft({ category: 'Packaging', unit: 'unit', currentStock: 0 }) }}>Add Item</button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-md border ${category === c ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>{c}</button>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded">{error}</div>}
      {loading ? (
        <div className="py-16 text-center text-gray-500">Loading…</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filtered.map(it => (
                <tr key={it.id}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">{it.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{it.category}</td>
                  <td className={`px-4 py-2 text-sm font-semibold ${stockClass(it)}`}>{it.currentStock}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{it.unit}</td>
                  <td className="px-4 py-2 text-xs"><span className="inline-flex px-2 py-0.5 rounded bg-gray-100 text-gray-700">{it.type || '—'}</span></td>
                  <td className="px-4 py-2 text-sm text-gray-600">{supName(it.supplierId)}</td>
                  <td className="px-4 py-2 text-sm text-right">
                    <button className="px-2 py-1 mr-2 rounded border" onClick={() => { setAdjusting(it); setAdjDraft({}); setAdjMsg(null) }}>Adjust</button>
                    <button className="px-2 py-1 mr-2 rounded border" onClick={() => { setEdit(it); setDraft({}); setServerMsg(null) }}>Edit</button>
                    <button className="px-2 py-1 rounded border text-red-700" onClick={() => deleteItem(it)}>Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={7}>No items</td></tr>


              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end">
        <button className="mt-2 px-3 py-1.5 rounded border" onClick={() => { const next = !showMovements; setShowMovements(next); if (next) loadMovements() }}>{showMovements ? 'Hide Movements' : 'Recent Movements'}</button>
      </div>
      {showMovements && (
        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Recent Movements</h3>
            <button className="text-sm underline" onClick={() => loadMovements()} disabled={loadingMov}>{loadingMov ? 'Refreshing…' : 'Refresh'}</button>
          </div>
          <div className="max-h-64 overflow-auto text-sm">
            {movements.length === 0 ? (
              <div className="text-gray-500">No movements yet</div>
            ) : (
              <ul className="space-y-2">
                {movements.map((m: any, idx: number) => (
                  <li key={idx} className="border rounded p-2">
                    <div className="flex items-center justify-between">
                      <div className="text-gray-700">{new Date(m.dt).toLocaleString()}</div>
                      <div className="text-gray-500">{m.reference || '—'} · {m.reason || '—'}</div>
                    </div>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-1">
                      {m.changes?.map((c: any, j: number) => (
                        <div key={j} className="flex justify-between bg-gray-50 rounded px-2 py-1">
                          <span className="font-mono text-xs">{c.sku}</span>
                          <span>{c.before} {c.delta >= 0 ? '+' : ''}{c.delta} → <strong>{c.after}</strong></span>
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}

      {/* Adjust Stock Modal */}
      {adjusting && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Adjust Stock: {adjusting.name}</h3>
              <button className="text-gray-500" onClick={() => setAdjusting(null)}>✕</button>
            </div>
            {adjMsg && <div className="bg-red-50 border border-red-200 text-red-800 p-2 rounded text-sm">{adjMsg}</div>}
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="text-gray-600">Current: <span className="font-semibold text-gray-900">{adjusting.currentStock}</span> {adjusting.unit}</div>
              <label>Adjust by (delta)
                <input type="number" className="mt-1 w-full border rounded p-2" onChange={e => setAdjDraft(d => ({ ...d, delta: e.target.value === '' ? undefined : Number(e.target.value) }))} placeholder="+100 or -50" />
              </label>
              <label>Reason
                <select className="mt-1 w-full border rounded p-2" defaultValue="adjustment" onChange={e => setAdjDraft(d => ({ ...d, reason: e.target.value }))}>
                  <option value="receive">receive</option>
                  <option value="consume">consume</option>
                  <option value="adjustment">adjustment</option>
                </select>
              </label>
              <label>Note
                <textarea className="mt-1 w-full border rounded p-2" rows={3} onChange={e => setAdjDraft(d => ({ ...d, note: e.target.value }))} />
              </label>
              <div className="text-gray-600">New quantity: <span className={`${(Number(adjusting.currentStock) + Number(adjDraft.delta || 0)) < 0 ? 'text-red-600' : 'text-gray-900'} font-semibold`}>{Number(adjusting.currentStock) + Number(adjDraft.delta || 0)}</span> {adjusting.unit}</div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="px-4 py-2 rounded border" onClick={() => setAdjusting(null)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-gray-900 text-white disabled:opacity-50" disabled={submittingAdj} onClick={submitAdjustment}>{submittingAdj ? 'Saving…' : 'Apply'}</button>
            </div>
          </div>
        </div>
      )}

          </div>
        </div>
      )}

      {/* Edit Modal */}
      {edit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Edit: {edit.name}</h3>
              <button className="text-gray-500" onClick={() => setEdit(null)}>✕</button>
            </div>
            {serverMsg && <div className="bg-red-50 border border-red-200 text-red-800 p-2 rounded text-sm">{serverMsg}</div>}
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">Current Stock<input type="number" className="mt-1 w-full border rounded p-2" defaultValue={edit.currentStock} onChange={e => setDraft(d => ({ ...d, currentStock: Number(e.target.value) }))} /></label>
              <label className="text-sm">Min Stock<input type="number" className="mt-1 w-full border rounded p-2" defaultValue={edit.minStock ?? ''} onChange={e => setDraft(d => ({ ...d, minStock: e.target.value === '' ? undefined : Number(e.target.value) }))} /></label>
              <label className="text-sm">Supplier<select className="mt-1 w-full border rounded p-2" defaultValue={edit.supplierId || ''} onChange={e => setDraft(d => ({ ...d, supplierId: e.target.value || undefined }))}>
                <option value="">—</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select></label>
              <label className="text-sm">Last Invoice #<input className="mt-1 w-full border rounded p-2" defaultValue={edit.lastInvoiceNumber || ''} onChange={e => setDraft(d => ({ ...d, lastInvoiceNumber: e.target.value }))} /></label>
              <label className="text-sm">Last Invoice Date<input type="date" className="mt-1 w-full border rounded p-2" defaultValue={edit.lastInvoiceDate || ''} onChange={e => setDraft(d => ({ ...d, lastInvoiceDate: e.target.value }))} /></label>
              <label className="text-sm">Last Purchase Cost<input type="number" step="0.01" className="mt-1 w-full border rounded p-2" defaultValue={edit.lastPurchaseCost ?? ''} onChange={e => setDraft(d => ({ ...d, lastPurchaseCost: e.target.value === '' ? undefined : Number(e.target.value) }))} /></label>
              <label className="text-sm col-span-2">Notes<textarea className="mt-1 w-full border rounded p-2" rows={3} defaultValue={edit.notes || ''} onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))} /></label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="px-4 py-2 rounded border" onClick={() => setEdit(null)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-gray-900 text-white" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {addingSupplier && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Add Supplier</h3>
              <button className="text-gray-500" onClick={() => setAddingSupplier(false)}>✕</button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <label className="text-sm">Name<input className="mt-1 w-full border rounded p-2" onChange={e => setSupDraft(d => ({ ...d, name: e.target.value }))} /></label>
              <label className="text-sm">Contact<input className="mt-1 w-full border rounded p-2" onChange={e => setSupDraft(d => ({ ...d, contactName: e.target.value }))} /></label>
              <label className="text-sm">Email<input type="email" className="mt-1 w-full border rounded p-2" onChange={e => setSupDraft(d => ({ ...d, email: e.target.value }))} /></label>
              <label className="text-sm">Phone<input className="mt-1 w-full border rounded p-2" onChange={e => setSupDraft(d => ({ ...d, phone: e.target.value }))} /></label>
              <label className="text-sm">Notes<textarea className="mt-1 w-full border rounded p-2" rows={3} onChange={e => setSupDraft(d => ({ ...d, notes: e.target.value }))} /></label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="px-4 py-2 rounded border" onClick={() => setAddingSupplier(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-gray-900 text-white" onClick={saveSupplier}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {creating && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Add Inventory Item</h3>
              <button className="text-gray-500" onClick={() => setCreating(false)}>✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">SKU<input className="mt-1 w-full border rounded p-2" onChange={e => setDraft(d => ({ ...d, sku: e.target.value, id: e.target.value }))} /></label>
              <label className="text-sm">Name<input className="mt-1 w-full border rounded p-2" onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} /></label>
              <label className="text-sm">Category<select className="mt-1 w-full border rounded p-2" defaultValue={(draft.category as any) || 'Packaging'} onChange={e => setDraft(d => ({ ...d, category: e.target.value as InventoryCategory }))}>
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select></label>
              <label className="text-sm">Unit<select className="mt-1 w-full border rounded p-2" defaultValue={(draft.unit as any) || 'unit'} onChange={e => setDraft(d => ({ ...d, unit: e.target.value as any }))}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select></label>
              <label className="text-sm">Current Stock<input type="number" className="mt-1 w-full border rounded p-2" defaultValue={draft.currentStock ?? 0} onChange={e => setDraft(d => ({ ...d, currentStock: Number(e.target.value) }))} /></label>
              <label className="text-sm">Type<input className="mt-1 w-full border rounded p-2" onChange={e => setDraft(d => ({ ...d, type: e.target.value }))} /></label>
              <label className="text-sm col-span-2">Supplier<select className="mt-1 w-full border rounded p-2" defaultValue="" onChange={e => setDraft(d => ({ ...d, supplierId: e.target.value || undefined }))}>
                <option value="">—</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select></label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="px-4 py-2 rounded border" onClick={() => setCreating(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-gray-900 text-white" onClick={saveCreate}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

