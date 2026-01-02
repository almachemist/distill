import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { InventoryItem, InventoryCategory } from '@/types/inventory'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function log(level: 'info' | 'error', message: string, meta?: Record<string, any>) {
  const entry = { level, message, time: new Date().toISOString(), ...(meta || {}) }
  if (level === 'error') console.error(JSON.stringify(entry))
  else console.log(JSON.stringify(entry))
}
function getReqId(req: NextRequest) {
  return req.headers.get('x-request-id') || `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`
}

function mapFrontToDbCategory(front: InventoryCategory): string {
  if (front === 'Spirits') return 'finished_good'
  if (front === 'Packaging') return 'packaging_other'
  if (front === 'Labels') return 'packaging_label'
  if (front === 'Botanicals') return 'botanical'
  return 'other'
}

function mapDbToFrontCategory(dbCat?: string, isAlcohol?: boolean): InventoryCategory {
  if (dbCat && dbCat.startsWith('packaging_')) return dbCat === 'packaging_label' ? 'Labels' : 'Packaging'
  if (dbCat === 'botanical') return 'Botanicals'
  if (isAlcohol) return 'Spirits'
  return 'RawMaterials'
}

async function getOrgId(supabase: any): Promise<string> {
  if (process.env.NODE_ENV === 'development') return '00000000-0000-0000-0000-000000000001'
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()
  if (!profile?.organization_id) throw new Error('User organization not found')
  return profile.organization_id
}

function isInventoryCategory(x: any): x is InventoryCategory {
  return ['Spirits','Packaging','Labels','Botanicals','RawMaterials'].includes(x)
}

const ItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  category: z.enum(['Spirits','Packaging','Labels','Botanicals','RawMaterials']),
  unit: z.enum(['bottle','carton','pack','g','kg','L','ml','unit']),
  currentStock: z.number().min(0)
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const org = await getOrgId(supabase)
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const { data: items, error } = await supabase
      .from('items')
      .select('id, name, category, default_uom, is_alcohol')
      .eq('organization_id', org)
      .order('name')
    if (error) throw error
    const { data: aggTxns } = await supabase
      .from('inventory_txns')
      .select('item_id, quantity, txn_type')
      .eq('organization_id', org)
    const totals = new Map<string | number, number>()
    for (const t of aggTxns || []) {
      const q = Number(t.quantity || 0)
      const prev = totals.get(t.item_id as any) || 0
      switch (t.txn_type) {
        case 'RECEIVE':
        case 'PRODUCE':
          totals.set(t.item_id as any, prev + q)
          break
        case 'CONSUME':
        case 'TRANSFER':
        case 'DESTROY':
        case 'ADJUST':
          totals.set(t.item_id as any, prev - q)
          break
      }
    }
    const list: InventoryItem[] = []
    for (const it of items || []) {
      const onHand = totals.get(it.id) || 0
      const frontCat = mapDbToFrontCategory(it.category, it.is_alcohol)
      list.push({
        id: it.id,
        sku: it.id,
        name: it.name,
        category: frontCat,
        unit: it.default_uom || 'unit',
        currentStock: onHand,
      })
    }
    const filtered = category && isInventoryCategory(category)
      ? list.filter(i => i.category === category)
      : list
    log('info', 'inventory_list', { org, count: filtered.length, category: category || 'all', reqId: getReqId(req) })
    return NextResponse.json(filtered, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    const flag = (process.env.NEXT_PUBLIC_USE_STATIC_DATA || '').toLowerCase()
    const useStatic = flag === '1' || flag === 'true' || flag === 'yes' || process.env.NODE_ENV === 'development'
    if (useStatic) {
      return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } })
    }
    log('error', 'inventory_list_error', { error: e?.message, reqId: getReqId(req) })
    return NextResponse.json({ error: e?.message || 'Failed to load inventory' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const org = await getOrgId(supabase)
    const payload = await req.json()
    const parsed = ItemSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const input = parsed.data
    const item: InventoryItem = {
      id: input.id || '',
      sku: input.id || '',
      name: input.name,
      category: input.category,
      unit: input.unit,
      currentStock: input.currentStock
    }
    const dbCat = mapFrontToDbCategory(item.category)
    const isAlcohol = item.category === 'Spirits'
    const { data: created, error } = await supabase
      .from('items')
      .insert({ organization_id: org, name: item.name, category: dbCat, default_uom: item.unit, is_alcohol: isAlcohol })
      .select('id, name, category, default_uom, is_alcohol')
      .single()
    if (error) throw error
    if (item.currentStock && item.currentStock > 0) {
      await supabase
        .from('inventory_txns')
        .insert({ organization_id: org, item_id: created.id, txn_type: 'RECEIVE', quantity: item.currentStock, uom: item.unit, note: 'Initial receipt', dt: new Date().toISOString() })
    }
    const { data: txns } = await supabase
      .from('inventory_txns')
      .select('quantity, txn_type')
      .eq('organization_id', org)
      .eq('item_id', created.id)
    const onHand = (txns || []).reduce((acc: number, t: any) => {
      switch (t.txn_type) {
        case 'RECEIVE':
        case 'PRODUCE':
          return acc + Number(t.quantity || 0)
        case 'CONSUME':
        case 'TRANSFER':
        case 'DESTROY':
        case 'ADJUST':
          return acc - Number(t.quantity || 0)
        default:
          return acc
      }
    }, 0)
    const frontCat = mapDbToFrontCategory(created.category, created.is_alcohol)
    const out: InventoryItem = { id: created.id, sku: created.id, name: created.name, category: frontCat, unit: (created.default_uom || 'unit') as any, currentStock: onHand }
    log('info', 'inventory_item_created', { org, id: created.id, name: created.name, unit: created.default_uom || 'unit', reqId: getReqId(req) })
    return NextResponse.json(out, { status: 201 })
  } catch (e: any) {
    log('error', 'inventory_item_create_error', { error: e?.message, reqId: getReqId(req) })
    return NextResponse.json({ error: e?.message || 'Failed to create item' }, { status: 500 })
  }
}
