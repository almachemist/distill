'use client'

import type { BatchWithMaterials, MaterialNeed } from './planning-cards-types'

export function BatchCardsGrid({ batches, currentStock }: { batches: BatchWithMaterials[]; currentStock: Map<string, number> }) {
  if (batches.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-[#C07A50] p-12 text-center">
        <p className="text-sm text-[#C07A50]/60">No batches scheduled for this period</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {batches.map((batch, index) => (
        <BatchCard key={index} batch={batch} batchNumber={index + 1} currentStock={currentStock} />
      ))}
    </div>
  )
}

function BatchCard({ batch, batchNumber, currentStock }: { batch: BatchWithMaterials; batchNumber: number; currentStock: Map<string, number> }) {
  const allMaterials = [...batch.packaging, ...batch.botanicals]
  const criticalMaterials = allMaterials.filter(m => m.status === 'CRITICAL')
  const hasCritical = criticalMaterials.length > 0
  const fg700 = currentStock.get(`${batch.product} 700ml`) || 0
  const fg200 = currentStock.get(`${batch.product} 200ml`) || 0
  const fg1000 = currentStock.get(`${batch.product} 1000ml`) || 0
  const fgTotal = fg700 + fg200 + fg1000
  const bottles1000 = (batch as any).bottles_1000ml || 0
  const plannedTotal = batch.total_bottles || (batch.bottles_700ml + batch.bottles_200ml + bottles1000)
  const progressPct = plannedTotal > 0 ? Math.min(100, (fgTotal / plannedTotal) * 100) : 0

  return (
    <div className="bg-beige rounded-xl shadow-sm border border-copper transition-all duration-150 hover:shadow-md">
      {/* Card Header */}
      <div className="px-6 py-5 border-b border-copper-20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-graphite text-white text-sm font-semibold">{batchNumber}</span>
              <div>
                <h3 className="text-lg font-semibold text-graphite">{batch.product}</h3>
                <p className="text-sm text-copper mt-0.5">Batch {batch.batch_number} of {batch.total_batches} • {batch.scheduled_month_name} 2026</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-copper uppercase tracking-wide">Bottles</p>
            <p className="text-2xl font-semibold text-graphite">{batch.total_bottles.toLocaleString()}</p>
            <p className="text-xs text-copper/60 mt-1">
              {batch.bottles_700ml > 0 && `${batch.bottles_700ml} × 700ml`}
              {batch.bottles_700ml > 0 && batch.bottles_200ml > 0 && ' + '}
              {batch.bottles_200ml > 0 && `${batch.bottles_200ml} × 200ml`}
            </p>
            <div className="mt-2">
              <div className="h-2 bg-copper-10 rounded-full overflow-hidden">
                <div className="h-full bg-copper rounded-full transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="text-xs text-copper/70 mt-1">{fgTotal.toLocaleString()} on hand of {plannedTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {hasCritical && (
          <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-copper-5 border border-copper-30 rounded-lg">
            <span className="text-copper text-sm font-medium">{criticalMaterials.length} material(s) missing</span>
          </div>
        )}
      </div>

      {/* Card Body - Materials */}
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <a href={`/dashboard/production/bottling/new?product=${encodeURIComponent(batch.product)}&search=${encodeURIComponent(batch.product)}`}
            className="inline-flex items-center px-3 py-2 rounded-lg border border-copper-30 text-graphite hover:bg-copper-10 transition text-sm font-medium">Start Bottling</a>
          {batch.production_type === 'GIN' && (
            <a href={`/dashboard/production/start-batch?productType=gin&recipe=${encodeURIComponent(batch.product)}`}
              className="inline-flex items-center px-3 py-2 rounded-lg border border-copper-30 text-graphite hover:bg-copper-10 transition text-sm font-medium">Start Gin Batch</a>
          )}
        </div>

        {batch.packaging.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-copper uppercase tracking-wide mb-3">Packaging</h4>
            <div className="space-y-2">{batch.packaging.map((m, idx) => <MaterialRow key={idx} material={m} />)}</div>
          </div>
        )}

        {batch.botanicals.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-copper uppercase tracking-wide mb-3">Botanicals</h4>
            <div className="space-y-2">{batch.botanicals.map((m, idx) => <MaterialRow key={idx} material={m} />)}</div>
          </div>
        )}
      </div>
    </div>
  )
}

function MaterialRow({ material }: { material: MaterialNeed }) {
  const missing = material.stock_after < 0 ? Math.abs(material.stock_after) : 0

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-150 ${
      material.status === 'CRITICAL' ? 'bg-copper-5 border-copper-20' : 'bg-white border-copper-20'
    }`}>
      <div className="flex-1">
        <p className="text-sm font-medium text-graphite">{material.name}</p>
        <p className="text-xs text-copper/70 mt-0.5">
          Need: <span className="font-semibold text-graphite">{material.needed.toLocaleString()} {material.uom}</span>
          {' • '}
          Current: <span className="font-semibold text-graphite">{material.current_stock.toLocaleString()} {material.uom}</span>
        </p>
      </div>
      <div className="text-right mr-4">
        <p className={`text-sm font-semibold tabular-nums ${material.stock_after <= 0 ? 'text-copper' : 'text-graphite'}`}>
          {material.stock_after.toLocaleString()} {material.uom}
        </p>
        <p className="text-xs text-copper/60 mt-0.5">after batch</p>
      </div>
      {missing > 0 && (
        <div className="text-right mr-4">
          <p className="text-sm font-bold text-copper tabular-nums">{missing.toLocaleString()} {material.uom}</p>
          <p className="text-xs text-copper mt-0.5 font-medium">MISSING</p>
        </div>
      )}
      <div className="ml-4"><StatusBadge status={material.status} /></div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    CRITICAL: 'bg-copper-5 text-copper border-copper-30',
    LOW: 'bg-copper-5 text-copper border-copper-30',
    ADEQUATE: 'bg-beige text-graphite border-copper-20',
    GOOD: 'bg-beige text-graphite border-copper-20',
  }
  const labels: Record<string, string> = { CRITICAL: 'OUT', LOW: 'LOW', ADEQUATE: 'OK', GOOD: 'OK' }

  return (
    <span className={`inline-flex px-2 py-1 rounded border text-xs font-semibold ${colors[status]}`}>
      {labels[status]}
    </span>
  )
}
