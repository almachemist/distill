'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type MovementRow = {
  id: string
  from_status: string | null
  to_status: string
  movement_type: string
  moved_at: string
  notes: string | null
  blend_batch_id: string | null
}

const statusOptions = ['Aging', 'Decanted', 'Bottled', 'Blended'] as const

type StatusOption = (typeof statusOptions)[number]

export default function BarrelMovementsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const barrelId = decodeURIComponent(params.id)

  const [toStatus, setToStatus] = useState<StatusOption>('Decanted')
  const [notes, setNotes] = useState('')
  const [blendBatchId, setBlendBatchId] = useState('')

  const [movements, setMovements] = useState<MovementRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const showBlendFields = toStatus === 'Blended'

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/barrels/${encodeURIComponent(barrelId)}/movements`, { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to load movements')
      setMovements(Array.isArray(json?.movements) ? json.movements : [])
    } catch (e: any) {
      setError(String(e?.message || 'Failed to load movements'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barrelId])

  const submit = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const payload: any = { toStatus, notes: notes.trim() || undefined }
      if (toStatus === 'Blended') payload.blendBatchId = blendBatchId.trim() || undefined

      const res = await fetch(`/api/barrels/${encodeURIComponent(barrelId)}/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to move barrel')

      setNotes('')
      setBlendBatchId('')
      setSuccess('Saved.')
      router.push(`/dashboard/barrels/${encodeURIComponent(barrelId)}`)
      router.refresh()
    } catch (e: any) {
      setError(String(e?.message || 'Failed to move barrel'))
    } finally {
      setSaving(false)
    }
  }

  const headerHint = useMemo(() => {
    return `Record a lifecycle transition. This updates the barrel's current status and also writes an immutable movement record.`
  }, [])

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/dashboard/barrels/${encodeURIComponent(barrelId)}`} className="text-sm text-graphite/60 hover:text-graphite">
          ← Back to barrel
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-graphite">Move Barrel</h1>
        <div className="mt-1 text-sm text-graphite/70">{headerHint}</div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wide text-graphite/60">To Status</label>
            <select
              value={toStatus}
              onChange={(e) => setToStatus(e.target.value as StatusOption)}
              className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-graphite"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wide text-graphite/60">Notes</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
              className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-graphite"
            />
          </div>

          {showBlendFields ? (
            <div className="md:col-span-2">
              <label className="block text-[11px] uppercase tracking-wide text-graphite/60">Blend Batch ID</label>
              <input
                value={blendBatchId}
                onChange={(e) => setBlendBatchId(e.target.value)}
                placeholder="e.g. BLEND-25-01"
                className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-graphite"
              />
            </div>
          ) : null}
        </div>

        {error ? <div className="mt-4 text-sm text-red-700">{error}</div> : null}
        {success ? <div className="mt-4 text-sm text-emerald-700">{success}</div> : null}

        <div className="mt-6 flex items-center gap-2">
          <button
            onClick={submit}
            disabled={saving}
            className="px-3 py-2 rounded-md text-sm font-medium bg-graphite text-white hover:bg-graphite/90 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Move'}
          </button>
          <button
            onClick={() => router.refresh()}
            className="px-3 py-2 rounded-md text-sm font-medium border border-graphite/20 text-graphite/70 hover:text-graphite hover:border-graphite/30"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-graphite">Movement History</h2>
        {isLoading ? (
          <div className="mt-3 text-sm text-graphite/60">Loading…</div>
        ) : movements.length === 0 ? (
          <div className="mt-3 text-sm text-graphite/60">No moves recorded yet.</div>
        ) : (
          <div className="mt-3 space-y-2">
            {movements.map((m) => (
              <div key={m.id} className="bg-white rounded-lg border border-stone-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm text-graphite">
                      <span className="font-medium">{m.from_status || '—'}</span>
                      <span className="text-graphite/50"> → </span>
                      <span className="font-medium">{m.to_status}</span>
                      <span className="ml-2 text-xs text-graphite/60">({m.movement_type})</span>
                    </div>
                    {m.notes ? <div className="mt-1 text-sm text-graphite/70">{m.notes}</div> : null}
                    {m.blend_batch_id ? <div className="mt-1 text-sm text-graphite/70">Blend: {m.blend_batch_id}</div> : null}
                  </div>
                  <div className="shrink-0 text-xs text-graphite/60">
                    {m.moved_at ? new Date(m.moved_at).toLocaleString() : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
