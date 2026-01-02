'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface BotanicalItem {
  id: string
  name: string
  available_quantity_g: number
  cost_per_kg: number
  supplier: string
  lot_number: string
  expiry_date?: string
}

export interface BotanicalSelection {
  inventory_item_id: string
  botanical_name: string
  quantity_g: number
  cost_per_kg: number
  total_cost: number
  supplier: string
  lot_number: string
  expiry_date?: string
}

interface BotanicalSelectorProps {
  selections: BotanicalSelection[]
  onChange: (selections: BotanicalSelection[]) => void
}

export function BotanicalSelector({ selections, onChange }: BotanicalSelectorProps) {
  const [botanicals, setBotanicals] = useState<BotanicalItem[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    loadBotanicals()
  }, [])

  const loadBotanicals = async () => {
    try {
      // Query items table for botanical items
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('id, name, category')
        .eq('category', 'botanical')
        .order('name')

      if (itemsError) throw itemsError

      // For each item, get available lots with quantities
      const botanicalsWithStock = await Promise.all(
        (items || []).map(async (item: any) => {
          const { data: lots, error: lotsError } = await supabase
            .from('lots')
            .select('id, code, qty, cost_per_unit, supplier_id, expiry_date')
            .eq('item_id', item.id)
            .gt('qty', 0)
            .order('received_date', { ascending: false })

          if (lotsError) {
            console.error('Error loading lots:', lotsError)
            return null
          }

          // Get supplier info
          const lotWithSupplier = lots && lots.length > 0 ? lots[0] : null
          let supplierName = 'Unknown'
          
          if (lotWithSupplier?.supplier_id) {
            const { data: supplier } = await supabase
              .from('suppliers')
              .select('name')
              .eq('id', lotWithSupplier.supplier_id)
              .single()
            
            if (supplier) supplierName = supplier.name
          }

          const totalQty = (lots ?? []).reduce((sum: number, lot: any) => sum + (parseFloat(lot.qty as any) || 0), 0)
          const avgCost = (lots ?? []).length > 0 
            ? (lots ?? []).reduce((sum: number, lot: any) => sum + (parseFloat(lot.cost_per_unit as any) || 0), 0) / (lots ?? []).length 
            : 0

          return {
            id: item.id,
            name: item.name,
            available_quantity_g: totalQty * 1000, // Convert kg to g
            cost_per_kg: avgCost,
            supplier: supplierName,
            lot_number: lotWithSupplier?.code || 'N/A',
            expiry_date: lotWithSupplier?.expiry_date
          }
        })
      )

      setBotanicals((botanicalsWithStock || [])
        .filter((b: any) => b && b.available_quantity_g > 0) as BotanicalItem[])
    } catch (error) {
      console.error('Error loading botanicals:', error)
    } finally {
      setLoading(false)
    }
  }

  const addBotanical = () => {
    onChange([...selections, {
      inventory_item_id: '',
      botanical_name: '',
      quantity_g: 0,
      cost_per_kg: 0,
      total_cost: 0,
      supplier: '',
      lot_number: ''
    }])
  }

  const removeBotanical = (index: number) => {
    onChange(selections.filter((_, i) => i !== index))
  }

  const updateBotanical = (index: number, field: keyof BotanicalSelection, value: any) => {
    const updated = [...selections]
    updated[index] = { ...updated[index], [field]: value }
    
    // If changing the botanical, update all related fields
    if (field === 'inventory_item_id') {
      const botanical = botanicals.find(b => b.id === value)
      if (botanical) {
        updated[index] = {
          ...updated[index],
          inventory_item_id: botanical.id,
          botanical_name: botanical.name,
          cost_per_kg: botanical.cost_per_kg,
          supplier: botanical.supplier,
          lot_number: botanical.lot_number,
          expiry_date: botanical.expiry_date,
          total_cost: (updated[index].quantity_g / 1000) * botanical.cost_per_kg
        }
      }
    }
    
    // If changing quantity, recalculate cost
    if (field === 'quantity_g') {
      updated[index].total_cost = (value / 1000) * updated[index].cost_per_kg
    }
    
    onChange(updated)
  }

  if (loading) {
    return <div className="text-gray-500">Loading botanicals...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Botanicals Used</h3>
        <button
          type="button"
          onClick={addBotanical}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
        >
          + Add Botanical
        </button>
      </div>

      {selections.length === 0 && (
        <p className="text-gray-500 text-sm">No botanicals added yet. Click "Add Botanical" to start.</p>
      )}

      {selections.map((selection, index) => {
        const botanical = botanicals.find(b => b.id === selection.inventory_item_id)
        const isInsufficientStock = botanical && selection.quantity_g > botanical.available_quantity_g

        return (
          <div key={index} className="bg-white border border-gray-300 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Botanical Selector */}
              <div className="md:col-span-2">
                <label htmlFor={`botanical_select_${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                  Botanical <span className="text-red-500">*</span>
                </label>
                <select
                  id={`botanical_select_${index}`}
                  value={selection.inventory_item_id}
                  onChange={(e) => updateBotanical(index, 'inventory_item_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">-- Select Botanical --</option>
                  {botanicals.map(bot => (
                    <option key={bot.id} value={bot.id}>
                      {bot.name} - {(bot.available_quantity_g / 1000).toFixed(2)}kg available
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor={`botanical_qty_g_${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity (g) <span className="text-red-500">*</span>
                </label>
                <input
                  id={`botanical_qty_g_${index}`}
                  type="number"
                  value={selection.quantity_g || ''}
                  onChange={(e) => updateBotanical(index, 'quantity_g', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="1000"
                  step="1"
                  min="0"
                />
                {isInsufficientStock && (
                  <p className="text-xs text-red-600 mt-1">
                    Only {botanical?.available_quantity_g.toFixed(0)}g available
                  </p>
                )}
              </div>

              {/* Remove Button */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeBotanical(index)}
                  className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Botanical Details */}
            {botanical && selection.inventory_item_id && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded p-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-green-700">Supplier:</span>
                    <span className="ml-1 text-green-900">{botanical.supplier}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Lot:</span>
                    <span className="ml-1 text-green-900">{botanical.lot_number}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Cost/kg:</span>
                    <span className="ml-1 text-green-900">${botanical.cost_per_kg.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-semibold">Total:</span>
                    <span className="ml-1 text-green-900 font-semibold">${selection.total_cost.toFixed(2)}</span>
                  </div>
                  {botanical.expiry_date && (
                    <div className="md:col-span-2">
                      <span className="text-green-700">Expiry:</span>
                      <span className="ml-1 text-green-900">{new Date(botanical.expiry_date).toLocaleDateString()}</span>
                    </div>
                  )}
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
              <span className="text-gray-700">Total Botanicals:</span>
              <span className="ml-2 text-gray-900 font-semibold">{selections.length}</span>
            </div>
            <div>
              <span className="text-gray-700">Total Weight:</span>
              <span className="ml-2 text-gray-900 font-semibold">
                {selections.reduce((sum, s) => sum + s.quantity_g, 0).toFixed(0)}g
              </span>
            </div>
            <div className="md:col-span-2">
              <span className="text-gray-700">Total Botanical Cost:</span>
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
