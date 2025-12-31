import { DistillationSession, OutputDetail, OutputPhase } from '../types/distillation-session.types'
import { merchantMaeGin001Distillation } from '../sessions/merchant-mae-gin-001-distillation.session'
import { merchantMaeGinDistillation } from '../sessions/merchant-mae-gin-distillation.session'
import { merchantMaeGin003Distillation } from '../sessions/merchant-mae-gin-003-distillation.session'
import { vodka003Distillation } from '../sessions/vodka-003-distillation.session'
import { vodka002Distillation } from '../sessions/vodka-002-distillation.session'
import { rainforestGinRF30 } from '../sessions/rainforest-gin-rf30-distillation.session'
import { rainforestGinRF29Distillation } from '../sessions/rainforest-gin-rf29-distillation.session'
import { rainforestGinRF28 } from '../sessions/spirit-gin-rf28-distillation.session'
import { spiritLiq001Distillation } from '../sessions/spirit-liq001-distillation.session'
import { spiritLiq002Distillation } from '../sessions/spirit-liq002-distillation.session'
import { spiritLiq003Distillation } from '../sessions/spirit-liq003-distillation.session'
import { spiritGinNS018Distillation } from '../sessions/spirit-gin-ns018-distillation.session'
import { spiritGinDry2024Distillation } from '../sessions/spirit-gin-dry2024-distillation.session'
import { spiritGinOaks005WsDistillation } from '../sessions/spirit-gin-oaks005-ws-distillation.session'
import { spiritGinSD0019Distillation } from '../sessions/spirit-gin-sd0019-distillation.session'
import { vodka001Distillation } from '../sessions/vodka-001-distillation.session'

// All distillation sessions for FY2024-2025
export const distillationSessions: DistillationSession[] = [
  // May 2024
  spiritGinOaks005WsDistillation, // SPIRIT-GIN-OAKS-005-WS
  
  // September 2024
  spiritLiq001Distillation, // SPIRIT-LIQ-001
  
  // October 2024
  vodka001Distillation, // VODKA-001
  rainforestGinRF28, // SPIRIT-GIN-RF-28
  spiritGinSD0019Distillation, // SPIRIT-GIN-SD-0019
  
  // December 2024
  spiritGinDry2024Distillation, // SPIRIT-GIN-DRY-2024
  merchantMaeGin001Distillation, // SPIRIT-GIN-MM-001
  
  // January 2025
  rainforestGinRF29Distillation, // SPIRIT-GIN-RF-29
  
  // February 2025
  spiritLiq002Distillation, // SPIRIT-LIQ-002
  vodka002Distillation, // VODKA-002
  
  // March 2025
  spiritGinNS018Distillation, // SPIRIT-GIN-NS-018
  merchantMaeGinDistillation, // SPIRIT-GIN-MM-002
  
  // October 2025
  vodka003Distillation, // VODKA-003
  spiritLiq003Distillation, // SPIRIT-LIQ-003
  merchantMaeGin003Distillation, // SPIRIT-GIN-MM-003
  
  // July 2025
  rainforestGinRF30 // SPIRIT-GIN-RF-30
]

// Helper functions
export const getSessionById = (id: string): DistillationSession | undefined => {
  return distillationSessions.find(session => session.id === id)
}

export const getSessionsByDate = (startDate: string, endDate: string): DistillationSession[] => {
  return distillationSessions.filter(session => 
    session.date >= startDate && session.date <= endDate
  )
}

export const getSessionsByStill = (still: string): DistillationSession[] => {
  return distillationSessions.filter(session => session.still === still)
}

export const getSessionsBySku = (sku: string): DistillationSession[] => {
  return distillationSessions.filter(session => session.sku === sku)
}

// Summary statistics
export const getSessionSummary = () => {
  const totalSessions = distillationSessions.length
  const totalVolumeIn = distillationSessions.reduce((sum, session) => sum + (session.chargeVolumeL ?? 0), 0)
  const totalVolumeOut = distillationSessions.reduce((sum, session) => {
    const outputs = session.outputs || []
    if (outputs.length === 0) return sum
    const isPhase = typeof outputs[0] === 'object' && outputs[0] !== null && 'name' in (outputs[0] as object)
    if (isPhase) {
      const out = outputs as OutputPhase[]
      return sum + out.reduce((acc, o) => acc + (o.volumeL ?? 0), 0)
    } else {
      const out = outputs as OutputDetail[]
      return sum + out.reduce((acc, o) => acc + (o.volume_L ?? 0), 0)
    }
  }, 0)
  
  const totalLALIn = distillationSessions.reduce((sum, session) => sum + (session.chargeLAL || 0), 0)
  const totalLALOut = distillationSessions.reduce((sum, session) => sum + (session.lalOut || 0), 0)
  
  const averageEfficiency = distillationSessions.length > 0 
    ? distillationSessions.reduce((sum, session) => sum + (session.efficiency || 0), 0) / distillationSessions.length
    : 0
  
  return {
    totalSessions,
    totalVolumeIn,
    totalVolumeOut,
    totalLALIn,
    totalLALOut,
    averageEfficiency,
    overallEfficiency: totalLALIn > 0 ? (totalLALOut / totalLALIn) * 100 : 0
  }
}
