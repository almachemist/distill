"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { normalizeToken, unpadRumSuffix, parseBatchList, caskNumberToBarrelCode, computeCuts } from "./rum-detail-utils"
import type { CutCalc } from "./rum-detail-utils"

type RumBatchRecord = any

export function useRumDetailPanel(run: RumBatchRecord | null, onClose: () => void, onDelete?: () => void) {
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const [linkedBarrels, setLinkedBarrels] = React.useState<any[]>([])
  const [loadingLinkedBarrels, setLoadingLinkedBarrels] = React.useState(false)
  const [linkedBarrelsError, setLinkedBarrelsError] = React.useState<string | null>(null)

  const caskBarrelCodes = React.useMemo(() => {
    const fromLinked = linkedBarrels
      .map((b: any) => String(b?.barrelNumber || b?.barrel_number || b?.id || '').trim().toUpperCase())
      .filter(Boolean)
    const uniqueLinked = Array.from(new Set(fromLinked))
    if (uniqueLinked.length > 0) return uniqueLinked
    return caskNumberToBarrelCode((run as any)?.cask_number)
  }, [linkedBarrels, run])

  React.useEffect(() => {
    const batchId = String((run as any)?.batch_id ?? '').trim()
    if (!batchId) {
      setLinkedBarrels([])
      setLinkedBarrelsError(null)
      return
    }

    let alive = true
    ;(async () => {
      try {
        setLoadingLinkedBarrels(true)
        setLinkedBarrelsError(null)

        const res = await fetch('/api/barrels?status=all', { cache: 'no-store' })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(json?.error || `Failed to load barrels: ${res.status}`)
        }
        const json = await res.json() as { barrels?: any[] }
        const barrels = Array.isArray(json?.barrels) ? json.barrels : []

        const norm = normalizeToken(batchId)
        const alt = unpadRumSuffix(batchId)
        const wanted = new Set([batchId, norm, alt].map((s) => normalizeToken(s)).filter(Boolean))

        const matches = barrels.filter((b: any) => {
          const tokens = parseBatchList(b?.batch)
          for (const token of tokens) {
            const nt = normalizeToken(token)
            if (wanted.has(nt)) return true
          }
          return false
        })

        matches.sort((a: any, b: any) => String(a?.barrelNumber || a?.barrel_number || '').localeCompare(String(b?.barrelNumber || b?.barrel_number || '')))

        if (!alive) return
        setLinkedBarrels(matches)
      } catch (e: any) {
        if (!alive) return
        setLinkedBarrels([])
        setLinkedBarrelsError(String(e?.message || 'Failed to load linked barrels'))
      } finally {
        if (!alive) return
        setLoadingLinkedBarrels(false)
      }
    })()

    return () => { alive = false }
  }, [run])

  const handleDelete = React.useCallback(async () => {
    if (!run || (!run.batch_id && !run.id)) return
    try {
      setIsDeleting(true)
      const batchId = run.batch_id || run.id
      const response = await fetch(`/api/production/rum/batches/${encodeURIComponent(batchId)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete batch')
      setShowDeleteConfirm(false)
      onDelete?.()
      onClose()
    } catch (error) {
      console.error('Error deleting batch:', error)
      alert('Failed to delete batch. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }, [run, onDelete, onClose])

  const cuts: CutCalc | null = run ? computeCuts(run) : null

  return {
    router,
    showDeleteConfirm, setShowDeleteConfirm,
    isDeleting,
    linkedBarrels, loadingLinkedBarrels, linkedBarrelsError,
    caskBarrelCodes,
    handleDelete,
    cuts,
  }
}
