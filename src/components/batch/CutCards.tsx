import React from "react"
import type { BatchNew, CutPhase } from "@/modules/production/new-model/types/batch.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function fmt(n: number | null | undefined, opts?: Intl.NumberFormatOptions) {
  if (n === null || n === undefined) return "—"
  return new Intl.NumberFormat("en-AU", opts).format(n)
}

export function CutCards({ batch }: { batch: BatchNew }) {
  const c = batch.cuts
  const items: { key: keyof typeof c; title: string; tone: Tone }[] = [
    { key: "foreshots", title: "Foreshots", tone: "strong" },
    { key: "heads", title: "Heads", tone: "mid" },
    { key: "hearts", title: "Hearts", tone: "highlight" },
    { key: "tails", title: "Tails", tone: "muted" },
  ]

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map((it) => (
        <CutCard key={it.key} title={it.title} tone={it.tone} v={c[it.key] as CutPhase} />
      ))}
    </div>
  )
}

type Tone = "strong" | "mid" | "highlight" | "muted"

function CutCard({ title, tone, v }: { title: string; tone: Tone; v: CutPhase }) {
  const toneCls =
    tone === "highlight"
      ? "border-2 border-copper bg-beige"
      : tone === "strong"
      ? "border border-copper-30 bg-copper-10"
      : tone === "mid"
      ? "border border-copper-15 bg-copper-5"
      : "opacity-80 border bg-white"

  return (
    <Card className={`shadow-soft ${toneCls}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center text-onyx">
          {title}
          <span className="text-onyx text-base font-semibold">
            {fmt(v?.volume_l)} L{v?.abv_percent != null ? <span> · {fmt(v.abv_percent)}%</span> : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-graphite space-y-1">
        {line("LAL", v?.lal)}
        {line("Density", (v as any)?.density)}
        {line("Time", v?.time_start)}
        {line("Vessel", v?.receiving_vessel)}
        {v?.notes ? <div className="pt-2 text-graphite/80 italic">{v.notes}</div> : null}
      </CardContent>
    </Card>
  )
}

function line(label: string, value: any) {
  if (value === null || value === undefined || value === "") return null
  return (
    <p>
      <span className="font-medium">{label}:</span> {typeof value === "number" ? fmt(value) : String(value)}
    </p>
  )
}
