import { fy2025DistillationLog, getStillPerformanceComparison } from './fy2025-distillation-log.data'
import type { DistillationSession, OutputDetail, OutputPhase } from '../types/distillation-session.types'

// Enhanced FY2025 Master Distillation Summary with Analytics
export interface FY2025MasterSummary {
  overview: {
    totalRuns: number
    totalLALCharged: number
    totalLALRecovered: number
    overallEfficiency: number
    totalVolumeIn: number
    totalVolumeOut: number
    averageEfficiency: number
    recoveryRate: number
    spiritYield: number
  }
  byProduct: {
    gin: ProductSummary
    vodka: ProductSummary
    ethanol: ProductSummary
  }
  byStill: {
    carrie: StillSummary
    roberta: StillSummary
  }
  monthlyBreakdown: {
    [month: string]: MonthlySummary
  }
  topPerformingRuns: TopRun[]
  efficiencyTrends: EfficiencyTrend[]
  costAnalysis: CostAnalysis
  qualityMetrics: QualityMetrics
}

interface ProductSummary {
  runs: number
  lalCharged: number
  lalRecovered: number
  efficiency: number
  averageEfficiency: number
  totalVolume: number
  averageABV: number
  botanicalsUsed: number
  averageBotanicalsPerLAL: number
}

interface StillSummary {
  runs: number
  lalCharged: number
  lalRecovered: number
  efficiency: number
  averageEfficiency: number
  totalVolume: number
  averageRunTime: number
  powerConsumption: number
}

interface MonthlySummary {
  runs: number
  lalCharged: number
  lalRecovered: number
  efficiency: number
  volumeProcessed: number
  products: string[]
}

interface TopRun {
  id: string
  sku: string
  date: string
  efficiency: number
  lalRecovered: number
  still: string
  productType: string
}

interface EfficiencyTrend {
  month: string
  efficiency: number
  volume: number
  runs: number
}

interface CostAnalysis {
  totalCost: number
  costPerLAL: number
  costPerLiter: number
  electricityCost: number
  waterCost: number
  ethanolCost: number
  botanicalCost: number
}

interface QualityMetrics {
  averageABV: number
  consistencyScore: number
  recoveryRate: number
  spiritYield: number
  feintsRecovery: number
}

// Generate comprehensive master summary
export const generateMasterFY2025Summary = (): FY2025MasterSummary => {
  const log = fy2025DistillationLog
  

  // Calculate product summaries with enhanced metrics
  const ginSummary = calculateProductSummary(log.runsByProduct.gin)
  const vodkaSummary = calculateProductSummary(log.runsByProduct.vodka)
  const ethanolSummary = calculateProductSummary(log.runsByProduct.ethanol)

  // Calculate still summaries with enhanced metrics
  const carrieSummary = calculateStillSummary(log.runsByStill.carrie)
  const robertaSummary = calculateStillSummary(log.runsByStill.roberta)

  // Generate monthly breakdown with enhanced data
  const monthlyBreakdown = generateEnhancedMonthlyBreakdown(log.monthlyBreakdown)

  // Get top performing runs
  const allRuns: DistillationSession[] = [...log.runsByProduct.gin, ...log.runsByProduct.vodka, ...log.runsByProduct.ethanol]
  const topPerformingRuns = allRuns
    .map(run => ({
      id: run.id,
      sku: run.sku,
      date: run.date,
      efficiency: run.efficiency || 0,
      lalRecovered: calculateLALRecovered(run),
      still: run.still,
      productType: getProductType(run)
    }))
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 5)

  // Calculate efficiency trends
  const efficiencyTrends = calculateEfficiencyTrends(log.monthlyBreakdown)

  // Calculate cost analysis
  const costAnalysis = calculateCostAnalysis(allRuns)

  // Calculate quality metrics
  const qualityMetrics = calculateQualityMetrics(allRuns)

  // Calculate overview metrics
  const totalLALRecovered = ginSummary.lalRecovered + vodkaSummary.lalRecovered + ethanolSummary.lalRecovered
  const totalVolumeOut = ginSummary.totalVolume + vodkaSummary.totalVolume + ethanolSummary.totalVolume
  const recoveryRate = log.summary.totalLALCharged > 0 ? (totalLALRecovered / log.summary.totalLALCharged) * 100 : 0
  const spiritYield = log.summary.totalVolumeIn > 0 ? (totalVolumeOut / log.summary.totalVolumeIn) * 100 : 0

  return {
    overview: {
      totalRuns: log.totalRuns,
      totalLALCharged: log.summary.totalLALCharged,
      totalLALRecovered: totalLALRecovered,
      overallEfficiency: log.summary.overallEfficiency,
      totalVolumeIn: log.summary.totalVolumeIn,
      totalVolumeOut: totalVolumeOut,
      averageEfficiency: log.summary.averageEfficiency,
      recoveryRate,
      spiritYield
    },
    byProduct: {
      gin: ginSummary,
      vodka: vodkaSummary,
      ethanol: ethanolSummary
    },
    byStill: {
      carrie: carrieSummary,
      roberta: robertaSummary
    },
    monthlyBreakdown,
    topPerformingRuns,
    efficiencyTrends,
    costAnalysis,
    qualityMetrics
  }
}

// Helper functions
function calculateProductSummary(sessions: DistillationSession[]): ProductSummary {
  const runs = sessions.length
  const lalCharged = sessions.reduce((sum, session) => sum + (session.chargeLAL || 0), 0)
  const lalRecovered = sessions.reduce((sum, session) => sum + calculateLALRecovered(session), 0)
  const efficiency = lalCharged > 0 ? (lalRecovered / lalCharged) * 100 : 0
  const averageEfficiency = runs > 0 ? sessions.reduce((sum, session) => sum + (session.efficiency || 0), 0) / runs : 0
  const totalVolume = sessions.reduce((sum, session) => sum + calculateTotalVolume(session), 0)
  const averageABV = calculateAverageABV(sessions)
  const botanicalsUsed = sessions.reduce((sum, session) => sum + (session.totalBotanicals_g || 0), 0)
  const averageBotanicalsPerLAL = lalRecovered > 0 ? botanicalsUsed / lalRecovered : 0

  return {
    runs,
    lalCharged,
    lalRecovered,
    efficiency,
    averageEfficiency,
    totalVolume,
    averageABV,
    botanicalsUsed,
    averageBotanicalsPerLAL
  }
}

function calculateStillSummary(sessions: DistillationSession[]): StillSummary {
  const runs = sessions.length
  const lalCharged = sessions.reduce((sum, session) => sum + (session.chargeLAL || 0), 0)
  const lalRecovered = sessions.reduce((sum, session) => sum + calculateLALRecovered(session), 0)
  const efficiency = lalCharged > 0 ? (lalRecovered / lalCharged) * 100 : 0
  const averageEfficiency = runs > 0 ? sessions.reduce((sum, session) => sum + (session.efficiency || 0), 0) / runs : 0
  const totalVolume = sessions.reduce((sum, session) => sum + calculateTotalVolume(session), 0)
  const averageRunTime = calculateAverageRunTime(sessions)
  const powerConsumption = sessions.reduce((sum, session) => sum + (session.powerA || 0), 0)

  return {
    runs,
    lalCharged,
    lalRecovered,
    efficiency,
    averageEfficiency,
    totalVolume,
    averageRunTime,
    powerConsumption
  }
}

function calculateLALRecovered(session: DistillationSession): number {
  const outputs = session.outputs || []
  return outputs.reduce((sum: number, output: OutputDetail | OutputPhase) => {
    const lal = (output as OutputDetail).lal ?? (output as OutputPhase).lal
    return sum + (lal || 0)
  }, 0)
}

function calculateTotalVolume(session: DistillationSession): number {
  const outputs = session.outputs || []
  return outputs.reduce((sum: number, output: OutputDetail | OutputPhase) => {
    const volDetail = (output as OutputDetail).volume_L
    const volPhase = (output as OutputPhase).volumeL
    const vol = volDetail ?? volPhase ?? 0
    return sum + vol
  }, 0)
}

function calculateAverageABV(sessions: DistillationSession[]): number {
  if (sessions.length === 0) return 0
  const totalABV = sessions.reduce((sum, session) => {
    const outputs = session.outputs || []
    const sessionABV = outputs.reduce((outputSum: number, output: OutputDetail | OutputPhase) => {
      const abvDetailPct = (output as OutputDetail).abv_percent
      const abvPhase = (output as OutputPhase).abv
      return outputSum + (abvDetailPct ?? abvPhase ?? 0)
    }, 0)
    return sum + sessionABV
  }, 0)
  return totalABV / sessions.length
}

function calculateAverageRunTime(sessions: DistillationSession[]): number {
  // This would need actual run time data - placeholder for now
  return sessions.length * 8 // Assume 8 hours average per run
}

function getProductType(session: DistillationSession): string {
  if (session.sku.toLowerCase().includes('gin')) return 'gin'
  if (session.sku.toLowerCase().includes('vodka')) return 'vodka'
  if (session.sku.toLowerCase().includes('ethanol')) return 'ethanol'
  return 'other'
}

function generateEnhancedMonthlyBreakdown(monthlyData: { [month: string]: { runs: DistillationSession[]; lalCharged: number; lalRecovered: number; efficiency: number } }): { [month: string]: MonthlySummary } {
  const enhanced: { [month: string]: MonthlySummary } = {}
  
  Object.entries(monthlyData).forEach(([month, data]) => {
    enhanced[month] = {
      runs: data.runs.length,
      lalCharged: data.lalCharged,
      lalRecovered: data.lalRecovered,
      efficiency: data.efficiency,
      volumeProcessed: data.runs.reduce((sum: number, run: DistillationSession) => sum + calculateTotalVolume(run), 0),
      products: Array.from(new Set<string>(data.runs.map((run: DistillationSession) => getProductType(run))))
    }
  })
  
  return enhanced
}

function calculateEfficiencyTrends(monthlyData: { [month: string]: { runs: DistillationSession[]; lalCharged: number; lalRecovered: number; efficiency: number } }): EfficiencyTrend[] {
  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    efficiency: data.efficiency,
    volume: data.runs.reduce((sum: number, run: DistillationSession) => sum + calculateTotalVolume(run), 0),
    runs: data.runs.length
  }))
}

function calculateCostAnalysis(sessions: DistillationSession[]): CostAnalysis {
  const totalCost = sessions.reduce((sum, session) => {
    const c = session.costs
    if (!c) return sum
    if ('totalCost' in c) return sum + (c.totalCost || 0)
    if ('totalAUD' in c) return sum + (c.totalAUD || 0)
    return sum
  }, 0)
  const totalLAL = sessions.reduce((sum, session) => sum + calculateLALRecovered(session), 0)
  const totalVolume = sessions.reduce((sum, session) => sum + calculateTotalVolume(session), 0)
  
  return {
    totalCost,
    costPerLAL: totalLAL > 0 ? totalCost / totalLAL : 0,
    costPerLiter: totalVolume > 0 ? totalCost / totalVolume : 0,
    electricityCost: sessions.reduce<number>((sum, session) => {
      const c = session.costs
      if (!c) return sum
      if ('utilityCost' in c) return sum + (c.utilityCost || 0)
      if ('electricityAUD' in c) return sum + (c.electricityAUD || 0)
      return sum
    }, 0),
    waterCost: sessions.reduce<number>((sum, session) => {
      const c = session.costs
      if (!c) return sum
      if ('waterCost' in c) return sum + (((c as { waterCost?: number }).waterCost) || 0)
      if ('waterAUD' in c) return sum + (c.waterAUD || 0)
      return sum
    }, 0),
    ethanolCost: sessions.reduce<number>((sum, session) => {
      const c = session.costs
      if (!c) return sum
      if ('ethanolCost' in c) return sum + (c.ethanolCost || 0)
      if ('ethanolAUD' in c) return sum + (c.ethanolAUD || 0)
      return sum
    }, 0),
    botanicalCost: sessions.reduce<number>((sum, session) => {
      const c = session.costs
      if (!c) return sum
      if ('botanicalCost' in c) return sum + (c.botanicalCost || 0)
      if ('botanicalAUD' in c) return sum + (c.botanicalAUD || 0)
      return sum
    }, 0)
  }
}

function calculateQualityMetrics(sessions: DistillationSession[]): QualityMetrics {
  const totalABV = sessions.reduce((sum, session) => {
    const outputs = session.outputs || []
    return sum + outputs.reduce((outputSum: number, output: OutputDetail | OutputPhase) => {
      const abvDetailPct = (output as OutputDetail).abv_percent
      const abvPhase = (output as OutputPhase).abv
      return outputSum + (abvDetailPct ?? abvPhase ?? 0)
    }, 0)
  }, 0)
  
  const totalOutputs = sessions.reduce((sum, session) => sum + (session.outputs?.length || 0), 0)
  const averageABV = totalOutputs > 0 ? totalABV / totalOutputs : 0
  
  const totalLALCharged = sessions.reduce((sum, session) => sum + (session.chargeLAL || 0), 0)
  const totalLALRecovered = sessions.reduce((sum, session) => sum + calculateLALRecovered(session), 0)
  const recoveryRate = totalLALCharged > 0 ? (totalLALRecovered / totalLALCharged) * 100 : 0
  
  const totalVolumeIn = sessions.reduce((sum, session) => sum + (session.chargeVolumeL || 0), 0)
  const totalVolumeOut = sessions.reduce((sum, session) => sum + calculateTotalVolume(session), 0)
  const spiritYield = totalVolumeIn > 0 ? (totalVolumeOut / totalVolumeIn) * 100 : 0
  
  return {
    averageABV,
    consistencyScore: calculateConsistencyScore(sessions),
    recoveryRate,
    spiritYield,
    feintsRecovery: calculateFeintsRecovery(sessions)
  }
}

function calculateConsistencyScore(sessions: DistillationSession[]): number {
  // Calculate variance in efficiency across sessions
  const efficiencies = sessions.map(session => session.efficiency || 0)
  const average = efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length
  const variance = efficiencies.reduce((sum, eff) => sum + Math.pow(eff - average, 2), 0) / efficiencies.length
  const standardDeviation = Math.sqrt(variance)
  
  // Convert to consistency score (0-100, higher is better)
  return Math.max(0, 100 - (standardDeviation / average) * 100)
}

function calculateFeintsRecovery(sessions: DistillationSession[]): number {
  // Calculate percentage of feints/tails that were recovered for ethanol production
  const ethanolSessions = sessions.filter(session => getProductType(session) === 'ethanol')
  const totalFeintsVolume = ethanolSessions.reduce((sum, session) => sum + (session.chargeVolumeL || 0), 0)
  const totalVolumeProcessed = sessions.reduce((sum, session) => sum + (session.chargeVolumeL || 0), 0)
  
  return totalVolumeProcessed > 0 ? (totalFeintsVolume / totalVolumeProcessed) * 100 : 0
}

// Export the master summary
export const fy2025MasterSummary = generateMasterFY2025Summary()

// Export helper functions for formatting
export const formatNumber = (num: number, decimals: number = 1): string => {
  return num.toFixed(decimals)
}

export const formatPercentage = (num: number, decimals: number = 1): string => {
  return `${num.toFixed(decimals)}%`
}

export const formatVolume = (num: number, decimals: number = 1): string => {
  return `${num.toFixed(decimals)}L`
}

export const formatCurrency = (num: number, decimals: number = 2): string => {
  return `$${num.toFixed(decimals)}`
}

export default fy2025MasterSummary
