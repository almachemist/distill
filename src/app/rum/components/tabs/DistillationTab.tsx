import type { DistillationRun } from "../types"
import { formatMaybeNumber, formatDate } from "../format"

interface DistillationTabProps {
  runs: DistillationRun[]
}

export function DistillationTab({ runs }: DistillationTabProps) {
  if (!runs || runs.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-amber-200 bg-amber-50/50 p-10 text-center text-sm text-neutral-500">
        No distillation runs were logged for this batch.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {runs.map((run) => (
        <article key={`${run.date}-${run.notes ?? ""}`} className="rounded-3xl border border-amber-100 bg-white shadow-sm">
          <header className="flex flex-col gap-2 border-b border-amber-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-amber-900">{formatDate(run.date)}</h2>
              {run.notes && <p className="text-sm text-neutral-600">{run.notes}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
              <span>Boiler Volume · {formatMaybeNumber(run.boiler_volume_l, { suffix: " L" })}</span>
              <span>ABV · {formatMaybeNumber(run.boiler_abv_percent, { suffix: "%" })}</span>
              <span>LAL · {formatMaybeNumber(run.boiler_lal)}</span>
            </div>
          </header>

          <div className="grid gap-6 px-5 py-6 md:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-500">Setup</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <InfoCard title="Heads Addition" data={run.heads_addition} />
                  <InfoCard title="Retort 1" data={run.retort_1} />
                  <InfoCard title="Retort 2" data={run.retort_2} />
                  <InfoCard title="Heating" data={run.heating} />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-500">Cut Points</h3>
                <CutPointsTable cuts={run.cut_points} />
              </section>
            </div>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 shadow-inner">
                <h3 className="text-xs uppercase tracking-[0.3em] text-amber-500">First Spirit</h3>
                <dl className="mt-3 space-y-2 text-sm text-amber-900">
                  <Row label="Time" value={run.first_spirit?.time} />
                  <Row label="Pot Temp" value={formatMaybeNumber(run.first_spirit?.pot_temp_c, { suffix: " °C" })} />
                  <Row label="ABV" value={formatMaybeNumber(run.first_spirit?.abv_percent, { suffix: "%" })} />
                  <Row label="Flow" value={formatMaybeNumber(run.first_spirit?.flow_lph, { suffix: " L/h" })} />
                </dl>
              </section>

              <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-inner">
                <h3 className="text-xs uppercase tracking-[0.3em] text-emerald-500">Summary</h3>
                <dl className="mt-3 space-y-2 text-sm text-emerald-900">
                  <Row label="LAL In" value={formatMaybeNumber(run.summary?.lal_in)} />
                  <Row label="LAL Out" value={formatMaybeNumber(run.summary?.lal_out)} />
                  <Row label="Hearts Yield" value={formatMaybeNumber(run.summary?.heart_yield_percent, { suffix: "%" })} />
                </dl>
              </section>
            </aside>
          </div>
        </article>
      ))}
    </div>
  )
}

function InfoCard({ title, data }: { title: string; data?: Record<string, unknown> }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50/40 px-4 py-3 text-sm text-neutral-400">
        <p className="font-semibold text-amber-500/70">{title}</p>
        <p className="mt-1">No data</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-amber-100 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">{title}</p>
      <dl className="mt-2 space-y-2 text-sm text-amber-900">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between gap-3">
            <dt className="text-neutral-400">{key.replace(/_/g, " ")}</dt>
            <dd className="font-medium">{formatMaybeNumber(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function CutPointsTable({ cuts }: { cuts?: DistillationRun["cut_points"] }) {
  if (!cuts || cuts.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50/40 px-4 py-6 text-center text-sm text-neutral-400">
        Cut points were not recorded.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-[0.25em] text-amber-500">
            <th className="py-2 pr-4">Time</th>
            <th className="py-2 pr-4">Phase</th>
            <th className="py-2 pr-4 text-right">Volume (L)</th>
            <th className="py-2 pr-4 text-right">ABV %</th>
            <th className="py-2 pr-4 text-right">LAL</th>
            <th className="py-2 pr-4">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-amber-100 text-neutral-700">
          {cuts.map((cut, index) => (
            <tr key={`${cut.time ?? index}-${cut.phase}`} className="hover:bg-amber-50/40">
              <td className="py-3 pr-4 font-medium text-amber-900">{cut.time ?? "—"}</td>
              <td className="py-3 pr-4 text-amber-800">{cut.phase ?? "—"}</td>
              <td className="py-3 pr-4 text-right">{formatMaybeNumber(cut.volume_l)}</td>
              <td className="py-3 pr-4 text-right">{formatMaybeNumber(cut.abv_percent, { suffix: "%" })}</td>
              <td className="py-3 pr-4 text-right">{formatMaybeNumber(cut.lal)}</td>
              <td className="py-3 pr-4 text-neutral-500">{cut.notes?.trim() || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium">{formatMaybeNumber(value)}</span>
    </div>
  )
}
