'use client'

import type { BatchWithMaterials, MaterialNeed, StockTimeline } from './planning-types'

export function BatchList({ batches }: { batches: BatchWithMaterials[] }) {
  if (batches.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
        <p className="text-sm text-neutral-400">No batches scheduled for this period</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {batches.map((batch, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-gradient-to-r from-neutral-50 to-white px-6 py-5 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">{batch.product}</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  Batch {batch.batch_number} of {batch.total_batches} • {batch.scheduled_month_name} 2026 • {batch.production_type}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500 uppercase tracking-wide">Total Bottles</p>
                <p className="text-2xl font-semibold text-neutral-900">{batch.total_bottles.toLocaleString()}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  {batch.bottles_700ml > 0 && `${batch.bottles_700ml} × 700ml`}
                  {batch.bottles_700ml > 0 && batch.bottles_200ml > 0 && ' + '}
                  {batch.bottles_200ml > 0 && `${batch.bottles_200ml} × 200ml`}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {batch.packaging.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wide">Packaging</h4>
                <MaterialsTable materials={batch.packaging} />
              </div>
            )}
            {batch.botanicals.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wide">Botanicals</h4>
                <MaterialsTable materials={batch.botanicals} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function MaterialsTable({ materials }: { materials: MaterialNeed[] }) {
  return (
    <table className="w-full">
      <thead className="bg-neutral-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Material</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Needed</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Current Stock</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Shortage</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-copper-15 bg-white">
        {materials.map((material, idx) => (
          <tr key={idx} className="hover:bg-neutral-50 transition-colors duration-150">
            <td className="px-4 py-3 text-sm text-neutral-900 font-medium">{material.name}</td>
            <td className="px-4 py-3 text-sm text-right font-semibold text-neutral-900 tabular-nums">{material.needed.toLocaleString()} {material.uom}</td>
            <td className="px-4 py-3 text-sm text-right text-neutral-600 tabular-nums">{material.current_stock.toLocaleString()} {material.uom}</td>
            <td className="px-4 py-3 text-sm text-right font-semibold text-copper tabular-nums">
              {material.shortage > 0 ? `${material.shortage.toLocaleString()} ${material.uom}` : '-'}
            </td>
            <td className="px-4 py-3 text-right"><StatusBadge status={material.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    CRITICAL: 'bg-beige text-copper', LOW: 'bg-beige text-copper',
    ADEQUATE: 'bg-beige text-graphite', GOOD: 'bg-beige text-graphite',
  }
  return (
    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium ${colors[status]}`}>{status}</span>
  )
}

export function StockTimelineView({ timelines }: { timelines: StockTimeline[] }) {
  const byCategory = timelines.reduce((acc, timeline) => {
    if (!acc[timeline.category]) acc[timeline.category] = []
    acc[timeline.category].push(timeline)
    return acc
  }, {} as Record<string, StockTimeline[]>)

  return (
    <div className="space-y-8">
      {['Packaging', 'Botanicals'].map(category => {
        const items = byCategory[category] || []
        if (items.length === 0) return null
        return (
          <div key={category} className="bg-beige rounded-xl shadow-sm border border-copper overflow-hidden">
            <div className="bg-white px-6 py-4 border-b border-copper-20">
              <h3 className="text-lg font-semibold text-graphite">{category}</h3>
              <p className="text-sm text-copper mt-1">Stock consumption timeline • {items.length} materials tracked</p>
            </div>
            <div className="p-6 space-y-8">
              {items.map(timeline => (
                <div key={timeline.material_name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-graphite">{timeline.material_name}</h4>
                      <p className="text-xs text-copper/70 mt-1">
                        Initial Stock: <span className="font-semibold text-graphite">{timeline.initial_stock.toLocaleString()} {timeline.uom}</span>
                      </p>
                    </div>
                    {timeline.batches.some(b => b.runs_out) && (
                      <span className="inline-flex px-3 py-1 rounded-lg text-xs font-medium bg-copper-5 text-copper border border-copper-30">Runs Out</span>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white border-b border-copper-20">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-copper uppercase">Batch</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-copper uppercase">Product</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-copper uppercase">Month</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-copper uppercase">Consumed</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-copper uppercase">Stock After</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-copper uppercase">Missing</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-copper uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-copper-20">
                        {timeline.batches.map((batch, idx) => {
                          const missing = batch.stock_after < 0 ? Math.abs(batch.stock_after) : 0
                          return (
                            <tr key={idx} className={`hover:bg-white/50 transition-colors duration-150 ${batch.runs_out ? 'bg-copper-5' : 'bg-white'}`}>
                              <td className="px-4 py-3 text-copper/70 font-medium">#{batch.batch_index + 1}</td>
                              <td className="px-4 py-3 text-graphite font-medium">{batch.product}</td>
                              <td className="px-4 py-3 text-copper/70">{batch.month}</td>
                              <td className="px-4 py-3 text-right text-copper font-semibold tabular-nums">-{batch.consumed.toLocaleString()} {timeline.uom}</td>
                              <td className={`px-4 py-3 text-right font-semibold tabular-nums ${batch.stock_after <= 0 ? 'text-copper' : 'text-graphite'}`}>
                                {batch.stock_after.toLocaleString()} {timeline.uom}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-copper tabular-nums">
                                {missing > 0 ? `${missing.toLocaleString()} ${timeline.uom}` : '-'}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {batch.runs_out
                                  ? <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-copper-5 text-copper border border-copper-30">OUT</span>
                                  : <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-beige text-graphite border border-copper-20">OK</span>}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-copper-20">
                    <p className="text-xs text-copper/70">After {timeline.batches.length} batches</p>
                    <p className={`text-sm font-semibold ${timeline.batches[timeline.batches.length - 1].stock_after <= 0 ? 'text-copper' : 'text-graphite'}`}>
                      Final Stock: {timeline.batches[timeline.batches.length - 1].stock_after.toLocaleString()} {timeline.uom}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
