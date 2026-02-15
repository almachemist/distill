'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/modules/auth/hooks/useAuth'

/**
 * Organization data shape from the organizations table.
 */
export interface Organization {
  id: string
  name: string
  slug: string | null
  logo_url: string | null
  timezone: string | null
  currency: string | null
  subscription_tier: string
  subscription_status: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  trial_ends_at: string | null
  max_users: number
  max_barrels: number
  max_batches_per_month: number
  settings: Record<string, unknown> | null
  created_at: string | null
  updated_at: string | null
}

/**
 * Fields that can be updated on an organization.
 */
export type OrganizationUpdate = Partial<
  Pick<Organization, 'name' | 'slug' | 'logo_url' | 'timezone' | 'currency' | 'settings'>
>

const ORG_KEY = ['organization'] as const

/**
 * Fetches the current user's organization.
 *
 * @returns React Query result with Organization data
 */
export function useOrganization() {
  const { user } = useAuth()
  const orgId = user?.organizationId

  return useQuery<Organization | null>({
    queryKey: [...ORG_KEY, orgId],
    queryFn: async () => {
      if (!orgId) return null
      const supabase = createClient()
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()

      if (error) throw error
      return data as Organization
    },
    enabled: !!orgId,
  })
}

/**
 * Mutation hook for updating organization settings.
 *
 * @returns useMutation result for updating organization fields
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (updates: OrganizationUpdate) => {
      const orgId = user?.organizationId
      if (!orgId) throw new Error('No organization found')

      const supabase = createClient()
      const { data, error } = await supabase
        .from('organizations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', orgId)
        .select()
        .single()

      if (error) throw error
      return data as Organization
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_KEY })
    },
  })
}
