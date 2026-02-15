import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

/**
 * GET /api/recipes
 * Returns all recipes for the authenticated user's organization.
 * RLS ensures org-scoped data isolation.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('recipes')
      .select('id, name, description, notes, created_at, updated_at')
      .order('name')

    if (error) {
      console.error('Error fetching recipes:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ recipes: data || [] })
  } catch (error: any) {
    console.error('Error in GET /api/recipes:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
