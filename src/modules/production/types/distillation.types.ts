/**
 * Distillation Process Type Definitions
 * 
 * Defines the structure for tracking distillation steps and processes
 * for cost calculation and production management.
 */

export interface DistillationStep {
  day: number
  name: string
  durationHours: number
  currentA: number                    // Current draw in Amperes
  waterFlow_Lph: number              // Water flow rate in L/h
  dephlegmatorActive: boolean        // Whether dephlegmator is running
  outputVolume_L?: number            // Volume of product collected (L)
  outputABV?: number                 // Alcohol by Volume percentage
  temperatureC?: number              // Operating temperature (°C)
  notes?: string                     // Additional process notes
}

export interface DistillationProcess {
  id: string
  name: string
  description: string
  productType: 'gin' | 'vodka' | 'neutral' | 'other'
  steps: DistillationStep[]
  totalDurationHours: number
  estimatedCostPerBatch: number
  estimatedCostPerLiter: number
}

export interface DistillationBatch {
  id: string
  processId: string
  recipeId?: string                  // Link to gin recipe if applicable
  startDate: Date
  endDate?: Date
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  actualSteps: DistillationStep[]   // Actual steps performed
  totalCost: number
  totalEnergyCost: number
  totalWaterCost: number
  totalVolumeProduced_L: number
  finalABV: number
  efficiency: number                 // Actual vs estimated efficiency
  notes?: string
}

export interface CostBreakdown {
  energy: {
    totalCost: number
    totalKWh: number
    costPerKWh: number
  }
  water: {
    totalCost: number
    totalKL: number
    costPerKL: number
  }
  ingredients: {
    totalCost: number
    ethanolCost: number
    botanicalCost: number
  }
  total: number
  costPerLiter: number
  costPerBatch: number
}

export interface ProductionMetrics {
  batchId: string
  processType: string
  volumeProduced_L: number
  abv: number
  totalCost: number
  costPerLiter: number
  energyEfficiency: number          // kWh per liter
  waterEfficiency: number           // L water per L product
  productionTime_hours: number
  yield: number                     // Actual vs theoretical yield
}
