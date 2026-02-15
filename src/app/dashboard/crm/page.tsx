'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import ClientGroups from './ClientGroups'
import { useCrmCustomers } from '@/modules/crm/hooks/useCrmCustomers'
import { useSquareConnection } from '@/modules/settings/hooks/useSquareConnection'

const currency = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' })
const number = new Intl.NumberFormat('en-AU')

export default function CRMDashboardPage() {
  const { data: connection, isLoading: connLoading } = useSquareConnection()
  const { data: groups = [], isLoading: dataLoading } = useCrmCustomers()

  const isLoading = connLoading || dataLoading
  const isConnected = !!connection

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copper"></div>
      </div>
    )
  }

  if (!isConnected || groups.length === 0) {
    return (
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">CRM Analytics</h1>
          <p className="text-muted-foreground">Client intelligence powered by Square POS data</p>
        </header>
        <div className="bg-surface border border-border rounded-xl shadow-card p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {!isConnected ? 'Connect Square POS' : 'No customer data yet'}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
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
        <h1 className="text-3xl font-semibold text-foreground">CRM Analytics</h1>
        <p className="text-muted-foreground">Client intelligence powered by Square POS data</p>
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
      <section className="bg-surface border border-border rounded-xl shadow-card">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Customer Groups</h2>
          <p className="text-sm text-muted-foreground mt-1">Customers synced from Square POS with spend and churn analysis</p>
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
    <div className="border rounded-xl shadow-card p-6 bg-gradient-to-br from-copper/5 to-surface border-copper/20">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
  )
}

