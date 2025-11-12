"use client"

import Link from "next/link"
import type { RumBatch } from "./types"
import { getBatchHeadlineStats } from "./stats"

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "short",
  year: "numeric"
})

interface BatchCardProps {
  batch: RumBatch
}

export function BatchCard({ batch }: BatchCardProps) {
  const stats = getBatchHeadlineStats(batch)
  const formattedDate = dateFormatter.format(new Date(batch.date))

  return (
    <article className="bg-white border border-amber-200/60 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-300/80 transition-all duration-150 flex flex-col">
      <header className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-amber-900 tracking-tight">{batch.batch_id}</h2>
            <p className="text-sm text-neutral-500 mt-1">{formattedDate}</p>
          </div>
          <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
            {batch.fermentation?.substrate || "Unknown substrate"}
          </span>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-5 pb-4 text-sm text-neutral-600">
        <div>
          <dt className="text-neutral-400 text-xs uppercase tracking-wide">Boiler ABV</dt>
          <dd className="font-medium text-neutral-800">{stats.boilerAbv}</dd>
        </div>
        <div>
          <dt className="text-neutral-400 text-xs uppercase tracking-wide">LAL In → Out</dt>
          <dd className="font-medium text-neutral-800">{stats.lalInOut}</dd>
        </div>
        <div>
          <dt className="text-neutral-400 text-xs uppercase tracking-wide">Hearts Yield %</dt>
          <dd className="font-medium text-neutral-800">{stats.heartYield}</dd>
        </div>
        <div>
          <dt className="text-neutral-400 text-xs uppercase tracking-wide">Runs Logged</dt>
          <dd className="font-medium text-neutral-800">{batch.distillation_runs?.length ?? 0}</dd>
        </div>
      </dl>

      <footer className="mt-auto px-5 pb-5">
        <Link
          href={`/rum/${batch.batch_id}`}
          className="inline-flex items-center justify-center rounded-full bg-amber-600 text-white text-sm font-medium px-4 py-2 hover:bg-amber-700 transition-colors"
        >
          View Details
        </Link>
      </footer>
    </article>
  )
}
