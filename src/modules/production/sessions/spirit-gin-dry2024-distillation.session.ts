import type { DistillationSession } from '../types/distillation-session.types'
import { VodkaDistillationCalculator } from '../services/vodka-distillation-calculator.service'
import { type Batch, generateUUID } from '@/types/schema'

// Complete SPIRIT-GIN-DRY-2024 data in bulletproof schema format
const spiritGinDry2024BulletproofData: Batch = {
  spiritRunId: "SPIRIT-GIN-DRY-2024",
  sku: "Oaks Kitchen Gin – Dry Season",
  description: "Seasonal gin collaboration distilled on Carrie still with Thai botanicals and local citrus. Steeped overnight, single run.",
  date: "2024-12-02",
  boilerStartTime: "08:00 AM",
  boilerOn: "08:00 AM",
  stillUsed: "Carrie",

  chargeAdjustment: {
    components: [
      {
        id: generateUUID(),
        source: "Manildra NC96",
        volume_L: 1000,
        abv_percent: 50.0,
        lal: 500.0,
        type: "ethanol",
        expected_percent: null
      },
      {
        id: generateUUID(),
        source: "Filtered Water",
        volume_L: 0,
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
      abv_percent: 50.0,
      lal: 500.0
    }
  },

  stillSetup: {
    elements: "2 heating elements; no preheat day before",
    steeping: "None recorded",
    plates: "None",
    options: "Standard run"
  },

  botanicals: [
    { id: generateUUID(), name: "Juniper berries", notes: "", weight_g: 6250, ratio_percent: 41.9, status: 'ok' },
    { id: generateUUID(), name: "Coriander seed", notes: "", weight_g: 625, ratio_percent: 4.2, status: 'ok' },
    { id: generateUUID(), name: "Angelica", notes: "", weight_g: 167, ratio_percent: 1.1, status: 'ok' },
    { id: generateUUID(), name: "Cardamon", notes: "", weight_g: 83, ratio_percent: 0.6, status: 'ok' },
    { id: generateUUID(), name: "Lemongrass", notes: "", weight_g: 1167, ratio_percent: 7.8, status: 'ok' },
    { id: generateUUID(), name: "Mandarin", notes: "Whole fruit", weight_g: 1667, ratio_percent: 11.2, status: 'ok' },
    { id: generateUUID(), name: "Mandarin skin", notes: "", weight_g: 1200, ratio_percent: 8.0, status: 'ok' },
    { id: generateUUID(), name: "Turmeric", notes: "Fresh", weight_g: 500, ratio_percent: 3.3, status: 'ok' },
    { id: generateUUID(), name: "Rosella flower", notes: "Dried petals", weight_g: 1667, ratio_percent: 11.2, status: 'ok' },
    { id: generateUUID(), name: "Holy basil", notes: "", weight_g: 167, ratio_percent: 1.1, status: 'ok' },
    { id: generateUUID(), name: "Thai basil", notes: "", weight_g: 1000, ratio_percent: 6.7, status: 'ok' },
    { id: generateUUID(), name: "Kaffir lime leaf", notes: "Fresh leaves", weight_g: 333, ratio_percent: 2.2, status: 'ok' }
  ],
  totalBotanicals_g: 14933,
  totalBotanicals_percent: 100.0,
  botanicalsPerLAL: 29.9,

  runData: [
    {
      time: "10:55 AM",
      phase: "Foreshots",
      volume_L: 2.0,
      abv_percent: 87.0,
      lal: 1.7,
      observations: "Discarded"
    },
    {
      time: "11:15 AM",
      phase: "Heads",
      volume_L: 12.0,
      abv_percent: 81.6,
      lal: 9.8,
      observations: "Feints"
    },
    {
      time: "04:00 PM",
      phase: "Middle Run (Hearts) – Part 1",
      volume_L: 199.0,
      abv_percent: 81.4,
      lal: 162.0,
      observations: "Main hearts run"
    },
    {
      phase: "Middle Run (Hearts) – Adjustment",
      volume_L: 0.0,
      abv_percent: null,
      lal: null,
      observations: "Suggested to add 205 L water for next run"
    },
    {
      time: "07:00 AM (Next Day)",
      phase: "Tails",
      volume_L: 100.0,
      abv_percent: 78.0,
      lal: null,
      observations: "Kept for future distillations"
    }
  ],

  totalRun: {
    volume_L: 313.0,
    abv_percent: 80.0,
    lal: 168.0,
    notes: "Foreshots, heads, hearts and tails combined. Late tails retained."
  },

  output: [
    {
      phase: "Foreshots",
      output: "Discarded",
      receivingVessel: "20 L Waste",
      volume_L: 2.0,
      volume_percent: null,
      abv_percent: 87.0,
      lal: 1.7
    },
    {
      phase: "Heads",
      output: "Feints",
      receivingVessel: "IBC-0x",
      volume_L: 12.0,
      volume_percent: null,
      abv_percent: 81.6,
      lal: 9.8
    },
    {
      phase: "Hearts",
      output: "Oaks Kitchen Dry Season Gin",
      receivingVessel: "VC-400",
      volume_L: 199.0,
      volume_percent: null,
      abv_percent: 81.4,
      lal: 162.0
    },
    {
      phase: "Tails",
      output: "Feints",
      receivingVessel: "IBC-0x",
      volume_L: 100.0,
      volume_percent: null,
      abv_percent: 78.0,
      lal: 0.0
    }
  ],

  dilutions: [
    {
      id: generateUUID(),
      number: 1,
      date: "2025-01-05",
      newMake_L: 199.0,
      filteredWater_L: 20.0,
      ethanolAdded: null,
      newVolume_L: 219.0,
      abv_percent: 41.3,
      lal: null,
      finalAbv_percent: null,
      notes: "First dilution to bottling range"
    },
    {
      id: generateUUID(),
      number: 2,
      date: "2025-01-05",
      newMake_L: 219.0,
      filteredWater_L: 5.0,
      ethanolAdded: null,
      newVolume_L: 224.0,
      abv_percent: 40.0,
      lal: null,
      finalAbv_percent: null,
      notes: "Fine adjustment to final strength"
    }
  ],

  finalOutput: {
    totalVolume_L: 224.0,
    abv_percent: 40.0,
    lal: null,
    notes: "Final Dry Season Gin blend at 40% ABV."
  },

  notes: "Oaks Kitchen Dry Season Gin distilled on Carrie still using tropical Thai botanicals. Balanced lemongrass, rosella, and citrus notes; tails kept for future runs."
} satisfies DistillationSession

// Export the enhanced session with calculated metrics
export const spiritGinDry2024Distillation = VodkaDistillationCalculator.enhanceSession(spiritGinDry2024BulletproofData)

// Export the bulletproof schema data
export { spiritGinDry2024BulletproofData }

export default spiritGinDry2024Distillation

