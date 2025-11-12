import type { DistillationSession } from '../types/distillation-session.types'
import { VodkaDistillationCalculator } from '../services/vodka-distillation-calculator.service'

const baseVodka002 = {
  id: 'VODKA-002',
  sku: 'Ethanol for liquors and vodka TRIPLE DISTILLED',
  description: 'Vodka Triple Distilled 002',
  date: '2025-02-02',
  still: 'Carrie',
  boilerOn: '08:45',
  chargeVolumeL: 1000,
  chargeABV: 57.0,
  chargeLAL: 570.0,
  powerA: 35,
  elementsKW: 32,
  
  charge: {
    components: [
      { source: 'Etanol early tails already distilled', volume_L: 533, abv_percent: 85.0, lal: 453.1, type: 'ethanol' },
      { source: 'Filtered water', volume_L: 477, abv_percent: 0.0, lal: 0.0, type: 'dilution' },
      { source: 'Saltwater', volume_L: null, abv_percent: null, lal: 0.0, type: 'other' }
    ],
    total: { volume_L: 1000, abv_percent: 57.0, lal: 570.0 }
  },

  stillSetup: {
    elements: 'Defleg ligado',
    steeping: null,
    plates: 'Água circulando',
    options: '35A'
  },

  botanicals: [],
  totalBotanicals_g: 0,
  botanicalsPerLAL: 0.0,

  runData: [
    { time: '08:45', phase: 'Foreshots', volume_L: 2.0, abv_percent: 90.0, density: 0.814, lal: 1.8, observations: '35A' },
    { time: '09:00', phase: 'Heads', volume_L: 10.0, abv_percent: 87.0, density: 0.821, lal: 8.7, observations: '33A' },
    { time: '16:00', phase: 'Middle Run (Hearts) – Part 1', volume_L: 277, abv_percent: 84.6, lal: null, observations: 'VC Tank 33A; Back on 06:00 — 8–4PM' },
    { time: '07:00', phase: 'Middle Run (Hearts) – Part 2', volume_L: 150, abv_percent: 85.3, lal: 42.7, observations: 'VC Tank 26A; Back on 07:00 — 8–2PM' },
    { phase: 'Middle Run (Hearts) – Part 3', volume_L: 50.0, abv_percent: 85.0, lal: 0.0, observations: 'VC Tank 25A' }
  ],

  totalRun: {
    volume_L: 489.0,
    volume_percent: 87.5,
    abv_percent: null,
    lal: null,
    notes: 'Total Run (Heads/Hearts) linha mostrava 100% / 0%'
  },

  outputs: [
    { name: 'Foreshots', volumeL: 2.0, abv: 90.0, lal: 10.5, vessel: 'Discarded 20L Waste', observations: 'Discarded' },
    { name: 'Heads', volumeL: 10.0, abv: 87.0, lal: null, vessel: 'Descarte', observations: 'Feints' },
    { name: 'Hearts', volumeL: 477.0, abv: null, lal: null, vessel: 'Hearts blend for vodkas — VC-600', observations: 'Hearts blend' },
    { name: 'Tails', volumeL: 0.0, abv: null, lal: 0.0, vessel: 'FEINTS-GIN-000x', observations: 'No tails collected' }
  ],

  dilutions: [],
  notes: 'Feints retificados. Vodka Triple Distilled 002.'
} satisfies DistillationSession

export const vodka002Distillation = VodkaDistillationCalculator.enhanceSession(baseVodka002)
export default vodka002Distillation



