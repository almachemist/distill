import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BottlingRun, BottleEntry } from '@/types/bottling'
import { readJson, writeJson } from '@/lib/jsonStore'
import type { InventoryItem } from '@/types/inventory'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


const INVENTORY_PATH = 'data/inventory.json'
const MOVEMENTS_PATH = 'data/inventory_movements.json'

type Change = { sku: string; delta: number; note?: string }

function sumBySize(entries: BottleEntry[], size: number) {
  return (entries || []).filter(e => e.size_ml === size).reduce((s, e) => s + (e.quantity || 0), 0)
}

const SPIRIT_SKUS: Record<string, { sku700?: string; sku200?: string; label700?: string; label200?: string }> = {
  'Rainforest Gin': { sku700: 'RAIN-700', sku200: 'RAIN-200', label700: 'LBL-RAIN-700', label200: 'LBL-RAIN-200' },
  'Signature Gin': { sku700: 'SIGN-700', sku200: 'SIGN-200', label700: 'LBL-SIGN-700', label200: 'LBL-SIGN-200' },
  'Navy Strength Gin': { sku700: 'NAVY-700', sku200: 'NAVY-200', label700: 'LBL-NAVY-700', label200: 'LBL-NAVY-200' },
  'Cane Spirit': { sku700: 'CANE-700', sku200: 'CANE-200', label700: 'LBL-CANE-700', label200: 'LBL-CANE-200' },
  'Pineapple Rum': { sku700: 'PINE-700', sku200: 'PINE-200', label700: 'LBL-PINE-700', label200: 'LBL-PINE-200' },
  'Spiced Rum': { sku700: 'SPICED-700', sku200: 'SPICED-200', label700: 'LBL-SPICED-700', label200: 'LBL-SPICED-200' },
  'Wet Season Rum': { sku700: 'WET-700', label700: 'LBL-WET-700' },
  'Dry Season Rum': { sku700: 'DRY-700', label700: 'LBL-DRY-700' },
  'Reserve Cask Rum': { sku700: 'RESRUM-700', label700: 'LBL-RESRUM-700' },
  'Coffee Liqueur': { sku700: 'COFFEE-700', label700: 'LBL-COFFEE-700' },
  'Merchant Mae Gin': { sku700: 'MM-GIN-700', label700: 'LBL-MMGIN-700' },
  'Merchant Mae Vodka': { sku700: 'MM-VODKA-700', label700: 'LBL-MMVODKA-700' },
  'Merchant Mae White Rum': { sku700: 'MM-WR-700', label700: 'LBL-MMWR-700' },
  'Merchant Mae Dark Rum': { sku700: 'MM-DR-700', label700: 'LBL-MMDR-700' },
}

const PKG = {
  BOTTLE_700: 'PKG-BOTTLE-700',
  BOTTLE_200: 'PKG-BOTTLE-200',
  CORK_700: 'PKG-CORK-700',
  CAP_200: 'PKG-CAP-200',
  SLEEVE_700: 'PKG-SLEEVE-700',
  SLEEVE_200: 'PKG-SLEEVE-200',
  CARTON_6P_700: 'PKG-CARTON-6P-700',
}

function sumMovementsBySku(records: any[]) {
  const map = new Map<string, number>()
  for (const r of records) {
    for (const ch of r.changes || []) {
      map.set(ch.sku, (map.get(ch.sku) || 0) + Number(ch.delta || 0))
    }
  }
  return map
}

async function applyMovements(reference: string, changes: Change[]) {
  const items = await readJson<InventoryItem[]>(INVENTORY_PATH, [])
  const recs = await readJson<any[]>(MOVEMENTS_PATH, [])

  // index by sku
  const bySku = new Map(items.map((it) => [it.sku, it]))

  // validate existence
  for (const ch of changes) {
    if (!bySku.has(ch.sku)) {
      throw new Error(`Item not found: ${ch.sku}`)
    }
  }

  // coalesce by sku
  const pending = new Map<string, number>()
  for (const ch of changes) pending.set(ch.sku, (pending.get(ch.sku) || 0) + Number(ch.delta || 0))

  // validate non-negative using baseline + existing movements
  const sums = sumMovementsBySku(recs)
  for (const [sku, delta] of pending) {
    const item = bySku.get(sku)!
    const baseline = Number(item.currentStock || 0)
    const before = baseline + (sums.get(sku) || 0)
    const after = before + delta
    if (after < 0) throw new Error(`Insufficient stock for ${sku}: need ${-delta}, available ${before}`)
  }

  // build applied consolidated
  const applied: any[] = []
  for (const [sku, delta] of pending) {
    const item = bySku.get(sku)!
    const baseline = Number(item.currentStock || 0)
    const before = baseline + (sums.get(sku) || 0)
    const after = before + delta
    applied.push({ id: item.id, sku, delta, before, after })
  }

  // append record only (do not modify baseline file)
  recs.push({ dt: new Date().toISOString(), reference, reason: 'bottling', changes: applied })
  await writeJson(MOVEMENTS_PATH, recs)
  return applied
}

function buildBottlingChanges(body: BottlingRun): Change[] {
  const p = SPIRIT_SKUS[body.productName]
  if (!p) throw new Error(`Unknown product mapping for ${body.productName}`)
  const q700 = sumBySize(body.bottleEntries || [], 700)
  const q200 = sumBySize(body.bottleEntries || [], 200)
  const changes: Change[] = []

  if (q700 > 0) {
    changes.push({ sku: PKG.BOTTLE_700, delta: -q700 })
    changes.push({ sku: PKG.CORK_700, delta: -q700 })
    changes.push({ sku: PKG.SLEEVE_700, delta: -q700 })
    if (p.label700) changes.push({ sku: p.label700, delta: -q700 })
    const cartons = Math.ceil(q700 / 6)
    changes.push({ sku: PKG.CARTON_6P_700, delta: -cartons })
    if (!p.sku700) throw new Error(`No 700ml finished-good SKU for ${body.productName}`)
    changes.push({ sku: p.sku700, delta: +q700 })
  }

  if (q200 > 0) {
    changes.push({ sku: PKG.BOTTLE_200, delta: -q200 })
    changes.push({ sku: PKG.CAP_200, delta: -q200 })
    changes.push({ sku: PKG.SLEEVE_200, delta: -q200 })
    if (p.label200) changes.push({ sku: p.label200, delta: -q200 })
    if (!p.sku200) throw new Error(`No 200ml finished-good SKU for ${body.productName}`)
    changes.push({ sku: p.sku200, delta: +q200 })
  }

  return changes
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('bottling_runs')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ bottlingRuns: data || [] })
  } catch (error) {
    console.error('Error fetching bottling runs:', error)
    return NextResponse.json({ error: 'Failed to fetch bottling runs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json() as BottlingRun

    if (!body.productType || !body.productName || !body.selectedBatches || body.selectedBatches.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1) Build and apply inventory movements first (fail-fast on insufficient stock)
    const changes = buildBottlingChanges(body)
    await applyMovements(`bottling:${body.productName}`, changes)

    // 2) Insert bottling run record
    const { data, error } = await supabase
      .from('bottling_runs')
      .insert({
        product_type: body.productType,
        product_name: body.productName,
        mode: body.mode,
        selected_batches: body.selectedBatches,
        dilution_phases: body.dilutionPhases || [],
        bottle_entries: body.bottleEntries || [],
        summary: body.summary,
        notes: body.notes || null
      })
      .select()
      .single()
    if (error) throw error

    return NextResponse.json({ bottlingRun: data, inventoryApplied: changes })
  } catch (error: any) {
    console.error('Error creating bottling run:', error)
    return NextResponse.json({ error: error?.message || 'Failed to create bottling run' }, { status: 400 })
  }
}
