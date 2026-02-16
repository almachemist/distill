'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface BatchSummary {
  batch_id?: string
  run_id?: string
  display_name?: string
  sku?: string
  recipe?: string
  date?: string
  still_used?: string
  status?: string
  hearts_volume_l?: number | null
  hearts_lal?: number | null
}

/**
 * Shows a summary list of recent historical batches with links to the full Batches page.
 */
export function BatchesTab() {
  const [batches, setBatches] = useState<BatchSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/production/batches')
        if (!res.ok) return
        const payload = await res.json()
        const gin = (payload.gin ?? []) as BatchSummary[]
        const rum = (payload.rum ?? []) as BatchSummary[]
        const all = [...gin, ...rum]
          .sort((a, b) => {
            const da = new Date(a.date || '').getTime() || 0
            const db = new Date(b.date || '').getTime() || 0
            return db - da
          })
          .slice(0, 20)
        setBatches(all)
      } catch { /* ignore */ } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper" />
      </div>
    )
  }

  if (batches.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
        <h3 className="text-sm font-medium text-neutral-900">No batches yet</h3>
        <p className="mt-1 text-sm text-neutral-500">Start a production run to see batches here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">Showing last {batches.length} batches</p>
        <Link href="/dashboard/batches" className="text-sm font-medium text-copper hover:text-copper/80">
          View all batches →
        </Link>
      </div>
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Batch</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Still</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-600">Hearts (L)</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-600">LAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {batches.map((b, i) => {
              const id = b.batch_id || b.run_id || String(i)
              return (
                <tr key={id} className="hover:bg-neutral-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{b.display_name || b.sku || b.recipe || id}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {b.date ? new Date(b.date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{b.still_used || '—'}</td>
                  <td className="px-4 py-3 text-right text-neutral-700">
                    {b.hearts_volume_l != null ? b.hearts_volume_l.toFixed(1) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-copper">
                    {b.hearts_lal != null ? b.hearts_lal.toFixed(2) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

