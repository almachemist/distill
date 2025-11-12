import type { DistillationSession } from '../types/distillation-session.types'
import { VodkaDistillationCalculator } from '../services/vodka-distillation-calculator.service'

const baseSpiritLiq001Distillation = {
  id: 'SPIRIT-LIQ-001',
  sku: 'Ethanol for Liquors',
  description: 'Ethanol recovered from multiple gin late tails, re-distilled on Carrie.',
  date: '2025-09-09',
  still: 'Carrie',
  boilerOn: '35A',

  chargeVolumeL: 1000,
  chargeABV: 57.0,
  chargeLAL: 570.0,
  charge: {
    components: [
      {
        source: 'Early tails from previous distillations',
        volume_L: 830,
        abv_percent: 70.0,
        lal: 581.0,
        type: 'ethanol'
      },
      {
        source: 'Filtered Water',
        volume_L: 200,
        abv_percent: 0.0,
        lal: 0.0,
        type: 'dilution'
      },
      {
        source: 'Saltwater',
        volume_L: 0,
        abv_percent: 0.0,
        lal: 0.0,
        type: 'other'
      }
    ],
    total: {
      volume_L: 1000,
      abv_percent: 57.0,
      lal: 570.0
    }
  },

  stillSetup: {
    elements: 'Warmed up to 70 °C a day before; 50 °C at 6 AM, turned on at 35 A.',
    steeping: 'None',
    plates: 'Water running on it',
    options: 'Defleg on'
  },

  runData: [
    {
      time: '08:00 AM',
      phase: 'Foreshots',
      volume_L: 2.0,
      abv_percent: 89.0,
      density: 0.814,
      condenserTemp_C: 35,
      lal: 1.8,
      observations: 'Ethanol from multiple gin late tails'
    },
    {
      time: '08:25 AM',
      phase: 'Heads',
      volume_L: 10.0,
      abv_percent: 87.8,
      density: 0.822,
      condenserTemp_C: 33,
      lal: 8.8,
      observations: ''
    },
    {
      time: '05:00 PM',
      phase: 'Middle Run (Hearts) – Part 1',
      volume_L: 282.0,
      abv_percent: 85.1,
      condenserTemp_C: 33,
      lal: 239.98,
      observations: 'Part 1'
    },
    {
      time: '07:00 AM (next day)',
      phase: 'Middle Run (Hearts) – Part 2',
      volume_L: 172.0,
      abv_percent: 84.9,
      density: 0.834,
      condenserTemp_C: 26,
      lal: 146.03,
      observations: 'Part 2'
    },
    {
      time: '07:30 AM (next day)',
      phase: 'Middle Run (Hearts) – Part 3',
      volume_L: 68.0,
      abv_percent: 83.0,
      condenserTemp_C: 25,
      lal: 56.44,
      observations: 'Part 3'
    }
  ],

  totalRun: {
    volume_L: 534.0,
    abv_percent: 84.2,
    lal: 453.05,
    notes: 'Three-part heart run collected across consecutive mornings.'
  },

  outputs: [
    {
      name: 'Foreshots',
      volumeL: 2.0,
      abv: 89.0,
      lal: 1.8,
      vessel: '20 L Waste',
      observations: 'Discarded'
    },
    {
      name: 'Heads',
      volumeL: 10.0,
      abv: 87.8,
      lal: 8.8,
      vessel: '20 L Waste',
      observations: 'Discarded'
    },
    {
      name: 'Hearts',
      volumeL: 522.0,
      abv: 84.2,
      lal: 442.45,
      vessel: 'VC-600',
      observations: 'Ethanol for liquors'
    },
    {
      name: 'Tails',
      volumeL: 0.0,
      abv: 0.0,
      lal: 0.0,
      vessel: 'Not collected',
      observations: 'Not collected'
    }
  ],

  dilutions: [
    {
      number: 1,
      date: '2025-09-09',
      newMake_L: 522.0,
      filteredWater_L: 0,
      newVolume_L: 522.0,
      abv_percent: 59.6,
      finalAbv_percent: null,
      notes: 'Calculated litres required overall.'
    },
    {
      number: 2,
      date: '2025-09-09',
      newMake_L: 522.0,
      filteredWater_L: 0,
      newVolume_L: 522.0,
      abv_percent: 58.6,
      finalAbv_percent: 58.6,
      notes: 'Final adjustment'
    }
  ],

  finalOutput: {
    totalVolume_L: 534.0,
    lal: 453.05,
    finalAbv_percent: 84.2,
    notes: 'Ethanol for liquors recovered from feints and tails; clean spirit base at 84 % ABV.'
  },

  botanicals: [],
  totalBotanicals_g: 0,
  totalBotanicals_percent: 0,
  botanicalsPerLAL: 0,

  powerA: 35,
  elementsKW: 32,
  steepingHours: 0,

  efficiency: 0,
  recovery: 0,
  spiritYield: 0,

  costs: {
    ethanolCost: 0,
    botanicalCost: 0,
    laborCost: 0,
    utilityCost: 0,
    totalCost: 0,
    costPerLAL: 0,
    costPerLiter: 0
  },

  notes: 'Distillation of mixed gin feints to recover neutral ethanol for liqueur base production. Conducted with deflegmator active and stable condenser operation.'
} satisfies DistillationSession

// Export the enhanced session with calculated metrics
export const spiritLiq001Distillation = VodkaDistillationCalculator.enhanceSession(baseSpiritLiq001Distillation)

export default spiritLiq001Distillation
