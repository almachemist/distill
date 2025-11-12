// merchant-mae-gin-distillation.session.ts
import { DistillationSession } from '../types/distillation-session.types'
import { DISTILLATION_CONSTANTS } from '../constants/distillation.constants'

export const merchantMaeGinDistillation: DistillationSession = {
  id: "SPIRIT-GIN-MM-002",
  spiritRun: "SPIRIT-GIN-MM-002",
  sku: "Merchant Mae Gin",
  description: "Merchant Mae Gin 002 - Production batch",
  date: "2025-03-11",
  still: "Carrie",
  boilerOn: "06:00",
  chargeVolumeL: 1000,
  chargeABV: 53.5,
  lalIn: 535.0,
  powerA: 35,
  steepingHours: 14,
  elementsKW: 32,
  distillationHours: 10,

  charge: {
    components: [
      {
        source: "Ethanol (Manildra NC96)",
        volume_L: 500,
        abv_percent: 96.0,
        lal: 480.0,
        type: "ethanol"
      },
      {
        source: "Filtered Water",
        volume_L: 500,
        abv_percent: 0.0,
        lal: 0.0,
        type: "dilution"
      }
    ],
    total: {
      volume_L: 1000,
      abv_percent: 53.5,
      lal: 535.0
    }
  },

  stillSetup: {
    elements: "35 A on at 08:15 AM",
    steeping: "14 hours (Juniper, Coriander)",
    plates: "Zero plates",
    options: "Standard run"
  },

  botanicals: [
    { name: "Juniper", weightG: 6400, notes: "Crushed / steeped", ratio_percent: 63.0, status: "ok" },
    { name: "Coriander", weightG: 1800, notes: "Steeped", ratio_percent: 17.7, status: "ok" },
    { name: "Angelica", weightG: 180, ratio_percent: 1.8, status: "ok" },
    { name: "Orris Root", weightG: 90, ratio_percent: 0.9, status: "ok" },
    { name: "Orange", weightG: 380, notes: "navel rind", ratio_percent: 3.7, status: "ok" },
    { name: "Lemon", weightG: 380, notes: "fresh rind", ratio_percent: 3.7, status: "ok" },
    { name: "Finger Lime", weightG: 380, ratio_percent: 3.7, status: "ok" },
    { name: "Macadamia", weightG: 180, ratio_percent: 1.8, status: "ok" },
    { name: "Liquorice Root", weightG: 100, ratio_percent: 1.0, status: "ok" },
    { name: "Cardamom", weightG: 180, ratio_percent: 1.8, status: "ok" },
    { name: "Chamomile", weightG: 90, ratio_percent: 0.9, status: "ok" },
  ],

  totalBotanicals_g: 10160,
  totalBotanicals_percent: 100.0,
  botanicalsPerLAL: 20.5,

  runData: [
    {
      time: "10:55",
      phase: "Foreshots",
      volume_L: 2.0,
      volume_percent: 0.8,
      abv_percent: 85.0,
      lal: 1.7,
      observations: "35A"
    },
    {
      time: "11:20",
      phase: "Heads",
      volume_L: 10.0,
      volume_percent: 3.9,
      abv_percent: 83.5,
      lal: 8.2,
      observations: "33A"
    },
    {
      time: null,
      phase: "Hearts",
      volume_L: 230.0,
      abv_percent: 82.0,
      lal: 188.6,
      observations: "Main hearts"
    }
  ],

  totalRun: {
    volume_L: 462.0,
    volume_percent: 92.4,
    abv_percent: null,
    lal: null,
    notes: "Totals stated as per sheet"
  },

  outputs: [
    { 
      name: "Foreshots", 
      volumeL: 2.0, 
      abv: 85.0, 
      lal: 1.7, 
      vessel: "Discarded 20L Waste",
      observations: "Discarded"
    },
    { 
      name: "Heads", 
      volumeL: 10.0, 
      abv: 83.5, 
      lal: 8.2, 
      vessel: "FEINTS-GIN-MIX IBC-01",
      observations: "Saved for redistillation"
    },
    { 
      name: "Hearts", 
      volumeL: 230.0, 
      abv: 82.0, 
      lal: 188.6, 
      vessel: "GIN-NS-0017 VC-230",
      observations: "Main hearts"
    },
    { 
      name: "Tails", 
      volumeL: 220.0, 
      abv: 80.0, 
      lal: 0.0, 
      vessel: "FEINTS-GIN-MIX IBC-01",
      observations: "Saved for vodka redistillation"
    },
  ],

  dilutions: [
    { 
      stepNo: 1, 
      newMakeL: 230.0, 
      waterL: 120.0, 
      finalVolumeL: 350.0, 
      finalABV: 60.0,
      notes: "Initial dilution"
    },
    { 
      stepNo: 2, 
      newMakeL: 350.0, 
      waterL: 0.0, 
      finalVolumeL: 350.0, 
      finalABV: 59.0,
      notes: "Fine adjustment to target ABV"
    },
  ],

  finalOutput: {
    totalVolume_L: 350.0,
    abv_percent: 59.0,
    lal: 188.6,
    notes: "Final Merchant Mae Gin blend at 59.0% ABV"
  },

  notes: "Merchant Mae Gin 002 - Production batch. Balanced botanical profile with dominant juniper and coriander. Includes finger lime and macadamia botanicals."
}



