import { NextRequest, NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/jsonStore'
import { InventoryItem, InventoryCategory } from '@/types/inventory'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const INVENTORY_PATH = 'data/inventory.json'
const MOVEMENTS_PATH = 'data/inventory_movements.json'

type MovementRecord = {
  dt: string
  reference?: string
  reason?: string
  changes: Array<{ id: string; sku: string; delta: number; before: number; after: number; note?: string }>
}

function isInventoryCategory(x: any): x is InventoryCategory {
  return ['Spirits','Packaging','Labels','Botanicals','RawMaterials'].includes(x)
}

function validateItem(input: any): { ok: true, item: InventoryItem } | { ok: false, error: string } {
  const required = ['sku','name','category','unit','currentStock']
  for (const k of required) if (!(k in input)) return { ok: false, error: `Missing field: ${k}` }
  if (!isInventoryCategory(input.category)) return { ok: false, error: 'Invalid category' }
  if (typeof input.currentStock !== 'number' || Number.isNaN(input.currentStock)) return { ok: false, error: 'currentStock must be a number' }
  if (input.currentStock < 0) return { ok: false, error: 'currentStock cannot be negative' }
  const id = input.id || input.sku
  const item: InventoryItem = { id, ...input }
  return { ok: true, item }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const derived = searchParams.get('derived')
    const wantDerived = derived === '1' || derived === 'true'

    let items = await readJson<InventoryItem[]>(INVENTORY_PATH, [])

    if (wantDerived) {
      const records = await readJson<MovementRecord[]>(MOVEMENTS_PATH, [])
      const sumBySku = new Map<string, number>()
      for (const r of records) {
        for (const ch of r.changes) {
          sumBySku.set(ch.sku, (sumBySku.get(ch.sku) || 0) + Number(ch.delta || 0))
        }
      }
      items = items.map(i => ({ ...i, currentStock: Number(i.currentStock || 0) + (sumBySku.get(i.sku) || 0) }))
    }

    const filtered = category && isInventoryCategory(category)
      ? items.filter(i => i.category === category)
      : items
    return NextResponse.json(filtered, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load inventory' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const res = validateItem(payload)
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 })

    const items = await readJson<InventoryItem[]>(INVENTORY_PATH, [])
    if (items.some(i => i.id === res.item.id)) {
      return NextResponse.json({ error: 'Item with this id already exists' }, { status: 409 })
    }

    items.push(res.item)
    await writeJson(INVENTORY_PATH, items)
    return NextResponse.json(res.item, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create item' }, { status: 500 })
  }
}

