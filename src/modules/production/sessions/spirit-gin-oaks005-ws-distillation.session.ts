import type { DistillationSession } from '../types/distillation-session.types'
import { VodkaDistillationCalculator } from '../services/vodka-distillation-calculator.service'
import { type Batch, generateUUID } from '@/types/schema'

// Complete SPIRIT-GIN-OAKS-005-WS data in bulletproof schema format
const spiritGinOaks005WsBulletproofData: Batch = {
  spiritRunId: "SPIRIT-GIN-OAKS-005-WS",
  sku: "Wet Season",
  description: "Wet Season Gin Oaks Kitchen 005",
  date: "2024-05-13",
  boilerStartTime: "06:10",
  boilerOn: "06:10",
  stillUsed: "Carrie",

  chargeAdjustment: {
    components: [
      {
        id: generateUUID(),
        source: "Ethanol Manildra NC96",
        volume_L: 500,
        abv_percent: 50.0,
        lal: 250.0,
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
      abv_percent: 25.0,
      lal: 250.0
    }
  },

  stillSetup: {
    elements: null,
    steeping: null,
    plates: null,
    options: null
  },

  botanicals: [
    { id: generateUUID(), name: "Juniper Crushed / steeped", notes: "ok", weight_g: 6250, ratio_percent: 62.6, status: "ok" },
    { id: generateUUID(), name: "Sawtooth Coriander Leaves - Steeped", notes: "", weight_g: 625, ratio_percent: 6.3, status: null },
    { id: generateUUID(), name: "Angelica", notes: "ok", weight_g: 168, ratio_percent: 1.7, status: "ok" },
    { id: generateUUID(), name: "Holy Basil Leaves & Flowers", notes: "", weight_g: 252, ratio_percent: 2.5, status: null },
    { id: generateUUID(), name: "Thai Sweet Basil Leaves only", notes: "", weight_g: 168, ratio_percent: 1.7, status: null },
    { id: generateUUID(), name: "Kaffir Fruit Rind", notes: "", weight_g: 832, ratio_percent: 8.3, status: null },
    { id: generateUUID(), name: "Kaffir Leaves", notes: "", weight_g: 500, ratio_percent: 5.0, status: null },
    { id: generateUUID(), name: "Thai Marigolds", notes: "", weight_g: 332, ratio_percent: 3.3, status: null },
    { id: generateUUID(), name: "Galangal Smashed", notes: "", weight_g: 332, ratio_percent: 3.3, status: null },
    { id: generateUUID(), name: "Lemon Grass Bashed", notes: "", weight_g: 252, ratio_percent: 2.5, status: null },
    { id: generateUUID(), name: "Liquorice Root", notes: "ok", weight_g: 84, ratio_percent: 0.8, status: "ok" },
    { id: generateUUID(), name: "Cardamom", notes: "ok", weight_g: 84, ratio_percent: 0.8, status: "ok" },
    { id: generateUUID(), name: "Pandanas (Thai Vanilla)", notes: "", weight_g: 108, ratio_percent: 1.1, status: null }
  ],
  totalBotanicals_g: 9988,
  totalBotanicals_percent: 100.0,
  botanicalsPerLAL: 39.9,

  runData: [
    {
      id: generateUUID(),
      time: "09:20",
      phase: "Foreshots",
      volume_L: 2.5,
      volume_percent: 0.0,
      vcTankVolume_L: null,
      abv_percent: 86.0,
      density: null,
      ambientTemp_C: null,
      headTemp_C: null,
      condenserTemp_C: null,
      lal: 2.2,
      observations: "35A",
      notes: null
    },
    {
      id: generateUUID(),
      time: "09:40",
      phase: "Heads",
      volume_L: 10.0,
      volume_percent: 0.0,
      vcTankVolume_L: null,
      abv_percent: 82.0,
      density: null,
      ambientTemp_C: null,
      headTemp_C: null,
      condenserTemp_C: null,
      lal: 8.2,
      observations: "33A",
      notes: null
    },
    {
      id: generateUUID(),
      time: "16:00",
      phase: "Middle Run (Hearts) – Part 1",
      volume_L: 236.0,
      volume_percent: null,
      vcTankVolume_L: null,
      abv_percent: 80.9,
      density: null,
      ambientTemp_C: null,
      headTemp_C: null,
      condenserTemp_C: null,
      lal: 190.9,
      observations: "30A",
      notes: null
    },
    {
      id: generateUUID(),
      time: "07:00",
      phase: "Tails",
      volume_L: 226.0,
      volume_percent: null,
      vcTankVolume_L: null,
      abv_percent: 81.0,
      density: null,
      ambientTemp_C: null,
      headTemp_C: null,
      condenserTemp_C: null,
      lal: 0.0,
      observations: "Late tails — keep aside for future vodka",
      notes: null
    }
  ],

  totalRun: {
    volume_L: 474.0,
    volume_percent: 96.0,
    abv_percent: null,
    lal: 0.0,
    notes: "Sheet listed Total Run LAL as 0.0"
  },

  output: [
    {
      id: generateUUID(),
      phase: "Foreshots",
      output: "Discarded",
      receivingVessel: "Discarded 20L Waste",
      volume_L: 2.0,
      volume_percent: 0.8,
      abv_percent: 83.0,
      lal: null
    },
    {
      id: generateUUID(),
      phase: "Heads",
      output: "Feints",
      receivingVessel: "FEINTS-GIN-MIX IBC-01",
      volume_L: 10.0,
      volume_percent: null,
      abv_percent: 83.0,
      lal: null
    },
    {
      id: generateUUID(),
      phase: "Hearts",
      output: "Wet Season Gin",
      receivingVessel: "GIN-NS-0018 VC-400",
      volume_L: 236.0,
      volume_percent: null,
      abv_percent: 80.9,
      lal: null
    },
    {
      id: generateUUID(),
      phase: "Tails",
      output: "Feints",
      receivingVessel: "FEINTS-GIN-MIX IBC-01",
      volume_L: 226.0,
      volume_percent: null,
      abv_percent: 81.0,
      lal: 0.0
    }
  ],

  dilutions: [
    {
      id: generateUUID(),
      number: 1,
      date: "2025-03-17",
      newMake_L: 236.0,
      filteredWater_L: 218.0,
      ethanolAdded: null,
      newVolume_L: 454.0,
      abv_percent: 42.8,
      lal: null,
      finalAbv_percent: null,
      notes: ""
    },
    {
      id: generateUUID(),
      number: 2,
      date: "2025-03-17",
      newMake_L: 454.0,
      filteredWater_L: 2.0,
      ethanolAdded: null,
      newVolume_L: 456.0,
      abv_percent: 42.0,
      lal: null,
      finalAbv_percent: null,
      notes: ""
    }
  ],

  finalOutput: {
    totalVolume_L: 456.0,
    abv_percent: 42.0,
    lal: null,
    notes: "Final Wet Season Gin blend at 42% ABV."
  },

  notes: "Wet Season Gin Oaks Kitchen 005 distilled on Carrie still. Late tails kept for future vodka."
}

// Convert bulletproof data to legacy format for compatibility
const baseSpiritGinOaks005WsDistillation = {
  id: 'SPIRIT-GIN-OAKS-005-WS',
  sku: 'Wet Season',
  description: 'Wet Season Gin Oaks Kitchen 005',
  date: '2024-05-13',
  still: 'Carrie',
  boilerOn: '06:10',
  chargeLAL: 250.0,
  chargeVolumeL: 1000,
  chargeABV: 25.0,
  powerA: 35,
  elementsKW: 32,
  
  charge: {
    components: [
      {
        source: 'Ethanol Manildra NC96',
        volume_L: 500,
        abv_percent: 50.0,
        lal: 250.0,
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
      abv_percent: 25.0,
      lal: 250.0
    }
  },

  stillSetup: {
    elements: null,
    steeping: null,
    plates: null,
    options: null
  },

  botanicals: [
    { name: 'Juniper Crushed / steeped', weightG: 6250, notes: 'ok', ratio_percent: 62.6, status: 'ok' },
    { name: 'Sawtooth Coriander Leaves - Steeped', weightG: 625, notes: '', ratio_percent: 6.3 },
    { name: 'Angelica', weightG: 168, notes: 'ok', ratio_percent: 1.7, status: 'ok' },
    { name: 'Holy Basil Leaves & Flowers', weightG: 252, notes: '', ratio_percent: 2.5 },
    { name: 'Thai Sweet Basil Leaves only', weightG: 168, notes: '', ratio_percent: 1.7 },
    { name: 'Kaffir Fruit Rind', weightG: 832, notes: '', ratio_percent: 8.3 },
    { name: 'Kaffir Leaves', weightG: 500, notes: '', ratio_percent: 5.0 },
    { name: 'Thai Marigolds', weightG: 332, notes: '', ratio_percent: 3.3 },
    { name: 'Galangal Smashed', weightG: 332, notes: '', ratio_percent: 3.3 },
    { name: 'Lemon Grass Bashed', weightG: 252, notes: '', ratio_percent: 2.5 },
    { name: 'Liquorice Root', weightG: 84, notes: 'ok', ratio_percent: 0.8, status: 'ok' },
    { name: 'Cardamom', weightG: 84, notes: 'ok', ratio_percent: 0.8, status: 'ok' },
    { name: 'Pandanas (Thai Vanilla)', weightG: 108, notes: '', ratio_percent: 1.1 }
  ],
  totalBotanicals_g: 9988,
  totalBotanicals_percent: 100.0,
  botanicalsPerLAL: 39.9,

  runData: [
    {
      time: '09:20',
      phase: 'Foreshots',
      volume_L: 2.5,
      abv_percent: 86.0,
      lal: 2.2,
      observations: '35A'
    },
    {
      time: '09:40',
      phase: 'Heads',
      volume_L: 10.0,
      abv_percent: 82.0,
      lal: 8.2,
      observations: '33A'
    },
    {
      time: '16:00',
      phase: 'Middle Run (Hearts) – Part 1',
      volume_L: 236.0,
      abv_percent: 80.9,
      lal: 190.9,
      observations: '30A'
    },
    {
      time: '07:00',
      phase: 'Tails',
      volume_L: 226.0,
      abv_percent: 81.0,
      lal: 0.0,
      observations: 'Late tails — keep aside for future vodka'
    }
  ],

  totalRun: {
    volume_L: 474.0,
    volume_percent: 96.0,
    abv_percent: null,
    lal: 0.0,
    notes: 'Sheet listed Total Run LAL as 0.0'
  },

  outputs: [
    {
      phase: 'Foreshots',
      output: 'Discarded',
      receivingVessel: 'Discarded 20L Waste',
      volume_L: 2.0,
      volume_percent: 0.8,
      abv_percent: 83.0,
      lal: null
    },
    {
      phase: 'Heads',
      output: 'Feints',
      receivingVessel: 'FEINTS-GIN-MIX IBC-01',
      volume_L: 10.0,
      volume_percent: null,
      abv_percent: 83.0,
      lal: null
    },
    {
      phase: 'Hearts',
      output: 'Wet Season Gin',
      receivingVessel: 'GIN-NS-0018 VC-400',
      volume_L: 236.0,
      volume_percent: null,
      abv_percent: 80.9,
      lal: null
    },
    {
      phase: 'Tails',
      output: 'Feints',
      receivingVessel: 'FEINTS-GIN-MIX IBC-01',
      volume_L: 226.0,
      volume_percent: null,
      abv_percent: 81.0,
      lal: 0.0
    }
  ],

  dilutions: [
    {
      number: 1,
      date: '2025-03-17',
      newMake_L: 236.0,
      filteredWater_L: 218.0,
      newVolume_L: 454.0,
      abv_percent: 42.8,
      lal: null,
      finalAbv_percent: null,
      notes: ''
    },
    {
      number: 2,
      date: '2025-03-17',
      newMake_L: 454.0,
      filteredWater_L: 2.0,
      newVolume_L: 456.0,
      abv_percent: 42.0,
      lal: null,
      finalAbv_percent: null,
      notes: ''
    }
  ],

  finalOutput: {
    totalVolume_L: 456.0,
    finalAbv_percent: 42.0,
    lal: null,
    notes: 'Final Wet Season Gin blend at 42% ABV.'
  },

  notes: 'Wet Season Gin Oaks Kitchen 005 distilled on Carrie still. Late tails kept for future vodka.'
} satisfies DistillationSession

// Export the enhanced session with calculated metrics
export const spiritGinOaks005WsDistillation = VodkaDistillationCalculator.enhanceSession(baseSpiritGinOaks005WsDistillation)

// Export the bulletproof schema data
export { spiritGinOaks005WsBulletproofData }

export default spiritGinOaks005WsDistillation




