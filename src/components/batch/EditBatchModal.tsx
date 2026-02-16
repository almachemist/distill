'use client'

import { useState, useEffect } from 'react'
import type { BatchNew } from '@/modules/production/new-model/types/batch.types'
import { recalcLAL } from './edit-batch/batch-edit-utils'
import { ChargeEditor } from './edit-batch/ChargeEditor'
import { CutPhaseEditor } from './edit-batch/CutPhaseEditor'
import { HeartsSegmentsEditor } from './edit-batch/HeartsSegmentsEditor'

interface EditBatchModalProps {
  batch: BatchNew
  isOpen: boolean
  onClose: () => void
  onSave: (updatedBatch: BatchNew) => void
}

export function EditBatchModal({ batch, isOpen, onClose, onSave }: EditBatchModalProps) {
  const [editedBatch, setEditedBatch] = useState<BatchNew>(() => {
    try {
      return batch || {} as BatchNew
    } catch (error) {
      console.error('Error initializing EditBatchModal:', error)
      return {} as BatchNew
    }
  })

  // Load batch and recalculate all LALs on initial load and when batch changes
  useEffect(() => {
    if (!isOpen || !batch) return
    try {
      const updated = JSON.parse(JSON.stringify(batch))
      if (updated.charge?.total) updated.charge.total = recalcLAL(updated.charge.total)
      if (updated.charge?.components) updated.charge.components = updated.charge.components.map((comp: any) => recalcLAL(comp))
      if (updated.cuts) {
        if (updated.cuts.foreshots) updated.cuts.foreshots = recalcLAL(updated.cuts.foreshots)
        if (updated.cuts.heads) updated.cuts.heads = recalcLAL(updated.cuts.heads)
        if (updated.cuts.hearts) updated.cuts.hearts = recalcLAL(updated.cuts.hearts)
        if (updated.cuts.tails) updated.cuts.tails = recalcLAL(updated.cuts.tails)
        if (updated.cuts.hearts_segments) updated.cuts.hearts_segments = updated.cuts.hearts_segments.map((seg: any) => recalcLAL(seg))
      }
      setEditedBatch(updated)
    } catch (error) {
      console.error('Error processing batch data:', error)
      setEditedBatch(batch)
    }
  }, [isOpen, batch])

  const handleSave = () => {
    console.log('Save button clicked, saving batch:', editedBatch.batch_id)
    try {
      onSave(editedBatch)
      onClose()
    } catch (error) {
      console.error('Error saving batch:', error)
      alert('Error saving batch. Please check the console for details.')
    }
  }

  const updateField = (path: string[], value: any) => {
    setEditedBatch(prev => {
      const clone = JSON.parse(JSON.stringify(prev))
      let ref: any = clone
      for (let i = 0; i < path.length - 1; i++) {
        if (!ref[path[i]]) ref[path[i]] = {}
        ref = ref[path[i]]
      }
      ref[path[path.length - 1]] = value
      return clone
    })
  }

  if (!isOpen || !batch) return null

  const CUT_PHASES = [
    { key: 'foreshots' as const, title: 'Foreshots' },
    { key: 'heads' as const, title: 'Heads' },
    { key: 'hearts' as const, title: 'Hearts Cut' },
    { key: 'tails' as const, title: 'Tails' },
  ]

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-copper-15 shadow-lg relative z-[101]"
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-6 pb-4 border-b border-copper-15 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-graphite">Edit Batch</h2>
            <p className="text-sm text-graphite/70 mt-1">{batch.display_name} - {batch.batch_id}</p>
          </div>
          <button onClick={onClose} className="text-graphite/50 hover:text-copper text-2xl leading-none transition-colors">×</button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-beige rounded-xl p-4 border border-copper-15">
              <h3 className="text-lg font-semibold text-graphite mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="batch_date" className="block text-sm font-medium text-graphite mb-1">Date</label>
                  <input id="batch_date" type="date" value={editedBatch.date} onChange={(e) => updateField(['date'], e.target.value)} className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white" />
                </div>
                <div>
                  <label htmlFor="still_used" className="block text-sm font-medium text-graphite mb-1">Still Used</label>
                  <input id="still_used" type="text" value={editedBatch.still_used} onChange={(e) => updateField(['still_used'], e.target.value)} className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white" />
                </div>
                <div>
                  <label htmlFor="boiler_on_time" className="block text-sm font-medium text-graphite mb-1">Boiler On Time</label>
                  <input id="boiler_on_time" type="text" value={editedBatch.boiler_on_time || ''} onChange={(e) => updateField(['boiler_on_time'], e.target.value)} className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white" placeholder="e.g., 08:00 AM" />
                </div>
              </div>
            </div>

            {/* Charge */}
            {editedBatch.charge && (
              <ChargeEditor charge={editedBatch.charge} setEditedBatch={setEditedBatch} updateField={updateField} />
            )}

            {/* Cuts - All Phases */}
            {editedBatch.cuts && (
              <div className="space-y-4">
                {CUT_PHASES.map(({ key, title }) =>
                  editedBatch.cuts?.[key] ? (
                    <CutPhaseEditor key={key} title={title} phaseKey={key} data={editedBatch.cuts[key]} setEditedBatch={setEditedBatch} updateField={updateField} />
                  ) : null
                )}
              </div>
            )}

            {/* Hearts Segments */}
            {editedBatch.cuts?.hearts_segments && (
              <HeartsSegmentsEditor segments={editedBatch.cuts.hearts_segments} setEditedBatch={setEditedBatch} updateField={updateField} />
            )}
          </div>
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex gap-4 p-6 pt-4 border-t border-copper-15 bg-white rounded-b-2xl flex-shrink-0">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); console.log('Cancel button clicked'); onClose() }}
            className="flex-1 bg-copper-10 hover:bg-copper-20 text-graphite px-6 py-3 rounded-lg font-medium transition-colors border border-copper-30 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); console.log('Save button clicked'); handleSave() }}
            className="flex-1 bg-copper hover:bg-copper/90 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
