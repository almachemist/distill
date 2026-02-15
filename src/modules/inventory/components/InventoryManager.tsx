"use client"

import { useEffect, useMemo, useState } from 'react'
import type { InventoryItem, InventoryCategory, Supplier } from '@/types/inventory'
import Link from 'next/link'


const CATEGORIES: (InventoryCategory | 'All')[] = ['All','Spirits','Packaging','Labels','Botanicals','RawMaterials']
const UNITS = ['bottle','carton','pack','g','kg','L','ml','unit'] as const

export default function InventoryManager() {
  const [category, setCategory] = useState<(InventoryCategory | 'All')>('All')
  const [items, setItems] = useState<InventoryItem[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState<string>('')

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
  const [adjDraft, setAdjDraft] = useState<{ delta?: number; counted?: number; reason?: string; note?: string }>({})
  const [submittingAdj, setSubmittingAdj] = useState(false)
  const [adjMsg, setAdjMsg] = useState<string | null>(null)


  const filtered = useMemo(() => {
    const base = category === 'All' ? items : items.filter(i => i.category === category)
    if (!search) return base
    const s = search.toLowerCase()
    return base.filter(i => (i.name?.toLowerCase().includes(s) || i.sku?.toLowerCase().includes(s)))
  }, [items, category, search])

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
    } finally {
      setLoadingMov(false)
    }
  }
  
  async function submitAdjustment() {
    if (!adjusting) return
    try {
      setSubmittingAdj(true)
      setAdjMsg(null)
      const useCounted = adjDraft.counted !== undefined && adjDraft.counted !== null && !Number.isNaN(Number(adjDraft.counted))
      const delta = useCounted ? (Number(adjDraft.counted) - Number(adjusting.currentStock)) : Number(adjDraft.delta)
      if (!Number.isFinite(delta) || delta === 0) {
        setAdjMsg('Please enter a non-zero number')
        setSubmittingAdj(false)
        return
      }
      const res = await fetch('/api/inventory/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: `${(adjDraft.reason || 'adjustment') === 'stocktake' ? 'stocktake' : 'manual-adjust'}:${adjusting.sku || adjusting.id}`,
          reason: adjDraft.reason || (useCounted ? 'stocktake' : 'adjustment'),
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

  useEffect(() => { loadAll() }, [category])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search)
      const cat = sp.get('category') as (InventoryCategory | 'All') | null
      const s = sp.get('search') || sp.get('sku')
      if (cat && (['All','Spirits','Packaging','Labels','Botanicals','RawMaterials'] as const).includes(cat as any)) setCategory(cat)
      if (s) setSearch(s)
    }
  }, [])

  function supName(id?: string) {
    if (!id) return '—'
    return suppliers.find(s => s.id === id)?.name || id
  }

  function stockClass(it: InventoryItem) {
    if (it.currentStock < 0) return 'text-muted-foreground'
    if (it.minStock != null && it.currentStock <= it.minStock) return 'text-warning'
    return 'text-foreground'
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
          <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground text-sm">November 2025 baseline + movements</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/inventory-planning" className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors">Forecast Needs</Link>
          <button className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors" onClick={() => { setAddingSupplier(true); setSupDraft({}) }}>Add Supplier</button>
          <button className="px-4 py-2 rounded-lg bg-copper text-white hover:bg-copper/90 transition-colors" onClick={() => { setCreating(true); setDraft({ category: 'Packaging', unit: 'unit', currentStock: 0 }) }}>Add Item</button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg border border-border transition-colors ${category === c ? 'bg-copper text-white' : 'bg-surface text-foreground hover:bg-accent'}`}>{c}</button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <input placeholder="Filter by name or SKU" value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border focus:ring-2 focus:ring-ring" />
          {search && <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors" onClick={() => setSearch('')}>Clear</button>}
        </div>
      </div>

      {error && <div className="bg-destructive/5 border border-destructive/20 text-destructive p-3 rounded-lg">{error}</div>}
      {loading ? (
        <div className="py-16 text-center text-muted-foreground">Loading…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-accent">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Item</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Current Stock</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Unit</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Supplier</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {filtered.map(it => (
                <tr key={it.id}>
                  <td className="px-4 py-2 text-sm font-medium text-foreground">{it.name}</td>
                  <td className="px-4 py-2 text-sm text-muted-foreground">{it.category}</td>
                  <td className={`px-4 py-2 text-sm font-semibold ${stockClass(it)}`}>{Math.max(0, Number(it.currentStock || 0))}</td>
                  <td className="px-4 py-2 text-sm text-muted-foreground">{it.unit}</td>
                  <td className="px-4 py-2 text-xs"><span className="inline-flex px-2 py-0.5 rounded bg-accent text-foreground">{it.type || '—'}</span></td>
                  <td className="px-4 py-2 text-sm text-muted-foreground">{supName(it.supplierId)}</td>
                  <td className="px-4 py-2 text-sm text-right">
                    <button className="px-2 py-1 mr-2 rounded-lg border border-border hover:bg-accent transition-colors" onClick={() => { setAdjusting(it); setAdjDraft({}); setAdjMsg(null) }}>Adjust</button>
                    <button className="px-2 py-1 mr-2 rounded-lg border border-border hover:bg-accent transition-colors" onClick={() => { setEdit(it); setDraft({}); setServerMsg(null) }}>Edit</button>
                    <button className="px-2 py-1 rounded-lg border border-border hover:bg-accent transition-colors text-foreground" onClick={() => deleteItem(it)}>Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td className="px-4 py-8 text-center text-sm text-muted-foreground" colSpan={7}>No items</td></tr>


              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end">
        <button className="mt-2 px-3 py-1.5 rounded border" onClick={() => { const next = !showMovements; setShowMovements(next); if (next) loadMovements() }}>{showMovements ? 'Hide Movements' : 'Recent Movements'}</button>
      </div>
      {showMovements && (
        <div className="rounded-xl border border-border p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Recent Movements</h3>
            <button className="text-sm underline" onClick={() => loadMovements()} disabled={loadingMov}>{loadingMov ? 'Refreshing…' : 'Refresh'}</button>
          </div>
          <div className="max-h-64 overflow-auto text-sm">
            {movements.length === 0 ? (
              <div className="text-muted-foreground">No movements yet</div>
            ) : (
              <ul className="space-y-2">
                {movements.map((m: any, idx: number) => (
                  <li key={idx} className="border border-border rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <div className="text-foreground">{new Date(m.dt).toLocaleString()}</div>
                      <div className="text-muted-foreground">{m.reference || '—'} · {m.reason || '—'}</div>
                    </div>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-1">
                      {m.changes?.map((c: any, j: number) => (
                        <div key={j} className="flex justify-between bg-accent rounded px-2 py-1">
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
          <div className="bg-surface w-full max-w-md rounded-lg shadow-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Adjust Stock: {adjusting.name}</h3>
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setAdjusting(null)}>✕</button>
            </div>
            {adjMsg && <div className="bg-warning/5 border border-warning/20 text-warning p-2 rounded-lg text-sm">{adjMsg}</div>}
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="text-muted-foreground">Current: <span className="font-semibold text-foreground">{adjusting.currentStock}</span> {adjusting.unit}</div>
              <label>Adjust by (delta)
                <input type="number" className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" onChange={e => setAdjDraft(d => ({ ...d, delta: e.target.value === '' ? undefined : Number(e.target.value) }))} placeholder="+100 or -50" />
              </label>
              <label>Counted quantity
                <input type="number" className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" onChange={e => setAdjDraft(d => ({ ...d, counted: e.target.value === '' ? undefined : Number(e.target.value) }))} placeholder="Set absolute" />
              </label>
              <label>Reason
                <select className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" defaultValue="adjustment" onChange={e => setAdjDraft(d => ({ ...d, reason: e.target.value }))}>
                  <option value="receive">receive</option>
                  <option value="consume">consume</option>
                  <option value="adjustment">adjustment</option>
                  <option value="stocktake">stocktake</option>
                </select>
              </label>
              <label>Note
                <textarea className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" rows={3} onChange={e => setAdjDraft(d => ({ ...d, note: e.target.value }))} />
              </label>
              <div className="text-muted-foreground">New quantity: <span className="font-semibold">{Number(adjDraft.counted ?? (Number(adjusting.currentStock) + Number(adjDraft.delta || 0)))}</span> {adjusting.unit}</div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="px-4 py-2 rounded border border-border hover:bg-accent transition-colors" onClick={() => setAdjusting(null)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-copper text-white hover:bg-copper/90 disabled:opacity-50" disabled={submittingAdj} onClick={submitAdjustment}>{submittingAdj ? 'Saving…' : 'Apply'}</button>
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
          <div className="bg-surface w-full max-w-lg rounded-lg shadow-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Edit: {edit.name}</h3>
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setEdit(null)}>✕</button>
            </div>
            {serverMsg && <div className="bg-warning/5 border border-warning/20 text-warning p-2 rounded-lg text-sm">{serverMsg}</div>}
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">Current Stock<input type="number" className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" defaultValue={edit.currentStock} onChange={e => setDraft(d => ({ ...d, currentStock: Number(e.target.value) }))} /></label>
              <label className="text-sm">Min Stock<input type="number" className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" defaultValue={edit.minStock ?? ''} onChange={e => setDraft(d => ({ ...d, minStock: e.target.value === '' ? undefined : Number(e.target.value) }))} /></label>
              <label className="text-sm">Supplier<select className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" defaultValue={edit.supplierId || ''} onChange={e => setDraft(d => ({ ...d, supplierId: e.target.value || undefined }))}>
                <option value="">—</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select></label>
              <label className="text-sm">Last Invoice #<input className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" defaultValue={edit.lastInvoiceNumber || ''} onChange={e => setDraft(d => ({ ...d, lastInvoiceNumber: e.target.value }))} /></label>
              <label className="text-sm">Last Invoice Date<input type="date" className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" defaultValue={edit.lastInvoiceDate || ''} onChange={e => setDraft(d => ({ ...d, lastInvoiceDate: e.target.value }))} /></label>
              <label className="text-sm">Last Purchase Cost<input type="number" step="0.01" className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" defaultValue={edit.lastPurchaseCost ?? ''} onChange={e => setDraft(d => ({ ...d, lastPurchaseCost: e.target.value === '' ? undefined : Number(e.target.value) }))} /></label>
              <label className="text-sm col-span-2">Notes<textarea className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" rows={3} defaultValue={edit.notes || ''} onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))} /></label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="px-4 py-2 rounded border border-border hover:bg-accent transition-colors" onClick={() => setEdit(null)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-copper text-white hover:bg-copper/90" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {addingSupplier && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-surface w-full max-w-md rounded-lg shadow-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Add Supplier</h3>
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setAddingSupplier(false)}>✕</button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <label className="text-sm">Name<input className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" onChange={e => setSupDraft(d => ({ ...d, name: e.target.value }))} /></label>
              <label className="text-sm">Contact<input className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" onChange={e => setSupDraft(d => ({ ...d, contactName: e.target.value }))} /></label>
              <label className="text-sm">Email<input type="email" className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" onChange={e => setSupDraft(d => ({ ...d, email: e.target.value }))} /></label>
              <label className="text-sm">Phone<input className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" onChange={e => setSupDraft(d => ({ ...d, phone: e.target.value }))} /></label>
              <label className="text-sm">Notes<textarea className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" rows={3} onChange={e => setSupDraft(d => ({ ...d, notes: e.target.value }))} /></label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="px-4 py-2 rounded border border-border hover:bg-accent transition-colors" onClick={() => setAddingSupplier(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-copper text-white hover:bg-copper/90" onClick={saveSupplier}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {creating && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-surface w-full max-w-lg rounded-lg shadow-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Add Inventory Item</h3>
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setCreating(false)}>✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">SKU<input className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" onChange={e => setDraft(d => ({ ...d, sku: e.target.value, id: e.target.value }))} /></label>
              <label className="text-sm">Name<input className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} /></label>
              <label className="text-sm">Category<select className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" defaultValue={(draft.category as any) || 'Packaging'} onChange={e => setDraft(d => ({ ...d, category: e.target.value as InventoryCategory }))}>
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select></label>
              <label className="text-sm">Unit<select className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" defaultValue={(draft.unit as any) || 'unit'} onChange={e => setDraft(d => ({ ...d, unit: e.target.value as any }))}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select></label>
              <label className="text-sm">Current Stock<input type="number" className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" defaultValue={draft.currentStock ?? 0} onChange={e => setDraft(d => ({ ...d, currentStock: Number(e.target.value) }))} /></label>
              <label className="text-sm">Type<input className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" onChange={e => setDraft(d => ({ ...d, type: e.target.value }))} /></label>
              <label className="text-sm col-span-2">Supplier<select className="mt-1 w-full border rounded p-2 border-border focus:ring-2 focus:ring-ring" defaultValue="" onChange={e => setDraft(d => ({ ...d, supplierId: e.target.value || undefined }))}>
                <option value="">—</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select></label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="px-4 py-2 rounded border border-border hover:bg-accent transition-colors" onClick={() => setCreating(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-copper text-white hover:bg-copper/90" onClick={saveCreate}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
