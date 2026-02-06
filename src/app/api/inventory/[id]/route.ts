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

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const org = await getOrgId(supabase)
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
    const supabase = await createClient()
    const org = await getOrgId(supabase)
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
