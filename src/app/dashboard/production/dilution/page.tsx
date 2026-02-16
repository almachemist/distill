"use client"

import { Suspense } from 'react'
import { useDilution } from './useDilution'

function DilutionContent() {
  const d = useDilution()

  return (
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <div className="text-sm text-graphite/60">
          <span>Production</span><span className="mx-2">→</span>
          <span>Start Batch</span><span className="mx-2">→</span>
          <span>Botanical Steeping</span><span className="mx-2">→</span>
          <span>Heating</span><span className="mx-2">→</span>
          <span>Distillation Cuts</span><span className="mx-2">→</span>
          <span className="font-medium text-copper">Dilution</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-graphite mb-2">Dilution & Final Output</h1>
          <p className="text-graphite/70">Batch: <span className="font-mono font-medium text-copper">{d.batchId}</span></p>
          <p className="text-sm text-graphite/60 mt-2">Dilute hearts to target ABV and record final bottling-ready output.</p>
        </div>

        {/* Dilution Steps */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-graphite">Dilution Steps</h2>
            <button onClick={d.addDilutionStep}
              className="px-4 py-2 bg-copper-10 text-copper rounded-lg hover:bg-copper-20 border border-copper-30 font-medium transition-all">+ Add Step</button>
          </div>

          {d.dilutionSteps.map((step, index) => (
            <div key={index} className="border border-copper-15 rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-graphite">Step {step.step}</h3>
                  <input type="text" value={step.description}
                    onChange={(e) => d.updateDilutionStep(index, 'description', e.target.value)}
                    className="mt-1 text-sm text-graphite/70 bg-transparent border-none p-0 focus:outline-none focus:ring-0" placeholder="Description..." />
                </div>
                {d.dilutionSteps.length > 1 && (
                  <button onClick={() => d.removeDilutionStep(index)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor={`step_${index}_new_make_volume`} className="block text-xs font-medium text-graphite/70 mb-1">New Make Volume (L)</label>
                  <input id={`step_${index}_new_make_volume`} type="number" step="0.1" value={step.newMakeVolume}
                    onChange={(e) => d.updateDilutionStep(index, 'newMakeVolume', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                    disabled={index > 0} />
                </div>
                <div>
                  <label htmlFor={`step_${index}_current_abv`} className="block text-xs font-medium text-graphite/70 mb-1">Current ABV (%)</label>
                  <input id={`step_${index}_current_abv`} type="number" step="0.1" value={step.actualABV.toFixed(2)} readOnly
                    className="w-full px-3 py-2 bg-beige border border-copper-15 rounded-lg text-graphite" />
                </div>
                <div>
                  <label htmlFor={`step_${index}_target_abv`} className="block text-xs font-medium text-graphite/70 mb-1">Target ABV (%)</label>
                  <input id={`step_${index}_target_abv`} type="number" step="0.1" value={step.targetABV}
                    onChange={(e) => d.updateDilutionStep(index, 'targetABV', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
                </div>
                <div className="bg-copper-10 p-3 rounded-lg">
                  <p className="block text-xs font-medium text-copper mb-1">Water Needed (L)</p>
                  <div className="text-lg font-bold text-copper">{d.calculateWaterNeeded(step)}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor={`step_${index}_water_added`} className="block text-xs font-medium text-graphite/70 mb-1">Water Added (L)</label>
                  <input id={`step_${index}_water_added`} type="number" step="0.1" value={step.waterAdded}
                    onChange={(e) => d.updateDilutionStep(index, 'waterAdded', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
                </div>
                <div>
                  <label htmlFor={`step_${index}_ethanol_added`} className="block text-xs font-medium text-graphite/70 mb-1">Ethanol Added (L) <span className="text-xs">(if needed)</span></label>
                  <input id={`step_${index}_ethanol_added`} type="number" step="0.1" value={step.ethanolAdded}
                    onChange={(e) => d.updateDilutionStep(index, 'ethanolAdded', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
                </div>
                <div>
                  <label htmlFor={`step_${index}_final_volume`} className="block text-xs font-medium text-graphite/70 mb-1">Final Volume (L)</label>
                  <input id={`step_${index}_final_volume`} type="number" value={step.finalVolume.toFixed(2)} readOnly
                    className="w-full px-3 py-2 bg-beige border border-copper-15 rounded-lg text-graphite" />
                </div>
              </div>

              <div>
                <label htmlFor={`step_${index}_notes`} className="block text-xs font-medium text-graphite/70 mb-1">Notes</label>
                <textarea id={`step_${index}_notes`} value={step.notes}
                  onChange={(e) => d.updateDilutionStep(index, 'notes', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                  rows={2} placeholder="Observations, adjustments..." />
              </div>

              <div className="bg-beige rounded-lg p-3 grid grid-cols-3 gap-4 text-sm">
                <div><div className="text-xs text-graphite/60">Final ABV</div><div className="font-semibold text-graphite">{step.actualABV.toFixed(2)}%</div></div>
                <div><div className="text-xs text-graphite/60">LAL</div><div className="font-semibold text-graphite">{step.lal.toFixed(2)} L</div></div>
                <div><div className="text-xs text-graphite/60">Total Volume</div><div className="font-semibold text-graphite">{step.finalVolume.toFixed(2)} L</div></div>
              </div>
            </div>
          ))}
        </div>

        {/* Final Output Summary */}
        <div className="bg-gradient-to-br from-copper-10 to-copper-20 rounded-xl border border-copper-30 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-graphite">Final Output (Bottling Ready)</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4"><div className="text-sm text-graphite/60">Total Volume</div><div className="text-2xl font-bold text-copper">{d.finalOutput.totalVolume.toFixed(2)} L</div></div>
            <div className="bg-white rounded-lg p-4"><div className="text-sm text-graphite/60">Final ABV</div><div className="text-2xl font-bold text-copper">{d.finalOutput.finalABV.toFixed(2)}%</div></div>
            <div className="bg-white rounded-lg p-4"><div className="text-sm text-graphite/60">Total LAL</div><div className="text-2xl font-bold text-copper">{d.finalOutput.totalLAL.toFixed(2)} L</div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="bottling_date" className="block text-sm font-medium text-graphite mb-2">Bottling Date</label>
              <input id="bottling_date" type="date" value={d.finalOutput.bottlingDate}
                onChange={(e) => d.setFinalOutput({ ...d.finalOutput, bottlingDate: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
            </div>
          </div>
          <div>
            <label htmlFor="final_notes" className="block text-sm font-medium text-graphite mb-2">Final Notes</label>
            <textarea id="final_notes" value={d.finalOutput.notes}
              onChange={(e) => d.setFinalOutput({ ...d.finalOutput, notes: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              rows={3} placeholder="Color, clarity, aroma, taste notes..." />
          </div>
        </div>

        {/* Finalize Error */}
        {d.finalizeError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800 text-sm font-medium">Finalization Error</p>
            <p className="text-red-700 text-sm mt-1">{d.finalizeError}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button onClick={d.handleBack} disabled={d.saving}
            className="px-6 py-3 bg-white border border-copper-30 text-graphite rounded-lg hover:bg-beige font-medium transition-all disabled:opacity-50">← Back to Cuts</button>
          <div className="flex gap-3">
            <button onClick={d.handleSaveDraft} disabled={d.saving}
              className="px-6 py-3 bg-white border border-copper-30 text-graphite rounded-lg hover:bg-beige font-medium transition-all disabled:opacity-50">
              {d.saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={d.handleFinalize} disabled={d.saving}
              className="px-8 py-3 bg-copper text-white rounded-lg hover:bg-copper/90 font-medium shadow-md transition-all disabled:opacity-50">
              {d.saving ? 'Finalizing...' : 'Finalize Batch →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DilutionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-beige p-6" />}>
      <DilutionContent />
    </Suspense>
  )
}
