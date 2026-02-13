import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { SupabaseClient, User } from '@supabase/supabase-js'

export type AuthContext = {
  supabase: SupabaseClient
  user: User
  organizationId: string
}

/**
 * Authenticate the current request and resolve the user's active organization.
 * Returns an AuthContext on success, or a NextResponse error on failure.
 *
 * Usage in route handlers:
 *   const auth = await requireAuth()
 *   if (auth instanceof NextResponse) return auth
 *   const { supabase, user, organizationId } = auth
 */
export async function requireAuth(): Promise<AuthContext | NextResponse> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json(
      { error: 'not_authenticated' },
      { status: 401 }
    )
  }

  // Get the user's active organization via user_organizations
  const { data: membership, error: membershipError } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .single()

  if (membershipError || !membership?.organization_id) {
    // Fallback: check profiles table for legacy organization_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (profile?.organization_id) {
      return { supabase, user, organizationId: profile.organization_id }
    }

    return NextResponse.json(
      { error: 'no_organization', message: 'User is not a member of any organization' },
      { status: 403 }
    )
  }

  return { supabase, user, organizationId: membership.organization_id }
}

/**
 * Lightweight auth check — just verifies the user is authenticated.
 * Does not resolve organization. Use when org context isn't needed.
 */
export async function requireUser(): Promise<{ supabase: SupabaseClient; user: User } | NextResponse> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json(
      { error: 'not_authenticated' },
      { status: 401 }
    )
  }

  return { supabase, user }
}
