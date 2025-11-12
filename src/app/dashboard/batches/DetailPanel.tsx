import React from "react"
import { useRouter } from "next/navigation"

type GinBatchRecord = any

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  try {
    return new Date(value).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  } catch {
    return value
  }
}

function formatNumber(value: number | null | undefined, fraction = 1) {
  if (value === null || value === undefined) return "—"
  return new Intl.NumberFormat("en-AU", { minimumFractionDigits: fraction, maximumFractionDigits: fraction }).format(value)
}

const ATOBlock: React.FC<{ run: GinBatchRecord }> = ({ run }) => {
  const chargeVolume = run.charge_total_volume_l || 0
  const chargeABV = run.charge_total_abv_percent || 0
  const chargeLAL = run.charge_total_lal || 0
  const heartsLAL = run.hearts_lal || 0
  const foreshotsVolume = run.foreshots_volume_l || 0
  const headsVolume = run.heads_volume_l || 0
  const wasteVolume = foreshotsVolume + headsVolume
  
  return (
    <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-stone-900 mb-3">
        ATO / Excise Summary
      </h4>
      <dl className="grid grid-cols-2 gap-3 text-sm text-stone-700">
        <div>
          <dt className="text-xs text-stone-400 uppercase">Excise Class</dt>
          <dd>Spirits – Gin</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-400 uppercase">Still ID</dt>
          <dd>{run.still_used || "Carrie"}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-400 uppercase">Charge</dt>
          <dd>{formatNumber(chargeVolume, 0)} L @ {formatNumber(chargeABV, 1)}%</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-400 uppercase">Charge LAL</dt>
          <dd>{formatNumber(chargeLAL, 1)}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-400 uppercase">Output LAL</dt>
          <dd>{formatNumber(heartsLAL, 1)}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-400 uppercase">Waste / Feints</dt>
          <dd>{formatNumber(wasteVolume, 1)} L</dd>
        </div>
      </dl>
      {run.notes && (
        <p className="mt-3 text-xs text-stone-500">{run.notes}</p>
      )}
    </div>
  )
}

const PhaseTable: React.FC<{ run: GinBatchRecord }> = ({ run }) => {
  const phases = []
  
  if (run.foreshots_volume_l) {
    phases.push({
      phase: "Foreshots",
      volumeL: run.foreshots_volume_l,
      abv: run.foreshots_abv_percent,
    })
  }
  
  if (run.heads_volume_l) {
    phases.push({
      phase: "Heads",
      volumeL: run.heads_volume_l,
      abv: run.heads_abv_percent,
    })
  }
  
  if (run.hearts_volume_l) {
    phases.push({
      phase: "Hearts",
      volumeL: run.hearts_volume_l,
      abv: run.hearts_abv_percent,
    })
  }
  
  if (run.tails_volume_l) {
    phases.push({
      phase: "Tails",
      volumeL: run.tails_volume_l,
      abv: run.tails_abv_percent,
    })
  }
  
  if (phases.length === 0) return null
  
  return (
    <div className="border border-stone-200 rounded-lg overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wide">
          <tr>
            <th className="px-3 py-2 text-left">Phase</th>
            <th className="px-3 py-2 text-right">Vol (L)</th>
            <th className="px-3 py-2 text-right">ABV %</th>
          </tr>
        </thead>
        <tbody>
          {phases.map((p) => (
            <tr key={p.phase} className="border-t border-stone-100">
              <td className="px-3 py-2 text-stone-800">{p.phase}</td>
              <td className="px-3 py-2 text-right text-stone-700">{formatNumber(p.volumeL, 1)}</td>
              <td className="px-3 py-2 text-right text-stone-700">{formatNumber(p.abv, 1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const AnalysisPanel: React.FC<{ run: GinBatchRecord }> = ({ run }) => {
  const heartsVolume = run.hearts_volume_l || 0
  const chargeVolume = run.charge_total_volume_l || 1
  const heartsLAL = run.hearts_lal || 0
  const chargeLAL = run.charge_total_lal || 1
  
  const heartsYieldOfChargePct = (heartsVolume / chargeVolume * 100).toFixed(1)
  const heartsShareOfLALPct = (heartsLAL / chargeLAL * 100).toFixed(1)
  
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4 flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-stone-900">
        Run Analysis
      </h4>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs uppercase text-stone-400">Hearts yield of charge (vol)</dt>
          <dd className="text-stone-900">{heartsYieldOfChargePct}%</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-stone-400">Hearts share of LAL</dt>
          <dd className="text-stone-900">{heartsShareOfLALPct}%</dd>
        </div>
        {run.botanicals && Array.isArray(run.botanicals) && (
          <div>
            <dt className="text-xs uppercase text-stone-400">Botanicals</dt>
            <dd className="text-stone-900">{run.botanicals.length} items</dd>
          </div>
        )}
      </dl>
      <div className="mt-2 border border-dashed border-stone-200 rounded p-3">
        <p className="text-xs text-stone-500">
          Graph placeholder: head temp vs time, ABV vs time, or phase volumes. Mount recharts here.
        </p>
      </div>
    </div>
  )
}

const ATOBlockWrapper = ({ run }: { run: GinBatchRecord }) => {
  const heartsLAL = run.hearts_lal || 0
  const chargeLAL = run.charge_total_lal || 0
  
  return (
    <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
      <p className="text-[0.6rem] uppercase tracking-wide text-stone-400 mb-1">
        Output LAL
      </p>
      <p className="text-2xl font-semibold text-stone-900">
        {formatNumber(heartsLAL, 1)}
      </p>
      <p className="text-xs text-stone-500 mt-1">
        From {formatNumber(chargeLAL, 1)} LAL charged
      </p>
    </div>
  )
}

export const DetailPanel: React.FC<{
  run: GinBatchRecord | null
  onClose: () => void
}> = ({ run, onClose }) => {
  const router = useRouter()

  if (!run) return (
    <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">
      Select a batch to see details.
    </div>
  )

  const heartsVolume = run.hearts_volume_l || 0
  const heartsABV = run.hearts_abv_percent || 0
  const heartsLAL = run.hearts_lal || (heartsVolume * heartsABV / 100)
  const chargeVolume = run.charge_total_volume_l || 0
  const chargeABV = run.charge_total_abv_percent || 0
  const chargeLAL = run.charge_total_lal || 0

  // Check if this is a draft/in_progress batch
  const isDraft = run.status === 'draft' || run.status === 'in_progress'
  const batchId = run.id || run.run_id || run.batch_id

  return (
    <div className="flex-1 flex flex-col gap-4 p-6 overflow-auto">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs uppercase tracking-wide text-stone-400">
              {run.recipe || run.display_name || run.sku}
            </p>
            {isDraft && (
              <span className="text-[0.65rem] px-2 py-0.5 rounded-full border bg-blue-100 text-blue-700 border-blue-300">
                {run.status === 'draft' ? 'Draft' : 'In Progress'}
              </span>
            )}
          </div>
          <h2 className="text-xl font-semibold text-stone-900">{run.run_id || run.batch_id}</h2>
          <p className="text-sm text-stone-500">
            {formatDate(run.date)} • Still: {run.still_used || "Carrie"}
          </p>
        </div>
        <div className="flex gap-2">
          {isDraft && (
            <button
              onClick={() => router.push(`/dashboard/production/edit/${batchId}`)}
              className="text-xs text-white bg-amber-700 hover:bg-amber-800 px-3 py-1 rounded-md font-medium"
            >
              Edit Batch
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs text-stone-500 hover:text-stone-900 px-3 py-1 border border-stone-200 rounded-md"
          >
            Close
          </button>
        </div>
      </div>

      {/* hearts highlight */}
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-2 bg-white border border-amber-700/80 rounded-lg p-4">
          <p className="text-[0.6rem] uppercase tracking-wide text-stone-400 mb-1">
            Hearts volume
          </p>
          <div className="flex items-baseline gap-3">
            <p className="text-4xl font-semibold text-stone-900">
              {formatNumber(heartsVolume, 1)}L
            </p>
            <div className="text-xs text-stone-500">
              <p>{formatNumber(heartsABV, 1)}% ABV</p>
              <p>{formatNumber(heartsLAL, 1)} LAL</p>
            </div>
          </div>
        </div>
        <ATOBlockWrapper run={run} />
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <p className="text-[0.6rem] uppercase tracking-wide text-stone-400 mb-1">
            Charge
          </p>
          <p className="text-sm text-stone-900">
            {formatNumber(chargeVolume, 0)} L @ {formatNumber(chargeABV, 1)}% ({formatNumber(chargeLAL, 1)} LAL)
          </p>
          {run.botanicals && Array.isArray(run.botanicals) && (
            <p className="text-xs text-stone-500 mt-2">
              Botanicals: {run.botanicals.length} items
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 flex flex-col gap-4">
          <PhaseTable run={run} />
          <AnalysisPanel run={run} />
          
          {/* Botanicals */}
          {run.botanicals && Array.isArray(run.botanicals) && run.botanicals.length > 0 && (
            <div className="border border-stone-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-stone-900 mb-3">Botanicals</h4>
              <div className="bg-stone-50 rounded-lg p-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="text-left py-2 text-stone-700">Botanical</th>
                      <th className="text-right py-2 text-stone-700">Weight (g)</th>
                      <th className="text-right py-2 text-stone-700">Ratio %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {run.botanicals.map((bot: any, idx: number) => (
                      <tr key={idx} className="border-b border-stone-100">
                        <td className="py-2 text-stone-900">{bot.name}</td>
                        <td className="text-right text-stone-900">{formatNumber(bot.weight_g, 0)}</td>
                        <td className="text-right text-stone-900">{formatNumber(bot.ratio_percent, 1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <ATOBlock run={run} />
          {run.notes && (
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 text-sm text-stone-700">
              <h4 className="text-sm font-semibold text-stone-900 mb-2">
                Notes
              </h4>
              <p>{run.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

