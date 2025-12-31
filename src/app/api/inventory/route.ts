import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { InventoryItem, InventoryCategory } from '@/types/inventory'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

function validateItem(input: any): { ok: true, item: InventoryItem } | { ok: false, error: string } {
  const required = ['name','category','unit','currentStock']
  for (const k of required) if (!(k in input)) return { ok: false, error: `Missing field: ${k}` }
  if (!isInventoryCategory(input.category)) return { ok: false, error: 'Invalid category' }
  if (typeof input.currentStock !== 'number' || Number.isNaN(input.currentStock)) return { ok: false, error: 'currentStock must be a number' }
  if (input.currentStock < 0) return { ok: false, error: 'currentStock cannot be negative' }
  const id = input.id || ''
  const sku = id || ''
  const item: InventoryItem = { id, sku, name: input.name, category: input.category, unit: input.unit, currentStock: input.currentStock }
  return { ok: true, item }
}

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
    const list: InventoryItem[] = []
    for (const it of items || []) {
      const { data: txns } = await supabase
        .from('inventory_txns')
        .select('quantity, txn_type')
        .eq('organization_id', org)
        .eq('item_id', it.id)
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
    return NextResponse.json(filtered, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    const flag = (process.env.NEXT_PUBLIC_USE_STATIC_DATA || '').toLowerCase()
    const useStatic = flag === '1' || flag === 'true' || flag === 'yes' || process.env.NODE_ENV === 'development'
    if (useStatic) {
      return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } })
    }
    return NextResponse.json({ error: e?.message || 'Failed to load inventory' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const org = await getOrgId(supabase)
    const payload = await req.json()
    const res = validateItem(payload)
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 })
    const dbCat = mapFrontToDbCategory(res.item.category)
    const isAlcohol = res.item.category === 'Spirits'
    const { data: created, error } = await supabase
      .from('items')
      .insert({ organization_id: org, name: res.item.name, category: dbCat, default_uom: res.item.unit, is_alcohol: isAlcohol })
      .select('id, name, category, default_uom, is_alcohol')
      .single()
    if (error) throw error
    if (res.item.currentStock && res.item.currentStock > 0) {
      await supabase
        .from('inventory_txns')
        .insert({ organization_id: org, item_id: created.id, txn_type: 'RECEIVE', quantity: res.item.currentStock, uom: res.item.unit, note: 'Initial receipt', dt: new Date().toISOString() })
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
    const item: InventoryItem = { id: created.id, sku: created.id, name: created.name, category: frontCat, unit: created.default_uom || 'unit', currentStock: onHand }
    return NextResponse.json(item, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create item' }, { status: 500 })
  }
}
