'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ReactElement } from 'react'
import { EventModal } from '@/components/calendar/EventModal'
import { useCalendarPage, getWeekNo } from './useCalendarPage'
import { ProductionWeekCard, BottlingWeekCard, AdminWeekCard, DynamicEventCard } from './WeekCards'

export default function CalendarPage() {
  const d = useCalendarPage()

  if (d.isLoading) return <div className="p-8">Loading...</div>
  if (!d.data || !d.decData) return <div className="p-8">Error loading calendar</div>

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">2026 Production Calendar</h1>
        <p className="text-stone-600 mt-1">Demand-based planning with tank management • Includes December 2025 pre-production</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard title="Production Weeks" value={d.productionWeeks.length} sub={`${Math.round(d.productionWeeks.length / 52 * 100)}% of year`} />
        <SummaryCard title="Bottling Weeks" value={d.bottlingWeeks.length} sub={`${Math.round(d.bottlingWeeks.length / 52 * 100)}% of year`} valueClass="text-emerald-700" />
        <SummaryCard title="Total Batches" value={19} sub="Across 9 products" />
        <SummaryCard title="Non-Production" value={d.adminWeeks.length} sub={`${Math.round(d.adminWeeks.length / 52 * 100)}% of year`} valueClass="text-stone-400" />
      </div>

      {/* Quarter Navigation */}
      <div className="flex gap-2 border-b border-stone-200 pb-4">
        {d.quarters.map(q => {
          const productionCount = q.weeks.filter(w => w.production_runs.length > 0).length
          const isActive = d.selectedQuarter === q.q
          return (
            <button key={q.q} onClick={() => d.setSelectedQuarter(isActive ? null : q.q)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}>
              {q.label}
              <span className={`ml-2 text-xs ${isActive ? 'text-stone-300' : 'text-stone-500'}`}>{productionCount} batches</span>
            </button>
          )
        })}
      </div>

      {/* Calendar Grid by Quarter */}
      {d.quarters.map(quarter => {
        if (d.selectedQuarter !== null && d.selectedQuarter !== quarter.q) return null

        const productionWeeksInQuarter = quarter.weeks.filter(w => w.production_runs.length > 0)
        const bottlingWeeksInQuarter = quarter.weeks.filter(w => w.bottling)

        if (quarter.q === 3) {
          return (
            <Card key={quarter.q} className="border-stone-200">
              <CardHeader><CardTitle className="text-xl">{quarter.label}</CardTitle></CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <div className="text-sm text-stone-600 mb-3">Potential productions (TBD):</div>
                  <div className="text-base text-stone-800 space-y-1">
                    <div>Australian Cane Spirit</div><div>Spiced Rum</div><div>Pineapple Rum</div>
                  </div>
                  <div className="text-xs text-stone-400 mt-4">Production schedule to be confirmed based on demand</div>
                </div>
              </CardContent>
            </Card>
          )
        }

        if (quarter.q === 4) {
          return (
            <Card key={quarter.q} className="border-stone-200 bg-white">
              <CardHeader><CardTitle className="text-xl">{quarter.label}</CardTitle></CardHeader>
              <CardContent><div className="py-12 text-center"><div className="text-sm text-stone-400">No production planned</div></div></CardContent>
            </Card>
          )
        }

        if (productionWeeksInQuarter.length === 0 && bottlingWeeksInQuarter.length === 0) {
          return (
            <Card key={quarter.q} className="border-stone-200">
              <CardHeader><CardTitle className="text-xl">{quarter.label}</CardTitle></CardHeader>
              <CardContent>
                <div className="text-center py-12 text-stone-400">
                  <div className="text-sm">No production scheduled</div>
                  <div className="text-xs mt-1">Stock sufficient for this period</div>
                </div>
              </CardContent>
            </Card>
          )
        }

        return (
          <Card key={quarter.q} className="border-stone-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{quarter.label}</CardTitle>
                <div className="text-sm text-stone-500">{productionWeeksInQuarter.length} production weeks</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {quarter.weeks.map(week => {
                  const nodes: (ReactElement | null)[] = []
                  if (week.production_runs.length > 0) nodes.push(<ProductionWeekCard key={`prod-${week.week_number}`} week={week} onCardClick={d.handleCardClick} />)
                  if (week.bottling) nodes.push(<BottlingWeekCard key={`bott-${week.week_number}`} week={week} onCardClick={d.handleCardClick} />)
                  if (nodes.length === 0) nodes.push(<AdminWeekCard key={`admin-${week.week_number}`} week={week} onCardClick={d.handleCardClick} />)

                  const weekNo = week.week_number
                  const dyn = d.events.filter(e => {
                    const wn = getWeekNo(e.weekStart)
                    if (wn !== weekNo) return false
                    const isDecQuarter = quarter.q === 'dec'
                    const ws = e.weekStart || ''
                    return isDecQuarter ? ws.startsWith('2025-') : (ws.startsWith('2026-') || !ws.includes('-'))
                  })
                  dyn.forEach(ev => nodes.push(<DynamicEventCard key={ev.id} event={ev} onClick={d.handleDynamicCardClick} />))

                  return <div key={`wrap-${week.week_number}`} className="space-y-3">{nodes}</div>
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Footer */}
      <div className="text-xs text-stone-500 text-center pb-6 pt-4">
        <div className="font-medium mb-1">Planning Methodology</div>
        <div className="text-stone-400">Demand-based with 2025 sales data + 10% growth</div>
      </div>

      {/* Add Event FAB */}
      <button onClick={d.handleOpenCreate}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-stone-900 text-white text-2xl leading-none flex items-center justify-center shadow-lg hover:bg-stone-800"
        aria-label="Add event" title="Add event">+</button>

      {/* Modal */}
      <EventModal isOpen={d.isModalOpen} onClose={() => d.setIsModalOpen(false)}
        onSave={d.handleSave} onDelete={d.handleDelete} onClear={d.handleClear}
        event={d.selectedEvent} mode={d.modalMode} />
    </div>
  )
}

function SummaryCard({ title, value, sub, valueClass }: { title: string; value: number; sub: string; valueClass?: string }) {
  return (
    <Card className="border-stone-200">
      <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-stone-600">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${valueClass || ''}`}>{value}</div>
        <p className="text-xs text-stone-500 mt-1">{sub}</p>
      </CardContent>
    </Card>
  )
}
