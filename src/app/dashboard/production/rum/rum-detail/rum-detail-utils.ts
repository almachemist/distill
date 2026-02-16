export function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  try {
    return new Date(value).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  } catch {
    return value
  }
}

export function formatNumber(value: number | null | undefined, fraction = 1) {
  if (value === null || value === undefined) return "—"
  return new Intl.NumberFormat("en-AU", { minimumFractionDigits: fraction, maximumFractionDigits: fraction }).format(value)
}

export function parseBatchList(value: any): string[] {
  const raw = String(value ?? '').trim()
  if (!raw) return []
  const parts = raw
    .split(/[;,]/g)
    .map((s: string) => s.trim())
    .filter(Boolean)
  return Array.from(new Set(parts))
}

export function normalizeToken(value: any): string {
  const raw0 = String(value ?? '').trim()
  if (!raw0) return ''
  const raw = raw0.toUpperCase().replace(/\s+/g, '').replace(/\//g, '-')
  const m = raw.match(/^(RUM)-(\d{2,4})-(\d{1,3})$/)
  if (m) {
    const n = parseInt(m[3], 10)
    if (Number.isFinite(n)) {
      return `${m[1]}-${m[2]}-${String(n).padStart(3, '0')}`
    }
  }
  return raw
}

export function unpadRumSuffix(value: string): string {
  const raw = normalizeToken(value)
  const m = raw.match(/^(RUM)-(\d{2,4})-(\d{3})$/)
  if (!m) return raw
  const n = parseInt(m[3], 10)
  if (!Number.isFinite(n)) return raw
  return `${m[1]}-${m[2]}-${String(n)}`
}

const CASK_TO_BARREL_MAP: Record<number, string[]> = {
  3: ['DTD0001', 'DTD0002'], 4: ['DTD0003'], 5: ['DTD0004'], 6: ['DTD0005'],
  7: ['DTD0006'], 8: ['DTD0007'], 9: ['DTD0008'], 10: ['DTD0009'],
  11: ['DTD0010'], 12: ['DTD0011'], 13: ['DTD0012'], 14: ['DTD0013'],
  15: ['DTD0014'], 16: ['DTD0015'], 17: ['DTD0016'], 18: ['DTD0017'],
  19: ['DTD0018'], 20: ['DTD0019'], 21: ['DTD0020'], 22: ['DTD0021'],
  23: ['DTD0022'], 24: ['DTD0023'], 25: ['DTD0024'], 26: ['DTD0025'],
  27: ['DTD0026'], 28: ['DTD0027'], 29: ['DTD0028'], 30: ['DTD0029'],
  31: ['DTD0030'], 32: ['DTD0045'], 33: ['DTD0031'], 34: ['DTD0032'],
  35: ['DTD0034'], 36: ['DTD0033'], 37: ['DTD0036'], 38: ['DTD0035'],
  39: ['DTD0037'], 40: ['DTD0039'], 41: ['DTD0041'], 42: ['DTD0043'],
  43: ['DTD0044'], 50: ['DTD0038', 'DTD0040', 'DTD0042'],
}

export function caskNumberToBarrelCode(value: any): string[] {
  const raw = String(value ?? '').trim()
  if (!raw) return []
  const n = parseInt(raw, 10)
  if (!Number.isFinite(n)) return []
  return CASK_TO_BARREL_MAP[n] || []
}

export interface CutCalc {
  foreshotsVol: number; foreshotsABV: number; foreshotsLAL: number
  headsVol: number; headsABV: number; headsLAL: number
  heartsVol: number; heartsABV: number; heartsLAL: number
  earlyTailsVol: number; earlyTailsABV: number; earlyTailsLAL: number
  lateTailsVol: number; lateTailsABV: number; lateTailsLAL: number
  lalIn: number; lalOut: number; lalLoss: number; lalLossPercent: number
  hasDataIssue: boolean; heartYield: number
  fermentationVolume: number; fermentationFinalABV: number
}

export function computeCuts(run: any): CutCalc {
  const fermentationVolume = run.boiler_volume_l || 0
  const fermentationFinalABV = run.boiler_abv_percent || run.final_abv_percent || 0

  const foreshotsVol = run.foreshots_volume_l || 0
  const foreshotsABV = run.foreshots_abv_percent || 0
  const foreshotsLAL = foreshotsVol * (foreshotsABV / 100)

  const headsVol = run.heads_volume_l || run.distillation?.cuts?.heads?.volume_l || 0
  const headsABV = run.heads_abv_percent || run.distillation?.cuts?.heads?.abv_percent || 0
  const headsLAL = run.heads_lal || run.distillation?.cuts?.heads?.lal || (headsVol * (headsABV / 100))

  const heartsVol = run.hearts_volume_l || run.distillation?.cuts?.hearts?.volume_l || 0
  const heartsABV = run.hearts_abv_percent || run.distillation?.cuts?.hearts?.abv_percent || 0
  const heartsLAL = run.hearts_lal || run.distillation?.cuts?.hearts?.lal || (heartsVol * (heartsABV / 100))

  const earlyTailsVol = run.early_tails_volume_l || 0
  const earlyTailsABV = run.early_tails_abv_percent || 0
  const earlyTailsLAL = earlyTailsVol * (earlyTailsABV / 100)

  const lateTailsVol = run.late_tails_volume_l || run.tails_volume_l || 0
  const lateTailsABV = run.late_tails_abv_percent || run.tails_abv_percent || 0
  const lateTailsLAL = lateTailsVol * (lateTailsABV / 100)

  const lalIn = fermentationVolume * (fermentationFinalABV / 100)
  const lalOut = foreshotsLAL + headsLAL + heartsLAL + earlyTailsLAL + lateTailsLAL
  const lalLoss = lalIn - lalOut
  const lalLossPercent = lalIn > 0 ? (lalLoss / lalIn) * 100 : 0
  const hasDataIssue = lalOut > lalIn
  const heartYield = lalIn > 0 ? (heartsLAL / lalIn) * 100 : 0

  return {
    foreshotsVol, foreshotsABV, foreshotsLAL,
    headsVol, headsABV, headsLAL,
    heartsVol, heartsABV, heartsLAL,
    earlyTailsVol, earlyTailsABV, earlyTailsLAL,
    lateTailsVol, lateTailsABV, lateTailsLAL,
    lalIn, lalOut, lalLoss, lalLossPercent,
    hasDataIssue, heartYield,
    fermentationVolume, fermentationFinalABV,
  }
}
