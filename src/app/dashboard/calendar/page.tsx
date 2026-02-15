'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import type { ReactElement } from 'react'
import { EventModal } from '@/components/calendar/EventModal'
import type { CalendarEvent, CalendarEventInput } from '@/types/calendar-event.types'
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

export default function CalendarPage() {
  const [data, setData] = useState<CalendarData | null>(null)
  const [decData, setDecData] = useState<CalendarData | null>(null)
  const [selectedQuarter, setSelectedQuarter] = useState<number | 'dec' | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [events, setEvents] = useState<CalendarEvent[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [res2026, resDec, resEvents] = await Promise.all([
        fetch('/api/calendar-data/2026', { cache: 'no-store' }),
        fetch('/api/calendar-data/december', { cache: 'no-store' }),
        fetch('/api/calendar-events', { cache: 'no-store' })
      ])

      if (res2026.ok) setData(await res2026.json())
      if (resDec.ok) setDecData(await resDec.json())
      if (resEvents.ok) {
        const json = await resEvents.json()
        setEvents(Array.isArray(json.events) ? json.events : [])
      }
    } catch (error) {
      console.error('Failed to load calendar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardClick = (week: WeekPlan, kind?: 'production' | 'bottling' | 'admin') => {
    const run = week.production_runs?.[0]

    // Determine if this week belongs to the December 2025 file
    const isDecember2025 = week.month_name === 'Dec'

    const resolvedType: 'production' | 'bottling' = kind ? (kind === 'bottling' ? 'bottling' : 'production') : (week.bottling ? 'bottling' : 'production')

    // Create event object with CURRENT data from the week (which should be updated after save)
    const event: CalendarEvent = {
      id: `${isDecember2025 ? 'static-dec' : 'static'}-${week.week_number}`,
      type: resolvedType,
      productName: resolvedType === 'bottling'
        ? (week.bottling_tasks && week.bottling_tasks.length > 0 ? week.bottling_tasks.join(', ') : 'Bottling Week')
        : (run?.product || getModeLabel(week.mode)),
      productType: week.mode as any,
      batch: resolvedType === 'production' && run ? `${run.batch_number}/${run.total_batches}` : undefined,
      weekStart: `${isDecember2025 ? 2025 : 2026}-W${week.week_number.toString().padStart(2, '0')}`,
      tank: resolvedType === 'production' && run?.receiving_tank !== 'None' ? run?.receiving_tank : undefined,
      notes: week.notes.join(', '),
      color: '#000000',
    }

    console.log('🎯 Opening card for week', week.week_number, 'with data:', {
      product: run?.product,
      tank: run?.receiving_tank,
      batch: run ? `${run.batch_number}/${run.total_batches}` : undefined,
      kind: resolvedType
    })

    setSelectedEvent(event)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleSave = async (input: CalendarEventInput) => {
    // CREATE new dynamic event
    if (modalMode === 'create') {
      try {
        console.log('➕ Creating event with input:', input)
        const res = await fetch('/api/calendar-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          console.error('❌ Create failed:', err)
          throw new Error('Failed to create')
        }
        const json = await res.json()
        console.log('✅ Created:', json)
        await reloadEvents()
        setIsModalOpen(false)
        return
      } catch (error) {
        console.error('💥 Create failed:', error)
        alert('Failed to create. Please try again.')
        return
      }
    }

    // EDIT existing event
    if (!selectedEvent) return
    console.log('💾 Saving event:', selectedEvent.id, 'with input:', input)

    try {
      if (selectedEvent.id.startsWith('static-')) {
        // Update static calendar (JSON weeks)
        const response = await fetch('/api/calendar-events/static-update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedEvent.id, ...input })
        })
        console.log('📡 Static update status:', response.status)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('❌ Static API error:', errorData)
          throw new Error('Failed to save')
        }
        await loadData() // refresh weeks
      } else {
        // Update dynamic (custom) event
        const response = await fetch(`/api/calendar-events/${selectedEvent.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        })
        console.log('📡 Dynamic update status:', response.status)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('❌ Dynamic API error:', errorData)
          throw new Error('Failed to save')
        }
        await reloadEvents()
      }

      console.log('✅ Save successful. Closing modal.')
      setIsModalOpen(false)
    } catch (error) {
      console.error('💥 Save failed:', error)
      alert('Failed to save. Please try again.')
    }
  }

  if (isLoading) return <div className="p-8">Loading...</div>
  if (!data || !decData) return <div className="p-8">Error loading calendar</div>

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
      <div key={`prod-${week.week_number}`} className="group relative cursor-pointer" onClick={() => handleCardClick(week, 'production')}>
        {/* Week header - minimal */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-muted-foreground">
            W{week.week_number.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDate(week.week_start)}
          </div>
        </div>

        {/* Main card - clean and focused */}
        <div className="border rounded-lg p-4 h-40 overflow-hidden transition-all hover:shadow-md" style={getModeStyle(week.mode)}>
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
      <div key={`bott-${week.week_number}`} className="group relative cursor-pointer" onClick={() => handleCardClick(week, 'bottling')}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-muted-foreground">
            W{week.week_number.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDate(week.week_start)}
          </div>
        </div>

        <div className="border border-border rounded-lg p-4 h-40 overflow-hidden bg-accent/50">
          <div className="font-medium text-foreground text-sm mb-2">
            Bottling Week
          </div>

          {/* Show what's being bottled */}
          {week.bottling_tasks && week.bottling_tasks.length > 0 && (
            <div className="space-y-1">
              {week.bottling_tasks.map((task, idx) => (
                <div key={idx} className="text-xs text-muted-foreground">
                  • {task.replace('Bottle ', '')}
                </div>
              ))}
            </div>
          )}

          {/* Default message if no specific tasks */}
          {(!week.bottling_tasks || week.bottling_tasks.length === 0) && (
            <div className="text-xs text-muted-foreground">
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
        <div key={`admin-reserve-${week.week_number}`} className="group relative cursor-pointer" onClick={() => handleCardClick(week)}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-muted-foreground">
              W{week.week_number.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDate(week.week_start)}
            </div>
          </div>

          <div className="border rounded-lg p-4 h-40 overflow-hidden" style={getModeStyle(week.mode)}>
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
        <div key={`admin-week1-${week.week_number}`} className="group relative cursor-pointer" onClick={() => handleCardClick(week)}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-muted-foreground">
              W{week.week_number.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDate(week.week_start)}
            </div>
          </div>

          <div className="border border-border rounded-lg p-4 h-40 overflow-hidden bg-white">
            <div className="font-medium text-sm text-foreground mb-1">
              New Year Reset
            </div>
            <div className="text-xs text-muted-foreground">
              No distillation
            </div>
          </div>
        </div>
      )
    }

    // Regular admin/bottling weeks
    return (
      <div key={`admin-${week.week_number}`} className="group relative opacity-40 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => handleCardClick(week)}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-muted-foreground">
            W{week.week_number.toString().padStart(2, '0')}
          </div>
        </div>

        <div className="border border-border rounded-lg p-3 h-40 overflow-hidden bg-background/30">
          {week.bottling && week.bottling_tasks && week.bottling_tasks.length > 0 ? (
            <>
              <div className="text-xs font-medium text-muted-foreground mb-1">
                Bottling Week
              </div>
              <div className="text-xs text-muted-foreground">
                {week.bottling_tasks.map(task => task.replace('Bottle ', '')).join(', ')}
              </div>
            </>
          ) : (
            <div className="text-xs text-muted-foreground">
              Non-production
            </div>
          )}
        </div>
      </div>
    )
  }

  // Open modal in CREATE mode
  const handleOpenCreate = () => {
    setSelectedEvent(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  // Open modal to edit a dynamic (custom) event
  const handleDynamicCardClick = (ev: CalendarEvent) => {
    setSelectedEvent(ev)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  // Reload only dynamic events
  const reloadEvents = async () => {
    try {
      const res = await fetch('/api/calendar-events', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setEvents(Array.isArray(json.events) ? json.events : [])
      }
    } catch (e) {
      console.error('Failed to reload events', e)
    }
  }

  // Extract numeric week from weekStart (supports "2026-W15" or plain "15")
  const getWeekNo = (weekStart?: string): number | null => {
    if (!weekStart) return null
    const m = weekStart.match(/^(\d{4})-W(\d{1,2})$/i)
    if (m) return parseInt(m[2], 10)
    const m2 = weekStart.match(/^W?(\d{1,2})$/i)
    if (m2) return parseInt(m2[1], 10)
    const n = parseInt(weekStart, 10)
    return Number.isNaN(n) ? null : n
  }
  // Delete a dynamic (custom) event
  const handleDelete = async (id: string) => {
    if (!id) return
    try {
      if (id.startsWith('static-')) {
        // Delete static card (production or bottling depending on selectedEvent.type)
        const res = await fetch('/api/calendar-events/static-update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, remove: true, type: selectedEvent?.type })
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          console.error('❌ Static delete failed:', err)
          throw new Error('Delete failed')
        }
        await loadData()
      } else {
        // Delete dynamic event
        const res = await fetch(`/api/calendar-events/${id}`, { method: 'DELETE' })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          console.error('❌ Delete failed:', err)
          throw new Error('Delete failed')
        }
        await reloadEvents()
      }
      setIsModalOpen(false)
    } catch (e) {
      console.error('💥 Delete error:', e)
      alert('Failed to delete. Please try again.')
    }
  }

  // Clear static card contents (keep layout/color)
  const handleClear = async (id: string) => {
    if (!id.startsWith('static-')) return
    try {
      const res = await fetch('/api/calendar-events/static-update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, clear: true })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error('❌ Clear failed:', err)
        throw new Error('Clear failed')
      }
      await loadData()
      setIsModalOpen(false)
    } catch (e) {
      console.error('💥 Clear error:', e)
      alert('Failed to clear card. Please try again.')
    }
  }


  // Render a dynamic/custom event card in the same visual language
  const renderDynamicEventCard = (ev: CalendarEvent) => {
    const weekNo = getWeekNo(ev.weekStart)
    if (!weekNo) return null

    const modeForColor = (ev.productType as string) || (ev.type === 'bottling' ? 'BOTTLING' : ev.type === 'admin' ? 'ADMIN' : 'GIN')

    return (
      <div key={ev.id} className="group relative cursor-pointer" onClick={() => handleDynamicCardClick(ev)}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-muted-foreground">W{weekNo.toString().padStart(2, '0')}</div>
        </div>
        <div className="border rounded-lg p-4 h-40 overflow-hidden transition-all hover:shadow-md" style={getModeStyle(modeForColor)}>
          <div className="font-semibold text-base mb-1">{ev.productName || (ev.type[0].toUpperCase()+ev.type.slice(1))}</div>
          {ev.batch && (
            <div className="text-sm opacity-75 mb-3">Batch {ev.batch}</div>
          )}
          {ev.tank && (
            <div className="flex items-center gap-2 text-xs mb-3">
              <div className="px-2 py-1 bg-white/50 rounded border border-current/20 font-mono">{ev.tank}</div>
            </div>
          )}
          {ev.notes && (
            <div className="mt-3 pt-3 border-t border-current/10 text-xs opacity-75">{ev.notes}</div>
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
        <p className="text-muted-foreground mt-1">
          Demand-based planning with tank management • Includes December 2025 pre-production
        </p>
      </div>

      {/* Summary Cards - Clean and minimal */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Production Weeks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{productionWeeks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(productionWeeks.length/52*100)}% of year
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bottling Weeks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{bottlingWeeks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(bottlingWeeks.length/52*100)}% of year
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">19</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across 9 products
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Non-Production</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-muted-foreground">{adminWeeks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(adminWeeks.length/52*100)}% of year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quarter Navigation */}
      <div className="flex gap-2 border-b border-border pb-4">
        {quarters.map(q => {
          const productionCount = q.weeks.filter(w => w.production_runs.length > 0).length
          const isActive = selectedQuarter === q.q

          return (
            <button
              key={q.q}
              onClick={() => setSelectedQuarter(isActive ? null : q.q)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-sidebar text-white'
                  : 'bg-accent text-foreground hover:bg-accent/80'
              }`}
            >
              {q.label}
              <span className={`ml-2 text-xs ${isActive ? 'text-white/60' : 'text-muted-foreground'}`}>
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
            <Card key={quarter.q} className="border-border">
              <CardHeader>
                <CardTitle className="text-xl">{quarter.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <div className="text-sm text-muted-foreground mb-3">Potential productions (TBD):</div>
                  <div className="text-base text-foreground space-y-1">
                    <div>Australian Cane Spirit</div>
                    <div>Spiced Rum</div>
                    <div>Pineapple Rum</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-4">
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
            <Card key={quarter.q} className="border-border bg-white">
              <CardHeader>
                <CardTitle className="text-xl">{quarter.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-12 text-center">
                  <div className="text-sm text-muted-foreground">No production planned</div>
                </div>
              </CardContent>
            </Card>
          )
        }

        // Regular quarters (Dec 2025, Q1, Q2)
        if (productionWeeksInQuarter.length === 0 && bottlingWeeksInQuarter.length === 0) {
          return (
            <Card key={quarter.q} className="border-border">
              <CardHeader>
                <CardTitle className="text-xl">{quarter.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <div className="text-sm">No production scheduled</div>
                  <div className="text-xs mt-1">Stock sufficient for this period</div>
                </div>
              </CardContent>
            </Card>
          )
        }

        return (
          <Card key={quarter.q} className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{quarter.label}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {productionWeeksInQuarter.length} production weeks
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {quarter.weeks.map(week => {
                  const nodes: (ReactElement | null)[] = []

                  // Allow both production and bottling to appear in the same week tile
                  if (week.production_runs.length > 0) {
                    nodes.push(renderProductionWeek(week))
                  }
                  if (week.bottling) {
                    nodes.push(renderBottlingWeek(week))
                  }
                  if (nodes.length === 0) {
                    nodes.push(renderAdminWeek(week))
                  }

                  // Also render any dynamic events assigned to this week number
                  const weekNo = week.week_number
                  const dyn = events.filter(e => {
                    const wn = getWeekNo(e.weekStart)
                    if (wn !== weekNo) return false
                    const isDecQuarter = quarter.q === 'dec'
                    const ws = e.weekStart || ''
                    return isDecQuarter ? ws.startsWith('2025-') : (ws.startsWith('2026-') || !ws.includes('-'))
                  })
                  dyn.forEach(ev => nodes.push(renderDynamicEventCard(ev)))

                  // Wrap all week content so it stays in a single grid cell
                  return (
                    <div key={`wrap-${week.week_number}`} className="space-y-3">
                      {nodes}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Footer info */}
      <div className="text-xs text-muted-foreground text-center pb-6 pt-4">
        <div className="font-medium mb-1">Planning Methodology</div>
        <div className="text-muted-foreground">Demand-based with 2025 sales data + 10% growth</div>
      </div>

      {/* Add Event (floating) */}
      <button
        onClick={handleOpenCreate}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-sidebar text-white text-2xl leading-none flex items-center justify-center shadow-lg hover:bg-sidebar-hover"
        aria-label="Add event"
        title="Add event"
      >
        +
      </button>

      {/* Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        onClear={handleClear}
        event={selectedEvent}
        mode={modalMode}
      />
    </div>
  )
}
