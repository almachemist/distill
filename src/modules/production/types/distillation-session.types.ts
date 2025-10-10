// distillation-session.types.ts
export interface BotanicalUsage {
  name: string
  weightG: number
  notes?: string
}

export interface OutputPhase {
  name: "Foreshots" | "Heads" | "Hearts" | "Tails"
  volumeL: number
  abv: number
  lal: number
  vessel?: string
  observations?: string
}

export interface DilutionStep {
  stepNo: number
  newMakeL: number
  waterL: number
  finalVolumeL: number
  finalABV: number
  lal?: number
  notes?: string
}

export interface DistillationCost {
  electricityAUD: number
  waterAUD: number
  ethanolAUD: number
  botanicalAUD: number
  totalAUD: number
  costPerLAL: number
}

export interface DistillationSession {
  id: string
  spiritRun: string
  sku: string
  date: string
  still: string
  boilerOn: string
  ethanolBatch: string
  chargeVolumeL: number
  chargeABV: number
  lalIn: number
  lalOut?: number
  lalEfficiency?: number
  powerA: number
  steepingHours?: number
  elementsKW: number
  distillationHours?: number
  botanicals: BotanicalUsage[]
  outputs: OutputPhase[]
  dilutions?: DilutionStep[]
  notes?: string
  costs?: DistillationCost
}

export interface DistillationMetrics {
  inputLAL: number
  outputLAL: number
  efficiency: number
  totalVolumeOut: number
  averageABV: number
  costPerLAL: number
  costPerLiter: number
}

export interface StillConfiguration {
  id: string
  name: string
  voltage: number
  powerFactor: number
  elementsKW: number
  waterFlowCapacity_Lph: number
}

