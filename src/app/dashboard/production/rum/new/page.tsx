"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RumCaneSpiritBatch } from "@/types/production-schemas"
import { RumProductionForm } from "@/modules/production/components/RumProductionForm"

export default function NewRumBatchPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [batch, setBatch] = useState<RumCaneSpiritBatch | null>(null)

  // Initialize batch on client side only to avoid hydration mismatch
  useEffect(() => {
    setBatch({
      id: `DRAFT-${Date.now()}`,
      productType: 'rum',
      status: 'draft',
      createdAt: new Date().toISOString(),
      lastEditedAt: new Date().toISOString(),

      // Fermentation - Required fields (use undefined for numeric fields to show empty)
      batch_name: '',
      fermentation_date: new Date().toISOString().split('T')[0],
      substrates: [],
      water_volume_l: undefined,
      initial_brix: undefined,
      initial_ph: undefined,
      yeast_type: '',
      yeast_mass_g: undefined,
      fermentation_readings: [],
      final_brix: undefined,
      final_ph: undefined,

      // Distillation - Initialize with empty values
      distillation_date: '',
      boiler_volume_l: undefined,
      boiler_abv_percent: undefined,
      boiler_lal: undefined,
      heads_added_volume_l: undefined,
      heads_added_abv_percent: undefined,
      heads_added_lal: undefined,
      retort1_volume_l: undefined,
      retort1_abv_percent: undefined,
      retort1_lal: undefined,
      retort2_volume_l: undefined,
      retort2_abv_percent: undefined,
      retort2_lal: undefined,
      foreshots_volume_l: undefined,
      heads_cut_volume_l: undefined,
      heads_cut_abv_percent: undefined,
      heads_cut_lal: undefined,
      hearts_volume_l: undefined,
      hearts_abv_percent: undefined,
      hearts_lal: undefined,
      early_tails_volume_l: undefined,
      early_tails_total_abv_percent: undefined,
      early_tails_lal: undefined,
      late_tails_volume_l: undefined,
      late_tails_total_abv_percent: undefined,
      late_tails_lal: undefined,
    } as RumCaneSpiritBatch)
  }, [])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      // TODO: Save to Supabase
      const response = await fetch('/api/production/rum/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch)
      })

      if (!response.ok) {
        throw new Error('Failed to save batch')
      }

      const savedBatch = await response.json()
      
      // Redirect to edit page
      router.push(`/dashboard/production/rum/edit/${savedBatch.id}`)
    } catch (error) {
      console.error('Error saving batch:', error)
      alert('Failed to save batch. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">New Rum / Cane Spirit Batch</h1>
            <p className="text-sm text-stone-500 mt-1">
              Fermentation → Distillation → Barrel Aging
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm text-stone-700 border border-stone-300 rounded-md hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm text-white bg-amber-700 rounded-md hover:bg-amber-800 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-7xl mx-auto p-6">
        {!batch ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-stone-600">Loading...</div>
          </div>
        ) : (
          <RumProductionForm
            batch={batch}
            onUpdate={setBatch}
            onSave={handleSave}
            isSaving={isSaving}
          />
        )}
      </div>
    </div>
  )
}

