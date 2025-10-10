/**
 * Comprehensive Ethanol Batch Management System
 * 
 * Defines the complete structure for tracking ethanol batches with
 * traceability, cost analysis, quality assurance, and LAA calculations.
 */

export interface EthanolBatch {
  id: string
  materialCode: string
  batchNo: string
  manufacturingDate: string
  bestBeforeDate: string
  alcoholStrength: number  // % ABV
  density: number          // g/mL at 20°C
  supplier: string
  volumeL: number
  totalCostAUD: number
  costPerLitreAUD: number
  analysis: {
    appearance: string
    colour: string
    higherAlcohols_mgL: number
    methanol_mgL: number
    miscibility: string
    odour: string
  }
  releasedBy: string
  releaseDate: string
  status: 'pending' | 'approved' | 'rejected' | 'consumed'
  notes?: string
}

export interface EthanolUsage {
  batchId: string
  usageDate: string
  productType: 'gin' | 'vodka' | 'neutral'
  volumeUsed_L: number
  dilutionABV: number
  pureAlcoholUsed_LAA: number  // Liters of Absolute Alcohol
  cost: number
  productionBatchId?: string
}

export interface EthanolCostAnalysis {
  batchId: string
  batch: EthanolBatch
  totalVolumeUsed_L: number
  totalPureAlcoholUsed_LAA: number
  totalCost: number
  effectiveCostPerLAA: number
  remainingVolume_L: number
  remainingCost: number
}

/**
 * Current Ethanol Batches - Manildra Group Batch 133809
 * 
 * All batches are 1000L as per distillery operations
 */
export const ethanolBatches: EthanolBatch[] = [
  {
    id: "ena-133809",
    materialCode: "100654",
    batchNo: "133809",
    manufacturingDate: "2024-10-10",
    bestBeforeDate: "2026-10-10",
    alcoholStrength: 96.8,
    density: 0.8042,
    supplier: "Manildra Group",
    volumeL: 1000,
    totalCostAUD: 4862.00,    // incl GST
    costPerLitreAUD: 4.862,   // 4862 / 1000
    analysis: {
      appearance: "Clear and Bright",
      colour: "<10 Pt-Co",
      higherAlcohols_mgL: 0.0,
      methanol_mgL: 0.0,
      miscibility: "Complete",
      odour: "Characteristic"
    },
    releasedBy: "Simon Ferguson",
    releaseDate: "2024-10-10",
    status: 'approved',
    notes: "High-quality ethanol suitable for gin production"
  }
]

/**
 * Comprehensive Ethanol Cost Calculator with LAA Calculations
 */
export class EthanolCostCalculator {
  
  /**
   * Calculate ethanol cost for a specific usage with proper dilution
   */
  static calculateEthanolCost(
    batchId: string, 
    targetVolumeL: number, 
    targetABV: number
  ): {
    cost: number
    pureAlcoholUsed_LAA: number
    effectiveCostPerLAA: number
    volumeOfBatchUsed_L: number
    batch: EthanolBatch
  } {
    const batch = ethanolBatches.find(b => b.id === batchId)
    if (!batch) {
      throw new Error(`Ethanol batch ${batchId} not found`)
    }
    
    // Calculate pure alcohol needed for target volume and ABV
    const pureAlcoholNeeded_LAA = targetVolumeL * (targetABV / 100)
    
    // Calculate how much of the batch ethanol we need
    const volumeOfBatchUsed_L = pureAlcoholNeeded_LAA / (batch.alcoholStrength / 100)
    
    // Calculate cost
    const cost = volumeOfBatchUsed_L * batch.costPerLitreAUD
    const effectiveCostPerLAA = pureAlcoholNeeded_LAA > 0 ? cost / pureAlcoholNeeded_LAA : 0
    
    return {
      cost,
      pureAlcoholUsed_LAA: pureAlcoholNeeded_LAA,
      effectiveCostPerLAA,
      volumeOfBatchUsed_L,
      batch
    }
  }
  
  /**
   * Calculate ethanol cost for gin production (Day 1 recipe: 1000L @ 50% ABV)
   */
  static calculateGinEthanolCost(batchId: string = "ena-133809"): {
    cost: number
    pureAlcoholUsed_LAA: number
    effectiveCostPerLAA: number
    volumeOfBatchUsed_L: number
    batch: EthanolBatch
  } {
    return this.calculateEthanolCost(batchId, 1000, 50)
  }
  
  /**
   * Calculate ethanol cost for vodka production (1000L @ 50% ABV)
   */
  static calculateVodkaEthanolCost(batchId: string = "ena-133809"): {
    cost: number
    pureAlcoholUsed_LAA: number
    effectiveCostPerLAA: number
    volumeOfBatchUsed_L: number
    batch: EthanolBatch
  } {
    return this.calculateEthanolCost(batchId, 1000, 50)
  }
  
  /**
   * Calculate complete gin production costs with Day 1 recipe
   * Input: 1000L @ 50% ABV → Output: 250L @ 80% ABV (hearts)
   */
  static calculateCompleteGinProductionCosts(): {
    ethanol: ReturnType<typeof EthanolCostCalculator.calculateGinEthanolCost>
    distillation: {
      inputVolumeL: 1000
      inputABV: 50
      outputVolumeL: 250
      outputABV: 80
      inputLAA: number
      outputLAA: number
      yieldPercentage: number
    }
    costs: {
      ethanolCostPerLAA: number
      ethanolCostPerLBottled: number
      totalEthanolCost: number
    }
  } {
    const ethanol = this.calculateGinEthanolCost()
    
    // Day 1 recipe calculations
    const inputVolumeL = 1000
    const inputABV = 50
    const outputVolumeL = 250
    const outputABV = 80
    
    const inputLAA = inputVolumeL * (inputABV / 100)  // 500 LAA
    const outputLAA = outputVolumeL * (outputABV / 100)  // 200 LAA
    const yieldPercentage = (outputVolumeL / inputVolumeL) * 100  // 25%
    
    return {
      ethanol,
      distillation: {
        inputVolumeL,
        inputABV,
        outputVolumeL,
        outputABV,
        inputLAA,
        outputLAA,
        yieldPercentage
      },
      costs: {
        ethanolCostPerLAA: ethanol.effectiveCostPerLAA,
        ethanolCostPerLBottled: ethanol.cost / outputVolumeL,
        totalEthanolCost: ethanol.cost
      }
    }
  }
  
  /**
   * Calculate cost per liter of bottled gin including all factors
   */
  static calculateBottledGinCosts(
    batchId: string = "ena-133809",
    additionalCosts: {
      distillationEnergy: number
      distillationWater: number
      botanicals: number
      bottling: number
      packaging: number
    }
  ): {
    ethanol: ReturnType<typeof EthanolCostCalculator.calculateCompleteGinProductionCosts>
    totalCosts: {
      ethanol: number
      distillation: number
      botanicals: number
      bottling: number
      packaging: number
      total: number
    }
    finalProduct: {
      volumeL: number
      abv: number
      laa: number
      costPerLiter: number
      costPerLAA: number
      costPerBottle: number  // Assuming 700ml bottles
    }
  } {
    const ethanol = this.calculateCompleteGinProductionCosts()
    
    const totalCosts = {
      ethanol: ethanol.costs.totalEthanolCost,
      distillation: additionalCosts.distillationEnergy + additionalCosts.distillationWater,
      botanicals: additionalCosts.botanicals,
      bottling: additionalCosts.bottling,
      packaging: additionalCosts.packaging,
      total: 0
    }
    
    totalCosts.total = Object.values(totalCosts).reduce((sum, cost) => sum + cost, 0)
    
    const finalProduct = {
      volumeL: ethanol.distillation.outputVolumeL,
      abv: ethanol.distillation.outputABV,
      laa: ethanol.distillation.outputLAA,
      costPerLiter: totalCosts.total / ethanol.distillation.outputVolumeL,
      costPerLAA: totalCosts.total / ethanol.distillation.outputLAA,
      costPerBottle: (totalCosts.total / ethanol.distillation.outputVolumeL) * 0.7  // 700ml bottles
    }
    
    return {
      ethanol,
      totalCosts,
      finalProduct
    }
  }
  
  /**
   * Get comprehensive cost analysis for a batch
   */
  static getBatchAnalysis(batchId: string): EthanolCostAnalysis {
    const batch = ethanolBatches.find(b => b.id === batchId)
    if (!batch) {
      throw new Error(`Ethanol batch ${batchId} not found`)
    }
    
    // For now, assume no usage (in real system, this would track actual usage)
    const totalVolumeUsed_L = 0
    const totalPureAlcoholUsed_LAA = 0
    const totalCost = 0
    const effectiveCostPerLAA = batch.costPerLitreAUD / (batch.alcoholStrength / 100)
    const remainingVolume_L = batch.volumeL - totalVolumeUsed_L
    const remainingCost = batch.costPerLitreAUD * remainingVolume_L
    
    return {
      batchId,
      batch,
      totalVolumeUsed_L,
      totalPureAlcoholUsed_LAA,
      totalCost,
      effectiveCostPerLAA,
      remainingVolume_L,
      remainingCost
    }
  }
  
  /**
   * Calculate ROI and profitability metrics for gin production
   */
  static calculateGinProfitability(
    sellingPricePerLiter: number,
    additionalCosts: {
      distillationEnergy: number
      distillationWater: number
      botanicals: number
      bottling: number
      packaging: number
    }
  ): {
    production: ReturnType<typeof EthanolCostCalculator.calculateBottledGinCosts>
    profitability: {
      grossProfitPerLiter: number
      grossProfitTotal: number
      marginPercentage: number
      roi: number
      profitPerBottle: number
    }
  } {
    const production = this.calculateBottledGinCosts("ena-133809", additionalCosts)
    
    const grossProfitPerLiter = sellingPricePerLiter - production.finalProduct.costPerLiter
    const grossProfitTotal = grossProfitPerLiter * production.finalProduct.volumeL
    const marginPercentage = sellingPricePerLiter > 0 ? (grossProfitPerLiter / sellingPricePerLiter) * 100 : 0
    const roi = production.finalProduct.costPerLiter > 0 ? (grossProfitPerLiter / production.finalProduct.costPerLiter) * 100 : 0
    const profitPerBottle = grossProfitPerLiter * 0.7  // 700ml bottles
    
    return {
      production,
      profitability: {
        grossProfitPerLiter,
        grossProfitTotal,
        marginPercentage,
        roi,
        profitPerBottle
      }
    }
  }
}
