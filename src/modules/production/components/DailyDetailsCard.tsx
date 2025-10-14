'use client'

import React, { useState, useEffect } from 'react'

interface DistillationData {
  date: string
  volume: string
  still: string
  abv: string
  notes: string
  cuts: {
    foreshots: { volume: string; abv: string; notes: string }
    heads: { volume: string; abv: string; notes: string }
    hearts: { volume: string; abv: string; notes: string }
    tails: { volume: string; abv: string; notes: string }
  }
}

interface DailyDetailsCardProps {
  sessionId?: string
  initialData?: Partial<DistillationData>
  onSave?: (data: DistillationData) => void
}

export default function DailyDetailsCard({ 
  sessionId = "SPIRIT-GIN-MM-002", 
  initialData,
  onSave 
}: DailyDetailsCardProps) {
  const [editing, setEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [data, setData] = useState<DistillationData>({
    date: "2025-10-14",
    volume: "1000L",
    still: "Carrie",
    abv: "47.9%",
    notes: "Add observations about the distillation, problems encountered, adjustments made, etc...",
    cuts: {
      foreshots: { volume: "", abv: "", notes: "" },
      heads: { volume: "", abv: "", notes: "" },
      hearts: { volume: "", abv: "", notes: "" },
      tails: { volume: "", abv: "", notes: "" }
    },
    ...initialData
  })

  const [editingField, setEditingField] = useState<string | null>(null)

  // Auto-save functionality
  useEffect(() => {
    if (hasChanges && !editing) {
      const timer = setTimeout(() => {
        saveChanges()
      }, 2000) // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timer)
    }
  }, [hasChanges, editing])

  const handleChange = (field: string, value: string) => {
    setData({ ...data, [field]: value })
    setHasChanges(true)
  }

  const handleCutChange = (cutType: keyof DistillationData['cuts'], field: string, value: string) => {
    setData({
      ...data,
      cuts: {
        ...data.cuts,
        [cutType]: {
          ...data.cuts[cutType],
          [field]: value
        }
      }
    })
    setHasChanges(true)
  }

  const saveChanges = async () => {
    try {
      // Here you can integrate with Firebase, Supabase, or API:
      // await updateRunData(sessionId, data)
      
      if (onSave) {
        onSave(data)
      }
      
      // Save to localStorage as fallback
      localStorage.setItem(`distillation-${sessionId}`, JSON.stringify(data))
      
      setHasChanges(false)
      setEditing(false)
      setEditingField(null)
      
      console.log("Saved:", data)
    } catch (error) {
      console.error("Error saving data:", error)
    }
  }

  const startEditing = (field: string) => {
    setEditingField(field)
    setEditing(true)
  }

  const stopEditing = () => {
    setEditingField(null)
    if (!hasChanges) {
      setEditing(false)
    }
  }

  const EditableField = ({ 
    field, 
    value, 
    type = "text", 
    className = "",
    placeholder = ""
  }: {
    field: string
    value: string
    type?: string
    className?: string
    placeholder?: string
  }) => {
    const isEditing = editingField === field

    return (
      <div className="relative">
        {isEditing ? (
          <input
            type={type}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            onBlur={stopEditing}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                stopEditing()
              }
              if (e.key === 'Escape') {
                setEditingField(null)
                setEditing(false)
              }
            }}
            className={`w-full border border-blue-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
            placeholder={placeholder}
            autoFocus
          />
        ) : (
          <p 
            onClick={() => startEditing(field)} 
            className={`cursor-pointer hover:bg-slate-100 rounded-md px-3 py-2 transition-colors ${className}`}
          >
            {value || placeholder}
          </p>
        )}
      </div>
    )
  }

  const EditableTextarea = ({ 
    field, 
    value, 
    className = "",
    placeholder = ""
  }: {
    field: string
    value: string
    className?: string
    placeholder?: string
  }) => {
    const isEditing = editingField === field

    return (
      <div className="relative">
        {isEditing ? (
          <textarea
            rows={5}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            onBlur={stopEditing}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setEditingField(null)
                setEditing(false)
              }
            }}
            className={`w-full border border-blue-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
            placeholder={placeholder}
            autoFocus
          />
        ) : (
          <p 
            onClick={() => startEditing(field)} 
            className={`cursor-pointer hover:bg-slate-100 rounded-md px-3 py-2 min-h-[120px] transition-colors ${className}`}
          >
            {value || placeholder}
          </p>
        )}
      </div>
    )
  }

  const EditableCutField = ({ 
    cutType, 
    field, 
    value, 
    className = "",
    placeholder = ""
  }: {
    cutType: keyof DistillationData['cuts']
    field: string
    value: string
    className?: string
    placeholder?: string
  }) => {
    const fieldKey = `${cutType}-${field}` as string
    const isEditing = editingField === fieldKey

    return (
      <div className="relative">
        {isEditing ? (
          <input
            type="text"
            value={value}
            onChange={(e) => handleCutChange(cutType, field, e.target.value)}
            onBlur={stopEditing}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                stopEditing()
              }
              if (e.key === 'Escape') {
                setEditingField(null)
                setEditing(false)
              }
            }}
            className={`w-full border border-blue-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
            placeholder={placeholder}
            autoFocus
          />
        ) : (
          <p 
            onClick={() => startEditing(fieldKey)} 
            className={`cursor-pointer hover:bg-slate-100 rounded-md px-2 py-1 text-sm transition-colors ${className}`}
          >
            {value || placeholder}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-4xl mx-auto border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">
          Daily Details – Merchant Mae Gin
        </h2>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
              Unsaved changes
            </span>
          )}
          {editing ? (
            <>
              <button
                onClick={() => {
                  setEditing(false)
                  setEditingField(null)
                  setHasChanges(false)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-slate-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-slate-700 hover:bg-gray-50 transition-colors"
            >
              Edit Mode
            </button>
          )}
        </div>
      </div>

      {/* Section 1: Batch Info */}
      <div className="bg-slate-50 p-6 rounded-xl mb-6">
        <h3 className="text-lg font-medium text-slate-700 mb-4">Batch Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">Date:</label>
            <EditableField 
              field="date" 
              value={data.date} 
              type="date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">Still:</label>
            <EditableField 
              field="still" 
              value={data.still}
              placeholder="Enter still name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">Volume:</label>
            <EditableField 
              field="volume" 
              value={data.volume}
              placeholder="e.g., 1000L"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">ABV:</label>
            <EditableField 
              field="abv" 
              value={data.abv}
              placeholder="e.g., 47.9%"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Cuts and Yields */}
      <div className="bg-slate-50 p-6 rounded-xl mb-6">
        <h3 className="text-lg font-medium text-slate-700 mb-4">Cuts and Yields</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fraction</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ABV</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observations</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(data.cuts).map(([cutType, cut]) => (
                <tr key={cutType} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900 capitalize">{cutType}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <EditableCutField 
                      cutType={cutType as keyof DistillationData['cuts']}
                      field="volume"
                      value={cut.volume}
                      placeholder="Enter volume"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <EditableCutField 
                      cutType={cutType as keyof DistillationData['cuts']}
                      field="abv"
                      value={cut.abv}
                      placeholder="Enter ABV"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <EditableCutField 
                      cutType={cutType as keyof DistillationData['cuts']}
                      field="notes"
                      value={cut.notes}
                      placeholder="Add observations..."
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Daily Notes */}
      <div className="bg-slate-50 p-6 rounded-xl">
        <h3 className="text-lg font-medium text-slate-700 mb-4">Daily Notes</h3>
        <EditableTextarea 
          field="notes" 
          value={data.notes}
          placeholder="Add observations about the distillation, problems encountered, adjustments made, etc..."
        />
      </div>

      {/* Auto-save indicator */}
      {hasChanges && (
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-500">
            💾 Auto-save in 2 seconds...
          </span>
        </div>
      )}
    </div>
  )
}
