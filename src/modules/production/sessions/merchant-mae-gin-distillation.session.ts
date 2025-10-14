// merchant-mae-gin-distillation.session.ts
import { DistillationSession } from '../types/distillation-session.types'
import { DISTILLATION_CONSTANTS } from '../constants/distillation.constants'

export const merchantMaeGinDistillation: DistillationSession = {
  id: "SPIRIT-GIN-MM-002",
  spiritRun: "SPIRIT-GIN-MM-002",
  sku: "Merchant Mae Gin",
  date: "2025-10-14",
  still: "Carrie",
  boilerOn: "06:30",
  ethanolBatch: "ena-133809",
  chargeVolumeL: 1000,
  chargeABV: 47.9,
  lalIn: 479.0, // 1000 L x 0.479
  powerA: 35,
  steepingHours: 14,
  elementsKW: 32,
  distillationHours: 10,

  charge: {
    components: [
      {
        source: "Manildra NC96",
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

  botanicals: [
    { name: "Juniper", weightG: 6400, notes: "Crushed / steeped", ratio_percent: 67.4, status: "ok" },
    { name: "Coriander", weightG: 1800, notes: "Steeped", ratio_percent: 19.0, status: "ok" },
    { name: "Angelica", weightG: 180, ratio_percent: 1.9, status: "ok" },
    { name: "Orris Root", weightG: 50, ratio_percent: 0.5, status: "ok" },
    { name: "Orange", weightG: 380, notes: "8 fresh naval orange rind", ratio_percent: 4.0, status: "ok" },
    { name: "Lemon", weightG: 380, notes: "12 fresh lemon rind", ratio_percent: 4.0, status: "ok" },
    { name: "Liquorice", weightG: 100, notes: "Liquorice root", ratio_percent: 1.1, status: "pending" },
    { name: "Cardamon", weightG: 150, ratio_percent: 1.6, status: "ok" },
    { name: "Chamomile", weightG: 50, ratio_percent: 0.5, status: "ok" },
  ],

  totalBotanicals_g: 9490,
  totalBotanicals_percent: 100.0,

  outputs: [
    { 
      name: "Foreshots", 
      volumeL: 2, 
      abv: 89, 
      lal: 1.78, 
      vessel: "Discarded",
      observations: "Discarded - too volatile"
    },
    { 
      name: "Heads", 
      volumeL: 12, 
      abv: 86.7, 
      lal: 10.40, 
      vessel: "FEINTS-GIN-001",
      observations: "Saved for redistillation"
    },
    { 
      name: "Hearts", 
      volumeL: 332, 
      abv: 82.4, 
      lal: 273.57, 
      vessel: "GIN-NS-0016",
      observations: "Premium gin hearts"
    },
    { 
      name: "Tails", 
      volumeL: 149, 
      abv: 88.2, 
      lal: 131.42, 
      vessel: "FEINTS-GIN-001",
      observations: "Saved for redistillation"
    },
  ],

  dilutions: [
    { 
      stepNo: 1, 
      newMakeL: 332, 
      waterL: 390, 
      finalVolumeL: 722, 
      finalABV: 39,
      notes: "Initial dilution to bottling strength"
    },
    { 
      stepNo: 2, 
      newMakeL: 722, 
      waterL: 7, 
      finalVolumeL: 729, 
      finalABV: 37.5,
      notes: "Fine adjustment to target ABV"
    },
  ],

  notes: "Gin batch using fresh citrus rinds and chamomile. Balanced botanical profile with dominant juniper and coriander."
}

// Additional example sessions for other gins
export const rainforestGinDistillation: DistillationSession = {
  id: "SPIRIT-GIN-RF-001",
  spiritRun: "SPIRIT-GIN-RF-001",
  sku: "Rainforest Gin",
  date: "2025-03-10",
  still: "Carrie",
  boilerOn: "07:00",
  ethanolBatch: "ena-133809",
  chargeVolumeL: 1000,
  chargeABV: 50,
  lalIn: 500, // 1000 L x 0.50
  powerA: 28,
  steepingHours: 12,
  elementsKW: 32,
  distillationHours: 8,

  botanicals: [
    { name: "Juniper", weightG: 6250, notes: "Organic" },
    { name: "Lavender", weightG: 250, notes: "Organic" },
    { name: "Liquorice Root", weightG: 84, notes: "Organic" },
    { name: "Cardamon", weightG: 84, notes: "Organic" },
    { name: "Lemon Myrtle", weightG: 250, notes: "Fresh" },
    { name: "Angelica", weightG: 168, notes: "Organic" },
  ],

  outputs: [
    { 
      name: "Foreshots", 
      volumeL: 2, 
      abv: 88, 
      lal: 1.76, 
      vessel: "Discarded"
    },
    { 
      name: "Heads", 
      volumeL: 10, 
      abv: 85, 
      lal: 8.50, 
      vessel: "FEINTS-GIN-002"
    },
    { 
      name: "Hearts", 
      volumeL: 250, 
      abv: 80, 
      lal: 200.00, 
      vessel: "GIN-RF-001"
    },
    { 
      name: "Tails", 
      volumeL: 120, 
      abv: 75, 
      lal: 90.00, 
      vessel: "FEINTS-GIN-002"
    },
  ],

  notes: "Rainforest Gin distillation - Carrie still. 12h steeping, 8h distillation."
}

export const signatureDryGinDistillation: DistillationSession = {
  id: "SPIRIT-GIN-SD-001",
  spiritRun: "SPIRIT-GIN-SD-001",
  sku: "Signature Dry Gin",
  date: "2025-03-08",
  still: "Carrie",
  boilerOn: "06:45",
  ethanolBatch: "ena-133809",
  chargeVolumeL: 1000,
  chargeABV: 50,
  lalIn: 500, // 1000 L x 0.50
  powerA: 30,
  steepingHours: 16,
  elementsKW: 32,
  distillationHours: 9,

  botanicals: [
    { name: "Juniper", weightG: 6400, notes: "Organic" },
    { name: "Coriander", weightG: 1800, notes: "Organic" },
    { name: "Angelica", weightG: 180, notes: "Organic" },
    { name: "Orris Root", weightG: 90, notes: "Organic" },
    { name: "Orange Peel", weightG: 380, notes: "Fresh" },
    { name: "Lemon Peel", weightG: 380, notes: "Fresh" },
    { name: "Liquorice Root", weightG: 100, notes: "Organic" },
    { name: "Cardamon", weightG: 180, notes: "Organic" },
  ],

  outputs: [
    { 
      name: "Foreshots", 
      volumeL: 2, 
      abv: 89, 
      lal: 1.78, 
      vessel: "Discarded"
    },
    { 
      name: "Heads", 
      volumeL: 12, 
      abv: 86, 
      lal: 10.32, 
      vessel: "FEINTS-GIN-003"
    },
    { 
      name: "Hearts", 
      volumeL: 280, 
      abv: 81, 
      lal: 226.80, 
      vessel: "GIN-SD-001"
    },
    { 
      name: "Tails", 
      volumeL: 140, 
      abv: 78, 
      lal: 109.20, 
      vessel: "FEINTS-GIN-003"
    },
  ],

  notes: "Signature Dry Gin distillation - Carrie still. 16h steeping, 9h distillation."
}



