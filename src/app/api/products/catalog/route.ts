import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { supabase, organizationId: organization_id } = auth

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
