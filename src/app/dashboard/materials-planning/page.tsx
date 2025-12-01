'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import materialsData from '@/../../data/materials_requirements_2026.json'

interface MaterialNeed {
  sku: string
  name: string
  category: string
  needed_2026: number
  current_stock: number
  shortage: number
  buffer_30_percent: number
  recommended_order: number
  status: 'CRITICAL' | 'LOW' | 'ADEQUATE' | 'GOOD'
}

export default function MaterialsPlanningPage() {
  const [materials, setMaterials] = useState<MaterialNeed[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      // Get current stock
      const stockMap = new Map<string, number>()

      const { data: items } = await supabase.from('items').select('id, name')

      if (items) {
        for (const item of items) {
          const { data: txns } = await supabase
            .from('inventory_txns')
            .select('quantity, txn_type')
            .eq('item_id', item.id)

          if (txns) {
            let stock = 0
            for (const txn of txns) {
              if (txn.txn_type === 'RECEIVE' || txn.txn_type === 'PRODUCE' || txn.txn_type === 'ADJUST') {
                stock += Number(txn.quantity)
              } else if (txn.txn_type === 'CONSUME' || txn.txn_type === 'DESTROY') {
                stock -= Number(txn.quantity)
              }
            }
            stockMap.set(item.name, stock)
          }
        }
      }

      // Calculate needs
      const results: MaterialNeed[] = []

      for (const material of materialsData.materials) {
        const current = stockMap.get(material.sku) || 0
        const needed = material.quantity_needed
        const shortage = Math.max(0, needed - current)
        const buffer = Math.ceil(shortage * 0.3)
        const recommended = shortage + buffer

        let status: MaterialNeed['status'] = 'GOOD'
        if (current === 0 && needed > 0) status = 'CRITICAL'
        else if (shortage > needed * 0.5) status = 'CRITICAL'
        else if (shortage > 0) status = 'LOW'
        else if (current < needed * 1.2) status = 'ADEQUATE'

        results.push({
          sku: material.sku,
          name: material.name,
          category: material.category,
          needed_2026: needed,
          current_stock: current,
          shortage,
          buffer_30_percent: buffer,
          recommended_order: recommended,
          status
        })
      }

      setMaterials(results.sort((a, b) => {
        const statusOrder = { CRITICAL: 0, LOW: 1, ADEQUATE: 2, GOOD: 3 }
        return statusOrder[a.status] - statusOrder[b.status] || b.shortage - a.shortage
      }))
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-semibold text-neutral-900">2026 Materials Planning</h1>
          <p className="text-sm text-neutral-500 mt-1">Loading...</p>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
          </div>
        </div>
      </div>
    )
  }

  const critical = materials.filter(m => m.status === 'CRITICAL')
  const low = materials.filter(m => m.status === 'LOW')
  const adequate = materials.filter(m => m.status === 'ADEQUATE')
  const good = materials.filter(m => m.status === 'GOOD')
  const totalToOrder = materials.reduce((sum, m) => sum + m.recommended_order, 0)
  const totalNeeded = materials.reduce((sum, m) => sum + m.needed_2026, 0)
  const totalCurrent = materials.reduce((sum, m) => sum + m.current_stock, 0)

  return (
    <div className="min-h-screen bg-neutral-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">2026 Materials Planning</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Complete materials requirements for full year production
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-xl shadow-sm border border-neutral-200 bg-white hover:shadow-md transition-shadow duration-200">
            <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Total Needed 2026</p>
            <p className="text-3xl font-semibold text-neutral-900 mt-2">{totalNeeded.toLocaleString()}</p>
            <p className="text-xs text-neutral-400 mt-1">All materials</p>
          </div>

          <div className="p-5 rounded-xl shadow-sm border border-neutral-200 bg-white hover:shadow-md transition-shadow duration-200">
            <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Current Inventory</p>
            <p className="text-3xl font-semibold text-neutral-900 mt-2">{totalCurrent.toLocaleString()}</p>
            <p className="text-xs text-neutral-400 mt-1">In warehouse</p>
          </div>

          <div className="p-5 rounded-xl shadow-sm border border-red-200 bg-red-50 hover:shadow-md transition-shadow duration-200">
            <p className="text-xs text-red-600 uppercase tracking-wide font-medium">Critical Items</p>
            <p className="text-3xl font-semibold text-red-700 mt-2">{critical.length}</p>
            <p className="text-xs text-red-500 mt-1">Need immediate order</p>
          </div>

          <div className="p-5 rounded-xl shadow-sm border border-blue-200 bg-blue-50 hover:shadow-md transition-shadow duration-200">
            <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">Total to Order</p>
            <p className="text-3xl font-semibold text-blue-700 mt-2">{totalToOrder.toLocaleString()}</p>
            <p className="text-xs text-blue-500 mt-1">With 30% buffer</p>
          </div>
        </div>

        {/* Materials by Category */}
        {['Bottles', 'Labels', 'Corks', 'Caps', 'Sleeves', 'Cartons'].map(category => {
          const items = materials.filter(m => m.category === category)
          if (items.length === 0) return null

          return (
            <div key={category} className="mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-white">
                  <h3 className="text-lg font-semibold text-neutral-900">{category}</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-neutral-500 uppercase tracking-wide">Items</p>
                      <p className="text-sm font-semibold text-neutral-900">{items.length}</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">SKU</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Needed 2026</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Current</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Shortage</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">To Order</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 bg-white">
                      {items.map((item, index) => (
                        <tr key={item.sku} className={`hover:bg-neutral-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-neutral-25'}`}>
                          <td className="px-6 py-4 text-sm text-neutral-900 font-medium">{item.sku}</td>
                          <td className="px-6 py-4 text-sm text-right font-semibold text-neutral-900 tabular-nums">{item.needed_2026.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-right font-medium text-neutral-600 tabular-nums">{item.current_stock.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-right font-semibold text-red-600 tabular-nums">{item.shortage.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-right font-bold text-blue-700 tabular-nums">{item.recommended_order.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-right">
                            {item.status === 'CRITICAL' ? (
                              <span className="inline-flex px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-semibold">Critical</span>
                            ) : item.status === 'LOW' ? (
                              <span className="inline-flex px-3 py-1 rounded-lg bg-orange-100 text-orange-700 text-xs font-semibold">Low</span>
                            ) : item.status === 'ADEQUATE' ? (
                              <span className="inline-flex px-3 py-1 rounded-lg bg-yellow-50 text-yellow-700 text-xs font-semibold">Adequate</span>
                            ) : (
                              <span className="inline-flex px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-semibold">Good</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

