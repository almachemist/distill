/**
 * React Query hook for rum production runs.
 * Wraps RumProductionRepository with caching, loading states, and mutations.
 *
 * @example
 * const { data: batches, isLoading } = useRumBatches()
 * const { data: batch } = useRumBatch('RUM-23-001')
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RumProductionRepository } from '../services/rum-production.repository'
import type { RumProductionRunDB } from '../types/rum-production.types'

const QUERY_KEY = 'rum-batches'

/**
 * Fetch all rum production runs for the current user's organization.
 * Results are cached for 60s and sorted by distillation_date descending.
 */
export function useRumBatches() {
  const repo = new RumProductionRepository()

  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => repo.getAll(),
    staleTime: 60_000,
  })
}

/**
 * Fetch a single rum batch by batch_id.
 *
 * @param batchId - The batch identifier (e.g. 'RUM-23-001')
 */
export function useRumBatch(batchId: string | null) {
  const repo = new RumProductionRepository()

  return useQuery({
    queryKey: [QUERY_KEY, batchId],
    queryFn: () => repo.getByBatchId(batchId!),
    enabled: !!batchId,
    staleTime: 60_000,
  })
}

/**
 * Mutation hook for creating a new rum production run.
 * Automatically invalidates the rum batches list cache on success.
 */
export function useCreateRumBatch() {
  const queryClient = useQueryClient()
  const repo = new RumProductionRepository()

  return useMutation({
    mutationFn: (data: Partial<RumProductionRunDB>) => repo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

/**
 * Mutation hook for updating an existing rum production run.
 *
 * @param batchId - The batch_id to update
 */
export function useUpdateRumBatch(batchId: string) {
  const queryClient = useQueryClient()
  const repo = new RumProductionRepository()

  return useMutation({
    mutationFn: (data: Partial<RumProductionRunDB>) => repo.update(batchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, batchId] })
    },
  })
}
