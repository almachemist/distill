"use client"

import { formatDate, formatNumber } from "./rum-detail-utils"

export function RumFermentationSection({ run }: { run: any }) {
  const fermentationVolume = run.boiler_volume_l || 0
  const fermentationFinalABV = run.boiler_abv_percent || run.final_abv_percent || 0

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-stone-800 tracking-wide uppercase mb-3">Fermentation</h3>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-xs text-stone-500 uppercase">Start Date</dt>
          <dd className="font-medium text-stone-900">{formatDate(run.fermentation_start_date)}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">Duration</dt>
          <dd className="font-medium text-stone-900">{formatNumber(run.fermentation_duration_hours, 0)} hrs</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">Fermentation Volume</dt>
          <dd className="font-medium text-stone-900">{formatNumber(fermentationVolume, 0)} L</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">Final ABV of Fermentation</dt>
          <dd className="font-medium text-stone-900">{formatNumber(fermentationFinalABV, 1)}%</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">Substrate</dt>
          <dd className="font-medium text-stone-900">{run.substrate_type || "—"}</dd>
          {run.substrate_batch && <dd className="text-xs text-stone-500">Batch: {run.substrate_batch}</dd>}
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">Substrate Mass</dt>
          <dd className="font-medium text-stone-900">{formatNumber(run.substrate_mass_kg, 0)} kg</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">Initial Brix</dt>
          <dd className="font-medium text-stone-900">{formatNumber(run.initial_brix, 1)}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">Initial pH</dt>
          <dd className="font-medium text-stone-900">{formatNumber(run.initial_ph, 2)}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">Yeast</dt>
          <dd className="font-medium text-stone-900">{run.yeast_type || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">Water Mass</dt>
          <dd className="font-medium text-stone-900">{formatNumber(run.water_mass_kg, 0)} kg</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">Initial Brix</dt>
          <dd className="font-medium text-stone-900">{formatNumber(run.initial_brix, 1)}°</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">Initial pH</dt>
          <dd className="font-medium text-stone-900">{formatNumber(run.initial_ph, 2)}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">Final pH</dt>
          <dd className="font-medium text-stone-900">{formatNumber(run.final_ph, 2)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-stone-500 uppercase">Yeast</dt>
          <dd className="font-medium text-stone-900">{run.yeast_type || "—"} ({formatNumber(run.yeast_mass_g, 0)} g)</dd>
          {run.yeast_rehydration_temp_c && (
            <dd className="text-xs text-stone-500">
              Rehydrated @ {formatNumber(run.yeast_rehydration_temp_c, 0)}°C for {run.yeast_rehydration_time_min} min
            </dd>
          )}
        </div>
        {run.dunder_added && (
          <div className="col-span-2">
            <dt className="text-xs text-stone-500 uppercase">Dunder</dt>
            <dd className="font-medium text-stone-900">Type {run.dunder_type || "—"} • {formatNumber(run.dunder_volume_l, 0)} L • pH {formatNumber(run.dunder_ph, 2)}</dd>
          </div>
        )}
        {run.antifoam_added && (
          <div className="col-span-2">
            <dt className="text-xs text-stone-500 uppercase">Anti-foam</dt>
            <dd className="font-medium text-stone-900">{formatNumber(run.antifoam_ml, 0)} mL</dd>
          </div>
        )}
        {(run.dap_g || run.fermaid_o_g) && (
          <div className="col-span-2">
            <dt className="text-xs text-stone-500 uppercase">Nutrients</dt>
            <dd className="font-medium text-stone-900">
              {run.dap_g && `DAP: ${formatNumber(run.dap_g, 0)} g`}
              {run.dap_g && run.fermaid_o_g && ' • '}
              {run.fermaid_o_g && `Fermaid O: ${formatNumber(run.fermaid_o_g, 0)} g`}
            </dd>
          </div>
        )}
      </dl>

      {/* Fermentation Curves */}
      {(run.temperature_curve || run.brix_curve || run.ph_curve) && (
        <div className="mt-4 pt-4 border-t border-stone-300">
          <h4 className="text-xs font-semibold text-stone-700 uppercase mb-3">Fermentation Curves</h4>
          <div className="grid grid-cols-3 gap-4">
            {run.temperature_curve && (
              <div>
                <p className="text-xs text-stone-500 uppercase mb-2">Temperature (°C)</p>
                <div className="space-y-1">
                  {Object.entries(run.temperature_curve).slice(0, 5).map(([time, temp]: [string, any]) => (
                    <div key={time} className="flex justify-between text-xs">
                      <span className="text-stone-500">{time}</span>
                      <span className="font-medium text-stone-900">{temp}°C</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {run.brix_curve && (
              <div>
                <p className="text-xs text-stone-500 uppercase mb-2">Brix (°)</p>
                <div className="space-y-1">
                  {Object.entries(run.brix_curve).slice(0, 5).map(([time, brix]: [string, any]) => (
                    <div key={time} className="flex justify-between text-xs">
                      <span className="text-stone-500">{time}</span>
                      <span className="font-medium text-stone-900">{brix}°</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {run.ph_curve && (
              <div>
                <p className="text-xs text-stone-500 uppercase mb-2">pH</p>
                <div className="space-y-1">
                  {Object.entries(run.ph_curve).slice(0, 5).map(([time, ph]: [string, any]) => (
                    <div key={time} className="flex justify-between text-xs">
                      <span className="text-stone-500">{time}</span>
                      <span className="font-medium text-stone-900">{ph}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fermentation Notes */}
      {run.fermentation_notes && run.fermentation_notes !== "-" && (
        <div className="mt-4 pt-4 border-t border-stone-300">
          <h4 className="text-xs font-semibold text-stone-700 uppercase mb-2">Notes</h4>
          <p className="text-sm text-stone-700">{run.fermentation_notes}</p>
        </div>
      )}
    </div>
  )
}
