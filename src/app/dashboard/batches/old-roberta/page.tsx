"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type Batch = {
  batch_id: string
  product_type: 'Rum' | 'Cane Spirit' | 'Other'
  distillation_date?: string | null
  hearts_volume_l?: number | null
  hearts_abv_percent?: number | null
  hearts_lal?: number | null
  notes?: string | null
}

export default function OldRobertaBatchesPage() {
  const router = useRouter()
  const searchParams = useSearchParams() as URLSearchParams | null
  const [batches, setBatches] = useState<Batch[]>([])
  const [filter, setFilter] = useState<'all' | 'Rum' | 'Cane Spirit'>('all')
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [selected, setSelected] = useState<Batch | null>(null)
  const [requestedBatchId, setRequestedBatchId] = useState<string | null>(null)
  const [detail, setDetail] = useState<any | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const toDomId = (value: any) => {
    const raw = String(value ?? '').trim()
    if (!raw) return ''
    return raw.replace(/[^A-Za-z0-9_-]/g, '_')
  }

  const fetchData = async () => {
    setMessage(null)
    const res = await fetch('/api/production/old-roberta', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      setBatches(Array.isArray(data?.batches) ? data.batches : [])
    } else {
      setMessage('Failed to load old distillations')
    }
  }

  useEffect(() => { fetchData() }, [])

  // Deep-link selection: /dashboard/batches/old-roberta?batch=SPIRIT-CANE-010
  useEffect(() => {
    const batch = searchParams?.get('batch')
    const trimmed = String(batch ?? '').trim()
    if (!trimmed) return
    setRequestedBatchId(trimmed)
  }, [searchParams])

  // When batches load (or requested changes), auto-select the requested batch
  useEffect(() => {
    if (!requestedBatchId) return
    if (selected?.batch_id === requestedBatchId) return
    const match = batches.find((b) => b?.batch_id === requestedBatchId)
    if (match) setSelected(match)
  }, [batches, requestedBatchId, selected?.batch_id])

  useEffect(() => {
    const id = requestedBatchId || selected?.batch_id
    if (!id) return
    const el = document.getElementById(`old-roberta-batch-card-${toDomId(id)}`)
    if (el) {
      el.scrollIntoView({ block: 'center' })
    }
  }, [requestedBatchId, selected?.batch_id])
  // Load full details when a card is selected
  useEffect(() => {
    let alive = true
    ;(async () => {
      if (!selected) { setDetail(null); setDetailError(null); return }
      try {
        setLoadingDetail(true)
        setDetailError(null)
        const res = await fetch(`/api/production/old-roberta/batch/${encodeURIComponent(selected.batch_id)}`, { cache: 'no-store' })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        if (!alive) return
        setDetail(data)
      } catch (e: any) {
        if (!alive) return
        setDetailError(e?.message || 'Failed to load details')
        setDetail(null)
      } finally {
        if (!alive) return
        setLoadingDetail(false)
      }
    })()
    return () => { alive = false }
  }, [selected?.batch_id])


  const filtered = useMemo(() => {
    if (filter === 'all') return batches
    return batches.filter(b => b.product_type === filter)
  }, [batches, filter])

  const onImport = async (file: File | null) => {
    if (!file) return
    try {
      setImporting(true)
      setMessage(null)
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/production/old-roberta/import', { method: 'POST', body: fd })
      if (!res.ok) throw new Error(await res.text())
      const out = await res.json()
      setMessage(`Imported ${out.imported} records. Total: ${out.total}.`)
      await fetchData()
    } catch (e: any) {
      setMessage(e?.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }




  return (
    <div className="h-screen flex flex-col bg-stone-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-stone-900">Old Distillations – Roberta</h1>
          <div className="flex gap-2">
            <button onClick={() => router.push('/dashboard/batches')} className="px-4 py-2 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-md text-sm font-medium">Gin / Vodka / Ethanol</button>
            <button onClick={() => router.push('/dashboard/production/rum')} className="px-4 py-2 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-md text-sm font-medium">Rum</button>
            <button className="px-4 py-2 bg-amber-700 text-white rounded-md text-sm font-medium">Old Roberta</button>
          </div>
        </div>
      </div>

      <main className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-lg text-sm">
          These batches were produced before the installation of the double retort and follow a completely different distillation logic.
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <label htmlFor="old_roberta_filter" className="text-sm text-stone-600">Filter</label>
            <select id="old_roberta_filter" value={filter} onChange={e => setFilter(e.target.value as any)} className="text-sm border border-stone-200 rounded-md px-3 py-2 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option value="all">All</option>
              <option value="Rum">Rum</option>
              <option value="Cane Spirit">Cane Spirit</option>
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="old_roberta_import" className="text-sm text-stone-600">Import JSON</label>
            <input id="old_roberta_import" type="file" accept="application/json,.json" disabled={importing} onChange={e => onImport(e.target.files?.[0] || null)} className="text-sm" />
          </div>
        </div>

        {message && (
          <div className="text-sm text-stone-600">{message}</div>
        )}

        {/* Details modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
            <div className="relative bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-6xl h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
                <div>
                  <h2 className="text-xl font-semibold text-stone-900">{selected.batch_id}</h2>
                  <p className="text-sm text-stone-500">{selected.product_type}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-stone-500 hover:text-stone-700 text-base font-medium">✕ Close</button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">

                {loadingDetail && (
                  <div className="text-base text-stone-500">Loading details…</div>
                )}
                {detailError && (
                  <div className="text-base text-red-600">{detailError}</div>
                )}

                {!loadingDetail && !detailError && (
                  <div className="space-y-8">
                    {/* Summary */}
                    <div>
                      <h3 className="text-lg font-semibold text-stone-800 mb-4">Summary</h3>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                        <div className="text-stone-500">Distillation date</div>
                        <div className="text-stone-800 font-medium">{(detail?.summary?.distillation_date ?? selected.distillation_date) ? new Date((detail?.summary?.distillation_date ?? selected.distillation_date) as string).toLocaleString() : '—'}</div>

                        <div className="text-stone-500">Still used</div>
                        <div className="text-stone-800 font-medium">{(detail?.summary?.still_used ?? (selected as any).still_used) ?? '—'}</div>

                        <div className="text-stone-500">Wash volume (L)</div>
                        <div className="text-stone-800 font-medium">{(detail?.summary?.wash_volume_l ?? (selected as any).wash_volume_l) ?? '—'}</div>

                        <div className="text-stone-500">Wash ABV (%)</div>
                        <div className="text-stone-800 font-medium">{(detail?.summary?.wash_abv_percent ?? (selected as any).wash_abv_percent) ?? '—'}</div>

                        <div className="text-stone-500">Charge (L)</div>
                        <div className="text-stone-800 font-medium">{(detail?.summary?.charge_l ?? (selected as any).charge_l) ?? '—'}</div>

                        <div className="text-stone-500">Hearts volume (L)</div>
                        <div className="text-stone-800 font-medium">{(detail?.summary?.hearts_volume_l ?? selected.hearts_volume_l) ?? '—'}</div>

                        <div className="text-stone-500">Hearts ABV (%)</div>
                        <div className="text-stone-800 font-medium">{(detail?.summary?.hearts_abv_percent ?? selected.hearts_abv_percent) ?? '—'}</div>

                        <div className="text-stone-500">Hearts LAL</div>
                        <div className="text-stone-800 font-medium">{(detail?.summary?.hearts_lal ?? selected.hearts_lal) ?? '—'}</div>

                        <div className="text-stone-500">Heads volume (L)</div>
                        <div className="text-stone-800 font-medium">{(detail?.summary?.heads_volume_l ?? (selected as any).heads_volume_l) ?? '—'}</div>

                        <div className="text-stone-500">Tails volume (L)</div>
                        <div className="text-stone-800 font-medium">{(detail?.summary?.tails_volume_l ?? (selected as any).tails_volume_l) ?? '—'}</div>

                        <div className="text-stone-500">Notes</div>
                        <div className="text-stone-800 font-medium whitespace-pre-wrap">{(detail?.summary?.notes ?? selected.notes) ?? '—'}</div>
                      </div>
                    </div>

                    {/* Charge details */}
                    {detail?.raw?.charge && (
                      <div className="border-t border-stone-200 pt-6">
                        <h3 className="text-lg font-semibold text-stone-800 mb-4">Charge</h3>
                        <div className="grid grid-cols-3 gap-6 text-base">
                          <div>
                            <div className="text-sm text-stone-500 mb-1">Total</div>
                            <div className="text-stone-800 font-medium">
                              {detail.raw.charge.total_charge?.volume_l ?? '—'} L @ {detail.raw.charge.total_charge?.abv ?? '—'}% ({detail.raw.charge.total_charge?.lal ?? '—'} LAL)
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-stone-500 mb-1">Still setup</div>
                            <div className="text-stone-800 font-medium">
                              {detail.raw.charge.still_setup?.elements || '—'}; {detail.raw.charge.still_setup?.options || '—'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-stone-500 mb-1">Low wines</div>
                            <div className="text-stone-800 font-medium">{Array.isArray(detail.raw.charge.low_wines) ? detail.raw.charge.low_wines.length : 0} items</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Outputs */}
                    {detail?.raw?.outputs && (
                      <div className="border-t border-stone-200 pt-6">
                        <h3 className="text-lg font-semibold text-stone-800 mb-4">Outputs</h3>
                        <div className="grid grid-cols-2 gap-6 text-base">
                          <div>
                            <div className="text-sm text-stone-500 mb-1">Hearts</div>
                            <div className="text-stone-800 font-medium">
                              {detail.raw.outputs.hearts?.total_volume_l ?? detail.raw.outputs.hearts?.volume_l ?? '—'} L @ {detail.raw.outputs.hearts?.abv ?? detail.raw.outputs.hearts?.abv_percent ?? '—'}% ({detail.raw.outputs.hearts?.lal ?? detail.raw.outputs.hearts?.combined_hearts_lal ?? '—'} LAL)
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-stone-500 mb-1">Foreshots / Heads / Tails</div>
                            <div className="text-stone-800 font-medium">
                              FS {detail.raw.outputs.foreshots?.volume_l ?? '—'} L; Heads {detail.raw.outputs.heads?.volume_l ?? '—'} L; Tails {detail.raw.outputs.tails?.volume_l ?? '—'} L
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Run log */}
                    {Array.isArray(detail?.raw?.run_log) && detail.raw.run_log.length > 0 && (
                      <div className="border-t border-stone-200 pt-6">
                        <h3 className="text-lg font-semibold text-stone-800 mb-4">Run log</h3>
                        <div className="border border-stone-200 rounded-lg overflow-hidden">
                          <table className="min-w-full text-sm">
                            <thead className="bg-stone-50 text-stone-600">
                              <tr>
                                <th className="px-4 py-3 text-left font-semibold">Time</th>
                                <th className="px-4 py-3 text-left font-semibold">Phase</th>
                                <th className="px-4 py-3 text-right font-semibold">Vol (L)</th>
                                <th className="px-4 py-3 text-right font-semibold">ABV (%)</th>
                                <th className="px-4 py-3 text-right font-semibold">LAL</th>
                                <th className="px-4 py-3 text-left font-semibold">Notes</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              {detail.raw.run_log.map((r: any, idx: number) => (
                                <tr key={idx} className="border-t border-stone-100 hover:bg-stone-50">
                                  <td className="px-4 py-3 font-medium">{r.time ?? '—'}</td>
                                  <td className="px-4 py-3">{r.phase ?? '—'}</td>
                                  <td className="px-4 py-3 text-right font-medium">{r.volume_l ?? '—'}</td>
                                  <td className="px-4 py-3 text-right font-medium">{r.abv ?? '—'}</td>
                                  <td className="px-4 py-3 text-right font-medium">{r.lal ?? '—'}</td>
                                  <td className="px-4 py-3 text-stone-600">{r.observations ?? '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => {
            const heartsLAL = b.hearts_lal ?? ((b.hearts_volume_l && b.hearts_abv_percent) ? (b.hearts_volume_l * (b.hearts_abv_percent / 100)) : null)
            return (
              <button
                key={b.batch_id}
                id={`old-roberta-batch-card-${toDomId(b.batch_id)}`}
                onClick={() => setSelected(b)}
                className="text-left bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-2 hover:shadow-sm hover:border-stone-300 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-stone-900">{b.batch_id}</h3>
                  <span className="text-xs text-stone-500">{b.product_type}</span>
                </div>
                <div className="text-xs text-stone-500">{b.distillation_date ? new Date(b.distillation_date).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</div>
                <div className="text-xs text-stone-600">
                  <div>Hearts: {b.hearts_volume_l ?? '—'} L @ {b.hearts_abv_percent ?? '—'}% ({heartsLAL ? heartsLAL.toFixed(2) : '—'} LAL)</div>
                </div>
                {b.notes && <p className="text-xs text-stone-500 mt-1 line-clamp-3">{b.notes}</p>}
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
