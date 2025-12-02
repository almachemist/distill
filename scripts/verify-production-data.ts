import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { parse as parseCsv } from 'csv-parse/sync'
import { createServiceRoleClient } from '../src/lib/supabase/serviceRole'

dotenv.config()

type Row = Record<string, any>

const DEFAULT_TABLE = 'rum_production_runs'
const EXPORTED_CSV = 'dados_producao_check.csv'
const ORIGINAL_CSV = 'producao_original.csv'
const REPORT_XLSX = 'difference_report.xlsx'
const SEPARATOR = ';'

function toCsvValue(value: any): string {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value) || typeof value === 'object') return '"' + JSON.stringify(value).replace(/"/g, '""') + '"'
  const s = String(value)
  const needsQuote = s.includes('"') || s.includes('\n') || s.includes('\r') || s.includes(SEPARATOR)
  if (!needsQuote) return s
  return '"' + s.replace(/"/g, '""') + '"'
}

async function exportTableToCsv(table: string, outPath: string): Promise<void> {
  const supabase = createServiceRoleClient()
  const pageSize = 1000
  let from = 0
  let all: Row[] = []
  for (;;) {
    const { data, error } = await supabase.from(table).select('*').range(from, from + pageSize - 1)
    if (error) throw error
    const batch = data || []
    all = all.concat(batch)
    if (batch.length < pageSize) break
    from += pageSize
  }
  if (all.length === 0) {
    fs.writeFileSync(outPath, '')
    return
  }
  const headers = Array.from(new Set(all.flatMap(r => Object.keys(r)))).sort((a, b) => a.localeCompare(b))
  const lines = [headers.join(SEPARATOR)]
  for (const r of all) {
    const line = headers.map(h => toCsvValue(r[h])).join(SEPARATOR)
    lines.push(line)
  }
  fs.writeFileSync(outPath, lines.join('\n'))
}

async function convertExcelToCsv(excelPath: string, outPath: string): Promise<void> {
  const xlsx = await import('xlsx')
  const wb = xlsx.readFile(excelPath)
  const sheetName = wb.SheetNames[0]
  const sheet = wb.Sheets[sheetName]
  const csv = xlsx.utils.sheet_to_csv(sheet, { FS: SEPARATOR })
  fs.writeFileSync(outPath, csv)
}

function normalizeColumns(rows: Row[]): { rows: Row[]; columns: string[] } {
  const trimmed = rows.map(r => {
    const out: Row = {}
    for (const [k, v] of Object.entries(r)) {
      const nk = k.trim()
      let nv: any = v
      if (typeof v === 'string') nv = v.trim()
      if (nv === null || nv === undefined) nv = ''
      out[nk] = nv
    }
    return out
  })
  const nonBlank = trimmed.filter(r => Object.values(r).some(v => String(v).trim() !== ''))
  const columns = Array.from(new Set(nonBlank.flatMap(r => Object.keys(r)))).sort((a, b) => a.localeCompare(b))
  const normalized = nonBlank.map(r => {
    const out: Row = {}
    for (const c of columns) out[c] = r[c] ?? ''
    return out
  })
  return { rows: normalized, columns }
}

function parseCsvFile(csvPath: string): Row[] {
  const content = fs.readFileSync(csvPath, 'utf8')
  if (!content.trim()) return []
  const records = parseCsv(content, { columns: true, skip_empty_lines: true, delimiter: SEPARATOR }) as Row[]
  return records
}

function selectSortKeys(columns: string[]): string[] {
  const candidates = [
    'Product',
    'product_name',
    'batch_name',
    'batch_id',
    'Date',
    'distillation_date',
    'fermentation_date'
  ]
  return candidates.filter(c => columns.includes(c))
}

function sortRows(rows: Row[], keys: string[]): Row[] {
  if (keys.length === 0) return rows
  const sorted = [...rows]
  sorted.sort((a, b) => {
    for (const k of keys) {
      const av = String(a[k] ?? '')
      const bv = String(b[k] ?? '')
      const cmp = av.localeCompare(bv)
      if (cmp !== 0) return cmp
    }
    return 0
  })
  return sorted
}

function deriveBatchName(row: Row, columns: string[]): string {
  const keys = ['batch_name', 'batch_id', 'Product', 'product_name', 'id']
  for (const k of keys) if (columns.includes(k)) return String(row[k] ?? '')
  return ''
}

function compareDatasets(original: { rows: Row[]; columns: string[] }, imported: { rows: Row[]; columns: string[] }) {
  const origCols = new Set(original.columns)
  const impCols = new Set(imported.columns)
  const commonCols = original.columns.filter(c => impCols.has(c))
  const diffs: { batch: string; column: string; original: any; imported: any }[] = []

  const missingOrigCols = [...impCols].filter(c => !origCols.has(c))
  const missingImpCols = [...origCols].filter(c => !impCols.has(c))
  if (missingOrigCols.length > 0 || missingImpCols.length > 0) {
    const batch = ''
    for (const c of missingImpCols) diffs.push({ batch, column: `missing_in_imported:${c}`, original: 'present', imported: 'missing' })
    for (const c of missingOrigCols) diffs.push({ batch, column: `missing_in_original:${c}`, original: 'missing', imported: 'present' })
  }

  const len = Math.max(original.rows.length, imported.rows.length)
  const origSorted = original.rows
  const impSorted = imported.rows
  for (let i = 0; i < len; i++) {
    const o = origSorted[i]
    const m = impSorted[i]
    const batch = o ? deriveBatchName(o, original.columns) : m ? deriveBatchName(m, imported.columns) : ''
    if (!o) {
      diffs.push({ batch, column: '__row__', original: 'missing', imported: 'present' })
      continue
    }
    if (!m) {
      diffs.push({ batch, column: '__row__', original: 'present', imported: 'missing' })
      continue
    }
    for (const c of commonCols) {
      const ov = o[c]
      const iv = m[c]
      const on = typeof ov === 'number' ? ov : isFinite(Number(ov)) && ov !== '' ? Number(ov) : ov
      const in_ = typeof iv === 'number' ? iv : isFinite(Number(iv)) && iv !== '' ? Number(iv) : iv
      const eq = on === in_
      if (!eq) diffs.push({ batch, column: c, original: ov, imported: iv })
    }
  }
  return diffs
}

async function writeDifferenceReport(diffs: { batch: string; column: string; original: any; imported: any }[], outPath: string): Promise<void> {
  try {
    const xlsx = await import('xlsx')
    const rows = diffs.map(d => ({ 'Batch name': d.batch, 'Column name': d.column, 'Original value': d.original, 'Imported value': d.imported }))
    const wb = xlsx.utils.book_new()
    const ws = xlsx.utils.json_to_sheet(rows)
    xlsx.utils.book_append_sheet(wb, ws, 'differences')
    xlsx.writeFile(wb, outPath)
  } catch {
    const headers = ['Batch name', 'Column name', 'Original value', 'Imported value']
    const lines = [headers.join(SEPARATOR)]
    for (const d of diffs) {
      lines.push([d.batch, d.column, String(d.original ?? ''), String(d.imported ?? '')].map(toCsvValue).join(SEPARATOR))
    }
    fs.writeFileSync(path.join(process.cwd(), 'difference_report.csv'), lines.join('\n'))
  }
}

async function main() {
  const args = process.argv.slice(2)
  const excelArgIdx = args.findIndex(a => a === '--excel')
  const originalCsvArgIdx = args.findIndex(a => a === '--original-csv')
  const tableArgIdx = args.findIndex(a => a === '--table')
  const excelPath = excelArgIdx >= 0 ? args[excelArgIdx + 1] : ''
  const originalCsvInput = originalCsvArgIdx >= 0 ? args[originalCsvArgIdx + 1] : ''
  const table = tableArgIdx >= 0 ? args[tableArgIdx + 1] : DEFAULT_TABLE

  const exportPath = path.join(process.cwd(), EXPORTED_CSV)
  const originalCsvPath = path.join(process.cwd(), ORIGINAL_CSV)

  await exportTableToCsv(table, exportPath)

  if (excelPath) {
    await convertExcelToCsv(excelPath, originalCsvPath)
  } else if (originalCsvInput) {
    fs.copyFileSync(originalCsvInput, originalCsvPath)
  } else {
    throw new Error('Provide --excel <original.xlsx> or --original-csv <original.csv>')
  }

  const originalRows = parseCsvFile(originalCsvPath)
  const importedRows = parseCsvFile(exportPath)

  const origNorm = normalizeColumns(originalRows)
  const impNorm = normalizeColumns(importedRows)

  const origSortKeys = selectSortKeys(origNorm.columns)
  const impSortKeys = selectSortKeys(impNorm.columns)

  const origSorted = sortRows(origNorm.rows, origSortKeys)
  const impSorted = sortRows(impNorm.rows, impSortKeys)

  const diffs = compareDatasets({ rows: origSorted, columns: origNorm.columns }, { rows: impSorted, columns: impNorm.columns })

  if (diffs.length === 0) {
    console.log('✓ ALL DATA IMPORTED PERFECTLY!')
  } else {
    console.log('✗ DIFFERENCES FOUND! Generating report...')
    await writeDifferenceReport(diffs, path.join(process.cwd(), REPORT_XLSX))
    console.log('📄 difference_report.xlsx generated.')
  }
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
