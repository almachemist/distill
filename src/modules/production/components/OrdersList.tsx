'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProductionRepository } from '../services/production.repository'
import type { ProductionOrderListItem, ProductionOrderStatus } from '../types/production.types'

export function OrdersList() {
  const [orders, setOrders] = useState<ProductionOrderListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ProductionOrderStatus | 'all'>('all')
  
  const router = useRouter()
  const productionRepo = new ProductionRepository()

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await productionRepo.fetchProductionOrders()
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load production orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: ProductionOrderStatus) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800'
      case 'released': return 'bg-yellow-100 text-yellow-800'
      case 'in_process': return 'bg-orange-100 text-orange-800'
      case 'complete': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleOrderClick = (order: ProductionOrderListItem) => {
    router.push(`/dashboard/production/orders/${order.id}`)
  }

  const handleStatusChange = async (orderId: string, newStatus: ProductionOrderStatus) => {
    try {
      await productionRepo.updateProductionOrder(orderId, { status: newStatus })
      await loadOrders() // Refresh the list
    } catch (err) {
      alert('Failed to update order status: ' + (err instanceof Error ? err.message : 'Unknown error'))
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
          onClick={loadOrders}
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
        <h1 className="text-2xl font-bold text-gray-900">Production Orders</h1>
        <button
          onClick={() => router.push('/dashboard/recipes')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Start New Batch
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div>
          <label htmlFor="orders_status_filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <select
            id="orders_status_filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProductionOrderStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="planned">Planned</option>
            <option value="released">Released</option>
            <option value="in_process">In Process</option>
            <option value="complete">Complete</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {statusFilter === 'all' 
              ? 'No production orders found.' 
              : `No ${statusFilter} orders found.`
            }
          </p>
          <p className="text-gray-400 mt-2">
            Start a new batch from the recipes page to create your first production order.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product / Recipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleOrderClick(order)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.product_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Recipe: {order.recipe.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.batch_target_l}L
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status as any)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at!).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      {order.status === 'planned' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'released')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Release
                        </button>
                      )}
                      {order.status === 'released' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'in_process')}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          Start
                        </button>
                      )}
                      {order.status === 'in_process' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'complete')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleOrderClick(order)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['planned', 'released', 'in_process', 'complete'] as const).map(status => {
          const count = orders.filter(order => order.status === status).length
          return (
            <div key={status} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600 capitalize">
                {status.replace('_', ' ')}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


