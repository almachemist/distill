'use client'

import React, { useState } from 'react'
import { fy2025MasterSummary, formatNumber, formatPercentage, formatVolume, formatCurrency } from '@/modules/production/data/fy2025-master-summary.data'

export default function FY2025AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'stills' | 'monthly' | 'performance' | 'costs'>('overview')
  const summary = fy2025MasterSummary

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'products', label: 'Products', icon: '🍸' },
    { id: 'stills', label: 'Stills', icon: '⚗️' },
    { id: 'monthly', label: 'Monthly', icon: '📅' },
    { id: 'performance', label: 'Performance', icon: '🎯' },
    { id: 'costs', label: 'Costs', icon: '💰' }
  ]

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">FY2025 Distillation Analytics</h1>
            <p className="mt-2 text-gray-600">Comprehensive analysis of distillation performance and efficiency</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab summary={summary} />}
        {activeTab === 'products' && <ProductsTab summary={summary} />}
        {activeTab === 'stills' && <StillsTab summary={summary} />}
        {activeTab === 'monthly' && <MonthlyTab summary={summary} />}
        {activeTab === 'performance' && <PerformanceTab summary={summary} />}
        {activeTab === 'costs' && <CostsTab summary={summary} />}
      </div>
    </div>
  )
}

// Overview Tab Component
function OverviewTab({ summary }: { summary: any }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Runs"
          value={summary.overview.totalRuns}
          subtitle="distillation sessions"
          color="blue"
        />
        <MetricCard
          title="LAL Charged"
          value={formatVolume(summary.overview.totalLALCharged)}
          subtitle="total input"
          color="green"
        />
        <MetricCard
          title="LAL Recovered"
          value={formatVolume(summary.overview.totalLALRecovered)}
          subtitle="total output"
          color="purple"
        />
        <MetricCard
          title="Overall Efficiency"
          value={formatPercentage(summary.overview.overallEfficiency)}
          subtitle="recovery rate"
          color="orange"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Volume In"
          value={formatVolume(summary.overview.totalVolumeIn)}
          subtitle="total charged"
          color="indigo"
        />
        <MetricCard
          title="Volume Out"
          value={formatVolume(summary.overview.totalVolumeOut)}
          subtitle="total produced"
          color="pink"
        />
        <MetricCard
          title="Spirit Yield"
          value={formatPercentage(summary.overview.spiritYield)}
          subtitle="volume efficiency"
          color="teal"
        />
      </div>

      {/* Quality Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{formatPercentage(summary.qualityMetrics.averageABV)}</div>
            <div className="text-sm text-gray-600">Average ABV</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{formatPercentage(summary.qualityMetrics.consistencyScore)}</div>
            <div className="text-sm text-gray-600">Consistency Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{formatPercentage(summary.qualityMetrics.recoveryRate)}</div>
            <div className="text-sm text-gray-600">Recovery Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{formatPercentage(summary.qualityMetrics.feintsRecovery)}</div>
            <div className="text-sm text-gray-600">Feints Recovery</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Products Tab Component
function ProductsTab({ summary }: { summary: any }) {
  const products = [
    { key: 'gin', label: 'Gin', color: 'green' },
    { key: 'vodka', label: 'Vodka', color: 'blue' },
    { key: 'ethanol', label: 'Ethanol', color: 'purple' }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const data = summary.byProduct[product.key]
          return (
            <div key={product.key} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{product.label}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Runs:</span>
                  <span className="font-medium">{data.runs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">LAL Charged:</span>
                  <span className="font-medium">{formatVolume(data.lalCharged)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">LAL Recovered:</span>
                  <span className="font-medium">{formatVolume(data.lalRecovered)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Efficiency:</span>
                  <span className="font-medium">{formatPercentage(data.efficiency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Volume:</span>
                  <span className="font-medium">{formatVolume(data.totalVolume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg ABV:</span>
                  <span className="font-medium">{formatPercentage(data.averageABV)}</span>
                </div>
                {product.key === 'gin' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Botanicals Used:</span>
                      <span className="font-medium">{formatNumber(data.botanicalsUsed)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Botanicals/LAL:</span>
                      <span className="font-medium">{formatNumber(data.averageBotanicalsPerLAL)}g</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Stills Tab Component
function StillsTab({ summary }: { summary: any }) {
  const stills = [
    { key: 'carrie', label: 'Carrie', color: 'blue' },
    { key: 'roberta', label: 'Roberta', color: 'green' }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stills.map((still) => {
          const data = summary.byStill[still.key]
          return (
            <div key={still.key} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{still.label} Still</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Runs:</span>
                  <span className="font-medium">{data.runs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">LAL Charged:</span>
                  <span className="font-medium">{formatVolume(data.lalCharged)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">LAL Recovered:</span>
                  <span className="font-medium">{formatVolume(data.lalRecovered)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Efficiency:</span>
                  <span className="font-medium">{formatPercentage(data.efficiency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Volume:</span>
                  <span className="font-medium">{formatVolume(data.totalVolume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Run Time:</span>
                  <span className="font-medium">{formatNumber(data.averageRunTime)}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Power Consumption:</span>
                  <span className="font-medium">{formatNumber(data.powerConsumption)}A</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Monthly Tab Component
function MonthlyTab({ summary }: { summary: any }) {
  const months = Object.entries(summary.monthlyBreakdown).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Runs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LAL Charged</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LAL Recovered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {months.map(([month, data]: [string, any]) => (
                <tr key={month}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.runs}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatVolume(data.lalCharged)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatVolume(data.lalRecovered)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPercentage(data.efficiency)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatVolume(data.volumeProcessed)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.products.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Performance Tab Component
function PerformanceTab({ summary }: { summary: any }) {
  return (
    <div className="space-y-6">
      {/* Top Performing Runs */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Runs</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Still</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LAL Recovered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summary.topPerformingRuns.map((run: any, index: number) => (
                <tr key={run.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{run.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{run.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{run.still}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPercentage(run.efficiency)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatVolume(run.lalRecovered)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      run.productType === 'gin' ? 'bg-green-100 text-green-800' :
                      run.productType === 'vodka' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {run.productType}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Efficiency Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficiency Trends</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Runs</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summary.efficiencyTrends.map((trend: any) => (
                <tr key={trend.month}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trend.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPercentage(trend.efficiency)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatVolume(trend.volume)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trend.runs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Costs Tab Component
function CostsTab({ summary }: { summary: any }) {
  return (
    <div className="space-y-6">
      {/* Cost Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Cost"
          value={formatCurrency(summary.costAnalysis.totalCost)}
          subtitle="all operations"
          color="red"
        />
        <MetricCard
          title="Cost per LAL"
          value={formatCurrency(summary.costAnalysis.costPerLAL)}
          subtitle="efficiency metric"
          color="orange"
        />
        <MetricCard
          title="Cost per Liter"
          value={formatCurrency(summary.costAnalysis.costPerLiter)}
          subtitle="volume metric"
          color="yellow"
        />
        <MetricCard
          title="Electricity Cost"
          value={formatCurrency(summary.costAnalysis.electricityCost)}
          subtitle="power consumption"
          color="blue"
        />
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Electricity:</span>
              <span className="font-medium">{formatCurrency(summary.costAnalysis.electricityCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Water:</span>
              <span className="font-medium">{formatCurrency(summary.costAnalysis.waterCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ethanol:</span>
              <span className="font-medium">{formatCurrency(summary.costAnalysis.ethanolCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Botanicals:</span>
              <span className="font-medium">{formatCurrency(summary.costAnalysis.botanicalCost)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.costAnalysis.totalCost)}</div>
              <div className="text-sm text-gray-600">Total Operating Cost</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{formatCurrency(summary.costAnalysis.costPerLAL)}</div>
              <div className="text-sm text-gray-600">Cost per LAL</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{formatCurrency(summary.costAnalysis.costPerLiter)}</div>
              <div className="text-sm text-gray-600">Cost per Liter</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Metric Card Component
function MetricCard({ title, value, subtitle, color }: { title: string, value: string, subtitle: string, color: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    pink: 'bg-pink-50 text-pink-600',
    teal: 'bg-teal-50 text-teal-600'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-md p-3 ${colorClasses[color as keyof typeof colorClasses]}`}>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">{subtitle}</div>
        </div>
      </div>
    </div>
  )
}

