'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  deleteDraftBatch,
  finalizeDraftBatch,
  validateBatchForFinalization,
} from '../services/production-draft.repository'
import type {
  ProductionBatch,
  GinVodkaSpiritBatch,
  RumCaneSpiritBatch,
} from '@/types/production-schemas'
import { isGinVodkaSpiritBatch, isRumCaneSpiritBatch } from '@/types/production-schemas'

interface DraftBatchCardProps {
  batch: ProductionBatch
  onUpdate: () => void
}

export function DraftBatchCard({ batch, onUpdate }: DraftBatchCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    archived: 'bg-neutral-100 text-neutral-800',
  }

  function getBatchId(): string {
    if (isGinVodkaSpiritBatch(batch)) {
      return (batch as GinVodkaSpiritBatch).spiritRunId || batch.id || 'Unknown'
    } else if (isRumCaneSpiritBatch(batch)) {
      return (batch as RumCaneSpiritBatch).batch_name || batch.id || 'Unknown'
    }
    return batch.id || 'Unknown'
  }

  function getBatchName(): string {
    if (isGinVodkaSpiritBatch(batch)) {
      return (batch as GinVodkaSpiritBatch).sku || 'Unnamed Batch'
    } else if (isRumCaneSpiritBatch(batch)) {
      return (batch as RumCaneSpiritBatch).product_name || 'Unnamed Batch'
    }
    return 'Unnamed Batch'
  }

  function getCreatedDate(): string {
    const date = batch.createdAt
    if (!date) return 'Unknown'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this draft?')) return

    setIsDeleting(true)
    try {
      const success = await deleteDraftBatch(batch.id!, batch.productType)
      if (success) {
        onUpdate()
      }
    } catch (error) {
      console.error('Error deleting draft:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleFinalize() {
    // Validate first
    const validation = validateBatchForFinalization(batch)
    if (!validation.valid) {
      setValidationErrors(validation.errors)
      return
    }

    if (!confirm('Finalize this batch? It will be moved to the historical batches.')) return

    setIsFinalizing(true)
    try {
      const result = await finalizeDraftBatch(batch.id!, batch.productType)
      if (result) {
        onUpdate()
      }
    } catch (error) {
      console.error('Error finalizing draft:', error)
    } finally {
      setIsFinalizing(false)
    }
  }

  function handleEdit() {
    router.push(`/dashboard/production/edit/${batch.id}`)
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div>
            <h3 className="text-lg font-medium text-neutral-900">
              {getBatchId()}
            </h3>
            <p className="text-sm text-neutral-600">{getBatchName()}</p>
          </div>

          <div className="mt-4 flex items-center space-x-4 text-sm text-neutral-500">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                statusColors[batch.status]
              }`}
            >
              {batch.status.replace('_', ' ')}
            </span>
            <span>Created: {getCreatedDate()}</span>
            <span className="capitalize">{batch.productType.replace('_', ' ')}</span>
          </div>

          {validationErrors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-medium text-red-800 mb-1">
                Cannot finalize - missing required fields:
              </p>
              <ul className="list-disc list-inside text-sm text-red-700">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="ml-4 flex flex-col space-y-2">
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600"
          >
            Continue
          </button>
          <button
            onClick={handleFinalize}
            disabled={isFinalizing}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50"
          >
            {isFinalizing ? 'Finalizing...' : 'Finalize'}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

