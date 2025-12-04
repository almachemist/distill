// distillation-session.types.ts

export type NullableNumber = number | null
export type NullableString = string | null

export interface ChargeComponent {
  source: string
  volume_L: NullableNumber
  abv_percent: NullableNumber
  lal: NullableNumber
  type: "ethanol" | "dilution" | "water" | "other"
}

export interface ChargeDetails {
  components: ChargeComponent[]
  total: {
    volume_L: NullableNumber
    abv_percent: NullableNumber
    lal: NullableNumber
  }
}

export interface BotanicalUsage {
  name: string
  weightG: NullableNumber
  notes?: string
  ratio_percent?: number
  status?: "ok" | "pending" | "issue"
}

export interface OutputPhase {
  name: "Foreshots" | "Heads" | "Hearts" | "Tails"
  volumeL: NullableNumber
  abv: NullableNumber
  lal: NullableNumber
  vessel?: string
  observations?: string
}

export interface RunDataPoint {
  time?: NullableString
  phase: string
  volume_L: NullableNumber
  volume_percent?: NullableNumber
  abv_percent: NullableNumber
  density?: NullableNumber
  condenserTemp_C?: NullableNumber
  lal?: NullableNumber
  observations?: string
}

export interface StillSetup {
  elements: NullableString
  steeping: NullableString
  plates: NullableString
  options: NullableString
}

export interface TotalRun {
  volume_L: NullableNumber
  volume_percent?: NullableNumber
  abv_percent: NullableNumber
  lal?: NullableNumber
  notes?: string
}

export interface OutputDetail {
  phase: string
  output: string
  receivingVessel?: NullableString
  volume_L: NullableNumber
  volume_percent?: NullableNumber
  abv_percent: NullableNumber
  lal?: NullableNumber
}

export interface DilutionDetail {
  number: number
  date: NullableString
  newMake_L: NullableNumber
  filteredWater_L?: NullableNumber
  ethanolAdded?: string
  newVolume_L?: NullableNumber
  finalAbv_percent?: NullableNumber
  abv_percent?: NullableNumber
  lal?: NullableNumber
  notes: string
}

export interface FinalOutput {
  totalVolume_L: NullableNumber
  lal: NullableNumber
  finalAbv_percent: NullableNumber
  notes: string
}

export interface DilutionStep {
  stepNo: number
  date?: NullableString
  newMakeL: NullableNumber
  waterL: NullableNumber
  finalVolumeL: NullableNumber
  finalABV: NullableNumber
  lal?: NullableNumber
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

export interface HeartPart {
  id: string
  label: string
  startTime?: string
  endTime?: string
  volumeL: NullableNumber
  abvPercent: NullableNumber
  density?: NullableNumber
  condenserTempC?: NullableNumber
  currentA?: NullableNumber
  receivingVessel?: string
  destination?: string
  notes?: string
  lal?: NullableNumber
}

export interface PhaseEntry {
  id: string
  startTime?: string
  endTime?: string
  volumeL: NullableNumber
  abvPercent: NullableNumber
  density?: NullableNumber
  condenserTempC?: NullableNumber
  currentA?: NullableNumber
  receivingVessel?: string
  destination?: string
  notes?: string
  label?: string
}

export interface PhaseTotal {
  volumeL: NullableNumber
  avgAbvPercent: NullableNumber
  lal: NullableNumber
  count: number
}

export interface DistillationPhases {
  foreshots?: PhaseEntry[]
  heads?: PhaseEntry[]
  hearts?: HeartPart[]
  tails?: PhaseEntry[]
}

export interface DistillationTotals {
  hearts?: PhaseTotal
}

export interface DistillationSession {
  id: string
  spiritRun?: string
  sku: string
  description?: string
  date: string
  still: string
  boilerOn: string
  ethanolBatch?: string
  chargeVolumeL: NullableNumber
  chargeABV: NullableNumber
  chargeLAL?: NullableNumber
  lalIn?: NullableNumber
  lalOut?: NullableNumber
  lalEfficiency?: NullableNumber
  powerA: number
  steepingHours?: NullableNumber
  elementsKW: number
  distillationHours?: NullableNumber
  charge?: ChargeDetails
  stillSetup?: StillSetup
  runData?: RunDataPoint[]
  totalRun?: TotalRun
  outputs?: OutputPhase[] | OutputDetail[]
  dilutions?: DilutionStep[] | DilutionDetail[]
  finalOutput?: FinalOutput
  botanicals: BotanicalUsage[]
  totalBotanicals_g?: NullableNumber
  totalBotanicals_percent?: NullableNumber
  botanicalsPerLAL?: NullableNumber
  efficiency?: NullableNumber
  recovery?: NullableNumber
  spiritYield?: NullableNumber
  costs?: DistillationCost | {
    ethanolCost: number
    botanicalCost: number
    laborCost: number
    utilityCost: number
    totalCost: number
    costPerLAL: number
    costPerLiter: number
  }
  phases?: DistillationPhases
  totals?: DistillationTotals
  notes?: string
}

export interface DistillationMetrics {
  inputLAL: NullableNumber
  outputLAL: NullableNumber
  efficiency: NullableNumber
  totalVolumeOut: NullableNumber
  averageABV: NullableNumber
  costPerLAL: NullableNumber
  costPerLiter: NullableNumber
}

export interface StillConfiguration {
  id: string
  name: string
  voltage: number
  powerFactor: number
  elementsKW: number
  waterFlowCapacity_Lph: number
}

