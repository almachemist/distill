import React from "react"
import type { BatchNew } from "@/modules/production/new-model/types/batch.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { computeBatchKpi, checkDilutionInvariance, computeForeshotsLal } from "@/modules/production/new-model/services/lal.service"

function fmt(n: number | null | undefined, opts?: Intl.NumberFormatOptions) {
  if (n === null || n === undefined) return "—"
  return new Intl.NumberFormat("en-AU", opts).format(n)
}

export function ComplianceReport({ batch }: { batch: BatchNew }) {
  const k = computeBatchKpi(batch)
  const dil = checkDilutionInvariance(batch)
  const hasDilIssue = dil.flags.includes("lal_discrepancy")
  const fs = computeForeshotsLal(batch.cuts)

  const Row = ({ l, v }: { l: string; v: React.ReactNode }) => (
    <div className="flex items-center justify-between py-1 border-b last:border-b-0">
      <div className="text-graphite/70">{l}</div>
      <div className="font-semibold text-onyx">{v}</div>
    </div>
  )

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-onyx">Compliance Report (ATO)</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
        <div className="rounded-md border bg-white p-3 space-y-1">
          <Row l="Charge LAL" v={`${fmt(k.charge_lal)} LAL`} />
          <Row l="Out LAL (Hearts+Heads+Tails)" v={`${fmt(k.out_lal)} LAL`} />
          <Row l="Losses LAL" v={`${fmt(k.losses_lal)} LAL`} />
          <Row l="Hearts LAL" v={`${fmt(k.hearts_lal)} LAL`} />
          <Row l="Heads LAL" v={`${fmt(k.heads_lal)} LAL`} />
          <Row l="Tails LAL" v={`${fmt(k.tails_lal)} LAL`} />
          <Row l="Foreshots LAL (audit)" v={`${fmt(fs.value)} LAL`} />
        </div>
        <div className="rounded-md border bg-white p-3 space-y-1">
          <Row l="Hearts Recovery" v={`${k.hearts_recovery_pct == null ? '—' : fmt(k.hearts_recovery_pct, { maximumFractionDigits: 1 }) + '%'}`} />
          <Row l="Total Recovery" v={`${k.total_recovery_pct == null ? '—' : fmt(k.total_recovery_pct, { maximumFractionDigits: 1 }) + '%'}`} />
          <Row l="Losses" v={`${k.losses_pct == null ? '—' : fmt(k.losses_pct, { maximumFractionDigits: 1 }) + '%'}`} />
          <div className={`mt-2 rounded-md px-3 py-2 border ${hasDilIssue ? 'border-orange-400 bg-orange-50 text-orange-900' : 'border-emerald-300 bg-emerald-50 text-emerald-900'}`}>
            <div className="font-medium">Dilution Invariance</div>
            <div className="text-xs mt-0.5">
              {hasDilIssue ? (
                <>
                  Hearts LAL should equal Final Output LAL. Found discrepancy.
                  {dil.value != null && <span> Final LAL: {fmt(dil.value)} LAL</span>}
                </>
              ) : (
                <>OK — LAL preserved across dilution</>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
