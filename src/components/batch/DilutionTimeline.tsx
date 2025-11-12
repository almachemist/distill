import React from "react"
import type { BatchNew } from "@/modules/production/new-model/types/batch.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function fmt(n: number | null | undefined, opts?: Intl.NumberFormatOptions) {
  if (n === null || n === undefined) return "—"
  return new Intl.NumberFormat("en-AU", opts).format(n)
}

export function DilutionTimeline({ batch }: { batch: BatchNew }) {
  const d = batch.dilution
  if (!d) return null
  const hearts = batch.cuts?.hearts
  const heartsSeg = batch.cuts?.hearts_segments || []
  const heartsVol = (hearts?.volume_l ?? null) ?? (heartsSeg.reduce((s, seg) => s + (seg.volume_l || 0), 0) || null)
  const heartsAbv = hearts?.abv_percent ?? (heartsSeg.length > 0 ? null : null)
  const heartsLal = (hearts?.lal ?? null) ?? (heartsSeg.reduce((s, seg) => s + (seg.lal || 0), 0) || null)

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-onyx">Dilution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-graphite">
        <div className="rounded-md bg-copper-5 border border-copper-15 px-3 py-2 flex items-center justify-between">
          <div className="font-medium">Hearts Source</div>
          <div>
            <span className="font-semibold text-onyx">{fmt(heartsVol)} L</span>
            {heartsAbv != null && (
              <span> @ <span className="font-semibold text-onyx">{fmt(heartsAbv)}%</span></span>
            )}
            {heartsLal != null && (
              <span> · LAL <span className="font-semibold text-onyx">{fmt(heartsLal)}</span></span>
            )}
          </div>
        </div>
        {d.steps.map((s, i) => (
          <div key={s.step_id || i} className="rounded-md bg-copper-5 border border-copper-15 px-3 py-2 flex items-center justify-between">
            <div className="font-medium">Step {i + 1}</div>
            <div>
              + <span className="font-semibold text-onyx">{fmt(s.water_added_l)} L</span> water →
              <span className="ml-1 font-semibold text-onyx">{fmt(s.new_volume_l)} L</span>
              {s.target_abv_percent != null && (
                <span> @ <span className="font-semibold text-onyx">{fmt(s.target_abv_percent)}%</span></span>
              )}
              {s.lal != null && (
                <span> · LAL <span className="font-semibold text-onyx">{fmt(s.lal)}</span></span>
              )}
            </div>
          </div>
        ))}
        <div className="border-t pt-3">
          <strong>Final Output:</strong>
          <span className="ml-1 font-semibold text-onyx">{fmt(d.combined.final_output_run.total_volume_l)} L</span>
          {d.combined.final_output_run.new_make_l != null && (
            <span> · New make <span className="font-semibold text-onyx">{fmt(d.combined.final_output_run.new_make_l)} L</span></span>
          )}
          {d.combined.final_output_run.lal != null && (
            <span> · LAL <span className="font-semibold text-onyx">{fmt(d.combined.final_output_run.lal)}</span></span>
          )}
          {d.combined.notes && <div className="italic text-graphite/80 mt-1">{d.combined.notes}</div>}
        </div>
      </CardContent>
    </Card>
  )
}

function textOr<T>(val: T | null | undefined, render: (v: T) => string) {
  if (val === null || val === undefined) return ""
  return render(val)
}
