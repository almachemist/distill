import { fy2025DistillationLog, getStillPerformanceComparison } from './fy2025-distillation-log.data'

// Master FY2025 Distillation Summary
export interface FY2025DistillationSummary {
  overview: {
    totalRuns: number
    totalLALCharged: number
    totalLALRecovered: number
    overallEfficiency: number
    totalVolumeIn: number
    totalVolumeOut: number
    averageEfficiency: number
  }
  byProduct: {
    gin: {
      runs: number
      lalCharged: number
      lalRecovered: number
      efficiency: number
      averageEfficiency: number
    }
    vodka: {
      runs: number
      lalCharged: number
      lalRecovered: number
      efficiency: number
      averageEfficiency: number
    }
    ethanol: {
      runs: number
      lalCharged: number
      lalRecovered: number
      efficiency: number
      averageEfficiency: number
    }
  }
  byStill: {
    carrie: {
      runs: number
      lalCharged: number
      lalRecovered: number
      efficiency: number
      averageEfficiency: number
    }
    roberta: {
      runs: number
      lalCharged: number
      lalRecovered: number
      efficiency: number
      averageEfficiency: number
    }
  }
  monthlyBreakdown: {
    [month: string]: {
      runs: number
      lalCharged: number
      lalRecovered: number
      efficiency: number
    }
  }
  topPerformingRuns: {
    id: string
    sku: string
    efficiency: number
    lalRecovered: number
  }[]
}

// Generate comprehensive FY2025 distillation summary
export const generateFY2025DistillationSummary = (): FY2025DistillationSummary => {
  const log = fy2025DistillationLog
  const stillComparison = getStillPerformanceComparison()

  // Calculate product summaries
  const ginSummary = {
    runs: log.runsByProduct.gin.length,
    lalCharged: log.runsByProduct.gin.reduce((sum, run) => sum + (run.chargeLAL || 0), 0),
    lalRecovered: log.runsByProduct.gin.reduce((sum, run) => {
      const outputs = run.outputs || []
      return sum + outputs.reduce((outputSum, output) => outputSum + (output.lal || 0), 0)
    }, 0),
    efficiency: 0,
    averageEfficiency: 0
  }
  ginSummary.efficiency = ginSummary.lalCharged > 0 ? (ginSummary.lalRecovered / ginSummary.lalCharged) * 100 : 0
  ginSummary.averageEfficiency = ginSummary.runs > 0 
    ? log.runsByProduct.gin.reduce((sum, run) => sum + (run.efficiency || 0), 0) / ginSummary.runs
    : 0

  const vodkaSummary = {
    runs: log.runsByProduct.vodka.length,
    lalCharged: log.runsByProduct.vodka.reduce((sum, run) => sum + (run.chargeLAL || 0), 0),
    lalRecovered: log.runsByProduct.vodka.reduce((sum, run) => {
      const outputs = run.outputs || []
      return sum + outputs.reduce((outputSum, output) => outputSum + (output.lal || 0), 0)
    }, 0),
    efficiency: 0,
    averageEfficiency: 0
  }
  vodkaSummary.efficiency = vodkaSummary.lalCharged > 0 ? (vodkaSummary.lalRecovered / vodkaSummary.lalCharged) * 100 : 0
  vodkaSummary.averageEfficiency = vodkaSummary.runs > 0 
    ? log.runsByProduct.vodka.reduce((sum, run) => sum + (run.efficiency || 0), 0) / vodkaSummary.runs
    : 0

  const ethanolSummary = {
    runs: log.runsByProduct.ethanol.length,
    lalCharged: log.runsByProduct.ethanol.reduce((sum, run) => sum + (run.chargeLAL || 0), 0),
    lalRecovered: log.runsByProduct.ethanol.reduce((sum, run) => {
      const outputs = run.outputs || []
      return sum + outputs.reduce((outputSum, output) => outputSum + (output.lal || 0), 0)
    }, 0),
    efficiency: 0,
    averageEfficiency: 0
  }
  ethanolSummary.efficiency = ethanolSummary.lalCharged > 0 ? (ethanolSummary.lalRecovered / ethanolSummary.lalCharged) * 100 : 0
  ethanolSummary.averageEfficiency = ethanolSummary.runs > 0 
    ? log.runsByProduct.ethanol.reduce((sum, run) => sum + (run.efficiency || 0), 0) / ethanolSummary.runs
    : 0

  // Calculate still summaries
  const carrieSummary = {
    runs: stillComparison.carrie.totalRuns,
    lalCharged: stillComparison.carrie.totalLALCharged,
    lalRecovered: stillComparison.carrie.totalLALRecovered,
    efficiency: stillComparison.carrie.totalLALCharged > 0 
      ? (stillComparison.carrie.totalLALRecovered / stillComparison.carrie.totalLALCharged) * 100 
      : 0,
    averageEfficiency: stillComparison.carrie.averageEfficiency
  }

  const robertaSummary = {
    runs: stillComparison.roberta.totalRuns,
    lalCharged: stillComparison.roberta.totalLALCharged,
    lalRecovered: stillComparison.roberta.totalLALRecovered,
    efficiency: stillComparison.roberta.totalLALCharged > 0 
      ? (stillComparison.roberta.totalLALRecovered / stillComparison.roberta.totalLALCharged) * 100 
      : 0,
    averageEfficiency: stillComparison.roberta.averageEfficiency
  }

  // Generate monthly breakdown
  const monthlyBreakdown: { [month: string]: any } = {}
  Object.entries(log.monthlyBreakdown).forEach(([month, data]) => {
    monthlyBreakdown[month] = {
      runs: data.runs.length,
      lalCharged: data.lalCharged,
      lalRecovered: data.lalRecovered,
      efficiency: data.efficiency
    }
  })

  // Get top performing runs
  const allRuns = log.runsByProduct.gin.concat(log.runsByProduct.vodka).concat(log.runsByProduct.ethanol)
  const topPerformingRuns = allRuns
    .map(run => ({
      id: run.id,
      sku: run.sku,
      efficiency: run.efficiency || 0,
      lalRecovered: (run.outputs || []).reduce((sum, output) => sum + (output.lal || 0), 0)
    }))
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 5)

  return {
    overview: log.summary,
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
    topPerformingRuns
  }
}

// Export the summary
export const fy2025DistillationSummary = generateFY2025DistillationSummary()

// Helper function to format numbers for display
export const formatNumber = (num: number, decimals: number = 1): string => {
  return num.toFixed(decimals)
}

// Helper function to format percentage
export const formatPercentage = (num: number, decimals: number = 1): string => {
  return `${num.toFixed(decimals)}%`
}

// Helper function to format volume
export const formatVolume = (num: number, decimals: number = 1): string => {
  return `${num.toFixed(decimals)}L`
}

// Export default summary
export default fy2025DistillationSummary

