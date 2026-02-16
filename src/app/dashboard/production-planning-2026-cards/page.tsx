'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProductionPlanningCards, aggregateShortagesForMonth, buildPurchaseCsv } from './useProductionPlanningCards'
import { BatchCardsGrid } from './BatchCard'
import type { PurchaseItem } from './planning-cards-types'

export default function ProductionPlanning2026CardsPage() {
  const d = useProductionPlanningCards()

  if (d.loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copper mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading production plan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-graphite">2026 Production Planning (Cards View)</h1>
          <p className="text-sm text-copper mt-1">Batch cards with materials listed inside • Alternative layout</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <SummaryCard label="Total Batches" value={d.batches.length} sub="Across all products" />
          <SummaryCard label="Total Bottles" value={d.batches.reduce((sum, b) => sum + b.total_bottles, 0)} sub="All sizes combined" />
          <SummaryCard label="Gin Batches" value={d.batches.filter(b => b.production_type === 'GIN').length} sub="Botanical tracking" />
          <SummaryCard label="Production Months" value={new Set(d.batches.map(b => b.scheduled_month_name)).size} sub="Jan - Jul 2026" />
        </div>

        {/* Purchasing Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryCard label="Items To Purchase" value={d.purchaseItems.length} sub="Across packaging and botanicals" />
          <SummaryCard label="Total Shortage" value={d.purchaseItems.reduce((sum, i) => sum + i.shortage, 0)} sub="Sum of shortages by item" />
          <div className="rounded-xl shadow-sm border border-copper bg-white p-6">
            <p className="text-xs text-copper uppercase tracking-wide font-medium">Export</p>
            <a href={d.purchaseCsvUri || '#'} download="purchase_plan_2026.csv"
              className="mt-2 inline-flex items-center px-4 py-2 rounded-lg border border-copper-30 text-graphite hover:bg-copper-10 transition text-sm font-medium">Download Purchasing CSV</a>
            <a href={d.botanicalsCsvUri || '#'} download="botanicals_plan_2026.csv"
              className="mt-2 inline-flex items-center px-4 py-2 rounded-lg border border-copper-30 text-graphite hover:bg-copper-10 transition text-sm font-medium">Download Botanicals CSV</a>
          </div>
        </div>

        {/* Tabs by Month */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-beige p-1 rounded-xl inline-flex gap-1 flex-wrap border border-copper-20">
            <TabsTrigger value="all"
              className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-copper data-[state=active]:text-graphite text-copper transition-all duration-150">
              All Batches
            </TabsTrigger>
            {d.months.map(month => {
              const stats = d.getMonthStats(month)
              return (
                <TabsTrigger key={month} value={month}
                  className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-copper data-[state=active]:text-graphite text-copper transition-all duration-150">
                  <span className="inline-flex items-center gap-2">
                    <span>{month}</span>
                    {stats.count > 0 && <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-copper-20 text-xs text-copper bg-copper-5">{stats.count}</span>}
                    {stats.shortage > 0 && <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-copper-20 text-xs text-copper bg-copper-5">{stats.shortage.toLocaleString()}</span>}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <BatchCardsGrid batches={d.batches} currentStock={d.currentStock} />
          </TabsContent>

          {d.months.map(month => (
            <TabsContent key={month} value={month} className="mt-6">
              <MonthPurchasingSummary items={aggregateShortagesForMonth(d.batches, month)} monthName={month} />
              <BatchCardsGrid batches={d.batches.filter(b => b.scheduled_month_name === month)} currentStock={d.currentStock} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="rounded-xl shadow-sm border border-copper bg-white p-6">
      <p className="text-xs text-copper uppercase tracking-wide font-medium">{label}</p>
      <p className="text-3xl font-semibold text-graphite mt-2">{value.toLocaleString()}</p>
      <p className="text-xs text-copper/60 mt-1">{sub}</p>
    </div>
  )
}

function MonthPurchasingSummary({ items, monthName }: { items: PurchaseItem[]; monthName: string }) {
  const totalShortage = items.reduce((sum, i) => sum + i.shortage, 0)
  const csv = 'data:text/csv;charset=utf-8,' + encodeURIComponent(buildPurchaseCsv(items))
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <SummaryCard label={`${monthName} Items`} value={items.length} sub="" />
      <SummaryCard label={`${monthName} Shortage`} value={totalShortage} sub="" />
      <div className="rounded-xl shadow-sm border border-copper bg-white p-4">
        <p className="text-xs text-copper uppercase tracking-wide font-medium">{monthName} Export</p>
        <a href={csv} download={`purchase_${monthName.toLowerCase()}_2026.csv`}
          className="mt-2 inline-flex items-center px-4 py-2 rounded-lg border border-copper-30 text-graphite hover:bg-copper-10 transition text-sm font-medium">Download CSV</a>
      </div>
    </div>
  )
}
