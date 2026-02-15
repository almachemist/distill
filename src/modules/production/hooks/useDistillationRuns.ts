/**
 * React Query hook for distillation runs (gin/spirit batches).
 * Wraps DistillationRunRepository with caching, loading states, and mutations.
 *
 * @example
 * const { data: runs, isLoading } = useDistillationRuns()
 * const { data: run } = useDistillationRun('SPIRIT-GIN-RF-0012')
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DistillationRunRepository, type DistillationRunInput } from '../services/distillation-run.repository'

const QUERY_KEY = 'distillation-runs'

/**
 * Fetch all distillation runs for the current user's organization.
 * Results are cached for 60s and sorted by date descending.
 */
export function useDistillationRuns() {
  const repo = new DistillationRunRepository()

  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => repo.getAll(),
    staleTime: 60_000,
  })
}

/**
 * Fetch a single distillation run by batch_id.
 *
 * @param batchId - The batch identifier (e.g. 'SPIRIT-GIN-RF-0012')
 */
export function useDistillationRun(batchId: string | null) {
  const repo = new DistillationRunRepository()

  return useQuery({
    queryKey: [QUERY_KEY, batchId],
    queryFn: () => repo.getByBatchId(batchId!),
    enabled: !!batchId,
    staleTime: 60_000,
  })
}

/**
 * Mutation hook for creating a new distillation run.
 * Automatically invalidates the runs list cache on success.
 */
export function useCreateDistillationRun() {
  const queryClient = useQueryClient()
  const repo = new DistillationRunRepository()

  return useMutation({
    mutationFn: (data: DistillationRunInput) => repo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

/**
 * Mutation hook for updating an existing distillation run.
 * Invalidates both the list and single-item caches on success.
 *
 * @param batchId - The batch_id to update
 */
export function useUpdateDistillationRun(batchId: string) {
  const queryClient = useQueryClient()
  const repo = new DistillationRunRepository()

  return useMutation({
    mutationFn: (data: Partial<DistillationRunInput>) => repo.update(batchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, batchId] })
    },
  })
}

/**
 * Mutation hook for deleting a distillation run.
 * Invalidates the runs list cache on success.
 *
 * @param batchId - The batch_id to delete
 */
export function useDeleteDistillationRun(batchId: string) {
  const queryClient = useQueryClient()
  const repo = new DistillationRunRepository()

  return useMutation({
    mutationFn: () => repo.delete(batchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}
