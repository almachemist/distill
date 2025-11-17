import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BottlingRun } from '@/types/bottling'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('bottling_runs')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({ bottlingRuns: data || [] })
  } catch (error) {
    console.error('Error fetching bottling runs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bottling runs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json() as BottlingRun
    
    // Validate required fields
    if (!body.productType || !body.productName || !body.selectedBatches || body.selectedBatches.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Insert bottling run
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
    
    // TODO: Update batch volumes (decrease by amount used)
    // TODO: Create inventory transactions for bottled products
    
    return NextResponse.json({ bottlingRun: data })
  } catch (error) {
    console.error('Error creating bottling run:', error)
    return NextResponse.json(
      { error: 'Failed to create bottling run' },
      { status: 500 }
    )
  }
}

