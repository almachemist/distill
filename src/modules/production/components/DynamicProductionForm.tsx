'use client'

import { useState } from 'react'
import type { GinVodkaSpiritBatch } from '@/types/production-schemas'
import type { Recipe, GinVodkaSpiritRecipe } from '@/types/recipe-schemas'
import {
  RunDetailsSection,
  ChargeAdjustmentSection,
  StillSetupSection,
  CollectionPhasesSection,
  DilutionSection,
  FinalProductSection,
} from './production-form'

interface DynamicProductionFormProps {
  batch: GinVodkaSpiritBatch
  recipe?: Recipe | null
  onUpdate: (batch: GinVodkaSpiritBatch) => void
  onSave: () => void
  isSaving: boolean
}

export function DynamicProductionForm({ batch, recipe, onUpdate, onSave, isSaving }: DynamicProductionFormProps) {
  const [activeSection, setActiveSection] = useState<number>(1)

  const sections = [
    { id: 1, name: 'Run Details' },
    { id: 2, name: 'Charge Adjustment' },
    { id: 3, name: 'Still Setup' },
    { id: 4, name: 'Collection Phases' },
    { id: 5, name: 'Dilution' },
    { id: 6, name: 'Final Product' },
  ]

  const recipeBotanicals = recipe && 'botanicals' in recipe ? (recipe as GinVodkaSpiritRecipe).botanicals : null

  function updateField(field: string, value: any) {
    onUpdate({ ...batch, [field]: value })
  }

  function updateNestedField(section: string, field: string, value: any) {
    onUpdate({
      ...batch,
      [section]: {
        ...(batch as any)[section],
        [field]: value,
      },
    })
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar Navigation */}
      <div className="w-64 flex-shrink-0">
        <nav className="space-y-1 sticky top-6">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`
                w-full text-left px-4 py-3 rounded-lg transition-colors
                ${
                  activeSection === section.id
                    ? 'bg-amber-50 text-amber-900 border-l-4 border-amber-600'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }
              `}
            >
              <span className="font-medium">{section.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Form Content */}
      <div className="flex-1">
        <div className="bg-white rounded-lg border border-neutral-200 p-8">
          {activeSection === 1 && <RunDetailsSection batch={batch} updateField={updateField} />}
          {activeSection === 2 && <ChargeAdjustmentSection batch={batch} updateNestedField={updateNestedField} />}
          {activeSection === 3 && <StillSetupSection batch={batch} recipeBotanicals={recipeBotanicals} updateField={updateField} updateNestedField={updateNestedField} />}
          {activeSection === 4 && <CollectionPhasesSection batch={batch} updateField={updateField} />}
          {activeSection === 5 && <DilutionSection batch={batch} updateField={updateField} />}
          {activeSection === 6 && <FinalProductSection batch={batch} updateField={updateField} updateNestedField={updateNestedField} />}

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-neutral-200 flex justify-between">
            <button
              onClick={() => setActiveSection(Math.max(1, activeSection - 1))}
              disabled={activeSection === 1}
              className="px-4 py-2 text-sm text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-6 py-2 text-sm font-medium text-white bg-amber-700 rounded-md hover:bg-amber-800 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>

            <button
              onClick={() => setActiveSection(Math.min(6, activeSection + 1))}
              disabled={activeSection === 6}
              className="px-4 py-2 text-sm text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
