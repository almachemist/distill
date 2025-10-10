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
    if (item.quantity === 0) return 'text-red-600'
    if (item.quantity <= item.minThreshold) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getStatusText = () => {
    if (item.quantity === 0) return 'Out of Stock'
    if (item.quantity <= item.minThreshold) return 'Low Stock'
    return 'In Stock'
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{item.type}</p>
            </div>
            <button
              onClick={onClose}
              className="bg-gray-100 rounded-md p-1.5 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Stock Info */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Current Stock</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <span className={`text-sm font-semibold ${getStatusColor()}`}>
                      {item.quantity.toLocaleString()} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Minimum:</span>
                    <span className="text-sm text-gray-900">{item.minThreshold.toLocaleString()} {item.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`text-sm font-medium ${getStatusColor()}`}>
                      {getStatusText()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock History */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <span className="mr-2">🕒</span>
                  Recent Activity
                </h4>
                <div className="text-sm text-gray-600">
                  <p>• Last updated: {item.lastUpdated || 'Unknown'}</p>
                  <p>• Stock movements will appear here</p>
                </div>
              </div>
            </div>

            {/* Update Stock Form */}
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-3">Update Stock</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Quantity
                    </label>
                    <input
                      type="number"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      placeholder={`Current: ${item.quantity}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this stock update..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleUpdateStock}
                    disabled={!newQuantity || isUpdating}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isUpdating ? 'Updating...' : 'Update Stock'}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setNewQuantity((item.quantity + item.minThreshold).toString())}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Set to minimum + buffer
                  </button>
                  <button
                    onClick={() => setNewQuantity((item.minThreshold * 2).toString())}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Set to 2x minimum
                  </button>
                  <button
                    onClick={() => setNewQuantity('0')}
                    className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md"
                  >
                    Mark as out of stock
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {item.notes && (
            <div className="mt-6 bg-yellow-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-900 mb-2 flex items-center">
                <span className="mr-2">📝</span>
                Notes
              </h4>
              <p className="text-sm text-yellow-800">{item.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
