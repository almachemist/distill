import { NextRequest, NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/jsonStore'
import { InventoryItem } from '@/types/inventory'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const INVENTORY_PATH = 'data/inventory.json'
const BASELINE_PROTECTED = new Set<string>([
  'RAIN-700','RAIN-200','SIGN-700','SIGN-200','NAVY-700','NAVY-200',
  'CANE-700','CANE-200','WET-700','DRY-700','PINE-200','PINE-700',
  'SPICED-200','SPICED-700','MM-GIN-700','MM-GIN-POUCH','MM-VODKA-700',
  'MM-VODKA-POUCH','MM-WR-700','MM-DR-700','RESRUM-700','COFFEE-700',
  'GIFT-GIN','GIFT-RUM'
])

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const items = await readJson<InventoryItem[]>(INVENTORY_PATH, [])
    const idx = items.findIndex(i => i.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })


    const patch = await req.json()
    if (Object.prototype.hasOwnProperty.call(patch, 'currentStock')) {
      return NextResponse.json({ error: 'Use /api/inventory/movements to adjust stock' }, { status: 400 })
    }

    items[idx] = { ...items[idx], ...patch, id }
    await writeJson(INVENTORY_PATH, items)
    return NextResponse.json(items[idx])
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const items = await readJson<InventoryItem[]>(INVENTORY_PATH, [])
    const idx = items.findIndex(i => i.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (BASELINE_PROTECTED.has(items[idx].sku)) {
      return NextResponse.json({ error: 'Cannot delete baseline stock item' }, { status: 400 })
    }

    items.splice(idx, 1)
    await writeJson(INVENTORY_PATH, items)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete item' }, { status: 500 })
  }
}

