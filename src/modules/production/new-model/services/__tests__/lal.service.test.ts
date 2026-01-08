import { describe, it, expect } from 'vitest'
import { batchesDataset } from '@/modules/production/new-model/data/batches.dataset'
import {
  calcLal,
  sumSegmentsLal,
  computeForeshotsLal,
  computeHeadsLal,
  computeHeartsLal,
  computeTailsLal,
  computeBatchKpi,
  checkDilutionInvariance,
  applyLalOnCutUpdate,
} from '@/modules/production/new-model/services/lal.service'

function mm002() {
  const month = batchesDataset.batches_by_month['2025-03']
  if (!month) throw new Error('MM-002 month not found')
  const b = month.find(x => x.batch_id === 'SPIRIT-GIN-MM-002')
  if (!b) throw new Error('MM-002 not found')
  return b
}

describe('calcLal base rules', () => {
  it('uses existing LAL when present', () => {
    const r = calcLal(100, 50, 12.3, null)
    expect(r.value).toBe(12.3)
    expect(r.flags).toEqual([])
  })
  it('computes when volume and abv present', () => {
    const r = calcLal(332, 82.4, null, null)
    expect(r.value).toBeCloseTo(273.6, 1)
  })
  it('flags missing_abv (and density conversion if density present)', () => {
    const r1 = calcLal(100, null, null, null)
    expect(r1.value).toBeNull()
    expect(r1.flags).toContain('missing_abv')

    const r2 = calcLal(100, null, null, 0.83)
    expect(r2.value).toBeNull()
    expect(r2.flags).toContain('missing_abv')
    expect(r2.flags).toContain('needs_density_conversion')
  })
  it('flags missing_volume when volume absent', () => {
    const r = calcLal(null, 50, null, null)
    expect(r.value).toBeNull()
    expect(r.flags).toContain('missing_volume')
  })
})

describe('segments and per-phase calculations', () => {
  it('sums tails segments LAL using provided segment LALs', () => {
    const b = mm002()
    const tails = b.cuts.tails_segments || []
    const r = sumSegmentsLal(tails)
    expect(r.value).toBeCloseTo(251.6, 1) // 120.2 + 131.4
  })

  it('computes foreshots/heads/hearts correctly (mm002)', () => {
    const b = mm002()
    expect(computeForeshotsLal(b.cuts).value).toBeCloseTo(1.8, 1)
    expect(computeHeadsLal(b.cuts).value).toBeCloseTo(10.4, 1)
    expect(computeHeartsLal(b.cuts).value).toBeCloseTo(273.6, 1)
    expect(computeTailsLal(b.cuts).value).toBeCloseTo(251.6, 1)
  })
})

describe('batch KPIs and dilution invariance', () => {
  it('computes recovery KPIs (mm002)', () => {
    const b = mm002()
    const k = computeBatchKpi(b)
    expect(k.charge_lal).toBeCloseTo(535, 1)
    expect(k.hearts_lal).toBeCloseTo(273.6, 1)
    expect(k.tails_lal).toBeCloseTo(251.6, 1)
    expect(k.heads_lal).toBeCloseTo(10.4, 1)
    expect(k.hearts_recovery_pct).toBeCloseTo(51.1, 1)
    expect(k.total_recovery_pct).toBeCloseTo(100.1, 1)
    expect(k.losses_pct).toBeCloseTo(-0.1, 1)
    expect(k.flags).not.toContain('kpi_incomplete_data')
  })

  it('flags LAL discrepancy if dilution changes LAL', () => {
    const b = mm002()
    const clone = JSON.parse(JSON.stringify(b)) as typeof b
    if (clone.dilution?.combined?.final_output_run) {
      clone.dilution.combined.final_output_run.lal = 270.0
    }
    const r = checkDilutionInvariance(clone)
    expect(r.flags).toContain('lal_discrepancy')
  })
})

describe('applyLalOnCutUpdate', () => {
  it('recomputes a cut LAL when volume/abv updated', () => {
    const b = mm002()
    const next = applyLalOnCutUpdate(b, 'heads', { volume_l: 11.0, abv_percent: 88.0, lal: null })
    // 11 * 0.88 = 9.7 LAL
    expect(next.cuts.heads.lal).toBe(9.7)
  })

  it('sets tails.lal to sum of segments when segments exist', () => {
    const b = mm002()
    const next = applyLalOnCutUpdate(b, 'tails', { lal: null })
    expect(next.cuts.tails.lal).toBe(251.6)
  })
})
