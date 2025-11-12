import type { DistillationSession } from '../types/distillation-session.types'
import { VodkaDistillationCalculator } from '../services/vodka-distillation-calculator.service'

const baseSpiritLiq002Distillation = {
  id: 'SPIRIT-LIQ-002',
  sku: 'Ethanol for Liquors',
  description: 'Ethanol recovered from multiple gin late tails and redistilled on Carrie.',
  date: '2025-02-26',
  still: 'Carrie',
  boilerOn: '35A',
  powerA: 35,
  elementsKW: 32,
  steepingHours: 0,
  chargeLAL: 570.0,
  chargeVolumeL: 1000,
  chargeABV: 57.0,
  
  charge: {
    components: [
      {
        source: 'Early tails from previous distillations',
        volume_L: 800,
        abv_percent: 70.0,
        lal: 560.0,
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
    elements: 'Warmed up to 70 °C a day before; at 50 °C by 6 AM; turned on at 35 A.',
    steeping: 'None',
    plates: 'Water running on it',
    options: 'Defleg on'
  },

  botanicals: [],
  totalBotanicals_g: 0,
  totalBotanicals_percent: 0,
  botanicalsPerLAL: 0,

  runData: [
    {
      time: '08:15 AM',
      phase: 'Foreshots',
      volume_L: 2.0,
      abv_percent: 90.7,
      density: 0.815,
      condenserTemp_C: 35,
      lal: 1.8,
      observations: 'Ethanol from multiple gin late tails'
    },
    {
      time: '08:45 AM',
      phase: 'Heads',
      volume_L: 11.0,
      abv_percent: 88.0,
      density: 0.820,
      condenserTemp_C: 33,
      lal: 9.7,
      observations: '33A'
    },
    {
      time: '04:30 PM',
      phase: 'Middle Run (Hearts) – Part 1',
      volume_L: 289.0,
      abv_percent: 84.4,
      condenserTemp_C: 33,
      lal: null,
      observations: 'Part 1'
    },
    {
      time: '07:30 AM (Next Day) – 9:00 AM to 4:00 PM',
      phase: 'Middle Run (Hearts) – Part 2',
      volume_L: 168.0,
      abv_percent: 86.0,
      density: 0.834,
      condenserTemp_C: 26,
      lal: 65.4,
      observations: 'Part 2'
    },
    {
      time: '07:30 AM (Next Day) – 9:00 AM to 3:30 PM',
      phase: 'Middle Run (Hearts) – Part 3',
      volume_L: 76.0,
      abv_percent: 86.4,
      condenserTemp_C: 25,
      lal: 0,
      observations: 'Part 3'
    }
  ],

  totalRun: {
    volume_L: 546.0,
    abv_percent: 85.0,
    lal: null,
    notes: 'Total hearts output of 533 L at average 85% ABV; foreshots and heads removed.'
  },

  outputs: [
    {
      name: 'Foreshots',
      volumeL: 2.0,
      abv: 90.7,
      lal: 1.8,
      vessel: '20 L Waste',
      observations: 'Discarded'
    },
    {
      name: 'Heads',
      volumeL: 11.0,
      abv: 88.0,
      lal: 9.7,
      vessel: '20 L Waste',
      observations: 'Discarded'
    },
    {
      name: 'Hearts',
      volumeL: 533.0,
      abv: 85.0,
      lal: null,
      vessel: 'VC-600',
      observations: 'VC-600'
    },
    {
      name: 'Tails',
      volumeL: 0.0,
      abv: 0.0,
      lal: 0.0,
      vessel: 'FEINTS-GIN-000x',
      observations: 'FEINTS-GIN-000x'
    }
  ],

  dilutions: [
    {
      number: 1,
      date: null,
      newMake_L: null,
      filteredWater_L: null,
      newVolume_L: null,
      abv_percent: 59.6,
      finalAbv_percent: null,
      notes: 'Suggested to add ~675 L water to dilute to 37.5% ABV.'
    },
    {
      number: 2,
      date: null,
      newMake_L: null,
      filteredWater_L: null,
      newVolume_L: null,
      abv_percent: 58.6,
      finalAbv_percent: null,
      notes: ''
    }
  ],

  finalOutput: {
    totalVolume_L: 546.0,
    lal: null,
    finalAbv_percent: 85.0,
    notes: 'Recovered ethanol at 85% ABV; ready for dilution to 37.5%.'
  },

  notes: 'Neutral ethanol recovered from feints and gin tails for reuse in liquors. All times, ABV readings, condenser temperatures and power settings (A) logged precisely.'
} satisfies DistillationSession

export const spiritLiq002Distillation = VodkaDistillationCalculator.enhanceSession(baseSpiritLiq002Distillation)

export default spiritLiq002Distillation
