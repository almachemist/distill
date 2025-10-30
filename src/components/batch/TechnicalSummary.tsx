import React from "react"
import type { BatchNew } from "@/modules/production/new-model/types/batch.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { computeBatchKpi } from "@/modules/production/new-model/services/lal.service"

function fmt(n: number | null | undefined, opts?: Intl.NumberFormatOptions) {
  if (n === null || n === undefined) return "—"
  return new Intl.NumberFormat("en-AU", opts).format(n)
}

export function TechnicalSummary({ batch }: { batch: BatchNew }) {
  const k = computeBatchKpi(batch)
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-onyx">Technical Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-4 gap-3 text-sm text-graphite">
        <Kpi label="Hearts LAL" value={`${fmt(k.hearts_lal)} LAL`} />
        <Kpi label="Heads LAL" value={`${fmt(k.heads_lal)} LAL`} />
        <Kpi label="Tails LAL" value={`${fmt(k.tails_lal)} LAL`} />
        <Kpi label="Hearts Yield" value={k.hearts_recovery_pct == null ? "—" : `${fmt(k.hearts_recovery_pct, { maximumFractionDigits: 1 })}%`} />
        <Kpi label="Total Recovery" value={k.total_recovery_pct == null ? "—" : `${fmt(k.total_recovery_pct, { maximumFractionDigits: 1 })}%`} />
        <Kpi label="Losses" value={k.losses_pct == null ? "—" : `${fmt(k.losses_pct, { maximumFractionDigits: 1 })}%`} />
        <Kpi label="Charge LAL" value={`${fmt(batch.charge?.total?.lal)} LAL`} />
        <Kpi label="Out LAL" value={`${fmt(k.out_lal)} LAL`} />
        <Kpi label="Losses LAL" value={`${fmt(k.losses_lal)} LAL`} />
      </CardContent>
    </Card>
  )
}

function Kpi({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border bg-white px-3 py-2">
      <div className="text-graphite/70">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}
