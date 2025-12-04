/**
 * Vodka Redistillation Process - Carrie Still
 * 
 * Defines the vodka redistillation process using gin tails
 * with dephlegmator operation for high-purity neutral spirit.
 */

import { DISTILLATION_CONSTANTS } from '../constants/distillation.constants'
import { DistillationProcess } from '../types/distillation.types'
import { calculateStepCost } from '../constants/distillation.constants'
import { ginDistillation, ginDistillationCosts } from './gin-distillation.process'

export const vodkaDistillation: DistillationProcess = {
  id: "vodka-carrie-still",
  name: "Vodka Distillation (from gin tails)",
  description: "High-purity vodka production from gin tails using dephlegmator",
  productType: 'vodka',
  steps: [
    {
      day: 2,
      name: "Late tails distillation",
      durationHours: 10,
      currentA: 25,
      waterFlow_Lph: DISTILLATION_CONSTANTS.waterFlowNormal_Lph,
      dephlegmatorActive: true,
      temperatureC: 78,
      notes: "Distilled until ABV dropped to ~67%. Dephlegmator 1 L/28s."
    },
    {
      day: 3,
      name: "Re-distillation feed",
      durationHours: 20,
      currentA: 25,
      waterFlow_Lph: DISTILLATION_CONSTANTS.waterFlowDephlegmator_Lph,
      dephlegmatorActive: true,
      outputVolume_L: 200,
      outputABV: 88,
      temperatureC: 78,
      notes: "Each vodka cycle uses ~800–900 L of late tails; total of 4 runs."
    },
    {
      day: 3,
      name: "High-purity collection",
      durationHours: 8,
      currentA: 22,
      waterFlow_Lph: DISTILLATION_CONSTANTS.waterFlowDephlegmator_Lph,
      dephlegmatorActive: true,
      outputVolume_L: 150,
      outputABV: 95,
      temperatureC: 78,
      notes: "Final high-purity vodka collection. Dephlegmator optimized for purity."
    },
    {
      day: 3,
      name: "System shutdown",
      durationHours: 2,
      currentA: 0,
      waterFlow_Lph: DISTILLATION_CONSTANTS.waterFlowReduced_Lph,
      dephlegmatorActive: false,
      temperatureC: 25,
      notes: "Gradual shutdown and system cooling."
    }
  ],
  totalDurationHours: 40,
  estimatedCostPerBatch: 0, // Will be calculated
  estimatedCostPerLiter: 0  // Will be calculated
}

// Calculate estimated costs for vodka process
const calculateVodkaCosts = (process: DistillationProcess) => {
  let totalEnergyCost = 0
  let totalWaterCost = 0
  
  process.steps.forEach(step => {
    const stepCost = calculateStepCost(step.currentA, step.waterFlow_Lph, step.durationHours)
    totalEnergyCost += stepCost.energy
    totalWaterCost += stepCost.water
  })
  
  const totalOperationalCost = totalEnergyCost + totalWaterCost
  const totalVolumeProduced = process.steps.reduce((sum, step) => sum + (step.outputVolume_L || 0), 0)
  
  return {
    totalOperationalCost,
    totalEnergyCost,
    totalWaterCost,
    costPerLiter: totalVolumeProduced > 0 ? totalOperationalCost / totalVolumeProduced : 0
  }
}

// Update the vodka distillation process with calculated costs
const vodkaCosts = calculateVodkaCosts(vodkaDistillation)
vodkaDistillation.estimatedCostPerBatch = vodkaCosts.totalOperationalCost
vodkaDistillation.estimatedCostPerLiter = vodkaCosts.costPerLiter

export const vodkaDistillationCosts = vodkaCosts

/**
 * Combined Process Summary
 * 
 * Provides a summary of both gin and vodka processes for cost comparison
 */
export const processSummary = {
  gin: {
    process: ginDistillation,
    costs: ginDistillationCosts,
    totalVolume_L: ginDistillation.steps.reduce((sum, step) => sum + (step.outputVolume_L || 0), 0),
    totalDuration_hours: ginDistillation.totalDurationHours,
    avgABV: 73.5 // Average of hearts (80%) and tails (67%)
  },
  vodka: {
    process: vodkaDistillation,
    costs: vodkaDistillationCosts,
    totalVolume_L: vodkaDistillation.steps.reduce((sum, step) => sum + (step.outputVolume_L || 0), 0),
    totalDuration_hours: vodkaDistillation.totalDurationHours,
    avgABV: 91.5 // Average of redistillation (88%) and high-purity (95%)
  }
}
