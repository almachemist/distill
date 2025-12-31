'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface PackagingItem {
  id: string
  name: string
  packaging_type: 'bottle' | 'closure' | 'label' | 'carton' | 'gift_box' | 'sleeve' | 'other'
  available_quantity: number
  cost_per_unit: number
  supplier: string
  lot_number: string
}

export interface PackagingSelection {
  inventory_item_id: string
  item_name: string
  packaging_type: 'bottle' | 'closure' | 'label' | 'carton' | 'gift_box' | 'sleeve' | 'other'
  quantity_used: number
  cost_per_unit: number
  total_cost: number
  supplier: string
  lot_number: string
}

interface PackagingSelectorProps {
  selections: PackagingSelection[]
  onChange: (selections: PackagingSelection[]) => void
}

export function PackagingSelector({ selections, onChange }: PackagingSelectorProps) {
  const [packagingItems, setPackagingItems] = useState<PackagingItem[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  const loadPackagingItems = useCallback(async () => {
    try {
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('id, name, category')
        .in('category', ['packaging_bottle', 'packaging_closure', 'packaging_label', 'packaging_carton', 'packaging_sleeve'])
        .order('name')

      if (itemsError) throw itemsError

      type ItemRow = { id: string; name: string; category: string }
      type LotRow = { id: string; code: string; qty: number | string; cost_per_unit: number | string; supplier_id: string | null }

      const packagingWithStock = await Promise.all(
        (items || []).map(async (item) => {
          const it = item as ItemRow
          const { data: lots, error: lotsError } = await supabase
            .from('lots')
            .select('id, code, qty, cost_per_unit, supplier_id')
            .eq('item_id', it.id)
            .gt('qty', 0)
            .order('received_date', { ascending: false })

          if (lotsError) {
            console.error('Error loading lots:', lotsError)
            return null
          }

          const lotWithSupplier = lots && lots.length > 0 ? (lots[0] as LotRow) : null
          let supplierName = 'Unknown'
          
          if (lotWithSupplier?.supplier_id) {
            const { data: supplier } = await supabase
              .from('suppliers')
              .select('name')
              .eq('id', lotWithSupplier.supplier_id)
              .single()
            
            if (supplier) supplierName = (supplier as { name: string }).name
          }

          const totalQty = (lots ?? []).reduce((sum: number, lot) => {
            const l = lot as LotRow
            const q = typeof l.qty === 'string' ? parseFloat(l.qty) : l.qty
            return sum + (q || 0)
          }, 0)
          const avgCost = (lots ?? []).length > 0 
            ? (lots ?? []).reduce((sum: number, lot) => {
                const l = lot as LotRow
                const c = typeof l.cost_per_unit === 'string' ? parseFloat(l.cost_per_unit) : l.cost_per_unit
                return sum + (c || 0)
              }, 0) / (lots ?? []).length 
            : 0

          let packagingType: PackagingItem['packaging_type'] = 'other'
          const nameLower = it.name.toLowerCase()
          if (nameLower.includes('bottle')) packagingType = 'bottle'
          else if (nameLower.includes('cap') || nameLower.includes('cork') || nameLower.includes('closure')) packagingType = 'closure'
          else if (nameLower.includes('label')) packagingType = 'label'
          else if (nameLower.includes('carton') || nameLower.includes('box')) packagingType = 'carton'
          else if (nameLower.includes('sleeve')) packagingType = 'sleeve'
          else if (nameLower.includes('gift')) packagingType = 'gift_box'

          return {
            id: it.id,
            name: it.name,
            packaging_type: packagingType,
            available_quantity: totalQty,
            cost_per_unit: avgCost,
            supplier: supplierName,
            lot_number: lotWithSupplier?.code || 'N/A'
          } as PackagingItem
        })
      )

      setPackagingItems((packagingWithStock || [])
        .filter((p): p is PackagingItem => !!p && p.available_quantity > 0))
    } catch (error) {
      console.error('Error loading packaging items:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadPackagingItems()
  }, [loadPackagingItems])

  const addPackaging = () => {
    onChange([...selections, {
      inventory_item_id: '',
      item_name: '',
      packaging_type: 'bottle',
      quantity_used: 0,
      cost_per_unit: 0,
      total_cost: 0,
      supplier: '',
      lot_number: ''
    }])
  }

  const removePackaging = (index: number) => {
    onChange(selections.filter((_, i) => i !== index))
  }

  const updatePackaging = <K extends keyof PackagingSelection>(index: number, field: K, value: PackagingSelection[K]) => {
    const updated = [...selections]
    updated[index] = { ...updated[index], [field]: value }
    
    // If changing the item, update all related fields
    if (field === 'inventory_item_id') {
      const item = packagingItems.find(p => p.id === (value as string))
      if (item) {
        updated[index] = {
          ...updated[index],
          inventory_item_id: item.id,
          item_name: item.name,
          packaging_type: item.packaging_type,
          cost_per_unit: item.cost_per_unit,
          supplier: item.supplier,
          lot_number: item.lot_number,
          total_cost: updated[index].quantity_used * item.cost_per_unit
        }
      }
    }

    // If changing quantity, recalculate cost
    if (field === 'quantity_used') {
      updated[index].total_cost = (value as number) * updated[index].cost_per_unit
    }

    onChange(updated)
  }

  if (loading) {
    return <div className="text-gray-500">Loading packaging items...</div>
  }

  const packagingTypeLabels = {
    bottle: 'Bottles',
    closure: 'Closures',
    label: 'Labels',
    carton: 'Cartons',
    sleeve: 'Tamper Sleeves',
    gift_box: 'Gift Boxes',
    other: 'Other'
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Packaging Materials</h3>
        <button
          type="button"
          onClick={addPackaging}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
        >
          + Add Packaging
        </button>
      </div>

      {selections.length === 0 && (
        <p className="text-gray-500 text-sm">No packaging added yet. Click &quot;Add Packaging&quot; to start.</p>
      )}

      {selections.map((selection, index) => {
        const item = packagingItems.find(p => p.id === selection.inventory_item_id)
        const isInsufficientStock = item && selection.quantity_used > item.available_quantity

        return (
          <div key={index} className="bg-white border border-gray-300 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Packaging Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={selection.packaging_type}
                  onChange={(e) => updatePackaging(index, 'packaging_type', e.target.value as PackagingSelection['packaging_type'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {Object.entries(packagingTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Item Selector */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item <span className="text-red-500">*</span>
                </label>
                <select
                  value={selection.inventory_item_id}
                  onChange={(e) => updatePackaging(index, 'inventory_item_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">-- Select Item --</option>
                  {packagingItems
                    .filter(p => p.packaging_type === selection.packaging_type)
                    .map(pkg => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} - {pkg.available_quantity} available
                      </option>
                    ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={selection.quantity_used || ''}
                  onChange={(e) => updatePackaging(index, 'quantity_used', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="100"
                  step="1"
                  min="0"
                />
                {isInsufficientStock && (
                  <p className="text-xs text-red-600 mt-1">
                    Only {item?.available_quantity} available
                  </p>
                )}
              </div>

              {/* Remove Button */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removePackaging(index)}
                  className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Item Details */}
            {item && selection.inventory_item_id && (
              <div className="mt-3 bg-purple-50 border border-purple-200 rounded p-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-purple-700">Supplier:</span>
                    <span className="ml-1 text-purple-900">{item.supplier}</span>
                  </div>
                  <div>
                    <span className="text-purple-700">Lot:</span>
                    <span className="ml-1 text-purple-900">{item.lot_number}</span>
                  </div>
                  <div>
                    <span className="text-purple-700">Cost/unit:</span>
                    <span className="ml-1 text-purple-900">${item.cost_per_unit.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-purple-700 font-semibold">Total:</span>
                    <span className="ml-1 text-purple-900 font-semibold">${selection.total_cost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Total Summary */}
      {selections.length > 0 && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-700">Total Items:</span>
              <span className="ml-2 text-gray-900 font-semibold">{selections.length}</span>
            </div>
            <div>
              <span className="text-gray-700">Total Units:</span>
              <span className="ml-2 text-gray-900 font-semibold">
                {selections.reduce((sum, s) => sum + s.quantity_used, 0)}
              </span>
            </div>
            <div className="md:col-span-2">
              <span className="text-gray-700">Total Packaging Cost:</span>
              <span className="ml-2 text-gray-900 font-semibold">
                ${selections.reduce((sum, s) => sum + s.total_cost, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
