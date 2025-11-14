'use client'

import { useMemo } from 'react'
import { usePlanningData } from '@/modules/planning/hooks/usePlanningData'

const currencyFormatter = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 2
})

const numberFormatter = new Intl.NumberFormat('en-AU')

const formatCurrency = (value: number) => currencyFormatter.format(value)

export default function PlanningPage() {
  const { pricing, sales, salesByCategory, totalNetSales, totalUnitsSold } = usePlanningData()

  const sortedCategorySales = useMemo(
    () => [...salesByCategory].sort((a, b) => b.totalNetSales - a.totalNetSales),
    [salesByCategory]
  )

  const topProducts = useMemo(() => {
    const aggregates = new Map<string, { net: number; units: number }>()

    for (const sale of sales) {
      const key = sale.item_name
      const entry = aggregates.get(key) ?? { net: 0, units: 0 }
      entry.net += sale.net_sales ?? 0
      entry.units += sale.units_sold ?? sale.items_sold ?? 0
      aggregates.set(key, entry)
    }

    return Array.from(aggregates.entries())
      .map(([item_name, aggregate]) => ({ item_name, ...aggregate }))
      .sort((a, b) => b.net - a.net)
      .slice(0, 5)
  }, [sales])

  const totalProducts = pricing.length
  const categoryCount = sortedCategorySales.length

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">Production Planning</h1>
        <p className="text-gray-600">
          2025 sales data and pricing catalogue loaded from local JSON to assist next year's planning.
        </p>
      </header>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <SummaryCard title="Net Sales 2025" value={formatCurrency(totalNetSales)} trendLabel="annual period" />
          <SummaryCard title="Units Sold" value={numberFormatter.format(totalUnitsSold)} trendLabel="items" />
          <SummaryCard title="Categories" value={categoryCount.toString()} trendLabel="with sales" />
          <SummaryCard title="Products in Catalogue" value={totalProducts.toString()} trendLabel="active" />
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Sales by Category</h2>
            <p className="text-sm text-gray-500 mt-1">Sorted by net sales.</p>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-500">
                <tr>
                  <th className="pb-3">Category</th>
                  <th className="pb-3 text-right">Net Sales</th>
                  <th className="pb-3 text-right">Units</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedCategorySales.map(row => (
                  <tr key={row.category} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{row.category}</td>
                    <td className="py-3 text-right text-gray-700">{formatCurrency(row.totalNetSales)}</td>
                    <td className="py-3 text-right text-gray-700">{numberFormatter.format(row.totalUnits)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Top Products by Net Sales</h2>
            <p className="text-sm text-gray-500 mt-1">Top 5 items sold in 2025.</p>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-500">
                <tr>
                  <th className="pb-3">Product</th>
                  <th className="pb-3 text-right">Net Sales</th>
                  <th className="pb-3 text-right">Units</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topProducts.map(product => (
                  <tr key={product.item_name} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{product.item_name}</td>
                    <td className="py-3 text-right text-gray-700">{formatCurrency(product.net)}</td>
                    <td className="py-3 text-right text-gray-700">{numberFormatter.format(product.units)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Pricing Catalogue</h2>
          <p className="text-sm text-gray-500 mt-1">Data imported from pricing_catalogue_2025.json.</p>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="pb-3">Category</th>
                <th className="pb-3">Product</th>
                <th className="pb-3">SKU</th>
                <th className="pb-3 text-right">Wholesale</th>
                <th className="pb-3 text-right">RRP</th>
                <th className="pb-3 text-right">Volume</th>
                <th className="pb-3 text-right">ABV</th>
                <th className="pb-3">MOQ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pricing.map(item => (
                <tr key={`${item.category}-${item.product_name}-${item.sku ?? 'na'}`} className="hover:bg-gray-50">
                  <td className="py-3 text-gray-700">{item.category}</td>
                  <td className="py-3 font-medium text-gray-900">{item.product_name}</td>
                  <td className="py-3 text-gray-500">{item.sku || '—'}</td>
                  <td className="py-3 text-right text-gray-700">
                    {item.wholesale_ex_gst != null ? formatCurrency(item.wholesale_ex_gst) : '—'}
                  </td>
                  <td className="py-3 text-right text-gray-700">
                    {item.rrp != null ? formatCurrency(item.rrp) : '—'}
                  </td>
                  <td className="py-3 text-right text-gray-700">
                    {item.volume_ml != null ? `${numberFormatter.format(item.volume_ml)} ml` : '—'}
                  </td>
                  <td className="py-3 text-right text-gray-700">
                    {item.abv != null ? `${item.abv}%` : '—'}
                  </td>
                  <td className="py-3 text-gray-700">{item.moq || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

interface SummaryCardProps {
  title: string
  value: string
  trendLabel: string
}

function SummaryCard({ title, value, trendLabel }: SummaryCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{trendLabel}</p>
    </div>
  )
}
