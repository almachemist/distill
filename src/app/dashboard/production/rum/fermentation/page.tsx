"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RumFermentationPage() {
  const router = useRouter()

  // Form state
  const [batchId, setBatchId] = useState('')
  const [productName, setProductName] = useState('Pineapple Rum')
  const [productType, setProductType] = useState<'rum' | 'cane_spirit'>('rum')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

  // Substrate
  const [substrateType, setSubstrateType] = useState('C Molasses')
  const [substrateBatch, setSubstrateBatch] = useState('')
  const [substrateMassKg, setSubstrateMassKg] = useState(400)
  const [waterMassKg, setWaterMassKg] = useState(1500)
  const [initialBrix, setInitialBrix] = useState(26.6)
  const [initialPH, setInitialPH] = useState(5.14)

  // Dunder
  const [dunderAdded, setDunderAdded] = useState(false)
  const [dunderType, setDunderType] = useState('clean')
  const [dunderVolumeL, setDunderVolumeL] = useState(100)
  const [dunderPH, setDunderPH] = useState<number | null>(null)

  // Additives
  const [antiFoamML, setAntiFoamML] = useState(100)
  const [citricAcidG, setCitricAcidG] = useState<number | null>(null)
  const [fermaidG, setFermaidG] = useState(1000)
  const [dapG, setDapG] = useState<number | null>(null)
  const [calciumCarbonateG, setCalciumCarbonateG] = useState<number | null>(null)
  const [additionalNutrients, setAdditionalNutrients] = useState('')

  // Yeast
  const [yeastType, setYeastType] = useState('Distillamax RM')
  const [yeastMassG, setYeastMassG] = useState(1000)
  const [yeastRehydrationTempC, setYeastRehydrationTempC] = useState(37.5)
  const [yeastRehydrationTimeMin, setYeastRehydrationTimeMin] = useState(15)

  // Fermentation curves (24h intervals)
  const [tempCurve, setTempCurve] = useState({
    '0h': 24.2,
    '24h': 29.3,
    '48h': 29.8,
    '72h': 27.6,
    '96h': 27.6
  })

  const [brixCurve, setBrixCurve] = useState({
    '0h': 26.6,
    '24h': 14.9,
    '48h': 10.8,
    '72h': 9.6,
    '96h': 9.3
  })

  const [phCurve, setPhCurve] = useState({
    '0h': 5.14,
    '24h': 4.92,
    '48h': 4.89,
    '72h': 4.86,
    '96h': 4.88
  })

  const [durationHours, setDurationHours] = useState(96)
  const [finalBrix, setFinalBrix] = useState(9.3)
  const [finalPH, setFinalPH] = useState(4.88)
  const [finalABV, setFinalABV] = useState(9.6)
  const [notes, setNotes] = useState('')

  const handleSubmit = () => {
    if (!batchId) {
      alert('Please enter a Batch ID')
      return
    }

    const fermentationData = {
      batchId,
      productName,
      productType,
      startDate,
      substrateType,
      substrateBatch,
      substrateMassKg,
      waterMassKg,
      initialBrix,
      initialPH,
      dunderAdded,
      dunderType: dunderAdded ? dunderType : null,
      dunderVolumeL: dunderAdded ? dunderVolumeL : null,
      dunderPH: dunderAdded ? dunderPH : null,
      antiFoamML,
      citricAcidG,
      fermaidG,
      dapG,
      calciumCarbonateG,
      additionalNutrients,
      yeastType,
      yeastMassG,
      yeastRehydrationTempC,
      yeastRehydrationTimeMin,
      temperatureCurve: tempCurve,
      brixCurve,
      phCurve,
      durationHours,
      finalBrix,
      finalPH,
      finalABV,
      notes
    }

    localStorage.setItem('rum_fermentation', JSON.stringify(fermentationData))
    
    // Navigate to double retort distillation
    router.push(`/dashboard/production/rum/distillation?batchId=${batchId}`)
  }

  const updateCurve = (curve: any, setCurve: any, key: string, value: number) => {
    setCurve({ ...curve, [key]: value })
  }

  return (
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <div className="text-sm text-graphite/60">
          <span>Production</span>
          <span className="mx-2">→</span>
          <span>Rum Production</span>
          <span className="mx-2">→</span>
          <span className="font-medium text-copper">Fermentation</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-graphite mb-2">Rum Fermentation</h1>
          <p className="text-graphite/70">
            Start a new fermentation cycle for rum or cane spirit production
          </p>
          <p className="text-sm text-graphite/60 mt-2">
            Still: <span className="font-mono font-medium text-copper">Roberta (Double Retort)</span>
          </p>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-graphite">Batch Information</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Batch ID</label>
              <input
                type="text"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                placeholder="RUM-24-5"
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Product Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Pineapple Rum"
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Product Type</label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value as 'rum' | 'cane_spirit')}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              >
                <option value="rum">Rum</option>
                <option value="cane_spirit">Cane Spirit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>
          </div>
        </div>

        {/* Substrate */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-graphite">Substrate</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Type</label>
              <select
                value={substrateType}
                onChange={(e) => setSubstrateType(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              >
                <option value="C Molasses">C Molasses</option>
                <option value="Blackstrap Molasses">Blackstrap Molasses</option>
                <option value="Cane Juice">Cane Juice</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Batch/Year</label>
              <input
                type="text"
                value={substrateBatch}
                onChange={(e) => setSubstrateBatch(e.target.value)}
                placeholder="2021"
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Mass (kg)</label>
              <input
                type="number"
                step="0.1"
                value={substrateMassKg}
                onChange={(e) => setSubstrateMassKg(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Water (kg)</label>
              <input
                type="number"
                step="0.1"
                value={waterMassKg}
                onChange={(e) => setWaterMassKg(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Initial Brix</label>
              <input
                type="number"
                step="0.1"
                value={initialBrix}
                onChange={(e) => setInitialBrix(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Initial pH</label>
              <input
                type="number"
                step="0.01"
                value={initialPH}
                onChange={(e) => setInitialPH(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>
          </div>
        </div>

        {/* Dunder */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={dunderAdded}
              onChange={(e) => setDunderAdded(e.target.checked)}
              className="w-5 h-5 text-copper focus:ring-copper border-copper-30 rounded"
            />
            <h2 className="text-xl font-semibold text-graphite">Dunder Added</h2>
          </div>

          {dunderAdded && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-graphite mb-2">Type</label>
                <input
                  type="text"
                  value={dunderType}
                  onChange={(e) => setDunderType(e.target.value)}
                  placeholder="clean, sour, etc."
                  className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">Volume (L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dunderVolumeL}
                  onChange={(e) => setDunderVolumeL(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">pH (optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={dunderPH || ''}
                  onChange={(e) => setDunderPH(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="pH"
                  className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
                />
              </div>
            </div>
          )}
        </div>

        {/* Additives */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-graphite">Additives & Nutrients</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Anti-Foam (mL)</label>
              <input
                type="number"
                step="1"
                value={antiFoamML || ''}
                onChange={(e) => setAntiFoamML(e.target.value ? parseFloat(e.target.value) : 0)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Citric Acid (g)</label>
              <input
                type="number"
                step="0.1"
                value={citricAcidG || ''}
                onChange={(e) => setCitricAcidG(e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Fermaid (g)</label>
              <input
                type="number"
                step="1"
                value={fermaidG || ''}
                onChange={(e) => setFermaidG(e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">DAP (g)</label>
              <input
                type="number"
                step="1"
                value={dapG || ''}
                onChange={(e) => setDapG(e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Calcium Carbonate (g)</label>
              <input
                type="number"
                step="1"
                value={calciumCarbonateG || ''}
                onChange={(e) => setCalciumCarbonateG(e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite mb-2">Additional Nutrients</label>
            <textarea
              value={additionalNutrients}
              onChange={(e) => setAdditionalNutrients(e.target.value)}
              rows={2}
              placeholder="Added 250 g nutrient mid-ferment..."
              className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
            />
          </div>
        </div>

        {/* Yeast */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-graphite">Yeast</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Yeast Type</label>
              <input
                type="text"
                value={yeastType}
                onChange={(e) => setYeastType(e.target.value)}
                placeholder="Distillamax RM"
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Mass (g)</label>
              <input
                type="number"
                step="1"
                value={yeastMassG}
                onChange={(e) => setYeastMassG(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Rehydration Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={yeastRehydrationTempC}
                onChange={(e) => setYeastRehydrationTempC(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Rehydration Time (min)</label>
              <input
                type="number"
                step="1"
                value={yeastRehydrationTimeMin}
                onChange={(e) => setYeastRehydrationTimeMin(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>
          </div>
        </div>

        {/* Fermentation Curves */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold text-graphite">Fermentation Curves (24h intervals)</h2>
          
          {/* Temperature Curve */}
          <div>
            <h3 className="font-medium text-graphite mb-3">Temperature (°C)</h3>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(tempCurve).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-graphite/70 mb-1">{key}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={value}
                    onChange={(e) => updateCurve(tempCurve, setTempCurve, key, parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Brix Curve */}
          <div>
            <h3 className="font-medium text-graphite mb-3">Brix</h3>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(brixCurve).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-graphite/70 mb-1">{key}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={value}
                    onChange={(e) => updateCurve(brixCurve, setBrixCurve, key, parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* pH Curve */}
          <div>
            <h3 className="font-medium text-graphite mb-3">pH</h3>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(phCurve).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-graphite/70 mb-1">{key}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={value}
                    onChange={(e) => updateCurve(phCurve, setPhCurve, key, parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final Readings */}
        <div className="bg-gradient-to-br from-copper-10 to-copper-20 rounded-xl border border-copper-30 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-graphite">Final Readings</h2>
          
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Duration (hours)</label>
              <input
                type="number"
                step="1"
                value={durationHours}
                onChange={(e) => setDurationHours(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Final Brix</label>
              <input
                type="number"
                step="0.1"
                value={finalBrix}
                onChange={(e) => setFinalBrix(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Final pH</label>
              <input
                type="number"
                step="0.01"
                value={finalPH}
                onChange={(e) => setFinalPH(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-2">Final ABV (%)</label>
              <input
                type="number"
                step="0.1"
                value={finalABV}
                onChange={(e) => setFinalABV(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Fermentation observations, aromas, temperature control..."
              className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-copper text-white rounded-lg hover:bg-copper/90 font-medium shadow-md transition-all"
          >
            Save & Continue to Distillation →
          </button>
        </div>
      </div>
    </div>
  )
}

