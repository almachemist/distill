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
  const [batchId, setBatchId] = useState(tank.batch_id || tank.batch || '')
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
      setBatchId(tank.batch_id || tank.batch || '')
    }
  }, [tank, isOpen])

  if (!isOpen) return null

  const handleSave = async () => {
    if (isNewTank && (!tankId.trim() || !tankName.trim() || !batchId.trim())) {
      alert('Please enter Tank ID, Tank Name, and Batch ID')
      return
    }

    setIsSaving(true)
    try {
      const updates: TankUpdateInput & { tank_id?: string; tank_name?: string; capacity_l?: number; batch_id?: string } = {
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
        updates.batch_id = batchId.trim()
      } else {
        // Allow editing tank name and capacity for existing tanks
        updates.tank_name = tankName.trim()
        updates.capacity_l = capacity ? parseFloat(capacity) : tank.capacity_l
        updates.batch_id = batchId.trim() || undefined
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
        <div className="bg-graphite text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold">{isNewTank ? 'Add New Tank' : `Edit ${tank.tank_name}`}</h2>
          {!isNewTank && (
            <p className="text-[#D0D0D0] text-sm mt-1">{tank.tank_id} - Capacity: {tank.capacity_l} L</p>
          )}
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Tank ID and Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tank_id" className="block text-sm font-medium text-gray-700 mb-2">
                Tank ID {isNewTank && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                id="tank_id"
                value={tankId}
                onChange={(e) => setTankId(e.target.value)}
                className="w-full px-4 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper"
                placeholder="e.g., TK-11"
                disabled={!isNewTank}
              />
            </div>
            <div>
              <label htmlFor="tank_name" className="block text-sm font-medium text-gray-700 mb-2">
                Tank Name {isNewTank && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                id="tank_name"
                value={tankName}
                onChange={(e) => setTankName(e.target.value)}
                className="w-full px-4 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper"
                placeholder="e.g., Tank 11"
              />
            </div>
          </div>
          <div>
            <label htmlFor="tank_capacity_l" className="block text-sm font-medium text-gray-700 mb-2">
              Capacity (L)
            </label>
            <input
              type="number"
              id="tank_capacity_l"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full px-4 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper"
              placeholder="1000"
              step="1"
              min="0"
            />
          </div>

          {/* Product */}
          <div>
            <label htmlFor="tank_product" className="block text-sm font-medium text-gray-700 mb-2">
              Product
            </label>
              <input
                type="text"
                id="tank_product"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full px-4 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper"
                placeholder="e.g., Rainforest Gin, Navy Strength Gin"
              />
            </div>
          
          {/* Batch ID */}
          <div>
            <label htmlFor="tank_batch_id" className="block text-sm font-medium text-gray-700 mb-2">
              Batch ID {isNewTank && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              id="tank_batch_id"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full px-4 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper"
              placeholder="e.g., RAIN-26-001"
              required={isNewTank}
            />
          </div>

          {/* ABV and Volume */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tank_abv_percent" className="block text-sm font-medium text-gray-700 mb-2">
                ABV (%)
              </label>
              <input
                type="number"
                id="tank_abv_percent"
                value={abv}
                onChange={(e) => setAbv(e.target.value)}
                className="w-full px-4 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper"
                placeholder="40.0"
                step="0.1"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label htmlFor="tank_volume_l" className="block text-sm font-medium text-gray-700 mb-2">
                Volume (L)
              </label>
              <input
                type="number"
                id="tank_volume_l"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className="w-full px-4 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper"
                placeholder="500"
                step="0.1"
                min="0"
                max={tank.capacity_l}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="tank_status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="tank_status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TankStatus)}
              className="w-full px-4 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper"
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
            <label htmlFor="tank_notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              id="tank_notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper"
              placeholder="Add any notes about this tank..."
              rows={3}
            />
          </div>

          {/* User Name */}
          <div>
            <label htmlFor="tank_user_name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="tank_user_name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper"
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
                className="px-6 py-2 bg-graphite hover:opacity-90 text-white rounded-lg font-medium transition disabled:opacity-50"
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
              className="px-6 py-2 bg-copper hover:bg-copper/90 text-white rounded-lg transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : isNewTank ? 'Add Tank' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
