'use client'

import { useState, useEffect } from 'react'
import { StockRepository, type StockLevel, type LotStock } from '../services/stock.repository'

export function SimpleStockView() {
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([])
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [lots, setLots] = useState<LotStock[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const stockRepo = new StockRepository()

  useEffect(() => {
    loadStockLevels()
  }, [])

  const loadStockLevels = async () => {
    try {
      setLoading(true)
      const levels = await stockRepo.getStockLevels()
      setStockLevels(levels)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stock levels')
    } finally {
      setLoading(false)
    }
  }

  const handleItemClick = async (itemId: string) => {
    try {
      setSelectedItem(itemId)
      const [itemLots, recentTxns] = await Promise.all([
        stockRepo.getLotsForItem(itemId),
        stockRepo.getRecentTransactions(itemId)
      ])
      setLots(itemLots)
      setTransactions(recentTxns)
    } catch (err) {
      console.error('Failed to load item details:', err)
    }
  }

  const getStockStatusColor = (quantity: number) => {
    if (quantity <= 0) return 'text-red-600'
    if (quantity < 10) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getTxnTypeColor = (txnType: string) => {
    switch (txnType) {
      case 'RECEIVE':
      case 'PRODUCE':
        return 'text-green-600'
      case 'CONSUME':
      case 'DESTROY':
        return 'text-red-600'
      case 'TRANSFER':
        return 'text-blue-600'
      case 'ADJUST':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error: {error}</p>
        <button 
          onClick={loadStockLevels}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Items List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Stock Levels</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {stockLevels.map((item) => (
              <div
                key={item.item_id}
                onClick={() => handleItemClick(item.item_id)}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  selectedItem === item.item_id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.item_name}</h3>
                    <div className="text-sm text-gray-600">
                      Category: {item.category.replace('_', ' ')}
                      {item.is_alcohol && (
                        <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Alcohol
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${getStockStatusColor(item.total_on_hand)}`}>
                      {item.total_on_hand.toFixed(2)} {item.uom}
                    </div>
                    <div className="text-xs text-gray-500">On hand</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Item Details */}
      <div className="space-y-4">
        {selectedItem ? (
          <>
            <h2 className="text-xl font-semibold text-gray-900">Item Details</h2>
            
            {/* Lots */}
            {lots.length > 0 && (
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Lots</h3>
                <div className="space-y-2">
                  {lots.map((lot) => (
                    <div key={lot.lot_id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">{lot.lot_code}</div>
                        {lot.received_date && (
                          <div className="text-xs text-gray-600">
                            Received: {new Date(lot.received_date).toLocaleDateString()}
                          </div>
                        )}
                        {lot.note && (
                          <div className="text-xs text-gray-600">{lot.note}</div>
                        )}
                      </div>
                      <div className={`font-medium ${getStockStatusColor(lot.on_hand)}`}>
                        {lot.on_hand.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            {transactions.length > 0 && (
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Transactions</h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {transactions.map((txn) => (
                    <div key={txn.id} className="flex justify-between items-center p-2 text-sm">
                      <div>
                        <span className={`font-medium ${getTxnTypeColor(txn.txn_type)}`}>
                          {txn.txn_type}
                        </span>
                        <span className="text-gray-600 ml-2">
                          {new Date(txn.dt || txn.created_at).toLocaleDateString()}
                        </span>
                        {txn.note && (
                          <div className="text-xs text-gray-500">{txn.note}</div>
                        )}
                      </div>
                      <div className={`font-medium ${getTxnTypeColor(txn.txn_type)}`}>
                        {txn.txn_type === 'CONSUME' || txn.txn_type === 'DESTROY' || txn.txn_type === 'TRANSFER' ? '-' : '+'}
                        {txn.quantity || txn.qty} {txn.uom}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500">Select an item to view lots and transaction history</p>
          </div>
        )}
      </div>
    </div>
  )
}


