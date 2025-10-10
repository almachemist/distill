/**
 * Comprehensive Gin Production Cost Calculator
 * 
 * Integrates ethanol batch data with Day 1 gin recipe to calculate
 * complete production costs including LAA calculations and bottling costs.
 */

import { EthanolCostCalculator } from './ethanol-comprehensive.types'

export interface GinProductionCosts {
  ethanol: {
    batchId: string
    batchNo: string
    supplier: string
    volumeUsed_L: number
    cost: number
    costPerLAA: number
  }
  distillation: {
    inputVolumeL: number
    inputABV: number
    outputVolumeL: number
    outputABV: number
    inputLAA: number
    outputLAA: number
    yield: number
    energyCost: number
    waterCost: number
  }
  botanicals: {
    totalCost: number
    costPerLiter: number
  }
  bottling: {
    volumeL: number
    bottleSize: number  // ml
    bottlesProduced: number
    bottlingCost: number
    packagingCost: number
  }
  final: {
    totalCost: number
    costPerLiter: number
    costPerLAA: number
    costPerBottle: number
    costPerBottleWithPackaging: number
  }
}

export class GinProductionCostCalculator {
  
  /**
   * Calculate complete Day 1 gin production costs
   * Input: 1000L @ 50% ABV → Output: 250L @ 80% ABV (hearts)
   */
  static calculateDay1GinCosts(
    batchId: string = "ena-133809",
    additionalCosts: {
      distillationEnergy: number
      distillationWater: number
      botanicals: number
      bottlingPerLiter: number
      packagingPerBottle: number
    }
  ): GinProductionCosts {
    
    // Get ethanol costs
    const ethanolCalc = EthanolCostCalculator.calculateGinEthanolCost(batchId)
    
    // Day 1 recipe: 1000L @ 50% ABV → 250L @ 80% ABV
    const inputVolumeL = 1000
    const inputABV = 50
    const outputVolumeL = 250
    const outputABV = 80
    
    const inputLAA = inputVolumeL * (inputABV / 100)  // 500 LAA
    const outputLAA = outputVolumeL * (outputABV / 100)  // 200 LAA
    const yield = (outputVolumeL / inputVolumeL) * 100  // 25%
    
    // Bottling calculations (assuming 700ml bottles)
    const bottleSize = 700  // ml
    const bottlesProduced = Math.floor((outputVolumeL * 1000) / bottleSize)  // ~357 bottles
    const bottlingCost = outputVolumeL * additionalCosts.bottlingPerLiter
    const packagingCost = bottlesProduced * additionalCosts.packagingPerBottle
    
    // Total costs
    const totalCost = ethanolCalc.cost + 
                     additionalCosts.distillationEnergy + 
                     additionalCosts.distillationWater + 
                     additionalCosts.botanicals + 
                     bottlingCost + 
                     packagingCost
    
    return {
      ethanol: {
        batchId: ethanolCalc.batch.id,
        batchNo: ethanolCalc.batch.batchNo,
        supplier: ethanolCalc.batch.supplier,
        volumeUsed_L: ethanolCalc.volumeOfBatchUsed_L,
        cost: ethanolCalc.cost,
        costPerLAA: ethanolCalc.effectiveCostPerLAA
      },
      distillation: {
        inputVolumeL,
        inputABV,
        outputVolumeL,
        outputABV,
        inputLAA,
        outputLAA,
        yield,
        energyCost: additionalCosts.distillationEnergy,
        waterCost: additionalCosts.distillationWater
      },
      botanicals: {
        totalCost: additionalCosts.botanicals,
        costPerLiter: additionalCosts.botanicals / outputVolumeL
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
        costPerBottle: (totalCost / outputVolumeL) * (bottleSize / 1000),
        costPerBottleWithPackaging: totalCost / bottlesProduced
      }
    }
  }
  
  /**
   * Calculate profitability for Day 1 gin production
   */
  static calculateDay1GinProfitability(
    sellingPricePerBottle: number,
    additionalCosts: {
      distillationEnergy: number
      distillationWater: number
      botanicals: number
      bottlingPerLiter: number
      packagingPerBottle: number
    }
  ): {
    production: GinProductionCosts
    profitability: {
      grossProfitPerBottle: number
      grossProfitTotal: number
      marginPercentage: number
      roi: number
      profitPerLiter: number
    }
  } {
    const production = this.calculateDay1GinCosts("ena-133809", additionalCosts)
    
    const grossProfitPerBottle = sellingPricePerBottle - production.final.costPerBottleWithPackaging
    const grossProfitTotal = grossProfitPerBottle * production.bottling.bottlesProduced
    const marginPercentage = sellingPricePerBottle > 0 ? (grossProfitPerBottle / sellingPricePerBottle) * 100 : 0
    const roi = production.final.costPerBottleWithPackaging > 0 ? (grossProfitPerBottle / production.final.costPerBottleWithPackaging) * 100 : 0
    const profitPerLiter = grossProfitPerBottle * (1000 / production.bottling.bottleSize)
    
    return {
      production,
      profitability: {
        grossProfitPerBottle,
        grossProfitTotal,
        marginPercentage,
        roi,
        profitPerLiter
      }
    }
  }
  
  /**
   * Get example Day 1 gin production with realistic costs
   */
  static getExampleDay1GinProduction(): {
    production: GinProductionCosts
    profitability: ReturnType<typeof GinProductionCostCalculator.calculateDay1GinProfitability>
  } {
    // Realistic additional costs
    const additionalCosts = {
      distillationEnergy: 106.59,  // From previous calculations
      distillationWater: 30.61,   // From previous calculations
      botanicals: 400.00,         // Estimated botanical cost
      bottlingPerLiter: 2.00,     // $2/L for bottling
      packagingPerBottle: 1.50    // $1.50 per bottle for packaging
    }
    
    const production = this.calculateDay1GinCosts("ena-133809", additionalCosts)
    
    // Example selling price
    const sellingPricePerBottle = 45.00  // $45 per 700ml bottle
    const profitability = this.calculateDay1GinProfitability(sellingPricePerBottle, additionalCosts)
    
    return {
      production,
      profitability
    }
  }
}
