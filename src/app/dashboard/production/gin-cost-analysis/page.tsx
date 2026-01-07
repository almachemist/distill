'use client'

import { useState, useEffect } from 'react'

export default function GinProductionCostAnalysisPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [costAnalysis, setCostAnalysis] = useState<any>(null)
  const [sellingPrice, setSellingPrice] = useState(45.00)

  useEffect(() => {
    setLoading(true)
    try {
      // Calculate comprehensive Day 1 gin production costs
      const electricityRate = 0.30972 // $/kWh
      const waterRate = 1.79 // $/kL
      
      // Ethanol cost calculation: 96.8% ABV @ $4.862/L
      // For 1000L @ 50% ABV, we need 500L pure ethanol = 516.5L of 96.8% ethanol
      const batchABV = 96.8
      const productionABV = 50
      const pureEthanolNeeded = 1000 * (productionABV / 100) // 500L pure ethanol
      const ethanolVolumeNeeded = pureEthanolNeeded / (batchABV / 100) // 516.5L of 96.8% ethanol
      const actualEthanolCost = ethanolVolumeNeeded * 4.862 // $2,511.36
      
      // Day 1 recipe: 1000L @ 50% ABV → 250L @ 80% ABV
      const inputVolumeL = 1000
      const inputABV = 50
      const outputVolumeL = 250
      const outputABV = 80
      
      const inputLAA = inputVolumeL * (inputABV / 100)  // 500 LAA
      const outputLAA = outputVolumeL * (outputABV / 100)  // 200 LAA
      const distillationYield = (outputVolumeL / inputVolumeL) * 100  // 25%
      
      // Distillation costs
      const ginEnergyCost = (1.732 * 415 * 28 * 0.9 / 1000) * 19 * electricityRate
      const ginWaterCost = (900 * 19 / 1000) * waterRate
      
      // Additional costs
      const botanicalCost = 400
      const bottlingCostPerLiter = 2.00
      const packagingCostPerBottle = 1.50
      
      // Bottling calculations (700ml bottles)
      const bottleSize = 700 // ml
      const bottlesProduced = Math.floor((outputVolumeL * 1000) / bottleSize) // ~357 bottles
      const bottlingCost = outputVolumeL * bottlingCostPerLiter
      const packagingCost = bottlesProduced * packagingCostPerBottle
      
      // Total costs
      const totalCost = actualEthanolCost + ginEnergyCost + ginWaterCost + botanicalCost + bottlingCost + packagingCost
      
      // Profitability calculations
      const grossProfitPerBottle = sellingPrice - (totalCost / bottlesProduced)
      const grossProfitTotal = grossProfitPerBottle * bottlesProduced
      const marginPercentage = (grossProfitPerBottle / sellingPrice) * 100
      const roi = (grossProfitPerBottle / (totalCost / bottlesProduced)) * 100
      
      setCostAnalysis({
        ethanol: {
          batchId: "ena-133809",
          batchNo: "133809",
          supplier: "Manildra Group",
          volumeUsed_L: ethanolVolumeNeeded,
          cost: actualEthanolCost,
          costPerLAA: actualEthanolCost / inputLAA
        },
        distillation: {
          inputVolumeL,
          inputABV,
          outputVolumeL,
          outputABV,
          inputLAA,
          outputLAA,
          yield: distillationYield,
          energyCost: ginEnergyCost,
          waterCost: ginWaterCost
        },
        botanicals: {
          totalCost: botanicalCost,
          costPerLiter: botanicalCost / outputVolumeL
        },
        bottling: {
          volumeL: outputVolumeL,
          bottleSize,
          bottlesProduced,
          bottlingCost,
          packagingCost
        },
        final: {
          totalCost,
          costPerLiter: totalCost / outputVolumeL,
          costPerLAA: totalCost / outputLAA,
          costPerBottle: totalCost / bottlesProduced
        },
        profitability: {
          grossProfitPerBottle,
          grossProfitTotal,
          marginPercentage,
          roi
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate costs')
    } finally {
      setLoading(false)
    }
  }, [sellingPrice])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper"></div>
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
          <h1 className="text-3xl font-bold text-graphite">Day 1 Gin Production Cost Analysis</h1>
          <p className="text-graphite/70 mt-2">Complete cost breakdown from ethanol batch to bottled gin</p>
        </div>
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="selling_price" className="block text-sm font-medium text-graphite mb-2">
              Selling Price per Bottle ($)
            </label>
            <input
              id="selling_price"
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 45)}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-copper-30 rounded-md focus:outline-none focus:ring-2 focus:ring-copper focus:border-copper text-graphite"
            />
          </div>
        </div>
      </div>

      {/* Ethanol Batch Information */}
      <div className="bg-white rounded-lg shadow-soft border border-copper-30 p-6">
        <h2 className="text-xl font-semibold text-graphite mb-4">Ethanol Batch 133809 - Manildra Group</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-beige rounded-lg p-4 border border-copper-30">
            <h3 className="text-sm font-medium text-graphite mb-2">Batch Details</h3>
            <div className="text-sm text-graphite/80 space-y-1">
              <p><strong>Batch No:</strong> {costAnalysis?.ethanol.batchNo}</p>
              <p><strong>Supplier:</strong> {costAnalysis?.ethanol.supplier}</p>
              <p><strong>Volume Used:</strong> {costAnalysis?.ethanol.volumeUsed_L.toFixed(1)}L</p>
              <p><strong>ABV:</strong> 96.8%</p>
            </div>
          </div>
          
          <div className="bg-beige rounded-lg p-4 border border-copper-30">
            <h3 className="text-sm font-medium text-graphite mb-2">Cost Analysis</h3>
            <div className="text-sm text-graphite/80 space-y-1">
              <p><strong>Total Cost:</strong> ${costAnalysis?.ethanol.cost.toFixed(2)}</p>
              <p><strong>Cost/LAA:</strong> ${costAnalysis?.ethanol.costPerLAA.toFixed(2)}</p>
              <p><strong>Cost/L (50%):</strong> $2.51</p>
              <p><strong>Status:</strong> Approved</p>
            </div>
          </div>
          
          <div className="bg-beige rounded-lg p-4 border border-copper-30">
            <h3 className="text-sm font-medium text-graphite mb-2">Quality Analysis</h3>
            <div className="text-sm text-graphite/80 space-y-1">
              <p><strong>Appearance:</strong> Clear & Bright</p>
              <p><strong>Colour:</strong> &lt;10 Pt-Co</p>
              <p><strong>Methanol:</strong> 0.0 mg/L</p>
              <p><strong>Miscibility:</strong> Complete</p>
            </div>
          </div>
          
          <div className="bg-beige rounded-lg p-4 border border-copper-30">
            <h3 className="text-sm font-medium text-graphite mb-2">Production Data</h3>
            <div className="text-sm text-graphite/80 space-y-1">
              <p><strong>Manufactured:</strong> 2024-10-10</p>
              <p><strong>Best Before:</strong> 2026-10-10</p>
              <p><strong>Released By:</strong> Simon Ferguson</p>
              <p><strong>Density:</strong> 0.8042 g/mL</p>
            </div>
          </div>
        </div>
      </div>

      {/* Production Process */}
      <div className="bg-white rounded-lg shadow-soft border border-copper-30 p-6">
        <h2 className="text-xl font-semibold text-graphite mb-4">Day 1 Gin Production Process</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-beige rounded-lg p-4 border border-copper-30">
              <h3 className="text-sm font-medium text-graphite mb-2">Input</h3>
              <div className="text-sm text-graphite/80 space-y-1">
                <p><strong>Volume:</strong> {costAnalysis?.distillation.inputVolumeL}L</p>
                <p><strong>ABV:</strong> {costAnalysis?.distillation.inputABV}%</p>
                <p><strong>LAA:</strong> {costAnalysis?.distillation.inputLAA}L</p>
                <p><strong>Ethanol Cost:</strong> ${costAnalysis?.ethanol.cost.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="bg-beige rounded-lg p-4 border border-copper-30">
              <h3 className="text-sm font-medium text-graphite mb-2">Output</h3>
              <div className="text-sm text-graphite/80 space-y-1">
                <p><strong>Volume:</strong> {costAnalysis?.distillation.outputVolumeL}L</p>
                <p><strong>ABV:</strong> {costAnalysis?.distillation.outputABV}%</p>
                <p><strong>LAA:</strong> {costAnalysis?.distillation.outputLAA}L</p>
                <p><strong>Yield:</strong> {costAnalysis?.distillation.yield.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-beige rounded-lg p-4 border border-copper-30">
              <h3 className="text-sm font-medium text-graphite mb-2">Distillation Costs</h3>
              <div className="text-sm text-graphite/80 space-y-1">
                <p><strong>Energy:</strong> ${costAnalysis?.distillation.energyCost.toFixed(2)}</p>
                <p><strong>Water:</strong> ${costAnalysis?.distillation.waterCost.toFixed(2)}</p>
                <p><strong>Total:</strong> ${(costAnalysis?.distillation.energyCost + costAnalysis?.distillation.waterCost).toFixed(2)}</p>
              </div>
            </div>
            
            <div className="bg-beige rounded-lg p-4 border border-copper-30">
              <h3 className="text-sm font-medium text-graphite mb-2">Additional Costs</h3>
              <div className="text-sm text-graphite/80 space-y-1">
                <p><strong>Botanicals:</strong> ${costAnalysis?.botanicals.totalCost.toFixed(2)}</p>
                <p><strong>Bottling:</strong> ${costAnalysis?.bottling.bottlingCost.toFixed(2)}</p>
                <p><strong>Packaging:</strong> ${costAnalysis?.bottling.packagingCost.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-soft border border-copper-30 p-6">
          <h3 className="text-lg font-semibold text-graphite mb-4">Complete Cost Breakdown</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-graphite/70">Ethanol Cost:</span>
              <span className="font-medium">${costAnalysis?.ethanol.cost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-graphite/70">Distillation Energy:</span>
              <span className="font-medium">${costAnalysis?.distillation.energyCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-graphite/70">Distillation Water:</span>
              <span className="font-medium">${costAnalysis?.distillation.waterCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-graphite/70">Botanicals:</span>
              <span className="font-medium">${costAnalysis?.botanicals.totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-graphite/70">Bottling:</span>
              <span className="font-medium">${costAnalysis?.bottling.bottlingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-graphite/70">Packaging:</span>
              <span className="font-medium">${costAnalysis?.bottling.packagingCost.toFixed(2)}</span>
            </div>
            <div className="border-t border-copper-30 pt-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Cost:</span>
                <span>${costAnalysis?.final.totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft border border-copper-30 p-6">
          <h3 className="text-lg font-semibold text-graphite mb-4">Cost per Unit Analysis</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-graphite/70">Cost per Liter:</span>
              <span className="font-medium">${costAnalysis?.final.costPerLiter.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-graphite/70">Cost per LAA:</span>
              <span className="font-medium">${costAnalysis?.final.costPerLAA.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-graphite/70">Cost per Bottle:</span>
              <span className="font-medium">${costAnalysis?.final.costPerBottle.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-graphite/70">Bottles Produced:</span>
              <span className="font-medium">{costAnalysis?.bottling.bottlesProduced}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-graphite/70">Bottle Size:</span>
              <span className="font-medium">{costAnalysis?.bottling.bottleSize}ml</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profitability Analysis */}
      <div className="bg-white rounded-lg shadow-soft border border-copper-30 p-6">
        <h3 className="text-lg font-semibold text-graphite mb-4">Profitability Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-copper-5 rounded-lg p-4 border border-copper-30">
            <h4 className="text-sm font-medium text-graphite mb-2">Gross Profit</h4>
            <p className="text-2xl font-bold text-graphite">
              ${costAnalysis?.profitability.grossProfitPerBottle.toFixed(2)}/bottle
            </p>
            <p className="text-sm text-graphite/70">
              Total: ${costAnalysis?.profitability.grossProfitTotal.toFixed(2)}
            </p>
          </div>
          
          <div className="bg-copper-5 rounded-lg p-4 border border-copper-30">
            <h4 className="text-sm font-medium text-graphite mb-2">Margin</h4>
            <p className="text-2xl font-bold text-graphite">
              {costAnalysis?.profitability.marginPercentage.toFixed(1)}%
            </p>
            <p className="text-sm text-graphite/70">
              Profit margin
            </p>
          </div>
          
          <div className="bg-copper-5 rounded-lg p-4 border border-copper-30">
            <h4 className="text-sm font-medium text-graphite mb-2">ROI</h4>
            <p className="text-2xl font-bold text-graphite">
              {costAnalysis?.profitability.roi.toFixed(1)}%
            </p>
            <p className="text-sm text-graphite/70">
              Return on investment
            </p>
          </div>
          
          <div className="bg-copper-5 rounded-lg p-4 border border-copper-30">
            <h4 className="text-sm font-medium text-graphite mb-2">Selling Price</h4>
            <p className="text-2xl font-bold text-graphite">
              ${sellingPrice.toFixed(2)}
            </p>
            <p className="text-sm text-graphite/70">
              Per bottle
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
