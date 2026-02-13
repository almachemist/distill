import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function getOrganizationId(supabase: SupabaseClient): Promise<string> {
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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const organization_id = await getOrganizationId(supabase)

    const { searchParams } = new URL(request.url)
    const productName = (searchParams.get('product_name') || '').trim()

    let q = supabase
      .from('product_pricing')
      .select('product_name, sku, variation, volume_ml, category, metadata')
      .eq('organization_id', organization_id)
      .order('product_name', { ascending: true })
      .order('volume_ml', { ascending: true, nullsFirst: false })

    if (productName) {
      q = q.eq('product_name', productName)
    }

    const { data, error } = await q
    if (error) throw error

    return NextResponse.json({ organization_id, rows: data || [] }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load product catalog', rows: [] }, { status: 500 })
  }
}
