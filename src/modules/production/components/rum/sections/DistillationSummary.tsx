"use client"

import { RumCaneSpiritBatch } from '@/types/production-schemas'
import { toNum } from '@/modules/production/utils/distillation-formatters'

interface DistillationSummaryProps {
  batch: RumCaneSpiritBatch
}

export function DistillationSummary({ batch }: DistillationSummaryProps) {
  const totalLALStart =
    toNum(batch.boiler_lal) +
    toNum(batch.heads_added_lal) +
    toNum(batch.retort1_lal) +
    toNum(batch.retort2_lal)

  const totalLALEnd =
    toNum(batch.heads_cut_lal) +
    toNum(batch.hearts_lal) +
    toNum(batch.early_tails_lal) +
    toNum(batch.late_tails_lal)

  const heartsLAL = toNum(batch.hearts_lal)
  const heartsYield = totalLALStart > 0 && heartsLAL > 0
    ? `${((heartsLAL / totalLALStart) * 100).toFixed(1)}%`
    : '0.0%'

  return (
    <div className="border-t border-stone-200 pt-6">
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Distillation Summary</h3>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
          <p className="text-xs text-stone-600 mb-1">Foreshots</p>
          <p className="text-lg font-semibold text-stone-900">
            {toNum(batch.foreshots_volume_l).toFixed(1)} L
          </p>
        </div>

        <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
          <p className="text-xs text-stone-600 mb-1">Heads</p>
          <p className="text-lg font-semibold text-stone-900">
            {toNum(batch.heads_cut_volume_l).toFixed(1)} L
          </p>
          <p className="text-xs text-stone-500">
            @ {toNum(batch.heads_cut_abv_percent).toFixed(1)}% ABV
          </p>
          <p className="text-xs text-stone-500">
            {toNum(batch.heads_cut_lal).toFixed(2)} LAL
          </p>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-800 mb-1">Hearts</p>
          <p className="text-lg font-semibold text-amber-900">
            {toNum(batch.hearts_volume_l).toFixed(1)} L
          </p>
          <p className="text-xs text-amber-700">
            @ {toNum(batch.hearts_abv_percent).toFixed(1)}% ABV
          </p>
          <p className="text-xs text-amber-700">
            {toNum(batch.hearts_lal).toFixed(2)} LAL
          </p>
        </div>

        <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
          <p className="text-xs text-stone-600 mb-1">Early Tails</p>
          <p className="text-lg font-semibold text-stone-900">
            {toNum(batch.early_tails_volume_l).toFixed(1)} L
          </p>
          <p className="text-xs text-stone-500">
            @ {toNum(batch.early_tails_total_abv_percent).toFixed(1)}% ABV
          </p>
          <p className="text-xs text-stone-500">
            {toNum(batch.early_tails_lal).toFixed(2)} LAL
          </p>
        </div>

        <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
          <p className="text-xs text-stone-600 mb-1">Late Tails</p>
          <p className="text-lg font-semibold text-stone-900">
            {toNum(batch.late_tails_volume_l).toFixed(1)} L
          </p>
          <p className="text-xs text-stone-500">
            @ {toNum(batch.late_tails_total_abv_percent).toFixed(1)}% ABV
          </p>
          <p className="text-xs text-stone-500">
            {toNum(batch.late_tails_lal).toFixed(2)} LAL
          </p>
        </div>
      </div>

      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Total LAL Start:</span>{' '}
              {totalLALStart.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Total LAL End:</span>{' '}
              {totalLALEnd.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Hearts Yield:</span>{' '}
              {heartsYield}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
