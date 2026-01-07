'use client'

import { useEffect, useMemo, useState } from 'react'
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

function formatNumber(value: number | null | undefined, fraction = 0) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-AU', { minimumFractionDigits: fraction, maximumFractionDigits: fraction }).format(value)
}

export default function ProductsHubPage() {
  const [loading, setLoading] = useState(true)
  const [bottlingRuns, setBottlingRuns] = useState<ApiBottlingRun[]>([])
  const [ginBatches, setGinBatches] = useState<any[]>([])
  const [rumBatches, setRumBatches] = useState<any[]>([])

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
    return () => {
      cancelled = true
    }
  }, [])

  const metrics = useMemo(() => {
    const byProduct: Record<string, { batches: number; bottling: number }> = {}
    for (const p of PRODUCT_LIST) {
      byProduct[p.value] = { batches: 0, bottling: 0 }
    }
    ginBatches.forEach(b => {
      const name = (b.recipe || '').toLowerCase()
      PRODUCT_LIST.forEach(p => {
        if (name.includes(p.value.toLowerCase())) {
          byProduct[p.value].batches += 1
        }
      })
    })
    rumBatches.forEach(b => {
      const name = (b.product_name || '').toLowerCase()
      PRODUCT_LIST.forEach(p => {
        if (name.includes(p.value.toLowerCase())) {
          byProduct[p.value].batches += 1
        }
      })
    })
    bottlingRuns.forEach(r => {
      const name = (r.product_name || '').toLowerCase()
      PRODUCT_LIST.forEach(p => {
        if (name.includes(p.value.toLowerCase())) {
          byProduct[p.value].bottling += 1
        }
      })
    })
    return byProduct
  }, [ginBatches, rumBatches, bottlingRuns])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-graphite">Produtos</h1>
          <p className="text-graphite/70 mt-1">Relatórios de batches, bottling e anotações por produto</p>
        </div>
      </div>

      {loading && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-600">Carregando…</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCT_LIST.map((p) => {
            const m = metrics[p.value] || { batches: 0, bottling: 0 }
            const slug = slugify(p.value)
            return (
              <div key={p.value} className="bg-white rounded-lg shadow-sm border border-copper-15 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-graphite">{p.label}</h3>
                    <p className="text-graphite/70 text-sm">{p.type.toUpperCase()}</p>
                  </div>
                  <Link href={`/dashboard/products/${slug}`} className="text-copper hover:text-copper/80 text-sm font-medium">
                    Abrir
                  </Link>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-md border border-copper-15 p-4">
                    <p className="text-xs uppercase tracking-wide text-graphite/60">Batches</p>
                    <p className="text-xl font-bold text-graphite">{formatNumber(m.batches)}</p>
                  </div>
                  <div className="rounded-md border border-copper-15 p-4">
                    <p className="text-xs uppercase tracking-wide text-graphite/60">Bottling</p>
                    <p className="text-xl font-bold text-graphite">{formatNumber(m.bottling)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
