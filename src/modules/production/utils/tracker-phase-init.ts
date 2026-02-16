import { DistillationSession } from '../types/distillation-session.types'

export function extractChargeData(session: DistillationSession) {
  const ethanolComponent = session.charge?.components?.find(c => c.type === 'ethanol')
  const waterComponent = session.charge?.components?.find(c => c.type === 'dilution' || c.type === 'water')
  const otherComponents = session.charge?.components?.filter(c => c.type === 'other') || []
  
  return {
    ethanolAdded_L: ethanolComponent?.volume_L || session.chargeVolumeL || 0,
    ethanolABV_percent: ethanolComponent?.abv_percent || session.chargeABV || 0,
    waterAdded_L: waterComponent?.volume_L || 0,
    totalChargeVolume_L: session.charge?.total?.volume_L || session.chargeVolumeL || 0,
    totalChargeABV_percent: session.charge?.total?.abv_percent || session.chargeABV || 0,
    others: otherComponents.map(c => ({
      name: c.source,
      volume_L: c.volume_L,
      abv_percent: c.abv_percent,
      type: c.type
    }))
  }
}

export function buildInitialPhases(session: DistillationSession) {
  const chargeData = extractChargeData(session)
  const outputs = session.outputs as any

  return [
    {
      phase: 'Preparation',
      data: {
        ethanolAdded_L: chargeData.ethanolAdded_L,
        ethanolABV_percent: chargeData.ethanolABV_percent,
        waterAdded_L: chargeData.waterAdded_L,
        others: chargeData.others,
        totalChargeVolume_L: chargeData.totalChargeVolume_L,
        totalChargeABV_percent: chargeData.totalChargeABV_percent,
        stillUsed: session.still,
        notes: ''
      },
      isCompleted: false
    },
    {
      phase: 'Botanical Steeping',
      data: {
        recipeShown: true,
        botanicals: session.botanicals?.map(bot => ({
          name: bot.name,
          weight_g: bot.weightG,
          notes: bot.notes || ''
        })) || [],
        steepingTime_hours: session.steepingHours || 0,
        steepingTemp_C: null,
        notes: ''
      },
      isCompleted: false
    },
    {
      phase: 'Heating',
      data: {
        elementsOn: 2,
        amperage_A: session.powerA || 35,
        power_kW: session.elementsKW || 32,
        notes: ''
      },
      isCompleted: false
    },
    {
      phase: 'Foreshots',
      data: {
        volume_L: outputs?.find((o: any) => o.name === 'Foreshots')?.volumeL || 0,
        abv_percent: outputs?.find((o: any) => o.name === 'Foreshots')?.abv || 0,
        density: 0.814,
        receivingVessel: outputs?.find((o: any) => o.name === 'Foreshots')?.vessel || '',
        destination: 'Discarded',
        notes: outputs?.find((o: any) => o.name === 'Foreshots')?.observations || ''
      },
      isCompleted: false
    },
    {
      phase: 'Heads',
      data: {
        volume_L: outputs?.find((o: any) => o.name === 'Heads')?.volumeL || 0,
        abv_percent: outputs?.find((o: any) => o.name === 'Heads')?.abv || 0,
        density: 0.818,
        receivingVessel: outputs?.find((o: any) => o.name === 'Heads')?.vessel || '',
        destination: 'Feints',
        notes: outputs?.find((o: any) => o.name === 'Heads')?.observations || ''
      },
      isCompleted: false
    },
    {
      phase: 'Hearts',
      data: {
        volume_L: outputs?.find((o: any) => o.name === 'Hearts')?.volumeL || 0,
        abv_percent: outputs?.find((o: any) => o.name === 'Hearts')?.abv || 0,
        density: 0.820,
        receivingVessel: outputs?.find((o: any) => o.name === 'Hearts')?.vessel || '',
        destination: 'VC Tank',
        notes: outputs?.find((o: any) => o.name === 'Hearts')?.observations || ''
      },
      heartsParts: [],
      heartsTotals: {
        volumeL: 0,
        avgAbvPercent: 0,
        lal: 0,
        count: 0
      },
      isCompleted: false
    },
    {
      phase: 'Tails',
      data: {
        volume_L: outputs?.find((o: any) => o.name === 'Tails')?.volumeL || 0,
        abv_percent: outputs?.find((o: any) => o.name === 'Tails')?.abv || 0,
        density: 0.814,
        receivingVessel: outputs?.find((o: any) => o.name === 'Tails')?.vessel || '',
        destination: 'Feints',
        notes: outputs?.find((o: any) => o.name === 'Tails')?.observations || ''
      },
      isCompleted: false
    }
  ]
}

export const VESSEL_OPTIONS = [
  '20L Waste',
  'VC-315',
  'IBC-01',
  'Jug 1',
  'Jug 2',
  'FEINTS-GIN-001',
  'FEINTS-GIN-002',
  'GIN-NS-0016',
  'GIN-NS-0017',
  'GIN-NS-0018'
]

export const STILL_OPTIONS = [
  'Roberta',
  'Carrie',
  'Still 3',
  'Still 4'
]

export function calculateLAL(volume: number, abv: number) {
  return volume * (abv / 100)
}
