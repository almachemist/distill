'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { ProductType } from '@/types/bottling'

type ApiBottlingRun = {
  id?: string
  product_name?: string
  created_at?: string
  mode?: string
}

const PRODUCT_LIST = [
  { value: 'Rainforest Gin', label: 'Rainforest Gin', type: 'gin' as ProductType },
  { value: 'Signature Dry Gin', label: 'Signature Dry Gin', type: 'gin' as ProductType },
  { value: 'Navy Strength Gin', label: 'Navy Strength Gin', type: 'gin' as ProductType },
  { value: 'Wet Season Gin', label: 'Wet Season Gin', type: 'gin' as ProductType },
  { value: 'Dry Season Gin', label: 'Dry Season Gin', type: 'gin' as ProductType },
  { value: 'Australian Cane Spirit', label: 'Australian Cane Spirit', type: 'cane_spirit' as ProductType },
  { value: 'Pineapple Rum', label: 'Pineapple Rum', type: 'rum' as ProductType },
  { value: 'Spiced Rum', label: 'Spiced Rum', type: 'rum' as ProductType },
  { value: 'Reserve Cask Rum', label: 'Reserve Cask Rum', type: 'rum' as ProductType },
  { value: 'Coffee Liqueur', label: 'Coffee Liqueur', type: 'other_liqueur' as ProductType },
  { value: 'Merchant Mae Gin', label: 'Merchant Mae Gin', type: 'gin' as ProductType },
  { value: 'Merchant Mae Vodka', label: 'Merchant Mae Vodka', type: 'vodka' as ProductType },
  { value: 'Merchant Mae Golden Sunrise', label: 'Merchant Mae Golden Sunrise', type: 'vodka' as ProductType },
  { value: 'Merchant Mae Berry Burst', label: 'Merchant Mae Berry Burst', type: 'vodka' as ProductType },
  { value: 'Merchant Mae White Rum', label: 'Merchant Mae White Rum', type: 'rum' as ProductType },
  { value: 'Merchant Mae Dark Rum', label: 'Merchant Mae Dark Rum', type: 'rum' as ProductType },
]

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function formatNumber(value: number | null | undefined, fraction = 1) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-AU', { minimumFractionDigits: fraction, maximumFractionDigits: fraction }).format(value)
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return value
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const search = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [bottlingRuns, setBottlingRuns] = useState<ApiBottlingRun[]>([])
  const [notes, setNotes] = useState('')
  const [ginBatches, setGinBatches] = useState<any[]>([])
  const [rumBatches, setRumBatches] = useState<any[]>([])

  const productName = useMemo(() => {
    const id = String(params?.id || '')
    const bySlug = PRODUCT_LIST.find(p => slugify(p.value) === id)?.value
    const byQuery = search?.get('name') || ''
    return bySlug || byQuery || id.replace(/-/g, ' ')
  }, [params, search])

  const productInfo = useMemo(() => {
    return PRODUCT_LIST.find(p => p.value === productName) || { value: productName, label: productName, type: 'gin' as ProductType }
  }, [productName])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/production/bottling-runs', { cache: 'no-store' })
        const json = await res.json()
        if (!cancelled) setBottlingRuns(json?.bottlingRuns || [])
      } catch {
        if (!cancelled) setBottlingRuns([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    ;(async () => {
      try {
        const res2 = await fetch(`/api/products/notes?name=${encodeURIComponent(productName)}`, { cache: 'no-store' })
        const json2 = await res2.json()
        if (!cancelled && typeof json2?.notes === 'string') setNotes(json2.notes)
      } catch {
        const saved = typeof window !== 'undefined' ? localStorage.getItem(`product_notes_${productName}`) : null
        if (saved && !cancelled) setNotes(saved)
      }
    })()
    ;(async () => {
      try {
        const [gRes, rRes] = await Promise.all([
          fetch('/api/fallback/gin-batches', { cache: 'no-store' }),
          fetch('/api/fallback/rum-batches', { cache: 'no-store' })
        ])
        const gJson = gRes.ok ? await gRes.json() : []
        const rJson = rRes.ok ? await rRes.json() : []
        if (!cancelled) {
          setGinBatches(Array.isArray(gJson) ? gJson : [])
          setRumBatches(Array.isArray(rJson) ? rJson : [])
        }
      } catch {
        if (!cancelled) {
          setGinBatches([])
          setRumBatches([])
        }
      }
    })()
    return () => { cancelled = true }
  }, [productName])

  const productGinRuns = useMemo(() => {
    const name = productName.toLowerCase()
    return ginBatches.filter(b => (b.recipe || '').toLowerCase().includes(name))
  }, [ginBatches, productName])

  const productRumRuns = useMemo(() => {
    const name = productName.toLowerCase()
    return rumBatches.filter(b => (b.product_name || '').toLowerCase().includes(name))
  }, [rumBatches, productName])

  const productBottling = useMemo(() => {
    const name = productName.toLowerCase()
    return bottlingRuns.filter(r => (r.product_name || '').toLowerCase().includes(name))
  }, [bottlingRuns, productName])

  const saveNotes = () => {
    ;(async () => {
      try {
        await fetch('/api/products/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productName, notes })
        })
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`product_notes_${productName}`, notes || '')
        }
      }
    })()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{productInfo.label}</h1>
          <p className="text-gray-600 mt-1">{productInfo.type.toUpperCase()}</p>
        </div>
        <Link href="/dashboard/products" className="text-blue-600 hover:text-blue-700 text-sm font-medium">Voltar</Link>
      </div>

      {loading && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-600">Carregando…</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Batches</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {productGinRuns.map((run) => (
                  <div key={run.run_id} className="rounded-md border border-gray-200 p-4">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900">{run.recipe || 'Gin Batch'}</p>
                      <span className="text-xs text-gray-600">{formatDate(run.date)}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>Hearts: {formatNumber(run.hearts_volume_l, 1)} L @ {formatNumber(run.hearts_abv_percent, 1)}% ({formatNumber(run.hearts_lal, 1)} LAL)</p>
                      <p>Still: {run.still_used || 'Carrie'}</p>
                    </div>
                  </div>
                ))}
                {productRumRuns.map((run) => (
                  <div key={run.batch_id} className="rounded-md border border-gray-200 p-4">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900">{run.product_name || 'Rum Batch'}</p>
                      <span className="text-xs text-gray-600">{formatDate(run.distillation_date)}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>Hearts: {formatNumber(run.hearts_volume_l, 1)} L @ {formatNumber(run.hearts_abv_percent, 1)}% ({formatNumber(run.hearts_lal, 1)} LAL)</p>
                      <p>Cask: {run.cask_number || '—'}</p>
                    </div>
                  </div>
                ))}
                {productGinRuns.length + productRumRuns.length === 0 && (
                  <div className="rounded-md border border-gray-200 p-6">
                    <p className="text-gray-600 text-sm">Nenhum batch encontrado para este produto.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Bottling</h2>
              <div className="mt-4 space-y-3">
                {productBottling.map((r) => (
                  <div key={r.id || `${r.product_name}-${r.created_at || ''}`} className="rounded-md border border-gray-200 p-4">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900">{r.product_name}</p>
                      <span className="text-xs text-gray-600">{formatDate(r.created_at)}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>Modo: {(r.mode || '').toUpperCase()}</p>
                    </div>
                  </div>
                ))}
                {productBottling.length === 0 && (
                  <div className="rounded-md border border-gray-200 p-6">
                    <p className="text-gray-600 text-sm">Nenhum bottling registrado para este produto.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Anotações</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-3 w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Registre observações deste produto…"
              />
              <div className="mt-3 flex gap-3">
                <button
                  onClick={saveNotes}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Salvar
                </button>
                <Link
                  href="/dashboard/production/bottling/new"
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm font-medium"
                >
                  Iniciar Bottling
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
 
