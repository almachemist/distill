"use client"

import { formatDate, formatNumber } from "./rum-detail-utils"
import type { CutCalc } from "./rum-detail-utils"

export function RumDistillationSection({ run, cuts }: { run: any; cuts: CutCalc }) {
  const {
    foreshotsVol, foreshotsABV, foreshotsLAL,
    headsVol, headsABV, headsLAL,
    heartsVol, heartsABV, heartsLAL,
    earlyTailsVol, earlyTailsABV, earlyTailsLAL,
    lateTailsVol, lateTailsABV, lateTailsLAL,
    lalIn, lalOut, lalLoss, lalLossPercent, hasDataIssue,
  } = cuts

  return (
    <div className="bg-stone-100 border border-stone-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-stone-800 tracking-wide uppercase mb-3">Distillation</h3>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-xs text-stone-500 uppercase">Date</dt>
          <dd className="font-medium text-stone-900">{formatDate(run.distillation_date)}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">Still</dt>
          <dd className="font-medium text-stone-900">{run.still_used || "Roberta"}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">Start Time</dt>
          <dd className="font-medium text-stone-900">{run.distillation_start_time || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">Boiler</dt>
          <dd className="font-medium text-stone-900">{formatNumber(run.boiler_volume_l, 0)} L @ {formatNumber(run.boiler_abv_percent, 1)}%</dd>
        </div>

        {run.retort1_content && (
          <>
            <div>
              <dt className="text-xs text-stone-500 uppercase">Retort 1</dt>
              <dd className="font-medium text-stone-900">{run.retort1_content}</dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500 uppercase">Retort 1 Vol</dt>
              <dd className="font-medium text-stone-900">{formatNumber(run.retort1_volume_l, 0)} L @ {formatNumber(run.retort1_abv_percent, 1)}%</dd>
            </div>
          </>
        )}

        {run.retort2_content && (
          <>
            <div>
              <dt className="text-xs text-stone-500 uppercase">Retort 2</dt>
              <dd className="font-medium text-stone-900">{run.retort2_content}</dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500 uppercase">Retort 2 Vol</dt>
              <dd className="font-medium text-stone-900">{formatNumber(run.retort2_volume_l, 0)} L @ {formatNumber(run.retort2_abv_percent, 1)}%</dd>
            </div>
          </>
        )}

        <div className="col-span-2">
          <dt className="text-xs text-stone-500 uppercase">Elements</dt>
          <dd className="font-medium text-stone-900">
            Boiler: {run.boiler_elements || "—"}
            {run.retort1_elements && ` • R1: ${run.retort1_elements}`}
            {run.retort2_elements && ` • R2: ${run.retort2_elements}`}
          </dd>
        </div>

        {/* Cuts Data */}
        <div className="col-span-2 pt-3 border-t border-stone-300">
          <h4 className="text-xs font-semibold text-stone-700 uppercase mb-3">Cuts</h4>
          <div className="grid grid-cols-5 gap-3">
            <CutCard label="Foreshots" vol={foreshotsVol} abv={foreshotsABV} lal={foreshotsLAL} color="red" />
            <CutCard label="Heads" vol={headsVol} abv={headsABV} lal={headsLAL} color="orange" />
            <CutCard label="Hearts" vol={heartsVol} abv={heartsABV} lal={heartsLAL} color="green" />
            <CutCard label="Early Tails" vol={earlyTailsVol} abv={earlyTailsABV} lal={earlyTailsLAL} color="yellow" />
            <CutCard label="Late Tails" vol={lateTailsVol} abv={lateTailsABV} lal={lateTailsLAL} color="amber" />
          </div>
        </div>

        {/* Alcohol Recovery */}
        <div className="col-span-2 pt-3 border-t border-stone-300">
          <h4 className="text-xs font-semibold text-stone-700 uppercase mb-2">Alcohol Recovery</h4>
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-stone-500 uppercase">LAL In</p>
              <p className="font-medium text-stone-900 text-sm">{formatNumber(lalIn, 1)}</p>
              <p className="text-stone-400">Boiler charge</p>
            </div>
            <div>
              <p className="text-stone-500 uppercase">LAL Out</p>
              <p className="font-medium text-stone-900 text-sm">{formatNumber(lalOut, 1)}</p>
              <p className="text-stone-400">All cuts</p>
            </div>
            <div>
              <p className="text-stone-500 uppercase">Loss (LAL)</p>
              <p className={`font-medium text-sm ${hasDataIssue ? 'text-red-600' : 'text-stone-900'}`}>
                {hasDataIssue ? '—' : formatNumber(lalLoss, 1)}
              </p>
              <p className="text-stone-400">{hasDataIssue ? 'Check data' : 'Absolute'}</p>
            </div>
            <div>
              <p className="text-stone-500 uppercase">Loss (%)</p>
              <p className={`font-medium text-sm ${hasDataIssue ? 'text-red-600' : 'text-stone-900'}`}>
                {hasDataIssue ? 'Out > In' : `${formatNumber(lalLossPercent, 1)}%`}
              </p>
              <p className="text-stone-400">{hasDataIssue ? 'Invalid' : 'Relative'}</p>
            </div>
          </div>
        </div>
      </dl>

      {/* Distillation Notes */}
      {run.distillation_notes && run.distillation_notes !== "-" && (
        <div className="mt-4 pt-4 border-t border-stone-300">
          <h4 className="text-xs font-semibold text-stone-700 uppercase mb-2">Notes</h4>
          <p className="text-sm text-stone-700">{run.distillation_notes}</p>
        </div>
      )}
    </div>
  )
}

const COLOR_MAP: Record<string, { bg: string; border: string; title: string; value: string; sub: string; lal: string }> = {
  red:    { bg: 'bg-red-50',    border: 'border-red-200',    title: 'text-red-900',    value: 'text-red-700',    sub: 'text-red-600',    lal: 'text-red-500' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', title: 'text-orange-900', value: 'text-orange-700', sub: 'text-orange-600', lal: 'text-orange-500' },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  title: 'text-green-900',  value: 'text-green-700',  sub: 'text-green-600',  lal: 'text-green-500' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', title: 'text-yellow-900', value: 'text-yellow-700', sub: 'text-yellow-600', lal: 'text-yellow-500' },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  title: 'text-amber-900',  value: 'text-amber-700',  sub: 'text-amber-600',  lal: 'text-amber-500' },
}

function CutCard({ label, vol, abv, lal, color }: { label: string; vol: number; abv: number; lal: number; color: string }) {
  const c = COLOR_MAP[color] || COLOR_MAP.amber
  return (
    <div className={`${c.bg} border ${c.border} rounded p-3`}>
      <p className={`text-xs ${c.title} font-semibold mb-1`}>{label}</p>
      <p className={`text-sm ${c.value} font-medium`}>{formatNumber(vol, 1)} L</p>
      <p className={`text-xs ${c.sub}`}>{formatNumber(abv, 1)}% ABV</p>
      {lal > 0 && <p className={`text-xs ${c.lal} mt-1`}>{formatNumber(lal, 2)} LAL</p>}
    </div>
  )
}
