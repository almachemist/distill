"use client"

import { useMemo, useState } from 'react'

type Group = {
  id: string
  groupName: string
  aliases: string[]
  totalSpend: number
  totalUnits: number
  firstPurchase: string
  lastPurchase: string
  daysSinceLastOrder: number
  averageDaysBetweenOrders: number
  churnRisk: number
  childAccounts: Array<{
    customerId: string
    customerName: string
    totalSpend: number
    totalUnits: number
    firstOrderDate: string
    lastOrderDate: string
    daysSinceLastOrder: number
    averageDaysBetweenOrders: number
    churnRisk: number
  }>
}

const currency = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' })
const numberFmt = new Intl.NumberFormat('en-AU')

function riskBadge(risk: number) {
  if (risk < 60) return <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-900">Active</span>
  if (risk < 100) return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-900">Atrisk</span>
  return <span className="px-2 py-1 text-xs rounded-full bg-stone-800 text-white">Churned</span>
}

export default function ClientGroups({ groups }: { groups: Group[] }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'name-asc' | 'name-desc' | 'spend-desc' | 'spend-asc' | 'units-desc' | 'units-asc'>('spend-desc')
  const [churn, setChurn] = useState<'all' | 'active' | 'at-risk' | 'churned'>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = groups.filter(g => {
      const hay = [g.groupName, ...(g.aliases || []), ...(g.childAccounts?.map(c => c.customerName) || [])]
        .join(' ')
        .toLowerCase()
      const status = g.churnRisk < 60 ? 'active' : g.churnRisk < 100 ? 'at-risk' : 'churned'
      const okChurn = churn === 'all' ? true : status === churn
      const okSearch = q === '' ? true : hay.includes(q)
      return okChurn && okSearch
    })

    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case 'name-asc': return a.groupName.localeCompare(b.groupName)
        case 'name-desc': return b.groupName.localeCompare(a.groupName)
        case 'spend-asc': return a.totalSpend - b.totalSpend
        case 'spend-desc': return b.totalSpend - a.totalSpend
        case 'units-asc': return a.totalUnits - b.totalUnits
        case 'units-desc': return b.totalUnits - a.totalUnits
      }
    })

    return sorted
  }, [groups, search, sort, churn])

  const selected = rows.find(r => r.id === openId) || null

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 w-full md:max-w-sm">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search group, alias or child account"
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
              <th className="pb-3">Group</th>
              <th className="pb-3 text-right">Total Spend</th>
              <th className="pb-3 text-right">Units</th>
              <th className="pb-3">First Purchase</th>
              <th className="pb-3">Last Purchase</th>
              <th className="pb-3">Churn</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map(g => (
              <tr key={g.id} className="hover:bg-stone-50">
                <td className="py-3 font-medium text-stone-900">{g.groupName}</td>
                <td className="py-3 text-right text-stone-700">{currency.format(g.totalSpend)}</td>
                <td className="py-3 text-right text-stone-700">{numberFmt.format(g.totalUnits)}</td>
                <td className="py-3 text-stone-700">{g.firstPurchase}</td>
                <td className="py-3 text-stone-700">{g.lastPurchase}</td>
                <td className="py-3">{riskBadge(g.churnRisk)}</td>
                <td className="py-3 text-right">
                  <button onClick={() => setOpenId(g.id)} className="text-amber-700 hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-over for details */}
      {selected && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpenId(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl border-l border-stone-200 p-6 overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-stone-900">{selected.groupName}</h3>
                <p className="text-sm text-stone-500">{selected.aliases?.length ? `Aliases: ${selected.aliases.join(', ')}` : 'No aliases'}</p>
              </div>
              <button onClick={() => setOpenId(null)} className="text-stone-500 hover:text-stone-700">Close</button>
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-stone-500">Total Spend</span><span className="font-medium">{currency.format(selected.totalSpend)}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Total Units</span><span className="font-medium">{numberFmt.format(selected.totalUnits)}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">First Purchase</span><span className="font-medium">{selected.firstPurchase}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Last Purchase</span><span className="font-medium">{selected.lastPurchase}</span></div>
            </div>

            <h4 className="mt-6 mb-2 text-stone-900 font-medium">Child Accounts</h4>
            <div className="divide-y divide-stone-100 border border-stone-200 rounded-lg overflow-hidden">
              {selected.childAccounts.map((c) => (
                <div key={c.customerId} className="p-3 text-sm flex items-center justify-between">
                  <div>
                    <div className="font-medium text-stone-900">{c.customerName}</div>
                    <div className="text-stone-500">Last: {c.lastOrderDate} · Inactive: {numberFmt.format(c.daysSinceLastOrder)}d</div>
                  </div>
                  <div className="text-right">
                    <div className="text-stone-700">{currency.format(c.totalSpend)}</div>
                    <a href={`/dashboard/crm/${encodeURIComponent(c.customerId)}`} className="text-amber-700 text-xs hover:underline">Open profile</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

