import type { RumBatch } from "../types"

interface GraphsTabProps {
  batch: RumBatch
}

interface SparklinePoint {
  label: string
  value: number
}

export function GraphsTab({ batch }: GraphsTabProps) {
  const temperaturePoints = buildProfilePoints(batch.fermentation?.temperature_profile)
  const brixPoints = buildProfilePoints(batch.fermentation?.brix_profile)
  const phPoints = buildProfilePoints(batch.fermentation?.ph_profile)
  const abvPoints = buildCutPointSeries(batch)
  const lalPoints = buildCutPointSeries(batch, "lal")

  const hasFermentationData =
    temperaturePoints.length > 1 || brixPoints.length > 1 || phPoints.length > 1
  const hasDistillationData = abvPoints.length > 1 || lalPoints.length > 1

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold text-amber-900">Fermentation Profiles</h2>
        {hasFermentationData ? (
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            <SparklineCard title="Temperature (°C)" points={temperaturePoints} stroke="#f97316" />
            <SparklineCard title="Brix" points={brixPoints} stroke="#0ea5e9" />
            <SparklineCard title="pH" points={phPoints} stroke="#10b981" />
          </div>
        ) : (
          <Placeholder message="No fermentation profile data available." />
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-amber-900">Distillation Run Metrics</h2>
        {hasDistillationData ? (
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <SparklineCard title="ABV % by Cut" points={abvPoints} stroke="#f97316" />
            <SparklineCard title="LAL by Cut" points={lalPoints} stroke="#c084fc" />
          </div>
        ) : (
          <Placeholder message="No distillation cut metrics captured." />
        )}
      </section>
    </div>
  )
}

function buildProfilePoints(profile?: Record<string, number | string> | null): SparklinePoint[] {
  if (!profile) return []
  return Object.entries(profile)
    .map(([label, value]) => {
      const numeric = typeof value === "string" ? Number.parseFloat(value) : Number(value)
      if (Number.isNaN(numeric)) return null
      return { label, value: numeric }
    })
    .filter((point): point is SparklinePoint => point !== null)
}

function buildCutPointSeries(batch: RumBatch, field: "abv_percent" | "lal" = "abv_percent") {
  const run = batch.distillation_runs?.[0]
  if (!run?.cut_points) return []
  return run.cut_points
    .map((cut, index) => {
      const raw = field === "abv_percent" ? cut.abv_percent : cut.lal
      const numeric = typeof raw === "string" ? Number.parseFloat(raw) : Number(raw)
      if (Number.isNaN(numeric)) return null
      const label = cut.time || `Cut ${index + 1}`
      return { label, value: numeric }
    })
    .filter((point): point is SparklinePoint => point !== null)
}

function SparklineCard({
  title,
  points,
  stroke
}: {
  title: string
  points: SparklinePoint[]
  stroke: string
}) {
  return (
    <div className="rounded-3xl border border-amber-100 bg-white px-6 py-5 shadow-sm">
      <h3 className="text-sm font-semibold text-amber-800">{title}</h3>
      {points.length >= 2 ? (
        <div className="mt-4 flex flex-col gap-3">
          <Sparkline points={points} stroke={stroke} />
          <div className="flex flex-wrap gap-3 text-xs text-neutral-500">
            {points.map((point) => (
              <span key={point.label}>
                <strong className="text-neutral-700">{point.label}</strong> · {point.value.toFixed(1)}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-neutral-400">Not enough data points.</p>
      )}
    </div>
  )
}

function Sparkline({ points, stroke }: { points: SparklinePoint[]; stroke: string }) {
  const width = 200
  const height = 80

  const values = points.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const svgPoints = points
    .map((point, index) => {
      const denominator = points.length > 1 ? points.length - 1 : 1
      const x = (index / denominator) * width
      const normalized = (point.value - min) / range
      const y = height - normalized * height
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={svgPoints}
      />
    </svg>
  )
}

function Placeholder({ message }: { message: string }) {
  return (
    <div className="mt-4 rounded-3xl border border-dashed border-amber-200 bg-amber-50/60 p-8 text-center text-sm text-neutral-500">
      {message}
    </div>
  )
}
