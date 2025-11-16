"use client"

import { useMemo, useState } from 'react'

type TopProduct = { productName: string; sku?: string; units: number }

type Customer = {
  customerId: string
  customerName: string
  totalSpend: number
  totalUnits: number
  lastOrderDate: string
  daysSinceLastOrder: number
  churnRisk: number
  topProducts: TopProduct[]
}

const currency = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' })
const numberFmt = new Intl.NumberFormat('en-AU')

function riskBadge(risk: number) {
  if (risk < 60) return <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-900">Active</span>
  if (risk < 100) return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-900">At‑risk</span>
  return <span className="px-2 py-1 text-xs rounded-full bg-stone-800 text-white">Churned</span>
}

function statusFromRisk(risk: number): 'all' | 'active' | 'at-risk' | 'churned' {
  if (risk < 60) return 'active'
  if (risk < 100) return 'at-risk'
  return 'churned'
}

function parseBusiness(name?: string) {
  if (!name) return { business: '', person: '' }
  const separators = [' – ', ' — ', ' - ', ' — ']
  for (const sep of separators) {
    if (name.includes(sep)) {
      const [left, right] = name.split(sep)
      // Heuristic: business first, person second
      return { business: left.trim(), person: right?.trim() || '' }
    }
  }
  return { business: '', person: name }
}

export default function ClientCRM({ customers }: { customers: Customer[] }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'name-asc' | 'name-desc' | 'spend-desc' | 'spend-asc' | 'units-desc' | 'units-asc'>('spend-desc')
  const [churn, setChurn] = useState<'all' | 'active' | 'at-risk' | 'churned'>('all')

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = customers.filter(c => {
      const { business, person } = parseBusiness(c.customerName)
      const hay = [c.customerName, business, person, ...(c.topProducts?.map(t => t.productName) || []), ...(c.topProducts?.map(t => t.sku || '') || [])]
        .join(' ') // combine for cheap includes
        .toLowerCase()
      const churnStatus = statusFromRisk(c.churnRisk)
      const okChurn = churn === 'all' ? true : churnStatus === churn
      const okSearch = q === '' ? true : hay.includes(q)
      return okChurn && okSearch
    })

    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case 'name-asc': return a.customerName.localeCompare(b.customerName)
        case 'name-desc': return b.customerName.localeCompare(a.customerName)
        case 'spend-asc': return a.totalSpend - b.totalSpend
        case 'spend-desc': return b.totalSpend - a.totalSpend
        case 'units-asc': return a.totalUnits - b.totalUnits
        case 'units-desc': return b.totalUnits - a.totalUnits
      }
    })

    return sorted.map(c => {
      const { business } = parseBusiness(c.customerName)
      return { ...c, business }
    })
  }, [customers, search, sort, churn])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 w-full md:max-w-sm">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, business, product or SKU"
            className="w-full bg-transparent outline-none text-sm text-stone-800 placeholder-stone-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden border border-stone-200">
            {(['all','active','at-risk','churned'] as const).map(s => (
              <button
                key={s}
                onClick={() => setChurn(s)}
                className={`${churn===s? 'bg-amber-100 text-amber-900 border-amber-200':'bg-white text-stone-700'} px-3 py-1.5 text-xs border-r last:border-r-0`}
              >{s === 'all' ? 'All' : s.replace('-',' ').replace(/\b\w/g, m => m.toUpperCase())}</button>
            ))}
          </div>

          <select
            value={sort}
            onChange={e => setSort(e.target.value as any)}
            className="text-sm border border-stone-200 rounded-md px-2 py-1 bg-white text-stone-800"
          >
            <option value="spend-desc">Highest spend</option>
            <option value="spend-asc">Lowest spend</option>
            <option value="units-desc">Most units</option>
            <option value="units-asc">Fewest units</option>
            <option value="name-asc">A–Z</option>
            <option value="name-desc">Z–A</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-stone-500">
            <tr>
              <th className="pb-3">Customer</th>
              <th className="pb-3">Business</th>
              <th className="pb-3 text-right">Total Spend</th>
              <th className="pb-3 text-right">Units</th>
              <th className="pb-3">Last Order</th>
              <th className="pb-3">Churn</th>
              <th className="pb-3">Top Product</th>
              <th className="pb-3 text-right">Inactive (days)</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((c: any) => (
              <tr key={c.customerId} className="hover:bg-stone-50">
                <td className="py-3 font-medium text-stone-900">{c.customerName || 'N/A'}</td>
                <td className="py-3 text-stone-700">{c.business || '—'}</td>
                <td className="py-3 text-right text-stone-700">{currency.format(c.totalSpend)}</td>
                <td className="py-3 text-right text-stone-700">{numberFmt.format(c.totalUnits)}</td>
                <td className="py-3 text-stone-700">{c.lastOrderDate}</td>
                <td className="py-3">{riskBadge(c.churnRisk)}</td>
                <td className="py-3 text-stone-700">{c.topProducts?.[0]?.productName || '—'}</td>
                <td className="py-3 text-right text-stone-700">{numberFmt.format(c.daysSinceLastOrder)}</td>
                <td className="py-3 text-right">
                  <a href={`/dashboard/crm/${encodeURIComponent(c.customerId)}`} className="text-amber-700 hover:underline">View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

