'use client'

import { useState, useEffect } from 'react'
import type { BatchNew } from '@/modules/production/new-model/types/batch.types'

interface EditBatchModalProps {
  batch: BatchNew
  isOpen: boolean
  onClose: () => void
  onSave: (updatedBatch: BatchNew) => void
}

export function EditBatchModal({ batch, isOpen, onClose, onSave }: EditBatchModalProps) {
  const [editedBatch, setEditedBatch] = useState<BatchNew>(() => {
    // Initialize with batch prop safely
    try {
      return batch || {} as BatchNew
    } catch (error) {
      console.error('Error initializing EditBatchModal:', error)
      return {} as BatchNew
    }
  })

  const calculateLAL = (volume: number | null, abv: number | null): number | null => {
    if (volume === null || abv === null) return null
    if (isNaN(volume) || isNaN(abv)) return null
    return Math.round((volume * abv / 100) * 10) / 10 // Round to 1 decimal place
  }

  // Helper function to recalculate LAL for a field
  const recalcLAL = (obj: any): any => {
    if (!obj) return obj
    const vol = obj.volume_l
    const abv = obj.abv_percent
    if (vol != null && abv != null && !isNaN(vol) && !isNaN(abv) && vol > 0 && abv > 0) {
      const calculatedLAL = calculateLAL(vol, abv)
      // Only update if LAL is missing or zero (allow manual overrides of non-zero values)
      if (calculatedLAL != null && (obj.lal == null || obj.lal === 0)) {
        return { ...obj, lal: calculatedLAL }
      }
    }
    return obj
  }

  // Load batch and recalculate all LALs on initial load and when batch changes
  useEffect(() => {
    if (!isOpen || !batch) return
    
    try {
      const updated = JSON.parse(JSON.stringify(batch))
      
      // Recalculate Charge Total LAL
      if (updated.charge?.total) {
        updated.charge.total = recalcLAL(updated.charge.total)
      }
      
      // Recalculate Charge Components LAL
      if (updated.charge?.components) {
        updated.charge.components = updated.charge.components.map((comp: any) => recalcLAL(comp))
      }
      
      // Recalculate Cuts LAL
      if (updated.cuts) {
        if (updated.cuts.foreshots) updated.cuts.foreshots = recalcLAL(updated.cuts.foreshots)
        if (updated.cuts.heads) updated.cuts.heads = recalcLAL(updated.cuts.heads)
        if (updated.cuts.hearts) updated.cuts.hearts = recalcLAL(updated.cuts.hearts)
        if (updated.cuts.tails) updated.cuts.tails = recalcLAL(updated.cuts.tails)
        if (updated.cuts.hearts_segments) {
          updated.cuts.hearts_segments = updated.cuts.hearts_segments.map((seg: any) => recalcLAL(seg))
        }
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

  const updateFieldWithLAL = (path: string[], field: string, value: any, otherFieldValue: number | null) => {
    setEditedBatch(prev => {
      const clone = JSON.parse(JSON.stringify(prev))
      let ref: any = clone
      for (let i = 0; i < path.length - 1; i++) {
        if (!ref[path[i]]) ref[path[i]] = {}
        ref = ref[path[i]]
      }
      
      // Update the field
      ref[field] = value
      
      // Get current values after updating (from the updated clone)
      const volume = ref['volume_l'] || ref['volume_L'] || null
      const abv = ref['abv_percent'] || ref['abv'] || null
      
      // Calculate LAL if both values are available
      if (volume !== null && abv !== null && volume !== undefined && abv !== undefined) {
        const newLAL = calculateLAL(volume, abv)
        if (newLAL !== null) {
          ref['lal'] = newLAL
        }
      } else {
        // If either is missing, clear LAL
        ref['lal'] = null
      }
      
      return clone
    })
  }

  const fmt = (n: number | null | undefined) => {
    if (n === null || n === undefined) return ''
    return n.toString()
  }

  const parseNum = (s: string): number | null => {
    const v = parseFloat(s)
    return isNaN(v) ? null : v
  }

  if (!isOpen || !batch) {
    return null
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 overflow-y-auto"
      onClick={(e) => {
        // Close modal only if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
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
          <button
            onClick={onClose}
            className="text-graphite/50 hover:text-copper text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-beige rounded-xl p-4 border border-copper-15">
            <h3 className="text-lg font-semibold text-graphite mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-graphite mb-1">Date</label>
                <input
                  type="date"
                  value={editedBatch.date}
                  onChange={(e) => updateField(['date'], e.target.value)}
                  className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite mb-1">Still Used</label>
                <input
                  type="text"
                  value={editedBatch.still_used}
                  onChange={(e) => updateField(['still_used'], e.target.value)}
                  className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite mb-1">Boiler On Time</label>
                <input
                  type="text"
                  value={editedBatch.boiler_on_time || ''}
                  onChange={(e) => updateField(['boiler_on_time'], e.target.value)}
                  className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                  placeholder="e.g., 08:00 AM"
                />
              </div>
            </div>
          </div>

          {/* Charge Total */}
          {editedBatch.charge && (
            <div className="bg-copper-5 rounded-xl p-4 border border-copper-15">
              <h3 className="text-lg font-semibold text-graphite mb-4">Charge Total</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-graphite mb-1">Volume (L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fmt(editedBatch.charge.total.volume_l)}
                    onChange={(e) => {
                      const newVolume = parseNum(e.target.value)
                      setEditedBatch(prev => {
                        const clone = JSON.parse(JSON.stringify(prev))
                        const currentABV = clone.charge.total.abv_percent
                        const newLAL = calculateLAL(newVolume, currentABV)
                        clone.charge.total.volume_l = newVolume
                        clone.charge.total.lal = newLAL !== null ? newLAL : null
                        return clone
                      })
                    }}
                    className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-graphite mb-1">ABV (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="96"
                    value={fmt(editedBatch.charge.total.abv_percent)}
                    onChange={(e) => {
                      const newABV = parseNum(e.target.value)
                      setEditedBatch(prev => {
                        const clone = JSON.parse(JSON.stringify(prev))
                        const currentVolume = clone.charge.total.volume_l
                        const newLAL = calculateLAL(currentVolume, newABV)
                        clone.charge.total.abv_percent = newABV
                        clone.charge.total.lal = newLAL !== null ? newLAL : null
                        return clone
                      })
                    }}
                    className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-graphite mb-1">LAL (auto-calculated)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fmt(editedBatch.charge.total.lal)}
                    onChange={(e) => updateField(['charge', 'total', 'lal'], parseNum(e.target.value))}
                    className="w-full px-3 py-2 border border-copper-15 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-beige"
                    placeholder="Auto"
                  />
                </div>
              </div>

              {/* Charge Components */}
              {editedBatch.charge.components && editedBatch.charge.components.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-graphite mb-2">Components</h4>
                  <div className="space-y-3">
                    {editedBatch.charge.components.map((comp, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-copper-15">
                        <div className="grid grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-graphite mb-1">Source</label>
                            <input
                              type="text"
                              value={comp.source}
                              onChange={(e) => {
                                const newComps = [...editedBatch.charge!.components]
                                newComps[idx] = { ...newComps[idx], source: e.target.value }
                                updateField(['charge', 'components'], newComps)
                              }}
                              className="w-full px-2 py-1 text-sm border border-copper-30 rounded focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-graphite mb-1">Volume (L)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={fmt(comp.volume_l)}
                              onChange={(e) => {
                                const newVolume = parseNum(e.target.value)
                                setEditedBatch(prev => {
                                  const clone = JSON.parse(JSON.stringify(prev))
                                  const currentComp = clone.charge.components[idx]
                                  const currentABV = currentComp.abv_percent
                                  const newLAL = calculateLAL(newVolume, currentABV)
                                  clone.charge.components[idx] = { 
                                    ...currentComp, 
                                    volume_l: newVolume,
                                    lal: newLAL !== null ? newLAL : null
                                  }
                                  return clone
                                })
                              }}
                              className="w-full px-2 py-1 text-sm border border-copper-30 rounded focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-graphite mb-1">ABV (%)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={fmt(comp.abv_percent)}
                              onChange={(e) => {
                                const newABV = parseNum(e.target.value)
                                setEditedBatch(prev => {
                                  const clone = JSON.parse(JSON.stringify(prev))
                                  const currentComp = clone.charge.components[idx]
                                  const currentVolume = currentComp.volume_l
                                  const newLAL = calculateLAL(currentVolume, newABV)
                                  clone.charge.components[idx] = { 
                                    ...currentComp, 
                                    abv_percent: newABV,
                                    lal: newLAL !== null ? newLAL : null
                                  }
                                  return clone
                                })
                              }}
                              className="w-full px-2 py-1 text-sm border border-copper-30 rounded focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-graphite mb-1">LAL (auto)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={fmt(comp.lal)}
                              onChange={(e) => {
                                const newComps = [...editedBatch.charge!.components]
                                newComps[idx] = { ...newComps[idx], lal: parseNum(e.target.value) }
                                updateField(['charge', 'components'], newComps)
                              }}
                              className="w-full px-2 py-1 text-sm border border-copper-15 rounded focus:ring-2 focus:ring-copper focus:border-copper bg-beige"
                              placeholder="Auto"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cuts - All Phases */}
          {editedBatch.cuts && (
            <div className="space-y-4">
              {/* Foreshots */}
              {editedBatch.cuts.foreshots && (
                <div className="bg-beige rounded-xl p-4 border border-copper-15">
                  <h3 className="text-lg font-semibold text-graphite mb-4">Foreshots</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1">Volume (L)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={fmt(editedBatch.cuts.foreshots.volume_l)}
                        onChange={(e) => {
                          const newVolume = parseNum(e.target.value)
                          setEditedBatch(prev => {
                            const clone = JSON.parse(JSON.stringify(prev))
                            const currentABV = clone.cuts.foreshots.abv_percent
                            const newLAL = calculateLAL(newVolume, currentABV)
                            clone.cuts.foreshots.volume_l = newVolume
                            clone.cuts.foreshots.lal = newLAL !== null ? newLAL : null
                            return clone
                          })
                        }}
                        className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1">ABV (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={fmt(editedBatch.cuts.foreshots.abv_percent)}
                        onChange={(e) => {
                          const newABV = parseNum(e.target.value)
                          setEditedBatch(prev => {
                            const clone = JSON.parse(JSON.stringify(prev))
                            const currentVolume = clone.cuts.foreshots.volume_l
                            const newLAL = calculateLAL(currentVolume, newABV)
                            clone.cuts.foreshots.abv_percent = newABV
                            clone.cuts.foreshots.lal = newLAL !== null ? newLAL : null
                            return clone
                          })
                        }}
                        className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1">LAL (auto)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={fmt(editedBatch.cuts.foreshots.lal)}
                        onChange={(e) => updateField(['cuts', 'foreshots', 'lal'], parseNum(e.target.value))}
                        className="w-full px-3 py-2 border border-copper-15 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-beige"
                        placeholder="Auto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1">Vessel</label>
                      <input
                        type="text"
                        value={editedBatch.cuts.foreshots.receiving_vessel || ''}
                        onChange={(e) => updateField(['cuts', 'foreshots', 'receiving_vessel'], e.target.value)}
                        className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Heads */}
              {editedBatch.cuts.heads && (
                <div className="bg-beige rounded-xl p-4 border border-copper-15">
                  <h3 className="text-lg font-semibold text-graphite mb-4">Heads</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1">Volume (L)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={fmt(editedBatch.cuts.heads.volume_l)}
                        onChange={(e) => {
                          const newVolume = parseNum(e.target.value)
                          setEditedBatch(prev => {
                            const clone = JSON.parse(JSON.stringify(prev))
                            const currentABV = clone.cuts.heads.abv_percent
                            const newLAL = calculateLAL(newVolume, currentABV)
                            clone.cuts.heads.volume_l = newVolume
                            clone.cuts.heads.lal = newLAL !== null ? newLAL : null
                            return clone
                          })
                        }}
                        className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1">ABV (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={fmt(editedBatch.cuts.heads.abv_percent)}
                        onChange={(e) => {
                          const newABV = parseNum(e.target.value)
                          setEditedBatch(prev => {
                            const clone = JSON.parse(JSON.stringify(prev))
                            const currentVolume = clone.cuts.heads.volume_l
                            const newLAL = calculateLAL(currentVolume, newABV)
                            clone.cuts.heads.abv_percent = newABV
                            clone.cuts.heads.lal = newLAL !== null ? newLAL : null
                            return clone
                          })
                        }}
                        className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1">LAL (auto)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={fmt(editedBatch.cuts.heads.lal)}
                        onChange={(e) => updateField(['cuts', 'heads', 'lal'], parseNum(e.target.value))}
                        className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-beige"
                        placeholder="Auto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1">Vessel</label>
                      <input
                        type="text"
                        value={editedBatch.cuts.heads.receiving_vessel || ''}
                        onChange={(e) => updateField(['cuts', 'heads', 'receiving_vessel'], e.target.value)}
                        className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Hearts */}
              {editedBatch.cuts?.hearts && (
                <div className="bg-beige rounded-xl p-4 border border-copper-15">
                  <h3 className="text-lg font-semibold text-graphite mb-4">Hearts Cut</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1">Volume (L)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={fmt(editedBatch.cuts.hearts.volume_l)}
                        onChange={(e) => {
                          const newVolume = parseNum(e.target.value)
                          setEditedBatch(prev => {
                            const clone = JSON.parse(JSON.stringify(prev))
                            const currentABV = clone.cuts.hearts.abv_percent
                            const newLAL = calculateLAL(newVolume, currentABV)
                            clone.cuts.hearts.volume_l = newVolume
                            clone.cuts.hearts.lal = newLAL !== null ? newLAL : null
                            return clone
                          })
                        }}
                        className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1">ABV (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={fmt(editedBatch.cuts.hearts.abv_percent)}
                        onChange={(e) => {
                          const newABV = parseNum(e.target.value)
                          setEditedBatch(prev => {
                            const clone = JSON.parse(JSON.stringify(prev))
                            const currentVolume = clone.cuts.hearts.volume_l
                            const newLAL = calculateLAL(currentVolume, newABV)
                            clone.cuts.hearts.abv_percent = newABV
                            clone.cuts.hearts.lal = newLAL !== null ? newLAL : null
                            return clone
                          })
                        }}
                        className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1">LAL (auto-calculated)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={fmt(editedBatch.cuts.hearts.lal)}
                        onChange={(e) => updateField(['cuts', 'hearts', 'lal'], parseNum(e.target.value))}
                        className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-beige"
                        placeholder="Auto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1">Vessel</label>
                      <input
                        type="text"
                        value={editedBatch.cuts.hearts.receiving_vessel || ''}
                        onChange={(e) => updateField(['cuts', 'hearts', 'receiving_vessel'], e.target.value)}
                        className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tails */}
              {editedBatch.cuts.tails && (
                <div className="bg-beige rounded-xl p-4 border border-copper-15">
                  <h3 className="text-lg font-semibold text-graphite mb-4">Tails</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1">Volume (L)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={fmt(editedBatch.cuts.tails.volume_l)}
                        onChange={(e) => {
                          const newVolume = parseNum(e.target.value)
                          setEditedBatch(prev => {
                            const clone = JSON.parse(JSON.stringify(prev))
                            const currentABV = clone.cuts.tails.abv_percent
                            const newLAL = calculateLAL(newVolume, currentABV)
                            clone.cuts.tails.volume_l = newVolume
                            clone.cuts.tails.lal = newLAL !== null ? newLAL : null
                            return clone
                          })
                        }}
                        className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1">ABV (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={fmt(editedBatch.cuts.tails.abv_percent)}
                        onChange={(e) => {
                          const newABV = parseNum(e.target.value)
                          setEditedBatch(prev => {
                            const clone = JSON.parse(JSON.stringify(prev))
                            const currentVolume = clone.cuts.tails.volume_l
                            const newLAL = calculateLAL(currentVolume, newABV)
                            clone.cuts.tails.abv_percent = newABV
                            clone.cuts.tails.lal = newLAL !== null ? newLAL : null
                            return clone
                          })
                        }}
                        className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1">LAL (auto)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={fmt(editedBatch.cuts.tails.lal)}
                        onChange={(e) => updateField(['cuts', 'tails', 'lal'], parseNum(e.target.value))}
                        className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-beige"
                        placeholder="Auto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1">Vessel</label>
                      <input
                        type="text"
                        value={editedBatch.cuts.tails.receiving_vessel || ''}
                        onChange={(e) => updateField(['cuts', 'tails', 'receiving_vessel'], e.target.value)}
                        className="w-full px-3 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hearts Segments */}
          {editedBatch.cuts?.hearts_segments && editedBatch.cuts.hearts_segments.length > 0 && (
            <div className="bg-beige rounded-xl p-4 border border-copper-15">
              <h3 className="text-lg font-semibold text-graphite mb-4">Hearts Segments</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-copper-15 text-sm">
                  <thead className="bg-copper-10">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-graphite">Time</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-graphite">Volume (L)</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-graphite">ABV (%)</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-graphite">LAL</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-copper-15">
                    {editedBatch.cuts.hearts_segments.map((seg, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={seg.time_start || ''}
                            onChange={(e) => {
                              const newSegs = [...editedBatch.cuts!.hearts_segments!]
                              newSegs[idx] = { ...newSegs[idx], time_start: e.target.value }
                              updateField(['cuts', 'hearts_segments'], newSegs)
                            }}
                            className="w-24 px-2 py-1 text-sm border border-copper-30 rounded focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.1"
                            value={fmt(seg.volume_l)}
                            onChange={(e) => {
                              const newVolume = parseNum(e.target.value)
                              setEditedBatch(prev => {
                                const clone = JSON.parse(JSON.stringify(prev))
                                const currentSeg = clone.cuts.hearts_segments[idx]
                                const currentABV = currentSeg.abv_percent
                                const newLAL = calculateLAL(newVolume, currentABV)
                                clone.cuts.hearts_segments[idx] = { 
                                  ...currentSeg, 
                                  volume_l: newVolume,
                                  lal: newLAL !== null ? newLAL : null
                                }
                                return clone
                              })
                            }}
                            className="w-20 px-2 py-1 text-sm border border-copper-30 rounded focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.1"
                            value={fmt(seg.abv_percent)}
                            onChange={(e) => {
                              const newABV = parseNum(e.target.value)
                              setEditedBatch(prev => {
                                const clone = JSON.parse(JSON.stringify(prev))
                                const currentSeg = clone.cuts.hearts_segments[idx]
                                const currentVolume = currentSeg.volume_l
                                const newLAL = calculateLAL(currentVolume, newABV)
                                clone.cuts.hearts_segments[idx] = { 
                                  ...currentSeg, 
                                  abv_percent: newABV,
                                  lal: newLAL !== null ? newLAL : null
                                }
                                return clone
                              })
                            }}
                            className="w-20 px-2 py-1 text-sm border border-copper-30 rounded focus:ring-2 focus:ring-copper focus:border-copper bg-white"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.1"
                            value={fmt(seg.lal)}
                            onChange={(e) => {
                              const newSegs = [...editedBatch.cuts!.hearts_segments!]
                              newSegs[idx] = { ...newSegs[idx], lal: parseNum(e.target.value) }
                              updateField(['cuts', 'hearts_segments'], newSegs)
                            }}
                            className="w-20 px-2 py-1 text-sm border border-copper-30 rounded focus:ring-2 focus:ring-copper focus:border-copper bg-beige"
                            placeholder="Auto"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex gap-4 p-6 pt-4 border-t border-copper-15 bg-white rounded-b-2xl flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('Cancel button clicked')
              onClose()
            }}
            className="flex-1 bg-copper-10 hover:bg-copper-20 text-graphite px-6 py-3 rounded-lg font-medium transition-colors border border-copper-30 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('Save button clicked')
              handleSave()
            }}
            className="flex-1 bg-copper hover:bg-copper/90 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

