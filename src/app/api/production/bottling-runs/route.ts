import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { BottlingRun, BottleEntry } from '@/types/bottling'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
type Change = { name: string; category: string; delta: number; uom: string }

function sumBySize(entries: BottleEntry[], size: number) {
  return (entries || []).filter(e => e.size_ml === size).reduce((s, e) => s + (e.quantity || 0), 0)
}

const PKG_NAMES = {
  BOTTLE_700: { name: 'Bottle 700ml', category: 'packaging_bottle' },
  BOTTLE_200: { name: 'Bottle 200ml', category: 'packaging_bottle' },
  CORK_700: { name: 'Cork 700ml', category: 'packaging_closure' },
  CAP_200: { name: 'Cap 200ml', category: 'packaging_closure' },
  CARTON_6P_700: { name: 'Carton 6-pack 700ml', category: 'packaging_carton' },
  SLEEVE_700: { name: 'Tamper Sleeve 700ml', category: 'packaging_sleeve' },
  SLEEVE_200: { name: 'Tamper Sleeve 200ml', category: 'packaging_sleeve' },
  BOTTLE_1000: { name: 'Bottle 1000ml', category: 'packaging_bottle' },
  CORK_1000: { name: 'Cork 1000ml', category: 'packaging_closure' },
  SLEEVE_1000: { name: 'Tamper Sleeve 1000ml', category: 'packaging_sleeve' }
}


async function findItemByName(supabase: any, organization_id: string, name: string) {
  const { data } = await supabase
    .from('items')
    .select('id')
    .eq('organization_id', organization_id)
    .eq('name', name)
    .single()
  return data
}

async function ensureItemSupabase(supabase: any, organization_id: string, name: string, category: string, default_uom: string, is_alcohol: boolean): Promise<string> {
  const existing = await findItemByName(supabase, organization_id, name)
  if (existing?.id) return existing.id
  const { data, error } = await supabase
    .from('items')
    .insert({ organization_id, name, category, default_uom, is_alcohol })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

async function getOnHand(supabase: any, organization_id: string, item_id: string): Promise<number> {
  const { data, error } = await supabase
    .from('inventory_txns')
    .select('quantity, txn_type')
    .eq('organization_id', organization_id)
    .eq('item_id', item_id)
  if (error) throw error
  return (data || []).reduce((acc: number, t: any) => {
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
}

function buildBottlingChanges(body: BottlingRun): Change[] {
  const q700 = sumBySize(body.bottleEntries || [], 700)
  const q200 = sumBySize(body.bottleEntries || [], 200)
  const q1000 = sumBySize(body.bottleEntries || [], 1000)
  const changes: Change[] = []
  if (q700 > 0) {
    changes.push({ name: PKG_NAMES.BOTTLE_700.name, category: PKG_NAMES.BOTTLE_700.category, delta: -q700, uom: 'unit' })
    changes.push({ name: PKG_NAMES.CORK_700.name, category: PKG_NAMES.CORK_700.category, delta: -q700, uom: 'unit' })
    changes.push({ name: PKG_NAMES.SLEEVE_700.name, category: PKG_NAMES.SLEEVE_700.category, delta: -q700, uom: 'unit' })
    const cartons = Math.ceil(q700 / 6)
    changes.push({ name: PKG_NAMES.CARTON_6P_700.name, category: PKG_NAMES.CARTON_6P_700.category, delta: -cartons, uom: 'unit' })
    changes.push({ name: `${body.productName} 700ml`, category: 'finished_good', delta: +q700, uom: 'unit' })
    changes.push({ name: `Label 700ml - ${body.productName}`, category: 'packaging_label', delta: -q700, uom: 'unit' })
  }
  if (q200 > 0) {
    changes.push({ name: PKG_NAMES.BOTTLE_200.name, category: PKG_NAMES.BOTTLE_200.category, delta: -q200, uom: 'unit' })
    changes.push({ name: PKG_NAMES.CAP_200.name, category: PKG_NAMES.CAP_200.category, delta: -q200, uom: 'unit' })
    changes.push({ name: PKG_NAMES.SLEEVE_200.name, category: PKG_NAMES.SLEEVE_200.category, delta: -q200, uom: 'unit' })
    changes.push({ name: `${body.productName} 200ml`, category: 'finished_good', delta: +q200, uom: 'unit' })
    changes.push({ name: `Label 200ml - ${body.productName}`, category: 'packaging_label', delta: -q200, uom: 'unit' })
  }
  if (q1000 > 0) {
    changes.push({ name: PKG_NAMES.BOTTLE_1000.name, category: PKG_NAMES.BOTTLE_1000.category, delta: -q1000, uom: 'unit' })
    changes.push({ name: PKG_NAMES.CORK_1000.name, category: PKG_NAMES.CORK_1000.category, delta: -q1000, uom: 'unit' })
    changes.push({ name: PKG_NAMES.SLEEVE_1000.name, category: PKG_NAMES.SLEEVE_1000.category, delta: -q1000, uom: 'unit' })
    changes.push({ name: `${body.productName} 1000ml`, category: 'finished_good', delta: +q1000, uom: 'unit' })
    changes.push({ name: `Label 1000ml - ${body.productName}`, category: 'packaging_label', delta: -q1000, uom: 'unit' })
  }
  return changes
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { supabase } = auth
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
    const body = await request.json() as BottlingRun

    if (!body.productType || !body.productName || !body.selectedBatches || body.selectedBatches.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { supabase, organizationId: organization_id } = auth

    const changes = buildBottlingChanges(body)

    const resolvedItems: { change: Change; item_id: string }[] = []
    for (const ch of changes) {
      const item_id = await ensureItemSupabase(supabase, organization_id, ch.name, ch.category, ch.uom, ch.category === 'finished_good')
      resolvedItems.push({ change: ch, item_id })
    }

    for (const r of resolvedItems) {
      if (r.change.delta < 0) {
        const available = await getOnHand(supabase, organization_id, r.item_id)
        if (available + r.change.delta < 0) {
          return NextResponse.json({ error: `Insufficient stock for ${r.change.name}. Required: ${-r.change.delta}, Available: ${available}` }, { status: 400 })
        }
      }
    }

    const txns = resolvedItems.map(r => ({
      organization_id,
      item_id: r.item_id,
      lot_id: null,
      txn_type: r.change.delta >= 0 ? 'PRODUCE' : 'CONSUME',
      quantity: Math.abs(r.change.delta),
      uom: r.change.uom,
      note: `Bottling ${body.productName}`,
      dt: new Date().toISOString()
    }))

    const { error: insertErr } = await supabase
      .from('inventory_txns')
      .insert(txns)
    if (insertErr) throw insertErr

    let bottlingRow: any = null
    {
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
      bottlingRow = data
    }

    {
      const tankUse: Record<string, number> = {}
      for (const sb of body.selectedBatches || []) {
        const tc = sb?.batch?.tankCode
        if (!tc) continue
        const use = Number(sb?.volumeToUseLitres || 0)
        tankUse[tc] = (tankUse[tc] || 0) + use
      }
      for (const tankCode of Object.keys(tankUse)) {
        const { data: tank, error: tankErr } = await supabase
          .from('tanks')
          .select('*')
          .eq('organization_id', organization_id)
          .eq('tank_id', tankCode)
          .single()
        if (tankErr) {
          console.warn('Tank fetch failed for', tankCode, tankErr?.message)
          continue
        }
        const available = Number(tank.current_volume_l ?? 0)
        if (available < tankUse[tankCode]) {
          return NextResponse.json({ error: `Insufficient tank volume for ${tankCode}. Available: ${available}, Required: ${tankUse[tankCode]}` }, { status: 400 })
        }
        const remaining = Math.max(available - tankUse[tankCode], 0)
        const newStatus = remaining <= 0 ? 'bottled_empty' : (tank.status || 'ready_to_bottle')
        const updates = {
          current_volume_l: remaining,
          status: newStatus,
          last_updated_by: 'Bottling'
        }
        const { error: updErr } = await supabase
          .from('tanks')
          .update(updates)
          .eq('organization_id', organization_id)
          .eq('tank_id', tankCode)
        if (updErr) {
          console.warn('Tank update failed for', tankCode, updErr?.message)
          continue
        }
        await supabase
          .from('tank_history')
          .insert({
            organization_id,
            tank_id: tank.id || tankCode,
            action: 'Bottling run',
            user_name: 'Bottling',
            previous_values: {
              tank_name: tank.tank_name,
              capacity_l: tank.capacity_l,
              product: tank.product,
              current_abv: tank.current_abv,
              current_volume_l: tank.current_volume_l,
              status: tank.status,
              notes: tank.notes
            },
            new_values: updates,
            notes: `Bottled: ${body.productName}`
          })
      }
    }

    return NextResponse.json({ bottlingRun: bottlingRow, inventoryApplied: changes })
  } catch (error: any) {
    console.error('Error creating bottling run:', error)
    return NextResponse.json({ error: error?.message || 'Failed to create bottling run' }, { status: 400 })
  }
}
function ensureItem() {}
