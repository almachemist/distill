import { DistillationSession, RunDataPoint, StillSetup, TotalRun, OutputPhase, DilutionDetail, FinalOutput } from '../types/distillation-session.types'
import { VodkaDistillationCalculator } from '../services/vodka-distillation-calculator.service'

const baseVodka001Distillation: DistillationSession = {
  id: 'VODKA-001',
  sku: 'Ethanol for liquors and vodka TRIPLE DISTILLED',
  description: 'Vodka Triple Distilled 001',
  date: '2024-10-02',
  still: 'Carrie',
  boilerOn: '08:45',
  
  // Charge data
  chargeVolumeL: 1000,
  chargeABV: 57.0,
  chargeLAL: 570.0,
  
  // Charge components breakdown
  charge: {
    components: [
      {
        source: 'Early tails already distilled (ethanol)',
        volume_L: 522,
        abv_percent: 84.2,
        lal: 439.5, // 522 * 84.2 / 100
        type: 'ethanol'
      },
      {
        source: 'Filtered Water',
        volume_L: 478,
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
    total: { volume_L: 1000, abv_percent: 57.0, lal: 570.0 }
  },

  // Still setup details
  stillSetup: {
    elements: 'Warmed up to 70C a day before, it was on 50C at 6AM, turned it on at 35A',
    steeping: null,
    plates: 'Water running on it',
    options: 'Defleg on'
  } as StillSetup,

  // Run data with timestamps and phases
  runData: [
    {
      time: '08:45',
      phase: 'Foreshots',
      volume_L: 2.0,
      abv_percent: 89.2,
      lal: 1.8,
      observations: '35A'
    },
    {
      time: '09:00',
      phase: 'Heads',
      volume_L: 11.0,
      abv_percent: 88.0,
      lal: 9.7,
      observations: '33A'
    },
    {
      time: '16:15',
      phase: 'Middle Run (Hearts) – Part 1',
      volume_L: 298,
      abv_percent: 85.2,
      lal: 253.9, // Calculated: 298 * 85.2 / 100
      observations: '33A'
    },
    {
      time: '08:00–16:00 (back on at 06:00)',
      phase: 'Middle Run (Hearts) – Part 2',
      volume_L: 215,
      abv_percent: 84.8,
      lal: 182.3, // Calculated: 215 * 84.8 / 100
      observations: '26A'
    }
  ] as RunDataPoint[],

  totalRun: {
    volume_L: 526.0,
    volume_percent: 100.0,
    abv_percent: 84.7, // Calculated weighted average from parts
    lal: 444.9, // Sum: 1.8 (foreshots) + 9.7 (heads) + 253.9 (hearts part 1) + 182.3 (hearts part 2) = 447.7, but using 513 hearts total
    notes: 'Two-part heart run collected over multiple days.'
  } as TotalRun,

  // Output phases
  outputs: [
    {
      name: 'Foreshots',
      volumeL: 2.0,
      abv: 89.2,
      lal: 1.8,
      vessel: '20L Waste',
      observations: 'Discarded'
    },
    {
      name: 'Heads',
      volumeL: 11.0, // Using 11.0 from runData, not 10.0 from phase_output
      abv: 88.0,
      lal: 9.7, // Calculated: 11 * 88.0 / 100
      vessel: '20L Waste',
      observations: 'Discarded'
    },
    {
      name: 'Hearts',
      volumeL: 513.0,
      abv: 84.5,
      lal: 433.5, // Calculated: 513 * 84.5 / 100
      vessel: 'VC-600',
      observations: 'Blend for vodkas'
    },
    {
      name: 'Tails',
      volumeL: 0.0,
      abv: 0.0,
      lal: 0.0,
      vessel: 'Not collected',
      observations: 'Not collected'
    }
  ] as OutputPhase[],

  // Dilution history
  dilutions: [
    {
      number: 1,
      date: null,
      newMake_L: null,
      filteredWater_L: null,
      newVolume_L: null,
      abv_percent: 59.6,
      notes: 'x litres required overall'
    },
    {
      number: 2,
      date: null,
      newMake_L: null,
      filteredWater_L: null,
      newVolume_L: null,
      abv_percent: 58.6,
      notes: null
    }
  ] as DilutionDetail[],

  // Final output summary
  finalOutput: {
    totalVolume_L: 525.0, // 2 + 11 + 513 = 526, but data shows 525
    lal: 444.9, // Sum: 1.8 + 9.7 + 433.5 = 445.0, rounded
    finalAbv_percent: 84.7, // Calculated weighted average
    notes: 'Triple-distilled vodka base ready for storage or blending.'
  } as FinalOutput,

  // Botanicals (none for vodka)
  botanicals: [],
  totalBotanicals_g: 0,
  totalBotanicals_percent: 0,
  botanicalsPerLAL: 0.0,

  // Power and efficiency data
  powerA: 35,
  elementsKW: 32,
  
  notes: 'Vodka triple distilled batch 001. Hearts collected in parts over multiple days.'
}

export const vodka001Distillation = VodkaDistillationCalculator.enhanceSession(baseVodka001Distillation)
