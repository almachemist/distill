"use client"

import React from "react"
import { useRouter } from "next/navigation"

type RumBatchRecord = any

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

export const RumDetailPanel: React.FC<{
  run: RumBatchRecord | null
  onClose: () => void
  onDelete?: () => void
}> = ({ run, onClose, onDelete }) => {
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  if (!run) return (
    <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">
      Select a rum batch to see details.
    </div>
  )

  const handleDelete = async () => {
    if (!run.batch_id && !run.id) return

    try {
      setIsDeleting(true)
      const batchId = run.batch_id || run.id
      const response = await fetch(`/api/production/rum/batches/${encodeURIComponent(batchId)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete batch')
      }

      setShowDeleteConfirm(false)
      onDelete?.()
      onClose()
    } catch (error) {
      console.error('Error deleting batch:', error)
      alert('Failed to delete batch. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Fermentation data (same as boiler charge)
  const fermentationVolume = run.boiler_volume_l || 0
  const fermentationFinalABV = run.boiler_abv_percent || run.final_abv_percent || 0

  // Distillation cuts
  const foreshotsVol = run.foreshots_volume_l || 0
  const foreshotsABV = run.foreshots_abv_percent || 0
  const foreshotsLAL = foreshotsVol * (foreshotsABV / 100)

  const headsVol = run.heads_volume_l || 0
  const headsABV = run.heads_abv_percent || 0
  const headsLAL = headsVol * (headsABV / 100)

  const heartsVol = run.hearts_volume_l || 0
  const heartsABV = run.hearts_abv_percent || 0
  const heartsLAL = run.hearts_lal || (heartsVol * (heartsABV / 100))

  const earlyTailsVol = run.early_tails_volume_l || 0
  const earlyTailsABV = run.early_tails_abv_percent || 0
  const earlyTailsLAL = earlyTailsVol * (earlyTailsABV / 100)

  const lateTailsVol = run.late_tails_volume_l || run.tails_volume_l || 0
  const lateTailsABV = run.late_tails_abv_percent || run.tails_abv_percent || 0
  const lateTailsLAL = lateTailsVol * (lateTailsABV / 100)

  // LAL calculations
  const lalIn = fermentationVolume * (fermentationFinalABV / 100)
  const lalOut = foreshotsLAL + headsLAL + heartsLAL + earlyTailsLAL + lateTailsLAL
  const lalLoss = lalIn - lalOut
  const lalLossPercent = lalIn > 0 ? (lalLoss / lalIn) * 100 : 0

  // Data validation: if LAL out > LAL in, show warning
  const hasDataIssue = lalOut > lalIn

  // Heart yield
  const heartYield = lalIn > 0 ? (heartsLAL / lalIn) * 100 : 0

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 overflow-auto bg-stone-50">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs uppercase tracking-wide text-stone-500">
            {run.product_name || "Rum Production Run"}
          </p>
          <h2 className="text-2xl font-semibold text-stone-900">{run.batch_id}</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/dashboard/production/rum/edit/${encodeURIComponent(run.batch_id)}`)}
            className="text-xs text-amber-700 hover:text-amber-900 hover:bg-amber-50 px-3 py-1.5 border border-amber-200 bg-white rounded-md transition font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 border border-red-200 bg-white rounded-md transition font-medium"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="text-xs text-stone-500 hover:text-stone-900 px-3 py-1.5 border border-stone-200 bg-white rounded-md transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Process Timeline */}
      <div className="bg-white border border-stone-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${run.fermentation_start_date ? 'bg-amber-700' : 'border-2 border-stone-300'}`}></div>
            <span className="text-xs font-medium text-stone-700 uppercase tracking-wide">Fermentation</span>
            <span className="text-xs text-stone-500">{formatDate(run.fermentation_start_date)}</span>
          </div>
          <div className="flex-1 border-t-2 border-stone-200 mx-3"></div>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${run.distillation_date ? 'bg-amber-700' : 'border-2 border-stone-300'}`}></div>
            <span className="text-xs font-medium text-stone-700 uppercase tracking-wide">Distillation</span>
            <span className="text-xs text-stone-500">{formatDate(run.distillation_date)}</span>
          </div>
          <div className="flex-1 border-t-2 border-stone-200 mx-3"></div>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${run.fill_date ? 'bg-amber-700' : 'border-2 border-stone-300'}`}></div>
            <span className="text-xs font-medium text-stone-700 uppercase tracking-wide">Barrel</span>
            <span className="text-xs text-stone-500">{formatDate(run.fill_date)}</span>
          </div>
          <div className="flex-1 border-t-2 border-stone-200 mx-3"></div>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${run.expected_bottling_date ? 'border-2 border-amber-700' : 'border-2 border-stone-300'}`}></div>
            <span className="text-xs font-medium text-stone-700 uppercase tracking-wide">Bottling</span>
            <span className="text-xs text-stone-500">{formatDate(run.expected_bottling_date)}</span>
          </div>
        </div>
      </div>

      {/* KPI Summary Bar */}
      <div className="grid grid-cols-6 gap-3">
        <div className="bg-white border border-amber-700 rounded-lg p-3">
          <p className="text-xs text-stone-500 uppercase tracking-wide">Hearts</p>
          <p className="text-lg font-semibold text-stone-900">{formatNumber(heartsVol, 1)} L</p>
          <p className="text-xs text-stone-500">{formatNumber(heartsABV, 1)}% ABV</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <p className="text-xs text-stone-500 uppercase tracking-wide">Hearts LAL</p>
          <p className="text-lg font-semibold text-stone-900">{formatNumber(heartsLAL, 1)}</p>
          <p className="text-xs text-stone-500">Litres of Alcohol</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <p className="text-xs text-stone-500 uppercase tracking-wide">Heart Yield</p>
          <p className="text-lg font-semibold text-stone-900">{formatNumber(heartYield, 1)}%</p>
          <p className="text-xs text-stone-500">Of total LAL</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <p className="text-xs text-stone-500 uppercase tracking-wide">LAL In</p>
          <p className="text-lg font-semibold text-stone-900">{formatNumber(lalIn, 1)}</p>
          <p className="text-xs text-stone-500">Boiler charge</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <p className="text-xs text-stone-500 uppercase tracking-wide">LAL Out</p>
          <p className="text-lg font-semibold text-stone-900">{formatNumber(lalOut, 1)}</p>
          <p className="text-xs text-stone-500">All cuts</p>
        </div>
        <div className={`bg-white border rounded-lg p-3 ${hasDataIssue ? 'border-red-500' : 'border-stone-200'}`}>
          <p className="text-xs text-stone-500 uppercase tracking-wide">
            {hasDataIssue ? 'Check Data' : 'LAL Loss'}
          </p>
          <p className={`text-lg font-semibold ${hasDataIssue ? 'text-red-600' : 'text-stone-900'}`}>
            {hasDataIssue ? '—' : `${formatNumber(lalLossPercent, 1)}%`}
          </p>
          <p className="text-xs text-stone-500">
            {hasDataIssue ? 'Out > In' : `${formatNumber(lalLoss, 1)} LAL`}
          </p>
        </div>
      </div>

      {/* Process Details - Single Column */}
      <div className="flex flex-col gap-4">
        {/* Fermentation - Complete Section */}
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-stone-800 tracking-wide uppercase mb-3">Fermentation</h3>

            {/* Two-column grid for data density */}
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

        {/* Distillation */}
        <div className="bg-stone-100 border border-stone-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-stone-800 tracking-wide uppercase mb-3">Distillation</h3>

          {/* Two-column grid for data density */}
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

            {/* Cuts Data - 5 mandatory cards */}
            <div className="col-span-2 pt-3 border-t border-stone-300">
              <h4 className="text-xs font-semibold text-stone-700 uppercase mb-3">Cuts</h4>
              <div className="grid grid-cols-5 gap-3">
                {/* 1. Foreshots */}
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-xs text-red-900 font-semibold mb-1">Foreshots</p>
                  <p className="text-sm text-red-700 font-medium">{formatNumber(foreshotsVol, 1)} L</p>
                  <p className="text-xs text-red-600">{formatNumber(foreshotsABV, 1)}% ABV</p>
                  {foreshotsLAL > 0 && (
                    <p className="text-xs text-red-500 mt-1">{formatNumber(foreshotsLAL, 2)} LAL</p>
                  )}
                </div>

                {/* 2. Heads */}
                <div className="bg-orange-50 border border-orange-200 rounded p-3">
                  <p className="text-xs text-orange-900 font-semibold mb-1">Heads</p>
                  <p className="text-sm text-orange-700 font-medium">{formatNumber(headsVol, 1)} L</p>
                  <p className="text-xs text-orange-600">{formatNumber(headsABV, 1)}% ABV</p>
                  {headsLAL > 0 && (
                    <p className="text-xs text-orange-500 mt-1">{formatNumber(headsLAL, 2)} LAL</p>
                  )}
                </div>

                {/* 3. Hearts */}
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-xs text-green-900 font-semibold mb-1">Hearts</p>
                  <p className="text-sm text-green-700 font-medium">{formatNumber(heartsVol, 1)} L</p>
                  <p className="text-xs text-green-600">{formatNumber(heartsABV, 1)}% ABV</p>
                  {heartsLAL > 0 && (
                    <p className="text-xs text-green-500 mt-1">{formatNumber(heartsLAL, 2)} LAL</p>
                  )}
                </div>

                {/* 4. Early Tails */}
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-xs text-yellow-900 font-semibold mb-1">Early Tails</p>
                  <p className="text-sm text-yellow-700 font-medium">{formatNumber(earlyTailsVol, 1)} L</p>
                  <p className="text-xs text-yellow-600">{formatNumber(earlyTailsABV, 1)}% ABV</p>
                  {earlyTailsLAL > 0 && (
                    <p className="text-xs text-yellow-500 mt-1">{formatNumber(earlyTailsLAL, 2)} LAL</p>
                  )}
                </div>

                {/* 5. Late Tails */}
                <div className="bg-amber-50 border border-amber-200 rounded p-3">
                  <p className="text-xs text-amber-900 font-semibold mb-1">Late Tails</p>
                  <p className="text-sm text-amber-700 font-medium">{formatNumber(lateTailsVol, 1)} L</p>
                  <p className="text-xs text-amber-600">{formatNumber(lateTailsABV, 1)}% ABV</p>
                  {lateTailsLAL > 0 && (
                    <p className="text-xs text-amber-500 mt-1">{formatNumber(lateTailsLAL, 2)} LAL</p>
                  )}
                </div>
              </div>
            </div>

            {/* Alcohol Recovery / Process Losses */}
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

        {/* Barrel/Maturation */}
        {run.cask_number && (
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-stone-800 tracking-wide uppercase mb-3">Barrel / Maturation</h3>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-stone-500 uppercase">Fill Date</dt>
                <dd className="font-medium text-stone-900">{formatDate(run.fill_date)}</dd>
              </div>

              <div>
                <dt className="text-xs text-stone-500 uppercase">Cask #</dt>
                <dd className="font-medium text-stone-900">#{run.cask_number}</dd>
              </div>

              <div>
                <dt className="text-xs text-stone-500 uppercase">Origin</dt>
                <dd className="font-medium text-stone-900">{run.cask_origin || "—"}</dd>
              </div>

              <div>
                <dt className="text-xs text-stone-500 uppercase">Type</dt>
                <dd className="font-medium text-stone-900">{run.cask_type || "—"}</dd>
              </div>

              <div>
                <dt className="text-xs text-stone-500 uppercase">Size</dt>
                <dd className="font-medium text-stone-900">{formatNumber(run.cask_size_l, 0)} L</dd>
              </div>

              <div>
                <dt className="text-xs text-stone-500 uppercase">Fill ABV</dt>
                <dd className="font-medium text-stone-900">{formatNumber(run.fill_abv_percent, 1)}%</dd>
              </div>

              <div>
                <dt className="text-xs text-stone-500 uppercase">Volume Filled</dt>
                <dd className="font-medium text-stone-900">{formatNumber(run.volume_filled_l, 0)} L</dd>
              </div>

              <div>
                <dt className="text-xs text-stone-500 uppercase">LAL Filled</dt>
                <dd className="font-medium text-stone-900">{formatNumber(run.lal_filled, 1)}</dd>
              </div>

              <div className="col-span-2">
                <dt className="text-xs text-stone-500 uppercase">Location</dt>
                <dd className="font-medium text-stone-900">{run.maturation_location || "—"}</dd>
              </div>

              <div className="col-span-2">
                <dt className="text-xs text-stone-500 uppercase">Expected Bottling</dt>
                <dd className="font-medium text-stone-900">{formatDate(run.expected_bottling_date)}</dd>
              </div>
            </dl>

            {/* Maturation Notes */}
            {run.notes && run.notes !== "-" && (
              <div className="mt-4 pt-4 border-t border-stone-300">
                <h4 className="text-xs font-semibold text-stone-700 uppercase mb-2">Notes</h4>
                <p className="text-sm text-stone-700">{run.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-stone-900 mb-2">
                Delete Batch?
              </h2>
              <p className="text-sm text-stone-600 mb-4">
                Are you sure you want to delete batch <strong>{run.batch_id}</strong>? This action cannot be undone.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Batch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

