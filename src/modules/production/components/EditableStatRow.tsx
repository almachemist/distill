'use client'

import { useState } from 'react'

interface EditableStatRowProps {
  label: string
  value: string | number | undefined | null
  editable?: boolean
  onSave?: (newVal: string | number) => void
  type?: 'text' | 'number' | 'time'
  min?: number
  max?: number
  step?: number
}

export function EditableStatRow({ 
  label, 
  value, 
  editable, 
  onSave,
  type = 'text',
  min,
  max,
  step
}: EditableStatRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value?.toString() ?? '')

  const handleSave = () => {
    if (onSave) {
      const parsedValue = type === 'number' ? Number(draft) : draft
      if (type === 'number' && (isNaN(parsedValue as number) || parsedValue === '')) {
        // Invalid number, revert
        setDraft(value?.toString() ?? '')
        setIsEditing(false)
        return
      }
      onSave(parsedValue)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDraft(value?.toString() ?? '')
    setIsEditing(false)
  }

  if (!editable) {
    return (
      <div className="flex justify-between py-1">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="font-medium text-white">{value ?? '—'}</span>
      </div>
    )
  }

  // For text fields that might be long, use textarea when editing
  if (editable && type === 'text' && (label.toLowerCase().includes('notes') || label.toLowerCase().includes('description'))) {
    return (
      <div className="py-1">
        <span className="text-sm text-gray-400 block mb-1">{label}</span>
        {!isEditing ? (
          <div className="flex items-start justify-between">
            <span className="font-medium text-white flex-1">{value ?? '—'}</span>
            <button
              className="p-1 rounded hover:bg-gray-700/50 transition-colors ml-2"
              onClick={() => setIsEditing(true)}
              aria-label={`Edit ${label}`}
            >
              <svg className="w-4 h-4 text-gray-400 hover:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleCancel()
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-sm transition-colors"
                onClick={handleSave}
                aria-label="Save"
              >
                Save
              </button>
              <button
                className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors"
                onClick={handleCancel}
                aria-label="Cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // If no label, just show the editable input inline
  if (!label) {
    if (!isEditing) {
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium text-white text-sm">{value ?? '—'}</span>
          {editable && (
            <button
              className="p-1 rounded hover:bg-gray-700/50 transition-colors"
              onClick={() => setIsEditing(true)}
              aria-label="Edit"
            >
              <svg className="w-4 h-4 text-gray-400 hover:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>
      )
    }
    
    return (
      <div className="flex items-center gap-1">
        <input
          type={type === 'time' ? 'text' : type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          min={min}
          max={max}
          step={step}
          placeholder={type === 'time' ? 'HH:MM' : ''}
          className={`h-8 px-2 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${type === 'time' ? 'w-20' : type === 'number' ? 'w-24' : 'w-32'}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') handleCancel()
          }}
          autoFocus
        />
        <button
          className="p-1 rounded hover:bg-green-500/20 transition-colors"
          onClick={handleSave}
          aria-label="Save"
        >
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <button
          className="p-1 rounded hover:bg-red-500/20 transition-colors"
          onClick={handleCancel}
          aria-label="Cancel"
        >
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between py-1 gap-2">
      <span className="text-sm text-gray-400">{label}</span>

      {!isEditing ? (
        <div className="flex items-center gap-2">
          <span className="font-medium text-white">{value ?? '—'}</span>
          <button
            className="p-1 rounded hover:bg-gray-700/50 transition-colors"
            onClick={() => setIsEditing(true)}
            aria-label={`Edit ${label}`}
          >
            <svg className="w-4 h-4 text-gray-400 hover:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <input
            type={type === 'time' ? 'text' : type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            min={min}
            max={max}
            step={step}
            placeholder={type === 'time' ? 'HH:MM' : ''}
            className={`h-8 px-2 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${type === 'time' ? 'w-20' : type === 'number' ? 'w-24' : 'w-32'}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') handleCancel()
            }}
            autoFocus
          />
          <button
            className="p-1 rounded hover:bg-green-500/20 transition-colors"
            onClick={handleSave}
            aria-label="Save"
          >
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            className="p-1 rounded hover:bg-red-500/20 transition-colors"
            onClick={handleCancel}
            aria-label="Cancel"
          >
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

