import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
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


export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { supabase, organizationId: org } = auth
    const { id } = await context.params
    const patch = await req.json()
    if (Object.prototype.hasOwnProperty.call(patch, 'currentStock')) {
      return NextResponse.json({ error: 'Use /api/inventory/movements to adjust stock' }, { status: 400 })
    }
    const updates: any = {}
    if (patch.name !== undefined) updates.name = patch.name
    if (patch.unit !== undefined) updates.default_uom = patch.unit
    if (patch.category !== undefined) updates.category = mapFrontToDbCategory(patch.category)
    if (patch.notes !== undefined) updates.notes = patch.notes
    if (Object.keys(updates).length === 0) return NextResponse.json({ ok: true })
    const { error } = await supabase
      .from('items')
      .update(updates)
      .eq('organization_id', org)
      .eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { supabase, organizationId: org } = auth
    const { id } = await context.params
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('organization_id', org)
      .eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete item' }, { status: 500 })
  }
}
