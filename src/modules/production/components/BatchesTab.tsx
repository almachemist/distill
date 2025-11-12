'use client'

export function BatchesTab() {
  return (
    <div>
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
        <h3 className="mt-2 text-sm font-medium text-neutral-900">
          Historical Batches
        </h3>
        <p className="mt-1 text-sm text-neutral-500">
          This will show all completed production batches.
        </p>
        <p className="mt-2 text-xs text-neutral-400">
          Coming soon: View all historical batches from Supabase
        </p>
      </div>
    </div>
  )
}

