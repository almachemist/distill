'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface EthanolBatch {
  id: string
  name: string
  abv: number
  available_quantity: number
  cost_per_liter: number
  supplier: string
  lot_number: string
  expiry_date?: string
}

export interface EthanolSelection {
  inventory_item_id: string
  item_name: string
  quantity_l: number
  abv: number
  cost_per_unit: number
  total_cost: number
  supplier: string
  lot_number: string
}

interface EthanolBatchSelectorProps {
  value?: EthanolSelection
  onChange: (selection: EthanolSelection | null) => void
  requiredQuantity?: number
}

export function EthanolBatchSelector({ value, onChange, requiredQuantity }: EthanolBatchSelectorProps) {
  const [ethanolBatches, setEthanolBatches] = useState<EthanolBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBatchId, setSelectedBatchId] = useState<string>(value?.inventory_item_id || '')
  const [quantity, setQuantity] = useState<number>(value?.quantity_l || requiredQuantity || 0)
  const [abv, setAbv] = useState<number>(value?.abv || 96)
  
  const supabase = createClient()

  useEffect(() => {
    loadEthanolBatches()
  }, [])

  const loadEthanolBatches = async () => {
    try {
      // Query items table for ethanol/neutral spirit items
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('id, name, abv_pct, category')
        .or('category.eq.neutral_spirit,category.eq.ethanol,name.ilike.%ethanol%,name.ilike.%spirit%')
        .order('name')

      if (itemsError) throw itemsError

      // For each item, get available lots with quantities
      const batchesWithStock = await Promise.all(
        (items || []).map(async (item: any) => {
          const { data: lots, error: lotsError } = await supabase
            .from('lots')
            .select('id, code, qty, cost_per_unit, supplier_id, note, expiry_date')
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
            abv: item.abv_pct || 96,
            available_quantity: totalQty,
            cost_per_liter: avgCost,
            supplier: supplierName,
            lot_number: lotWithSupplier?.code || 'N/A',
            expiry_date: lotWithSupplier?.expiry_date
          }
        })
      )

      setEthanolBatches((batchesWithStock || [])
        .filter((b: any) => b && b.available_quantity > 0) as EthanolBatch[])
    } catch (error) {
      console.error('Error loading ethanol batches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBatchChange = (batchId: string) => {
    setSelectedBatchId(batchId)
    const batch = ethanolBatches.find(b => b.id === batchId)
    
    if (batch) {
      setAbv(batch.abv)
      const selection: EthanolSelection = {
        inventory_item_id: batch.id,
        item_name: batch.name,
        quantity_l: quantity,
        abv: batch.abv,
        cost_per_unit: batch.cost_per_liter,
        total_cost: quantity * batch.cost_per_liter,
        supplier: batch.supplier,
        lot_number: batch.lot_number
      }
      onChange(selection)
    } else {
      onChange(null)
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity)
    const batch = ethanolBatches.find(b => b.id === selectedBatchId)
    
    if (batch) {
      const selection: EthanolSelection = {
        inventory_item_id: batch.id,
        item_name: batch.name,
        quantity_l: newQuantity,
        abv: abv,
        cost_per_unit: batch.cost_per_liter,
        total_cost: newQuantity * batch.cost_per_liter,
        supplier: batch.supplier,
        lot_number: batch.lot_number
      }
      onChange(selection)
    }
  }

  if (loading) {
    return <div className="text-gray-500">Loading ethanol batches...</div>
  }

  const selectedBatch = ethanolBatches.find(b => b.id === selectedBatchId)
  const isInsufficientStock = selectedBatch && quantity > selectedBatch.available_quantity

  return (
    <div className="space-y-4">
      {/* Ethanol Batch Selector */}
      <div>
        <label htmlFor="ethanol_batch_select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Ethanol Batch <span className="text-red-500">*</span>
        </label>
        <select
          id="ethanol_batch_select"
          value={selectedBatchId}
          onChange={(e) => handleBatchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">-- Select Ethanol Batch --</option>
          {ethanolBatches.map(batch => (
            <option key={batch.id} value={batch.id}>
              {batch.name} - {batch.abv}% ABV - {batch.available_quantity.toFixed(1)}L available - ${batch.cost_per_liter.toFixed(2)}/L
            </option>
          ))}
        </select>
        {ethanolBatches.length === 0 && (
          <p className="text-sm text-red-600 mt-1">No ethanol batches available in inventory</p>
        )}
      </div>

      {/* Quantity Input */}
      {selectedBatchId && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="ethanol_quantity_l" className="block text-sm font-medium text-gray-700 mb-2">
              Quantity (L) <span className="text-red-500">*</span>
            </label>
            <input
              id="ethanol_quantity_l"
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="500"
              step="0.1"
              min="0"
            />
            {isInsufficientStock && (
              <p className="text-sm text-red-600 mt-1">
                Insufficient stock! Only {selectedBatch?.available_quantity.toFixed(1)}L available
              </p>
            )}
          </div>
          <div>
            <label htmlFor="ethanol_abv_percent" className="block text-sm font-medium text-gray-700 mb-2">
              ABV (%)
            </label>
            <input
              id="ethanol_abv_percent"
              type="number"
              value={abv}
              onChange={(e) => setAbv(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="96"
              step="0.1"
              min="0"
              max="100"
            />
          </div>
        </div>
      )}

      {/* Batch Details */}
      {selectedBatch && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Batch Details</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-blue-700">Supplier:</span>
              <span className="ml-2 text-blue-900">{selectedBatch.supplier}</span>
            </div>
            <div>
              <span className="text-blue-700">Lot Number:</span>
              <span className="ml-2 text-blue-900">{selectedBatch.lot_number}</span>
            </div>
            <div>
              <span className="text-blue-700">Available:</span>
              <span className="ml-2 text-blue-900">{selectedBatch.available_quantity.toFixed(1)} L</span>
            </div>
            <div>
              <span className="text-blue-700">Cost per L:</span>
              <span className="ml-2 text-blue-900">${selectedBatch.cost_per_liter.toFixed(2)}</span>
            </div>
            {selectedBatch.expiry_date && (
              <div>
                <span className="text-blue-700">Expiry:</span>
                <span className="ml-2 text-blue-900">{new Date(selectedBatch.expiry_date).toLocaleDateString()}</span>
              </div>
            )}
            <div>
              <span className="text-blue-700 font-semibold">Total Cost:</span>
              <span className="ml-2 text-blue-900 font-semibold">${(quantity * selectedBatch.cost_per_liter).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
