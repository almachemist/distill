'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Barrel } from '@/modules/barrels/types/barrel.types'

export default function RecordAngelsSharePage() {
  const router = useRouter()
  const params = useParams() as { id?: string } | null
  const barrelId = params?.id as string

  const [barrel, setBarrel] = useState<Barrel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [afterVolume, setAfterVolume] = useState<string>('')
  const [afterAbv, setAfterAbv] = useState<string>('')

  useEffect(() => {
    const load = async () => {
      if (!barrelId) {
        setError('Missing barrel id')
        setIsLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/barrels/${encodeURIComponent(barrelId)}`, { cache: 'no-store' })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(json?.error || `Failed to load barrel: ${res.status}`)
        }
        const json = await res.json() as { barrel: Barrel }
        const b = json?.barrel || null
        setBarrel(b)
        if (b) {
          setAfterVolume(String(Math.max(0, b.currentVolume || 0)))
          setAfterAbv(String(Math.max(0, b.abv || 0)))
        }
      } catch (e: any) {
        setError(String(e?.message || 'Failed to load barrel'))
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [barrelId])

  const preview = useMemo(() => {
    if (!barrel) return null
    const beforeVol = Number.isFinite(barrel.originalVolume) && barrel.originalVolume > 0 ? barrel.originalVolume : barrel.currentVolume
    const beforeAbv = barrel.abv

    const aVol = parseFloat(afterVolume)
    const aAbv = parseFloat(afterAbv)
    if (!Number.isFinite(aVol) || !Number.isFinite(aAbv) || aVol <= 0 || aAbv <= 0) return null

    const volumeLoss = Math.max(0, beforeVol - aVol)
    const volumeLossPct = beforeVol > 0 ? (volumeLoss / beforeVol) * 100 : 0

    const lalBefore = beforeVol * (beforeAbv / 100)
    const lalAfter = aVol * (aAbv / 100)
    const lalLoss = Math.max(0, lalBefore - lalAfter)

    return {
      volumeLoss,
      volumeLossPct,
      lalLoss,
    }
  }, [barrel, afterVolume, afterAbv])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!barrelId) return

    setIsSaving(true)
    setError(null)

    try {
      const aVol = parseFloat(afterVolume)
      const aAbv = parseFloat(afterAbv)

      const res = await fetch(`/api/barrels/${encodeURIComponent(barrelId)}/angels-share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ afterVolume: aVol, afterAbv: aAbv }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || `Failed to record angel’s share: ${res.status}`)
      }

      router.push(`/dashboard/barrels/${encodeURIComponent(barrelId)}`)
      router.refresh()
    } catch (e: any) {
      setError(String(e?.message || 'Failed to record angel’s share'))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-graphite/60">Loading…</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href={`/dashboard/barrels/${encodeURIComponent(barrelId || '')}`} className="text-sm text-graphite/60 hover:text-graphite">
          ← Back to barrel
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-graphite">Record Angel’s Share</h1>
        <div className="mt-1 text-sm text-graphite/60">
          {barrel?.barrelNumber ? `Barrel ${barrel.barrelNumber}` : '—'}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-graphite" htmlFor="afterVolume">Measured Volume (after)</label>
            <input
              id="afterVolume"
              inputMode="decimal"
              value={afterVolume}
              onChange={(e) => setAfterVolume(e.target.value)}
              className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-graphite focus:outline-none focus:ring-2 focus:ring-graphite/20"
              placeholder="e.g. 175"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-graphite" htmlFor="afterAbv">Measured ABV (after)</label>
            <input
              id="afterAbv"
              inputMode="decimal"
              value={afterAbv}
              onChange={(e) => setAfterAbv(e.target.value)}
              className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-graphite focus:outline-none focus:ring-2 focus:ring-graphite/20"
              placeholder="e.g. 62.5"
            />
          </div>
        </div>

        <div className="rounded-md border border-stone-200 bg-stone-50 p-4">
          <div className="text-[11px] uppercase tracking-wide text-graphite/60">Preview</div>
          {!preview ? (
            <div className="mt-2 text-sm text-graphite/60">Enter volume + ABV to preview.</div>
          ) : (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-graphite/60">Volume Loss</div>
                <div className="mt-1 font-mono tabular-nums text-lg text-graphite">{preview.volumeLoss.toFixed(1)} L</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-graphite/60">Loss %</div>
                <div className="mt-1 font-mono tabular-nums text-lg text-graphite">{preview.volumeLossPct.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-graphite/60">LAL Loss</div>
                <div className="mt-1 font-mono tabular-nums text-lg text-graphite">{preview.lalLoss.toFixed(1)} LAL</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/dashboard/barrels/${encodeURIComponent(barrelId || '')}`}
            className="px-4 py-2 rounded-md text-sm font-medium border border-graphite/20 text-graphite hover:border-graphite/30"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 rounded-md text-sm font-medium bg-graphite text-white hover:bg-graphite/90 disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
