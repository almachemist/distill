import React from "react"
import type { BatchNew } from "@/modules/production/new-model/types/batch.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function fmt(n: number | null | undefined, opts?: Intl.NumberFormatOptions) {
  if (n === null || n === undefined) return "—"
  return new Intl.NumberFormat("en-AU", opts).format(n)
}

export function CutOverview({ batch }: { batch: BatchNew }) {
  const vols = (() => {
    const foreshots = batch.cuts?.foreshots?.volume_l || 0
    const heads = batch.cuts?.heads?.volume_l || 0
    const heartsSeg = batch.cuts?.hearts_segments || []
    const hearts = (batch.cuts?.hearts?.volume_l ?? 0) || heartsSeg.reduce((s, seg) => s + (seg.volume_l || 0), 0)
    const tailsSeg = batch.cuts?.tails_segments || []
    const tails = (batch.cuts?.tails?.volume_l ?? 0) || tailsSeg.reduce((s, seg) => s + (seg.volume_l || 0), 0)
    return { foreshots, heads, hearts, tails }
  })()
  const total = Math.max(1, vols.foreshots + vols.heads + vols.hearts + vols.tails)

  const rows: { key: keyof typeof vols; label: string; color: string }[] = [
    { key: "foreshots", label: "Foreshots", color: "bg-copper-red" },
    { key: "heads", label: "Heads", color: "bg-copper-amber" },
    { key: "hearts", label: "Hearts", color: "bg-copper-green" },
    { key: "tails", label: "Tails", color: "bg-graphite" },
  ]

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-onyx">Cut Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((r) => {
          const v = vols[r.key]
          const pct = Math.round((v / total) * 100)
          const abv = (() => {
            if (r.key === "tails") {
              return (batch.cuts?.tails?.abv_percent ?? (batch.cuts?.tails_segments?.length ? "varying" : null)) as number | string | null
            }
            return (batch.cuts as any)?.[r.key]?.abv_percent ?? null
          })()
          return (
            <div key={r.key} className="flex items-center gap-3">
              <div className="w-28 text-sm text-graphite">{r.label}</div>
              <div className="flex-1 h-3 rounded bg-gray-200 overflow-hidden">
                <div className={`${r.color} h-full`} style={{ width: `${pct}%` }} />
              </div>
              <div className="w-36 text-right">
                <div className="text-onyx font-semibold text-sm">
                  {fmt(v)} L
                  {abv == null ? "" : (
                    typeof abv === "number" ? <span> · {fmt(abv)}%</span> : <span> · {abv}</span>
                  )}
                </div>
                <div className="text-xs text-graphite/70">{fmt(pct)}% of total</div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
