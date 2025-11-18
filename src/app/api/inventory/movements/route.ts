import { NextRequest, NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/jsonStore'
import type { InventoryItem } from '@/types/inventory'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const INVENTORY_PATH = 'data/inventory.json'
const MOVEMENTS_PATH = 'data/inventory_movements.json'

type MovementChange = { id?: string; sku?: string; delta: number; note?: string }

type MovementRecord = {
  dt: string
  reference?: string
  reason?: string
  changes: Array<{ id: string; sku: string; delta: number; before: number; after: number; note?: string }>
}

function sumMovementsBySku(records: MovementRecord[]) {
  const map = new Map<string, number>()
  for (const r of records) {
    for (const ch of r.changes) {
      map.set(ch.sku, (map.get(ch.sku) || 0) + Number(ch.delta || 0))
    }
  }
  return map
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.max(1, Math.min(500, Number(searchParams.get('limit') || 100)))
    const records = await readJson<MovementRecord[]>(MOVEMENTS_PATH, [])
    const slice = records.slice(Math.max(0, records.length - limit)).reverse()
    return NextResponse.json(slice, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load movements' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json() as { reference?: string; reason?: string; changes: MovementChange[] }
    if (!payload?.changes || !Array.isArray(payload.changes) || payload.changes.length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 })
    }

    const items = await readJson<InventoryItem[]>(INVENTORY_PATH, [])
    const existing = await readJson<MovementRecord[]>(MOVEMENTS_PATH, [])

    // Build lookups
    const bySku = new Map(items.map((it) => [it.sku, it]))

    // Resolve targets and coalesce by SKU
    const notFound: MovementChange[] = []
    const pending = new Map<string, { item: InventoryItem; delta: number; note?: string }>()
    for (const ch of payload.changes) {
      const item = ch.id ? items.find(i => i.id === ch.id) : (ch.sku ? bySku.get(ch.sku) : undefined)
      if (!item) { notFound.push(ch); continue }
      const sku = item.sku
      const prev = pending.get(sku)
      pending.set(sku, { item, delta: (prev?.delta || 0) + Number(ch.delta || 0), note: ch.note || prev?.note })
    }
    if (notFound.length) {
      return NextResponse.json({ error: 'Some items not found', notFound }, { status: 404 })
    }

    // Validate non-negative using baseline + existing movements
    const sumBySku = sumMovementsBySku(existing)
    for (const { item, delta } of pending.values()) {
      const baseline = Number(item.currentStock || 0)
      const before = baseline + (sumBySku.get(item.sku) || 0)
      const after = before + delta
      if (after < 0) {
        return NextResponse.json({ error: 'Insufficient stock', detail: { sku: item.sku, requestedDelta: delta, available: before } }, { status: 400 })
      }
    }

    // Build applied records consolidated per SKU
    const applied: MovementRecord['changes'] = []
    for (const { item, delta, note } of pending.values()) {
      const baseline = Number(item.currentStock || 0)
      const before = baseline + (sumBySku.get(item.sku) || 0)
      const after = before + delta
      applied.push({ id: item.id, sku: item.sku, delta, before, after, note })
    }

    // Append movement record (no changes to baseline file here)
    existing.push({ dt: new Date().toISOString(), reference: payload.reference, reason: payload.reason, changes: applied })
    await writeJson(MOVEMENTS_PATH, existing)

    return NextResponse.json({ ok: true, applied })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to apply movements' }, { status: 500 })
  }
}

