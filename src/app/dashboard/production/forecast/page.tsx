import React from 'react'
import { headers } from 'next/headers'

async function getData(baseUrl: string, from = '2025-12-01', to = '2026-03-31') {
  const url = new URL('/api/forecast/packaging', baseUrl)
  url.searchParams.set('from', from)
  url.searchParams.set('to', to)
  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load forecast')
  return res.json()
}

export default async function ForecastPage() {
  const from = '2025-12-01'
  const to = '2026-03-31'

  const hdrs = await headers()
  const host = hdrs.get('x-forwarded-host') || hdrs.get('host') || 'localhost:3000'
  const proto = hdrs.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http')
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${proto}://${host}`

  const data = await getData(baseUrl, from, to)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Packaging Forecast</h1>
        <p className="text-sm text-gray-600">Window: {from} → {to}</p>
      </div>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-xs text-gray-500">700ml Bottles</div>
          <div className="text-2xl font-semibold">{data.packagingTotals.bottles_700}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-gray-500">200ml Bottles</div>
          <div className="text-2xl font-semibold">{data.packagingTotals.bottles_200}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-gray-500">6-pack Cartons</div>
          <div className="text-2xl font-semibold">{data.packagingTotals.cartons_6pack}</div>
        </div>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="font-medium mb-2">Per Product</h2>
        <div className="space-y-2">
          {Object.keys(data.perProduct).sort().map((k: string) => {
            const v = data.perProduct[k]
            const b700 = Math.ceil(v.bottles700 * 1.10)
            const b200 = Math.ceil(v.bottles200 * 1.10)
            return (
              <div key={k} className="flex items-center justify-between border-b last:border-b-0 py-2">
                <div>
                  <div className="font-medium">{k}</div>
                  <div className="text-xs text-gray-500">Runs: {data.runsByProduct[k] || 0}</div>
                </div>
                <div className="text-sm">
                  {b700 > 0 && <span className="mr-4">700ml: <span className="font-semibold">{b700}</span></span>}
                  {b200 > 0 && <span>200ml: <span className="font-semibold">{b200}</span></span>}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="font-medium mb-2">Supplier Order List</h2>
        <pre className="whitespace-pre-wrap text-sm bg-gray-50 rounded p-3 border">{data.orderListText}</pre>
      </section>
    </div>
  )
}

