import type { CaskData } from "../types"
import { formatDate, formatMaybeNumber } from "../format"

interface CaskTabProps {
  data?: CaskData
}

export function CaskTab({ data }: CaskTabProps) {
  if (!data) {
    return (
      <div className="rounded-3xl border border-dashed border-amber-200 bg-amber-50/60 p-10 text-center text-sm text-neutral-500">
        No cask fill has been recorded for this batch yet.
      </div>
    )
  }

  const entries: { label: string; value: string }[] = [
    { label: "Fill Date", value: formatDate(data.fill_date) },
    { label: "Cask Number", value: data.cask_number ? String(data.cask_number) : "—" },
    { label: "Origin", value: data.origin ?? "—" },
    { label: "Fill ABV", value: formatMaybeNumber(data.fill_abv_percent, { suffix: "%" }) },
    { label: "Volume Filled", value: formatMaybeNumber(data.volume_filled_l, { suffix: " L" }) },
    { label: "LAL Filled", value: formatMaybeNumber(data.lal_filled) }
  ]

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-amber-100 bg-white shadow-sm">
        <header className="border-b border-amber-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-amber-900">Cask Details</h2>
          <p className="text-sm text-neutral-500">Roberta → Barrel stack</p>
        </header>
        <dl className="grid gap-4 px-6 py-6 sm:grid-cols-2">
          {entries.map((entry) => (
            <div
              key={entry.label}
              className="rounded-2xl border border-amber-100 bg-amber-50/60 px-4 py-3 shadow-inner"
            >
              <dt className="text-xs uppercase tracking-[0.3em] text-amber-500">{entry.label}</dt>
              <dd className="mt-2 text-sm font-medium text-amber-900">{entry.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {data.notes && (
        <section className="rounded-3xl border border-amber-100 bg-amber-50/60 px-6 py-5 shadow-inner">
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">Notes</h3>
          <p className="mt-3 text-sm text-amber-900/80">{data.notes}</p>
        </section>
      )}
    </div>
  )
}
