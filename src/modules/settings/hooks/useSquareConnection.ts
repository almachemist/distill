'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/modules/auth/hooks/useAuth'

/**
 * Square connection data from the square_connections table.
 */
export interface SquareConnection {
  id: string
  organization_id: string
  merchant_id: string | null
  location_ids: string[]
  last_sync_at: string | null
  sync_status: 'idle' | 'syncing' | 'error'
  token_expires_at: string | null
  created_at: string | null
  updated_at: string | null
}

const SQUARE_KEY = ['square-connection'] as const

/**
 * Fetches the current org's Square POS connection status.
 * Does NOT return access/refresh tokens (those stay server-side only).
 *
 * @returns React Query result with SquareConnection or null
 */
export function useSquareConnection() {
  const { user } = useAuth()
  const orgId = user?.organizationId

  return useQuery<SquareConnection | null>({
    queryKey: [...SQUARE_KEY, orgId],
    queryFn: async () => {
      if (!orgId) return null
      const supabase = createClient()
      const { data, error } = await supabase
        .from('square_connections')
        .select('id, organization_id, merchant_id, location_ids, last_sync_at, sync_status, token_expires_at, created_at, updated_at')
        .eq('organization_id', orgId)
        .maybeSingle()

      if (error) throw error
      return data as SquareConnection | null
    },
    enabled: !!orgId,
  })
}

/**
 * Mutation to disconnect Square POS (deletes the connection row).
 *
 * @returns useMutation for disconnecting
 */
export function useDisconnectSquare() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async () => {
      const orgId = user?.organizationId
      if (!orgId) throw new Error('No organization found')

      // Call server-side API to properly revoke tokens + delete row
      const res = await fetch('/api/integrations/square/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to disconnect Square')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SQUARE_KEY })
    },
  })
}

/**
 * Mutation to trigger a manual Square sync.
 *
 * @returns useMutation for triggering sync
 */
export function useTriggerSquareSync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/integrations/square/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to trigger sync')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SQUARE_KEY })
    },
  })
}
