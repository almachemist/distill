"use client"

import { RumCaneSpiritBatch } from "@/types/production-schemas"
import { formatPH, formatDecimal, parseToNumber, validateOnBlur } from "./fermentation-format-utils"
import { SubstratesEditor } from "./SubstratesEditor"
import { FermentationReadingsTable } from "./FermentationReadingsTable"

interface FermentationSectionProps {
  batch: RumCaneSpiritBatch
  updateField: <K extends keyof RumCaneSpiritBatch>(field: K, value: RumCaneSpiritBatch[K]) => void
}

export function FermentationSection({ batch, updateField }: FermentationSectionProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-stone-900 mb-6">Fermentation</h2>
        <p className="text-sm text-stone-600 mb-6">
          Track all fermentation parameters from start to finish. All fields can be left blank if data is not available.
        </p>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label htmlFor="batch_name" className="block text-sm font-medium text-stone-700 mb-2">
            Batch Name <span className="text-red-600">*</span>
          </label>
          <input type="text" id="batch_name" value={batch.batch_name ?? ''}
            onChange={(e) => updateField('batch_name', e.target.value)}
            placeholder="e.g., RUM-2025-001"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
          <p className="text-xs text-stone-500 mt-1">This name will follow through all phases</p>
        </div>
        <div>
          <label htmlFor="fermentation_date" className="block text-sm font-medium text-stone-700 mb-2">Date</label>
          <input type="date" id="fermentation_date" value={batch.fermentation_date ?? ''}
            onChange={(e) => updateField('fermentation_date', e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
        </div>
        <div>
          <label htmlFor="fermentation_day" className="block text-sm font-medium text-stone-700 mb-2">Day</label>
          <input type="number" id="fermentation_day" value={batch.fermentation_day ?? ''}
            onChange={(e) => updateField('fermentation_day', parseInt(e.target.value) || undefined)}
            placeholder="1"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
        </div>
      </div>

      {/* Substrates */}
      <SubstratesEditor batch={batch} updateField={updateField} />

      {/* Water */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="water_volume_l" className="block text-sm font-medium text-stone-700 mb-2">Water Volume Added (L)</label>
          <input type="number" step="0.1" id="water_volume_l" value={batch.water_volume_l ?? ''}
            onChange={(e) => updateField('water_volume_l', parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
        </div>
      </div>

      {/* Dunder */}
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label htmlFor="dunder_batch" className="block text-sm font-medium text-stone-700 mb-2">Dunder Batch</label>
          <input type="text" id="dunder_batch" value={batch.dunder_batch ?? ''}
            onChange={(e) => updateField('dunder_batch', e.target.value)}
            placeholder="e.g., DUNDER-001"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
        </div>
        <div>
          <label htmlFor="dunder_volume_l" className="block text-sm font-medium text-stone-700 mb-2">Dunder Volume (L)</label>
          <input type="number" step="0.1" id="dunder_volume_l" value={batch.dunder_volume_l ?? ''}
            onChange={(e) => updateField('dunder_volume_l', parseFloat(e.target.value) || undefined)}
            placeholder="0"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
        </div>
        <div>
          <label htmlFor="dunder_ph" className="block text-sm font-medium text-stone-700 mb-2">Dunder pH</label>
          <input type="text" id="dunder_ph" value={batch.dunder_ph ?? ''}
            onChange={(e) => {
              const formatted = formatPH(e.target.value)
              updateField('dunder_ph', formatted ? parseFloat(formatted) : undefined)
            }}
            onBlur={(e) => {
              const validated = validateOnBlur(e.target.value, 14, 2)
              updateField('dunder_ph', parseToNumber(validated))
            }}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
        </div>
      </div>

      {/* Initial Conditions */}
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label htmlFor="initial_brix" className="block text-sm font-medium text-stone-700 mb-2">Initial Brix</label>
          <input type="text" id="initial_brix" value={batch.initial_brix ?? ''}
            onChange={(e) => {
              const formatted = formatDecimal(e.target.value)
              updateField('initial_brix', formatted ? parseFloat(formatted) : 0)
            }}
            onBlur={(e) => {
              const validated = validateOnBlur(e.target.value, 40)
              updateField('initial_brix', (parseToNumber(validated) ?? 0))
            }}
            placeholder="0.0"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
        </div>
        <div>
          <label htmlFor="initial_ph" className="block text-sm font-medium text-stone-700 mb-2">Initial pH</label>
          <input type="text" id="initial_ph" value={batch.initial_ph ?? ''}
            onChange={(e) => {
              const formatted = formatPH(e.target.value)
              updateField('initial_ph', formatted ? parseFloat(formatted) : 0)
            }}
            onBlur={(e) => {
              const validated = validateOnBlur(e.target.value, 14, 2)
              updateField('initial_ph', (parseToNumber(validated) ?? 0))
            }}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
        </div>
        <div>
          <label htmlFor="initial_temperature_c" className="block text-sm font-medium text-stone-700 mb-2">Initial Temperature (°C)</label>
          <input type="text" id="initial_temperature_c" value={batch.initial_temperature_c ?? ''}
            onChange={(e) => {
              const formatted = formatDecimal(e.target.value)
              updateField('initial_temperature_c', formatted ? parseFloat(formatted) : undefined)
            }}
            onBlur={(e) => {
              const validated = validateOnBlur(e.target.value, 99.9, 1)
              updateField('initial_temperature_c', parseToNumber(validated))
            }}
            placeholder="0.0"
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
        </div>
      </div>

      {/* Temperature Control */}
      <div>
        <label htmlFor="temperature_control_settings" className="block text-sm font-medium text-stone-700 mb-2">Temperature Control Settings</label>
        <input type="text" id="temperature_control_settings" value={batch.temperature_control_settings ?? ''}
          onChange={(e) => updateField('temperature_control_settings', e.target.value)}
          placeholder="e.g., 28-30°C"
          className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
      </div>

      {/* Yeast */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Yeast</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="yeast_type" className="block text-sm font-medium text-stone-700 mb-2">Yeast Type</label>
            <input type="text" id="yeast_type" value={batch.yeast_type ?? ''}
              onChange={(e) => updateField('yeast_type', e.target.value)}
              placeholder="e.g., SafSpirit M-1"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
          </div>
          <div>
            <label htmlFor="yeast_mass_g" className="block text-sm font-medium text-stone-700 mb-2">Yeast Mass Added (g)</label>
            <input type="number" step="0.1" id="yeast_mass_g" value={batch.yeast_mass_g ?? ''}
              onChange={(e) => updateField('yeast_mass_g', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
          </div>
          <div>
            <label htmlFor="yeast_rehydration_temperature_c" className="block text-sm font-medium text-stone-700 mb-2">Yeast Rehydration Temperature (°C)</label>
            <input type="text" id="yeast_rehydration_temperature_c" value={batch.yeast_rehydration_temperature_c ?? ''}
              onChange={(e) => {
                const formatted = formatDecimal(e.target.value)
                updateField('yeast_rehydration_temperature_c', formatted ? parseFloat(formatted) : undefined)
              }}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 99.9, 1)
                updateField('yeast_rehydration_temperature_c', parseToNumber(validated))
              }}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
          </div>
          <div>
            <label htmlFor="yeast_rehydration_time_min" className="block text-sm font-medium text-stone-700 mb-2">Yeast Rehydration Time (min)</label>
            <input type="number" step="1" id="yeast_rehydration_time_min" value={batch.yeast_rehydration_time_min ?? ''}
              onChange={(e) => updateField('yeast_rehydration_time_min', parseInt(e.target.value) || undefined)}
              placeholder="0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
          </div>
        </div>
      </div>

      {/* Chemicals & Nutrients */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Chemicals & Nutrients</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="chems_added" className="block text-sm font-medium text-stone-700 mb-2">Chems Added</label>
            <input type="text" id="chems_added" value={batch.chems_added ?? ''}
              onChange={(e) => updateField('chems_added', e.target.value)}
              placeholder="e.g., Citric Acid 50g"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
          </div>
          <div>
            <label htmlFor="nutrients_added" className="block text-sm font-medium text-stone-700 mb-2">Nutrients Added</label>
            <input type="text" id="nutrients_added" value={batch.nutrients_added ?? ''}
              onChange={(e) => updateField('nutrients_added', e.target.value)}
              placeholder="e.g., DAP 100g, Fermaid 50g"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
          </div>
        </div>
      </div>

      {/* Fermentation Monitoring */}
      <FermentationReadingsTable batch={batch} updateField={updateField} />

      {/* Final Fermentation */}
      <div className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Final Fermentation</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label htmlFor="final_brix" className="block text-sm font-medium text-stone-700 mb-2">Final Brix</label>
            <input type="text" id="final_brix" value={batch.final_brix ?? ''}
              onChange={(e) => {
                const formatted = formatDecimal(e.target.value)
                updateField('final_brix', formatted ? parseFloat(formatted) : 0)
              }}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 40)
                updateField('final_brix', (parseToNumber(validated) ?? 0))
              }}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
          </div>
          <div>
            <label htmlFor="final_ph" className="block text-sm font-medium text-stone-700 mb-2">Final pH</label>
            <input type="text" id="final_ph" value={batch.final_ph ?? ''}
              onChange={(e) => {
                const formatted = formatPH(e.target.value)
                updateField('final_ph', formatted ? parseFloat(formatted) : 0)
              }}
              onBlur={(e) => {
                const validated = validateOnBlur(e.target.value, 14, 2)
                updateField('final_ph', (parseToNumber(validated) ?? 0))
              }}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
          </div>
        </div>
      </div>
    </div>
  )
}
