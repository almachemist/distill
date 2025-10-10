'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { StockRepository } from '@/modules/inventory/services/stock.repository'
import type { StockLevel } from '@/modules/inventory/services/stock.repository'

export default function BottlingPage() {
  const router = useRouter()
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bottlingRun, setBottlingRun] = useState({
    spiritType: '',
    volume: 0,
    bottleSize: 750,
    quantity: 0
  })

  const stockRepo = new StockRepository()

  const loadStockLevels = useCallback(async () => {
    try {
      setLoading(true)
      const levels = await stockRepo.getStockLevels()
      // Filter for finished spirits/alcohol products
      const spirits = levels.filter(item => item.is_alcohol && item.total_on_hand > 0)
      setStockLevels(spirits)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stock levels')
    } finally {
      setLoading(false)
    }
  }, [stockRepo])

  const calculateBottles = useCallback(() => {
    if (bottlingRun.volume > 0 && bottlingRun.bottleSize > 0) {
      const bottles = Math.floor((bottlingRun.volume * 1000) / bottlingRun.bottleSize)
      setBottlingRun(prev => ({ ...prev, quantity: bottles }))
    }
  }, [bottlingRun.volume, bottlingRun.bottleSize])

  useEffect(() => {
    loadStockLevels()
  }, [loadStockLevels])

  useEffect(() => {
    calculateBottles()
  }, [calculateBottles])

  const handleStartBottling = async () => {
    if (!bottlingRun.spiritType || bottlingRun.volume <= 0) return

    try {
      setLoading(true)
      
      // Find the spirit item in inventory
      const spiritItem = stockLevels.find(item => item.item_name === bottlingRun.spiritType)
      if (!spiritItem) {
        setError('Selected spirit not found in inventory')
        return
      }

      // Check if we have enough stock
      if (spiritItem.total_on_hand < bottlingRun.volume) {
        setError(`Insufficient stock. Available: ${spiritItem.total_on_hand}L, Required: ${bottlingRun.volume}L`)
        return
      }

      // Create bottling transaction to consume the spirit
      await stockRepo.createTransaction({
        item_id: spiritItem.item_id,
        txn_type: 'CONSUME',
        quantity: bottlingRun.volume,
        uom: 'L',
        notes: `Bottling run: ${bottlingRun.quantity} bottles of ${bottlingRun.bottleSize}ml`
      })

      // Navigate to bottling summary with parameters
      const params = new URLSearchParams({
        spiritType: bottlingRun.spiritType,
        volume: bottlingRun.volume.toString(),
        bottleSize: bottlingRun.bottleSize.toString(),
        quantity: bottlingRun.quantity.toString()
      })
      router.push(`/dashboard/production/bottling-summary?${params}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start bottling run')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bottling Run</h1>
          <p className="text-gray-600 mt-2">Start a new bottling run with packaging allocation</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Spirits */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Spirits</h2>
          
          {stockLevels.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No finished spirits available for bottling</p>
              <p className="text-sm mt-2">Check your inventory or complete production batches first</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stockLevels.map((item) => (
                <div
                  key={item.item_id}
                  onClick={() => setBottlingRun(prev => ({ ...prev, spiritType: item.item_name }))}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    bottlingRun.spiritType === item.item_name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.item_name}</h3>
                      <p className="text-sm text-gray-600">Category: {item.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        {item.total_on_hand.toFixed(2)} {item.uom}
                      </div>
                      <div className="text-xs text-gray-500">Available</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottling Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Bottling Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Spirit
              </label>
              <input
                type="text"
                value={bottlingRun.spiritType}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                placeholder="Select a spirit from the list"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volume to Bottle (Liters)
              </label>
              <input
                type="number"
                value={bottlingRun.volume}
                onChange={(e) => setBottlingRun(prev => ({ ...prev, volume: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bottle Size (ml)
              </label>
              <select
                value={bottlingRun.bottleSize}
                onChange={(e) => setBottlingRun(prev => ({ ...prev, bottleSize: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={375}>375ml</option>
                <option value={500}>500ml</option>
                <option value={750}>750ml</option>
                <option value={1000}>1000ml</option>
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800">Estimated Bottles:</span>
                <span className="text-lg font-semibold text-blue-900">{bottlingRun.quantity}</span>
              </div>
              <div className="text-xs text-blue-700 mt-1">
                {bottlingRun.volume}L ÷ {(bottlingRun.bottleSize / 1000).toFixed(3)}L per bottle
              </div>
            </div>

            <button
              onClick={handleStartBottling}
              disabled={!bottlingRun.spiritType || bottlingRun.volume <= 0 || bottlingRun.quantity <= 0}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Start Bottling Run
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Bottling Process</h3>
        <p className="text-blue-700 text-sm mb-4">
          The bottling process will allocate the required volume from your inventory and create 
          bottling records for tracking and compliance purposes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
            <span className="text-blue-800">Select spirit and configure bottling parameters</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
            <span className="text-blue-800">Allocate inventory and create bottling records</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
            <span className="text-blue-800">Generate bottling summary and compliance reports</span>
          </div>
        </div>
      </div>
    </div>
  )
}
