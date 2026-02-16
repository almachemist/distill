"use client"

import { useRumFermentation } from './useRumFermentation'

const inputClass = "w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
const inputSmClass = "w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite text-sm"

export default function RumFermentationPage() {
  const d = useRumFermentation()

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <div className="text-sm text-graphite/60">
          <span>Production</span><span className="mx-2">→</span>
          <span>Rum Production</span><span className="mx-2">→</span>
          <span className="font-medium text-copper">Fermentation</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-graphite mb-2">Rum Fermentation</h1>
          <p className="text-graphite/70">Start a new fermentation cycle for rum or cane spirit production</p>
          <p className="text-sm text-graphite/60 mt-2">Still: <span className="font-mono font-medium text-copper">Roberta (Double Retort)</span></p>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-graphite">Batch Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="batch_id" className="block text-sm font-medium text-graphite mb-2">Batch ID</label>
              <input id="batch_id" type="text" value={d.batchId} onChange={(e) => d.setBatchId(e.target.value)} placeholder="RUM-24-5" className={inputClass} />
            </div>
            <div>
              <label htmlFor="product_name" className="block text-sm font-medium text-graphite mb-2">Product Name</label>
              <input id="product_name" type="text" value={d.productName} onChange={(e) => d.setProductName(e.target.value)} placeholder="Pineapple Rum" className={inputClass} />
            </div>
            <div>
              <label htmlFor="product_type" className="block text-sm font-medium text-graphite mb-2">Product Type</label>
              <select id="product_type" value={d.productType} onChange={(e) => d.setProductType(e.target.value as 'rum' | 'cane_spirit')} className={inputClass}>
                <option value="rum">Rum</option>
                <option value="cane_spirit">Cane Spirit</option>
              </select>
            </div>
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-graphite mb-2">Start Date</label>
              <input id="start_date" type="date" value={d.startDate} onChange={(e) => d.setStartDate(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Substrate */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-graphite">Substrate</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="substrate_type" className="block text-sm font-medium text-graphite mb-2">Type</label>
              <select id="substrate_type" value={d.substrateType} onChange={(e) => d.setSubstrateType(e.target.value)} className={inputClass}>
                <option value="C Molasses">C Molasses</option>
                <option value="Blackstrap Molasses">Blackstrap Molasses</option>
                <option value="Cane Juice">Cane Juice</option>
              </select>
            </div>
            <div>
              <label htmlFor="substrate_batch" className="block text-sm font-medium text-graphite mb-2">Batch/Year</label>
              <input id="substrate_batch" type="text" value={d.substrateBatch} onChange={(e) => d.setSubstrateBatch(e.target.value)} placeholder="2021" className={inputClass} />
            </div>
            <div>
              <label htmlFor="substrate_mass_kg" className="block text-sm font-medium text-graphite mb-2">Mass (kg)</label>
              <input id="substrate_mass_kg" type="number" step="0.1" value={d.substrateMassKg} onChange={(e) => d.setSubstrateMassKg(parseFloat(e.target.value) || 0)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="water_mass_kg" className="block text-sm font-medium text-graphite mb-2">Water (kg)</label>
              <input id="water_mass_kg" type="number" step="0.1" value={d.waterMassKg} onChange={(e) => d.setWaterMassKg(parseFloat(e.target.value) || 0)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="initial_brix" className="block text-sm font-medium text-graphite mb-2">Initial Brix</label>
              <input id="initial_brix" type="number" step="0.1" value={d.initialBrix} onChange={(e) => d.setInitialBrix(parseFloat(e.target.value) || 0)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="initial_ph" className="block text-sm font-medium text-graphite mb-2">Initial pH</label>
              <input id="initial_ph" type="number" step="0.01" value={d.initialPH} onChange={(e) => d.setInitialPH(parseFloat(e.target.value) || 0)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Dunder */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={d.dunderAdded} onChange={(e) => d.setDunderAdded(e.target.checked)} className="w-5 h-5 text-copper focus:ring-copper border-copper-30 rounded" />
            <h2 className="text-xl font-semibold text-graphite">Dunder Added</h2>
          </div>
          {d.dunderAdded && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="dunder_type" className="block text-sm font-medium text-graphite mb-2">Type</label>
                <input id="dunder_type" type="text" value={d.dunderType} onChange={(e) => d.setDunderType(e.target.value)} placeholder="clean, sour, etc." className={inputClass} />
              </div>
              <div>
                <label htmlFor="dunder_volume_l" className="block text-sm font-medium text-graphite mb-2">Volume (L)</label>
                <input id="dunder_volume_l" type="number" step="0.1" value={d.dunderVolumeL} onChange={(e) => d.setDunderVolumeL(parseFloat(e.target.value) || 0)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="dunder_ph" className="block text-sm font-medium text-graphite mb-2">pH (optional)</label>
                <input id="dunder_ph" type="number" step="0.01" value={d.dunderPH || ''} onChange={(e) => d.setDunderPH(e.target.value ? parseFloat(e.target.value) : null)} placeholder="pH" className={inputClass} />
              </div>
            </div>
          )}
        </div>

        {/* Additives */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-graphite">Additives & Nutrients</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="anti_foam_ml" className="block text-sm font-medium text-graphite mb-2">Anti-Foam (mL)</label>
              <input id="anti_foam_ml" type="number" step="1" value={d.antiFoamML || ''} onChange={(e) => d.setAntiFoamML(e.target.value ? parseFloat(e.target.value) : 0)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="citric_acid_g" className="block text-sm font-medium text-graphite mb-2">Citric Acid (g)</label>
              <input id="citric_acid_g" type="number" step="0.1" value={d.citricAcidG || ''} onChange={(e) => d.setCitricAcidG(e.target.value ? parseFloat(e.target.value) : null)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="fermaid_g" className="block text-sm font-medium text-graphite mb-2">Fermaid (g)</label>
              <input id="fermaid_g" type="number" step="1" value={d.fermaidG || ''} onChange={(e) => d.setFermaidG(e.target.value ? parseFloat(e.target.value) : null)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="dap_g" className="block text-sm font-medium text-graphite mb-2">DAP (g)</label>
              <input id="dap_g" type="number" step="1" value={d.dapG || ''} onChange={(e) => d.setDapG(e.target.value ? parseFloat(e.target.value) : null)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="calcium_carbonate_g" className="block text-sm font-medium text-graphite mb-2">Calcium Carbonate (g)</label>
              <input id="calcium_carbonate_g" type="number" step="1" value={d.calciumCarbonateG || ''} onChange={(e) => d.setCalciumCarbonateG(e.target.value ? parseFloat(e.target.value) : null)} className={inputClass} />
            </div>
          </div>
          <div>
            <label htmlFor="additional_nutrients" className="block text-sm font-medium text-graphite mb-2">Additional Nutrients</label>
            <textarea id="additional_nutrients" value={d.additionalNutrients} onChange={(e) => d.setAdditionalNutrients(e.target.value)} rows={2}
              placeholder="Added 250 g nutrient mid-ferment..." className={inputClass} />
          </div>
        </div>

        {/* Yeast */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-graphite">Yeast</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="yeast_type" className="block text-sm font-medium text-graphite mb-2">Yeast Type</label>
              <input id="yeast_type" type="text" value={d.yeastType} onChange={(e) => d.setYeastType(e.target.value)} placeholder="Distillamax RM" className={inputClass} />
            </div>
            <div>
              <label htmlFor="yeast_mass_g" className="block text-sm font-medium text-graphite mb-2">Mass (g)</label>
              <input id="yeast_mass_g" type="number" step="1" value={d.yeastMassG} onChange={(e) => d.setYeastMassG(parseFloat(e.target.value) || 0)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="yeast_rehydration_temp" className="block text-sm font-medium text-graphite mb-2">Rehydration Temp (°C)</label>
              <input id="yeast_rehydration_temp" type="number" step="0.1" value={d.yeastRehydrationTempC} onChange={(e) => d.setYeastRehydrationTempC(parseFloat(e.target.value) || 0)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="yeast_rehydration_time_min" className="block text-sm font-medium text-graphite mb-2">Rehydration Time (min)</label>
              <input id="yeast_rehydration_time_min" type="number" step="1" value={d.yeastRehydrationTimeMin} onChange={(e) => d.setYeastRehydrationTimeMin(parseInt(e.target.value) || 0)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Fermentation Curves */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold text-graphite">Fermentation Curves (24h intervals)</h2>
          {[
            { label: 'Temperature (°C)', curve: d.tempCurve, setCurve: d.setTempCurve, step: '0.1' },
            { label: 'Brix', curve: d.brixCurve, setCurve: d.setBrixCurve, step: '0.1' },
            { label: 'pH', curve: d.phCurve, setCurve: d.setPhCurve, step: '0.01' },
          ].map(({ label, curve, setCurve, step }) => (
            <div key={label}>
              <h3 className="font-medium text-graphite mb-3">{label}</h3>
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(curve).map(([key, value]) => (
                  <div key={key}>
                    <label htmlFor={`${label}_${key}`} className="block text-xs font-medium text-graphite/70 mb-1">{key}</label>
                    <input id={`${label}_${key}`} type="number" step={step} value={value}
                      onChange={(e) => d.updateCurve(curve, setCurve, key, parseFloat(e.target.value) || 0)}
                      className={inputSmClass} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Final Readings */}
        <div className="bg-gradient-to-br from-copper-10 to-copper-20 rounded-xl border border-copper-30 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-graphite">Final Readings</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label htmlFor="duration_hours" className="block text-sm font-medium text-graphite mb-2">Duration (hours)</label>
              <input id="duration_hours" type="number" step="1" value={d.durationHours} onChange={(e) => d.setDurationHours(parseInt(e.target.value) || 0)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="final_brix" className="block text-sm font-medium text-graphite mb-2">Final Brix</label>
              <input id="final_brix" type="number" step="0.1" value={d.finalBrix} onChange={(e) => d.setFinalBrix(parseFloat(e.target.value) || 0)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="final_ph" className="block text-sm font-medium text-graphite mb-2">Final pH</label>
              <input id="final_ph" type="number" step="0.01" value={d.finalPH} onChange={(e) => d.setFinalPH(parseFloat(e.target.value) || 0)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="final_abv" className="block text-sm font-medium text-graphite mb-2">Final ABV (%)</label>
              <input id="final_abv" type="number" step="0.1" value={d.finalABV} onChange={(e) => d.setFinalABV(parseFloat(e.target.value) || 0)} className={inputClass} />
            </div>
          </div>
          <div>
            <label htmlFor="fermentation_notes" className="block text-sm font-medium text-graphite mb-2">Notes</label>
            <textarea id="fermentation_notes" value={d.notes} onChange={(e) => d.setNotes(e.target.value)} rows={3}
              placeholder="Fermentation observations, aromas, temperature control..." className={inputClass} />
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={d.handleSubmit} className="px-8 py-3 bg-copper text-white rounded-lg hover:bg-copper/90 font-medium shadow-md transition-all">
            Save & Continue to Distillation →
          </button>
        </div>
      </div>
    </div>
  )
}
