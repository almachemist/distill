import type { DistillationSession } from '../types/distillation-session.types'
import { DistillationSessionCalculator } from '../services/distillation-session-calculator.service'

const baseRainforestGinRF30 = {
  id: 'SPIRIT-GIN-RF-30',
  sku: 'Rainforest Gin',
  description: 'Batch of Rainforest Gin distilled on Roberta with 18-hour steep of juniper and coriander.',
  date: '2025-07-29',
  still: 'Carrie',
  boilerOn: '06:30',
  
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
  phases: {
    foreshots: [
      {
        id: 'rf30-foreshots',
        startTime: '07:00 AM',
        volumeL: 2.0,
        abvPercent: 87.0,
        notes: 'Discarded'
      }
    ],
    heads: [
      {
        id: 'rf30-heads',
        startTime: '07:30 AM',
        volumeL: 10.0,
        abvPercent: 84.0,
        notes: 'Collected for feints'
      }
    ],
    hearts: [
      {
        id: 'rf30-hearts',
        label: 'Main hearts cut',
        startTime: '03:30 PM',
        volumeL: 280.0,
        abvPercent: 82.0,
        notes: 'Collected as product'
      }
    ],
    tails: [
      {
        id: 'rf30-tails',
        startTime: '07:00 AM (Next Day)',
        volumeL: 226.0,
        abvPercent: 81.0,
        notes: 'Collected for feints'
      }
    ]
  },

  totals: {
    hearts: {
      volumeL: 280.0,
      avgAbvPercent: 82.0,
      lal: 229.6,
      count: 1
    }
  },

  outputs: [
    {
      phase: 'Foreshots',
      output: 'Discarded',
      receivingVessel: '20L Waste',
      volume_L: 2.0,
      abv_percent: 87.0,
      lal: 1.7
    },
    {
      phase: 'Heads',
      output: 'Feints',
      receivingVessel: 'FEINTS-GIN-000x',
      volume_L: 10.0,
      abv_percent: 84.0,
      lal: 8.4
    },
    {
      phase: 'Hearts',
      output: 'Rainforest Gin',
      receivingVessel: 'VC-400',
      volume_L: 280.0,
      abv_percent: 82.0,
      lal: 229.6
    },
    {
      phase: 'Tails',
      output: 'Feints',
      receivingVessel: 'FEINTS-GIN-000x',
      volume_L: 226.0,
      abv_percent: 81.0,
      lal: 0.0
    }
  ],

  dilutions: [
    {
      number: 1,
      date: '2025-07-30',
      newMake_L: 280.0,
      filteredWater_L: 240.0,
      newVolume_L: 520.0,
      finalAbv_percent: 45.0,
      lal: 234.0,
      notes: 'Primary dilution toward bottling strength.'
    },
    {
      number: 2,
      date: '2025-08-02',
      newMake_L: 520.0,
      filteredWater_L: 30.0,
      newVolume_L: 550.0,
      finalAbv_percent: 42.0,
      lal: 231.0,
      notes: 'Final adjustment on 02/08/2025.'
    }
  ],

  // Final output summary
  finalOutput: {
    totalVolume_L: 550.0,
    lal: 231.0,
    finalAbv_percent: 42.0,
    notes: 'Final Rainforest Gin output diluted to 42% ABV on 02/08/2025.'
  },

  // Botanicals
  botanicals: [
    { name: 'Lemon Myrtle', weightG: 141, notes: 'ok', ratio_percent: 1.5, status: 'ok' },
    { name: 'Lemon Aspen', weightG: 71, notes: 'ok', ratio_percent: 0.8, status: 'ok' },
    { name: 'Grapefruit', weightG: 567, notes: 'ok', ratio_percent: 6.1, status: 'ok' },
    { name: 'Macadamia', weightG: 102, notes: 'ok', ratio_percent: 1.1, status: 'ok' },
    { name: 'Liquorise', weightG: 51, notes: 'ok', ratio_percent: 0.5, status: 'ok' },
    { name: 'Cardamon', weightG: 141, notes: 'ok', ratio_percent: 1.5, status: 'ok' },
    { name: 'Pepperberry', weightG: 102, notes: '', ratio_percent: 1.1, status: 'ok' },
    { name: 'Vanilla', weightG: 25, notes: 'ok', ratio_percent: 0.3, status: 'ok' },
    { name: 'Mango', weightG: 176, notes: 'ok', ratio_percent: 1.9, status: 'ok' }
  ],
  totalBotanicals_g: 9346,
  totalBotanicals_percent: 100.0,
  botanicalsPerLAL: 18.3,

  // Power and efficiency data
  powerA: 35, // Estimated
  elementsKW: 32, // Estimated
  steepingHours: 18,
  
  // Calculated metrics (will be calculated by service)
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

  notes: 'Run performed on Roberta still with 18-hour steep. Two-element setup produced clean hearts at ~80% ABV. Leftover tails stored for vodka distillation.'
} satisfies DistillationSession

// Export the enhanced session with calculated metrics
export const rainforestGinRF30 = DistillationSessionCalculator.processDistillationSession(baseRainforestGinRF30)
