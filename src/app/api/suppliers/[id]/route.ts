import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Supplier } from '@/types/inventory'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
