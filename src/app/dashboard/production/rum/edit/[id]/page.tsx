"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { RumCaneSpiritBatch } from "@/types/production-schemas"
import { RumProductionForm } from "@/modules/production/components/RumProductionForm"

export default function EditRumBatchPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [batch, setBatch] = useState<RumCaneSpiritBatch | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)

  // Load batch from API
  useEffect(() => {
    const loadBatch = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/production/rum/batches/${id}`)
        
        if (!response.ok) {
          throw new Error('Failed to load batch')
        }

        const data = await response.json()

        // Map database fields to TypeScript interface
        // Handle both database format and fallback format
        const mappedBatch: RumCaneSpiritBatch = {
          id: data.id || data.batch_id,
          productType: data.product_type ?? data.productType ?? 'rum',
          status: data.status ?? 'draft',
          createdAt: data.created_at ?? data.createdAt,
          lastEditedAt: data.updated_at ?? data.lastEditedAt ?? new Date().toISOString(),

          // Stage-based Status
          fermentation_status: data.fermentation_status ?? 'not_started',
          distillation_status: data.distillation_status ?? 'not_started',
          aging_status: data.aging_status ?? 'not_started',
          bottling_status: data.bottling_status ?? 'not_started',
          overall_status: data.overall_status ?? 'draft',

          // Fermentation
          batch_name: data.batch_name ?? data.batch_id ?? '',
          fermentation_date: data.fermentation_date ?? data.fermentation_start_date ?? '',
          fermentation_day: data.fermentation_day,
          substrates: data.substrates ?? [],
          water_volume_l: data.water_volume_l ?? 0,
          dunder_batch: data.dunder_batch,
          dunder_volume_l: data.dunder_volume_l,
          dunder_ph: data.dunder_ph,
          initial_brix: data.initial_brix ?? 0,
          initial_ph: data.initial_ph ?? 0,
          initial_temperature_c: data.initial_temperature_c,
          temperature_control_settings: data.temperature_control_settings,
          yeast_type: data.yeast_type ?? '',
          yeast_mass_g: data.yeast_mass_g ?? 0,
          yeast_rehydration_temperature_c: data.yeast_rehydration_temperature_c,
          yeast_rehydration_time_min: data.yeast_rehydration_time_min,
          chems_added: data.chems_added,
          nutrients_added: data.nutrients_added,
          fermentation_readings: data.fermentation_readings ?? [],
          final_brix: data.final_brix ?? 0,
          final_ph: data.final_ph ?? 0,
          calculated_abv_percent: data.calculated_abv_percent,
          
          // Distillation
          distillation_date: data.distillation_date,
          boiler_volume_l: data.boiler_volume_l,
          boiler_abv_percent: data.boiler_abv_percent,
          boiler_lal: data.boiler_lal,
          heads_added_volume_l: data.heads_added_volume_l,
          heads_added_abv_percent: data.heads_added_abv_percent,
          heads_added_lal: data.heads_added_lal,
          retort1_content: data.retort1_content,
          retort1_volume_l: data.retort1_volume_l,
          retort1_abv_percent: data.retort1_abv_percent,
          retort1_lal: data.retort1_lal,
          retort2_content: data.retort2_content,
          retort2_volume_l: data.retort2_volume_l,
          retort2_abv_percent: data.retort2_abv_percent,
          retort2_lal: data.retort2_lal,
          power_input_boiler_a: data.power_input_boiler_a,
          still_heat_starting_time: data.still_heat_starting_time,
          power_input_r1_a: data.power_input_r1_a,
          r1_heat_starting_time: data.r1_heat_starting_time,
          power_input_r2_a: data.power_input_r2_a,
          r2_heat_starting_time: data.r2_heat_starting_time,
          first_spirit_pot_temperature_c: data.first_spirit_pot_temperature_c,
          r1_temperature_c: data.r1_temperature_c,
          r2_temperature_c: data.r2_temperature_c,
          first_spirit_time: data.first_spirit_time,
          first_spirit_abv_percent: data.first_spirit_abv_percent,
          first_spirit_density: data.first_spirit_density,
          power_input_pot_a: data.power_input_pot_a,
          r1_power_input_a: data.r1_power_input_a,
          r2_power_input_a: data.r2_power_input_a,
          flow_l_per_h: data.flow_l_per_h,
          foreshots_volume_l: data.foreshots_volume_l,
          foreshots_abv_percent: data.foreshots_abv_percent,
          heads_cut_time: data.heads_cut_time,
          heads_cut_abv_percent: data.heads_cut_abv_percent,
          heads_cut_volume_l: data.heads_cut_volume_l,
          heads_cut_lal: data.heads_cut_lal,
          heads_cut_density: data.heads_cut_density,
          hearts_cut_time: data.hearts_cut_time,
          hearts_cut_density: data.hearts_cut_density,
          hearts_cut_abv_percent: data.hearts_cut_abv_percent,
          hearts_volume_l: data.hearts_volume_l,
          hearts_abv_percent: data.hearts_abv_percent,
          hearts_lal: data.hearts_lal,
          hearts_density: data.hearts_density,
          power_input_changed_to: data.power_input_changed_to,
          early_tails_cut_time: data.early_tails_cut_time,
          early_tails_cut_abv_percent: data.early_tails_cut_abv_percent,
          early_tails_total_abv_percent: data.early_tails_total_abv_percent,
          early_tails_volume_l: data.early_tails_volume_l,
          early_tails_lal: data.early_tails_lal,
          early_tails_density: data.early_tails_density,
          power_input_changed_to_2: data.power_input_changed_to_2,
          late_tails_cut_time: data.late_tails_cut_time,
          late_tails_cut_abv_percent: data.late_tails_cut_abv_percent,
          late_tails_total_abv_percent: data.late_tails_total_abv_percent,
          late_tails_volume_l: data.late_tails_volume_l,
          late_tails_lal: data.late_tails_lal,
          late_tails_density: data.late_tails_density,
          water_added_for_dilution_l: data.water_added_for_dilution_l,
          final_abv_after_dilution_percent: data.final_abv_after_dilution_percent,
          final_volume_after_dilution_l: data.final_volume_after_dilution_l,
          
          // Barrel Aging
          barrel_aging_batch_name: data.barrel_aging_batch_name,
          fill_date: data.fill_date,
          cask_number: data.cask_number,
          cask_type: data.cask_type,
          cask_size_l: data.cask_size_l,
          fill_abv_percent: data.fill_abv_percent,
          volume_filled_l: data.volume_filled_l,
          lal_filled: data.lal_filled,
          maturation_location: data.maturation_location,
          expected_bottling_date: data.expected_bottling_date,
          barrel_aging_notes: data.barrel_aging_notes,
        }
        
        setBatch(mappedBatch)
      } catch (error) {
        console.error('Error loading batch:', error)
        alert('Failed to load batch. Redirecting to list.')
        router.push('/dashboard/production/rum')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      loadBatch()
    }
  }, [id, router])

  const handleSave = async () => {
    if (!batch) return

    try {
      setIsSaving(true)

      const response = await fetch(`/api/production/rum/batches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...batch,
          lastEditedAt: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save batch')
      }

      // Show status selection modal
      setShowStatusModal(true)
    } catch (error) {
      console.error('Error saving batch:', error)
      alert('Failed to save batch. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusUpdate = async (newStatus: 'in_progress' | 'completed') => {
    if (!batch) return

    try {
      // Update status in database
      const response = await fetch(`/api/production/rum/batches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...batch,
          status: newStatus,
          lastEditedAt: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      // Redirect based on status
      if (newStatus === 'in_progress') {
        router.push('/dashboard/production/rum?filter=ongoing')
      } else {
        router.push('/dashboard/production/rum?filter=completed')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status. Please try again.')
      setShowStatusModal(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600">Loading batch...</div>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600">Batch not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">
              Edit Rum Batch: {batch.batch_name || 'Untitled'}
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              ID: {batch.id} • Overall Status: <span className="font-medium capitalize">{batch.overall_status?.replace('_', ' ')}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard/production/rum')}
              className="px-4 py-2 text-sm text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm text-white bg-amber-700 rounded-md hover:bg-amber-800 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Stage Progress */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg border border-stone-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Production Stages</h2>

          <div className="grid grid-cols-4 gap-4">
            {/* Fermentation Stage */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  batch.fermentation_status === 'completed' ? 'bg-green-500' :
                  batch.fermentation_status === 'in_progress' ? 'bg-amber-500' :
                  'bg-stone-300'
                }`} />
                <span className="text-sm font-medium text-stone-700">Fermentation</span>
              </div>
              <select
                value={batch.fermentation_status || 'not_started'}
                onChange={(e) => setBatch({ ...batch, fermentation_status: e.target.value as any })}
                className="text-xs px-2 py-1 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Distillation Stage */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  batch.distillation_status === 'completed' ? 'bg-green-500' :
                  batch.distillation_status === 'in_progress' ? 'bg-amber-500' :
                  'bg-stone-300'
                }`} />
                <span className="text-sm font-medium text-stone-700">Distillation</span>
              </div>
              <select
                value={batch.distillation_status || 'not_started'}
                onChange={(e) => setBatch({ ...batch, distillation_status: e.target.value as any })}
                className="text-xs px-2 py-1 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Aging Stage */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  batch.aging_status === 'completed' ? 'bg-green-500' :
                  batch.aging_status === 'in_progress' ? 'bg-amber-500' :
                  batch.aging_status === 'skipped' ? 'bg-stone-400' :
                  'bg-stone-300'
                }`} />
                <span className="text-sm font-medium text-stone-700">Aging</span>
              </div>
              <select
                value={batch.aging_status || 'not_started'}
                onChange={(e) => setBatch({ ...batch, aging_status: e.target.value as any })}
                className="text-xs px-2 py-1 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="skipped">Skipped</option>
              </select>
            </div>

            {/* Bottling Stage */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  batch.bottling_status === 'completed' ? 'bg-green-500' :
                  batch.bottling_status === 'in_progress' ? 'bg-amber-500' :
                  batch.bottling_status === 'skipped' ? 'bg-stone-400' :
                  'bg-stone-300'
                }`} />
                <span className="text-sm font-medium text-stone-700">Bottling</span>
              </div>
              <select
                value={batch.bottling_status || 'not_started'}
                onChange={(e) => setBatch({ ...batch, bottling_status: e.target.value as any })}
                className="text-xs px-2 py-1 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="skipped">Skipped</option>
              </select>
            </div>
          </div>

          {/* Overall Status */}
          <div className="mt-4 pt-4 border-t border-stone-200">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Overall Batch Status
            </label>
            <select
              value={batch.overall_status || 'draft'}
              onChange={(e) => setBatch({ ...batch, overall_status: e.target.value as any })}
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
            >
              <option value="draft">Draft</option>
              <option value="fermenting">Fermenting</option>
              <option value="distilling">Distilling</option>
              <option value="aging">Aging</option>
              <option value="ready_to_bottle">Ready to Bottle</option>
              <option value="bottled">Bottled</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <RumProductionForm
          batch={batch}
          onUpdate={setBatch}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>

      {/* Status Selection Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-stone-900 mb-2">
                Batch Saved Successfully!
              </h2>
              <p className="text-sm text-stone-600 mb-6">
                Choose the status for this batch:
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleStatusUpdate('in_progress')}
                  className="w-full px-4 py-3 text-left border-2 border-blue-300 bg-blue-50 rounded-lg hover:bg-blue-100 hover:border-blue-400 transition-colors"
                >
                  <div className="font-semibold text-blue-900">Mark as Ongoing</div>
                  <div className="text-xs text-blue-700 mt-1">
                    Batch is still in progress (fermentation, distillation, or aging)
                  </div>
                </button>

                <button
                  onClick={() => handleStatusUpdate('completed')}
                  className="w-full px-4 py-3 text-left border-2 border-green-300 bg-green-50 rounded-lg hover:bg-green-100 hover:border-green-400 transition-colors"
                >
                  <div className="font-semibold text-green-900">Mark as Completed</div>
                  <div className="text-xs text-green-700 mt-1">
                    Batch is finished and ready for bottling or already bottled
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowStatusModal(false)}
                className="w-full mt-4 px-4 py-2 text-sm text-stone-600 hover:text-stone-900"
              >
                Cancel (keep current status)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

