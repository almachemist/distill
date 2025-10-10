// distillation-session-calculator.service.ts
import { DistillationSession, DistillationCost, DistillationMetrics, BotanicalUsage } from '../types/distillation-session.types'
import { DISTILLATION_CONSTANTS } from '../constants/distillation.constants'
import { ethanolBatches } from '../types/ethanol-comprehensive.types'

export class DistillationSessionCalculator {
  /**
   * Calculate Litres of Absolute Alcohol (LAL)
   */
  static calculateLAL(volumeL: number, abv: number): number {
    return volumeL * (abv / 100)
  }

  /**
   * Calculate efficiency percentage (LAL Out ÷ LAL In)
   */
  static calculateEfficiency(lalIn: number, lalOut: number): number {
    return lalOut > 0 ? (lalOut / lalIn) * 100 : 0
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
  static calculateEthanolCost(ethanolBatchId: string, volumeL: number, abv: number): number {
    const batch = ethanolBatches.find(b => b.id === ethanolBatchId)
    if (!batch) throw new Error(`Ethanol batch ${ethanolBatchId} not found`)

    const pureAlcoholNeeded = volumeL * (abv / 100)
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
      'orange peel': 3.99,
      'lemon peel': 6.99,
      'liquorice': 28.08,
      'cardamon': 64.14,
      'chamomile': 32.20,
      'lavender': 87.88,
      'lemon myrtle': 133.76
    }

    return botanicals.reduce((total, botanical) => {
      const pricePerKg = botanicalPrices[botanical.name.toLowerCase()] || 0
      const kgUsed = botanical.weightG / 1000
      return total + (kgUsed * pricePerKg)
    }, 0)
  }

  /**
   * Calculate all costs for a distillation session
   */
  static calculateDistillationCosts(session: DistillationSession): DistillationCost {
    const electricityCost = this.calculateEnergyCost(session.powerA, session.distillationHours || 10)
    const waterCost = this.calculateWaterCost(DISTILLATION_CONSTANTS.waterFlowNormal_Lph, session.distillationHours || 10)
    const ethanolCost = this.calculateEthanolCost(session.ethanolBatch, session.chargeVolumeL, session.chargeABV)
    const botanicalCost = this.calculateBotanicalCost(session.botanicals)
    
    const totalCost = electricityCost + waterCost + ethanolCost + botanicalCost
    const costPerLAL = session.lalOut ? totalCost / session.lalOut : 0

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
    const inputLAL = session.lalIn
    const outputLAL = session.lalOut || 0
    const efficiency = this.calculateEfficiency(inputLAL, outputLAL)
    
    const totalVolumeOut = session.outputs.reduce((sum, output) => sum + output.volumeL, 0)
    const totalLALOut = session.outputs.reduce((sum, output) => sum + output.lal, 0)
    const averageABV = totalVolumeOut > 0 ? (totalLALOut / totalVolumeOut) * 100 : 0

    const costs = this.calculateDistillationCosts(session)
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
    const processedOutputs = session.outputs.map(output => ({
      ...output,
      lal: this.calculateLAL(output.volumeL, output.abv)
    }))

    // Calculate total LAL out
    const lalOut = processedOutputs.reduce((sum, output) => sum + output.lal, 0)
    const lalEfficiency = this.calculateEfficiency(session.lalIn, lalOut)

    // Calculate costs
    const costs = this.calculateDistillationCosts({
      ...session,
      outputs: processedOutputs,
      lalOut,
      lalEfficiency
    })

    return {
      ...session,
      outputs: processedOutputs,
      lalOut,
      lalEfficiency,
      costs
    }
  }
}

