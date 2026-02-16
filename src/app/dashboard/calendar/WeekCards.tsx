'use client'

import type { CalendarEvent } from '@/types/calendar-event.types'
import type { WeekPlan } from './calendar-types'
import { getModeStyle, getModeLabel, formatDate, getWeekNo } from './useCalendarPage'

interface WeekCardProps {
  week: WeekPlan
  onCardClick: (week: WeekPlan, kind?: 'production' | 'bottling' | 'admin') => void
}

export function ProductionWeekCard({ week, onCardClick }: WeekCardProps) {
  if (week.production_runs.length === 0) return null
  const run = week.production_runs[0]

  return (
    <div className="group relative cursor-pointer" onClick={() => onCardClick(week, 'production')}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-stone-500">W{week.week_number.toString().padStart(2, '0')}</div>
        <div className="text-xs text-stone-400">{formatDate(week.week_start)}</div>
      </div>
      <div className="border rounded-lg p-4 h-40 overflow-hidden transition-all hover:shadow-md" style={getModeStyle(week.mode)}>
        <div className="font-semibold text-base mb-1">{run.product}</div>
        <div className="text-sm opacity-75 mb-3">Batch {run.batch_number}/{run.total_batches}</div>
        {run.receiving_tank && (
          <div className="flex items-center gap-2 text-xs mb-3">
            <div className="px-2 py-1 bg-white/50 rounded border border-current/20 font-mono">{run.receiving_tank}</div>
          </div>
        )}
        {week.bottling && week.bottling_tasks && week.bottling_tasks.length > 0 && (
          <div className="mt-3 pt-3 border-t border-current/10">
            <div className="text-xs opacity-60 mb-1">Also bottling:</div>
            <div className="text-xs opacity-75">{week.bottling_tasks.map(task => task.replace('Bottle ', '')).join(', ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export function BottlingWeekCard({ week, onCardClick }: WeekCardProps) {
  return (
    <div className="group relative cursor-pointer" onClick={() => onCardClick(week, 'bottling')}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-stone-500">W{week.week_number.toString().padStart(2, '0')}</div>
        <div className="text-xs text-stone-400">{formatDate(week.week_start)}</div>
      </div>
      <div className="border border-stone-300 rounded-lg p-4 h-40 overflow-hidden bg-stone-100/50">
        <div className="font-medium text-stone-700 text-sm mb-2">Bottling Week</div>
        {week.bottling_tasks && week.bottling_tasks.length > 0 ? (
          <div className="space-y-1">
            {week.bottling_tasks.map((task, idx) => (
              <div key={idx} className="text-xs text-stone-600">• {task.replace('Bottle ', '')}</div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-stone-500">Free tanks for next production</div>
        )}
      </div>
    </div>
  )
}

export function AdminWeekCard({ week, onCardClick }: WeekCardProps) {
  if (week.mode === 'RESERVE_RUM_BLEND' || week.mode === 'RESERVE_RUM_BOTTLE') {
    return (
      <div className="group relative cursor-pointer" onClick={() => onCardClick(week)}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-stone-500">W{week.week_number.toString().padStart(2, '0')}</div>
          <div className="text-xs text-stone-400">{formatDate(week.week_start)}</div>
        </div>
        <div className="border rounded-lg p-4 h-40 overflow-hidden" style={getModeStyle(week.mode)}>
          <div className="font-medium text-sm mb-1">{getModeLabel(week.mode)}</div>
          <div className="text-xs opacity-75">{week.notes[0]}</div>
        </div>
      </div>
    )
  }

  if (week.week_number === 1) {
    return (
      <div className="group relative cursor-pointer" onClick={() => onCardClick(week)}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-stone-500">W{week.week_number.toString().padStart(2, '0')}</div>
          <div className="text-xs text-stone-400">{formatDate(week.week_start)}</div>
        </div>
        <div className="border border-stone-300 rounded-lg p-4 h-40 overflow-hidden bg-white">
          <div className="font-medium text-sm text-stone-700 mb-1">New Year Reset</div>
          <div className="text-xs text-stone-500">No distillation</div>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative opacity-40 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => onCardClick(week)}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-stone-400">W{week.week_number.toString().padStart(2, '0')}</div>
      </div>
      <div className="border border-stone-200 rounded-lg p-3 h-40 overflow-hidden bg-stone-50/30">
        {week.bottling && week.bottling_tasks && week.bottling_tasks.length > 0 ? (
          <>
            <div className="text-xs font-medium text-stone-600 mb-1">Bottling Week</div>
            <div className="text-xs text-stone-500">{week.bottling_tasks.map(task => task.replace('Bottle ', '')).join(', ')}</div>
          </>
        ) : (
          <div className="text-xs text-stone-500">Non-production</div>
        )}
      </div>
    </div>
  )
}

interface DynamicEventCardProps {
  event: CalendarEvent
  onClick: (ev: CalendarEvent) => void
}

export function DynamicEventCard({ event, onClick }: DynamicEventCardProps) {
  const weekNo = getWeekNo(event.weekStart)
  if (!weekNo) return null
  const modeForColor = (event.productType as string) || (event.type === 'bottling' ? 'BOTTLING' : event.type === 'admin' ? 'ADMIN' : 'GIN')

  return (
    <div className="group relative cursor-pointer" onClick={() => onClick(event)}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-stone-500">W{weekNo.toString().padStart(2, '0')}</div>
      </div>
      <div className="border rounded-lg p-4 h-40 overflow-hidden transition-all hover:shadow-md" style={getModeStyle(modeForColor)}>
        <div className="font-semibold text-base mb-1">{event.productName || (event.type[0].toUpperCase() + event.type.slice(1))}</div>
        {event.batch && <div className="text-sm opacity-75 mb-3">Batch {event.batch}</div>}
        {event.tank && (
          <div className="flex items-center gap-2 text-xs mb-3">
            <div className="px-2 py-1 bg-white/50 rounded border border-current/20 font-mono">{event.tank}</div>
          </div>
        )}
        {event.notes && <div className="mt-3 pt-3 border-t border-current/10 text-xs opacity-75">{event.notes}</div>}
      </div>
    </div>
  )
}
