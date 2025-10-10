/**
 * Gin Distillation Process - Carrie Still
 * 
 * Defines the complete distillation process for gin production
 * with detailed steps, timing, and resource consumption.
 */

import { DISTILLATION_CONSTANTS } from '../constants/distillation.constants'
import { DistillationProcess } from '../types/distillation.types'
import { calculateStepCost } from '../constants/distillation.constants'

export const ginDistillation: DistillationProcess = {
  id: "gin-carrie-still",
  name: "Gin Distillation – Carrie Still",
  description: "Complete gin distillation process using Carrie Still with botanical maceration and hearts collection",
  productType: 'gin',
  steps: [
    {
      day: 0,
      name: "Warm-up to 60°C",
      durationHours: 2.5,
      currentA: 33,
      waterFlow_Lph: 0,
      dephlegmatorActive: false,
      temperatureC: 60,
      notes: "Preheat 1000 L of 50% ethanol. No condenser water yet. Botanicals macerating."
    },
    {
      day: 1,
      name: "Heat-up & first strip",
      durationHours: 3.5,
      currentA: 33,
      waterFlow_Lph: DISTILLATION_CONSTANTS.waterFlowReduced_Lph,
      dephlegmatorActive: false,
      temperatureC: 78,
      notes: "First 2 hours dry heat, then water at 50% capacity. Discard foreshots."
    },
    {
      day: 1,
      name: "Hearts collection",
      durationHours: 8,
      currentA: 29,
      waterFlow_Lph: DISTILLATION_CONSTANTS.waterFlowNormal_Lph,
      dephlegmatorActive: false,
      outputVolume_L: 250,
      outputABV: 80,
      temperatureC: 78,
      notes: "Collected 250 L of gin hearts. Discarded 2 L foreshots, 10 L heads."
    },
    {
      day: 1,
      name: "Tails collection",
      durationHours: 4,
      currentA: 25,
      waterFlow_Lph: DISTILLATION_CONSTANTS.waterFlowNormal_Lph,
      dephlegmatorActive: false,
      outputVolume_L: 200,
      outputABV: 67,
      temperatureC: 78,
      notes: "Collected tails for vodka redistillation. ABV dropped to ~67%."
    },
    {
      day: 1,
      name: "Cool-down & cleanup",
      durationHours: 1,
      currentA: 0,
      waterFlow_Lph: DISTILLATION_CONSTANTS.waterFlowReduced_Lph,
      dephlegmatorActive: false,
      temperatureC: 25,
      notes: "System cool-down and botanical cleanup."
    }
  ],
  totalDurationHours: 19,
  estimatedCostPerBatch: 0, // Will be calculated
  estimatedCostPerLiter: 0  // Will be calculated
}

// Calculate estimated costs
const calculateProcessCosts = (process: DistillationProcess) => {
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

// Update the gin distillation process with calculated costs
const ginCosts = calculateProcessCosts(ginDistillation)
ginDistillation.estimatedCostPerBatch = ginCosts.totalOperationalCost
ginDistillation.estimatedCostPerLiter = ginCosts.costPerLiter

export const ginDistillationCosts = ginCosts
