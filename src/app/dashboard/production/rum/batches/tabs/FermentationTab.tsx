"use client"

type RumBatchLegacy = any

export function FermentationTab({ batch }: { batch: RumBatchLegacy }) {
  return (
    <div className="space-y-6">
      {/* Substrate */}
      <div>
        <h3 className="text-lg font-semibold text-graphite mb-3">Substrate</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-graphite/60">Type</div>
            <div className="font-medium text-graphite">{batch.substrate_type}</div>
          </div>
          <div>
            <div className="text-graphite/60">Batch</div>
            <div className="font-medium text-graphite">{batch.substrate_batch || '—'}</div>
          </div>
          <div>
            <div className="text-graphite/60">Substrate Mass</div>
            <div className="font-medium text-graphite">{batch.substrate_mass_kg} kg</div>
          </div>
          <div>
            <div className="text-graphite/60">Water</div>
            <div className="font-medium text-graphite">{batch.water_mass_kg} kg</div>
          </div>
          <div>
            <div className="text-graphite/60">Initial Brix</div>
            <div className="font-medium text-graphite">{batch.initial_brix}</div>
          </div>
          <div>
            <div className="text-graphite/60">Initial pH</div>
            <div className="font-medium text-graphite">{batch.initial_ph}</div>
          </div>
        </div>
      </div>

      {/* Dunder */}
      {batch.dunder_added && (
        <div>
          <h3 className="text-lg font-semibold text-graphite mb-3">Dunder</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-graphite/60">Type</div>
              <div className="font-medium text-graphite capitalize">{batch.dunder_type}</div>
            </div>
            <div>
              <div className="text-graphite/60">Volume</div>
              <div className="font-medium text-graphite">{batch.dunder_volume_l} L</div>
            </div>
            {batch.dunder_ph && (
              <div>
                <div className="text-graphite/60">pH</div>
                <div className="font-medium text-graphite">{batch.dunder_ph}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Yeast */}
      <div>
        <h3 className="text-lg font-semibold text-graphite mb-3">Yeast</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-graphite/60">Type</div>
            <div className="font-medium text-graphite">{batch.yeast_type}</div>
          </div>
          <div>
            <div className="text-graphite/60">Mass</div>
            <div className="font-medium text-graphite">{batch.yeast_mass_g} g</div>
          </div>
          <div>
            <div className="text-graphite/60">Rehydration Temp</div>
            <div className="font-medium text-graphite">{batch.yeast_rehydration_temp_c} °C</div>
          </div>
          <div>
            <div className="text-graphite/60">Rehydration Time</div>
            <div className="font-medium text-graphite">{batch.yeast_rehydration_time_min} min</div>
          </div>
        </div>
      </div>

      {/* Fermentation Curves */}
      <div>
        <h3 className="text-lg font-semibold text-graphite mb-3">Fermentation Progress</h3>
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: 'Temperature (°C)', data: batch.temperature_curve },
            { label: 'Brix', data: batch.brix_curve },
            { label: 'pH', data: batch.ph_curve },
          ].map(({ label, data }) => (
            <div key={label}>
              <h4 className="font-medium text-graphite mb-2">{label}</h4>
              <div className="space-y-1 text-sm">
                {Object.entries(data || {}).map(([time, value]) => (
                  <div key={time} className="flex justify-between">
                    <span className="text-graphite/60">{time}</span>
                    <span className="font-medium text-graphite">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final Readings */}
      <div className="bg-copper-10 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-graphite mb-3">Final Readings</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-graphite/60">Duration</div>
            <div className="font-medium text-graphite">{batch.fermentation_duration_hours} hours</div>
          </div>
          <div>
            <div className="text-graphite/60">Final Brix</div>
            <div className="font-medium text-graphite">{batch.final_brix}</div>
          </div>
          <div>
            <div className="text-graphite/60">Final pH</div>
            <div className="font-medium text-graphite">{batch.final_ph}</div>
          </div>
          <div>
            <div className="text-graphite/60">Final ABV</div>
            <div className="font-medium text-copper">{batch.final_abv_percent}%</div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {batch.fermentation_notes && (
        <div>
          <h3 className="text-lg font-semibold text-graphite mb-2">Notes</h3>
          <p className="text-sm text-graphite/80 italic">{batch.fermentation_notes}</p>
        </div>
      )}
    </div>
  )
}
