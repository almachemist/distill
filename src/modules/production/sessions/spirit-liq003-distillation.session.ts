import type { DistillationSession } from '../types/distillation-session.types'
import { VodkaDistillationCalculator } from '../services/vodka-distillation-calculator.service'

const baseSpiritLiq003 = {
  id: 'SPIRIT-LIQ-003',
  sku: 'Ethanol for liquors',
  description: 'Ethanol for Liquors 003',
  date: '2025-10-24',
  still: 'Carrie',
  boilerOn: '09:00',
  chargeVolumeL: 974,
  chargeABV: 50.0,
  chargeLAL: 487.0,
  powerA: 35,
  elementsKW: 32,
  
  charge: {
    components: [
      { source: 'Early tails from previous distillations', volume_L: 614, abv_percent: 79.4, lal: 487.5, type: 'ethanol' },
      { source: 'Filtered Water', volume_L: 360, abv_percent: 0.0, lal: null, type: 'dilution' },
      { source: 'Saltwater', volume_L: null, abv_percent: 0.0, lal: 0.0, type: 'other' }
    ],
    total: { volume_L: 974, abv_percent: 50.0, lal: 487.0 }
  },

  stillSetup: {
    elements: '35A',
    steeping: null,
    plates: 'Water running on it',
    options: 'Defleg on'
  },

  botanicals: [],
  totalBotanicals_g: 0,
  botanicalsPerLAL: 0.0,

  runData: [
    { time: '09:00', phase: 'Foreshots', volume_L: 2.0, abv_percent: 88.0, lal: 1.8, observations: 'amps 35A' },
    { time: '09:20', phase: 'Heads', volume_L: 10.0, abv_percent: 87.0, lal: 8.7, observations: 'amps 33A' },
    { time: '16:30', phase: 'Middle Run (Hearts) – Part 1', volume_L: 132.0, abv_percent: 88.0, lal: null, observations: 'Segment Part 1 (amps 33A)' },
    { time: '09:00 - 16:00 (back on at 07:30AM)', phase: 'Middle Run (Hearts) – Part 2', volume_L: 250.0, abv_percent: 86.0, lal: 200.4, observations: 'Segment Part 2 (amps 26A)' },
    { time: '09:00 - 12:30 (back on at 07:30AM)', phase: 'Middle Run (Hearts) – Part 3', volume_L: 233.0, abv_percent: 80.0, lal: 0.0, observations: 'Segment Part 3 (amps 25A)' }
  ],

  totalRun: {
    volume_L: 627.0,
    volume_percent: 100.0,
    abv_percent: 0.0,
    lal: null,
    notes: 'Total Run ABV recorded as 0.0'
  },

  outputs: [
    { name: 'Foreshots', volumeL: 10.0, abv: 88.0, lal: 10.5, vessel: 'Discarded 20L Waste', observations: 'Discarded' },
    { name: 'Hearts', volumeL: 250.0, abv: 86.0, lal: null, vessel: 'VC-330', observations: 'Hearts Part 2' },
    { name: 'Hearts', volumeL: 233.0, abv: 80.0, lal: null, vessel: 'VC-330', observations: 'Hearts Part 3' },
    { name: 'Tails', volumeL: 0.0, abv: null, lal: 0.0, vessel: 'FEINTS-GIN-000x', observations: 'No tails collected' }
  ],

  dilutions: [],
  notes: 'Ethanol for Liquors 003. Feedstock: LT-RF 242 L @ 79.4% | LT-MMG 246 L @ 75.8% | VODKA 4TH 126 L @ 81.6%'
} satisfies DistillationSession

export const spiritLiq003Distillation = VodkaDistillationCalculator.enhanceSession(baseSpiritLiq003)
export default spiritLiq003Distillation


