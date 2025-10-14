'use client'

import { useState, useEffect } from 'react'
import { PackagingCostCalculator } from '@/modules/production/services/packaging-cost-calculator.service'
import { PackagingCostBreakdown } from '@/modules/production/types/packaging.types'
import { packagingItems } from '@/modules/production/data/packaging-items.data'

export default function PackagingCostAnalysisPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGin, setSelectedGin] = useState<keyof typeof import('@/modules/production/data/packaging-items.data').ginPackagingConfigs>('signature-dry-gin')
  const [bottlingABV, setBottlingABV] = useState(40)
  const [bottleSizeL, setBottleSizeL] = useState(0.7)
  const [bottleCount, setBottleCount] = useState(100)
  const [packagingCosts, setPackagingCosts] = useState<PackagingCostBreakdown | null>(null)
  const [batchCosts, setBatchCosts] = useState<any>(null)
  const [lalCosts, setLalCosts] = useState<any>(null)

  const ginTypes = [
    { key: 'signature-dry-gin', label: 'Signature Dry Gin' },
    { key: 'navy-strength-gin', label: 'Navy Strength Gin' },
    { key: 'rainforest-gin', label: 'Rainforest Gin' },
    { key: 'merchant-mae-gin', label: 'Merchant Mae Gin' },
    { key: 'dry-season-gin', label: 'Dry Season Gin' },
    { key: 'wet-season-gin', label: 'Wet Season Gin' }
  ] as const

  useEffect(() => {
    setLoading(true)
    try {
      // Calculate packaging costs
      const packagingCost = PackagingCostCalculator.calculateGinPackagingCost(selectedGin)
      setPackagingCosts(packagingCost)

      // Calculate batch costs
      const batchCost = PackagingCostCalculator.calculateBatchPackagingCost(selectedGin, bottleCount)
      setBatchCosts(batchCost)

      // Calculate LAL costs
      const lalCost = PackagingCostCalculator.calculatePackagingCostPerLAL(selectedGin, bottlingABV, bottleSizeL)
      setLalCosts(lalCost)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate packaging costs')
    } finally {
      setLoading(false)
    }
  }, [selectedGin, bottlingABV, bottleSizeL, bottleCount])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Packaging Cost Analysis</h1>
          <p className="text-gray-600 mt-2">Calculate packaging costs for your gin products</p>
        </div>
      </div>

      {/* Input Parameters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Packaging Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="ginType" className="block text-sm font-medium text-gray-700">Gin Type</label>
            <select
              id="ginType"
              value={selectedGin}
              onChange={(e) => setSelectedGin(e.target.value as any)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {ginTypes.map(gin => (
                <option key={gin.key} value={gin.key}>{gin.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="bottlingABV" className="block text-sm font-medium text-gray-700">Bottling ABV (%)</label>
            <input
              type="number"
              id="bottlingABV"
              value={bottlingABV}
              onChange={(e) => setBottlingABV(parseFloat(e.target.value) || 0)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="bottleSizeL" className="block text-sm font-medium text-gray-700">Bottle Size (L)</label>
            <input
              type="number"
              id="bottleSizeL"
              value={bottleSizeL}
              onChange={(e) => setBottleSizeL(parseFloat(e.target.value) || 0)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="bottleCount" className="block text-sm font-medium text-gray-700">Bottle Count</label>
            <input
              type="number"
              id="bottleCount"
              value={bottleCount}
              onChange={(e) => setBottleCount(parseInt(e.target.value) || 0)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {packagingCosts && batchCosts && lalCosts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Per Bottle Costs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Packaging Cost per Bottle</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Bottle:</span>
                <span className="font-medium">${packagingCosts.bottleCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Closure:</span>
                <span className="font-medium">${packagingCosts.closureCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Labels:</span>
                <span className="font-medium">${packagingCosts.labelCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Box:</span>
                <span className="font-medium">${packagingCosts.boxCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inserts:</span>
                <span className="font-medium">${packagingCosts.insertCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Seals:</span>
                <span className="font-medium">${packagingCosts.sealCost.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total per Bottle:</span>
                  <span>${packagingCosts.totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Batch Costs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Batch Costs ({bottleCount} bottles)</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Bottles:</span>
                <span className="font-medium">${batchCosts.costBreakdown.bottles.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Closures:</span>
                <span className="font-medium">${batchCosts.costBreakdown.closures.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Labels:</span>
                <span className="font-medium">${batchCosts.costBreakdown.labels.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Boxes:</span>
                <span className="font-medium">${batchCosts.costBreakdown.boxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inserts:</span>
                <span className="font-medium">${batchCosts.costBreakdown.inserts.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Seals:</span>
                <span className="font-medium">${batchCosts.costBreakdown.seals.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Batch Cost:</span>
                  <span>${batchCosts.totalBatchCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* LAL Costs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cost per LAL</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Packaging Cost per LAL:</span>
                <span className="font-medium">${lalCosts.costPerLAL.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bottles per LAL:</span>
                <span className="font-medium">{lalCosts.bottlesPerLAL.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">LAA per Bottle:</span>
                <span className="font-medium">{(bottleSizeL * (bottlingABV / 100)).toFixed(3)} LAA</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Bottling Details</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Bottle Size: {bottleSizeL} L</p>
                <p>• Bottling ABV: {bottlingABV}%</p>
                <p>• LAA per Bottle: {(bottleSizeL * (bottlingABV / 100)).toFixed(3)} LAA</p>
                <p>• Bottles per LAL: {lalCosts.bottlesPerLAL.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Packaging Items Reference */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Packaging Items Reference</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {packagingItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.unitCostAUD.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.supplier || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}



