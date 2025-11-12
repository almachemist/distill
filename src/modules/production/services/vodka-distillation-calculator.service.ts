import { DistillationSession } from '../types/distillation-session.types'

export class VodkaDistillationCalculator {
  static calculateMetrics(session: DistillationSession) {
    // Calculate input LAL
    const inputLAL = session.chargeLAL || (session.chargeVolumeL * session.chargeABV / 100)
    
    // Calculate output LAL from hearts
    const heartsOutputs = session.outputs?.filter(output => 
      output.name === 'Hearts' && output.lal
    ) || []
    
    const outputLAL = heartsOutputs.reduce((sum, output) => sum + (output.lal || 0), 0)
    
    // Calculate efficiency (LAL recovery)
    const efficiency = inputLAL > 0 ? (outputLAL / inputLAL) * 100 : 0
    
    // Calculate recovery (volume recovery)
    const totalOutputVolume = session.outputs?.reduce((sum, output) => sum + output.volumeL, 0) || 0
    const recovery = session.chargeVolumeL > 0 ? (totalOutputVolume / session.chargeVolumeL) * 100 : 0
    
    // Calculate spirit yield (hearts as % of total output)
    const heartsVolume = heartsOutputs.reduce((sum, output) => sum + output.volumeL, 0)
    const spiritYield = totalOutputVolume > 0 ? (heartsVolume / totalOutputVolume) * 100 : 0
    
    // Calculate total run LAL
    const totalRunLAL = session.runData?.reduce((sum, run) => sum + (run.lal || 0), 0) || 0
    
    return {
      inputLAL,
      outputLAL,
      efficiency,
      recovery,
      spiritYield,
      totalRunLAL,
      totalOutputVolume,
      heartsVolume
    }
  }
  
  static calculateCosts(session: DistillationSession) {
    // Basic cost calculations (can be enhanced with actual pricing)
    const ethanolCostPerLiter = 2.50 // AUD per liter
    const powerCostPerKWh = 0.25 // AUD per kWh
    const laborCostPerHour = 35.00 // AUD per hour
    
    const ethanolCost = session.chargeVolumeL * ethanolCostPerLiter
    const powerCost = (session.elementsKW * 8) * powerCostPerKWh // Assuming 8 hours
    const laborCost = 8 * laborCostPerHour // Assuming 8 hours labor
    
    const totalCost = ethanolCost + powerCost + laborCost
    
    const metrics = this.calculateMetrics(session)
    const costPerLAL = metrics.outputLAL > 0 ? totalCost / metrics.outputLAL : 0
    const costPerLiter = metrics.totalOutputVolume > 0 ? totalCost / metrics.totalOutputVolume : 0
    
    return {
      ethanolAUD: ethanolCost,
      botanicalAUD: 0, // No botanicals for vodka
      electricityAUD: powerCost,
      waterAUD: 0, // Assuming no water cost for vodka
      totalAUD: totalCost,
      costPerLAL,
      costPerLiter
    }
  }
  
  static enhanceSession(session: DistillationSession): DistillationSession {
    const metrics = this.calculateMetrics(session)
    const costs = this.calculateCosts(session)
    
    return {
      ...session,
      efficiency: metrics.efficiency,
      recovery: metrics.recovery,
      spiritYield: metrics.spiritYield,
      lalOut: metrics.outputLAL,
      lalEfficiency: metrics.efficiency,
      costs: costs,
      // Update totalRun LAL if not set
      totalRun: session.totalRun ? {
        ...session.totalRun,
        lal: session.totalRun.lal || metrics.totalRunLAL
      } : undefined
    }
  }
}
