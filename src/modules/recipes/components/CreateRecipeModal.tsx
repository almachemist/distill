'use client'

interface CreateRecipeModalProps {
  show: boolean
  creating: boolean
  error: string | null
  name: string
  description: string
  notes: string
  baseL: string
  targetAbvPct: string
  onNameChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  onNotesChange: (v: string) => void
  onBaseLChange: (v: string) => void
  onTargetAbvPctChange: (v: string) => void
  onCreate: () => void
  onClose: () => void
}

export function CreateRecipeModal({
  show,
  creating,
  error,
  name,
  description,
  notes,
  baseL,
  targetAbvPct,
  onNameChange,
  onDescriptionChange,
  onNotesChange,
  onBaseLChange,
  onTargetAbvPctChange,
  onCreate,
  onClose,
}: CreateRecipeModalProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-xl rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Create recipe card</h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="new_recipe_name">Name</label>
            <input
              id="new_recipe_name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Mango Chili Vodka Trial"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="new_recipe_description">Type / Status</label>
            <textarea
              id="new_recipe_description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="new_recipe_notes">Notes</label>
            <textarea
              id="new_recipe_notes"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="new_recipe_base_l">Base batch size (L)</label>
              <input
                id="new_recipe_base_l"
                type="number"
                step="any"
                min="0"
                value={baseL}
                onChange={(e) => onBaseLChange(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="new_recipe_target_abv">Target ABV (%)</label>
              <input
                id="new_recipe_target_abv"
                type="number"
                step="any"
                min="0"
                value={targetAbvPct}
                onChange={(e) => onTargetAbvPctChange(e.target.value)}
                placeholder="Optional"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onCreate}
            disabled={creating}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {creating ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
