"use client"

import { useState } from "react"
import Link from "next/link"
import type { RumBatch, RumDetailTab } from "./types"
import { formatDate, formatMaybeNumber } from "./format"
import { FermentationTab } from "@/app/rum/components/tabs/FermentationTab"
import { DistillationTab } from "@/app/rum/components/tabs/DistillationTab"
import { CaskTab } from "@/app/rum/components/tabs/CaskTab"
import { GraphsTab } from "@/app/rum/components/tabs/GraphsTab"
import { NotesTab } from "@/app/rum/components/tabs/NotesTab"

const TAB_ITEMS: { key: RumDetailTab; label: string; description: string }[] = [
  { key: "fermentation", label: "Fermentation", description: "Substrate, yeast, kinetics" },
  { key: "distillation", label: "Distillation", description: "Boiler, retorts, cuts" },
  { key: "cask", label: "Cask", description: "Fill details and notes" },
  { key: "graphs", label: "Graphs", description: "Profiles & run metrics" },
  { key: "notes", label: "Notes", description: "Production diary" }
]

interface RumDetailProps {
  batch: RumBatch
}

export function RumDetail({ batch }: RumDetailProps) {
  const [activeTab, setActiveTab] = useState<RumDetailTab>("fermentation")

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <header className="space-y-5">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-amber-500">Rum Program · Roberta</p>
              <h1 className="mt-3 text-3xl md:text-4xl font-serif font-semibold text-amber-900 tracking-tight">
                {batch.batch_id}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-600">
                <span>{formatDate(batch.date)}</span>
                {batch.fermentation?.substrate && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                    <span className="text-xs font-semibold uppercase">Substrate</span>
                    <span>{batch.fermentation.substrate}</span>
                  </span>
                )}
                {batch.product_variant && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                    <span className="text-xs font-semibold uppercase">Variant</span>
                    <span>{batch.product_variant}</span>
                  </span>
                )}
              </div>
            </div>

            <Link
              href="/rum"
              className="hidden md:inline-flex items-center rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-700 shadow-sm hover:border-amber-300 hover:text-amber-800"
            >
              ← Back to log
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <SummaryTile title="Boiler ABV" value={batch.distillation_runs?.[0]?.boiler_abv_percent} suffix="%" />
            <SummaryTile title="LAL In" value={batch.distillation_runs?.[0]?.summary?.lal_in} />
            <SummaryTile title="LAL Out" value={batch.distillation_runs?.[0]?.summary?.lal_out} />
            <SummaryTile
              title="Hearts Yield"
              value={batch.distillation_runs?.[0]?.summary?.heart_yield_percent}
              suffix="%"
            />
          </div>
        </header>

        <nav className="border-b border-amber-200/60">
          <ul className="-mb-px flex flex-wrap gap-2">
            {TAB_ITEMS.map((tab) => {
              const isActive = tab.key === activeTab
              return (
                <li key={tab.key}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-t-2xl px-4 py-3 text-left transition-all ${
                      isActive
                        ? "bg-white text-amber-800 shadow-sm border border-b-neutral-50"
                        : "text-neutral-500 hover:text-amber-700"
                    }`}
                  >
                    <div className="text-sm font-semibold">{tab.label}</div>
                    <div className="text-xs text-neutral-400">{tab.description}</div>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <section className="bg-white rounded-3xl border border-amber-200/60 shadow-sm p-6 md:p-8">
          {activeTab === "fermentation" && <FermentationTab data={batch.fermentation} />}
          {activeTab === "distillation" && <DistillationTab runs={batch.distillation_runs} />}
          {activeTab === "cask" && <CaskTab data={batch.cask} />}
          {activeTab === "graphs" && <GraphsTab batch={batch} />}
          {activeTab === "notes" && <NotesTab batch={batch} />}
        </section>

        <footer className="flex items-center justify-between pb-10">
          <Link
            href="/rum"
            className="inline-flex items-center rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-700 shadow-sm hover:border-amber-300 hover:text-amber-800"
          >
            ← Back to log
          </Link>
          <span className="text-xs uppercase tracking-[0.35em] text-neutral-400">Double Retort · Roberta</span>
        </footer>
      </div>
    </div>
  )
}

function SummaryTile({
  title,
  value,
  suffix
}: {
  title: string
  value: unknown
  suffix?: string
}) {
  const display = formatMaybeNumber(value, { suffix })
  return (
    <div className="rounded-2xl bg-amber-50/70 border border-amber-100 px-4 py-5 shadow-inner">
      <p className="text-xs uppercase tracking-[0.25em] text-amber-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-amber-900">{display}</p>
    </div>
  )
}
