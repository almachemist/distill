"use client"

import { useState, useEffect } from "react"
import { RumCaneSpiritBatch } from "@/types/production-schemas"
import { FermentationSection } from "./rum/FermentationSection"
import { DistillationSection } from "./rum/DistillationSection"
import { BarrelAgingSection } from "./rum/BarrelAgingSection"

interface RumProductionFormProps {
  batch: RumCaneSpiritBatch
  onUpdate: (batch: RumCaneSpiritBatch) => void
  onSave: () => void
  isSaving: boolean
}

export function RumProductionForm({ batch, onUpdate, onSave, isSaving }: RumProductionFormProps) {
  const [activeSection, setActiveSection] = useState<number>(1)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sections = [
    { id: 1, name: 'Fermentation' },
    { id: 2, name: 'Distillation' },
    { id: 3, name: 'Barrel Aging' }
  ]

  const updateField = <K extends keyof RumCaneSpiritBatch>(
    field: K,
    value: RumCaneSpiritBatch[K]
  ) => {
    onUpdate({
      ...batch,
      [field]: value,
      updatedAt: new Date().toISOString()
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-stone-200">
      {/* Section Navigation */}
      <div className="border-b border-stone-200 px-6 py-4">
        <div className="flex gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                activeSection === section.id
                  ? 'bg-amber-700 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {section.name}
            </button>
          ))}
        </div>
      </div>

      {/* Section Content */}
      <div className="p-6">
        {activeSection === 1 && (
          <FermentationSection
            batch={batch}
            updateField={updateField}
          />
        )}

        {activeSection === 2 && (
          <DistillationSection
            batch={batch}
            updateField={updateField}
          />
        )}

        {activeSection === 3 && (
          <BarrelAgingSection
            batch={batch}
            updateField={updateField}
          />
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-stone-200 px-6 py-4 bg-stone-50 flex justify-between items-center">
        <div className="text-sm text-stone-600">
          {mounted ? `Last updated: ${new Date(batch.updatedAt).toLocaleString('en-AU')}` : 'Last updated: ...'}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (activeSection > 1) setActiveSection(activeSection - 1)
            }}
            disabled={activeSection === 1}
            className="px-4 py-2 text-sm text-stone-700 border border-stone-300 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => {
              if (activeSection < 3) setActiveSection(activeSection + 1)
            }}
            disabled={activeSection === 3}
            className="px-4 py-2 text-sm text-white bg-stone-700 rounded-md hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-6 py-2 text-sm text-white bg-amber-700 rounded-md hover:bg-amber-800 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
      </div>
    </div>
  )
}

