import type { DistillationSession } from '../types/distillation-session.types'
import { DistillationSessionCalculator } from '../services/distillation-session-calculator.service'

const baseRainforestGinRF29Distillation = {
  id: 'SPIRIT-GIN-RF-29',
  sku: 'Rainforest Gin',
  description: 'Rainforest Gin distilled on Roberta still with 18-hour steep of juniper and coriander.',
  date: '2025-01-20',
  still: 'Carrie',
  boilerOn: '07:05',
  
  // Charge data
  chargeVolumeL: 1000,
  chargeABV: 51.0,
  chargeLAL: 510.0,
  
  // Charge components breakdown
  charge: {
    components: [
      {
        source: 'Manildra NC96',
        volume_L: 1000,
        abv_percent: 51.0,
        lal: 510.0,
        type: 'ethanol'
      },
      {
        source: 'Filtered Water',
        volume_L: 0,
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
      abv_percent: 51.0,
      lal: 510.0
    }
  },

  // Still setup details
  stillSetup: {
    elements: 'Two new heating elements',
    steeping: '18 hours (Juniper, Coriander)',
    plates: 'Not specified',
    options: 'Not specified'
  },

  // Run data with phases
  runData: [
    {
      time: '09:30 AM',
      phase: 'Foreshots',
      volume_L: 2.0,
      abv_percent: 86.0,
      lal: 1.72, 
      observations: ''
    },
    {
      time: '09:45 AM',
      phase: 'Heads',
      volume_L: 12.0,
      abv_percent: 83.0,
      lal: 9.96, 
      observations: ''
    },
    {
      time: '05:00 PM',
      phase: 'Middle Run (Hearts)',
      volume_L: 280.0,
      abv_percent: 82.0,
      lal: 229.6, 
      observations: 'Main hearts cut collected.'
    },
    {
      time: '07:00 AM (Next Day)',
      phase: 'Tails',
      volume_L: 169.7,
      abv_percent: 75.5,
      lal: 128.12, 
      observations: 'Distilled leftover at 58.3 % volume; to be reused for other distillation.'
    }
  ],

  // Total run summary
  totalRun: {
    volume_L: 463.7, 
    abv_percent: 82.0,
    lal: 369.4, 
    notes: 'Total heads and hearts yield; tails stored for reuse.'
  },

  // Output phases
  outputs: [
    {
      name: 'Foreshots',
      volumeL: 2.0,
      abv: 86.0,
      lal: 1.72,
      vessel: 'Buket',
      observations: 'Discarded'
    },
    {
      name: 'Heads',
      volumeL: 12.0,
      abv: 83.0,
      lal: 9.96,
      vessel: 'IBC-01',
      observations: 'Feints'
    },
    {
      name: 'Hearts',
      volumeL: 280.0,
      abv: 82.0,
      lal: 229.6,
      vessel: 'VC-400',
      observations: 'Rainforest Gin'
    },
    {
      name: 'Tails',
      volumeL: 169.7,
      abv: 75.5,
      lal: 128.12,
      vessel: 'IBC-01',
      observations: 'Feints'
    }
  ],

  // Dilution history
  dilutions: [
    {
      number: 1,
      date: '2025-01-20',
      newMake_L: 280.0,
      filteredWater_L: 248.0,
      newVolume_L: 528.0,
      abv_percent: 45.0,
      lal: 237.6,
      notes: 'Primary dilution after hearts collection.'
    },
    {
      number: 2,
      date: '2025-01-20',
      newMake_L: 528.0,
      filteredWater_L: 18.0,
      newVolume_L: 546.0,
      abv_percent: 42.0,
      lal: 229.3,
      notes: 'Secondary fine-tuning dilution to 42 % ABV.'
    },
    {
      number: 3,
      date: '2025-01-20',
      newMake_L: 291.0,
      filteredWater_L: 291.0,
      newVolume_L: 291.0,
      abv_percent: 24.1,
      lal: 70.1,
      notes: 'Combined dilution reference entry (source labelled as COMBINED).'
    }
  ],

  // Final output summary
  finalOutput: {
    totalVolume_L: 546.0,
    lal: 229.3,
    finalAbv_percent: 42.0,
    notes: 'Final Rainforest Gin diluted to 42 % ABV.'
  },

  // Botanicals
  botanicals: [
    { name: 'Juniper', notes: 'ok', weightG: 6360, ratio_percent: 68.1 },
    { name: 'Coriander', notes: 'ok', weightG: 1410, ratio_percent: 15.1 },
    { name: 'Angelica', notes: 'ok', weightG: 175, ratio_percent: 1.9 },
    { name: 'Cassia', notes: 'ok', weightG: 25, ratio_percent: 0.3 },
    { name: 'Lemon Myrtle', notes: 'ok', weightG: 141, ratio_percent: 1.5 },
    { name: 'Lemon Aspen', notes: 'ok', weightG: 71, ratio_percent: 0.8 },
    { name: 'Grapefruit', notes: '', weightG: 567, ratio_percent: 6.1 },
    { name: 'Macadamia', notes: 'ok', weightG: 102, ratio_percent: 1.1 },
    { name: 'Liquorise', notes: 'ok', weightG: 51, ratio_percent: 0.5 },
    { name: 'Cardamon', notes: 'ok', weightG: 141, ratio_percent: 1.5 },
    { name: 'Pepperberry', notes: 'ok', weightG: 102, ratio_percent: 1.1 },
    { name: 'Vanilla', notes: 'ok', weightG: 25, ratio_percent: 0.3 },
    { name: 'Mango', notes: 'ok', weightG: 176, ratio_percent: 1.9 }
  ],
  totalBotanicals_g: 9346,
  totalBotanicals_percent: 100.0,
  botanicalsPerLAL: 18.3,

  // Power and efficiency data
  powerA: 35,
  elementsKW: 32,
  steepingHours: 18,
  
  // Calculated metrics
  efficiency: 0, 
  recovery: 0, 
  spiritYield: 0, 

  // Costs (to be calculated)
  costs: {
    ethanolCost: 0,
    botanicalCost: 0,
    laborCost: 0,
    utilityCost: 0,
    totalCost: 0,
    costPerLAL: 0,
    costPerLiter: 0
  },

  notes: 'Distilled on Roberta with 18-hour steep of juniper and coriander. Two-element setup produced clean hearts at 82 % ABV. Tails reused for other distillations.'
} satisfies DistillationSession

// Export the enhanced session with calculated metrics
export const rainforestGinRF29Distillation = DistillationSessionCalculator.processDistillationSession(baseRainforestGinRF29Distillation)
