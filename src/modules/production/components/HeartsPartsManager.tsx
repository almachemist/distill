import React, { useState, useEffect } from 'react'
import { HeartPart, PhaseTotal } from '../types/distillation-session.types'

interface HeartsPartsManagerProps {
  parts: HeartPart[]
  onPartsChange: (parts: HeartPart[]) => void
  onTotalsChange: (totals: PhaseTotal) => void
  onFinalize: () => void
}

export default function HeartsPartsManager({
  parts,
  onPartsChange,
  onTotalsChange,
  onFinalize
}: HeartsPartsManagerProps) {
  const [editingPart, setEditingPart] = useState<HeartPart | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  // Ensure parts is always an array
  const safeParts = Array.isArray(parts) ? parts : []

  // Calculate totals whenever parts change
  useEffect(() => {
    const totals = computeTotals(safeParts)
    onTotalsChange(totals)
  }, [safeParts]) // Only depend on safeParts, not onTotalsChange

  // Calculate LAL for a single part
  const calculateLAL = (volumeL: number, abvPercent: number): number => {
    return Number((volumeL * (abvPercent / 100)).toFixed(2))
  }

  // Compute totals from all parts
  function computeTotals(ps: HeartPart[]): PhaseTotal {
    // Safety check: ensure ps is an array
    if (!Array.isArray(ps)) {
      return { 
        volumeL: 0, 
        avgAbvPercent: 0, 
        lal: 0, 
        count: 0 
      }
    }
    
    const V = ps.reduce((s, p) => s + (p.volumeL || 0), 0)
    const L = ps.reduce((s, p) => s + ((p.volumeL || 0) * (p.abvPercent || 0) / 100), 0)
    const ABV = V > 0 ? (L / V) * 100 : 0
    return { 
      volumeL: Number(V.toFixed(2)), 
      avgAbvPercent: Number(ABV.toFixed(2)), 
      lal: Number(L.toFixed(2)), 
      count: ps.length 
    }
  }

  // Save a part (add or update)
  function savePart(part: HeartPart) {
    if (!part.id) part.id = crypto.randomUUID()
    part.lal = calculateLAL(part.volumeL ?? 0, part.abvPercent ?? 0)
    
    const idx = safeParts.findIndex(p => p.id === part.id)
    const next = [...safeParts]
    if (idx >= 0) {
      next[idx] = part
    } else {
      next.push(part)
    }
    setParts(next)
    
    setEditingPart(null)
    setIsAddingNew(false)
  }

  // Delete a part
  function deletePart(id: string) {
    setParts(safeParts.filter(p => p.id !== id))
  }

  // Duplicate a part
  function duplicatePart(part: HeartPart) {
    const newPart: HeartPart = {
      ...part,
      id: crypto.randomUUID(),
      label: `Part ${safeParts.length + 1}`,
      startTime: '',
      endTime: '',
      notes: ''
    }
    setParts([...safeParts, newPart])
  }

  // Add new part
  function addNewPart() {
    const newPart: HeartPart = {
      id: crypto.randomUUID(),
      label: `Part ${safeParts.length + 1}`,
      volumeL: 0,
      abvPercent: 0,
      density: null,
      condenserTempC: null,
      currentA: null,
      receivingVessel: '',
      destination: '',
      notes: ''
    }
    setEditingPart(newPart)
    setIsAddingNew(true)
  }

  // Set start time to now
  function setStartTimeNow() {
    if (editingPart) {
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
      setEditingPart({ ...editingPart, startTime: timeString })
    }
  }

  // Set end time to now
  function setEndTimeNow() {
    if (editingPart) {
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
      setEditingPart({ ...editingPart, endTime: timeString })
    }
  }

  // Update parts state
  function setParts(newParts: HeartPart[]) {
    onPartsChange(newParts)
  }

  const totals = computeTotals(safeParts)

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Hearts Collection</h3>
        <div className="flex gap-2">
          <button
            onClick={addNewPart}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Add Part
          </button>
          {safeParts.length > 0 && (
            <button
              onClick={onFinalize}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Finalize Hearts
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parts Table */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Parts ({safeParts.length})</h4>
          
          {safeParts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              No parts added yet. Click "Add Part" to start.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">End Time</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Volume (L)</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ABV (%)</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">LAL</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {safeParts.map((part) => (
                    <tr key={part.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-900">{part.label}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{part.startTime || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{part.endTime || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{part.volumeL}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{part.abvPercent}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{part.lal?.toFixed(2) || '0.00'}</td>
                      <td className="px-3 py-2 text-sm space-x-1">
                        <button
                          onClick={() => setEditingPart(part)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => duplicatePart(part)}
                          className="text-green-600 hover:text-green-800"
                        >
                          Duplicate
                        </button>
                        <button
                          onClick={() => deletePart(part.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Part Form */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">
            {isAddingNew ? 'Add New Part' : editingPart ? 'Edit Part' : 'Select a part to edit'}
          </h4>
          
          {editingPart && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Label</label>
                  <input
                    type="text"
                    value={editingPart.label}
                    onChange={(e) => setEditingPart({ ...editingPart, label: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingPart.startTime || ''}
                      onChange={(e) => setEditingPart({ ...editingPart, startTime: e.target.value })}
                      placeholder="05:00 PM"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                    <button
                      onClick={setStartTimeNow}
                      className="px-2 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Now
                    </button>
                  </div>
                </div>
              </div>

              {/* End Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingPart.endTime || ''}
                      onChange={(e) => setEditingPart({ ...editingPart, endTime: e.target.value })}
                      placeholder="07:30 PM"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                    <button
                      onClick={setEndTimeNow}
                      className="px-2 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Now
                    </button>
                  </div>
                </div>
                <div>
                  {/* Empty div for grid alignment */}
                </div>
              </div>

              {/* Volume and ABV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Volume (L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingPart.volumeL || ''}
                    onChange={(e) => setEditingPart({ 
                      ...editingPart, 
                      volumeL: parseFloat(e.target.value) || 0 
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ABV (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingPart.abvPercent || ''}
                    onChange={(e) => setEditingPart({ 
                      ...editingPart, 
                      abvPercent: parseFloat(e.target.value) || 0 
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              {/* Calculated LAL */}
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-sm font-medium text-blue-900">
                  Calculated LAL: {calculateLAL(editingPart.volumeL ?? 0, editingPart.abvPercent ?? 0).toFixed(2)}L
                </div>
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Density</label>
                  <input
                    type="number"
                    step="0.001"
                    value={editingPart.density || ''}
                    onChange={(e) => setEditingPart({ 
                      ...editingPart, 
                      density: e.target.value ? parseFloat(e.target.value) : null 
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Condenser Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingPart.condenserTempC || ''}
                    onChange={(e) => setEditingPart({ 
                      ...editingPart, 
                      condenserTempC: e.target.value ? parseFloat(e.target.value) : null 
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current (A)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingPart.currentA || ''}
                    onChange={(e) => setEditingPart({ 
                      ...editingPart, 
                      currentA: e.target.value ? parseFloat(e.target.value) : null 
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Receiving Vessel</label>
                  <input
                    type="text"
                    value={editingPart.receivingVessel || ''}
                    onChange={(e) => setEditingPart({ ...editingPart, receivingVessel: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  rows={3}
                  value={editingPart.notes || ''}
                  onChange={(e) => setEditingPart({ ...editingPart, notes: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => savePart(editingPart)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Part
                </button>
                <button
                  onClick={() => {
                    setEditingPart(null)
                    setIsAddingNew(false)
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Totals Panel */}
      {parts.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-3">Hearts Totals</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800">{totals.volumeL}L</div>
              <div className="text-sm text-green-600">Total Volume</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800">{totals.avgAbvPercent?.toFixed(1) || '0.0'}%</div>
              <div className="text-sm text-green-600">Avg ABV</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800">{totals.lal?.toFixed(2) || '0.00'}L</div>
              <div className="text-sm text-green-600">Total LAL</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800">{totals.count}</div>
              <div className="text-sm text-green-600">Parts</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
