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
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive text-white">
          ⚠️ OUT
        </span>
      )
    }
    
    if (isLow) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning text-white">
          ⚠️ LOW
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success text-white">
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
    <div className="bg-surface shadow-card rounded-xl border border-border">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-foreground">{getCategoryTitle()}</h3>
          <div className="flex items-center space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Types</option>
              {getTypeOptions().map(type => (
                <option key={type} value={type}>
                  {getTypeLabel(type)}
                </option>
              ))}
            </select>
            <span className="text-sm text-muted-foreground">
              {filteredItems.length} items
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-accent">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-background"
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
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-background"
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
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Unit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Minimum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border">
            {filteredItems.map((item) => (
              <tr 
                key={item.id} 
                className="hover:bg-background cursor-pointer"
                onClick={() => onItemClick(item)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-foreground">{item.name}</div>
                  <div className="text-sm text-muted-foreground">{getTypeLabel(item.type)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-foreground">
                    {item.quantity.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {item.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
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
        <div className="text-center py-8 text-muted-foreground">
          <p>No items found in this category</p>
        </div>
      )}
    </div>
  )
}
