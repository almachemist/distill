'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/modules/auth/hooks/useAuth'

/**
 * A team member row joined from user_organizations + profiles + auth.users email.
 */
export interface TeamMember {
  id: string
  user_id: string
  organization_id: string
  role: string
  is_active: boolean
  invited_at: string | null
  accepted_at: string | null
  created_at: string | null
  display_name: string | null
  email: string | null
}

const TEAM_KEY = ['team-members'] as const

/**
 * Fetches all team members for the current user's organization.
 *
 * @returns React Query result with TeamMember[]
 */
export function useTeamMembers() {
  const { user } = useAuth()
  const orgId = user?.organizationId

  return useQuery<TeamMember[]>({
    queryKey: [...TEAM_KEY, orgId],
    queryFn: async () => {
      if (!orgId) return []
      const supabase = createClient()

      // Fetch user_organizations rows
      const { data: memberships, error: memError } = await supabase
        .from('user_organizations')
        .select('id, user_id, organization_id, role, is_active, invited_at, accepted_at, created_at')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: true })

      if (memError) throw memError
      if (!memberships?.length) return []

      // Fetch profiles for all member user_ids to get display_name
      const userIds = memberships.map((m) => m.user_id)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds)

      const profileMap = new Map(
        (profiles || []).map((p: any) => [p.id, p.display_name])
      )

      return memberships.map((row) => ({
        id: row.id,
        user_id: row.user_id,
        organization_id: row.organization_id,
        role: row.role,
        is_active: row.is_active ?? true,
        invited_at: row.invited_at,
        accepted_at: row.accepted_at,
        created_at: row.created_at,
        display_name: profileMap.get(row.user_id) ?? null,
        email: null, // Email is in auth.users, not accessible client-side via RLS
      }))
    },
    enabled: !!orgId,
  })
}

/**
 * Mutation to update a team member's role.
 *
 * @returns useMutation for role updates
 */
export function useUpdateTeamMemberRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_organizations')
        .update({ role })
        .eq('id', memberId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_KEY })
    },
  })
}

/**
 * Mutation to deactivate a team member.
 *
 * @returns useMutation for deactivation
 */
export function useDeactivateTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (memberId: string) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_organizations')
        .update({ is_active: false })
        .eq('id', memberId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_KEY })
    },
  })
}
