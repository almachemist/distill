import type { DistillationSession } from '../types/distillation-session.types'
import { VodkaDistillationCalculator } from '../services/vodka-distillation-calculator.service'

const baseVodka003Distillation = {
  id: 'VODKA-003',
  sku: 'Ethanol for liquors and vodka',
  description: 'Triple distilled ethanol base for vodka and liqueur production.',
  date: '2025-10-09',
  still: 'Carrie',
  boilerOn: '35A',
  
  // Charge data
  chargeVolumeL: 925,
  chargeABV: 52.5,
  chargeLAL: 485.6,
  
  // Charge components breakdown
  charge: {
    components: [
      {
        source: 'Early tails already distilled',
        volume_L: 925,
        abv_percent: 52.5,
        lal: 485.6,
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
      volume_L: 925,
      abv_percent: 52.5,
      lal: 485.6
    }
  },

  // Still setup details
  stillSetup: {
    elements: 'Warmed up to 70°C a day before, 50°C at 6 AM, turned on at 35A',
    steeping: 'None',
    plates: 'Water running on it',
    options: 'Defleg on'
  },

  // Run data with timestamps and phases
  runData: [
    {
      time: '08:45 AM',
      phase: 'Foreshots',
      volume_L: 2.0,
      abv_percent: 90.0,
      density: 0.814,
      condenserTemp_C: 35,
      lal: 1.8,
      observations: '35A'
    },
    {
      time: '03:00 PM',
      phase: 'Middle Run (Hearts) – Part 1',
      volume_L: 125,
      abv_percent: 87.2,
      condenserTemp_C: 33,
      lal: 109.0, // Calculated: 125 * 0.872
      observations: 'Part 1'
    },
    {
      time: '04:30 PM',
      phase: 'Middle Run (Hearts) – Part 2',
      volume_L: 288,
      abv_percent: 86.0,
      condenserTemp_C: 26,
      lal: 247.68, // Calculated: 288 * 0.86
      observations: 'Part 2 (back on at 6 AM)'
    },
    {
      time: '02:00 PM',
      phase: 'Middle Run (Hearts) – Part 3',
      volume_L: 126,
      abv_percent: 86.2,
      condenserTemp_C: 25,
      lal: 108.61, // Calculated: 126 * 0.862
      observations: 'Part 3 (back on at 7 AM)'
    }
  ],

  // Total run summary
  totalRun: {
    volume_L: 541.0,
    abv_percent: 86.5,
    lal: 467.09, // Calculated: 1.8 + 109.0 + 247.68 + 108.61
    notes: 'Three heart cuts collected over two mornings.'
  },

  // Output phases
  outputs: [
    {
      name: 'Foreshots',
      volumeL: 2.0,
      abv: 90.0,
      lal: 1.8,
      vessel: '20 L Waste',
      observations: 'Discarded'
    },
    {
      name: 'Hearts',
      volumeL: 125.0,
      abv: 87.2,
      lal: 109.0, // Calculated: 125 * 0.872
      vessel: 'VC-1000',
      observations: 'Blend for vodkas - Part 1'
    },
    {
      name: 'Hearts',
      volumeL: 288.0,
      abv: 86.0,
      lal: 247.68, // Calculated: 288 * 0.86
      vessel: 'VC-1000',
      observations: 'Blend for vodkas - Part 2'
    },
    {
      name: 'Hearts',
      volumeL: 126.0,
      abv: 86.2,
      lal: 108.61, // Calculated: 126 * 0.862
      vessel: 'VC-315',
      observations: 'Blend for vodkas - Part 3'
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

  // Dilution history
  dilutions: [
    {
      number: 1,
      date: '2025-10-13',
      newMake_L: 288.0,
      filteredWater_L: 363.0,
      newVolume_L: 651.0,
      abv_percent: 38.0,
      notes: 'Initial dilution to bottling strength.'
    },
    {
      number: 2,
      date: '2025-10-14',
      newMake_L: 651.0,
      ethanolAdded: '110 L @ 96%',
      finalAbv_percent: 58.6,
      notes: 'Reinforcement with clear ethanol.'
    },
    {
      number: 3,
      date: '2025-10-14',
      newMake_L: 761.0,
      filteredWater_L: 168.0,
      finalAbv_percent: 38.0,
      notes: 'Final dilution to 38% ABV.'
    }
  ],

  // Final output summary
  finalOutput: {
    totalVolume_L: 1700.0,
    lal: 531.0, // This includes dilutions - matches the provided data
    finalAbv_percent: 38.0,
    notes: 'Triple-distilled vodka base ready for storage or blending.'
  },

  // Botanicals (none for vodka)
  botanicals: [],
  totalBotanicals_g: 0,
  totalBotanicals_percent: 0,
  botanicalsPerLAL: 0.0,

  // Power and efficiency data
  powerA: 35,
  elementsKW: 32,
  steepingHours: 0,
  
  // Calculated metrics
  efficiency: 0, // Will be calculated: (output LAL / input LAL) * 100
  recovery: 0, // Will be calculated: (total output volume / input volume) * 100
  spiritYield: 0, // Will be calculated: (hearts volume / total volume) * 100

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

  notes: 'Clean triple distillation for ethanol base used across vodka and liqueur production. Controlled reflux achieved via deflegmator with stable condenser temps.'
} satisfies DistillationSession

// Export the enhanced session with calculated metrics
export const vodka003Distillation = VodkaDistillationCalculator.enhanceSession(baseVodka003Distillation)
