'use client'

import Link from 'next/link'
import { useSalesAnalytics } from '@/modules/crm/hooks/useSalesAnalytics'
import { useSquareConnection } from '@/modules/settings/hooks/useSquareConnection'

const currencyFormatter = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 2
})

const numberFormatter = new Intl.NumberFormat('en-AU')

export default function SalesAnalyticsPage() {
  const { data: connection, isLoading: connLoading, error: connError } = useSquareConnection()
  const { data: analytics, isLoading: dataLoading, error: dataError } = useSalesAnalytics()

  if (connLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  if (connError || dataError) {
    return (
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-gray-900">Sales Analytics</h1>
          <p className="text-gray-600">Sales intelligence powered by Square POS data</p>
        </header>
        <div className="bg-white border border-red-200 rounded-xl shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load sales data</h2>
          <p className="text-gray-500 mb-4 max-w-md mx-auto text-sm">
            {(connError as Error)?.message || (dataError as Error)?.message || 'An unexpected error occurred.'}
          </p>
          <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-copper hover:bg-copper/90 text-white text-sm font-medium rounded-lg transition-colors">
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!connection || !analytics) {
    return (
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-gray-900">Sales Analytics</h1>
          <p className="text-gray-600">Sales intelligence powered by Square POS data</p>
        </header>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">📈</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {!connection ? 'Connect Square POS' : 'No sales data yet'}
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {!connection
              ? 'Connect your Square account to see real-time sales analytics.'
              : 'Sync your Square data to start seeing sales analytics. Use the Sync button in Settings > Integrations.'}
          </p>
          <Link
            href="/dashboard/settings"
            className="inline-block px-5 py-2.5 bg-copper hover:bg-copper/90 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Go to Settings
          </Link>
        </div>
      </div>
    )
  }

  const { summary, byProduct, byChannel, byCustomer, byMonth } = analytics

  const topProducts = byProduct.slice(0, 10)
  const topCustomers = byCustomer.slice(0, 10)

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">Sales Analytics 2025</h1>
        <p className="text-gray-600">
          Complete sales analysis from {new Date(summary.dateRange.start).toLocaleDateString('en-AU')} to{' '}
          {new Date(summary.dateRange.end).toLocaleDateString('en-AU')} (with December projection)
        </p>
      </header>

      {/* Summary Cards */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <SummaryCard
            title="Net Sales (Annual)"
            value={currencyFormatter.format(summary.totalNetSales)}
            subtitle="Projected total"
            highlight
          />
          <SummaryCard
            title="Units Sold"
            value={numberFormatter.format(summary.totalUnits)}
            subtitle={`${summary.totalSalesCount} transactions`}
          />
          <SummaryCard
            title="Average Ticket"
            value={currencyFormatter.format(summary.avgTicket)}
            subtitle="Per transaction"
          />
          <SummaryCard
            title="Unique Products"
            value={summary.uniqueProducts.toString()}
            subtitle={`${summary.uniqueChannels} channels`}
          />
          <SummaryCard
            title="Active Customers"
            value={summary.uniqueCustomers.toString()}
            subtitle="Customer base"
          />
        </div>
      </section>

      {/* Monthly Performance */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Monthly Performance</h2>
          <p className="text-sm text-gray-500 mt-1">
            Month-by-month sales (December = projection based on October)
          </p>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="pb-3">Month</th>
                <th className="pb-3 text-right">Net Sales</th>
                <th className="pb-3 text-right">Units</th>
                <th className="pb-3 text-right">Transactions</th>
                <th className="pb-3 text-right">Avg Ticket</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {byMonth.map(month => (
                <tr key={month.month} className={month.isProjected ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                  <td className="py-3 font-medium text-gray-900">{month.monthName}</td>
                  <td className="py-3 text-right text-gray-700">
                    {currencyFormatter.format(month.totalNetSales)}
                  </td>
                  <td className="py-3 text-right text-gray-700">{numberFormatter.format(month.totalUnits)}</td>
                  <td className="py-3 text-right text-gray-700">{numberFormatter.format(month.salesCount)}</td>
                  <td className="py-3 text-right text-gray-700">
                    {currencyFormatter.format(month.avgTicket)}
                  </td>
                  <td className="py-3">
                    {month.isProjected ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        📊 Based on Dec 2024
                      </span>
                    ) : month.month === 11 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ⏳ Partial
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✅ Actual
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top Products and Channels */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Products */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Top 10 Products</h2>
            <p className="text-sm text-gray-500 mt-1">By net sales</p>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-500">
                <tr>
                  <th className="pb-3">#</th>
                  <th className="pb-3">Product</th>
                  <th className="pb-3 text-right">Net Sales</th>
                  <th className="pb-3 text-right">Units</th>
                  <th className="pb-3 text-right">Avg Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topProducts.map((product, index) => (
                  <tr key={product.item} className="hover:bg-gray-50">
                    <td className="py-3 text-gray-500">{index + 1}</td>
                    <td className="py-3 font-medium text-gray-900">{product.item}</td>
                    <td className="py-3 text-right text-gray-700">
                      {currencyFormatter.format(product.totalNetSales)}
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      {numberFormatter.format(product.totalUnits)}
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      {currencyFormatter.format(product.avgPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Channels */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Sales Channels</h2>
            <p className="text-sm text-gray-500 mt-1">Performance by channel</p>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-500">
                <tr>
                  <th className="pb-3">Channel</th>
                  <th className="pb-3 text-right">Net Sales</th>
                  <th className="pb-3 text-right">Units</th>
                  <th className="pb-3 text-right">Transactions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {byChannel.map(channel => (
                  <tr key={channel.channel} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{channel.channel}</td>
                    <td className="py-3 text-right text-gray-700">
                      {currencyFormatter.format(channel.totalNetSales)}
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      {numberFormatter.format(channel.totalUnits)}
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      {numberFormatter.format(channel.salesCount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Top Customers */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Top 10 Customers</h2>
          <p className="text-sm text-gray-500 mt-1">By net sales</p>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="pb-3">#</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3 text-right">Net Sales</th>
                <th className="pb-3 text-right">Units</th>
                <th className="pb-3 text-right">Purchases</th>
                <th className="pb-3 text-right">Avg Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topCustomers.map((customer, index) => (
                <tr key={customer.customerId} className="hover:bg-gray-50">
                  <td className="py-3 text-gray-500">{index + 1}</td>
                  <td className="py-3 font-medium text-gray-900">{customer.customerName || 'N/A'}</td>
                  <td className="py-3 text-right text-gray-700">
                    {currencyFormatter.format(customer.totalNetSales)}
                  </td>
                  <td className="py-3 text-right text-gray-700">
                    {numberFormatter.format(customer.totalUnits)}
                  </td>
                  <td className="py-3 text-right text-gray-700">
                    {numberFormatter.format(customer.purchaseCount)}
                  </td>
                  <td className="py-3 text-right text-gray-700">
                    {currencyFormatter.format(customer.avgTicket)}
                  </td>
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
  subtitle: string
  highlight?: boolean
}

function SummaryCard({ title, value, subtitle, highlight }: SummaryCardProps) {
  return (
    <div
      className={`border rounded-xl shadow-sm p-6 ${
        highlight ? 'bg-gradient-to-br from-amber-50 to-white border-amber-200' : 'bg-white border-gray-200'
      }`}
    >
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className={`mt-2 text-2xl font-semibold ${highlight ? 'text-amber-900' : 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  )
}

