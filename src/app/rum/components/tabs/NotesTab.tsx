import type { RumBatch } from "../types"

interface NotesTabProps {
  batch: RumBatch
}

export function NotesTab({ batch }: NotesTabProps) {
  const notes = batch.notes

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-amber-100 bg-amber-50/70 px-6 py-6 shadow-inner">
        <h2 className="text-lg font-serif font-semibold text-amber-900">Production Diary</h2>
        {notes ? (
          <p className="mt-3 whitespace-pre-line text-sm text-amber-900/80">{notes}</p>
        ) : (
          <p className="mt-3 text-sm text-neutral-500">No notes recorded for this batch yet.</p>
        )}
      </section>

      <section className="rounded-3xl border border-dashed border-amber-200 bg-white px-6 py-6 text-sm text-neutral-500">
        Future enhancement: add structured log entries, photos, and sensor attachments.
      </section>
    </div>
  )
}
