'use client'

import { useState, useEffect } from 'react'
import { MasterInventorySeedService } from '@/modules/recipes/services/master-inventory-seed.service'
import { StockRepository } from '@/modules/recipes/services/stock.repository'

export function InventoryList() {
  const [itemsByCategory, setItemsByCategory] = useState<Record<string, any[]>>({})
  const [itemsWithStock, setItemsWithStock] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'category' | 'stock'>('category')

  const masterInventoryService = new MasterInventorySeedService()
  const stockRepo = new StockRepository()

  useEffect(() => {
    loadData()
  }, [view])

  const loadData = async () => {
    try {
      setLoading(true)
      
      if (view === 'category') {
        const categorized = await masterInventoryService.getItemsByCategory()
        setItemsByCategory(categorized)
      } else {
        const withStock = await stockRepo.getItemsWithStock()
        setItemsWithStock(withStock)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryDisplayName = (category: string) => {
    const categoryNames: Record<string, string> = {
      neutral_spirit: 'Neutral Spirits',
      botanical: 'Botanicals',
      packaging_bottle: 'Bottles',
      packaging_closure: 'Closures',
      packaging_label: 'Labels',
      packaging_box: 'Boxes',
      packaging_carton: 'Cartons',
      packaging_other: 'Other Packaging',
      other: 'Other'
    }
    return categoryNames[category] || category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
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
          onClick={loadData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setView('category')}
            className={`px-4 py-2 text-sm rounded-md ${
              view === 'category' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            By Category
          </button>
          <button
            onClick={() => setView('stock')}
            className={`px-4 py-2 text-sm rounded-md ${
              view === 'stock' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Stock Levels
          </button>
        </div>
      </div>

      {/* Category View */}
      {view === 'category' && (
        <div className="space-y-6">
          {Object.entries(itemsByCategory).map(([category, items]) => (
            <div key={category} className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                {getCategoryDisplayName(category)} ({items.length} items)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <div key={item.id} className="p-3 border border-gray-100 rounded-md">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      Unit: {item.unit}
                      {item.is_alcohol && (
                        <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Alcohol
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stock Levels View */}
      {view === 'stock' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {itemsWithStock.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getCategoryDisplayName(item.category || 'other')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`font-medium ${
                      item.current_stock > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.current_stock.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.is_alcohol ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Alcohol
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Non-Alcohol
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {((view === 'category' && Object.keys(itemsByCategory).length === 0) ||
        (view === 'stock' && itemsWithStock.length === 0)) && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No items found.</p>
          <p className="text-gray-400 mt-2">
            Use the "Seed Master Inventory" button on the Recipes page to create your master item list.
          </p>
        </div>
      )}
    </div>
  )
}



