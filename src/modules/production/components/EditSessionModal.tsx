'use client'

import React, { useState, useEffect } from 'react'
import { DistillationSession } from '@/modules/production/types/distillation-session.types'

interface EditSessionModalProps {
  session: DistillationSession
  isOpen: boolean
  onClose: () => void
  onSave: (updatedSession: DistillationSession) => void
}

export default function EditSessionModal({
  session,
  isOpen,
  onClose,
  onSave
}: EditSessionModalProps) {
  const [formData, setFormData] = useState({
    sku: '',
    spiritRun: '',
    description: '',
    date: '',
    stillUsed: '',
    notes: ''
  })

  useEffect(() => {
    if (session) {
      setFormData({
        sku: session.sku || '',
        spiritRun: session.spiritRun || '',
        description: session.description || '',
        date: session.date || '',
        stillUsed: session.still || (session as any).stillUsed || '',
        notes: session.notes || ''
      })
    }
  }, [session])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const updatedSession: DistillationSession = {
      ...session,
      sku: formData.sku,
      spiritRun: formData.spiritRun,
      description: formData.description,
      date: formData.date,
      still: formData.stillUsed,
      notes: formData.notes
    }
    
    onSave(updatedSession)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Distillation Session</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="edit_sku" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name (SKU)
                </label>
                <input
                  id="edit_sku"
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Rainforest Gin"
                />
              </div>

              <div>
                <label htmlFor="edit_spirit_run" className="block text-sm font-medium text-gray-700 mb-2">
                  Spirit Run ID
                </label>
                <input
                  id="edit_spirit_run"
                  type="text"
                  value={formData.spiritRun}
                  onChange={(e) => handleChange('spiritRun', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., SPIRIT-GIN-RF-30"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit_description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of the distillation run..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="edit_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  id="edit_date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="edit_still_used" className="block text-sm font-medium text-gray-700 mb-2">
                  Still Used
                </label>
                <select
                  id="edit_still_used"
                  value={formData.stillUsed}
                  onChange={(e) => handleChange('stillUsed', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Still</option>
                  <option value="Carrie">Carrie</option>
                  <option value="Roberta">Roberta</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="edit_notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="edit_notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes about this distillation run..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}





