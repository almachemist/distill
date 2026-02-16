'use client'

import { useState } from 'react'
// Using simple SVG icons instead of Heroicons
import type { InventoryItem } from './InventoryTable'

interface InventoryItemModalProps {
  item: InventoryItem | null
  isOpen: boolean
  onClose: () => void
  onUpdateStock: (itemId: string, newQuantity: number) => void
}

export function InventoryItemModal({ item, isOpen, onClose, onUpdateStock }: InventoryItemModalProps) {
  const [newQuantity, setNewQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  if (!isOpen || !item) return null

  const handleUpdateStock = async () => {
    if (!newQuantity || isNaN(Number(newQuantity))) return

    setIsUpdating(true)
    try {
      await onUpdateStock(item.id, Number(newQuantity))
      setNewQuantity('')
      setNotes('')
      onClose()
    } catch (error) {
      console.error('Failed to update stock:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = () => {
    if (item.quantity === 0) return 'text-copper'
    if (item.quantity <= item.minThreshold) return 'text-copper'
    return 'text-graphite'
  }

  const getStatusText = () => {
    if (item.quantity === 0) return 'Out of Stock'
    if (item.quantity <= item.minThreshold) return 'Low Stock'
    return 'In Stock'
  }

  return (
    <div className="fixed inset-0 bg-black/20 overflow-y-auto h-full w-full z-50" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="relative top-20 mx-auto p-5 border border-copper-30 w-11/12 max-w-2xl shadow-lg rounded-lg bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="mt-3">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium text-graphite">{item.name}</h3>
              <p className="text-sm text-graphite/70 capitalize">{item.type}</p>
            </div>
            <button
              onClick={onClose}
              className="bg-beige rounded-md p-1.5 text-graphite/60 hover:text-graphite focus:outline-none focus:ring-2 focus:ring-brand"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Stock Info */}
            <div className="space-y-4">
              <div className="bg-beige rounded-lg p-4 border border-copper-30">
                <h4 className="text-sm font-medium text-graphite mb-3">Current Stock</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-graphite/70">Quantity:</span>
                    <span className={`text-sm font-semibold ${getStatusColor()}`}>
                      {item.quantity.toLocaleString()} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-graphite/70">Minimum:</span>
                    <span className="text-sm text-graphite">{item.minThreshold.toLocaleString()} {item.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-graphite/70">Status:</span>
                    <span className={`text-sm font-medium ${getStatusColor()}`}>
                      {getStatusText()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock History */}
              <div className="bg-beige rounded-lg p-4 border border-copper-30">
                <h4 className="text-sm font-medium text-graphite mb-3 flex items-center">
                  <span className="mr-2">🕒</span>
                  Recent Activity
                </h4>
                <div className="text-sm text-graphite/70">
                  <p>• Last updated: {item.lastUpdated || 'Unknown'}</p>
                  <p>• Stock movements will appear here</p>
                </div>
              </div>
            </div>

            {/* Update Stock Form */}
            <div className="space-y-4">
              <div className="bg-beige rounded-lg p-4 border border-copper-30">
                <h4 className="text-sm font-medium text-graphite mb-3">Update Stock</h4>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="newQuantity" className="block text-sm font-medium text-graphite mb-1">
                      New Quantity
                    </label>
                    <input
                      id="newQuantity"
                      type="number"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      placeholder={`Current: ${item.quantity}`}
                      className="w-full px-3 py-2 border border-copper-30 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-graphite mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this stock update..."
                      rows={3}
                      className="w-full px-3 py-2 border border-copper-30 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <button
                    onClick={handleUpdateStock}
                    disabled={!newQuantity || isUpdating}
                    className="w-full px-4 py-2 bg-copper text-white rounded-md hover:bg-copper/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    {isUpdating ? 'Updating...' : 'Update Stock'}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-beige rounded-lg p-4 border border-copper-30">
                <h4 className="text-sm font-medium text-graphite mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setNewQuantity((item.quantity + item.minThreshold).toString())}
                    className="w-full text-left px-3 py-2 text-sm text-graphite hover:bg-copper-10 rounded-md"
                  >
                    Set to minimum + buffer
                  </button>
                  <button
                    onClick={() => setNewQuantity((item.minThreshold * 2).toString())}
                    className="w-full text-left px-3 py-2 text-sm text-graphite hover:bg-copper-10 rounded-md"
                  >
                    Set to 2x minimum
                  </button>
                  <button
                    onClick={() => setNewQuantity('0')}
                    className="w-full text-left px-3 py-2 text-sm text-copper hover:bg-copper-10 rounded-md"
                  >
                    Mark as out of stock
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {item.notes && (
            <div className="mt-6 bg-beige rounded-lg p-4 border border-copper-30">
              <h4 className="text-sm font-medium text-graphite mb-2 flex items-center">
                <span className="mr-2">📝</span>
                Notes
              </h4>
              <p className="text-sm text-graphite/80">{item.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
