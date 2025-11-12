import React from "react"
import type { BatchNew } from "@/modules/production/new-model/types/batch.types"
import { Card, CardContent } from "@/components/ui/card"

function fmt(n: number | null | undefined, opts?: Intl.NumberFormatOptions) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—"
  return new Intl.NumberFormat("en-AU", opts).format(n)
}

export function BatchHeader({ batch, productName, onEdit }: { batch: BatchNew; productName?: string; onEdit?: () => void }) {
  const heartsSegments = batch.cuts?.hearts_segments || []
  const tailsSegments = batch.cuts?.tails_segments || []

  const heartsVolume = (batch.cuts?.hearts?.volume_l ?? null) ?? (heartsSegments.reduce((sum, seg) => sum + (seg.volume_l || 0), 0) || null)
  const heartsAbv = batch.cuts?.hearts?.abv_percent ?? null
  const heartsLal = (batch.cuts?.hearts?.lal ?? null) ?? (heartsSegments.reduce((sum, seg) => sum + (seg.lal || 0), 0) || null)

  const tailsSaved = tailsSegments.reduce((sum, seg) => sum + (seg.volume_l || 0), 0)

  const finalOutput = batch.dilution?.combined?.final_output_run as
    | {
        total_volume_l?: number | null
        abv_percent?: number | null
        lal?: number | null
      }
    | undefined
  const finalStep = batch.dilution?.steps && batch.dilution.steps.length > 0 ? batch.dilution.steps[batch.dilution.steps.length - 1] : undefined
  const finalAbv = finalOutput?.abv_percent ?? finalStep?.target_abv_percent ?? null

  const chargeTotal = batch.charge?.total

  const stats: QuickStat[] = [
    {
      label: "Hearts",
      value: heartsVolume,
      suffix: "L",
      descriptor: heartsAbv != null ? `${fmt(heartsAbv, { maximumFractionDigits: 1 })}% ABV` : undefined,
      footer: heartsLal != null ? `${fmt(heartsLal, { maximumFractionDigits: 1 })} LAL` : undefined,
      tone: "emerald",
    },
    {
      label: "Final Output",
      value: finalOutput?.total_volume_l ?? null,
      suffix: "L",
      descriptor: finalAbv != null ? `${fmt(finalAbv, { maximumFractionDigits: 1 })}% ABV` : undefined,
      footer: finalOutput?.lal != null ? `${fmt(finalOutput.lal, { maximumFractionDigits: 1 })} LAL` : undefined,
      tone: "indigo",
    },
    {
      label: "Charge",
      value: chargeTotal?.volume_l ?? null,
      suffix: "L",
      descriptor: chargeTotal?.abv_percent != null ? `${fmt(chargeTotal.abv_percent, { maximumFractionDigits: 1 })}% ABV` : undefined,
      footer: chargeTotal?.lal != null ? `${fmt(chargeTotal.lal, { maximumFractionDigits: 1 })} LAL` : undefined,
      tone: "slate",
    },
  ]

  if (tailsSaved > 0) {
    stats.push({
      label: "Tails Saved",
      value: tailsSaved,
      suffix: "L",
      tone: "amber",
    })
  }

  return (
    <Card className="shadow-sm border border-slate-200 bg-white">
      <CardContent className="py-5 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            {productName || batch.sku} — {batch.batch_id}
          </h1>
          {onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Edit button clicked')
                onEdit()
              }}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer z-10 relative"
              title="Edit batch data"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
        </div>
        <div className="text-sm text-slate-600 flex flex-wrap gap-3">
          <span>{batch.date}</span>
          <span>
            Still: <strong className="text-slate-900">{batch.still_used}</strong>
          </span>
          {batch.timezone && (
            <span>
              TZ: <strong className="text-slate-900">{batch.timezone}</strong>
            </span>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <QuickStatCard key={stat.label} stat={stat} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

type QuickStat = {
  label: string
  value: number | null
  suffix?: string
  descriptor?: string
  footer?: string
  tone: "emerald" | "indigo" | "slate" | "amber"
}

function QuickStatCard({ stat }: { stat: QuickStat }) {
  const toneStyles: Record<QuickStat["tone"], string> = {
    emerald: "border-emerald-200 bg-emerald-50",
    indigo: "border-indigo-200 bg-indigo-50",
    slate: "border-slate-200 bg-slate-50",
    amber: "border-amber-200 bg-amber-50",
  }

  return (
    <div className={`rounded-xl border p-4 ${toneStyles[stat.tone]} min-h-[108px]`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">{stat.label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">
        {fmt(stat.value, { maximumFractionDigits: 1 })}
        {stat.suffix && <span className="ml-1 text-base font-medium text-slate-700">{stat.suffix}</span>}
      </div>
      {stat.descriptor && <div className="text-sm text-slate-700 mt-1">{stat.descriptor}</div>}
      {stat.footer && <div className="text-xs text-slate-600 mt-2">{stat.footer}</div>}
    </div>
  )
}
