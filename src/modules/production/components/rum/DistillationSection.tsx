"use client"

import { RumCaneSpiritBatch } from "@/types/production-schemas"
import {
  BoilerSection,
  HeadsAddedSection,
  RetortSection,
  PowerTimingSection,
  FirstSpiritSection,
  PowerAdjustmentsSection,
  ForeshotsSection,
  HeadsCutSection,
  HeartsCutSection,
  EarlyTailsSection,
  LateTailsSection,
  DilutionSection,
  DistillationSummary,
} from './sections'

interface DistillationSectionProps {
  batch: RumCaneSpiritBatch
  updateField: <K extends keyof RumCaneSpiritBatch>(field: K, value: RumCaneSpiritBatch[K]) => void
}

export function DistillationSection({ batch, updateField }: DistillationSectionProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-stone-900 mb-6">Distillation (Double Retort - Roberta)</h2>
        <p className="text-sm text-stone-600 mb-6">
          All distillation information for the Double Retort still. Can be completed over multiple days.
        </p>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="batch_name" className="block text-sm font-medium text-stone-700 mb-2">
            Batch Name
          </label>
          <input
            type="text"
            id="batch_name"
            value={batch.batch_name ?? ''}
            disabled
            className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-stone-600"
          />
          <p className="text-xs text-stone-500 mt-1">
            From fermentation
          </p>
        </div>

        <div>
          <label htmlFor="distillation_date" className="block text-sm font-medium text-stone-700 mb-2">
            Distillation Date
          </label>
          <input
            type="date"
            id="distillation_date"
            value={batch.distillation_date ?? ''}
            onChange={(e) => updateField('distillation_date', e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>
      </div>

      <BoilerSection batch={batch} updateField={updateField} />
      <HeadsAddedSection batch={batch} updateField={updateField} />
      <RetortSection batch={batch} updateField={updateField} retortNumber={1} />
      <RetortSection batch={batch} updateField={updateField} retortNumber={2} />
      <PowerTimingSection batch={batch} updateField={updateField} />
      <FirstSpiritSection batch={batch} updateField={updateField} />
      <PowerAdjustmentsSection batch={batch} updateField={updateField} />
      <ForeshotsSection batch={batch} updateField={updateField} />
      <HeadsCutSection batch={batch} updateField={updateField} />
      <HeartsCutSection batch={batch} updateField={updateField} />
      <EarlyTailsSection batch={batch} updateField={updateField} />
      <LateTailsSection batch={batch} updateField={updateField} />
      <DilutionSection batch={batch} updateField={updateField} />
      <DistillationSummary batch={batch} />
    </div>
  )
}
