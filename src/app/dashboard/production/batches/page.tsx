"use client"

import { useMemo, useState, useEffect } from "react"
import { batchesDataset } from "@/modules/production/new-model/data/batches.dataset"
import type { BatchNew, Product } from "@/modules/production/new-model/types/batch.types"
import { BatchHeader } from "@/components/batch/BatchHeader"
import { CutOverview } from "@/components/batch/CutOverview"
import { CutCards } from "@/components/batch/CutCards"
import { DilutionTimeline } from "@/components/batch/DilutionTimeline"
import { ChargeDetails } from "@/components/batch/ChargeDetails"
import { TechnicalSummary } from "@/components/batch/TechnicalSummary"
import { ComplianceReport } from "@/components/batch/ComplianceReport"
import { AnalyticsSummary } from "@/components/batch/AnalyticsSummary"

type BatchWithMonth = { monthKey: string; monthLabel: string; batch: BatchNew }

function monthKeyToLabel(key: string) {
  // key is YYYY-MM
  const [y, m] = key.split("-").map(Number)
  const d = new Date(y, (m || 1) - 1, 1)
  return d.toLocaleString("en-US", { month: "long", year: "numeric" })
}

function fmt(n: number | null | undefined, opts?: Intl.NumberFormatOptions) {
  if (n === null || n === undefined) return "—"
  return new Intl.NumberFormat("en-AU", opts).format(n)
}

export default function BatchesPage() {
  const productsMap = useMemo(() => {
    const m = new Map<string, Product>()
    for (const p of batchesDataset.products) m.set(p.product_id, p)
    return m
  }, [batchesDataset.products])

  const allBatches: BatchWithMonth[] = useMemo(() => {
    const rows: BatchWithMonth[] = []
    for (const [monthKey, list] of Object.entries(batchesDataset.batches_by_month)) {
      const label = monthKeyToLabel(monthKey)
      for (const b of list) rows.push({ monthKey, monthLabel: label, batch: b })
    }
    // sort by date asc (oldest to newest)
    return rows.sort((a, b) => new Date(a.batch.date).getTime() - new Date(b.batch.date).getTime())
  }, [batchesDataset.batches_by_month])

  const [search, setSearch] = useState("")
  const filtered = useMemo(() => {
    if (!search) return allBatches
    const q = search.toLowerCase()
    return allBatches.filter(({ batch }) =>
      batch.display_name.toLowerCase().includes(q) ||
      batch.sku.toLowerCase().includes(q) ||
      batch.batch_id.toLowerCase().includes(q) ||
      batch.still_used.toLowerCase().includes(q)
    )
  }, [allBatches, search])

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; list: BatchNew[] }>()
    for (const row of filtered) {
      const k = row.monthKey
      if (!map.has(k)) map.set(k, { label: row.monthLabel, list: [] })
      map.get(k)!.list.push(row.batch)
    }
    // sort months asc by first item date
    return Array.from(map.entries())
      .map(([k, v]) => ({ key: k, label: v.label, list: v.list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) }))
      .sort((a, b) => new Date(a.list[0]?.date || 0).getTime() - new Date(b.list[0]?.date || 0).getTime())
  }, [filtered])

  const [selected, setSelected] = useState<BatchNew | null>(allBatches[0]?.batch ?? null)
  useEffect(() => {
    // If no selection yet, or current selection no longer exists, select newest
    const exists = selected ? allBatches.find(r => r.batch.batch_id === selected.batch_id) : null
    if ((!selected || !exists) && allBatches[0]) {
      setSelected(allBatches[0].batch)
    }
  }, [allBatches, selected])

  const productOfSelected = selected ? productsMap.get(selected.product_id) : undefined
  const [botOpen, setBotOpen] = useState(false)
  const [openCuts, setOpenCuts] = useState<Record<'Foreshots' | 'Heads' | 'Hearts' | 'Tails', boolean>>({
    Foreshots: false,
    Heads: false,
    Hearts: true,
    Tails: false,
  })
  const [analyticsOpen, setAnalyticsOpen] = useState(false)
  useEffect(() => {
    if (!selected) return
    const hasHearts = !!selected.cuts?.hearts?.volume_l
    const hasTailsSeg = (selected.cuts?.tails_segments?.length || 0) > 0
    setOpenCuts({
      Foreshots: false,
      Heads: false,
      Hearts: !!hasHearts,
      Tails: !hasHearts && !!hasTailsSeg,
    })
  }, [selected?.batch_id])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold">Batches</h1>
          <p className="text-indigo-100 mt-2">Clean, month-grouped list of real batches with a detailed, mostly read-only batch card.</p>
          <div className="mt-6 max-w-xl">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product, batch, still, or ID..."
                className="w-full pr-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: list grouped by month */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">All Batches</h2>
            <div className="space-y-6">
              {grouped.map((g) => (
                <div key={g.key}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                    <div className="text-sm font-semibold text-gray-900">{g.label}</div>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{g.list.length}</span>
                  </div>
                  <div className="space-y-2">
                    {g.list.map((b) => (
                      <button
                        key={b.batch_id}
                        onClick={() => setSelected(b)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${selected?.batch_id === b.batch_id ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:bg-gray-50"}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{b.display_name}</div>
                            <div className="text-xs text-gray-600">{b.batch_id}</div>
                            <div className="text-xs text-gray-500">{b.date} • Still: {b.still_used}</div>
                          </div>
                          <div className="text-right text-xs text-gray-600">
                            <div>Charge: {fmt(b.charge?.total?.volume_l)} L</div>
                            <div>Hearts: {fmt(b.cuts?.hearts?.volume_l)} L</div>
                            <div>Final: {fmt(b.dilution?.combined?.final_output_run?.total_volume_l)} L</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {grouped.length === 0 && (
                <div className="text-center text-gray-500 py-10">No batches match your search.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right: batch card */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center text-gray-500">Select a batch to view details.</div>
          ) : (
            <div className="space-y-6">
              {/* Header + Overview + Cut Cards */}
              <BatchHeader batch={selected} productName={productOfSelected?.display_name} />
              <CutOverview batch={selected} />
              <CutCards batch={selected} />

              {/* Hearts Breakdown (visible if parts exist) */}
              {(selected.cuts?.hearts_segments && selected.cuts.hearts_segments.length > 0) && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Hearts Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-500 font-medium">Time</th>
                          <th className="px-4 py-2 text-left text-gray-500 font-medium">Volume (L)</th>
                          <th className="px-4 py-2 text-left text-gray-500 font-medium">ABV (%)</th>
                          <th className="px-4 py-2 text-left text-gray-500 font-medium">Density</th>
                          <th className="px-4 py-2 text-left text-gray-500 font-medium">LAL</th>
                          <th className="px-4 py-2 text-left text-gray-500 font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selected.cuts.hearts_segments.map((seg, i) => (
                          <tr key={i}>
                            <td className="px-4 py-2 text-gray-900 whitespace-nowrap">{seg.time_start || '—'}</td>
                            <td className="px-4 py-2 font-semibold text-onyx">{seg.volume_l == null ? 'pending' : fmt(seg.volume_l)}</td>
                            <td className="px-4 py-2 font-semibold text-onyx">{seg.abv_percent == null ? 'pending' : fmt(seg.abv_percent)}</td>
                            <td className="px-4 py-2 text-gray-700">{seg.density == null ? '—' : fmt(seg.density)}</td>
                            <td className="px-4 py-2 text-gray-700">{seg.lal == null ? 'pending' : fmt(seg.lal)}</td>
                            <td className="px-4 py-2 text-gray-700">{seg.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tails Breakdown (always visible if segments exist) */}
              {(selected.cuts?.tails_segments && selected.cuts.tails_segments.length > 0) && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Tails Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-500 font-medium">Date</th>
                          <th className="px-4 py-2 text-left text-gray-500 font-medium">Volume (L)</th>
                          <th className="px-4 py-2 text-left text-gray-500 font-medium">ABV (%)</th>
                          <th className="px-4 py-2 text-left text-gray-500 font-medium">Density</th>
                          <th className="px-4 py-2 text-left text-gray-500 font-medium">LAL</th>
                          <th className="px-4 py-2 text-left text-gray-500 font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selected.cuts.tails_segments.map((seg, i) => (
                          <tr key={i}>
                            <td className="px-4 py-2 text-gray-900 whitespace-nowrap">{seg.date || '—'}</td>
                            <td className="px-4 py-2 font-bold text-onyx">{seg.volume_l == null ? 'pending' : fmt(seg.volume_l)}</td>
                            <td className="px-4 py-2 font-bold text-onyx">{seg.abv_percent == null ? 'pending' : fmt(seg.abv_percent)}</td>
                            <td className="px-4 py-2 text-gray-700">{seg as any && (seg as any).density != null ? fmt((seg as any).density as any) : '—'}</td>
                            <td className="px-4 py-2 text-gray-700">{seg.lal == null ? 'pending' : fmt(seg.lal)}</td>
                            <td className="px-4 py-2 text-gray-700">{seg.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Technical Summary */}
              <TechnicalSummary batch={selected} />

              {/* Compliance Report (ATO) */}
              <ComplianceReport batch={selected} />

              {/* Analytics toggle */}
              <div className="flex justify-end">
                <button
                  onClick={() => setAnalyticsOpen((v) => !v)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition"
                >
                  {analyticsOpen ? "Ocultar análises" : "Ver análises 2025 • Carrie"}
                </button>
              </div>

              {analyticsOpen && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <AnalyticsSummary dataset={batchesDataset} year={2025} still="Carrie" />
                </div>
              )}

              {/* Cuts Detail replaced by Cut Cards */}

              {/* Dilution Timeline */}
              {selected.dilution && <DilutionTimeline batch={selected} />}

              {/* Botanicals - accordion */}
              {selected.botanicals && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                  <button
                    onClick={() => setBotOpen((v) => !v)}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="text-lg font-semibold text-gray-900">Botanicals</div>
                    <div className={`transition-transform ${botOpen ? "rotate-90" : ""}`}>›</div>
                  </button>
                  {botOpen && (
                    <div className="p-6 pt-0">
                      <div className="mb-2 text-sm text-gray-700">Per LAL: {fmt(selected.botanicals.per_lal_g)} g</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selected.botanicals.items.map((b, i) => (
                          <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                            <div className="font-medium text-gray-900">{b.name}</div>
                            <div className="text-sm text-gray-700">{fmt(b.weight_g)} g {b.ratio_percent != null && <span className="text-gray-500">({fmt(b.ratio_percent)}%)</span>}</div>
                            {(b.prep || b.time || b.phase) && (
                              <div className="text-xs text-gray-600 mt-1">{b.prep || ""}{b.prep && (b.time || b.phase) ? " • " : ""}{b.time || ""}{b.time && b.phase ? " • " : ""}{b.phase || ""}</div>
                            )}
                          </div>
                        ))}
                      </div>
                      {selected.botanicals.steeping_notes && (
                        <div className="text-xs text-gray-600 mt-2">{selected.botanicals.steeping_notes}</div>
                      )}
                      {selected.botanicals.omitted_from_run && selected.botanicals.omitted_from_run.length > 0 && (
                        <div className="text-xs text-gray-600 mt-2">Omitted: {selected.botanicals.omitted_from_run.join(", ")}</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Charge Details */}
              {selected.charge && <ChargeDetails batch={selected} />}

              {/* Run Summary - smaller */}
              {selected.run_summary && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Run Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Condenser Temp (°C)</div>
                      <div className="font-medium text-gray-900">{fmt(selected.run_summary.condenser_temp_c)}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-gray-600">Power Settings</div>
                      <div className="font-medium text-gray-900 space-y-1">
                        {selected.run_summary.power_settings.map((p, i) => (
                          <div key={i}>{p}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {selected.run_summary.observations.length > 0 && (
                    <div className="mt-3 text-xs text-gray-600">Observations: {selected.run_summary.observations.join("; ")}</div>
                  )}
                </div>
              )}

              

              {/* Phase Outputs */}
              {selected.phase_outputs && selected.phase_outputs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Phase Outputs</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-500 font-medium">Phase</th>
                          <th className="px-4 py-2 text-left text-gray-500 font-medium">Vessel</th>
                          <th className="px-4 py-2 text-left text-gray-500 font-medium">Volume (L)</th>
                          <th className="px-4 py-2 text-left text-gray-500 font-medium">ABV (%)</th>
                          <th className="px-4 py-2 text-left text-gray-500 font-medium">LAL</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selected.phase_outputs.map((p, i) => (
                          <tr key={i}>
                            <td className="px-4 py-2 text-gray-900">{p.phase}</td>
                            <td className="px-4 py-2 text-gray-700">{p.receiving_vessel || "-"}</td>
                            <td className="px-4 py-2 text-gray-700">{fmt(p.volume_l)}</td>
                            <td className="px-4 py-2 text-gray-700">{fmt(p.abv_percent)}</td>
                            <td className="px-4 py-2 text-gray-700">{fmt(p.lal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              

              {/* Attachments */}
              {selected.attachments && selected.attachments.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
                  <div className="space-y-2 text-sm">
                    {selected.attachments.map((a, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="text-gray-900 font-medium">{a.label}</div>
                        <div className="text-gray-600 text-xs">{a.type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
