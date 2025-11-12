// merchant-mae-gin-001-distillation.session.ts
import { DistillationSession } from '../types/distillation-session.types'
import { DISTILLATION_CONSTANTS } from '../constants/distillation.constants'

export const merchantMaeGin001Distillation: DistillationSession = {
  id: "SPIRIT-GIN-MM-001",
  spiritRun: "SPIRIT-GIN-MM-001",
  sku: "Merchant Mae Gin",
  description: "Merchant Mae Gin 001 - Initial production batch",
  date: "2024-12-01",
  still: "Carrie",
  boilerOn: "06:30",
  chargeVolumeL: 1000,
  chargeABV: 55.0,
  lalIn: 550.0,
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
      },
      {
        source: "Saltwater",
        volume_L: 0,
        abv_percent: 0.0,
        lal: 0.0,
        type: "other"
      }
    ],
    total: {
      volume_L: 1000,
      abv_percent: 55.0,
      lal: 550.0
    }
  },

  stillSetup: {
    elements: "5750W, 2200W",
    steeping: "14 hours (Juniper, Coriander)",
    plates: "None",
    options: "Standard run"
  },

  botanicals: [
    { name: "Juniper", weightG: 6400, notes: "Crushed / steeped", ratio_percent: 67.4, status: "ok" },
    { name: "Coriander", weightG: 1800, notes: "Steeped", ratio_percent: 19.0, status: "ok" },
    { name: "Angelica", weightG: 180, ratio_percent: 1.9, status: "ok" },
    { name: "Orris Root", weightG: 50, ratio_percent: 0.5, status: "ok" },
    { name: "Orange", weightG: 380, notes: "fresh navel rind", ratio_percent: 4.0, status: "ok" },
    { name: "Lemon", weightG: 380, notes: "fresh rind", ratio_percent: 4.0, status: "ok" },
    { name: "Liquorice root", weightG: 100, ratio_percent: 1.1, status: "ok" },
    { name: "Cardamon", weightG: 150, ratio_percent: 1.6, status: "ok" },
    { name: "Chamomile", weightG: 50, ratio_percent: 0.5, status: "ok" },
  ],

  totalBotanicals_g: 9490,
  totalBotanicals_percent: 100.0,
  botanicalsPerLAL: 17.3,

  runData: [
    {
      time: "09:30",
      phase: "Foreshots",
      volume_L: 2.0,
      volume_percent: 0.8,
      abv_percent: 85.2,
      density: 0.829,
      lal: 1.7,
      observations: "Marked 'Foreshots 2.0L' early in run"
    },
    {
      time: "09:50",
      phase: "Heads",
      volume_L: 10.0,
      volume_percent: 3.9,
      abv_percent: 83.0,
      density: 0.839,
      lal: 8.3,
      observations: "Sheet displayed '#REF!' in one column"
    },
    {
      time: null,
      phase: "Hearts",
      volume_L: 242.0,
      abv_percent: 80.9,
      lal: 195.9,
      observations: "Main hearts collection. Instruction: 'To dilute add 280 L H2O'"
    }
  ],

  totalRun: {
    volume_L: 254.0,
    volume_percent: 98.6,
    abv_percent: null,
    lal: null,
    notes: "Totals block shows multiple '#REF!' cells in source"
  },

  outputs: [
    { 
      name: "Foreshots", 
      volumeL: 2.0, 
      abv: 85.2, 
      lal: 1.7, 
      vessel: "Waste",
      observations: "Discarded (20L Waste)"
    },
    { 
      name: "Heads", 
      volumeL: 10.0, 
      abv: 83.0, 
      lal: 8.3, 
      vessel: "FEINTS-GIN-001 (IBC-01)",
      observations: "Saved for redistillation"
    },
    { 
      name: "Hearts", 
      volumeL: 242.0, 
      abv: 80.9, 
      lal: 195.9, 
      vessel: "GIN-NS-0016 (VC-400)",
      observations: "Main hearts collection"
    },
    { 
      name: "Tails", 
      volumeL: 0, 
      abv: 0, 
      lal: 0, 
      vessel: "FEINTS-GIN-001 (IBC-01)",
      observations: "Tails volume not specified in source"
    },
  ],

  dilutions: [
    { 
      stepNo: 1, 
      newMakeL: 242.0, 
      waterL: 280.0, 
      finalVolumeL: 522.0, 
      finalABV: 37.5,
      lal: 195.9,
      notes: "Initial dilution to bottling strength. Sheet shows '37.5% x litres required overall'"
    },
    { 
      stepNo: 2, 
      newMakeL: 522.0, 
      waterL: 0.0, 
      finalVolumeL: 522.0, 
      finalABV: 37.5,
      lal: 195.9,
      notes: "No additional water added"
    },
  ],

  finalOutput: {
    totalVolume_L: 522.0,
    abv_percent: 37.5,
    lal: 195.9,
    notes: "Final Merchant Mae Gin blend at 37.5% ABV"
  },

  notes: "Merchant Mae Gin 001 - Initial production batch. Balanced botanical profile with dominant juniper and coriander. Some data integrity issues noted in source spreadsheet with #REF! errors."
}



