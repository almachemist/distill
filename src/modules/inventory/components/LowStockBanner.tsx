'use client'

// Using simple SVG icons instead of Heroicons
import { useState } from 'react'

interface LowStockItem {
  id: string
  name: string
  quantity: number
  minThreshold: number
  unit: string
}

interface LowStockBannerProps {
  lowStockItems: LowStockItem[]
  onItemClick: (item: LowStockItem) => void
}

export function LowStockBanner({ lowStockItems, onItemClick }: LowStockBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed || lowStockItems.length === 0) {
    return null
  }

  const outOfStockItems = lowStockItems.filter(item => item.quantity === 0)
  const lowStockItemsOnly = lowStockItems.filter(item => item.quantity > 0 && item.quantity <= item.minThreshold)

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-red-400 text-xl">⚠️</span>
        </div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-red-800">
                ⚠️ Stock Alert: {lowStockItems.length} items need attention
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {outOfStockItems.length > 0 && (
                  <div className="mb-2">
                    <strong>Out of Stock ({outOfStockItems.length}):</strong>
                    <ul className="list-disc list-inside ml-4">
                      {outOfStockItems.map(item => (
                        <li key={item.id}>
                          <button
                            onClick={() => onItemClick(item)}
                            className="text-red-800 hover:text-red-900 underline"
                          >
                            {item.name} (0 {item.unit})
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {lowStockItemsOnly.length > 0 && (
                  <div>
                    <strong>Low Stock ({lowStockItemsOnly.length}):</strong>
                    <ul className="list-disc list-inside ml-4">
                      {lowStockItemsOnly.map(item => (
                        <li key={item.id}>
                          <button
                            onClick={() => onItemClick(item)}
                            className="text-red-800 hover:text-red-900 underline"
                          >
                            {item.name} ({item.quantity} {item.unit}, min: {item.minThreshold})
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => setIsDismissed(true)}
                className="bg-red-50 rounded-md p-1.5 text-red-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  // Open restock modal or navigate to restock page
                  console.log('Open restock modal')
                }}
                className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Restock Items
              </button>
              <button
                onClick={() => {
                  // Send alert email
                  console.log('Send alert email')
                }}
                className="bg-white text-red-600 px-3 py-1 rounded-md text-sm font-medium border border-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Send Alert
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
