"use client"

import { useMemo, useState } from "react"
import rumDataset from "./rum_production_data.json"
import { BatchCard } from "./components/BatchCard"
import type { RumBatch } from "./components/types"

const batches = rumDataset as any as RumBatch[]

export default function RumDashboardPage() {
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [substrateFilter, setSubstrateFilter] = useState<string>("all")
  const [search, setSearch] = useState<string>("")

  const options = useMemo(() => {
    const years = new Set<string>()
    const substrates = new Set<string>()

    batches.forEach((batch) => {
      const year = new Date(batch.date).getFullYear().toString()
      years.add(year)

      const substrate = batch.fermentation?.substrate
      if (substrate) substrates.add(substrate)
    })

    return {
      years: Array.from(years).sort((a, b) => Number(b) - Number(a)),
      substrates: Array.from(substrates).sort()
    }
  }, [])

  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      const matchesYear =
        yearFilter === "all" || new Date(batch.date).getFullYear().toString() === yearFilter

      const matchesSubstrate =
        substrateFilter === "all" || batch.fermentation?.substrate === substrateFilter

      const normalizedSearch = search.trim().toLowerCase()
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          batch.batch_id,
          batch.product,
          batch.product_variant,
          batch.fermentation?.substrate
        ]
          .filter(Boolean)
          .some((value) => value!.toString().toLowerCase().includes(normalizedSearch))

      return matchesYear && matchesSubstrate && matchesSearch
    })
  }, [search, substrateFilter, yearFilter])

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-500">Rum Program</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-serif font-semibold text-amber-900 tracking-tight">
              Rum Production Log
            </h1>
            <p className="mt-2 text-neutral-600 max-w-2xl">
              Track fermentations, double-retort distillations, and cask fills for Roberta.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search batch, substrate, product"
              className="w-64 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm text-neutral-700 shadow-sm focus:outline-none focus:ring focus:ring-amber-300/60"
            />
            <select
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
              className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm text-neutral-700 shadow-sm focus:outline-none focus:ring focus:ring-amber-300/60"
            >
              <option value="all">All years</option>
              {options.years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={substrateFilter}
              onChange={(event) => setSubstrateFilter(event.target.value)}
              className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm text-neutral-700 shadow-sm focus:outline-none focus:ring focus:ring-amber-300/60"
            >
              <option value="all">All substrates</option>
              {options.substrates.map((substrate) => (
                <option key={substrate} value={substrate}>
                  {substrate}
                </option>
              ))}
            </select>
          </div>
        </header>

        <section>
          <p className="text-sm text-neutral-500 mb-3">
            Showing <span className="font-medium text-neutral-800">{filteredBatches.length}</span> rum batches
          </p>

          {filteredBatches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-200 bg-white p-10 text-center text-neutral-500">
              No batches match the current filters.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredBatches.map((batch) => (
                <BatchCard key={batch.batch_id} batch={batch} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
