import type { DistillationSession } from '../types/distillation-session.types'
import { DistillationSessionCalculator } from '../services/distillation-session-calculator.service'

const baseRainforestGinRF28 = {
  id: 'SPIRIT-GIN-RF-28',
  sku: 'Rainforest Gin',
  description: 'Rainforest Gin 028 distilled on Carrie still with 18-hour steep of juniper and coriander.',
  date: '2024-10-09',
  still: 'Carrie',
  boilerOn: '07:30',
  chargeVolumeL: 1000,
  chargeABV: 51.0,
  chargeLAL: 510.0,
  powerA: 33,
  elementsKW: 32,
  steepingHours: 18,

  charge: {
    components: [
      { source: 'Ethanol Manildra NC96', volume_L: 0, abv_percent: 47.0, lal: null, type: 'ethanol' },
      { source: 'Filtered Water', volume_L: 0, abv_percent: 53.0, lal: null, type: 'dilution' },
      { source: 'Saltwater', volume_L: 0, abv_percent: 0.0, lal: 0.0, type: 'other' }
    ],
    total: { volume_L: 1000, abv_percent: 51.0, lal: 510.0 }
  },

  stillSetup: {
    elements: null,
    steeping: '18 hours (Juniper, Coriander)',
    plates: null,
    options: null
  },

  botanicals: [
    { name: 'Juniper', weightG: 6360, notes: '', ratio_percent: 68.1 },
    { name: 'Coriander', weightG: 1410, notes: '', ratio_percent: 15.1 },
    { name: 'Angelica', weightG: 175, notes: '', ratio_percent: 1.9 },
    { name: 'Cassia', weightG: 25, notes: '', ratio_percent: 0.3 },
    { name: 'Lemon Myrtle', weightG: 141, notes: '', ratio_percent: 1.5 },
    { name: 'Lemon Aspen', weightG: 71, notes: 'TAILS', ratio_percent: 0.8 },
    { name: 'Grapefruit', weightG: 567, notes: '', ratio_percent: 6.1 },
    { name: 'Macadamia', weightG: 102, notes: '', ratio_percent: 1.1 },
    { name: 'Liquorice', weightG: 51, notes: '', ratio_percent: 0.5 },
    { name: 'Cardamom', weightG: 141, notes: '', ratio_percent: 1.5 },
    { name: 'Pepperberry', weightG: 102, notes: '', ratio_percent: 1.1 },
    { name: 'Vanilla', weightG: 25, notes: '', ratio_percent: 0.3 },
    { name: 'Mango', weightG: 176, notes: '', ratio_percent: 1.9 }
  ],
  totalBotanicals_g: 9360,
  totalBotanicals_percent: 100.0,
  botanicalsPerLAL: 18.3,

  runData: [
    { time: '09:15', phase: 'Foreshots', volume_L: 2.0, abv_percent: 86.0, lal: null, observations: '45A to warm up' },
    { time: '09:40', phase: 'Heads', volume_L: 13.0, abv_percent: 83.5, lal: null, observations: '33A' },
    { time: '18:45', phase: 'Middle Run (Hearts)', volume_L: 346.0, abv_percent: 82.3, lal: 21.0, observations: 'amps 33A' },
    { phase: 'Tails', volume_L: 169.7, abv_percent: 75.5, lal: null, observations: 'To be used for something else' }
  ],

  totalRun: {
    volume_L: 530.7,
    abv_percent: null,
    lal: 21.0,
    notes: 'Total run LAL recorded as 21.0.'
  },

  outputs: [
    { name: 'Foreshots', volumeL: 2.0, abv: 86.0, lal: 0.0, vessel: 'Discarded Bucket', observations: 'Discarded' },
    { name: 'Heads', volumeL: 13.0, abv: 83.5, lal: 0.0, vessel: 'FEINTS-GIN-01 IBC-02', observations: 'Feints' },
    { name: 'Hearts', volumeL: 346.0, abv: 82.3, lal: 21.0, vessel: 'GIN-RF-0028 VC-400', observations: 'Rainforest Gin' },
    { name: 'Tails', volumeL: 169.7, abv: 75.5, lal: 0.0, vessel: 'FEINTS-GIN-01 IBC-02', observations: 'Feints' }
  ],

  dilutions: [],

  finalOutput: {
    totalVolume_L: 346.0,
    lal: 21.0,
    finalAbv_percent: 82.3,
    notes: 'Hearts captured for Rainforest Gin 028.'
  },

  notes: 'Rainforest Gin 028 distilled on Carrie still with staged cuts and 18-hour botanical steep.'
} satisfies DistillationSession

export const rainforestGinRF28 = DistillationSessionCalculator.processDistillationSession(baseRainforestGinRF28)
export default rainforestGinRF28



