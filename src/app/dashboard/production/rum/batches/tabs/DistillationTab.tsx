"use client"

type RumBatchLegacy = any

export function DistillationTab({ batch }: { batch: RumBatchLegacy }) {
  return (
    <div className="space-y-6">
      {/* Vessels */}
      <div>
        <h3 className="text-lg font-semibold text-graphite mb-3">Vessel Configuration</h3>
        <div className="grid grid-cols-3 gap-4">
          <VesselCard label="Boiler (Wash)" batch={batch} prefix="boiler" bgClass="bg-blue-50" textClass="text-blue-900" labelClass="text-blue-700" />
          <VesselCard label="Retort 1 (Late Tails)" batch={batch} prefix="retort1" bgClass="bg-amber-50" textClass="text-amber-900" labelClass="text-amber-700" />
          <VesselCard label="Retort 2 (Early Tails)" batch={batch} prefix="retort2" bgClass="bg-orange-50" textClass="text-orange-900" labelClass="text-orange-700" />
        </div>
      </div>

      {/* Cuts Table */}
      <div>
        <h3 className="text-lg font-semibold text-graphite mb-3">Cuts</h3>
        <table className="w-full text-sm">
          <thead className="border-b-2 border-copper-30">
            <tr className="text-left">
              <th className="py-2 px-3 font-medium text-graphite">Time</th>
              <th className="py-2 px-3 font-medium text-graphite">Phase</th>
              <th className="py-2 px-3 font-medium text-graphite text-right">Vol (L)</th>
              <th className="py-2 px-3 font-medium text-graphite text-right">ABV %</th>
              <th className="py-2 px-3 font-medium text-graphite text-right">LAL</th>
              <th className="py-2 px-3 font-medium text-graphite">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-copper-15">
            <tr>
              <td className="py-2 px-3">{batch.foreshots_time}</td>
              <td className="py-2 px-3">Foreshots</td>
              <td className="py-2 px-3 text-right">—</td>
              <td className="py-2 px-3 text-right">{batch.foreshots_abv_percent}%</td>
              <td className="py-2 px-3 text-right">—</td>
              <td className="py-2 px-3 text-xs text-graphite/60">{batch.foreshots_notes}</td>
            </tr>
            <tr>
              <td className="py-2 px-3">{batch.heads_time}</td>
              <td className="py-2 px-3">Heads</td>
              <td className="py-2 px-3 text-right">{batch.heads_volume_l}</td>
              <td className="py-2 px-3 text-right">{batch.heads_abv_percent}%</td>
              <td className="py-2 px-3 text-right">{batch.heads_lal?.toFixed(2)}</td>
              <td className="py-2 px-3 text-xs text-graphite/60">{batch.heads_notes}</td>
            </tr>
            <tr className="bg-copper-10">
              <td className="py-2 px-3 font-medium">{batch.hearts_time}</td>
              <td className="py-2 px-3 font-medium text-copper">Hearts</td>
              <td className="py-2 px-3 text-right font-bold text-copper">{batch.hearts_volume_l}</td>
              <td className="py-2 px-3 text-right font-bold text-copper">{batch.hearts_abv_percent}%</td>
              <td className="py-2 px-3 text-right font-bold text-copper">{batch.hearts_lal?.toFixed(2)}</td>
              <td className="py-2 px-3 text-xs text-graphite/80">{batch.hearts_notes}</td>
            </tr>
            {(batch.tails_segments || []).map((tail: any, idx: number) => (
              <tr key={idx}>
                <td className="py-2 px-3">{tail.time}</td>
                <td className="py-2 px-3">Tails {idx + 1}</td>
                <td className="py-2 px-3 text-right">{tail.volume_l}</td>
                <td className="py-2 px-3 text-right">{tail.abv_percent}%</td>
                <td className="py-2 px-3 text-right">{tail.lal?.toFixed(2)}</td>
                <td className="py-2 px-3 text-xs text-graphite/60">{tail.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Yield Summary */}
      <div className="bg-gradient-to-br from-copper-10 to-copper-20 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-graphite mb-3">Yield Summary</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div><div className="text-graphite/60">Total Input LAL</div><div className="font-bold text-graphite">{batch.total_lal_start?.toFixed(2)} L</div></div>
          <div><div className="text-graphite/60">Output LAL</div><div className="font-bold text-graphite">{batch.total_lal_end?.toFixed(2)} L</div></div>
          <div><div className="text-graphite/60">Heart Yield</div><div className="font-bold text-copper">{batch.heart_yield_percent?.toFixed(1)}%</div></div>
          <div><div className="text-graphite/60">LAL Loss</div><div className="font-medium text-graphite">{batch.lal_loss?.toFixed(2)} L</div></div>
        </div>
      </div>

      {/* Notes */}
      {batch.distillation_notes && (
        <div>
          <h3 className="text-lg font-semibold text-graphite mb-2">Notes</h3>
          <p className="text-sm text-graphite/80 italic">{batch.distillation_notes}</p>
        </div>
      )}
    </div>
  )
}

function VesselCard({ label, batch, prefix, bgClass, textClass, labelClass }: {
  label: string; batch: any; prefix: string; bgClass: string; textClass: string; labelClass: string
}) {
  return (
    <div className={`${bgClass} rounded-lg p-4`}>
      <h4 className={`font-medium ${textClass} mb-2`}>{label}</h4>
      <div className="space-y-1 text-sm">
        {batch[`${prefix}_content`] && <div className={`text-xs ${labelClass} mb-2`}>{batch[`${prefix}_content`]}</div>}
        {[
          { k: 'Volume', v: `${batch[`${prefix}_volume_l`]} L` },
          { k: 'ABV', v: `${batch[`${prefix}_abv_percent`]}%` },
          { k: 'LAL', v: `${batch[`${prefix}_lal`]?.toFixed(1)} L` },
          { k: 'Elements', v: batch[`${prefix}_elements`] },
        ].map(({ k, v }) => (
          <div key={k} className="flex justify-between">
            <span className={labelClass}>{k}</span>
            <span className={`font-medium ${textClass} ${k === 'Elements' ? 'text-xs' : ''}`}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
