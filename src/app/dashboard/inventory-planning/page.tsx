import React from 'react'
import { headers } from 'next/headers'

type SKUForecastRow = {
  sku: string
  name: string
  required: number
  available: number
  deficit: number
  recommended_purchase: number
  supplier_name?: string
  last_cost_price_per_unit?: number
  last_invoice_date?: string
  status: 'green' | 'yellow' | 'red' | 'none'
}

async function getData(baseUrl: string, from?: string, to?: string) {
  const url = new URL('/api/inventory/forecast', baseUrl)
  if (from) url.searchParams.set('from', from)
  if (to) url.searchParams.set('to', to)
  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load inventory forecast')
  return res.json()
}

export default async function InventoryPlanningPage() {
  const to = '2027-03-31'
  const hdrs = await headers()
  const host = hdrs.get('x-forwarded-host') || hdrs.get('host') || 'localhost:3000'
  const proto = hdrs.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http')
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${proto}://${host}`

  const data = await getData(baseUrl, undefined, to)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Inventory Planning</h1>
        <p className="text-sm text-gray-600">Forecast window → {to}</p>
      </div>

      <section className="rounded-lg border p-4">
        <h2 className="font-medium mb-2">Bottle Requirements per Product (+10% buffer)</h2>
        <div className="space-y-2">
          {Object.keys(data.perProduct || {}).sort().map((k: string) => {
            const v = data.perProduct[k]
            const b700 = Math.ceil((v?.bottles700 || 0) * 1.10)
            const b200 = Math.ceil((v?.bottles200 || 0) * 1.10)
            return (
              <div key={k} className="flex items-center justify-between border-b last:border-b-0 py-2">
                <div>
                  <div className="font-medium">{k}</div>
                </div>
                <div className="text-sm">
                  {b700 > 0 && <span className="mr-4">700ml: <span className="font-semibold">{b700}</span></span>}
                  {b200 > 0 && <span>200ml: <span className="font-semibold">{b200}</span></span>}
                </div>
              </div>
            )
          })}
          {Object.keys(data.perProduct || {}).length === 0 && (
            <div className="text-sm text-gray-500">No planned runs found for the selected window.</div>
          )}
        </div>
      </section>

      <section className="rounded-lg border p-4 overflow-x-auto">
        <h2 className="font-medium mb-3">Stock Forecast by SKU</h2>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">SKU</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-right">Required</th>
              <th className="px-3 py-2 text-right">Available</th>
              <th className="px-3 py-2 text-right">Deficit</th>
              <th className="px-3 py-2 text-right">Recommend</th>
              <th className="px-3 py-2 text-left">Supplier</th>
              <th className="px-3 py-2 text-left">Last Price</th>
              <th className="px-3 py-2 text-left">Last Invoice Date</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.skuForecast.map((r: SKUForecastRow) => (
              <tr key={r.sku} className={r.status === 'red' ? 'bg-red-50' : r.status === 'yellow' ? 'bg-yellow-50' : ''}>
                <td className="px-3 py-2 font-mono">{r.sku}</td>
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2 text-right">{r.required}</td>
                <td className="px-3 py-2 text-right">{r.available}</td>
                <td className="px-3 py-2 text-right font-semibold">{r.deficit}</td>
                <td className="px-3 py-2 text-right">{r.recommended_purchase}</td>
                <td className="px-3 py-2">{r.supplier_name || '—'}</td>
                <td className="px-3 py-2">{r.last_cost_price_per_unit != null ? `$${r.last_cost_price_per_unit.toFixed(2)}` : '—'}</td>
                <td className="px-3 py-2">{r.last_invoice_date || '—'}</td>
                <td className="px-3 py-2">{r.status}</td>
              </tr>
            ))}
            {data.skuForecast.length === 0 && (
              <tr><td colSpan={10} className="px-3 py-6 text-center text-gray-500">No SKU requirements in this window.</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}

