'use client'

import { useState, useEffect } from 'react'
import { Tank, TankStatus, TankUpdateInput, TANK_STATUS_LABELS } from '../types/tank.types'

interface TankEditModalProps {
  tank: Tank
  isOpen: boolean
  onClose: () => void
  onSave: (tankId: string, updates: TankUpdateInput & { tank_id?: string, tank_name?: string, capacity_l?: number }) => Promise<void>
  onDelete?: (tankId: string) => Promise<void>
}

export function TankEditModal({ tank, isOpen, onClose, onSave, onDelete }: TankEditModalProps) {
  const isNewTank = !tank.id
  const [tankId, setTankId] = useState(tank.tank_id || '')
  const [tankName, setTankName] = useState(tank.tank_name || '')
  const [capacity, setCapacity] = useState(tank.capacity_l?.toString() || '1000')
  const [product, setProduct] = useState(tank.product || '')
  const [abv, setAbv] = useState(tank.current_abv?.toString() || '')
  const [volume, setVolume] = useState(tank.current_volume_l?.toString() || '')
  const [status, setStatus] = useState<TankStatus>(tank.status)
  const [notes, setNotes] = useState(tank.notes || '')
  const [userName, setUserName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTankId(tank.tank_id || '')
      setTankName(tank.tank_name || '')
      setCapacity(tank.capacity_l?.toString() || '1000')
      setProduct(tank.product || '')
      setAbv(tank.current_abv?.toString() || '')
      setVolume(tank.current_volume_l?.toString() || '')
      setStatus(tank.status)
      setNotes(tank.notes || '')
    }
  }, [tank, isOpen])

  if (!isOpen) return null

  const handleSave = async () => {
    if (isNewTank && (!tankId.trim() || !tankName.trim())) {
      alert('Please enter Tank ID and Tank Name')
      return
    }

    setIsSaving(true)
    try {
      const updates: TankUpdateInput & { tank_id?: string; tank_name?: string; capacity_l?: number } = {
        product: product.trim() || null,
        current_abv: abv ? parseFloat(abv) : null,
        current_volume_l: volume ? parseFloat(volume) : null,
        status,
        notes: notes.trim() || null,
        last_updated_by: userName.trim() || 'User'
      }

      if (isNewTank) {
        updates.tank_id = tankId.trim()
        updates.tank_name = tankName.trim()
        updates.capacity_l = capacity ? parseFloat(capacity) : 1000
      } else {
        // Allow editing tank name and capacity for existing tanks
        updates.tank_name = tankName.trim()
        updates.capacity_l = capacity ? parseFloat(capacity) : tank.capacity_l
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

  const handleDelete = async () => {
    if (!onDelete || isNewTank) return

    if (confirm(`Are you sure you want to delete ${tank.tank_name}? This action cannot be undone.`)) {
      setIsSaving(true)
      try {
        await onDelete(tank.id)
        onClose()
      } catch (error) {
        console.error('Failed to delete tank:', error)
        alert('Failed to delete tank. Please try again.')
      } finally {
        setIsSaving(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-800 text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold">{isNewTank ? 'Add New Tank' : `Edit ${tank.tank_name}`}</h2>
          {!isNewTank && (
            <p className="text-gray-300 text-sm mt-1">{tank.tank_id} - Capacity: {tank.capacity_l} L</p>
          )}
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Tank ID and Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tank ID {isNewTank && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={tankId}
                onChange={(e) => setTankId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., TK-11"
                disabled={!isNewTank}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tank Name {isNewTank && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={tankName}
                onChange={(e) => setTankName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Tank 11"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity (L)
            </label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1000"
              step="1"
              min="0"
            />
          </div>

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
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-between">
          <div>
            {!isNewTank && onDelete && (
              <button
                onClick={handleDelete}
                disabled={isSaving}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                Delete Tank
              </button>
            )}
          </div>
          <div className="flex gap-3">
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
              {isSaving ? 'Saving...' : isNewTank ? 'Add Tank' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
