'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface InventoryStats {
  totalItems: number
  totalValue: number
  lowStockItems: number
  alcoholItems: number
  recentTransactions: number
}

export default function InventoryReportsPage() {
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    alcoholItems: 0,
    recentTransactions: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [activeTab, setActiveTab] = useState<'inventory' | 'costs' | 'production'>('inventory')

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        totalItems: 25,
        totalValue: 15420.50,
        lowStockItems: 3,
        alcoholItems: 8,
        recentTransactions: 12
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive analytics and cost analysis for your distillery</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'inventory', label: 'Inventory Reports', description: 'Stock levels and inventory analytics' },
            { key: 'costs', label: 'Cost Analysis', description: 'Production costs and financial analysis' },
            { key: 'production', label: 'Production Reports', description: 'Distillation sessions and efficiency' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-left">
                <div>{tab.label}</div>
                <div className="text-xs font-normal text-gray-400">{tab.description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Items</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalItems}</dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Low Stock Items</dt>
                  <dd className="mt-1 text-3xl font-semibold text-yellow-600">{stats.lowStockItems}</dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Alcohol Items</dt>
                  <dd className="mt-1 text-3xl font-semibold text-red-600">{stats.alcoholItems}</dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Value</dt>
                  <dd className="mt-1 text-3xl font-semibold text-green-600">${stats.totalValue.toFixed(2)}</dd>
                </div>
              </div>
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Items by Category</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">RAW MATERIALS</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">12 items</span>
                      <span className="text-sm font-medium text-gray-900">48.0%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-red-500 mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">FINISHED GOODS</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">8 items</span>
                      <span className="text-sm font-medium text-gray-900">32.0%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">BOTANICALS</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">5 items</span>
                      <span className="text-sm font-medium text-gray-900">20.0%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Status Overview</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">In Stock</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">20 items</span>
                      <span className="text-sm font-medium text-green-600">80.0%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-yellow-500 mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">Low Stock</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">3 items</span>
                      <span className="text-sm font-medium text-yellow-600">12.0%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-red-500 mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">Out of Stock</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">2 items</span>
                      <span className="text-sm font-medium text-red-600">8.0%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Note
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Juniper Berries
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-green-600">
                          Received
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        5.0 kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date().toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Fresh batch from supplier
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Signature Gin
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-red-600">
                          Consumed
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        2.5 L
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(Date.now() - 86400000).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Bottling run #2024-001
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Low Stock Alert */}
            {stats.lowStockItems > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Low Stock Alert
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        You have {stats.lowStockItems} items with low stock levels. 
                        Consider reordering to avoid production delays.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'costs' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Distillation Costs */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 mb-4">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Distillation Costs</h3>
                  <p className="text-gray-600 mb-4">
                    Energy, water, and ethanol cost analysis for distillation processes
                  </p>
                  <Link
                    href="/dashboard/production/distillation-costs"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    View Distillation Costs
                  </Link>
                </div>
              </div>

              {/* Gin Cost Analysis */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-green-100 mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Gin Cost Analysis</h3>
                  <p className="text-gray-600 mb-4">
                    Complete gin production cost breakdown from batch to bottle
                  </p>
                  <Link
                    href="/dashboard/production/gin-cost-analysis"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    View Gin Costs
                  </Link>
                </div>
              </div>

              {/* Packaging Costs */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 mb-4">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Packaging Costs</h3>
                  <p className="text-gray-600 mb-4">
                    Bottle, label, and packaging cost analysis per gin product
                  </p>
                  <Link
                    href="/dashboard/production/packaging-costs"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    View Packaging Costs
                  </Link>
                </div>
              </div>
            </div>

            {/* Cost Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Analysis Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Production Cost Components</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• <strong>Ethanol:</strong> Raw material cost for spirit base</li>
                    <li>• <strong>Botanicals:</strong> Herbs, spices, and flavoring agents</li>
                    <li>• <strong>Energy:</strong> Electricity for distillation process</li>
                    <li>• <strong>Water:</strong> Cooling and process water costs</li>
                    <li>• <strong>Packaging:</strong> Bottles, labels, closures, boxes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Key Metrics</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• <strong>Cost per LAL:</strong> Cost per Litre of Absolute Alcohol</li>
                    <li>• <strong>Cost per Bottle:</strong> Total production cost per bottle</li>
                    <li>• <strong>Efficiency:</strong> Distillation yield and recovery rates</li>
                    <li>• <strong>Margin Analysis:</strong> Profitability per product line</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'production' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-md bg-orange-100 mb-4">
                  <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Distillation Sessions</h3>
                <p className="text-gray-600 mb-4">
                  Track and analyze your distillation runs with automatic cost calculations and efficiency metrics
                </p>
                <Link
                  href="/dashboard/production/distillation-sessions"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                >
                  View Distillation Sessions
                </Link>
              </div>
            </div>

            {/* Production Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Sessions</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">12</dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Average Efficiency</dt>
                  <dd className="mt-1 text-3xl font-semibold text-green-600">75.9%</dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total LAL Produced</dt>
                  <dd className="mt-1 text-3xl font-semibold text-blue-600">2,847</dd>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}