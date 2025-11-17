'use client'

import { useState, useEffect } from 'react'
import { DistillationSession } from '@/modules/production/types/distillation-session.types'
import { merchantMaeGinDistillation } from '@/modules/production/sessions/merchant-mae-gin-distillation.session'
import { vodka003Distillation } from '@/modules/production/sessions/vodka-003-distillation.session'
import { rainforestGinRF30 } from '@/modules/production/sessions/rainforest-gin-rf30-distillation.session'
import { DashboardKpiCard } from '@/components/dashboard/DashboardKpiCard'
import { DashboardNavCard } from '@/components/dashboard/DashboardNavCard'
import { DashboardRecentList } from '@/components/dashboard/DashboardRecentList'
import { DashboardTasksList } from '@/components/dashboard/DashboardTasksList'
import { DashboardMiniChart } from '@/components/dashboard/DashboardMiniChart'
import { useDashboardStats } from '@/hooks/useDashboardStats'

export default function DashboardPage() {
  const [recentSessions, setRecentSessions] = useState<DistillationSession[]>([])
  const [loading, setLoading] = useState(true)
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats()

  useEffect(() => {
    try {
      const exampleSessions = [
        merchantMaeGinDistillation,
        rainforestGinRF30,
        vodka003Distillation
      ]

      setRecentSessions(exampleSessions.slice(0, 3))
    } catch (err) {
      console.error('Failed to load sessions:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  if (statsLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A65E2E]"></div>
      </div>
    )
  }

  if (statsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load dashboard data</p>
          <p className="text-sm text-gray-500">{statsError}</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* SECTION A — Hero */}
      <div>
        <h1 className="text-3xl font-semibold text-[#1A1A1A] mb-2">Distillery Dashboard</h1>
        <p className="text-[#777777]">Your distillery at a glance.</p>
      </div>

      {/* SECTION B — KPI Tiles (3×2 grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardKpiCard
          title="Batches This Year"
          value={stats.batchesThisYear}
          subtitle="Production runs in 2025"
          accent="copper"
        />
        <DashboardKpiCard
          title="Pure Alcohol Produced (LAL)"
          value={`${stats.pureAlcoholLAL.toFixed(1)} L`}
          subtitle="Total litres of absolute alcohol"
          accent="copper"
        />
        <DashboardKpiCard
          title="Average Distillation Efficiency"
          value={`${stats.avgEfficiency.toFixed(1)}%`}
          subtitle="Hearts yield performance"
          accent="copper"
        />
        <DashboardKpiCard
          title="Total Units in Stock"
          value={stats.totalUnitsInStock.toLocaleString()}
          subtitle="Across all SKUs"
        />
        <DashboardKpiCard
          title="Active Recipes"
          value={stats.activeRecipes}
          subtitle="Gin, Vodka, Rum, Spirits"
        />
        <DashboardKpiCard
          title="Bottling Runs This Month"
          value={stats.bottlingRunsThisMonth}
          subtitle={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        />
      </div>

      {/* SECTION C — Mini Charts (Production & Sales Trends) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardMiniChart
          title="Production Batches — Last 12 Months"
          data={stats.productionTrend.map(d => ({ month: d.month, value: d.batches }))}
          color="copper"
          valueLabel="batches"
        />
        <DashboardMiniChart
          title="Units Sold — Last 12 Months"
          data={stats.salesTrend.map(d => ({ month: d.month, value: d.units }))}
          color="beige"
          valueLabel="units"
        />
      </div>

      {/* SECTION D — Smart Navigation Cards (2 rows) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Row 1 */}
        <DashboardNavCard
          title="Production"
          description="Start new batches, manage distillations, log spirit runs."
          href="/dashboard/production/new"
          variant="copper"
        />
        <DashboardNavCard
          title="Batches"
          description="View all production batches, track progress, edit details."
          href="/dashboard/batches"
          variant="light-gray"
        />
        <DashboardNavCard
          title="Inventory"
          description="View stock levels, bottles, SKUs, upcoming shortages."
          href="/dashboard/inventory"
          variant="beige"
        />

        {/* Row 2 */}
        <DashboardNavCard
          title="Sales & CRM"
          description="Customer analytics, sales trends, churn risk analysis."
          href="/dashboard/crm"
          variant="light-gray"
        />
        <DashboardNavCard
          title="Calendar"
          description="Production schedule, bottling runs, admin weeks."
          href="/dashboard/calendar-2026"
          variant="copper"
        />
        <DashboardNavCard
          title="Barrels"
          description="Barrel inventory, aging tracking, fill schedules."
          href="/dashboard/barrels"
          variant="beige"
        />
      </div>

      {/* SECTION E — Recent Distillations (minimal list) */}
      <DashboardRecentList
        title="Recent Distillations"
        items={recentSessions.map((session) => ({
          id: session.id,
          name: session.sku,
          date: session.date,
          href: '/dashboard/production/batch-overview'
        }))}
      />

      {/* SECTION F — Upcoming Tasks Section */}
      <DashboardTasksList
        title="Upcoming Tasks"
        tasks={[
          { id: '1', title: 'Tank cleaning scheduled' },
          { id: '2', title: 'Bottling preparation' },
          { id: '3', title: 'Rum blend check' },
          { id: '4', title: 'Inventory reconciliation' },
          { id: '5', title: "CRM alert: Hemingway's hasn't ordered in 21 days" }
        ]}
      />
    </div>
  )
}