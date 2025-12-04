import { fy2025DistillationLog, getStillPerformanceComparison } from './fy2025-distillation-log.data'
import { type Batch } from '@/types/schema'

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
  const stillComparison = getStillPerformanceComparison()

  // Calculate product summaries with enhanced metrics
  const ginSummary = calculateProductSummary(log.runsByProduct.gin, 'gin')
  const vodkaSummary = calculateProductSummary(log.runsByProduct.vodka, 'vodka')
  const ethanolSummary = calculateProductSummary(log.runsByProduct.ethanol, 'ethanol')

  // Calculate still summaries with enhanced metrics
  const carrieSummary = calculateStillSummary(log.runsByStill.carrie, 'carrie')
  const robertaSummary = calculateStillSummary(log.runsByStill.roberta, 'roberta')

  // Generate monthly breakdown with enhanced data
  const monthlyBreakdown = generateEnhancedMonthlyBreakdown(log.monthlyBreakdown)

  // Get top performing runs
  const allRuns = [...log.runsByProduct.gin, ...log.runsByProduct.vodka, ...log.runsByProduct.ethanol]
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
function calculateProductSummary(sessions: any[], productType: string): ProductSummary {
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

function calculateStillSummary(sessions: any[], stillName: string): StillSummary {
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

function calculateLALRecovered(session: any): number {
  const outputs = session.outputs || []
  return outputs.reduce((sum: number, output: any) => sum + (output.lal || 0), 0)
}

function calculateTotalVolume(session: any): number {
  const outputs = session.outputs || []
  return outputs.reduce((sum: number, output: any) => sum + (output.volumeL || output.volume_L || 0), 0)
}

function calculateAverageABV(sessions: any[]): number {
  if (sessions.length === 0) return 0
  const totalABV = sessions.reduce((sum, session) => {
    const outputs = session.outputs || []
    const sessionABV = outputs.reduce((outputSum: number, output: any) => 
      outputSum + (output.abv || output.abv_percent || 0), 0)
    return sum + sessionABV
  }, 0)
  return totalABV / sessions.length
}

function calculateAverageRunTime(sessions: any[]): number {
  // This would need actual run time data - placeholder for now
  return sessions.length * 8 // Assume 8 hours average per run
}

function getProductType(session: any): string {
  if (session.sku.toLowerCase().includes('gin')) return 'gin'
  if (session.sku.toLowerCase().includes('vodka')) return 'vodka'
  if (session.sku.toLowerCase().includes('ethanol')) return 'ethanol'
  return 'other'
}

function generateEnhancedMonthlyBreakdown(monthlyData: any): { [month: string]: MonthlySummary } {
  const enhanced: { [month: string]: MonthlySummary } = {}
  
  Object.entries(monthlyData).forEach(([month, data]: [string, any]) => {
    enhanced[month] = {
      runs: data.runs.length,
      lalCharged: data.lalCharged,
      lalRecovered: data.lalRecovered,
      efficiency: data.efficiency,
      volumeProcessed: data.runs.reduce((sum: number, run: any) => sum + calculateTotalVolume(run), 0),
      products: Array.from(new Set<string>(data.runs.map((run: any) => getProductType(run))))
    }
  })
  
  return enhanced
}

function calculateEfficiencyTrends(monthlyData: any): EfficiencyTrend[] {
  return Object.entries(monthlyData).map(([month, data]: [string, any]) => ({
    month,
    efficiency: data.efficiency,
    volume: data.runs.reduce((sum: number, run: any) => sum + calculateTotalVolume(run), 0),
    runs: data.runs.length
  }))
}

function calculateCostAnalysis(sessions: any[]): CostAnalysis {
  const totalCost = sessions.reduce((sum, session) => sum + (session.costs?.totalCost || 0), 0)
  const totalLAL = sessions.reduce((sum, session) => sum + calculateLALRecovered(session), 0)
  const totalVolume = sessions.reduce((sum, session) => sum + calculateTotalVolume(session), 0)
  
  return {
    totalCost,
    costPerLAL: totalLAL > 0 ? totalCost / totalLAL : 0,
    costPerLiter: totalVolume > 0 ? totalCost / totalVolume : 0,
    electricityCost: sessions.reduce((sum, session) => sum + (session.costs?.utilityCost || 0), 0),
    waterCost: sessions.reduce((sum, session) => sum + (session.costs?.waterCost || 0), 0),
    ethanolCost: sessions.reduce((sum, session) => sum + (session.costs?.ethanolCost || 0), 0),
    botanicalCost: sessions.reduce((sum, session) => sum + (session.costs?.botanicalCost || 0), 0)
  }
}

function calculateQualityMetrics(sessions: any[]): QualityMetrics {
  const totalABV = sessions.reduce((sum, session) => {
    const outputs = session.outputs || []
    return sum + outputs.reduce((outputSum: number, output: any) => 
      outputSum + (output.abv || output.abv_percent || 0), 0)
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

function calculateConsistencyScore(sessions: any[]): number {
  // Calculate variance in efficiency across sessions
  const efficiencies = sessions.map(session => session.efficiency || 0)
  const average = efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length
  const variance = efficiencies.reduce((sum, eff) => sum + Math.pow(eff - average, 2), 0) / efficiencies.length
  const standardDeviation = Math.sqrt(variance)
  
  // Convert to consistency score (0-100, higher is better)
  return Math.max(0, 100 - (standardDeviation / average) * 100)
}

function calculateFeintsRecovery(sessions: any[]): number {
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
