import { DistillationSession, OutputPhase, OutputDetail } from '../types/distillation-session.types'

export class VodkaDistillationCalculator {
  static calculateMetrics(session: DistillationSession) {
    const chargeVol = session.chargeVolumeL ?? 0
    const chargeAbv = session.chargeABV ?? 0
    const inputLAL = session.chargeLAL ?? (chargeVol * chargeAbv / 100)

    const outputs = (session.outputs ?? []) as Array<OutputPhase | OutputDetail>
    const heartsOutputs = outputs.filter(o => {
      const phaseName = 'name' in o ? o.name : ('phase' in o ? o.phase : undefined)
      return phaseName === 'Hearts'
    })

    const getLal = (o: OutputPhase | OutputDetail): number => {
      return typeof o.lal === 'number' ? o.lal : 0
    }
    const outputLAL = heartsOutputs.reduce((sum, o) => sum + getLal(o), 0)

    const getVolume = (o: OutputPhase | OutputDetail): number => {
      return 'volumeL' in o ? (o.volumeL ?? 0) : (o.volume_L ?? 0)
    }

    const totalOutputVolume = outputs.reduce((sum, o) => sum + getVolume(o), 0)
    const recovery = chargeVol > 0 ? (totalOutputVolume / chargeVol) * 100 : 0

    const heartsVolume = heartsOutputs.reduce((sum, o) => sum + getVolume(o), 0)
    const spiritYield = totalOutputVolume > 0 ? (heartsVolume / totalOutputVolume) * 100 : 0

    const totalRunLAL = (session.runData ?? []).reduce((sum, run) => sum + (run.lal ?? 0), 0)

    return {
      inputLAL,
      outputLAL,
      efficiency: inputLAL > 0 ? (outputLAL / inputLAL) * 100 : 0,
      recovery,
      spiritYield,
      totalRunLAL,
      totalOutputVolume,
      heartsVolume
    }
  }
  
  static calculateCosts(session: DistillationSession) {
    const ethanolCostPerLiter = 2.50
    const powerCostPerKWh = 0.25
    const laborCostPerHour = 35.00

    const ethanolCost = (session.chargeVolumeL ?? 0) * ethanolCostPerLiter
    const powerCost = ((session.elementsKW ?? 0) * 8) * powerCostPerKWh
    const laborCost = 8 * laborCostPerHour

    const totalCost = ethanolCost + powerCost + laborCost

    const metrics = this.calculateMetrics(session)
    const costPerLAL = metrics.outputLAL > 0 ? totalCost / metrics.outputLAL : 0
    const costPerLiter = metrics.totalOutputVolume > 0 ? totalCost / metrics.totalOutputVolume : 0

    return {
      ethanolAUD: ethanolCost,
      botanicalAUD: 0,
      electricityAUD: powerCost,
      waterAUD: 0,
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
      totalRun: session.totalRun ? {
        ...session.totalRun,
        lal: session.totalRun.lal ?? metrics.totalRunLAL
      } : session.totalRun
    }
  }
}
