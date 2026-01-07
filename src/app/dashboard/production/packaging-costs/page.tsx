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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper"></div>
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
          <h1 className="text-3xl font-bold text-graphite">Packaging Cost Analysis</h1>
          <p className="text-graphite/70 mt-2">Calculate packaging costs for your gin products</p>
        </div>
      </div>

      {/* Input Parameters */}
      <div className="bg-white rounded-lg shadow-soft border border-copper-30 p-6">
        <h2 className="text-xl font-semibold text-graphite mb-4">Packaging Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="ginType" className="block text-sm font-medium text-graphite">Gin Type</label>
            <select
              id="ginType"
              value={selectedGin}
              onChange={(e) => setSelectedGin(e.target.value as any)}
              className="mt-1 block w-full border border-copper-30 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-copper focus:border-copper sm:text-sm text-graphite"
            >
              {ginTypes.map(gin => (
                <option key={gin.key} value={gin.key}>{gin.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="bottlingABV" className="block text-sm font-medium text-graphite">Bottling ABV (%)</label>
            <input
              type="number"
              id="bottlingABV"
              value={bottlingABV}
              onChange={(e) => setBottlingABV(parseFloat(e.target.value) || 0)}
              className="mt-1 block w-full border border-copper-30 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-copper focus:border-copper sm:text-sm text-graphite"
            />
          </div>
          <div>
            <label htmlFor="bottleSizeL" className="block text-sm font-medium text-graphite">Bottle Size (L)</label>
            <input
              type="number"
              id="bottleSizeL"
              value={bottleSizeL}
              onChange={(e) => setBottleSizeL(parseFloat(e.target.value) || 0)}
              className="mt-1 block w-full border border-copper-30 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-copper focus:border-copper sm:text-sm text-graphite"
            />
          </div>
          <div>
            <label htmlFor="bottleCount" className="block text-sm font-medium text-graphite">Bottle Count</label>
            <input
              type="number"
              id="bottleCount"
              value={bottleCount}
              onChange={(e) => setBottleCount(parseInt(e.target.value) || 0)}
              className="mt-1 block w-full border border-copper-30 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-copper focus:border-copper sm:text-sm text-graphite"
            />
          </div>
        </div>
      </div>

      {packagingCosts && batchCosts && lalCosts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Per Bottle Costs */}
          <div className="bg-white rounded-lg shadow-soft border border-copper-30 p-6">
            <h2 className="text-xl font-semibold text-graphite mb-4">Packaging Cost per Bottle</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-graphite/70">Bottle:</span>
                <span className="font-medium">${packagingCosts.bottleCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite/70">Closure:</span>
                <span className="font-medium">${packagingCosts.closureCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite/70">Labels:</span>
                <span className="font-medium">${packagingCosts.labelCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite/70">Box:</span>
                <span className="font-medium">${packagingCosts.boxCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite/70">Inserts:</span>
                <span className="font-medium">${packagingCosts.insertCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite/70">Seals:</span>
                <span className="font-medium">${packagingCosts.sealCost.toFixed(2)}</span>
              </div>
              <div className="border-t border-copper-30 pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total per Bottle:</span>
                  <span>${packagingCosts.totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Batch Costs */}
          <div className="bg-white rounded-lg shadow-soft border border-copper-30 p-6">
            <h2 className="text-xl font-semibold text-graphite mb-4">Batch Costs ({bottleCount} bottles)</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-graphite/70">Bottles:</span>
                <span className="font-medium">${batchCosts.costBreakdown.bottles.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite/70">Closures:</span>
                <span className="font-medium">${batchCosts.costBreakdown.closures.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite/70">Labels:</span>
                <span className="font-medium">${batchCosts.costBreakdown.labels.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite/70">Boxes:</span>
                <span className="font-medium">${batchCosts.costBreakdown.boxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite/70">Inserts:</span>
                <span className="font-medium">${batchCosts.costBreakdown.inserts.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite/70">Seals:</span>
                <span className="font-medium">${batchCosts.costBreakdown.seals.toFixed(2)}</span>
              </div>
              <div className="border-t border-copper-30 pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Batch Cost:</span>
                  <span>${batchCosts.totalBatchCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* LAL Costs */}
          <div className="bg-white rounded-lg shadow-soft border border-copper-30 p-6">
            <h2 className="text-xl font-semibold text-graphite mb-4">Cost per LAL</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-graphite/70">Packaging Cost per LAL:</span>
                <span className="font-medium">${lalCosts.costPerLAL.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite/70">Bottles per LAL:</span>
                <span className="font-medium">{lalCosts.bottlesPerLAL.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite/70">LAA per Bottle:</span>
                <span className="font-medium">{(bottleSizeL * (bottlingABV / 100)).toFixed(3)} LAA</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-beige rounded-lg border border-copper-30">
              <h4 className="text-sm font-medium text-graphite mb-2">Bottling Details</h4>
              <div className="text-sm text-graphite/80 space-y-1">
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
      <div className="bg-white rounded-lg shadow-soft border border-copper-30 p-6">
        <h2 className="text-xl font-semibold text-graphite mb-4">Packaging Items Reference</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-copper-15">
            <thead className="bg-beige">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-graphite uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-graphite uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-graphite uppercase tracking-wider">Unit Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-graphite uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-graphite uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-copper-15">
              {packagingItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-graphite">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-graphite/70 capitalize">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-graphite/70">
                    ${item.unitCostAUD.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-graphite/70">
                    {item.supplier || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-graphite/70">
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









