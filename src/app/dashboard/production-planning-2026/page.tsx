'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProductionPlanning } from './useProductionPlanning'
import { BatchList, StockTimelineView } from './PlanningComponents'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
const tabClass = "px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-[#C07A50] data-[state=active]:text-[#1A1A1A] text-[#C07A50] transition-all duration-150"

export default function ProductionPlanning2026Page() {
  const { batches, loading, stockTimelines } = useProductionPlanning()

  if (loading) {
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
          <h1 className="text-3xl font-semibold text-[#1A1A1A]">2026 Production Planning</h1>
          <p className="text-sm text-[#C07A50] mt-1">Batch-by-batch materials planning with inventory comparison</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <SummaryCard label="Total Batches" value={batches.length} sub="Across all products" />
          <SummaryCard label="Total Bottles" value={batches.reduce((sum, b) => sum + b.total_bottles, 0)} sub="All sizes combined" />
          <SummaryCard label="Gin Batches" value={batches.filter(b => b.production_type === 'GIN').length} sub="Botanical tracking" />
          <SummaryCard label="Production Months" value={new Set(batches.map(b => b.scheduled_month_name)).size} sub="Jan - Jul 2026" />
        </div>

        {/* Tabs by Month */}
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="bg-[#EDE3D8] p-1 rounded-xl inline-flex gap-1 flex-wrap border border-[#C07A50]/20">
            <TabsTrigger value="timeline" className={tabClass}>Stock Timeline</TabsTrigger>
            <TabsTrigger value="all" className={tabClass}>All Batches</TabsTrigger>
            {MONTHS.map(month => (
              <TabsTrigger key={month} value={month} className={tabClass}>{month}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="timeline" className="mt-6">
            <StockTimelineView timelines={stockTimelines} />
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <BatchList batches={batches} />
          </TabsContent>

          {MONTHS.map(month => (
            <TabsContent key={month} value={month} className="mt-6">
              <BatchList batches={batches.filter(b => b.scheduled_month_name === month)} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="rounded-xl shadow-sm border border-[#C07A50] bg-white p-6">
      <p className="text-xs text-[#C07A50] uppercase tracking-wide font-medium">{label}</p>
      <p className="text-3xl font-semibold text-[#1A1A1A] mt-2">{value.toLocaleString()}</p>
      <p className="text-xs text-[#C07A50]/60 mt-1">{sub}</p>
    </div>
  )
}
