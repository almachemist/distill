import { DistillationSession, OutputDetail, OutputPhase } from '../types/distillation-session.types'
import { merchantMaeGin001Distillation } from '../sessions/merchant-mae-gin-001-distillation.session'
import { merchantMaeGinDistillation } from '../sessions/merchant-mae-gin-distillation.session'
import { merchantMaeGin003Distillation } from '../sessions/merchant-mae-gin-003-distillation.session'
import { vodka003Distillation } from '../sessions/vodka-003-distillation.session'
import { rainforestGinRF30 } from '../sessions/rainforest-gin-rf30-distillation.session'
import { rainforestGinRF29Distillation } from '../sessions/rainforest-gin-rf29-distillation.session'
import { spiritLiq001Distillation } from '../sessions/spirit-liq001-distillation.session'
import { spiritLiq002Distillation } from '../sessions/spirit-liq002-distillation.session'
import { spiritGinNS018Distillation } from '../sessions/spirit-gin-ns018-distillation.session'
import { spiritGinDry2024Distillation } from '../sessions/spirit-gin-dry2024-distillation.session'

// FY2024-2025 Master Distillation Log
export interface FY2025DistillationLog {
  financialYear: '2024-2025'
  totalRuns: number
  runsByProduct: {
    gin: DistillationSession[]
    vodka: DistillationSession[]
    ethanol: DistillationSession[]
    other: DistillationSession[]
  }
  runsByStill: {
    carrie: DistillationSession[]
    roberta: DistillationSession[]
  }
  summary: {
    totalLALCharged: number
    totalLALRecovered: number
    overallEfficiency: number
    totalVolumeIn: number
    totalVolumeOut: number
    averageEfficiency: number
  }
  monthlyBreakdown: {
    [month: string]: {
      runs: DistillationSession[]
      lalCharged: number
      lalRecovered: number
      efficiency: number
    }
  }
}

// All FY2024-2025 distillation sessions
const allFY2025Sessions: DistillationSession[] = [
  spiritGinDry2024Distillation, // 2024 session
  merchantMaeGin001Distillation, // MM-001
  merchantMaeGinDistillation, // MM-002
  merchantMaeGin003Distillation, // MM-003
  vodka003Distillation,
  rainforestGinRF30,
  rainforestGinRF29Distillation,
  spiritLiq001Distillation,
  spiritLiq002Distillation,
  spiritGinNS018Distillation
]

// Helper function to get month from date
const getMonthFromDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

// Helper function to categorize by product type
const categorizeByProduct = (sessions: DistillationSession[]) => {
  return {
    gin: sessions.filter(session => 
      session.sku.toLowerCase().includes('gin') || 
      session.id.includes('GIN')
    ),
    vodka: sessions.filter(session => 
      session.sku.toLowerCase().includes('vodka') || 
      session.id.includes('VODKA')
    ),
    ethanol: sessions.filter(session => 
      session.sku.toLowerCase().includes('ethanol') || 
      session.sku.toLowerCase().includes('liquor') ||
      session.id.includes('LIQ')
    ),
    other: sessions.filter(session => 
      !session.sku.toLowerCase().includes('gin') && 
      !session.sku.toLowerCase().includes('vodka') &&
      !session.sku.toLowerCase().includes('ethanol') &&
      !session.sku.toLowerCase().includes('liquor') &&
      !session.id.includes('GIN') &&
      !session.id.includes('VODKA') &&
      !session.id.includes('LIQ')
    )
  }
}

// Helper function to categorize by still
const categorizeByStill = (sessions: DistillationSession[]) => {
  return {
    carrie: sessions.filter(session => session.still.toLowerCase() === 'carrie'),
    roberta: sessions.filter(session => session.still.toLowerCase() === 'roberta')
  }
}

// Calculate summary statistics
const calculateSummary = (sessions: DistillationSession[]) => {
  const totalLALCharged = sessions.reduce((sum, session) => sum + (session.chargeLAL || 0), 0)
  const totalLALRecovered = sessions.reduce((sum, session) => {
    const outputs = session.outputs || []
    return sum + outputs.reduce((outputSum, output) => outputSum + (output.lal || 0), 0)
  }, 0)
  
  const totalVolumeIn = sessions.reduce((sum, session) => sum + (session.chargeVolumeL || 0), 0)
  const totalVolumeOut = sessions.reduce((sum, session) => {
    const outputs = session.outputs || []
    if (outputs.length === 0) return sum
    const isPhase = typeof outputs[0] === 'object' && outputs[0] !== null && 'name' in (outputs[0] as object)
    if (isPhase) {
      const out = outputs as OutputPhase[]
      return sum + out.reduce((acc, o) => acc + (o.volumeL || 0), 0)
    } else {
      const out = outputs as OutputDetail[]
      return sum + out.reduce((acc, o) => acc + (o.volume_L || 0), 0)
    }
  }, 0)
  
  const overallEfficiency = totalLALCharged > 0 ? (totalLALRecovered / totalLALCharged) * 100 : 0
  const averageEfficiency = sessions.length > 0 
    ? sessions.reduce((sum, session) => sum + (session.efficiency || 0), 0) / sessions.length
    : 0
  
  return {
    totalLALCharged,
    totalLALRecovered,
    overallEfficiency,
    totalVolumeIn,
    totalVolumeOut,
    averageEfficiency
  }
}

// Generate monthly breakdown
const generateMonthlyBreakdown = (sessions: DistillationSession[]) => {
  const monthlyData: { [month: string]: DistillationSession[] } = {}
  
  sessions.forEach(session => {
    const month = getMonthFromDate(session.date)
    if (!monthlyData[month]) {
      monthlyData[month] = []
    }
    monthlyData[month].push(session)
  })
  
  const monthlyBreakdown: { [month: string]: { runs: DistillationSession[]; lalCharged: number; lalRecovered: number; efficiency: number } } = {}
  
  Object.entries(monthlyData).forEach(([month, runs]) => {
    const monthSummary = calculateSummary(runs)
    monthlyBreakdown[month] = {
      runs,
      lalCharged: monthSummary.totalLALCharged,
      lalRecovered: monthSummary.totalLALRecovered,
      efficiency: monthSummary.overallEfficiency
    }
  })
  
  return monthlyBreakdown
}

// Generate the complete FY2025 distillation log
export const fy2025DistillationLog: FY2025DistillationLog = {
  financialYear: '2024-2025',
  totalRuns: allFY2025Sessions.length,
  runsByProduct: categorizeByProduct(allFY2025Sessions),
  runsByStill: categorizeByStill(allFY2025Sessions),
  summary: calculateSummary(allFY2025Sessions),
  monthlyBreakdown: generateMonthlyBreakdown(allFY2025Sessions)
}

// Export helper functions for filtering and analysis
export const getRunsByDateRange = (startDate: string, endDate: string): DistillationSession[] => {
  return allFY2025Sessions.filter(session => 
    session.date >= startDate && session.date <= endDate
  )
}

export const getRunsByEfficiencyRange = (minEfficiency: number, maxEfficiency: number): DistillationSession[] => {
  return allFY2025Sessions.filter(session => 
    (session.efficiency || 0) >= minEfficiency && (session.efficiency || 0) <= maxEfficiency
  )
}

export const getTopPerformingRuns = (limit: number = 5): DistillationSession[] => {
  return [...allFY2025Sessions]
    .sort((a, b) => (b.efficiency || 0) - (a.efficiency || 0))
    .slice(0, limit)
}

export const getStillPerformanceComparison = () => {
  const carrieRuns = fy2025DistillationLog.runsByStill.carrie
  const robertaRuns = fy2025DistillationLog.runsByStill.roberta
  
  return {
    carrie: {
      totalRuns: carrieRuns.length,
      averageEfficiency: carrieRuns.length > 0 
        ? carrieRuns.reduce((sum, run) => sum + (run.efficiency || 0), 0) / carrieRuns.length
        : 0,
      totalLALCharged: carrieRuns.reduce((sum, run) => sum + (run.chargeLAL || 0), 0),
      totalLALRecovered: carrieRuns.reduce((sum, run) => {
        const outputs = run.outputs || []
        return sum + outputs.reduce((outputSum, output) => outputSum + (output.lal || 0), 0)
      }, 0)
    },
    roberta: {
      totalRuns: robertaRuns.length,
      averageEfficiency: robertaRuns.length > 0 
        ? robertaRuns.reduce((sum, run) => sum + (run.efficiency || 0), 0) / robertaRuns.length
        : 0,
      totalLALCharged: robertaRuns.reduce((sum, run) => sum + (run.chargeLAL || 0), 0),
      totalLALRecovered: robertaRuns.reduce((sum, run) => {
        const outputs = run.outputs || []
        return sum + outputs.reduce((outputSum, output) => outputSum + (output.lal || 0), 0)
      }, 0)
    }
  }
}

// Export the complete log
export default fy2025DistillationLog
