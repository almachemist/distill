'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CalendarEvent, CalendarEventInput } from '@/types/calendar-event.types'
import { getProductColor, getTextColor, getBorderColor, DISTILLERY_COLORS } from '@/utils/calendar-colors'
import type { CalendarData, WeekPlan } from './calendar-types'

export function getModeStyle(mode: string) {
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

export function getModeLabel(mode: string) {
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

export function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })
}

export function getWeekNo(weekStart?: string): number | null {
  if (!weekStart) return null
  const m = weekStart.match(/^(\d{4})-W(\d{1,2})$/i)
  if (m) return parseInt(m[2], 10)
  const m2 = weekStart.match(/^W?(\d{1,2})$/i)
  if (m2) return parseInt(m2[1], 10)
  const n = parseInt(weekStart, 10)
  return Number.isNaN(n) ? null : n
}

export function useCalendarPage() {
  const [data, setData] = useState<CalendarData | null>(null)
  const [decData, setDecData] = useState<CalendarData | null>(null)
  const [selectedQuarter, setSelectedQuarter] = useState<number | 'dec' | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [events, setEvents] = useState<CalendarEvent[]>([])

  const loadData = useCallback(async () => {
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
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const reloadEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/calendar-events', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setEvents(Array.isArray(json.events) ? json.events : [])
      }
    } catch (e) {
      console.error('Failed to reload events', e)
    }
  }, [])

  const handleCardClick = useCallback((week: WeekPlan, kind?: 'production' | 'bottling' | 'admin') => {
    const run = week.production_runs?.[0]
    const isDecember2025 = week.month_name === 'Dec'
    const resolvedType: 'production' | 'bottling' = kind ? (kind === 'bottling' ? 'bottling' : 'production') : (week.bottling ? 'bottling' : 'production')

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
      product: run?.product, tank: run?.receiving_tank,
      batch: run ? `${run.batch_number}/${run.total_batches}` : undefined, kind: resolvedType
    })

    setSelectedEvent(event)
    setModalMode('edit')
    setIsModalOpen(true)
  }, [])

  const handleDynamicCardClick = useCallback((ev: CalendarEvent) => {
    setSelectedEvent(ev)
    setModalMode('edit')
    setIsModalOpen(true)
  }, [])

  const handleOpenCreate = useCallback(() => {
    setSelectedEvent(null)
    setModalMode('create')
    setIsModalOpen(true)
  }, [])

  const handleSave = useCallback(async (input: CalendarEventInput) => {
    if (modalMode === 'create') {
      try {
        console.log('➕ Creating event with input:', input)
        const res = await fetch('/api/calendar-events', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
        })
        if (!res.ok) { const err = await res.json().catch(() => ({})); console.error('❌ Create failed:', err); throw new Error('Failed to create') }
        console.log('✅ Created:', await res.json())
        await reloadEvents()
        setIsModalOpen(false)
        return
      } catch (error) {
        console.error('💥 Create failed:', error)
        alert('Failed to create. Please try again.')
        return
      }
    }

    if (!selectedEvent) return
    console.log('💾 Saving event:', selectedEvent.id, 'with input:', input)

    try {
      if (selectedEvent.id.startsWith('static-')) {
        const response = await fetch('/api/calendar-events/static-update', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedEvent.id, ...input })
        })
        console.log('📡 Static update status:', response.status)
        if (!response.ok) { const errorData = await response.json().catch(() => ({})); console.error('❌ Static API error:', errorData); throw new Error('Failed to save') }
        await loadData()
      } else {
        const response = await fetch(`/api/calendar-events/${selectedEvent.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input)
        })
        console.log('📡 Dynamic update status:', response.status)
        if (!response.ok) { const errorData = await response.json().catch(() => ({})); console.error('❌ Dynamic API error:', errorData); throw new Error('Failed to save') }
        await reloadEvents()
      }
      console.log('✅ Save successful. Closing modal.')
      setIsModalOpen(false)
    } catch (error) {
      console.error('💥 Save failed:', error)
      alert('Failed to save. Please try again.')
    }
  }, [modalMode, selectedEvent, reloadEvents, loadData])

  const handleDelete = useCallback(async (id: string) => {
    if (!id) return
    try {
      if (id.startsWith('static-')) {
        const res = await fetch('/api/calendar-events/static-update', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, remove: true, type: selectedEvent?.type })
        })
        if (!res.ok) { const err = await res.json().catch(() => ({})); console.error('❌ Static delete failed:', err); throw new Error('Delete failed') }
        await loadData()
      } else {
        const res = await fetch(`/api/calendar-events/${id}`, { method: 'DELETE' })
        if (!res.ok) { const err = await res.json().catch(() => ({})); console.error('❌ Delete failed:', err); throw new Error('Delete failed') }
        await reloadEvents()
      }
      setIsModalOpen(false)
    } catch (e) {
      console.error('💥 Delete error:', e)
      alert('Failed to delete. Please try again.')
    }
  }, [selectedEvent, loadData, reloadEvents])

  const handleClear = useCallback(async (id: string) => {
    if (!id.startsWith('static-')) return
    try {
      const res = await fetch('/api/calendar-events/static-update', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, clear: true })
      })
      if (!res.ok) { const err = await res.json().catch(() => ({})); console.error('❌ Clear failed:', err); throw new Error('Clear failed') }
      await loadData()
      setIsModalOpen(false)
    } catch (e) {
      console.error('💥 Clear error:', e)
      alert('Failed to clear card. Please try again.')
    }
  }, [loadData])

  // Derived data
  const quarters = data && decData ? [
    { q: 'dec' as const, label: 'Dec 2025', weeks: decData.calendar },
    { q: 1, label: 'Q1 (Jan-Mar)', weeks: data.calendar.filter(w => w.week_number <= 13) },
    { q: 2, label: 'Q2 (Apr-Jun)', weeks: data.calendar.filter(w => w.week_number > 13 && w.week_number <= 26) },
    { q: 3, label: 'Q3 (Jul-Sep)', weeks: data.calendar.filter(w => w.week_number > 26 && w.week_number <= 39) },
    { q: 4, label: 'Q4 (Oct-Dec)', weeks: data.calendar.filter(w => w.week_number > 39) },
  ] : []

  const productionWeeks = data ? data.calendar.filter(w => w.production_runs.length > 0) : []
  const bottlingWeeks = data ? data.calendar.filter(w => w.bottling) : []
  const adminWeeks = data ? data.calendar.filter(w => w.mode === 'ADMIN' && !w.bottling) : []

  return {
    isLoading, data, decData, events,
    selectedQuarter, setSelectedQuarter,
    isModalOpen, setIsModalOpen,
    selectedEvent, modalMode,
    quarters, productionWeeks, bottlingWeeks, adminWeeks,
    handleCardClick, handleDynamicCardClick, handleOpenCreate,
    handleSave, handleDelete, handleClear,
  }
}
