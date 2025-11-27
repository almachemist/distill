'use client'

import { useEffect, useState } from 'react'

interface LabelRequirement {
  product: string
  currentStock: number
  production2026: number
  remaining: number
  orderNeeded: number
  status: 'SUFFICIENT' | 'ORDER_REQUIRED' | 'CRITICAL_ORDER_REQUIRED'
  recommendedOrder: number
}

export default function LabelRequirementsPage() {
  const [requirements, setRequirements] = useState<LabelRequirement[]>([])

  useEffect(() => {
    // Load the label requirements data WITH 30% BUFFER
    const labelData: LabelRequirement[] = [
      // CRITICAL - Merchant Mae
      {
        product: 'MM Vodka 700ml',
        currentStock: 150,
        production2026: 4782,
        remaining: -6067,
        orderNeeded: 6067,
        status: 'CRITICAL_ORDER_REQUIRED',
        recommendedOrder: 6500
      },
      {
        product: 'MM Gin 700ml',
        currentStock: 800,
        production2026: 2391,
        remaining: -2308,
        orderNeeded: 2308,
        status: 'CRITICAL_ORDER_REQUIRED',
        recommendedOrder: 2500
      },
      {
        product: 'MM White Rum 700ml',
        currentStock: 0,
        production2026: 1170,
        remaining: -1521,
        orderNeeded: 1521,
        status: 'CRITICAL_ORDER_REQUIRED',
        recommendedOrder: 2000
      },
      {
        product: 'MM Dark Rum 700ml',
        currentStock: 500,
        production2026: 672,
        remaining: -374,
        orderNeeded: 374,
        status: 'ORDER_REQUIRED',
        recommendedOrder: 500
      },
      {
        product: 'Rainforest Gin 200ml',
        currentStock: 600,
        production2026: 632,
        remaining: -222,
        orderNeeded: 222,
        status: 'ORDER_REQUIRED',
        recommendedOrder: 500
      },
      {
        product: 'Signature Gin 700ml',
        currentStock: 930,
        production2026: 880,
        remaining: -214,
        orderNeeded: 214,
        status: 'ORDER_REQUIRED',
        recommendedOrder: 500
      },
      // SUFFICIENT - Devil's Thumb
      {
        product: 'Rainforest Gin 700ml',
        currentStock: 2300,
        production2026: 1316,
        remaining: 589,
        orderNeeded: 0,
        status: 'SUFFICIENT',
        recommendedOrder: 0
      },
      {
        product: 'Signature Gin 200ml',
        currentStock: 1200,
        production2026: 223,
        remaining: 910,
        orderNeeded: 0,
        status: 'SUFFICIENT',
        recommendedOrder: 0
      },
      {
        product: 'Cane Spirit 700ml',
        currentStock: 1300,
        production2026: 290,
        remaining: 1010,
        orderNeeded: 0,
        status: 'SUFFICIENT',
        recommendedOrder: 0
      },
      {
        product: 'Cane Spirit 200ml',
        currentStock: 800,
        production2026: 64,
        remaining: 736,
        orderNeeded: 0,
        status: 'SUFFICIENT',
        recommendedOrder: 0
      },
      {
        product: 'MM Coffee Liqueur 700ml',
        currentStock: 1800,
        production2026: 300,
        remaining: 1500,
        orderNeeded: 0,
        status: 'SUFFICIENT',
        recommendedOrder: 0
      }
    ]

    setRequirements(labelData)
  }, [])

  const criticalOrders = requirements.filter(r => r.status === 'CRITICAL_ORDER_REQUIRED')
  const regularOrders = requirements.filter(r => r.status === 'ORDER_REQUIRED')
  const sufficient = requirements.filter(r => r.status === 'SUFFICIENT')

  const totalOrderQuantity = requirements.reduce((sum, r) => sum + r.recommendedOrder, 0)

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Label Requirements for 2026 Production</h1>
        <p className="text-gray-600">Based on production plan - Total bottles: 13,531</p>
        <p className="text-blue-600 font-semibold mt-2">✨ Includes 30% buffer for 2027 early production & bulk pricing</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">CRITICAL ORDERS</h3>
          <p className="text-4xl font-bold text-red-600">{criticalOrders.length}</p>
          <p className="text-sm text-red-700 mt-2">Order immediately</p>
        </div>
        
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
          <h3 className="text-yellow-800 font-semibold mb-2">ORDERS NEEDED</h3>
          <p className="text-4xl font-bold text-yellow-600">{regularOrders.length}</p>
          <p className="text-sm text-yellow-700 mt-2">Order soon</p>
        </div>
        
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-blue-800 font-semibold mb-2">TOTAL LABELS TO ORDER</h3>
          <p className="text-4xl font-bold text-blue-600">{totalOrderQuantity.toLocaleString()}</p>
          <p className="text-sm text-blue-700 mt-2">Across {criticalOrders.length + regularOrders.length} products</p>
          <p className="text-xs text-blue-600 mt-1">+30% buffer included</p>
        </div>
      </div>

      {/* Critical Orders */}
      {criticalOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-red-600">CRITICAL - Order Immediately</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-red-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Product</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Current Stock</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">2026 Production</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Shortage</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Recommended Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {criticalOrders.map((req, idx) => (
                  <tr key={idx} className="hover:bg-red-50">
                    <td className="px-6 py-4 font-semibold">{req.product}</td>
                    <td className="px-6 py-4 text-right">{req.currentStock.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-semibold">{req.production2026.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-red-600 font-bold">{Math.abs(req.remaining).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="bg-red-600 text-white px-4 py-2 rounded font-bold">
                        {req.recommendedOrder.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Regular Orders */}
      {regularOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-yellow-600">HIGH PRIORITY - Order Soon</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-yellow-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Product</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Current Stock</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">2026 Production</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Shortage</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Recommended Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {regularOrders.map((req, idx) => (
                  <tr key={idx} className="hover:bg-yellow-50">
                    <td className="px-6 py-4 font-semibold">{req.product}</td>
                    <td className="px-6 py-4 text-right">{req.currentStock.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-semibold">{req.production2026.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-yellow-600 font-bold">{Math.abs(req.remaining).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="bg-yellow-600 text-white px-4 py-2 rounded font-bold">
                        {req.recommendedOrder.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sufficient Stock */}
      {sufficient.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-green-600">Sufficient Stock - No Order Needed</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-green-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Product</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Current Stock</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">2026 Production</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Remaining After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sufficient.map((req, idx) => (
                  <tr key={idx} className="hover:bg-green-50">
                    <td className="px-6 py-4">{req.product}</td>
                    <td className="px-6 py-4 text-right">{req.currentStock.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">{req.production2026.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-green-600 font-semibold">+{req.remaining.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">ORDER SUMMARY</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Labels to Order:</h3>
            <ul className="space-y-2">
              {[...criticalOrders, ...regularOrders].map((req, idx) => (
                <li key={idx} className="flex justify-between items-center bg-white/10 rounded px-4 py-2">
                  <span>{req.product}</span>
                  <span className="font-bold">{req.recommendedOrder.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-center items-center bg-white/10 rounded-lg p-6">
            <p className="text-sm uppercase mb-2">Total Labels to Order</p>
            <p className="text-6xl font-bold mb-4">{totalOrderQuantity.toLocaleString()}</p>
            <p className="text-sm">Across {criticalOrders.length + regularOrders.length} products</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-bold mb-3">Notes:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Each bottle uses 1 label (front label only)</li>
          <li><strong>30% buffer included</strong> for 2027 early production, printing defects, and labeling mistakes</li>
          <li>Recommended quantities are rounded to standard printing minimums (500, 1000, 1500, 2000, 2500, 5000, 6500)</li>
          <li>Total 2026 production: 13,531 bottles</li>
          <li>Total labels needed with 30% buffer: ~17,590 labels</li>
          <li>Bulk pricing: Ordering larger quantities saves money per label</li>
        </ul>
      </div>
    </div>
  )
}

