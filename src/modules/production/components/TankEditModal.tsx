'use client'

import { useState, useEffect } from 'react'
import { Tank, TankStatus, TankUpdateInput, TANK_STATUS_LABELS } from '../types/tank.types'

interface TankEditModalProps {
  tank: Tank
  isOpen: boolean
  onClose: () => void
  onSave: (tankId: string, updates: TankUpdateInput) => Promise<void>
}

export function TankEditModal({ tank, isOpen, onClose, onSave }: TankEditModalProps) {
  const [product, setProduct] = useState(tank.product || '')
  const [abv, setAbv] = useState(tank.current_abv?.toString() || '')
  const [volume, setVolume] = useState(tank.current_volume_l?.toString() || '')
  const [status, setStatus] = useState<TankStatus>(tank.status)
  const [notes, setNotes] = useState(tank.notes || '')
  const [userName, setUserName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setProduct(tank.product || '')
      setAbv(tank.current_abv?.toString() || '')
      setVolume(tank.current_volume_l?.toString() || '')
      setStatus(tank.status)
      setNotes(tank.notes || '')
    }
  }, [tank, isOpen])

  if (!isOpen) return null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updates: TankUpdateInput = {
        product: product.trim() || null,
        current_abv: abv ? parseFloat(abv) : null,
        current_volume_l: volume ? parseFloat(volume) : null,
        status,
        notes: notes.trim() || null,
        last_updated_by: userName.trim() || 'User'
      }
      
      await onSave(tank.id, updates)
      onClose()
    } catch (error) {
      console.error('Failed to save tank:', error)
      alert('Failed to save tank. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-800 text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold">Edit {tank.tank_name}</h2>
          <p className="text-gray-300 text-sm mt-1">{tank.tank_id} - Capacity: {tank.capacity_l} L</p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product
            </label>
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Rainforest Gin, Navy Strength Gin"
            />
          </div>

          {/* ABV and Volume */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ABV (%)
              </label>
              <input
                type="number"
                value={abv}
                onChange={(e) => setAbv(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="40.0"
                step="0.1"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volume (L)
              </label>
              <input
                type="number"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="500"
                step="0.1"
                min="0"
                max={tank.capacity_l}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TankStatus)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(TANK_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any notes about this tank..."
              rows={3}
            />
          </div>

          {/* User Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Gabi"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

