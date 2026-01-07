'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import calendarData from '@/../data/production_calendar_2026_v4.json'
import decemberData from '@/../data/production_calendar_december_2025.json'
import { useState } from 'react'
import { getProductColor, getTextColor, getBorderColor, DISTILLERY_COLORS } from '@/utils/calendar-colors'

interface ProductionRun {
  product: string
  batch_number: number
  total_batches: number
  production_type: string
  scheduled_month: number
  scheduled_month_name: string
  receiving_tank?: string
}

interface WeekPlan {
  week_number: number
  week_start: string
  week_end: string
  month: number
  month_name: string
  mode: 'GIN' | 'RUM' | 'VODKA' | 'CANE_SPIRIT' | 'LIQUEUR' | 'BOTTLING' | 'ADMIN' | 'RESERVE_RUM_BLEND' | 'RESERVE_RUM_BOTTLE'
  production_runs: ProductionRun[]
  bottling: boolean
  bottling_tasks?: string[]
  notes: string[]
  tank_allocations: string[]
}

interface CalendarData {
  generated_at: string
  source: string
  methodology: string
  calendar: WeekPlan[]
}

export default function Calendar2026Page() {
  const data = calendarData as CalendarData
  const decData = decemberData as CalendarData
  const [selectedQuarter, setSelectedQuarter] = useState<number | 'dec' | null>(null)

  // Group weeks by quarter
  const quarters = [
    { q: 'dec' as const, label: 'Dec 2025', weeks: decData.calendar },
    { q: 1, label: 'Q1 (Jan-Mar)', weeks: data.calendar.filter(w => w.week_number <= 13) },
    { q: 2, label: 'Q2 (Apr-Jun)', weeks: data.calendar.filter(w => w.week_number > 13 && w.week_number <= 26) },
    { q: 3, label: 'Q3 (Jul-Sep)', weeks: data.calendar.filter(w => w.week_number > 26 && w.week_number <= 39) },
    { q: 4, label: 'Q4 (Oct-Dec)', weeks: data.calendar.filter(w => w.week_number > 39) },
  ]

  // Calculate statistics
  const productionWeeks = data.calendar.filter(w => w.production_runs.length > 0)
  const bottlingWeeks = data.calendar.filter(w => w.bottling)
  const adminWeeks = data.calendar.filter(w => w.mode === 'ADMIN' && !w.bottling)

  const getModeStyle = (mode: string) => {
    let bg: string = DISTILLERY_COLORS.EMPTY
    if (mode === 'RESERVE_RUM_BLEND' || mode === 'RESERVE_RUM_BOTTLE') {
      bg = DISTILLERY_COLORS.RUM
    } else if (mode === 'BOTTLING') {
      bg = DISTILLERY_COLORS.ADMIN
    } else {
      bg = getProductColor(mode as any)
    }
    const color = getTextColor(bg)
    const borderColor = getBorderColor(bg)
    return { backgroundColor: bg, color, borderColor }
  }

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'GIN': return 'Gin'
      case 'RUM': return 'Rum'
      case 'VODKA': return 'Vodka'
      case 'CANE_SPIRIT': return 'Cane Spirit'
      case 'LIQUEUR': return 'Liqueur'
      case 'RESERVE_RUM_BLEND': return 'Reserve Rum - Blending'
      case 'RESERVE_RUM_BOTTLE': return 'Reserve Rum - Bottling'
      case 'BOTTLING': return 'Bottling'
      case 'ADMIN': return 'Non-Production'
      default: return mode
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })
  }
  
  // Render clean production week card
  const renderProductionWeek = (week: WeekPlan) => {
    if (week.production_runs.length === 0) return null

    const run = week.production_runs[0]

    return (
      <div key={week.week_number} className="group relative">
        {/* Week header - minimal */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-stone-500">
            W{week.week_number.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-stone-400">
            {formatDate(week.week_start)}
          </div>
        </div>

        {/* Main card - clean and focused */}
        <div className="border rounded-lg p-4 transition-all hover:shadow-md" style={getModeStyle(week.mode)}>
          {/* Product name - prominent */}
          <div className="font-semibold text-base mb-1">
            {run.product}
          </div>

          {/* Batch info - secondary */}
          <div className="text-sm opacity-75 mb-3">
            Batch {run.batch_number}/{run.total_batches}
          </div>

          {/* Tank allocation - technical detail */}
          {run.receiving_tank && (
            <div className="flex items-center gap-2 text-xs mb-3">
              <div className="px-2 py-1 bg-white/50 rounded border border-current/20 font-mono">
                {run.receiving_tank}
              </div>
            </div>
          )}

          {/* Bottling tasks - if any */}
          {week.bottling && week.bottling_tasks && week.bottling_tasks.length > 0 && (
            <div className="mt-3 pt-3 border-t border-current/10">
              <div className="text-xs opacity-60 mb-1">Also bottling:</div>
              <div className="text-xs opacity-75">
                {week.bottling_tasks.map(task => task.replace('Bottle ', '')).join(', ')}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render bottling week card
  const renderBottlingWeek = (week: WeekPlan) => {
    return (
      <div key={week.week_number} className="group relative">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-stone-500">
            W{week.week_number.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-stone-400">
            {formatDate(week.week_start)}
          </div>
        </div>

        <div className="border border-stone-300 rounded-lg p-4 bg-stone-100/50">
          <div className="font-medium text-stone-700 text-sm mb-2">
            Bottling Week
          </div>

          {/* Show what's being bottled */}
          {week.bottling_tasks && week.bottling_tasks.length > 0 && (
            <div className="space-y-1">
              {week.bottling_tasks.map((task, idx) => (
                <div key={idx} className="text-xs text-stone-600">
                  • {task.replace('Bottle ', '')}
                </div>
              ))}
            </div>
          )}

          {/* Default message if no specific tasks */}
          {(!week.bottling_tasks || week.bottling_tasks.length === 0) && (
            <div className="text-xs text-stone-500">
              Free tanks for next production
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render admin/non-production week
  const renderAdminWeek = (week: WeekPlan) => {
    // Special handling for Reserve Rum weeks
    if (week.mode === 'RESERVE_RUM_BLEND' || week.mode === 'RESERVE_RUM_BOTTLE') {
      return (
        <div key={week.week_number} className="group relative">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-stone-500">
              W{week.week_number.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-stone-400">
              {formatDate(week.week_start)}
            </div>
          </div>

          <div className="border rounded-lg p-4" style={getModeStyle(week.mode)}>
            <div className="font-medium text-sm mb-1">
              {getModeLabel(week.mode)}
            </div>
            <div className="text-xs opacity-75">
              {week.notes[0]}
            </div>
          </div>
        </div>
      )
    }

    // Week 1 - Administrative reset
    if (week.week_number === 1) {
      return (
        <div key={week.week_number} className="group relative">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-stone-500">
              W{week.week_number.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-stone-400">
              {formatDate(week.week_start)}
            </div>
          </div>

          <div className="border border-stone-300 rounded-lg p-4 bg-white">
            <div className="font-medium text-sm text-stone-700 mb-1">
              New Year Reset
            </div>
            <div className="text-xs text-stone-500">
              No distillation
            </div>
          </div>
        </div>
      )
    }

    // Regular admin/bottling weeks
    return (
      <div key={week.week_number} className="group relative opacity-40 hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-stone-400">
            W{week.week_number.toString().padStart(2, '0')}
          </div>
        </div>

        <div className="border border-stone-200 rounded-lg p-3 bg-stone-50/30">
          {week.bottling && week.bottling_tasks && week.bottling_tasks.length > 0 ? (
            <>
              <div className="text-xs font-medium text-stone-600 mb-1">
                Bottling Week
              </div>
              <div className="text-xs text-stone-500">
                {week.bottling_tasks.map(task => task.replace('Bottle ', '')).join(', ')}
              </div>
            </>
          ) : (
            <div className="text-xs text-stone-500">
              Non-production
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">2026 Production Calendar</h1>
        <p className="text-stone-600 mt-1">
          Demand-based planning with tank management • Includes December 2025 pre-production
        </p>
      </div>

      {/* Summary Cards - Clean and minimal */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-stone-600">Production Weeks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{productionWeeks.length}</div>
            <p className="text-xs text-stone-500 mt-1">
              {Math.round(productionWeeks.length/52*100)}% of year
            </p>
          </CardContent>
        </Card>

        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-stone-600">Bottling Weeks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">{bottlingWeeks.length}</div>
            <p className="text-xs text-stone-500 mt-1">
              {Math.round(bottlingWeeks.length/52*100)}% of year
            </p>
          </CardContent>
        </Card>

        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-stone-600">Total Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">19</div>
            <p className="text-xs text-stone-500 mt-1">
              Across 9 products
            </p>
          </CardContent>
        </Card>

        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-stone-600">Non-Production</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-stone-400">{adminWeeks.length}</div>
            <p className="text-xs text-stone-500 mt-1">
              {Math.round(adminWeeks.length/52*100)}% of year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quarter Navigation */}
      <div className="flex gap-2 border-b border-stone-200 pb-4">
        {quarters.map(q => {
          const productionCount = q.weeks.filter(w => w.production_runs.length > 0).length
          const isActive = selectedQuarter === q.q

          return (
            <button
              key={q.q}
              onClick={() => setSelectedQuarter(isActive ? null : q.q)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {q.label}
              <span className={`ml-2 text-xs ${isActive ? 'text-stone-300' : 'text-stone-500'}`}>
                {productionCount} batches
              </span>
            </button>
          )
        })}
      </div>

      {/* Calendar Grid by Quarter */}
      {quarters.map(quarter => {
        if (selectedQuarter !== null && selectedQuarter !== quarter.q) return null

        const productionWeeksInQuarter = quarter.weeks.filter(w => w.production_runs.length > 0)
        const bottlingWeeksInQuarter = quarter.weeks.filter(w => w.bottling)

        // Q3: Minimalist display with potential products
        if (quarter.q === 3) {
          return (
            <Card key={quarter.q} className="border-stone-200">
              <CardHeader>
                <CardTitle className="text-xl">{quarter.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <div className="text-sm text-stone-600 mb-3">Potential productions (TBD):</div>
                  <div className="text-base text-stone-800 space-y-1">
                    <div>Australian Cane Spirit</div>
                    <div>Spiced Rum</div>
                    <div>Pineapple Rum</div>
                  </div>
                  <div className="text-xs text-stone-400 mt-4">
                    Production schedule to be confirmed based on demand
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        }

        // Q4: Completely empty
        if (quarter.q === 4) {
          return (
            <Card key={quarter.q} className="border-stone-200 bg-white">
              <CardHeader>
                <CardTitle className="text-xl">{quarter.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-12 text-center">
                  <div className="text-sm text-stone-400">No production planned</div>
                </div>
              </CardContent>
            </Card>
          )
        }

        // Regular quarters (Dec 2025, Q1, Q2)
        if (productionWeeksInQuarter.length === 0 && bottlingWeeksInQuarter.length === 0) {
          return (
            <Card key={quarter.q} className="border-stone-200">
              <CardHeader>
                <CardTitle className="text-xl">{quarter.label}</CardTitle>
              </CardHeader>
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
                <div className="text-sm text-stone-500">
                  {productionWeeksInQuarter.length} production weeks
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {quarter.weeks.map(week => {
                  if (week.production_runs.length > 0) {
                    return renderProductionWeek(week)
                  } else if (week.bottling) {
                    return renderBottlingWeek(week)
                  } else {
                    return renderAdminWeek(week)
                  }
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Footer info */}
      <div className="text-xs text-stone-500 text-center pb-6 pt-4">
        <div className="font-medium mb-1">Planning Methodology</div>
        <div className="text-stone-400">Demand-based with 2025 sales data + 10% growth</div>
      </div>
    </div>
  )
}
