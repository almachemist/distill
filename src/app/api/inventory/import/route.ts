import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


function toNumber(x: any): number {
  const n = Number(x)
  return Number.isFinite(n) ? n : 0
}

type DevilsVariant = { ml: number; bottles: number | null; labels: number | null }
type DevilsProduct = { product: string; variants: DevilsVariant[] }
type MMVariant = { type?: string; ml?: number; quantity?: number | null; labels?: number | null }
type MMProduct = { product: string; variants: MMVariant[] }
type StockTakePayload = { date: string; devils: DevilsProduct[]; merchant_mae: MMProduct[] }

function buildItems(payload: StockTakePayload) {
  const items: Array<{ name: string; category: string; default_uom: string; is_alcohol: boolean; quantity: number }> = []
  for (const p of payload.devils || []) {
    for (const v of p.variants || []) {
      const ml = toNumber(v.ml)
      const bottles = v.bottles == null ? 0 : toNumber(v.bottles)
      const labels = v.labels == null ? 0 : toNumber(v.labels)
      if (bottles > 0) {
        items.push({
          name: `Devils ${p.product} ${ml}ml Bottle`,
          category: 'finished_good',
          default_uom: 'unit',
          is_alcohol: true,
          quantity: bottles,
        })
      }
      if (labels >= 0) {
        items.push({
          name: `Devils ${p.product} ${ml}ml Labels`,
          category: 'packaging_label',
          default_uom: 'unit',
          is_alcohol: false,
          quantity: labels,
        })
      }
    }
  }
  for (const p of payload.merchant_mae || []) {
    for (const v of p.variants || []) {
      const type = (v.type || '').toLowerCase()
      const ml = v.ml == null ? undefined : toNumber(v.ml)
      const qty = v.quantity == null ? null : toNumber(v.quantity)
      const labels = v.labels == null ? null : toNumber(v.labels)
      if (qty != null) {
        if (p.product.toLowerCase().includes('gift packs')) {
          items.push({
            name: `Merchant Mae ${p.product}`,
            category: 'packaging_box',
            default_uom: 'unit',
            is_alcohol: false,
            quantity: qty,
          })
        } else if (type === 'pouches') {
          items.push({
            name: `Merchant Mae ${p.product} Pouch`,
            category: 'packaging_other',
            default_uom: 'unit',
            is_alcohol: false,
            quantity: qty,
          })
        } else if (type === 'bottle') {
          items.push({
            name: `Merchant Mae ${p.product} Bottle`,
            category: 'finished_good',
            default_uom: 'unit',
            is_alcohol: true,
            quantity: qty,
          })
        } else {
          const suffix = ml ? ` ${ml}ml` : ''
          items.push({
            name: `Merchant Mae ${p.product}${suffix}`,
            category: 'finished_good',
            default_uom: 'unit',
            is_alcohol: true,
            quantity: qty,
          })
        }
      }
      if (labels != null) {
        const suffix = ml ? ` ${ml}ml` : ''
        items.push({
          name: `Merchant Mae ${p.product}${suffix} Labels`,
          category: 'packaging_label',
          default_uom: 'unit',
          is_alcohol: false,
          quantity: labels,
        })
      }
    }
  }
  return items
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { supabase, organizationId: org } = auth
    const payload = await req.json() as StockTakePayload
    if (!payload || typeof payload !== 'object' || !payload.date) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    const items = buildItems(payload)
    const { data: existing } = await supabase
      .from('items')
      .select('id')
      .eq('organization_id', org)
      .in('category', ['finished_good', 'packaging_label'])
    const ids = (existing || []).map((x: any) => x.id)
    if (ids.length) {
      await supabase
        .from('inventory_txns')
        .delete()
        .eq('organization_id', org)
        .in('item_id', ids)
      await supabase
        .from('items')
        .delete()
        .eq('organization_id', org)
        .in('id', ids)
    }
    let created = 0
    let received = 0
    const dt = new Date(payload.date).toISOString()
    for (const it of items) {
      const { data: createdItem, error } = await supabase
        .from('items')
        .insert({ organization_id: org, name: it.name, category: it.category, default_uom: it.default_uom, is_alcohol: it.is_alcohol })
        .select('id')
        .single()
      if (error) continue
      created += 1
      const id = createdItem?.id
      const qty = toNumber(it.quantity)
      await supabase
        .from('inventory_txns')
        .insert({ organization_id: org, item_id: id, txn_type: 'RECEIVE', quantity: qty, uom: it.default_uom, note: `Stock take ${payload.date}`, dt })
      received += 1
    }
    return NextResponse.json({ created, movements: received })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Import failed' }, { status: 500 })
  }
}

