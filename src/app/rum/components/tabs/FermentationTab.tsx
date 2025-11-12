import type { FermentationData } from "../types"
import { formatMaybeNumber } from "../format"

interface FermentationTabProps {
  data: FermentationData
}

export function FermentationTab({ data }: FermentationTabProps) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-amber-800">Substrate & Inputs</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Substrate" value={data.substrate} />
          <InfoItem label="Batch" value={data.substrate_batch} />
          <InfoItem label="Substrate Mass" value={formatMaybeNumber(data.substrate_mass_kg, { suffix: " kg" })} />
          <InfoItem label="Water" value={formatMaybeNumber(data.water_mass_kg, { suffix: " kg" })} />
          <InfoItem label="Initial Brix" value={formatMaybeNumber(data.brix_initial)} />
          <InfoItem label="Initial pH" value={formatMaybeNumber(data.ph_initial)} />
          <InfoItem label="Dunder" value={data.dunder ?? "—"} />
          <InfoItem label="Dunder pH" value={formatMaybeNumber(data.dunder_ph)} />
          <InfoItem label="Chemicals" value={data.chemicals ?? "—"} />
        </dl>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-amber-800">Yeast & Nutrients</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Yeast" value={data.yeast_type ?? "—"} />
          <InfoItem label="Yeast Mass" value={formatMaybeNumber(data.yeast_mass_g, { suffix: " g" })} />
          <InfoItem
            label="Rehydration Temp"
            value={formatMaybeNumber(data.yeast_rehydration_temp_c, { suffix: " °C" })}
          />
          <InfoItem
            label="Rehydration Time"
            value={formatMaybeNumber(data.yeast_rehydration_time_min, { suffix: " min" })}
          />
          <InfoItem label="Fermaid" value={formatMaybeNumber(data.fermaid_g, { suffix: " g" })} />
          <InfoItem label="DAP" value={formatMaybeNumber(data.dap_g, { suffix: " g" })} />
          <InfoItem
            label="Calcium Carbonate"
            value={formatMaybeNumber(data.calcium_carbonate_g, { suffix: " g" })}
          />
        </dl>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-amber-800">Profiles</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <ProfileTable title="Temperature" profile={data.temperature_profile} suffix="°C" />
          <ProfileTable title="Brix" profile={data.brix_profile} />
          <ProfileTable title="pH" profile={data.ph_profile} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-amber-800">Final Readings</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoItem label="Final Brix" value={formatMaybeNumber(data.final_brix)} />
          <InfoItem label="Final pH" value={formatMaybeNumber(data.final_ph)} />
        </div>
      </section>

      {data.notes && (
        <section>
          <h2 className="text-lg font-semibold text-amber-800">Notes</h2>
          <p className="mt-3 rounded-2xl bg-amber-50/70 px-4 py-3 text-sm text-amber-900/80">
            {data.notes}
          </p>
        </section>
      )}
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3">
      <dt className="text-xs uppercase tracking-[0.25em] text-amber-500">{label}</dt>
      <dd className="mt-2 text-sm font-medium text-amber-900">{value ?? "—"}</dd>
    </div>
  )
}

function ProfileTable({
  title,
  profile,
  suffix
}: {
  title: string
  profile?: Record<string, number | string>
  suffix?: string
}) {
  const entries = profile ? Object.entries(profile) : []

  return (
    <div className="rounded-2xl border border-amber-100 bg-white shadow-sm">
      <div className="border-b border-amber-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-amber-800">{title}</h3>
      </div>
      <dl className="divide-y divide-amber-100 text-sm">
        {entries.length === 0 ? (
          <div className="px-4 py-3 text-neutral-400">No data recorded</div>
        ) : (
          entries.map(([time, value]) => (
            <div key={time} className="flex items-center justify-between px-4 py-3">
              <dt className="text-neutral-500">{time}</dt>
              <dd className="font-medium text-amber-900">
                {formatMaybeNumber(value, { suffix: suffix ? ` ${suffix}` : "" })}
              </dd>
            </div>
          ))
        )}
      </dl>
    </div>
  )
}
