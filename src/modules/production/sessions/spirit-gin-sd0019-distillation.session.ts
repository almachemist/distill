import type { DistillationSession } from '../types/distillation-session.types'
import { DistillationSessionCalculator } from '../services/distillation-session-calculator.service'

const baseSpiritGinSD0019 = {
  id: 'SPIRIT-GIN-SD-0019',
  sku: 'Signature Dry Gin New Recipe Trial',
  description: 'Signature Dry Gin Trial 019',
  date: '2024-10-29',
  still: 'Carrie',
  boilerOn: '06:00',
  chargeVolumeL: 700,
  chargeABV: 42.5,
  chargeLAL: 297.5,
  powerA: 35,
  elementsKW: 32,
  steepingHours: 18,
  
  charge: {
    components: [
      { source: 'Ethanol Manildra NC96', volume_L: 700, abv_percent: 42.5, lal: 297.5, type: 'ethanol' },
      { source: 'Filtered Water', volume_L: 0, abv_percent: 0.0, lal: 0.0, type: 'dilution' },
      { source: 'Old batches of signature', volume_L: null, abv_percent: null, lal: 0.0, type: 'other' }
    ],
    total: { volume_L: 700, abv_percent: 42.5, lal: 297.5 }
  },

  stillSetup: {
    elements: '6 × 5750W',
    steeping: '18 hours (Juniper, Coriander)',
    plates: null,
    options: '3 × 5750W + 1 × 2200W; 2 × 5750W + 1 × 2200W'
  },

  botanicals: [
    { name: 'Juniper', weightG: 4480, notes: '', ratio_percent: 63.4 },
    { name: 'Coriander', weightG: 1260, notes: '', ratio_percent: 17.8 },
    { name: 'Angelica', weightG: 126, notes: '#VALUE! na planilha', ratio_percent: 1.8 },
    { name: 'Orris Root', weightG: 63, notes: '', ratio_percent: 0.9 },
    { name: 'Orange peel', weightG: 392, notes: '', ratio_percent: 5.6 },
    { name: 'Lemon peel', weightG: 392, notes: 'ADD 116 L H2O', ratio_percent: 5.6 },
    { name: 'Macadamia', weightG: 126, notes: '', ratio_percent: 1.8 },
    { name: 'Liquorice', weightG: 70, notes: '', ratio_percent: 1.0 },
    { name: 'Cardamon', weightG: 126, notes: '', ratio_percent: 1.8 },
    { name: 'Lavender', weightG: 28, notes: 'Put in basket last', ratio_percent: 0.4 }
  ],
  totalBotanicals_g: 7063,
  totalBotanicals_percent: 100.0,
  botanicalsPerLAL: 23.7,

  runData: [
    { time: '08:40', phase: 'Foreshots', volume_L: 1.4, abv_percent: 88.0, lal: 0.0, observations: '6 × 5750 W' },
    { time: '08:50', phase: 'Heads', volume_L: 7.0, abv_percent: 84.5, lal: null, observations: '3 × 5750 W + 1 × 2200W' },
    { time: '12:15', phase: 'Middle Run (Hearts)', volume_L: 128.0, abv_percent: 81.1, lal: null, observations: '2 × 5750W + 1 × 2200W' }
  ],

  totalRun: {
    volume_L: 251.4,
    volume_percent: null,
    abv_percent: null,
    lal: null,
    notes: 'Total Run (Heads/Hearts) mostra #REF!'
  },

  outputs: [
    { name: 'Foreshots', volumeL: 1.4, abv: 0.0, lal: 0.0, vessel: 'Discarded 20L Waste', observations: 'Discarded' },
    { name: 'Heads', volumeL: 7.0, abv: 0.0, lal: 0.0, vessel: 'FEINTS-GIN-000x IBC-01', observations: 'Feints' },
    { name: 'Hearts', volumeL: 128.0, abv: 81.1, lal: null, vessel: 'GIN-SD-019 IBC-ENA-7', observations: 'Signature Dry Gin' },
    { name: 'Tails', volumeL: 0.0, abv: 0.0, lal: 0.0, vessel: 'FEINTS-GIN-000x IBC-0x', observations: 'No tails' }
  ],

  dilutions: [
    { stepNo: 1, date: null, newMakeL: 128.0, waterL: 115.0, finalVolumeL: 243.0, finalABV: 42.8, notes: 'x litres required overall 685' },
    { stepNo: 2, date: null, newMakeL: 243.0, waterL: 1.0, finalVolumeL: 244.0, finalABV: 42.3, notes: '' }
  ],
  notes: 'Signature Dry Gin Trial 019. Sheet final observation: 0'
} satisfies DistillationSession

export const spiritGinSD0019Distillation = DistillationSessionCalculator.processDistillationSession(baseSpiritGinSD0019)
export default spiritGinSD0019Distillation




