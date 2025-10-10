/**
 * Ethanol Batch Management System
 * 
 * Defines the structure for tracking ethanol batches with complete
 * traceability, cost analysis, and quality assurance data.
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
 * Current Ethanol Batches
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
 * Ethanol Cost Calculation Functions
 */
export class EthanolCostCalculator {
  
  /**
   * Calculate ethanol cost for a specific usage
   */
  static calculateEthanolCost(
    batchId: string, 
    volumeL: number, 
    dilutionABV: number
  ): {
    cost: number
    pureAlcoholUsed_LAA: number
    effectiveCostPerLAA: number
    batch: EthanolBatch
  } {
    const batch = ethanolBatches.find(b => b.id === batchId)
    if (!batch) {
      throw new Error(`Ethanol batch ${batchId} not found`)
    }
    
    const pureAlcoholUsed_LAA = volumeL * (dilutionABV / 100)
    const cost = batch.costPerLitreAUD * volumeL
    const effectiveCostPerLAA = pureAlcoholUsed_LAA > 0 ? cost / pureAlcoholUsed_LAA : 0
    
    return {
      cost,
      pureAlcoholUsed_LAA,
      effectiveCostPerLAA,
      batch
    }
  }
  
  /**
   * Calculate ethanol cost for gin production (1000L at 50% ABV)
   */
  static calculateGinEthanolCost(batchId: string = "ena-133809"): {
    cost: number
    pureAlcoholUsed_LAA: number
    effectiveCostPerLAA: number
    batch: EthanolBatch
  } {
    return this.calculateEthanolCost(batchId, 1000, 50)
  }
  
  /**
   * Calculate ethanol cost for vodka production (1000L at 50% ABV)
   */
  static calculateVodkaEthanolCost(batchId: string = "ena-133809"): {
    cost: number
    pureAlcoholUsed_LAA: number
    effectiveCostPerLAA: number
    batch: EthanolBatch
  } {
    return this.calculateEthanolCost(batchId, 1000, 50)
  }
  
  /**
   * Calculate cost per liter of final product
   */
  static calculateFinalProductCost(
    batchId: string,
    inputVolumeL: number,
    inputABV: number,
    outputVolumeL: number,
    outputABV: number
  ): {
    ethanolCost: number
    costPerLiterOutput: number
    costPerLAAOutput: number
    yield: number
  } {
    const ethanolCalc = this.calculateEthanolCost(batchId, inputVolumeL, inputABV)
    const costPerLiterOutput = outputVolumeL > 0 ? ethanolCalc.cost / outputVolumeL : 0
    const outputLAA = outputVolumeL * (outputABV / 100)
    const costPerLAAOutput = outputLAA > 0 ? ethanolCalc.cost / outputLAA : 0
    const yield = inputVolumeL > 0 ? (outputVolumeL / inputVolumeL) * 100 : 0
    
    return {
      ethanolCost: ethanolCalc.cost,
      costPerLiterOutput,
      costPerLAAOutput,
      yield
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
   * Calculate gin production costs with ethanol integration
   */
  static calculateGinProductionCosts(): {
    ethanol: ReturnType<typeof EthanolCostCalculator.calculateGinEthanolCost>
    distillation: {
      inputVolumeL: 1000
      inputABV: 50
      outputVolumeL: 250  // Hearts collection
      outputABV: 80
      yield: number
      costPerLiterGin: number
      costPerLAAGin: number
    }
    total: {
      ethanolCost: number
      distillationCost: number  // From distillation calculator
      totalCost: number
      costPerLiterFinal: number
    }
  } {
    const ethanol = this.calculateGinEthanolCost()
    const finalProduct = this.calculateFinalProductCost(
      ethanol.batch.id,
      1000,  // Input volume
      50,    // Input ABV
      250,   // Output volume (hearts)
      80     // Output ABV
    )
    
    // This would integrate with distillation costs
    const distillationCost = 0 // Placeholder - would come from distillation calculator
    
    return {
      ethanol,
      distillation: {
        inputVolumeL: 1000,
        inputABV: 50,
        outputVolumeL: 250,
        outputABV: 80,
        yield: finalProduct.yield,
        costPerLiterGin: finalProduct.costPerLiterOutput,
        costPerLAAGin: finalProduct.costPerLAAOutput
      },
      total: {
        ethanolCost: ethanol.cost,
        distillationCost,
        totalCost: ethanol.cost + distillationCost,
        costPerLiterFinal: (ethanol.cost + distillationCost) / 250
      }
    }
  }
}
