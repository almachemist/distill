import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

function loadEnv() {
  const p = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(p)) {
    const c = fs.readFileSync(p, 'utf-8')
    c.split('\n').forEach(l => {
      const m = l.trim().match(/^([^=]+)=(.+)$/)
      if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '')
    })
  }
}

function abs(n: number) { return Math.abs(n) }
function relDiff(a: number, b: number) { const d = abs(a - b); const denom = Math.max(1, abs(b)); return d / denom }

function extractJsonObjects(text: string) {
  const out: string[] = []
  let inString = false, escape = false, depth = 0, start = -1
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inString) {
      if (escape) escape = false
      else if (ch === '\\') escape = true
      else if (ch === '"') inString = false
    } else {
      if (ch === '"') inString = true
      else if (ch === '{') { if (depth === 0) start = i; depth++ }
      else if (ch === '}') { if (depth > 0 && --depth === 0 && start >= 0) { out.push(text.slice(start, i + 1)); start = -1 } }
    }
  }
  return out
}

const inputPath = process.argv[2] || path.join(process.cwd(), 'scripts', 'check', 'navycheck.cleaned.json')
const outPath = process.argv[3] || path.join(process.cwd(), 'data', 'reconciliation', 'navy_check_report.json')

async function main() {
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }
  const supabase = createClient(url, key)

  let rows: any[] = []
  try {
    const raw = fs.readFileSync(inputPath, 'utf-8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) rows = parsed
    else if (parsed && Array.isArray((parsed as any).gin_runs)) rows = (parsed as any).gin_runs
    else rows = [parsed]
  } catch {}
  if (!rows.length) {
    const raw0 = fs.readFileSync(inputPath, 'utf-8').replace(/\uFEFF/g, '').replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
    try {
      const parsed0 = JSON.parse(raw0)
      if (Array.isArray(parsed0)) rows = parsed0
      else if (parsed0 && Array.isArray((parsed0 as any).gin_runs)) rows = (parsed0 as any).gin_runs
      else rows = [parsed0]
    } catch {
      const parts = raw0.split(/\n\s*\n/g)
      let successes = 0
      for (const p of parts) {
        const t = p.trim().replace(/,\s*([}\]])/g, '$1')
        if (t.startsWith('{') && t.endsWith('}')) {
          try { rows.push(JSON.parse(t)); successes++ } catch {}
        }
      }
      if (!rows.length) {
        const lines = raw0.split(/\r?\n/)
        let buf: string[] = []
        let started = false
        for (const ln of lines) {
          const t = ln.trim()
          if (!started && t.startsWith('{')) { started = true; buf = [] }
          if (started) buf.push(ln)
          if (started && t === '}') {
            const objText = buf.join('\n')
            try { rows.push(JSON.parse(objText)) } catch {}
            started = false
            buf = []
          }
        }
        if (!rows.length) {
          const chunks = extractJsonObjects(raw0)
          for (const c of chunks) { try { rows.push(JSON.parse(c)) } catch {} }
        }
      }
    }
  }
  if (!rows.length && !inputPath.toLowerCase().includes('rainforest')) {
    const candidates = [
      path.join(process.cwd(), 'scripts', 'check', 'navycheck.json'),
      path.join(process.cwd(), 'src', 'modules', 'production', 'data', 'Navy.json')
    ]
    for (const pth of candidates) {
      const raw = fs.readFileSync(pth, 'utf-8').replace(/\u00A0/g, ' ').replace(/\uFEFF/g, '')
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) rows = parsed
      else if (parsed && Array.isArray((parsed as any).gin_runs)) rows = (parsed as any).gin_runs
      else rows = [parsed]
    } catch {
        const parts = raw.split(/\n\s*\n/g)
        let successes = 0
        for (const p of parts) {
          const t = p.trim().replace(/,\s*([}\]])/g, '$1')
          if (t.startsWith('{') && t.endsWith('}')) {
            try { rows.push(JSON.parse(t)); successes++ } catch {}
          }
        }
        console.log(`Parsed parts from ${pth}: ${parts.length}, successes: ${successes}`)
        if (!rows.length) {
          const lines = raw.split(/\r?\n/)
          let buf: string[] = []
          let started = false
          for (const ln of lines) {
            const t = ln.trim()
            if (!started && t.startsWith('{')) { started = true; buf = [] }
            if (started) buf.push(ln)
            if (started && t === '}') {
              const objText = buf.join('\n')
              try { rows.push(JSON.parse(objText)) } catch {}
              started = false
              buf = []
            }
          }
          console.log(`Parsed by line from ${pth}: ${rows.length}`)
          if (!rows.length) {
            const chunks = extractJsonObjects(raw)
            for (const c of chunks) { try { rows.push(JSON.parse(c)) } catch {} }
            console.log(`Parsed by chunks from ${pth}: ${rows.length}`)
          }
        }
      }
      if (rows.length) break
    }
  }
  if (!rows.length) { console.error('No rows parsed from input'); process.exit(1) }
  const report: any[] = []
  const fills: any[] = []
  let total = 0, mismatches = 0
  const zeroIsNullVolume = new Set([
    'foreshots_volume_l',
    'heads_volume_l',
    'tails_volume_l',
    'charge_total_volume_l',
    'final_output_volume_l'
  ])
  const zeroIsNullABV = new Set([
    'foreshots_abv_percent',
    'heads_abv_percent',
    'tails_abv_percent',
    'charge_total_abv_percent',
    'final_output_abv_percent'
  ])
  const minVolIgnore = 0.5

  for (const src of rows) {
    const batchId = String(src.run_id || src.batch_id || '').trim()
    if (!batchId) continue
    const srcDate = (src.date || src.distillation_date) ?? null
    if (/00x$/i.test(batchId)) continue
    total++
    const { data, error } = await supabase
      .from('distillation_runs')
      .select('batch_id,date,still_used,charge_total_volume_l,charge_total_abv_percent,foreshots_volume_l,foreshots_abv_percent,heads_volume_l,heads_abv_percent,hearts_volume_l,hearts_abv_percent,tails_volume_l,tails_abv_percent,final_output_volume_l,final_output_abv_percent')
      .eq('batch_id', batchId)
      .limit(1)
    if (error) { report.push({ batch_id: batchId, error: error.message }); continue }
    const dst = data?.[0] || null

    const s = {
      chargeVol: (src.charge_adjustment?.total_charge?.volume_l ?? src.boiler_charge_l) ?? null,
      chargeABV: (src.charge_adjustment?.total_charge?.abv_percent ?? src.boiler_abv_percent) ?? null,
      foreshotsVol: (src.totals?.total_output?.foreshots?.volume_l ?? src.totals?.output?.foreshots?.volume_l ?? src.distillation?.foreshots?.volume_l) ?? null,
      foreshotsABV: (src.totals?.total_output?.foreshots?.abv_percent ?? src.totals?.output?.foreshots?.abv_percent ?? src.distillation?.foreshots?.abv_percent) ?? null,
      headsVol: (src.totals?.total_output?.heads?.volume_l ?? src.totals?.output?.heads?.volume_l ?? src.distillation?.heads?.volume_l) ?? null,
      headsABV: (src.totals?.total_output?.heads?.abv_percent ?? src.totals?.output?.heads?.abv_percent ?? src.distillation?.heads?.abv_percent) ?? null,
      heartsVol: (src.totals?.total_output?.hearts?.volume_l ?? src.totals?.output?.hearts?.volume_l ?? src.distillation?.hearts?.volume_l) ?? null,
      heartsABV: (src.totals?.total_output?.hearts?.abv_percent ?? src.totals?.output?.hearts?.abv_percent ?? src.distillation?.hearts?.abv_percent) ?? null,
      tailsVol: (src.totals?.total_output?.tails?.volume_l ?? src.totals?.output?.tails?.volume_l ?? src.distillation?.tails?.volume_l) ?? null,
      tailsABV: (src.totals?.total_output?.tails?.abv_percent ?? src.totals?.output?.tails?.abv_percent ?? src.distillation?.tails?.abv_percent) ?? null,
      finalVol: (src.final_output?.final_volume_l ?? src.final_output?.volume_l ?? src.bottling?.final_volume_l) ?? null,
      finalABV: (src.final_output?.abv_percent ?? src.bottling?.final_abv_percent) ?? null,
    }

    const diffs: any[] = []
    const absABV = 0.5, relVol = 0.02
    function cmpNum(field: string, sVal: any, tVal: any) {
      const sn = sVal == null ? NaN : Number(sVal), tn = tVal == null ? NaN : Number(tVal)
      if (zeroIsNullVolume.has(field)) {
        const sZero = !isNaN(sn) && Math.abs(sn) <= minVolIgnore
        const tNull = tVal == null || (isNaN(tn) && tVal == null)
        if (sZero && tNull) return
      }
      if (zeroIsNullABV.has(field)) {
        const sZero = !isNaN(sn) && Math.abs(sn) <= 0
        const tNull = tVal == null || (isNaN(tn) && tVal == null)
        if (sZero && tNull) return
      }
      if (field.endsWith('_abv_percent')) {
        if (!isNaN(sn) && sn === 0 && !isNaN(tn) && tn > 0) return
      }
      if (field.endsWith('_abv_percent')) {
        const volField = field.replace('_abv_percent', '_volume_l')
        const related = (volField === 'foreshots_volume_l' ? s.foreshotsVol
                        : volField === 'heads_volume_l' ? s.headsVol
                        : volField === 'tails_volume_l' ? s.tailsVol
                        : volField === 'hearts_volume_l' ? s.heartsVol
                        : undefined)
        if (related != null) {
          const rv = Number(related)
          if (!isNaN(rv) && Math.abs(rv) <= minVolIgnore && (tVal == null || isNaN(tn))) return
        }
      }
      if (isNaN(sn) && isNaN(tn)) return
      if (isNaN(sn) || isNaN(tn)) { diffs.push({ field, source: sVal, target: tVal }); return }
      const rd = relDiff(sn, tn), ad = abs(sn - tn)
      const tolAbs = field.endsWith('_abv_percent') ? absABV : 0
      const passRel = rd <= relVol, passAbs = tolAbs ? ad <= tolAbs : true
      if (!(passRel && passAbs)) diffs.push({ field, source: sn, target: tn, delta: Math.round((sn - tn) * 1000000)/1000000 })
    }
    function cmpStr(field: string, sVal: any, tVal: any) {
      if (String(sVal ?? '') !== String(tVal ?? '')) diffs.push({ field, source: sVal, target: tVal })
    }

    cmpStr('date', srcDate ?? null, dst?.date ?? null)
    cmpStr('still_used', src.still_used ?? null, dst?.still_used ?? null)
    cmpNum('charge_total_volume_l', s.chargeVol, dst?.charge_total_volume_l ?? null)
    cmpNum('charge_total_abv_percent', s.chargeABV, dst?.charge_total_abv_percent ?? null)
    cmpNum('foreshots_volume_l', s.foreshotsVol, dst?.foreshots_volume_l ?? null)
    cmpNum('foreshots_abv_percent', s.foreshotsABV, dst?.foreshots_abv_percent ?? null)
    cmpNum('heads_volume_l', s.headsVol, dst?.heads_volume_l ?? null)
    cmpNum('heads_abv_percent', s.headsABV, dst?.heads_abv_percent ?? null)
    cmpNum('hearts_volume_l', s.heartsVol, dst?.hearts_volume_l ?? null)
    cmpNum('hearts_abv_percent', s.heartsABV, dst?.hearts_abv_percent ?? null)
    cmpNum('tails_volume_l', s.tailsVol, dst?.tails_volume_l ?? null)
    cmpNum('tails_abv_percent', s.tailsABV, dst?.tails_abv_percent ?? null)
    cmpNum('final_output_volume_l', s.finalVol, dst?.final_output_volume_l ?? null)
    cmpNum('final_output_abv_percent', s.finalABV, dst?.final_output_abv_percent ?? null)

    if (diffs.length > 0) mismatches++
    report.push({ batch_id: batchId, diffs })

    const fill: any = { batch_id: batchId, update: {} as any }
    // Populate missing target fields from source when available
    if ((dst?.charge_total_volume_l ?? null) == null && s.chargeVol != null && !isNaN(Number(s.chargeVol)) && Number(s.chargeVol) > 0) {
      fill.update.charge_total_volume_l = Number(s.chargeVol)
    }
    if ((dst?.charge_total_abv_percent ?? null) == null && s.chargeABV != null && !isNaN(Number(s.chargeABV)) && Number(s.chargeABV) > 0) {
      fill.update.charge_total_abv_percent = Number(s.chargeABV)
    }
    if ((dst?.final_output_volume_l ?? null) == null && s.finalVol != null && !isNaN(Number(s.finalVol)) && Number(s.finalVol) > 0) {
      fill.update.final_output_volume_l = Number(s.finalVol)
    }
    if ((dst?.final_output_abv_percent ?? null) == null && s.finalABV != null && !isNaN(Number(s.finalABV)) && Number(s.finalABV) > 0) {
      fill.update.final_output_abv_percent = Number(s.finalABV)
    }
    // Do not overwrite hearts with zeros; only fill if target has value and source lacks
    const srcHeartsVol = (src.totals?.total_output?.hearts?.volume_l ?? src.totals?.output?.hearts?.volume_l) ?? null
    const srcHeartsABV = (src.totals?.total_output?.hearts?.abv_percent ?? src.totals?.output?.hearts?.abv_percent) ?? null
    if ((srcHeartsVol ?? null) == null && (dst?.hearts_volume_l ?? null) != null) {
      fill.update.hearts_volume_l = dst?.hearts_volume_l
    }
    if ((srcHeartsABV ?? null) == null && (dst?.hearts_abv_percent ?? null) != null) {
      fill.update.hearts_abv_percent = dst?.hearts_abv_percent
    }
    if (Object.keys(fill.update).length > 0) fills.push(fill)
  }

  const outDir = path.join(process.cwd(), 'data', 'reconciliation')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify({ summary: { rows: total, mismatches }, items: report }, null, 2))
  const low = outPath.toLowerCase()
  let base = 'navy_fill_suggestions.json'
  if (low.includes('rainforest')) base = 'rainforest_fill_suggestions.json'
  else if (low.includes('dryseason') || low.includes('dry-season') || low.includes('drys')) base = 'dryseason_fill_suggestions.json'
  else if (low.includes('signature') || low.includes('sig')) base = 'signature_fill_suggestions.json'
  else if (low.includes('wetseason') || low.includes('wet-season') || low.includes('wet')) base = 'wetseason_fill_suggestions.json'
  else if (low.includes('navy')) base = 'navy_fill_suggestions.json'
  const fillsPath = path.join(outDir, base)
  fs.writeFileSync(fillsPath, JSON.stringify({ items: fills }, null, 2))
  console.log(`Report: ${outPath}`)
  console.log(`Fill suggestions: ${fillsPath}`)
  console.log(`Rows: ${total}, Mismatches: ${mismatches}`)
}

main()
