// merchant-mae-gin-003-distillation.session.ts
import { DistillationSession } from '../types/distillation-session.types'
import { DISTILLATION_CONSTANTS } from '../constants/distillation.constants'

export const merchantMaeGin003Distillation: DistillationSession = {
  id: "SPIRIT-GIN-MM-003",
  spiritRun: "SPIRIT-GIN-MM-003",
  sku: "Merchant Mae Gin",
  description: "Merchant Mae Gin 003 - Production batch with whisky helmet configuration",
  date: "2025-10-14",
  still: "Carrie",
  boilerOn: "06:30",
  chargeVolumeL: 1000,
  chargeABV: 47.9,
  lalIn: 479.0,
  powerA: 35,
  steepingHours: 14,
  elementsKW: 32,
  distillationHours: 10,

  charge: {
    components: [
      {
        source: "Ethanol Manildra NC96",
        volume_L: 400,
        abv_percent: 96.0,
        lal: 384.0,
        type: "ethanol"
      },
      {
        source: "Left vodka",
        volume_L: 500,
        abv_percent: 19.0,
        lal: 95.0,
        type: "dilution"
      },
      {
        source: "Water",
        volume_L: 100,
        abv_percent: 0.0,
        lal: 0.0,
        type: "water"
      }
    ],
    total: {
      volume_L: 1000,
      abv_percent: 47.9,
      lal: 479.0
    }
  },

  stillSetup: {
    elements: "35A On 06:30",
    steeping: "14 hours (Juniper, Coriander)",
    plates: "None",
    options: "Whisky helmet, 1 long + 3 short tubes"
  },

  botanicals: [
    { name: "Juniper", weightG: 6400, notes: "Crushed / steeped", ratio_percent: 67.4, status: "ok" },
    { name: "Coriander", weightG: 1800, notes: "Steeped", ratio_percent: 19.0, status: "ok" },
    { name: "Angelica", weightG: 180, ratio_percent: 1.9, status: "ok" },
    { name: "Orris Root", weightG: 50, ratio_percent: 0.5, status: "ok" },
    { name: "Orange", weightG: 380, notes: "8 fresh naval orange rind", ratio_percent: 4.0, status: "ok" },
    { name: "Lemon", weightG: 380, notes: "12 fresh lemon rind", ratio_percent: 4.0, status: "ok" },
    { name: "Liquorice", weightG: 100, notes: "Liquorice root", ratio_percent: 1.1, status: "ok" },
    { name: "Cardamom", weightG: 150, ratio_percent: 1.6, status: "ok" },
    { name: "Chamomile", weightG: 50, ratio_percent: 0.5, status: "ok" },
  ],

  totalBotanicals_g: 9490,
  totalBotanicals_percent: 100.0,
  botanicalsPerLAL: 19.8,

  runData: [
    {
      time: "09:35",
      phase: "Foreshots",
      volume_L: 2.0,
      volume_percent: 2.0,
      abv_percent: 86.5,
      density: 0.825,
      lal: 1.7,
      observations: "33A"
    },
    {
      time: "09:50",
      phase: "Heads",
      volume_L: 10.0,
      volume_percent: 10.0,
      abv_percent: 86.0,
      density: 0.828,
      lal: 8.6,
      observations: "30A"
    },
    {
      time: "17:00",
      phase: "Hearts",
      volume_L: 246.0,
      abv_percent: 81.6,
      lal: 200.7,
      observations: "Main hearts collection"
    }
  ],

  totalRun: {
    volume_L: 504.0,
    volume_percent: 100.0,
    abv_percent: 0.0,
    lal: null,
    notes: "Total Run ABV listed as 0.0 in source"
  },

  outputs: [
    { 
      name: "Foreshots", 
      volumeL: 2.0, 
      abv: 86.5, 
      lal: 1.7, 
      vessel: "Discarded 20L Waste",
      observations: "Discarded"
    },
    { 
      name: "Heads", 
      volumeL: 10.0, 
      abv: 86.0, 
      lal: 8.6, 
      vessel: "IBC-01",
      observations: "Saved for redistillation"
    },
    { 
      name: "Hearts", 
      volumeL: 246.0, 
      abv: 81.6, 
      lal: 200.7, 
      vessel: "GIN-MM-003 VC-615",
      observations: "Premium gin hearts"
    },
    { 
      name: "Tails", 
      volumeL: 246.0, 
      abv: 75.8, 
      lal: 186.5, 
      vessel: "FEINTS-GIN-001 VC-400",
      observations: "Optimum amount of LAL of tails to be distilled"
    },
  ],

  dilutions: [
    { 
      stepNo: 1, 
      newMakeL: 332.0, 
      waterL: 390.0, 
      finalVolumeL: 722.0, 
      finalABV: 39.0,
      notes: "x litres required overall"
    },
    { 
      stepNo: 2, 
      newMakeL: 722.0, 
      waterL: 7.0, 
      finalVolumeL: 729.0, 
      finalABV: 37.5,
      notes: "Fine adjustment to target ABV"
    },
  ],

  finalOutput: {
    totalVolume_L: 729.0,
    abv_percent: 37.5,
    lal: 397.0,
    notes: "Final Merchant Mae Gin blend at 37.5% ABV. LAL check: total_lal_in 384; estimated_perfect_out_percent 84.0; estimated_out_lal 397.534"
  },

  notes: "Merchant Mae Gin 003 - Production batch with whisky helmet configuration (1 long + 3 short tubes). Balanced botanical profile with dominant juniper and coriander."
}




