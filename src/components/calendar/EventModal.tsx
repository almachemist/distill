'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { CalendarEvent, CalendarEventInput, CalendarEventType, ProductType } from '@/types/calendar-event.types'
import { assignEventColor, getTextColor } from '@/utils/calendar-colors'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: CalendarEventInput) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onClear?: (id: string) => Promise<void>
  event?: CalendarEvent | null
  mode: 'create' | 'edit'
}

export function EventModal({ isOpen, onClose, onSave, onDelete, onClear, event, mode }: EventModalProps) {
  const [formData, setFormData] = useState<CalendarEventInput>({
    type: 'production',
    weekStart: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewColor, setPreviewColor] = useState('#FFFFFF')

  // Initialize form data when event changes
  useEffect(() => {
    if (event) {
      // Pre-fill form with event data (works for both edit and create modes)
      setFormData({
        type: event.type,
        productId: event.productId,
        productName: event.productName,
        productType: event.productType,
        batch: event.batch,
        weekStart: event.weekStart,
        weekEnd: event.weekEnd,
        tank: event.tank,
        notes: event.notes,
      })
      setPreviewColor(event.color)
    } else {
      // Empty form for new events
      setFormData({
        type: 'production',
        weekStart: '',
      })
      setPreviewColor('#FFFFFF')
    }
  }, [event, mode])

  // Update preview color when product type or event type changes
  useEffect(() => {
    const color = assignEventColor(formData.productType, formData.type)
    setPreviewColor(color)
  }, [formData.productType, formData.type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Failed to save event:', error)
      alert('Failed to save event. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClear = async () => {
    if (!event || !onClear) return
    if (!confirm('Clear this card contents? This keeps the card visible but empties product, tank and notes.')) return
    setIsSubmitting(true)
    try {
      await onClear(event.id)
      onClose()
    } catch (error) {
      console.error('Failed to clear static card:', error)
      alert('Failed to clear card. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!event || !onDelete) return

    if (!confirm('Are you sure you want to delete this event?')) return

    setIsSubmitting(true)
    try {
      await onDelete(event.id)
      onClose()
    } catch (error) {
      console.error('Failed to delete event:', error)
      alert('Failed to delete event. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">
              {mode === 'create' ? (event ? 'Create Custom Event' : 'Add Event') : 'Edit Event'}
            </h2>
            {mode === 'create' && event && (
              <p className="text-sm text-stone-500 mt-1">
                Based on: {event.productName || 'Production event'}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Event Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as CalendarEventType })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
              required
            >
              <option value="production">Production</option>
              <option value="bottling">Bottling</option>
              <option value="admin">Admin</option>
              <option value="maintenance">Maintenance</option>
              <option value="barrel">Barrel</option>
              <option value="npd">NPD</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Product Type */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Product Type
            </label>
            <select
              value={formData.productType || ''}
              onChange={(e) => setFormData({ ...formData, productType: e.target.value as ProductType || undefined })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
            >
              <option value="">Select product type...</option>
              <option value="GIN">Gin</option>
              <option value="RUM">Rum</option>
              <option value="VODKA">Vodka</option>
              <option value="CANE_SPIRIT">Cane Spirit</option>
              <option value="LIQUEUR">Liqueur</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Product Name
            </label>
            <input
              type="text"
              value={formData.productName || ''}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
              placeholder="e.g. Navy Strength Gin"
            />
          </div>

          {/* Batch Number */}
          {formData.type === 'production' && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Batch Number
              </label>
              <input
                type="text"
                value={formData.batch || ''}
                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                placeholder="e.g. 1/3 (auto-calculated if empty)"
              />
              <p className="text-xs text-stone-500 mt-1">
                Leave empty to auto-calculate based on existing batches
              </p>
            </div>
          )}

          {/* Week Start */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Week Start *
            </label>
            <input
              type="text"
              value={formData.weekStart}
              onChange={(e) => setFormData({ ...formData, weekStart: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
              placeholder="e.g. 2026-W15"
              required
            />
            <p className="text-xs text-stone-500 mt-1">
              Format: YYYY-Www (e.g. 2026-W15 for week 15 of 2026)
            </p>
          </div>

          {/* Week End (optional) */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Week End (optional)
            </label>
            <input
              type="text"
              value={formData.weekEnd || ''}
              onChange={(e) => setFormData({ ...formData, weekEnd: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
              placeholder="e.g. 2026-W16 (for multi-week events)"
            />
          </div>

          {/* Tank */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Tank
            </label>
            <input
              type="text"
              value={formData.tank || ''}
              onChange={(e) => setFormData({ ...formData, tank: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
              placeholder="e.g. T-400, T-330-A"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          {/* Color Preview */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Color Preview
            </label>
            <div
              className="w-full h-16 rounded-lg border-2 flex items-center justify-center font-medium"
              style={{
                backgroundColor: previewColor,
                borderColor: previewColor,
                color: getTextColor(previewColor),
              }}
            >
              {formData.productName || 'Event Preview'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200">
            <div className="flex items-center gap-3">
              {mode === 'edit' && onDelete && event && !event.id.startsWith('static-') && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  Delete Event
                </button>
              )}
              {mode === 'edit' && onClear && event && event.id.startsWith('static-') && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors disabled:opacity-50"
                >
                  Clear Card
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Event' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

