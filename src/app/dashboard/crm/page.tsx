'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import ClientGroups from './ClientGroups'
import { useCrmCustomers } from '@/modules/crm/hooks/useCrmCustomers'
import { useSquareConnection } from '@/modules/settings/hooks/useSquareConnection'

const currency = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' })
const number = new Intl.NumberFormat('en-AU')

export default function CRMDashboardPage() {
  const { data: connection, isLoading: connLoading, error: connError } = useSquareConnection()
  const { data: groups = [], isLoading: dataLoading, error: dataError } = useCrmCustomers()

  const isLoading = connLoading || dataLoading
  const isConnected = !!connection
  const hasError = !!connError || !!dataError

  const stats = useMemo(() => {
    const total = groups.length
    const active30 = groups.filter((g) => g.daysSinceLastOrder <= 30).length
    const atRisk = groups.filter((g) => g.churnRisk >= 100).length
    const avgInactivity = total > 0
      ? Math.round(groups.reduce((acc, g) => acc + (g.daysSinceLastOrder || 0), 0) / total)
      : 0
    const avgValue = total > 0
      ? groups.reduce((acc, g) => acc + g.totalSpend, 0) / total
      : 0
    return { total, active30, atRisk, avgInactivity, avgValue }
  }, [groups])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-stone-900">CRM Analytics</h1>
          <p className="text-stone-600">Client intelligence powered by Square POS data</p>
        </header>
        <div className="bg-white border border-red-200 rounded-xl shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">Failed to load CRM data</h2>
          <p className="text-stone-500 mb-4 max-w-md mx-auto text-sm">
            {(connError as Error)?.message || (dataError as Error)?.message || 'An unexpected error occurred.'}
          </p>
          <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-copper hover:bg-copper/90 text-white text-sm font-medium rounded-lg transition-colors">
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!isConnected || groups.length === 0) {
    return (
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-stone-900">CRM Analytics</h1>
          <p className="text-stone-600">Client intelligence powered by Square POS data</p>
        </header>
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">
            {!isConnected ? 'Connect Square POS' : 'No customer data yet'}
          </h2>
          <p className="text-stone-500 mb-6 max-w-md mx-auto">
            {!isConnected
              ? 'Connect your Square account to automatically sync customer and sales data for CRM analytics.'
              : 'Sync your Square data to start seeing customer analytics. Use the Sync button in Settings > Integrations.'}
          </p>
          <Link
            href="/dashboard/settings"
            className="inline-block px-5 py-2.5 bg-copper hover:bg-copper/90 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {!isConnected ? 'Go to Settings' : 'Open Integrations'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-stone-900">CRM Analytics</h1>
        <p className="text-stone-600">Client intelligence powered by Square POS data</p>
      </header>

      {/* High-Level Metrics */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <Card title="Total customers" value={number.format(stats.total)} subtitle="All accounts" />
          <Card title="Active (30d)" value={number.format(stats.active30)} subtitle="Recently ordered" />
          <Card title="At risk" value={number.format(stats.atRisk)} subtitle="Needs attention" />
          <Card title="Avg inactivity (days)" value={number.format(stats.avgInactivity)} subtitle="Across customers" />
          <Card title="Avg customer value" value={currency.format(stats.avgValue)} subtitle="Lifetime" />
        </div>
      </section>

      {/* Customer Groups Table */}
      <section className="bg-white border border-stone-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-stone-100">
          <h2 className="text-xl font-semibold text-stone-900">Customer Groups</h2>
          <p className="text-sm text-stone-500 mt-1">Customers synced from Square POS with spend and churn analysis</p>
        </div>
        <div className="p-6">
          <ClientGroups groups={groups as any[]} />
        </div>
      </section>
    </div>
  )
}

function Card({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="border rounded-xl shadow-sm p-6 bg-gradient-to-br from-amber-50 to-white border-amber-200">
      <h3 className="text-sm font-medium text-stone-500">{title}</h3>
      <p className="mt-2 text-2xl font-semibold text-stone-900">{value}</p>
      <p className="text-xs text-stone-400 mt-1">{subtitle}</p>
    </div>
  )
}

