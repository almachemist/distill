'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProductionRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/production/new')
  }, [router])

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
        <p className="mt-4 text-neutral-600">Redirecting to production...</p>
      </div>
    </div>
  )
}

// OLD CODE BELOW - KEEPING FOR REFERENCE
/*
type FermentationPoint = {
  day?: number
  date?: string
  temp_c?: number
  ph?: number
  brix?: number
}

type DistillationSegment = {
  time: string
  abv?: number
  lal?: number
}

type DistillationRun = {
  date?: string
  charge_l?: number | null
  abv_in?: number | null
  lal_in?: number | null
  tails_added?: string
  early_tails?: string
  power?: string
  segments?: DistillationSegment[]
  total_lal_out?: number | null
  lal_out_total?: number | null
  lal_yield?: number | null
  product_out?: string
  date_bottled?: string
  notes?: string
}

type ProductionBatch = {
  batch_id: string
  product_group: string
  date: string
  feedstock: string
  year?: number
  fermentation: {
    volume_l?: number | null
    brix_start?: number | string | null
    ph_start?: number | string | null
    date_start?: string
    duration_days?: number | null
    yeast?: string
    notes?: string
    fermentation_data?: FermentationPoint[]
  }
  distillation?: DistillationRun
  distillations?: DistillationRun[]
  output?: {
    date?: string
    volume_l?: number | null
    abv?: number | null
    cask?: string
    lal?: number | null
    destination?: string
    status?: string
    notes?: string
  }
}
type CardMetric = {
  label: string
  value: string
}

type NormalizedBatch = {
  id: string
  batchId: string
  displayName: string
  date: string
  still: 'Carrie' | 'Roberta'
  productLabel: string
  productCategory: string
  cardMetrics: CardMetric[]
  robertaSource?: ProductionBatch
  carrieSource?: BatchNew
  fermentationData?: FermentationPoint[]
  distillationSegments?: DistillationSegment[]
  distillationRuns?: NormalizedDistillationRun[]
}

type NormalizedDistillationRun = {
  id: string
  label: string
  date?: string
  charge_l?: number | null
  abv_in?: number | null
  lal_in?: number | null
  tails_added?: string
  early_tails?: string
  power?: string
  totalLalOut?: number | null
  lalYield?: number | null
  productOut?: string
  dateBottled?: string
  notes?: string
  segments: DistillationSegment[]
}

type FilterState = {
  product: 'All' | string
  year: 'All' | string
}

const robertaSourceBatches = productionBatches.batches as unknown as ProductionBatch[]

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return undefined
    const parsed = Number(trimmed)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return undefined
}

const ensureArray = <T,>(value: T | T[] | undefined | null): T[] => {
  if (Array.isArray(value)) {
    return value.filter((item) => item != null) as T[]
  }
  return value ? [value] : []
}

const deriveProductLabel = (batch: ProductionBatch): string =>
  batch.product_group.startsWith('RUM') ? 'Rum' : 'Cane Spirit'

const formatValue = (value: number | string | undefined | null, suffix = ''): string => {
  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return 'N/A'
    return `${value}${suffix}`
  }

  return `${value}${suffix}`
}

const buildCarrieSegments = (batch: BatchNew): DistillationSegment[] => {
  const segments: DistillationSegment[] = []

  const pushSegment = (label: string, abvValue: unknown, lalValue?: unknown) => {
    const abv = toNumber(abvValue)
    if (abv === undefined) return
    const lal = toNumber(lalValue)
    segments.push({ time: label, abv, lal })
  }

  const cuts: any = batch.cuts ?? {}

  if (cuts.foreshots) {
    pushSegment(cuts.foreshots.time_start ?? 'Foreshots', cuts.foreshots.abv_percent, cuts.foreshots.lal)
  }
  if (cuts.heads) {
    pushSegment(cuts.heads.time_start ?? 'Heads', cuts.heads.abv_percent, cuts.heads.lal)
  }
  if (cuts.hearts) {
    pushSegment(cuts.hearts.time_start ?? 'Hearts', cuts.hearts.abv_percent, cuts.hearts.lal)
  }

  ensureArray(cuts.hearts_segments).forEach((segment: any, index: number) => {
    pushSegment(segment.time_start ?? `Hearts Segment ${index + 1}`, segment.abv_percent, segment.lal)
  })

  const tails = cuts.tails
  if (Array.isArray(tails)) {
    tails.forEach((segment: any, index: number) => {
      pushSegment(segment.time_start ?? segment.date ?? `Tails Segment ${index + 1}`, segment.abv_percent, segment.lal)
    })
  } else if (tails) {
    pushSegment(tails.time_start ?? 'Tails', tails.abv_percent, tails.lal)
  }

  if (segments.length === 0 && Array.isArray(batch.phase_outputs)) {
    batch.phase_outputs.forEach((phase) => {
      if (phase && phase.phase && phase.abv_percent !== undefined) {
        pushSegment(phase.phase, phase.abv_percent, phase.lal)
      }
    })
  }

  return segments
}

const normalizeDistillationRuns = (batch: ProductionBatch): NormalizedDistillationRun[] => {
  const sourceRuns: DistillationRun[] = Array.isArray(batch.distillations)
    ? (batch.distillations ?? []).filter((run): run is DistillationRun => Boolean(run))
    : batch.distillation
      ? [batch.distillation]
      : []

  return sourceRuns.map((run, index) => {
    const totalLalOut = toNumber(run.total_lal_out ?? run.lal_out_total)
    const lalYield = toNumber(run.lal_yield)

    const segments = (run.segments ?? []).map((segment, segmentIndex) => {
      const fallbackLabel = `Segment ${segmentIndex + 1}`
      return {
        time: typeof segment.time === 'string' && segment.time.length > 0 ? segment.time : fallbackLabel,
        abv: toNumber(segment.abv) ?? segment.abv,
        lal: toNumber(segment.lal) ?? segment.lal
      }
    })

    return {
      id: `${batch.batch_id}-run-${index + 1}`,
      label: sourceRuns.length > 1 ? `Run ${index + 1}` : 'Run',
      date: run.date,
      charge_l: run.charge_l ?? null,
      abv_in: run.abv_in ?? null,
      lal_in: run.lal_in ?? null,
      tails_added: run.tails_added,
      early_tails: run.early_tails,
      power: run.power,
      totalLalOut: totalLalOut ?? null,
      lalYield: lalYield ?? null,
      productOut: run.product_out,
      dateBottled: run.date_bottled,
      notes: run.notes,
      segments
    }
  })
}

const normalizeRobertaBatches = (): NormalizedBatch[] => {
  return robertaSourceBatches
    .map((batch) => {
      const metrics: CardMetric[] = [
        { label: 'Feedstock', value: batch.feedstock },
        { label: 'Ferment Volume', value: formatValue(batch.fermentation.volume_l, ' L') },
        { label: 'ABV In', value: formatValue(batch.distillation?.abv_in, '%') },
        { label: 'Total LAL Out', value: formatValue(batch.distillation?.total_lal_out) }
      ].filter((metric) => metric.value !== 'N/A')

      const distillationRuns = normalizeDistillationRuns(batch)

      return {
        id: batch.batch_id,
        batchId: batch.batch_id,
        displayName: `${deriveProductLabel(batch)} — ${batch.batch_id}`,
        date: batch.date,
        still: 'Roberta' as const,
        productLabel: deriveProductLabel(batch),
        productCategory: deriveProductLabel(batch),
        cardMetrics: metrics,
        robertaSource: batch,
        fermentationData: batch.fermentation?.fermentation_data ?? [],
        distillationSegments: distillationRuns[0]?.segments ?? batch.distillation?.segments ?? [],
        distillationRuns
      }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

const normalizeCarrieBatches = (): NormalizedBatch[] => {
  const productById = new Map(batchesDataset.products.map((product) => [product.product_id, product]))
  const rawBatches = Object.values(batchesDataset.batches_by_month ?? {}).flat()

  const isCarrieStill = (value?: string | null) => {
    if (!value) return false
    const normalized = value.toLowerCase()
    return normalized.includes('carrie') || normalized.includes('carry')
  }

  return rawBatches
    .filter((batch) => isCarrieStill(batch.still_used))
    .map((batch) => {
      const product = productById.get(batch.product_id)
      const label = product?.display_name ?? batch.display_name ?? batch.sku ?? batch.batch_id
      const category = product?.category ?? 'Carrie Run'

      const chargeTotal = batch.charge?.total
      const hearts = (batch.cuts as any)?.hearts
      const finalOutput = (batch.dilution as any)?.combined?.final_output_run ?? batch.final_output

      const metrics: CardMetric[] = [
        { label: 'Charge Volume', value: formatValue(chargeTotal?.volume_l, ' L') },
        { label: 'Charge ABV', value: formatValue(chargeTotal?.abv_percent, '%') },
        { label: 'Hearts Volume', value: formatValue(hearts?.volume_l, ' L') },
        {
          label: 'Final Output',
          value: formatValue(
            finalOutput?.total_volume_l ?? finalOutput?.finalVolumeL ?? finalOutput?.new_make_l,
            ' L'
          )
        }
      ].filter((metric) => metric.value !== 'N/A')

      const distillationSegments = buildCarrieSegments(batch)

      return {
        id: batch.batch_id,
        batchId: batch.batch_id,
        displayName: `${label} — ${batch.batch_id}`,
        date: batch.date,
        still: 'Carrie' as const,
        productLabel: label,
        productCategory: category,
        cardMetrics: metrics,
        carrieSource: batch,
        distillationSegments,
        distillationRuns: distillationSegments.length > 0 ? [
          {
            id: `${batch.batch_id}-run-1`,
            label: 'Run Overview',
            date: batch.date,
            charge_l: batch.charge?.total?.volume_l,
            abv_in: batch.charge?.total?.abv_percent,
            productOut: metrics.find((m) => m.label === 'Final Output')?.value,
            segments: distillationSegments
          }
        ] : []
      }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export default function ProductionPage() {
  const [stillTab, setStillTab] = useState<'Carrie' | 'Roberta'>('Carrie')
  const [filter, setFilter] = useState<FilterState>({ product: 'All', year: 'All' })
  const [selectedBatch, setSelectedBatch] = useState<NormalizedBatch | null>(null)

  const robertaBatches = useMemo(() => normalizeRobertaBatches(), [])
  const carrieBatches = useMemo(() => normalizeCarrieBatches(), [])

  const currentBatches = stillTab === 'Roberta' ? robertaBatches : carrieBatches

  useEffect(() => {
    setFilter({ product: 'All', year: 'All' })
    setSelectedBatch(null)
  }, [stillTab])

  const filteredBatches = useMemo(() => {
    return currentBatches.filter((batch) => {
      const matchesProduct = filter.product === 'All' || batch.productCategory === filter.product
      const matchesYear = filter.year === 'All' || batch.date.startsWith(filter.year)
      return matchesProduct && matchesYear
    })
  }, [currentBatches, filter])

  useEffect(() => {
    if (selectedBatch && !filteredBatches.some((batch) => batch.id === selectedBatch.id)) {
      setSelectedBatch(null)
    }
  }, [filteredBatches, selectedBatch])

  const productOptions = useMemo(() => {
    const values = new Set<string>()
    currentBatches.forEach((batch) => {
      if (batch.productCategory) {
        values.add(batch.productCategory)
      }
    })
    return Array.from(values).sort()
  }, [currentBatches])

  const yearOptions = useMemo(() => {
    const values = new Set<string>()
    currentBatches.forEach((batch) => {
      if (batch.date) {
        values.add(batch.date.slice(0, 4))
      }
    })
    return Array.from(values).sort((a, b) => Number(b) - Number(a))
  }, [currentBatches])

  return (
    <div className="min-h-screen bg-neutral-50 px-6 sm:px-10 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-serif text-amber-900 tracking-tight">
          Fermentation & Distillation Dashboard
        </h1>
        <p className="text-neutral-600 mt-2 max-w-2xl">
          Monitor fermentation curves, distillation profiles, and output metrics across Carrie and Roberta.
        </p>
      </header>

      <nav className="flex flex-wrap gap-6 border-b border-neutral-200 pb-3 mb-8">
        {(['Carrie', 'Roberta'] as const).map((still) => {
          const isActive = stillTab === still
          return (
            <button
              key={still}
              onClick={() => setStillTab(still)}
              className={`pb-2 text-sm font-medium transition-colors ${
                isActive ? 'text-amber-900 border-b-2 border-amber-700' : 'text-neutral-500 hover:text-amber-700'
              }`}
            >
              <div className="text-left">
                <span className="block text-base">
                  {still === 'Carrie' ? 'Carrie — Single Retort' : 'Roberta — Double Retort'}
                </span>
                <span className="block text-xs font-normal text-neutral-500">
                  {still === 'Carrie'
                    ? 'Gin, vodka, ethanol runs with Carrie'
                    : 'Rum and cane spirit cycles distilled on Roberta'}
                </span>
              </div>
            </button>
          )
        })}
      </nav>

      <section className="flex flex-wrap gap-4 mb-8">
        <select
          className="border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-600"
          value={filter.product}
          onChange={(event) => setFilter((prev) => ({ ...prev, product: event.target.value }))}
        >
          <option value="All">All Products</option>
          {productOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          className="border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-600"
          value={filter.year}
          onChange={(event) => setFilter((prev) => ({ ...prev, year: event.target.value }))}
        >
          <option value="All">All Years</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredBatches.map((batch) => (
          <article
            key={batch.id}
            onClick={() => setSelectedBatch(batch)}
            className="cursor-pointer bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:shadow-[0_12px_24px_rgba(22,16,10,0.12)] hover:border-amber-300 transition"
          >
            <header className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">{batch.batchId}</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {batch.productLabel} • {batch.date}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-800 uppercase tracking-wide">
                {batch.productCategory}
              </span>
            </header>

            <dl className="mt-4 space-y-2 text-sm">
              {batch.cardMetrics.map((metric) => (
                <div key={metric.label} className="flex items-center justify-between">
                  <dt className="text-neutral-500">{metric.label}</dt>
                  <dd className="text-neutral-800 font-medium">{metric.value}</dd>
                </div>
              ))}
            </dl>

            <button className="mt-6 text-amber-700 text-sm font-semibold tracking-wide hover:underline">
              View Technical Log →
            </button>
          </article>
        ))}

        {filteredBatches.length === 0 && (
          <div className="col-span-full">
            <div className="bg-white border border-dashed border-neutral-300 rounded-2xl p-10 text-center text-neutral-500">
              No batches match the current filters. Adjust the parameters to surface production runs.
            </div>
          </div>
        )}
      </section>

      {selectedBatch && (
        <section className="mt-10 bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900">{selectedBatch.displayName}</h2>
              <p className="text-sm text-neutral-500 mt-1">
                {selectedBatch.still === 'Carrie' ? 'Carrie — Single Retort' : 'Roberta — Double Retort'} • {selectedBatch.date}
              </p>
            </div>
            <button
              onClick={() => setSelectedBatch(null)}
              className="self-start md:self-auto text-sm font-medium text-neutral-500 hover:text-neutral-800"
            >
              Close
            </button>
          </header>

          {selectedBatch.still === 'Roberta' && selectedBatch.robertaSource && (
            <RobertaDetail
              batch={selectedBatch.robertaSource}
              fermentationData={selectedBatch.fermentationData ?? []}
              distillationRuns={selectedBatch.distillationRuns ?? []}
              fallbackSegments={selectedBatch.distillationSegments ?? []}
            />
          )}

          {selectedBatch.still === 'Carrie' && selectedBatch.carrieSource && (
            <CarrieDetail
              batch={selectedBatch.carrieSource}
              segments={selectedBatch.distillationSegments ?? []}
            />
          )}
        </section>
      )}
    </div>
  )
}

function RobertaDetail({
  batch,
  fermentationData,
  distillationRuns,
  fallbackSegments
}: {
  batch: ProductionBatch
  fermentationData: FermentationPoint[]
  distillationRuns: NormalizedDistillationRun[]
  fallbackSegments: DistillationSegment[]
}) {
  return (
    <>
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <article>
          <h3 className="text-xl font-semibold text-neutral-800 mb-4">Fermentation</h3>

          <div className="space-y-2 text-sm text-neutral-700">
            <p>
              <span className="text-neutral-500">Feedstock:</span> {batch.feedstock}
            </p>
            <p>
              <span className="text-neutral-500">Volume:</span> {formatValue(batch.fermentation.volume_l, ' L')}
            </p>
            <p>
              <span className="text-neutral-500">Brix Start:</span> {formatValue(batch.fermentation.brix_start)}
            </p>
            <p>
              <span className="text-neutral-500">pH Start:</span> {formatValue(batch.fermentation.ph_start)}
            </p>
            {batch.fermentation.yeast && (
              <p>
                <span className="text-neutral-500">Yeast:</span> {batch.fermentation.yeast}
              </p>
            )}
            {batch.fermentation.notes && (
              <p>
                <span className="text-neutral-500">Notes:</span> {batch.fermentation.notes}
              </p>
            )}
          </div>

          {fermentationData.length > 0 && (
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fermentationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d4" />
                  <XAxis
                    dataKey={(point) => point.day ?? point.date ?? ''}
                    tick={{ fontSize: 12, fill: '#525252' }}
                    label={{ value: 'Fermentation Day', position: 'insideBottom', dy: 10, fill: '#404040' }}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12, fill: '#525252' }}
                    label={{ value: 'Temp (°C)', angle: -90, dx: -10, fill: '#404040' }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12, fill: '#525252' }}
                    label={{ value: 'pH', angle: 90, dx: 14, fill: '#404040' }}
                  />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="temp_c" stroke="#2563eb" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="ph" stroke="#059669" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>

        <article>
          <h3 className="text-xl font-semibold text-neutral-800 mb-4">Distillation</h3>

          {(distillationRuns.length > 0 ? distillationRuns : [
            {
              id: `${batch.batch_id}-fallback`,
              label: 'Run',
              date: batch.distillation?.date,
              charge_l: batch.distillation?.charge_l ?? null,
              abv_in: batch.distillation?.abv_in ?? null,
              lal_in: batch.distillation?.lal_in ?? null,
              tails_added: batch.distillation?.tails_added,
              early_tails: batch.distillation?.early_tails,
              power: batch.distillation?.power,
              totalLalOut: batch.distillation?.total_lal_out ?? null,
              lalYield: batch.distillation?.lal_yield ?? null,
              productOut: undefined,
              dateBottled: undefined,
              notes: undefined,
              segments: fallbackSegments
            }
          ]).map((run) => (
            <div key={run.id} className="mb-8 last:mb-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{run.label}</p>
                  <p className="text-xs text-neutral-500">{run.date ?? 'Date N/A'}</p>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-neutral-600">
                  <span>Charge: {formatValue(run.charge_l, ' L')}</span>
                  <span>ABV In: {formatValue(run.abv_in, '%')}</span>
                  <span>LAL In: {formatValue(run.lal_in)}</span>
                  <span>Total LAL Out: {formatValue(run.totalLalOut)}</span>
                  {run.lalYield !== null && run.lalYield !== undefined && (
                    <span>Yield: {formatValue(run.lalYield, '%')}</span>
                  )}
                </div>
              </div>

              <div className="mt-3 space-y-2 text-xs text-neutral-600">
                {run.tails_added && (
                  <p>
                    <span className="text-neutral-500">Late Tails:</span> {run.tails_added}
                  </p>
                )}
                {run.early_tails && (
                  <p>
                    <span className="text-neutral-500">Early Tails:</span> {run.early_tails}
                  </p>
                )}
                {run.power && (
                  <p>
                    <span className="text-neutral-500">Power:</span> {run.power}
                  </p>
                )}
                {run.productOut && (
                  <p>
                    <span className="text-neutral-500">Product:</span> {run.productOut}
                  </p>
                )}
                {run.notes && (
                  <p>
                    <span className="text-neutral-500">Notes:</span> {run.notes}
                  </p>
                )}
              </div>

              {run.segments.length > 0 && (
                <div className="mt-4 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={run.segments}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d4" />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 11, fill: '#525252' }}
                        label={{ value: 'Time', position: 'insideBottom', dy: 10, fill: '#404040' }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#525252' }}
                        label={{ value: 'ABV (%)', angle: -90, dx: -10, fill: '#404040' }}
                      />
                      <Tooltip />
                      <Line type="monotone" dataKey="abv" stroke="#9333ea" strokeWidth={1.8} dot />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ))}
        </article>
      </div>

      {batch.output && (
        <article className="mt-10 border-t border-neutral-200 pt-6">
          <h3 className="text-xl font-semibold text-neutral-800 mb-4">Output / Cask Handling</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-neutral-700">
            <div>
              <p className="text-neutral-500">Output Date</p>
              <p className="font-medium text-neutral-900">{batch.output.date ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-neutral-500">Volume</p>
              <p className="font-medium text-neutral-900">{formatValue(batch.output.volume_l, ' L')}</p>
            </div>
            <div>
              <p className="text-neutral-500">ABV / Strength</p>
              <p className="font-medium text-neutral-900">{formatValue(batch.output.abv, '%')}</p>
            </div>
            <div>
              <p className="text-neutral-500">Destination</p>
              <p className="font-medium text-neutral-900">
                {batch.output.destination ?? batch.output.cask ?? batch.output.status ?? 'N/A'}
              </p>
            </div>
          </div>
          {batch.output.notes && (
            <p className="mt-4 text-sm text-neutral-700">
              <span className="text-neutral-500">Notes:</span> {batch.output.notes}
            </p>
          )}
        </article>
      )}
    </>
  )
}

function CarrieDetail({ batch, segments }: { batch: BatchNew; segments: DistillationSegment[] }) {
  const chargeComponents = batch.charge?.components ?? []
  const botanicals = batch.botanicals?.items ?? []
  const dilutionSteps = batch.dilution?.steps ?? []
  const finalOutput = (batch.dilution as any)?.combined?.final_output_run ?? batch.final_output
  const cuts: any = batch.cuts ?? {}

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
      <article>
        <h3 className="text-xl font-semibold text-neutral-800 mb-4">Charge & Botanicals</h3>

        <div className="space-y-2 text-sm text-neutral-700">
          <p>
            <span className="text-neutral-500">Charge Volume:</span> {formatValue(batch.charge?.total?.volume_l, ' L')}
          </p>
          <p>
            <span className="text-neutral-500">Charge ABV:</span> {formatValue(batch.charge?.total?.abv_percent, '%')}
          </p>
          <p>
            <span className="text-neutral-500">Boiler On:</span> {batch.boiler_on_time ?? 'N/A'}
          </p>
        </div>

        {chargeComponents.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide">Charge Components</h4>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
              {chargeComponents.map((component, index) => (
                <li key={`${component.source}-${index}`} className="flex items-center justify-between">
                  <span className="text-neutral-500">{component.source}</span>
                  <span className="text-neutral-800 font-medium">
                    {formatValue(component.volume_l, ' L')} @ {formatValue(component.abv_percent, '%')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {botanicals.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide">Botanicals</h4>
            <ul className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1 text-sm text-neutral-700">
              {botanicals.map((botanical, index) => (
                <li key={`${botanical.name}-${index}`} className="flex items-center justify-between">
                  <span className="text-neutral-500">{botanical.name}</span>
                  <span className="text-neutral-800 font-medium">
                    {formatValue(botanical.weight_g, ' g')}
                    {botanical.ratio_percent !== undefined && ` • ${formatValue(botanical.ratio_percent, '%')}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>

      <article>
        <h3 className="text-xl font-semibold text-neutral-800 mb-4">Distillation & Output</h3>

        <div className="space-y-2 text-sm text-neutral-700">
          <p>
            <span className="text-neutral-500">Hearts Volume:</span> {formatValue(cuts?.hearts?.volume_l, ' L')}
          </p>
          <p>
            <span className="text-neutral-500">Hearts ABV:</span> {formatValue(cuts?.hearts?.abv_percent, '%')}
          </p>
          <p>
            <span className="text-neutral-500">Foreshots:</span> {formatValue(cuts?.foreshots?.volume_l, ' L')} @ {formatValue(cuts?.foreshots?.abv_percent, '%')}
          </p>
          <p>
            <span className="text-neutral-500">Heads:</span> {formatValue(cuts?.heads?.volume_l, ' L')} @ {formatValue(cuts?.heads?.abv_percent, '%')}
          </p>
        </div>

        {segments.length > 0 && (
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={segments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d4" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12, fill: '#525252' }}
                  label={{ value: 'Segment', position: 'insideBottom', dy: 10, fill: '#404040' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#525252' }}
                  label={{ value: 'ABV (%)', angle: -90, dx: -10, fill: '#404040' }}
                />
                <Tooltip />
                <Line type="monotone" dataKey="abv" stroke="#0ea5e9" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {dilutionSteps.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide">Dilution Steps</h4>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
              {dilutionSteps.map((step, index) => (
                <li key={step.step_id ?? index} className="flex items-center justify-between">
                  <span className="text-neutral-500">Step {step.step_id ?? index + 1}</span>
                  <span className="text-neutral-800 font-medium">
                    {formatValue(step.source_volume_l, ' L')} → {formatValue(step.new_volume_l, ' L')} @ {formatValue(step.target_abv_percent ?? step.abv_percent, '%')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {finalOutput && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide">Final Output</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-neutral-700 mt-3">
              <div>
                <p className="text-neutral-500">Total Volume</p>
                <p className="font-medium text-neutral-900">
                  {formatValue(finalOutput.total_volume_l ?? finalOutput.finalVolumeL ?? finalOutput.new_make_l, ' L')}
                </p>
              </div>
              <div>
                <p className="text-neutral-500">Final ABV</p>
                <p className="font-medium text-neutral-900">
                  {formatValue(finalOutput.finalAbv_percent ?? finalOutput.target_abv_percent, '%')}
                </p>
              </div>
              <div>
                <p className="text-neutral-500">LAL</p>
                <p className="font-medium text-neutral-900">{formatValue(finalOutput.lal)}</p>
              </div>
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
*/