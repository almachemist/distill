'use client'

import { useState } from 'react'
// Using simple SVG icons instead of Heroicons

export interface InventoryItem {
  id: string
  name: string
  category: 'raw' | 'packaging' | 'product'
  type: 'ethanol' | 'botanical' | 'bottle' | 'label' | 'gin' | 'water' | 'closure' | 'box'
  quantity: number
  unit: 'kg' | 'L' | 'units'
  minThreshold: number
  lastUpdated?: string
  notes?: string
}

interface InventoryTableProps {
  items: InventoryItem[]
  category: 'raw' | 'packaging' | 'product'
  onItemClick: (item: InventoryItem) => void
}

export function InventoryTable({ items, category, onItemClick }: InventoryTableProps) {
  const [sortField, setSortField] = useState<keyof InventoryItem>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filterType, setFilterType] = useState<string>('all')

  // Filter items by category and type
  const filteredItems = items
    .filter(item => item.category === category)
    .filter(item => filterType === 'all' || item.type === filterType)
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      return 0
    })

  const handleSort = (field: keyof InventoryItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getStatusBadge = (item: InventoryItem) => {
    const isLow = item.quantity <= item.minThreshold
    const isOut = item.quantity === 0
    
    if (isOut) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          ⚠️ OUT
        </span>
      )
    }
    
    if (isLow) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          ⚠️ LOW
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ✓ OK
      </span>
    )
  }

  const getTypeOptions = () => {
    const types = Array.from(new Set(items.filter(item => item.category === category).map(item => item.type)))
    return types
  }

  const getCategoryTitle = () => {
    switch (category) {
      case 'raw': return 'Raw Materials'
      case 'packaging': return 'Packaging Materials'
      case 'product': return 'Finished Products'
      default: return 'Inventory'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ethanol': return 'Spirits'
      case 'botanical': return 'Botanicals'
      case 'water': return 'Water'
      case 'bottle': return 'Bottles'
      case 'closure': return 'Closures'
      case 'label': return 'Labels'
      case 'box': return 'Boxes'
      case 'gin': return 'Gin Products'
      default: return type
    }
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">{getCategoryTitle()}</h3>
          <div className="flex items-center space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {getTypeOptions().map(type => (
                <option key={type} value={type}>
                  {getTypeLabel(type)}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-500">
              {filteredItems.length} items
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Item
                  {sortField === 'name' && (
                    sortDirection === 'asc' ? 
                      <span className="ml-1">↑</span> : 
                      <span className="ml-1">↓</span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('quantity')}
              >
                <div className="flex items-center">
                  Quantity
                  {sortField === 'quantity' && (
                    sortDirection === 'asc' ? 
                      <span className="ml-1">↑</span> : 
                      <span className="ml-1">↓</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Minimum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr 
                key={item.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onItemClick(item)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">{getTypeLabel(item.type)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {item.quantity.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.minThreshold.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(item)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No items found in this category</p>
        </div>
      )}
    </div>
  )
}
