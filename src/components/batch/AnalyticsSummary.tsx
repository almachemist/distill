import React from "react"
import type { BatchesDataset } from "@/modules/production/new-model/types/batch.types"
import { aggregateByCategory, aggregateByProduct } from "@/modules/production/new-model/services/analytics.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function fmt(n: number | null | undefined, opts?: Intl.NumberFormatOptions) {
  if (n === null || n === undefined) return "—"
  return new Intl.NumberFormat("en-AU", opts).format(n)
}

export function AnalyticsSummary({ dataset, year = 2025, still = "Carrie" }: { dataset: BatchesDataset; year?: number; still?: string }) {
  const byCat = aggregateByCategory(dataset, year, still)
  const byProd = aggregateByProduct(dataset, year, still)

  const Table = ({ title, rows }: { title: string; rows: ReturnType<typeof aggregateByCategory> }) => (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-onyx">{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-gray-500 font-medium">Group</th>
              <th className="px-4 py-2 text-left text-gray-500 font-medium">Batches</th>
              <th className="px-4 py-2 text-left text-gray-500 font-medium">Charge LAL</th>
              <th className="px-4 py-2 text-left text-gray-500 font-medium">Out LAL</th>
              <th className="px-4 py-2 text-left text-gray-500 font-medium">Losses LAL</th>
              <th className="px-4 py-2 text-left text-gray-500 font-medium">Hearts LAL</th>
              <th className="px-4 py-2 text-left text-gray-500 font-medium">Total Recovery %</th>
              <th className="px-4 py-2 text-left text-gray-500 font-medium">Losses %</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((g) => (
              <tr key={g.key}>
                <td className="px-4 py-2 text-onyx font-medium">{g.label}</td>
                <td className="px-4 py-2 text-onyx">{g.n_complete}/{g.n_batches}</td>
                <td className="px-4 py-2 text-onyx font-semibold">{fmt(g.charge_lal_sum)}</td>
                <td className="px-4 py-2 text-onyx font-semibold">{fmt(g.out_lal_sum)}</td>
                <td className="px-4 py-2 text-onyx">{fmt(g.losses_lal_sum)}</td>
                <td className="px-4 py-2 text-onyx">{fmt(g.hearts_lal_sum)}</td>
                <td className="px-4 py-2 text-onyx">{fmt(g.total_recovery_pct_aggregate, { maximumFractionDigits: 1 })}%</td>
                <td className="px-4 py-2 text-onyx">{fmt(g.losses_pct_aggregate, { maximumFractionDigits: 1 })}%</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={8}>No data for {still} in {year}.</td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      <Table title={`${year} • Still: ${still} — By Category`} rows={byCat} />
      <Table title={`${year} • Still: ${still} — By Product`} rows={byProd} />
    </div>
  )
}
