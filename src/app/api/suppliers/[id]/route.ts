import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { Supplier } from '@/types/inventory'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { supabase, organizationId: org } = auth
    const { id } = await context.params
    const patch = await req.json()
    const updates: any = {}
    if (patch.name !== undefined) updates.name = patch.name
    if (patch.contactName !== undefined) updates.contact_name = patch.contactName
    if (patch.email !== undefined) updates.email = patch.email
    if (patch.phone !== undefined) updates.phone = patch.phone
    if (patch.notes !== undefined) updates.notes = patch.notes
    const { data, error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('organization_id', org)
      .eq('id', id)
      .select('id, name, contact_name, email, phone, notes')
      .single()
    if (error) throw error
    const supplier: Supplier = { id: data.id, name: data.name, contactName: data.contact_name || '', email: data.email || '', phone: data.phone || '', notes: data.notes || '' }
    return NextResponse.json(supplier)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update supplier' }, { status: 500 })
  }
}
