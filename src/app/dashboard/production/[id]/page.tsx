'use client'

import { useMemo, useState } from 'react'
import { notFound } from 'next/navigation'
import { useParams } from 'next/navigation'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import productionBatches from '@/modules/production/data/production_batches.json'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'fermentation', label: 'Fermentation Data' },
  { id: 'distillation', label: 'Distillation Data' }
] as const

type TabId = (typeof tabs)[number]['id']

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
    yeast?: string
    notes?: string
    fermentation_data?: FermentationPoint[]
  }
  distillation?: {
    date?: string
    charge_l?: number
    abv_in?: number
    lal_in?: number
    total_lal_out?: number
    lal_yield?: number
    tails_added?: string
    early_tails?: string
    power?: string
    segments?: DistillationSegment[]
  }
  output?: {
    product?: string
    date?: string
    volume_l?: number
    abv?: number
    cask?: string
    lal?: number
    destination?: string
    status?: string
    notes?: string
  }
  notes?: string
}

const batches: ProductionBatch[] = productionBatches.batches

const formatValue = (value: number | string | null | undefined, suffix = ''): string => {
  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }

  return typeof value === 'number' ? `${value}${suffix}` : `${value}${suffix}`
}

const deriveStill = (batch: ProductionBatch): 'Carrie' | 'Roberta' =>
  batch.product_group.startsWith('RUM') ? 'Roberta' : 'Carrie'

const deriveProductLabel = (batch: ProductionBatch): string =>
  batch.product_group.startsWith('RUM') ? 'Rum' : 'Cane Spirit'

export default function BatchDetailsPage() {
  const params = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const id = (params as any)?.id as string || ''
  const batch = useMemo(() => batches.find((item) => item.batch_id === id), [id])

  if (!batch) {
    notFound()
  }

  const fermentationChartData = batch.fermentation.fermentation_data
  const distillationSegments = batch.distillation?.segments ?? []

  return (
    <div className="min-h-screen bg-neutral-50 px-6 sm:px-10 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-serif text-amber-900 tracking-tight">Batch Details</h1>
        <p className="text-neutral-600 mt-2">
          {deriveProductLabel(batch)} — {batch.batch_id} ({deriveStill(batch)})
        </p>
      </header>

      <nav className="flex gap-6 border-b border-neutral-200 pb-2 mb-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-1 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-amber-800 border-b-2 border-amber-700'
                : 'text-neutral-500 hover:text-amber-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'overview' && (
        <section className="space-y-6">
          <article className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">General Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-neutral-700">
              <p>
                <span className="text-neutral-500">Date:</span> {batch.date}
              </p>
              <p>
                <span className="text-neutral-500">Feedstock:</span> {batch.feedstock}
              </p>
              <p>
                <span className="text-neutral-500">Year:</span> {batch.year ?? 'N/A'}
              </p>
              <p>
                <span className="text-neutral-500">Ferment Volume:</span> {formatValue(batch.fermentation.volume_l, ' L')}
              </p>
              <p>
                <span className="text-neutral-500">Brix Start:</span> {formatValue(batch.fermentation.brix_start)}
              </p>
              <p>
                <span className="text-neutral-500">pH Start:</span> {formatValue(batch.fermentation.ph_start)}
              </p>
              <p>
                <span className="text-neutral-500">Distillation Date:</span> {batch.distillation?.date ?? 'N/A'}
              </p>
              <p>
                <span className="text-neutral-500">ABV In:</span> {formatValue(batch.distillation?.abv_in, '%')}
              </p>
              <p>
                <span className="text-neutral-500">Total LAL Out:</span> {formatValue(batch.distillation?.total_lal_out)}
              </p>
            </div>
          </article>

          {batch.notes && (
            <article className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-800 mb-3">Batch Notes</h2>
              <p className="text-sm text-neutral-700">{batch.notes}</p>
            </article>
          )}

          {batch.output && (
            <article className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-800 mb-4">Output Summary</h2>
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
        </section>
      )}

      {activeTab === 'fermentation' && (
        <section className="space-y-6">
          <article className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">Fermentation Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-neutral-700">
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
            </div>
            {batch.fermentation.notes && (
              <p className="mt-4 text-sm text-neutral-700">
                <span className="text-neutral-500">Notes:</span> {batch.fermentation.notes}
              </p>
            )}
          </article>

          {fermentationChartData && fermentationChartData.length > 0 && (
            <article className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-800 mb-4">Fermentation Curves</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fermentationChartData}>
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
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="temp_c"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="ph"
                      stroke="#059669"
                      strokeWidth={2}
                      dot={false}
                    />
                    {fermentationChartData.some((point) => point.brix !== undefined) && (
                      <Line yAxisId="left" type="monotone" dataKey="brix" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>
          )}
        </section>
      )}

      {activeTab === 'distillation' && (
        <section className="space-y-6">
          <article className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">Distillation Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-neutral-700">
              <p>
                <span className="text-neutral-500">Date:</span> {batch.distillation?.date ?? 'N/A'}
              </p>
              <p>
                <span className="text-neutral-500">Charge Volume:</span> {formatValue(batch.distillation?.charge_l, ' L')}
              </p>
              <p>
                <span className="text-neutral-500">ABV In:</span> {formatValue(batch.distillation?.abv_in, '%')}
              </p>
              <p>
                <span className="text-neutral-500">LAL In:</span> {formatValue(batch.distillation?.lal_in)}
              </p>
              <p>
                <span className="text-neutral-500">Total LAL Out:</span> {formatValue(batch.distillation?.total_lal_out)}
              </p>
              {batch.distillation?.lal_yield !== undefined && (
                <p>
                  <span className="text-neutral-500">Hearts Yield %:</span> {formatValue(batch.distillation.lal_yield)}
                </p>
              )}
              {batch.distillation?.power && (
                <p>
                  <span className="text-neutral-500">Heating Profile:</span> {batch.distillation.power}
                </p>
              )}
              {batch.distillation?.tails_added && (
                <p>
                  <span className="text-neutral-500">Late Tails Charge:</span> {batch.distillation.tails_added}
                </p>
              )}
              {batch.distillation?.early_tails && (
                <p>
                  <span className="text-neutral-500">Early Tails Charge:</span> {batch.distillation.early_tails}
                </p>
              )}
            </div>
          </article>

          {distillationSegments.length > 0 && (
            <article className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-800 mb-4">ABV Segments</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={distillationSegments}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d4" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 12, fill: '#525252' }}
                      label={{ value: 'Time', position: 'insideBottom', dy: 10, fill: '#404040' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#525252' }}
                      label={{ value: 'ABV (%)', angle: -90, dx: -12, fill: '#404040' }}
                    />
                    <Tooltip />
                    <Line type="monotone" dataKey="abv" stroke="#9333ea" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>
          )}
        </section>
      )}
    </div>
  )
}
