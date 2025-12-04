/**
 * Advanced Cost Calculation Service
 * 
 * Provides comprehensive cost calculation for distillation processes
 * including energy, water, ingredients, and total production costs.
 */

import { DISTILLATION_CONSTANTS } from '../constants/distillation.constants'
import { DistillationStep, DistillationBatch, CostBreakdown, ProductionMetrics } from '../types/distillation.types'
import { calculateStepCost } from '../constants/distillation.constants'
import { EthanolCostCalculator } from '../types/ethanol.types'

export class DistillationCostCalculator {
  
  /**
   * Calculate comprehensive cost breakdown for a distillation batch
   */
  static calculateBatchCosts(
    steps: DistillationStep[],
    ingredientCosts: { ethanol: number; botanicals: number } = { ethanol: 0, botanicals: 0 }
  ): CostBreakdown {
    
    let totalEnergyCost = 0
    let totalWaterCost = 0
    let totalKWh = 0
    let totalKL = 0
    
    // Calculate operational costs for each step
    steps.forEach(step => {
      const stepCost = calculateStepCost(step.currentA, step.waterFlow_Lph, step.durationHours)
      totalEnergyCost += stepCost.energy
      totalWaterCost += stepCost.water
      totalKWh += stepCost.powerKW * step.durationHours
      totalKL += (step.waterFlow_Lph * step.durationHours) / 1000
    })
    
    const totalOperationalCost = totalEnergyCost + totalWaterCost
    const totalIngredientCost = ingredientCosts.ethanol + ingredientCosts.botanicals
    const totalCost = totalOperationalCost + totalIngredientCost
    
    const totalVolumeProduced = steps.reduce((sum, step) => sum + (step.outputVolume_L || 0), 0)
    const costPerLiter = totalVolumeProduced > 0 ? totalCost / totalVolumeProduced : 0
    
    return {
      energy: {
        totalCost: totalEnergyCost,
        totalKWh: totalKWh,
        costPerKWh: DISTILLATION_CONSTANTS.electricityRate
      },
      water: {
        totalCost: totalWaterCost,
        totalKL: totalKL,
        costPerKL: DISTILLATION_CONSTANTS.waterRate
      },
      ingredients: {
        totalCost: totalIngredientCost,
        ethanolCost: ingredientCosts.ethanol,
        botanicalCost: ingredientCosts.botanicals
      },
      total: totalCost,
      costPerLiter: costPerLiter,
      costPerBatch: totalCost
    }
  }
  
  /**
   * Calculate production metrics for efficiency analysis
   */
  static calculateProductionMetrics(
    batch: DistillationBatch,
    theoreticalYield_L: number
  ): ProductionMetrics {
    
    const totalVolumeProduced = batch.totalVolumeProduced_L
    const totalCost = batch.totalCost
    const totalEnergyKWh = batch.actualSteps.reduce((sum, step) => {
      const powerKW = calculateStepCost(step.currentA, step.waterFlow_Lph, step.durationHours).powerKW
      return sum + (powerKW * step.durationHours)
    }, 0)
    
    const totalWaterL = batch.actualSteps.reduce((sum, step) => {
      return sum + (step.waterFlow_Lph * step.durationHours)
    }, 0)
    
    const productionTime_hours = batch.actualSteps.reduce((sum, step) => sum + step.durationHours, 0)
    
    return {
      batchId: batch.id,
      processType: batch.processId,
      volumeProduced_L: totalVolumeProduced,
      abv: batch.finalABV,
      totalCost: totalCost,
      costPerLiter: totalVolumeProduced > 0 ? totalCost / totalVolumeProduced : 0,
      energyEfficiency: totalVolumeProduced > 0 ? totalEnergyKWh / totalVolumeProduced : 0,
      waterEfficiency: totalVolumeProduced > 0 ? totalWaterL / totalVolumeProduced : 0,
      productionTime_hours: productionTime_hours,
      yield: theoreticalYield_L > 0 ? (totalVolumeProduced / theoreticalYield_L) * 100 : 0
    }
  }
  
  /**
   * Calculate cost per liter for different product types
   */
  static calculateProductCosts(productType: 'gin' | 'vodka', batchVolume_L: number = 100): {
    operationalCostPerLiter: number
    ingredientCostPerLiter: number
    totalCostPerLiter: number
    costBreakdown: CostBreakdown
  } {
    
    // Define process steps directly to avoid import issues
    const ginSteps = [
      { day: 0, name: "Warm-up", durationHours: 2.5, currentA: 33, waterFlow_Lph: 0, dephlegmatorActive: false },
      { day: 1, name: "Heat-up & strip", durationHours: 3.5, currentA: 33, waterFlow_Lph: 675, dephlegmatorActive: false },
      { day: 1, name: "Hearts collection", durationHours: 8, currentA: 29, waterFlow_Lph: 1080, dephlegmatorActive: false, outputVolume_L: 250 },
      { day: 1, name: "Tails collection", durationHours: 4, currentA: 25, waterFlow_Lph: 1080, dephlegmatorActive: false, outputVolume_L: 200 },
      { day: 1, name: "Cool-down", durationHours: 1, currentA: 0, waterFlow_Lph: 675, dephlegmatorActive: false }
    ]
    
    const vodkaSteps = [
      { day: 2, name: "Late tails distillation", durationHours: 10, currentA: 25, waterFlow_Lph: 1080, dephlegmatorActive: true },
      { day: 3, name: "Re-distillation", durationHours: 20, currentA: 25, waterFlow_Lph: 129, dephlegmatorActive: true, outputVolume_L: 200 },
      { day: 3, name: "High-purity collection", durationHours: 8, currentA: 22, waterFlow_Lph: 129, dephlegmatorActive: true, outputVolume_L: 150 },
      { day: 3, name: "System shutdown", durationHours: 2, currentA: 0, waterFlow_Lph: 675, dephlegmatorActive: false }
    ]
    
    const processSteps = productType === 'gin' ? ginSteps : vodkaSteps
    
    // Calculate operational costs
    const operationalCosts = this.calculateBatchCosts(processSteps)
    
    // Calculate actual ethanol costs using real batch data
    const ethanolCosts = productType === 'gin' ? 
      EthanolCostCalculator.calculateGinEthanolCost() :
      EthanolCostCalculator.calculateVodkaEthanolCost()
    
    const ingredientCosts = productType === 'gin' ? 
      { ethanol: ethanolCosts.cost, botanicals: 400 } : // Gin: real ethanol cost + botanicals
      { ethanol: ethanolCosts.cost, botanicals: 0 }     // Vodka: real ethanol cost, no botanicals
    
    const totalCosts = this.calculateBatchCosts(processSteps, ingredientCosts)
    
    return {
      operationalCostPerLiter: operationalCosts.costPerLiter,
      ingredientCostPerLiter: ingredientCosts.ethanol / batchVolume_L + ingredientCosts.botanicals / batchVolume_L,
      totalCostPerLiter: totalCosts.costPerLiter,
      costBreakdown: totalCosts
    }
  }
  
  /**
   * Compare costs between different processes
   */
  static compareProcessCosts(): {
    gin: ReturnType<typeof DistillationCostCalculator.calculateProductCosts>
    vodka: ReturnType<typeof DistillationCostCalculator.calculateProductCosts>
    comparison: {
      ginVsVodkaOperational: number
      ginVsVodkaTotal: number
      efficiencyDifference: number
    }
  } {
    
    const ginCosts = this.calculateProductCosts('gin', 100)
    const vodkaCosts = this.calculateProductCosts('vodka', 100)
    
    return {
      gin: ginCosts,
      vodka: vodkaCosts,
      comparison: {
        ginVsVodkaOperational: ginCosts.operationalCostPerLiter - vodkaCosts.operationalCostPerLiter,
        ginVsVodkaTotal: ginCosts.totalCostPerLiter - vodkaCosts.totalCostPerLiter,
        efficiencyDifference: ((ginCosts.costBreakdown.total - vodkaCosts.costBreakdown.total) / vodkaCosts.costBreakdown.total) * 100
      }
    }
  }
  
  /**
   * Calculate comprehensive gin production costs with ethanol integration
   */
  static calculateCompleteGinCosts(): {
    ethanol: ReturnType<typeof EthanolCostCalculator.calculateGinEthanolCost>
    operational: ReturnType<typeof DistillationCostCalculator.calculateProductCosts>
    final: {
      totalCost: number
      costPerLiterGin: number
      costPerLAAGin: number
      yield: number
      ethanolCostPerLiter: number
      operationalCostPerLiter: number
    }
  } {
    const ethanol = EthanolCostCalculator.calculateGinEthanolCost()
    const operational = this.calculateProductCosts('gin', 1000)
    
    // Gin production: 1000L @ 50% ABV → 250L @ 80% ABV (hearts)
    const inputVolumeL = 1000
    const inputABV = 50
    const outputVolumeL = 250
    const outputABV = 80
    
    const totalCost = ethanol.cost + operational.costBreakdown.total
    const costPerLiterGin = totalCost / outputVolumeL
    const outputLAA = outputVolumeL * (outputABV / 100)
    const costPerLAAGin = outputLAA > 0 ? totalCost / outputLAA : 0
    const yieldPercent = (outputVolumeL / inputVolumeL) * 100
    
    return {
      ethanol,
      operational,
      final: {
        totalCost,
        costPerLiterGin,
        costPerLAAGin,
        yield: yieldPercent,
        ethanolCostPerLiter: ethanol.cost / outputVolumeL,
        operationalCostPerLiter: operational.costBreakdown.total / outputVolumeL
      }
    }
  }
  
  /**
   * Calculate comprehensive vodka production costs with ethanol integration
   */
  static calculateCompleteVodkaCosts(): {
    ethanol: ReturnType<typeof EthanolCostCalculator.calculateVodkaEthanolCost>
    operational: ReturnType<typeof DistillationCostCalculator.calculateProductCosts>
    final: {
      totalCost: number
      costPerLiterVodka: number
      costPerLAAVodka: number
      yield: number
      ethanolCostPerLiter: number
      operationalCostPerLiter: number
    }
  } {
    const ethanol = EthanolCostCalculator.calculateVodkaEthanolCost()
    const operational = this.calculateProductCosts('vodka', 1000)
    
    // Vodka production: 1000L @ 50% ABV → 350L @ 91.5% ABV (combined output)
    const inputVolumeL = 1000
    const inputABV = 50
    const outputVolumeL = 350
    const outputABV = 91.5
    
    const totalCost = ethanol.cost + operational.costBreakdown.total
    const costPerLiterVodka = totalCost / outputVolumeL
    const outputLAA = outputVolumeL * (outputABV / 100)
    const costPerLAAVodka = outputLAA > 0 ? totalCost / outputLAA : 0
    const yieldPercent = (outputVolumeL / inputVolumeL) * 100
    
    return {
      ethanol,
      operational,
      final: {
        totalCost,
        costPerLiterVodka,
        costPerLAAVodka,
        yield: yieldPercent,
        ethanolCostPerLiter: ethanol.cost / outputVolumeL,
        operationalCostPerLiter: operational.costBreakdown.total / outputVolumeL
      }
    }
  }
  
  /**
   * Calculate ROI and profitability metrics
   */
  static calculateProfitability(
    costPerLiter: number,
    sellingPricePerLiter: number,
    volumeProduced_L: number
  ): {
    grossProfitPerLiter: number
    grossProfitTotal: number
    marginPercentage: number
    roi: number
  } {
    
    const grossProfitPerLiter = sellingPricePerLiter - costPerLiter
    const grossProfitTotal = grossProfitPerLiter * volumeProduced_L
    const marginPercentage = sellingPricePerLiter > 0 ? (grossProfitPerLiter / sellingPricePerLiter) * 100 : 0
    const roi = costPerLiter > 0 ? (grossProfitPerLiter / costPerLiter) * 100 : 0
    
    return {
      grossProfitPerLiter,
      grossProfitTotal,
      marginPercentage,
      roi
    }
  }
}
