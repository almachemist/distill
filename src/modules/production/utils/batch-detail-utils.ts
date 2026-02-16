import { DistillationSession } from '../types/distillation-session.types'

export type BatchStatus = 'draft' | 'live' | 'completed' | 'archived'

export const PHASES = [
  { id: 'preparation', name: 'Preparation', icon: '⚙️' },
  { id: 'steeping', name: 'Botanical Steeping', icon: '🌿' },
  { id: 'heating', name: 'Heating', icon: '🔥' },
  { id: 'foreshots', name: 'Foreshots', icon: '💧' },
  { id: 'heads', name: 'Heads', icon: '💨' },
  { id: 'hearts', name: 'Hearts', icon: '❤️' },
  { id: 'tails', name: 'Tails', icon: '🌊' },
]

export function determineBatchStatus(session: DistillationSession): BatchStatus {
  const hasOutputData = session.outputs && session.outputs.length > 0
  const hasPhaseData = session.phases && Object.values(session.phases).some(phase => 
    Array.isArray(phase) ? phase.length > 0 : phase && Object.keys(phase).length > 0
  )
  
  if (hasOutputData && session.finalOutput) return 'completed'
  if (hasPhaseData || (session.runData?.length ?? 0) > 0) return 'live'
  return 'draft'
}

export function isPhaseCompleted(session: DistillationSession, phaseId: string): boolean {
  switch (phaseId) {
    case 'preparation':
      return !!session.charge && session.charge.components.length > 0
    case 'steeping':
      return !!session.steepingHours && session.botanicals.length > 0
    case 'heating':
      return !!session.boilerOn
    case 'foreshots':
      return (session.runData?.some(r => r.phase.toLowerCase().includes('foreshot')) ?? false) || 
             !!(session.phases?.foreshots && session.phases.foreshots.length > 0)
    case 'heads':
      return (session.runData?.some(r => r.phase.toLowerCase().includes('head')) ?? false) ||
             !!(session.phases?.heads && session.phases.heads.length > 0)
    case 'hearts':
      return (session.runData?.some(r => r.phase.toLowerCase().includes('heart')) ?? false) ||
             !!(session.phases?.hearts && session.phases.hearts.length > 0)
    case 'tails':
      return (session.runData?.some(r => r.phase.toLowerCase().includes('tail')) ?? false) ||
             !!(session.phases?.tails && session.phases.tails.length > 0)
    default:
      return false
  }
}

export function getCurrentPhase(session: DistillationSession): string {
  for (const phase of PHASES) {
    if (!isPhaseCompleted(session, phase.id)) {
      return phase.id
    }
  }
  return PHASES[PHASES.length - 1].id
}

export function getPhaseDetails(session: DistillationSession, phaseId: string) {
  switch (phaseId) {
    case 'preparation':
      return {
        title: 'Preparation Phase',
        data: session.charge ? {
          components: session.charge.components,
          total: session.charge.total,
          still: session.still,
          notes: session.notes,
        } : null,
      }
    case 'steeping':
      return {
        title: 'Botanical Steeping',
        data: session.botanicals.length > 0 ? {
          botanicals: session.botanicals,
          totalWeight: session.totalBotanicals_g,
          perLAL: session.botanicalsPerLAL,
          hours: session.steepingHours,
          setup: session.stillSetup?.steeping,
        } : null,
      }
    case 'heating':
      return {
        title: 'Heating & Boiler Setup',
        data: {
          boilerOn: session.boilerOn,
          power: session.powerA,
          elements: session.stillSetup?.elements,
          plates: session.stillSetup?.plates,
          options: session.stillSetup?.options,
        },
      }
    case 'foreshots':
    case 'heads':
    case 'hearts':
    case 'tails':
      const phaseName = phaseId.charAt(0).toUpperCase() + phaseId.slice(1)
      const runData = session.runData?.filter(r => 
        r.phase.toLowerCase().includes(phaseId.slice(0, -1))
      ) || []
      const output = session.outputs?.find(o => 
        ('name' in o && o.name.toLowerCase().includes(phaseId.slice(0, -1))) ||
        ('phase' in o && o.phase?.toLowerCase().includes(phaseId.slice(0, -1)))
      )
      return {
        title: `${phaseName} Collection`,
        data: {
          runData,
          output,
          phaseData: session.phases?.[phaseId as keyof typeof session.phases],
        },
      }
    default:
      return { title: '', data: null }
  }
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })
}
