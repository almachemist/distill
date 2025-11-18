import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function parseDate(d: string) { return new Date(d + (d.length === 10 ? 'T00:00:00Z' : '')) }
function intersects(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) { return aStart <= bEnd && bStart <= aEnd }

type CalendarWeek = { week_start: string, week_end: string, production_runs?: any[], notes?: string[], bottling_tasks?: string[] }

type BottlesPerBatch = { [key: string]: number }

const PRODUCT_MAP: Record<string, { key700?: string, key200?: string, forbid200?: boolean }> = {
  'Rainforest Gin': { key700: 'Rainforest_700', key200: 'Rainforest_200' },
  'Signature Gin': { key700: 'Signature_700', key200: 'Signature_200' },
  'Navy Strength Gin': { key700: 'Navy_700', key200: 'Navy_200' },
  'Merchant Mae Gin': { key700: 'Merchant_Mae_Gin', forbid200: true },
  'Merchant Mae Vodka': { key700: 'Merchant_Mae_Vodka', forbid200: true },
  'Merchant Mae White Rum': { key700: 'Merchant_Mae_White_Rum', forbid200: true },
  'Australian Cane Spirit': { key700: 'Cane_Spirit_700', key200: 'Cane_Spirit_200' },
  'Spiced Rum': { key700: 'Spiced_700', key200: 'Spiced_200' },
  'Coffee Liqueur': { key700: 'Coffee_Liqueur_700', forbid200: true },
}

function loadJSON<T>(rel: string): T {
  const full = path.join(process.cwd(), rel)
  return JSON.parse(fs.readFileSync(full, 'utf-8')) as T
}

function getCalendars() {
  const dec = loadJSON<{ calendar: CalendarWeek[] }>('data/production_calendar_december_2025.json')
  const y2026 = loadJSON<{ calendar: CalendarWeek[] }>('data/production_calendar_2026_v4.json')
  return [...dec.calendar, ...y2026.calendar]
}

function navySmallBatch200Only(week: CalendarWeek, run: any): boolean {
  const txt = [ ...(week.notes || []), (run.notes || '') ].join(' ').toLowerCase()
  const tank = (run.receiving_tank || '').toString().toLowerCase()
  return txt.includes('200ml') || txt.includes('small batch') || tank.includes('small')
}

function splitFrom700Only(avgBottles700: number, split700 = 0.9) {
  const bottles700 = Math.round(avgBottles700 * split700)
  const bottles200 = Math.round(avgBottles700 * (0.1 * 0.7 / 0.2)) // preserve litres
  return { bottles700, bottles200 }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const fromStr = searchParams.get('from') || '2025-12-01'
    const toStr = searchParams.get('to') || '2026-03-31'
    const from = parseDate(fromStr)
    const to = parseDate(toStr)

    const bottlesData = loadJSON<{ bottles_per_batch: BottlesPerBatch }>('data/bottles_per_batch.json').bottles_per_batch
    const weeks = getCalendars()

    type Totals = { bottles700: number, bottles200: number }
    const perProduct: Record<string, Totals> = {}

    const runsByProduct: Record<string, number> = {}

    for (const w of weeks) {
      const ws = parseDate(w.week_start)
      const we = parseDate(w.week_end)
      if (!intersects(ws, we, from, to)) continue
      const runs = w.production_runs || []
      for (const run of runs) {
        const product: string = run.product
        if (!product) continue
        runsByProduct[product] = (runsByProduct[product] || 0) + 1

        const map = PRODUCT_MAP[product]
        if (!map) continue

        let add700 = 0, add200 = 0

        if (product === 'Navy Strength Gin' && navySmallBatch200Only(w, run)) {
          // Force 200ml-only for this batch
          add200 = bottlesData[map.key200 || ''] || 0
        } else {
          const has700Key = map.key700 && (map.key700 in bottlesData)
          const has200Key = map.key200 && (map.key200 in bottlesData)

          if (has700Key) add700 = bottlesData[map.key700!]
          if (has200Key && !map.forbid200) add200 = bottlesData[map.key200!]

          if (!has200Key && !map.forbid200 && has700Key) {
            // Apply 90/10 split if product supports 200ml but we only have 700 data
            const split = splitFrom700Only(bottlesData[map.key700!], 0.9)
            add700 = split.bottles700
            add200 = split.bottles200
          }
        }

        if (!perProduct[product]) perProduct[product] = { bottles700: 0, bottles200: 0 }
        perProduct[product].bottles700 += add700
        perProduct[product].bottles200 += add200
      }
    }

    // Aggregate totals
    let total700 = 0, total200 = 0
    for (const p of Object.keys(perProduct)) {
      total700 += perProduct[p].bottles700
      total200 += perProduct[p].bottles200
    }

    // Apply +10% buffer (ceil)
    function withBuffer(n: number) { return Math.ceil(n * 1.10) }

    const packagingTotals = {
      bottles_700: withBuffer(total700),
      bottles_200: withBuffer(total200),
      corks: withBuffer(total700),
      screw_caps_200: withBuffer(total200),
      labels_700: withBuffer(total700),
      labels_200: withBuffer(total200),
      cartons_6pack: Math.ceil(withBuffer(total700) / 6),
    }

    // Build order list text
    const lines: string[] = []
    lines.push(`Packaging Required (${fromStr} → ${toStr})`)
    const sortKeys = Object.keys(perProduct).sort()
    for (const k of sortKeys) {
      const v = perProduct[k]
      if (v.bottles700 > 0) lines.push(`• ${k} 700ml bottles: ${withBuffer(v.bottles700)}`)
      if (v.bottles200 > 0) lines.push(`• ${k} 200ml bottles: ${withBuffer(v.bottles200)}`)
      if (v.bottles700 > 0) lines.push(`• ${k} 700 labels: ${withBuffer(v.bottles700)}`)
      if (v.bottles200 > 0) lines.push(`• ${k} 200 labels: ${withBuffer(v.bottles200)}`)
    }
    lines.push(`• 6-pack cartons: ${packagingTotals.cartons_6pack}`)
    lines.push(`• Corks (700ml): ${packagingTotals.corks}`)
    lines.push(`• 200ml screw caps: ${packagingTotals.screw_caps_200}`)

    return NextResponse.json({
      from: fromStr,
      to: toStr,
      runsByProduct,
      perProduct,
      totals: { bottles700: total700, bottles200: total200 },
      packagingTotals,
      orderListText: lines.join('\n')
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to compute forecast' }, { status: 500 })
  }
}

