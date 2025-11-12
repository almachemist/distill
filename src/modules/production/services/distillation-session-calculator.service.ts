// distillation-session-calculator.service.ts
import { DistillationSession, DistillationCost, DistillationMetrics, BotanicalUsage, OutputPhase, OutputDetail } from '../types/distillation-session.types'
import { DISTILLATION_CONSTANTS } from '../constants/distillation.constants'
import { ethanolBatches } from '../types/ethanol-comprehensive.types'

const toNumber = (value: number | null | undefined): number => value ?? 0
const toNumberOr = (value: number | null | undefined, fallback: number): number => (value ?? fallback)

const isOutputPhase = (output: OutputPhase | OutputDetail): output is OutputPhase => 'volumeL' in output

export class DistillationSessionCalculator {
  /**
   * Calculate Litres of Absolute Alcohol (LAL)
   */
  static calculateLAL(volumeL: number | null | undefined, abv: number | null | undefined): number {
    const safeVolume = toNumber(volumeL)
    const safeAbv = toNumber(abv)
    return safeVolume * (safeAbv / 100)
  }

  /**
   * Calculate efficiency percentage (LAL Out ÷ LAL In)
   */
  static calculateEfficiency(lalIn: number | null | undefined, lalOut: number | null | undefined): number {
    const safeIn = toNumber(lalIn)
    const safeOut = toNumber(lalOut)
    return safeIn > 0 ? (safeOut / safeIn) * 100 : 0
  }

  /**
   * Calculate power consumption in kW
   * Formula: kW = 1.732 × 415 × Amps × 0.9 / 1000
   */
  static calculatePowerKW(currentA: number): number {
    return 1.732 * 415 * currentA * 0.9 / 1000
  }

  /**
   * Calculate energy cost
   */
  static calculateEnergyCost(currentA: number, hours: number): number {
    const powerKW = this.calculatePowerKW(currentA)
    return powerKW * hours * DISTILLATION_CONSTANTS.electricityRate
  }

  /**
   * Calculate water cost
   */
  static calculateWaterCost(flow_Lph: number, hours: number): number {
    const volumeKL = (flow_Lph * hours) / 1000
    return volumeKL * DISTILLATION_CONSTANTS.waterRate
  }

  /**
   * Calculate ethanol cost based on batch usage
   */
  static calculateEthanolCost(ethanolBatchId: string | undefined, volumeL: number | null | undefined, abv: number | null | undefined): number {
    const safeVolume = toNumber(volumeL)
    const safeAbv = toNumber(abv)

    if (!ethanolBatchId) {
      // Use default ethanol pricing if no batch ID provided
      const defaultEthanolPrice = 2.50 // AUD per litre
      const pureAlcoholNeeded = safeVolume * (safeAbv / 100)
      const ethanolVolumeNeeded = pureAlcoholNeeded / 0.96 // Assuming 96% ethanol
      return ethanolVolumeNeeded * defaultEthanolPrice
    }

    const batch = ethanolBatches.find(b => b.id === ethanolBatchId)
    if (!batch) {
      // Fallback to default pricing if batch not found
      const defaultEthanolPrice = 2.50 // AUD per litre
      const pureAlcoholNeeded = safeVolume * (safeAbv / 100)
      const ethanolVolumeNeeded = pureAlcoholNeeded / 0.96 // Assuming 96% ethanol
      return ethanolVolumeNeeded * defaultEthanolPrice
    }

    const pureAlcoholNeeded = safeVolume * (safeAbv / 100)
    const ethanolVolumeFromBatch = pureAlcoholNeeded / (batch.alcoholStrength / 100)
    
    return ethanolVolumeFromBatch * batch.costPerLitreAUD
  }

  /**
   * Calculate botanical cost based on inventory pricing
   */
  static calculateBotanicalCost(botanicals: BotanicalUsage[]): number {
    // Mock botanical pricing - in real implementation, this would query inventory
    const botanicalPrices: Record<string, number> = {
      'juniper': 43.23,
      'coriander': 12.85,
      'angelica': 58.17,
      'orris root': 52.32,
      'orange': 3.99,
      'lemon': 6.99,
      'liquorice': 28.08,
      'cardamon': 64.14,
      'chamomile': 32.20,
      'lavender': 87.88,
      'lemon myrtle': 133.76
    }

    return botanicals.reduce((total, botanical) => {
      const pricePerKg = botanicalPrices[botanical.name.toLowerCase()] || 0
      const kgUsed = toNumber(botanical.weightG) / 1000
      return total + (kgUsed * pricePerKg)
    }, 0)
  }

  /**
   * Calculate total botanical weight and percentages
   */
  static calculateBotanicalTotals(botanicals: BotanicalUsage[]): { totalG: number, percentages: BotanicalUsage[] } {
    const totalG = botanicals.reduce((sum, botanical) => sum + toNumber(botanical.weightG), 0)

    const percentages = botanicals.map(botanical => ({
      ...botanical,
      ratio_percent: totalG > 0 ? (toNumber(botanical.weightG) / totalG) * 100 : 0
    }))

    return { totalG, percentages }
  }

  /**
   * Validate charge components and calculate totals
   */
  static validateChargeComponents(components: any[]): { isValid: boolean, total: any, errors: string[] } {
    const errors: string[] = []
    
    if (!components || components.length === 0) {
      errors.push("No charge components provided")
      return { isValid: false, total: null, errors }
    }

    const totalVolume = components.reduce((sum, comp) => sum + toNumber(comp.volume_L), 0)
    const totalLAL = components.reduce((sum, comp) => sum + toNumber(comp.lal), 0)
    const totalABV = totalVolume > 0 ? (totalLAL / totalVolume) * 100 : 0

    // Validate LAL calculations
    components.forEach((comp, index) => {
      const expectedLAL = toNumber(comp.volume_L) * (toNumber(comp.abv_percent) / 100)
      if (Math.abs(toNumber(comp.lal) - expectedLAL) > 0.1) {
        errors.push(`Component ${index + 1} (${comp.source}): LAL calculation mismatch`)
      }
    })

    return {
      isValid: errors.length === 0,
      total: {
        volume_L: totalVolume,
        abv_percent: totalABV,
        lal: totalLAL
      },
      errors
    }
  }

  /**
   * Calculate all costs for a distillation session
   */
  static calculateDistillationCosts(session: DistillationSession): DistillationCost {
    const hours = toNumberOr(session.distillationHours, 10)
    const electricityCost = this.calculateEnergyCost(toNumberOr(session.powerA, 35), hours)
    const waterCost = this.calculateWaterCost(DISTILLATION_CONSTANTS.waterFlowNormal_Lph, hours)
    const ethanolCost = this.calculateEthanolCost(session.ethanolBatch, session.chargeVolumeL, session.chargeABV)
    const botanicalCost = this.calculateBotanicalCost(session.botanicals || [])
    
    const totalCost = electricityCost + waterCost + ethanolCost + botanicalCost
    const outputLAL = toNumber(session.lalOut)
    const costPerLAL = outputLAL > 0 ? totalCost / outputLAL : 0

    return {
      electricityAUD: electricityCost,
      waterAUD: waterCost,
      ethanolAUD: ethanolCost,
      botanicalAUD: botanicalCost,
      totalAUD: totalCost,
      costPerLAL
    }
  }

  /**
   * Calculate comprehensive distillation metrics
   */
  static calculateDistillationMetrics(session: DistillationSession): DistillationMetrics {
    const inputLAL = toNumber(session.chargeLAL ?? session.lalIn)
    const outputLAL = toNumber(session.lalOut)
    const efficiency = this.calculateEfficiency(inputLAL, outputLAL)

    const outputs = (session.outputs ?? []) as (OutputPhase | OutputDetail)[]
    const outputPhases = outputs.filter(isOutputPhase)
    const totalVolumeOut = outputPhases.reduce((sum, output) => sum + toNumber(output.volumeL), 0)
    const totalLALOut = outputPhases.reduce((sum, output) => sum + toNumber(output.lal), 0)
    const averageABV = totalVolumeOut > 0 ? (totalLALOut / totalVolumeOut) * 100 : 0

    const costs = this.calculateDistillationCosts({ ...session, outputs: outputPhases as OutputPhase[] })
    const costPerLAL = costs.costPerLAL
    const costPerLiter = totalVolumeOut > 0 ? costs.totalAUD / totalVolumeOut : 0

    return {
      inputLAL,
      outputLAL,
      efficiency,
      totalVolumeOut,
      averageABV,
      costPerLAL,
      costPerLiter
    }
  }

  /**
   * Process a complete distillation session with all calculations
   */
  static processDistillationSession(session: DistillationSession): DistillationSession {
    // Calculate LAL for each output phase
    const originalOutputs = (session.outputs ?? []) as (OutputPhase | OutputDetail)[]
    const outputsArePhases = originalOutputs.every(isOutputPhase)

    let processedOutputs: OutputPhase[] | OutputDetail[]
    let processedOutputPhases: OutputPhase[]

    if (outputsArePhases) {
      processedOutputPhases = (originalOutputs as OutputPhase[]).map(output => {
        const volumeL = toNumber(output.volumeL)
        const abv = toNumber(output.abv)

        return {
          ...output,
          volumeL,
          abv,
          lal: this.calculateLAL(volumeL, abv)
        }
      })
      processedOutputs = processedOutputPhases
    } else {
      processedOutputPhases = []
      processedOutputs = originalOutputs as OutputDetail[]
    }

    // Calculate total LAL out
    const lalOut = processedOutputPhases.reduce((sum, output) => sum + toNumber(output.lal), 0)
    const lalEfficiency = this.calculateEfficiency(session.chargeLAL ?? session.lalIn, lalOut)

    // Calculate botanical totals and percentages
    const botanicalTotals = this.calculateBotanicalTotals(session.botanicals || [])
    const processedBotanicals = botanicalTotals.percentages

    // Validate charge components if provided
    let chargeValidation = { isValid: true, total: null, errors: [] as string[] }
    if (session.charge?.components) {
      chargeValidation = this.validateChargeComponents(session.charge.components)
    }

    // Calculate costs
    const costs = this.calculateDistillationCosts({
      ...session,
      outputs: processedOutputPhases,
      lalOut,
      lalEfficiency,
      botanicals: processedBotanicals,
      totalBotanicals_g: botanicalTotals.totalG,
      totalBotanicals_percent: 100.0
    })

    return {
      ...session,
      outputs: processedOutputs,
      lalOut,
      lalEfficiency,
      botanicals: processedBotanicals,
      totalBotanicals_g: botanicalTotals.totalG,
      totalBotanicals_percent: 100.0,
      costs,
      // Add validation info to notes if there are errors
      notes: chargeValidation.errors.length > 0 
        ? `${session.notes || ''}\n\nValidation Errors: ${chargeValidation.errors.join(', ')}`
        : session.notes
    }
  }
}



