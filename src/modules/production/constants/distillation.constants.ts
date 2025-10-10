/**
 * Distillation Constants for Carrie Still Operations
 * 
 * These constants define the operational parameters for calculating
 * energy, water, and production costs for gin and vodka distillation.
 */

export const DISTILLATION_CONSTANTS = {
  // Utility Rates (AUD)
  electricityRate: 0.30972,     // $/kWh (ex GST)
  waterRate: 1.79,              // $/kL
  
  // Carrie Still Equipment Specifications
  elementPowerKW: 32,           // total kW (2 x 16kW elements)
  voltage: 415,                  // V (3-phase)
  powerFactor: 0.9,             // typical for resistive heating elements
  
  // Water Flow Rates (L/h)
  waterFlowFull_Lph: 1350,      // 100% condenser capacity
  waterFlowNormal_Lph: 1080,    // 80% normal operation
  waterFlowReduced_Lph: 675,    // 50% reduced flow
  waterFlowDephlegmator_Lph: 129, // Dephlegmator flow rate
  
  // Production Targets
  ginTargetABV: 80,             // Target gin hearts ABV
  vodkaTargetABV: 88,            // Target vodka ABV
  ginBatchVolume_L: 1000,        // Standard gin batch volume
  vodkaBatchVolume_L: 800,      // Standard vodka batch volume
  
  // Efficiency Factors
  ethanolRecoveryRate: 0.85,    // 85% ethanol recovery efficiency
  heartsCutPercentage: 0.75,    // 75% hearts cut from total distillate
  tailsCutPercentage: 0.20,     // 20% tails for vodka redistillation
}

/**
 * Calculate power consumption in kW from current draw
 * Formula: P = √3 × V × I × PF / 1000 (for 3-phase)
 */
export const calculatePowerKW = (currentA: number): number => {
  return (1.732 * DISTILLATION_CONSTANTS.voltage * currentA * DISTILLATION_CONSTANTS.powerFactor) / 1000
}

/**
 * Calculate energy cost for a given power draw and duration
 */
export const calculateEnergyCost = (currentA: number, hours: number): number => {
  const powerKW = calculatePowerKW(currentA)
  return powerKW * hours * DISTILLATION_CONSTANTS.electricityRate
}

/**
 * Calculate water cost for a given flow rate and duration
 */
export const calculateWaterCost = (flow_Lph: number, hours: number): number => {
  const kL = (flow_Lph * hours) / 1000
  return kL * DISTILLATION_CONSTANTS.waterRate
}

/**
 * Calculate total operational cost for a distillation step
 */
export const calculateStepCost = (currentA: number, flow_Lph: number, hours: number) => {
  const energy = calculateEnergyCost(currentA, hours)
  const water = calculateWaterCost(flow_Lph, hours)
  return {
    energy,
    water,
    total: energy + water,
    powerKW: calculatePowerKW(currentA)
  }
}
