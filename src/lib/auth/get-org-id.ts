import { createClient } from '@/lib/supabase/client'

let _cachedOrgId: string | null = null
let _cacheUserId: string | null = null

/**
 * Get the current authenticated user's organization ID (client-side).
 * Caches per user session to avoid repeated queries.
 * Throws if the user is not authenticated or has no organization.
 */
export async function getOrganizationId(): Promise<string> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Return cached value if same user
  if (_cachedOrgId && _cacheUserId === user.id) {
    return _cachedOrgId
  }

  // Try user_organizations first (new multi-org table)
  const { data: membership } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .single()

  if (membership?.organization_id) {
    _cachedOrgId = membership.organization_id
    _cacheUserId = user.id
    return membership.organization_id
  }

  // Fallback to profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) {
    throw new Error('User has no organization')
  }

  _cachedOrgId = profile.organization_id
  _cacheUserId = user.id
  return profile.organization_id
}

/**
 * Clear the cached org ID (call on logout or org switch).
 */
export function clearOrgCache() {
  _cachedOrgId = null
  _cacheUserId = null
}
