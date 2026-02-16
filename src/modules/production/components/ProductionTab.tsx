'use client'

import { useState, useEffect } from 'react'
import { NewProductionModal } from './NewProductionModal'
import { DraftBatchCard } from './DraftBatchCard'
import { getDraftBatches } from '../services/production-draft.repository'
import type { ProductionBatch } from '@/types/production-schemas'

export function ProductionTab() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [drafts, setDrafts] = useState<ProductionBatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDrafts()
  }, [])

  async function loadDrafts() {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getDraftBatches()
      setDrafts(data)
    } catch (err) {
      console.error('Error loading drafts:', err)
      setError(err instanceof Error ? err.message : 'Failed to load drafts')
    } finally {
      setIsLoading(false)
    }
  }

  function handleDraftCreated() {
    setIsModalOpen(false)
    loadDrafts()
  }

  function handleDraftUpdated() {
    loadDrafts()
  }

  return (
    <div>
      {/* New Production Button */}
      <div className="mb-8">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Production
        </button>
      </div>

      {/* Drafts Section */}
      <div>
        <h2 className="text-lg font-medium text-neutral-900 mb-4">
          Drafts in Progress
        </h2>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
            <p className="mt-2 text-sm text-neutral-600">Loading drafts...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 text-sm mb-3">{error}</p>
            <button onClick={loadDrafts} className="px-4 py-2 bg-amber-700 text-white text-sm rounded-md hover:bg-amber-800">Retry</button>
          </div>
        ) : drafts.length === 0 ? (
          <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-neutral-900">No drafts</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Get started by creating a new production batch.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600"
              >
                New Production
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {drafts.map((draft) => (
              <DraftBatchCard
                key={draft.id}
                batch={draft}
                onUpdate={handleDraftUpdated}
              />
            ))}
          </div>
        )}
      </div>

      {/* New Production Modal */}
      <NewProductionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleDraftCreated}
      />
    </div>
  )
}

