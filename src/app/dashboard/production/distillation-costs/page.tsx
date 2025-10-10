'use client'

import { useState, useEffect } from 'react'

export default function DistillationCostTrackingPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProcess, setSelectedProcess] = useState<'gin' | 'vodka'>('gin')
  const [batchVolume, setBatchVolume] = useState(1000)
  const [sellingPrice, setSellingPrice] = useState(0)
  const [costAnalysis, setCostAnalysis] = useState<any>(null)

  useEffect(() => {
    setLoading(true)
    try {
      // Corrected cost calculations with proper ethanol dilution
      const electricityRate = 0.30972 // $/kWh
      const waterRate = 1.79 // $/kL
      
      // Ethanol cost calculation: 96.8% ABV @ $4.862/L
      // For 1000L @ 50% ABV, we need 500L pure ethanol = 516.5L of 96.8% ethanol
      const batchABV = 96.8
      const productionABV = 50
      const pureEthanolNeeded = 1000 * (productionABV / 100) // 500L pure ethanol
      const ethanolVolumeNeeded = pureEthanolNeeded / (batchABV / 100) // 516.5L of 96.8% ethanol
      const actualEthanolCost = ethanolVolumeNeeded * 4.862 // $2,511.36
      
      // Gin process: 19 hours, average 28A, average 900 L/h water
      const ginEnergyCost = (1.732 * 415 * 28 * 0.9 / 1000) * 19 * electricityRate
      const ginWaterCost = (900 * 19 / 1000) * waterRate
      const ginBotanicalCost = 400
      const ginTotalCost = ginEnergyCost + ginWaterCost + actualEthanolCost + ginBotanicalCost
      
      // Vodka process: 40 hours, average 24A, average 600 L/h water
      const vodkaEnergyCost = (1.732 * 415 * 24 * 0.9 / 1000) * 40 * electricityRate
      const vodkaWaterCost = (600 * 40 / 1000) * waterRate
      const vodkaBotanicalCost = 0
      const vodkaTotalCost = vodkaEnergyCost + vodkaWaterCost + actualEthanolCost + vodkaBotanicalCost
      
      setCostAnalysis({
        gin: {
          ethanol: { 
            cost: actualEthanolCost, 
            costPerLitreAUD: actualEthanolCost / 1000, // $2.51/L for 50% ABV
            volumeUsed: ethanolVolumeNeeded,
            batchABV: batchABV
          },
          operational: {
            costBreakdown: {
              energy: { totalCost: ginEnergyCost, totalKWh: (1.732 * 415 * 28 * 0.9 / 1000) * 19 },
              water: { totalCost: ginWaterCost, totalKL: (900 * 19 / 1000) }
            }
          },
          final: {
            totalCost: ginTotalCost,
            costPerLiterGin: ginTotalCost / 250,
            costPerLAAGin: ginTotalCost / 200, // 250L @ 80% ABV = 200 LAA
            yield: 25.0
          }
        },
        vodka: {
          ethanol: { 
            cost: actualEthanolCost, 
            costPerLitreAUD: actualEthanolCost / 1000, // $2.51/L for 50% ABV
            volumeUsed: ethanolVolumeNeeded,
            batchABV: batchABV
          },
          operational: {
            costBreakdown: {
              energy: { totalCost: vodkaEnergyCost, totalKWh: (1.732 * 415 * 24 * 0.9 / 1000) * 40 },
              water: { totalCost: vodkaWaterCost, totalKL: (600 * 40 / 1000) }
            }
          },
          final: {
            totalCost: vodkaTotalCost,
            costPerLiterVodka: vodkaTotalCost / 350,
            costPerLAAVodka: vodkaTotalCost / 320.25, // 350L @ 91.5% ABV = 320.25 LAA
            yield: 35.0
          }
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate costs')
    } finally {
      setLoading(false)
    }
  }, [batchVolume])

  const calculateProfitability = () => {
    if (!costAnalysis || sellingPrice <= 0) return null
    
    const currentCosts = selectedProcess === 'gin' ? costAnalysis.gin : costAnalysis.vodka
    const outputVolume = selectedProcess === 'gin' ? 250 : 350
    const costPerLiter = selectedProcess === 'gin' ? currentCosts.final.costPerLiterGin : currentCosts.final.costPerLiterVodka
    
    const grossProfitPerLiter = sellingPrice - costPerLiter
    const grossProfitTotal = grossProfitPerLiter * outputVolume
    const marginPercentage = sellingPrice > 0 ? (grossProfitPerLiter / sellingPrice) * 100 : 0
    const roi = costPerLiter > 0 ? (grossProfitPerLiter / costPerLiter) * 100 : 0
    
    return {
      grossProfitPerLiter,
      grossProfitTotal,
      marginPercentage,
      roi
    }
  }

  const profitability = calculateProfitability()

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
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Distillation Cost Tracking</h1>
          <p className="text-gray-600 mt-2">Carrie Still operational cost analysis with ethanol integration</p>
        </div>
        <div className="text-sm text-gray-500">
          <p>Electricity: $0.30972/kWh</p>
          <p>Water: $1.79/kL</p>
        </div>
      </div>

      {/* Ethanol Batch Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Ethanol Batch</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Batch Details</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Batch No:</strong> 133809</p>
              <p><strong>Supplier:</strong> Manildra Group</p>
              <p><strong>Volume:</strong> 1000L</p>
              <p><strong>ABV:</strong> 96.8%</p>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900 mb-2">Cost Analysis</h3>
            <div className="text-sm text-green-800 space-y-1">
              <p><strong>Batch Cost:</strong> $4,862.00</p>
              <p><strong>Cost/L (96.8%):</strong> $4.86</p>
              <p><strong>Cost/L (50%):</strong> $2.51</p>
              <p><strong>Volume Used:</strong> 516.5L</p>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-900 mb-2">Quality Analysis</h3>
            <div className="text-sm text-purple-800 space-y-1">
              <p><strong>Appearance:</strong> Clear & Bright</p>
              <p><strong>Colour:</strong> &lt;10 Pt-Co</p>
              <p><strong>Methanol:</strong> 0.0 mg/L</p>
              <p><strong>Miscibility:</strong> Complete</p>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-orange-900 mb-2">Production Data</h3>
            <div className="text-sm text-orange-800 space-y-1">
              <p><strong>Manufactured:</strong> 2024-10-10</p>
              <p><strong>Best Before:</strong> 2026-10-10</p>
              <p><strong>Released By:</strong> Simon Ferguson</p>
              <p><strong>Density:</strong> 0.8042 g/mL</p>
            </div>
          </div>
        </div>
      </div>

      {/* Process Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Process Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Type
            </label>
            <select
              value={selectedProcess}
              onChange={(e) => setSelectedProcess(e.target.value as 'gin' | 'vodka')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="gin">Gin Distillation</option>
              <option value="vodka">Vodka Redistillation</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch Volume (L)
            </label>
            <input
              type="number"
              value={batchVolume}
              onChange={(e) => setBatchVolume(parseInt(e.target.value) || 1000)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selling Price ($/L)
            </label>
            <input
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Cost Analysis */}
      {costAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gin Costs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gin Distillation Costs</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Ethanol Cost:</span>
                <span className="font-medium">${costAnalysis.gin.ethanol.cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Energy Cost:</span>
                <span className="font-medium">${costAnalysis.gin.operational.costBreakdown.energy.totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Water Cost:</span>
                <span className="font-medium">${costAnalysis.gin.operational.costBreakdown.water.totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Botanical Cost:</span>
                <span className="font-medium">$400.00</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Cost:</span>
                  <span>${costAnalysis.gin.final.totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Per Liter Gin:</span>
                  <span>${costAnalysis.gin.final.costPerLiterGin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Per LAA:</span>
                  <span>${costAnalysis.gin.final.costPerLAAGin.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Process Details</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Duration: 19 hours</p>
                <p>• Energy: {costAnalysis.gin.operational.costBreakdown.energy.totalKWh.toFixed(1)} kWh</p>
                <p>• Water: {costAnalysis.gin.operational.costBreakdown.water.totalKL.toFixed(1)} kL</p>
                <p>• Input: 1000L @ 50% ABV</p>
                <p>• Output: 250L @ 80% ABV (hearts)</p>
                <p>• Yield: {costAnalysis.gin.final.yield.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Vodka Costs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vodka Redistillation Costs</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Ethanol Cost:</span>
                <span className="font-medium">${costAnalysis.vodka.ethanol.cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Energy Cost:</span>
                <span className="font-medium">${costAnalysis.vodka.operational.costBreakdown.energy.totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Water Cost:</span>
                <span className="font-medium">${costAnalysis.vodka.operational.costBreakdown.water.totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Botanical Cost:</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Cost:</span>
                  <span>${costAnalysis.vodka.final.totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Per Liter Vodka:</span>
                  <span>${costAnalysis.vodka.final.costPerLiterVodka.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Per LAA:</span>
                  <span>${costAnalysis.vodka.final.costPerLAAVodka.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <h4 className="text-sm font-medium text-green-900 mb-2">Process Details</h4>
              <div className="text-sm text-green-800 space-y-1">
                <p>• Duration: 40 hours</p>
                <p>• Energy: {costAnalysis.vodka.operational.costBreakdown.energy.totalKWh.toFixed(1)} kWh</p>
                <p>• Water: {costAnalysis.vodka.operational.costBreakdown.water.totalKL.toFixed(1)} kL</p>
                <p>• Input: 1000L @ 50% ABV</p>
                <p>• Output: 350L @ 91.5% ABV</p>
                <p>• Yield: {costAnalysis.vodka.final.yield.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profitability Analysis */}
      {profitability && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Profitability Analysis - {selectedProcess === 'gin' ? 'Gin' : 'Vodka'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-900 mb-2">Gross Profit</h4>
              <p className="text-2xl font-bold text-green-600">
                ${profitability.grossProfitPerLiter.toFixed(2)}/L
              </p>
              <p className="text-sm text-green-700">
                Total: ${profitability.grossProfitTotal.toFixed(2)}
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Margin</h4>
              <p className="text-2xl font-bold text-blue-600">
                {profitability.marginPercentage.toFixed(1)}%
              </p>
              <p className="text-sm text-blue-700">
                Profit margin
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-purple-900 mb-2">ROI</h4>
              <p className="text-2xl font-bold text-purple-600">
                {profitability.roi.toFixed(1)}%
              </p>
              <p className="text-sm text-purple-700">
                Return on investment
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-orange-900 mb-2">Volume</h4>
              <p className="text-2xl font-bold text-orange-600">
                {selectedProcess === 'gin' ? '250' : '350'}L
              </p>
              <p className="text-sm text-orange-700">
                Output volume
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}