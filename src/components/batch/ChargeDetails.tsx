import React from "react"
import type { BatchNew, ChargeComponent } from "@/modules/production/new-model/types/batch.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function fmt(n: number | null | undefined, opts?: Intl.NumberFormatOptions) {
  if (n === null || n === undefined) return "—"
  return new Intl.NumberFormat("en-AU", opts).format(n)
}

export function ChargeDetails({ batch }: { batch: BatchNew }) {
  const total = batch.charge?.total
  const rows: ChargeComponent[] = batch.charge?.components || []

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-onyx">Charge</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-graphite">
        <div className="grid md:grid-cols-3 gap-3">
          {rows.map((r, i) => (
            <div key={i} className="rounded-md border bg-white px-3 py-2">
              <div className="font-medium">{r.source}</div>
              <div className="mt-1">
                <span className="font-semibold text-onyx">{fmt(r.volume_l)} L</span>
                {" @ "}
                <span className="font-semibold text-onyx">{fmt(r.abv_percent)}%</span>
              </div>
              <div className="text-graphite/70">LAL: {fmt(r.lal)}</div>
            </div>
          ))}
        </div>
        {total && (
          <div className="mt-3 text-right font-medium">
            Total: <span className="font-semibold text-onyx">{fmt(total.volume_l)} L</span> @ <span className="font-semibold text-onyx">{fmt(total.abv_percent)}%</span> · {fmt(total.lal)} LAL
          </div>
        )}
      </CardContent>
    </Card>
  )
}
