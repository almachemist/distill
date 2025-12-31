import type { DistillationSession } from '../types/distillation-session.types'
import { VodkaDistillationCalculator } from '../services/vodka-distillation-calculator.service'
import { type Batch, generateUUID } from '@/types/schema'

// Complete SPIRIT-GIN-NS-018 data in bulletproof schema format
const spiritGinNS018BulletproofData: Batch = {
  spiritRunId: "SPIRIT-GIN-NS-018",
  sku: "Navy Strength Gin",
  description: "High-strength gin distilled on Carrie still with citrus and native botanicals. Steeped 14 hours, zero plates, 35A start.",
  date: "2025-03-04",
  boilerStartTime: "08:15 AM",
  boilerOn: "08:15 AM",
  stillUsed: "Carrie",

  chargeAdjustment: {
    components: [
      {
        id: generateUUID(),
        source: "Manildra NC96",
        volume_L: 500,
        abv_percent: 96.0,
        lal: 480.0,
        type: "ethanol",
        expected_percent: null
      },
      {
        id: generateUUID(),
        source: "Filtered Water",
        volume_L: 500,
        abv_percent: 0.0,
        lal: 0.0,
        type: "dilution",
        expected_percent: null
      },
      {
        id: generateUUID(),
        source: "Saltwater",
        volume_L: 0,
        abv_percent: 0.0,
        lal: 0.0,
        type: "other",
        expected_percent: null
      }
    ],
    total: {
      volume_L: 1000,
      abv_percent: 50.3,
      lal: 503.0
    }
  },

  stillSetup: {
    elements: "35 A on at 8:15 AM",
    steeping: "14 hours (Juniper, Coriander)",
    plates: "Zero plates",
    options: null
  },

  botanicals: [
    { id: generateUUID(), name: "Juniper", notes: "Crushed / steeped", weight_g: 6400, ratio_percent: 63.0, status: null },
    { id: generateUUID(), name: "Coriander", notes: "Steeped", weight_g: 1800, ratio_percent: 17.7, status: null },
    { id: generateUUID(), name: "Angelica", notes: "", weight_g: 180, ratio_percent: 1.8, status: null },
    { id: generateUUID(), name: "Orris Root", notes: "a", weight_g: 90, ratio_percent: 0.9, status: null },
    { id: generateUUID(), name: "Orange", notes: "8 fresh naval orange rind", weight_g: 380, ratio_percent: 3.7, status: null },
    { id: generateUUID(), name: "Lemon", notes: "12 fresh lemon rind", weight_g: 380, ratio_percent: 3.7, status: null },
    { id: generateUUID(), name: "Finger Lime", notes: "120 caviar scoops", weight_g: 380, ratio_percent: 3.7, status: null },
    { id: generateUUID(), name: "Macadamia", notes: "Sliced fresh macadamia", weight_g: 180, ratio_percent: 1.8, status: null },
    { id: generateUUID(), name: "Liquorice", notes: "Liquorice root", weight_g: 100, ratio_percent: 1.0, status: null },
    { id: generateUUID(), name: "Cardamon", notes: "a", weight_g: 180, ratio_percent: 1.8, status: null },
    { id: generateUUID(), name: "Chamomile", notes: "a", weight_g: 90, ratio_percent: 0.9, status: null }
  ],
  totalBotanicals_g: 10160,
  totalBotanicals_percent: 100.0,
  botanicalsPerLAL: 20.2,

  runData: [
    {
      id: generateUUID(),
      time: "11:15 AM",
      phase: "Foreshots",
      volume_L: 2.0,
      volume_percent: 0.4,
      vcTankVolume_L: null,
      abv_percent: 85.0,
      density: null,
      ambientTemp_C: null,
      headTemp_C: null,
      condenserTemp_C: 35,
      lal: 1.7,
      observations: "35A",
      notes: null
    },
    {
      id: generateUUID(),
      time: "11:30 AM",
      phase: "Heads",
      volume_L: 10.0,
      volume_percent: 2.0,
      vcTankVolume_L: null,
      abv_percent: 84.8,
      density: null,
      ambientTemp_C: null,
      headTemp_C: null,
      condenserTemp_C: 35,
      lal: 8.5,
      observations: "35A",
      notes: null
    },
    {
      id: generateUUID(),
      time: "05:30 PM",
      phase: "Middle Run (Hearts) – Part 1",
      volume_L: 185.0,
      volume_percent: null,
      vcTankVolume_L: null,
      abv_percent: 83.0,
      density: null,
      ambientTemp_C: null,
      headTemp_C: null,
      condenserTemp_C: null,
      lal: null,
      observations: "Distilling at 30A",
      notes: null
    },
    {
      id: generateUUID(),
      time: "06:30 AM (05/03/25)",
      phase: "Middle Run (Hearts) – Part 2",
      volume_L: 306.0,
      volume_percent: null,
      vcTankVolume_L: null,
      abv_percent: 82.0,
      density: null,
      ambientTemp_C: null,
      headTemp_C: null,
      condenserTemp_C: null,
      lal: null,
      observations: "Distilling at 30A, stopped at 79.9%",
      notes: null
    },
    {
      id: generateUUID(),
      time: null,
      phase: "Tails",
      volume_L: 220.0,
      volume_percent: null,
      vcTankVolume_L: null,
      abv_percent: 81.0,
      density: null,
      ambientTemp_C: null,
      headTemp_C: null,
      condenserTemp_C: null,
      lal: null,
      observations: "Kept aside for vodka redistillation",
      notes: null
    }
  ],

  totalRun: {
    volume_L: 538.0,
    volume_percent: null,
    abv_percent: 82.0,
    lal: 503.0,
    notes: "Total recovered 538 L @ ~82% ABV across two-day run. 220 L tails set aside for vodka."
  },

  output: [
    {
      id: generateUUID(),
      phase: "Foreshots",
      output: "Discarded",
      volume_L: 2.0,
      volume_percent: 0.4,
      abv_percent: 85.0,
      lal: 1.7,
      receivingVessel: "20L Waste"
    },
    {
      id: generateUUID(),
      phase: "Heads",
      output: "Feints",
      volume_L: 10.0,
      volume_percent: 2.0,
      abv_percent: 84.8,
      lal: 8.5,
      receivingVessel: "FEINTS-GIN-MIX IBC-01"
    },
    {
      id: generateUUID(),
      phase: "Hearts",
      output: "Navy Strength Gin",
      volume_L: 306.0,
      volume_percent: null,
      abv_percent: 82.0,
      lal: null,
      receivingVessel: "VC-230"
    },
    {
      id: generateUUID(),
      phase: "Tails",
      output: "FEINTS-GIN-MIX IBC-01",
      volume_L: 220.0,
      volume_percent: null,
      abv_percent: 81.0,
      lal: null,
      receivingVessel: "FEINTS-GIN-MIX IBC-01"
    }
  ],

  dilutions: [
    {
      id: generateUUID(),
      number: 1,
      date: "2025-03-07",
      newMake_L: 306.0,
      filteredWater_L: 119.0,
      ethanolAdded: null,
      newVolume_L: 425.0,
      abv_percent: 59.1,
      lal: null,
      finalAbv_percent: null,
      notes: "First dilution to 59.1% ABV."
    }
  ],

  finalOutput: {
    totalVolume_L: 425.0,
    abv_percent: 59.1,
    lal: 251.2,
    notes: "Final Navy Strength Gin blend at 59.1% ABV."
  },

  notes: "Two-day Navy Strength Gin run with 14-hour steeping. Main hearts collected at 82% ABV, diluted to 59.1% for bottling. 220 L tails kept for vodka re-distillation."
}

// Convert bulletproof data to legacy format for compatibility
const baseSpiritGinNS018Distillation = {
  id: 'SPIRIT-GIN-NS-018',
  sku: 'Navy Strength Gin',
  description: 'High-strength gin distilled on Carrie still with citrus and native botanicals. Steeped 14 hours, zero plates, 35A start.',
  date: '2025-03-04',
  still: 'Carrie',
  boilerOn: '08:15 AM',
  powerA: 35,
  elementsKW: 32,
  steepingHours: 14,
  chargeLAL: 503.0,
  chargeVolumeL: 1000,
  chargeABV: 50.3,
  
  charge: {
    components: [
      {
        source: 'Manildra NC96',
        volume_L: 500,
        abv_percent: 96.0,
        lal: 480.0,
        type: 'ethanol'
      },
      {
        source: 'Filtered Water',
        volume_L: 500,
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
      abv_percent: 50.3,
      lal: 503.0
    }
  },

  stillSetup: {
    elements: '35 A on at 8:15 AM',
    steeping: '14 hours (Juniper, Coriander)',
    plates: 'Zero plates',
    options: null
  },

  botanicals: [
    { name: 'Juniper', weightG: 6400, notes: 'Crushed / steeped', ratio_percent: 63.0 },
    { name: 'Coriander', weightG: 1800, notes: 'Steeped', ratio_percent: 17.7 },
    { name: 'Angelica', weightG: 180, notes: '', ratio_percent: 1.8 },
    { name: 'Orris Root', weightG: 90, notes: 'a', ratio_percent: 0.9 },
    { name: 'Orange', weightG: 380, notes: '8 fresh naval orange rind', ratio_percent: 3.7 },
    { name: 'Lemon', weightG: 380, notes: '12 fresh lemon rind', ratio_percent: 3.7 },
    { name: 'Finger Lime', weightG: 380, notes: '120 caviar scoops', ratio_percent: 3.7 },
    { name: 'Macadamia', weightG: 180, notes: 'Sliced fresh macadamia', ratio_percent: 1.8 },
    { name: 'Liquorice', weightG: 100, notes: 'Liquorice root', ratio_percent: 1.0 },
    { name: 'Cardamon', weightG: 180, notes: 'a', ratio_percent: 1.8 },
    { name: 'Chamomile', weightG: 90, notes: 'a', ratio_percent: 0.9 }
  ],
  totalBotanicals_g: 10160,
  totalBotanicals_percent: 100.0,
  botanicalsPerLAL: 20.2,

  runData: [
    {
      time: '11:15 AM',
      phase: 'Foreshots',
      volume_L: 2.0,
      abv_percent: 85.0,
      condenserTemp_C: 35,
      lal: 1.7,
      observations: '35A'
    },
    {
      time: '11:30 AM',
      phase: 'Heads',
      volume_L: 10.0,
      abv_percent: 84.8,
      condenserTemp_C: 35,
      lal: 8.5,
      observations: '35A'
    },
    {
      time: '05:30 PM',
      phase: 'Middle Run (Hearts) – Part 1',
      volume_L: 185.0,
      abv_percent: 83.0,
      observations: 'Distilling at 30A'
    },
    {
      time: '06:30 AM (05/03/25)',
      phase: 'Middle Run (Hearts) – Part 2',
      volume_L: 306.0,
      abv_percent: 82.0,
      observations: 'Distilling at 30A, stopped at 79.9%'
    },
    {
      phase: 'Tails',
      volume_L: 220.0,
      abv_percent: 81.0,
      observations: 'Kept aside for vodka redistillation'
    }
  ],

  totalRun: {
    volume_L: 538.0,
    abv_percent: 82.0,
    lal: 503.0,
    notes: 'Total recovered 538 L @ ~82% ABV across two-day run. 220 L tails set aside for vodka.'
  },

  notes: 'Two-day Navy Strength Gin run with 14-hour steeping. Main hearts collected at 82% ABV, diluted to 59.1% for bottling. 220 L tails kept for vodka re-distillation.'
} satisfies DistillationSession

// Export the enhanced session with calculated metrics
export const spiritGinNS018Distillation = VodkaDistillationCalculator.enhanceSession(baseSpiritGinNS018Distillation)

// Export the bulletproof schema data
export { spiritGinNS018BulletproofData }

export default spiritGinNS018Distillation
