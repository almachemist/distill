'use client'

interface ParsedMeta {
  recipeType: string | null
  status: string | null
  createdDate: string | null
  traceabilityNotes: string | null
  otherNotes: string | null
  targetBatchSizeL: number | null
  finalAbvProvidedPct: number | null
}

interface RecipeMetaHeaderProps {
  recipeName: string
  parsedMeta: ParsedMeta
  editingMeta: boolean
  metaDraftDescription: string
  setMetaDraftDescription: (v: string) => void
  metaDraftNotes: string
  setMetaDraftNotes: (v: string) => void
  savingMeta: boolean
  enterMetaEditMode: () => void
  cancelMetaEdit: () => void
  saveMetaEdits: () => void
}

export function RecipeMetaHeader({
  recipeName, parsedMeta, editingMeta,
  metaDraftDescription, setMetaDraftDescription, metaDraftNotes, setMetaDraftNotes,
  savingMeta, enterMetaEditMode, cancelMetaEdit, saveMetaEdits,
}: RecipeMetaHeaderProps) {
  return (
    <>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">{recipeName}</h2>
        <div className="flex flex-wrap items-center justify-between gap-2">
          {(parsedMeta.recipeType || parsedMeta.status) && !editingMeta && (
            <div className="flex flex-wrap gap-2 text-sm">
              {parsedMeta.recipeType && (
                <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-800">{parsedMeta.recipeType}</span>
              )}
              {parsedMeta.status && (
                <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">{parsedMeta.status}</span>
              )}
            </div>
          )}
          {!editingMeta ? (
            <button type="button" onClick={enterMetaEditMode} className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200">Edit recipe details</button>
          ) : (
            <div className="flex gap-2">
              <button type="button" onClick={saveMetaEdits} disabled={savingMeta} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50">{savingMeta ? 'Saving…' : 'Save details'}</button>
              <button type="button" onClick={cancelMetaEdit} disabled={savingMeta} className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {parsedMeta.createdDate && (
          <div className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Created</div>
            <div className="mt-1 text-sm font-semibold text-gray-900">{parsedMeta.createdDate}</div>
          </div>
        )}
        {parsedMeta.targetBatchSizeL != null && (
          <div className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Target batch size</div>
            <div className="mt-1 text-sm font-semibold text-gray-900">{parsedMeta.targetBatchSizeL} L</div>
          </div>
        )}
        {parsedMeta.finalAbvProvidedPct != null && (
          <div className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Final ABV (provided)</div>
            <div className="mt-1 text-sm font-semibold text-gray-900">{parsedMeta.finalAbvProvidedPct.toFixed(2)}%</div>
          </div>
        )}
      </div>

      {editingMeta ? (
        <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Type / Status (description)</div>
            <textarea value={metaDraftDescription} onChange={(e) => setMetaDraftDescription(e.target.value)} rows={2}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Notes</div>
            <textarea value={metaDraftNotes} onChange={(e) => setMetaDraftNotes(e.target.value)} rows={4}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      ) : (
        <>
          {parsedMeta.traceabilityNotes && (
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Traceability</div>
              <div className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{parsedMeta.traceabilityNotes}</div>
            </div>
          )}
          {parsedMeta.otherNotes && (
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Notes</div>
              <div className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{parsedMeta.otherNotes}</div>
            </div>
          )}
        </>
      )}
    </>
  )
}
