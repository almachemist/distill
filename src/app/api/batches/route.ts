import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/batches
 *
 * Returns batch records from the `batches` table (SSOT for finalized + draft batches).
 * Supports optional query params:
 *   - status: 'final' | 'draft' | 'archived' (default: all)
 *   - product_type: 'gin' | 'vodka' | 'rum' | 'cane_spirit' | 'ethanol' | 'other'
 *   - year: number (filters by date year)
 *   - limit: number (default: 500)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const productType = searchParams.get('product_type')
    const year = searchParams.get('year')
    const limit = parseInt(searchParams.get('limit') || '500', 10)

    let query = supabase
      .from('batches')
      .select('*')
      .order('date', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }
    if (productType) {
      query = query.eq('product_type', productType)
    }
    if (year) {
      query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching batches:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Error in GET /api/batches:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
