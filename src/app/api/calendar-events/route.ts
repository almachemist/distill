/**
 * Calendar Events API - Local JSON Storage
 * 
 * Endpoints:
 * - GET /api/calendar-events - List all events
 * - POST /api/calendar-events - Create new event
 */

import { NextRequest, NextResponse } from 'next/server'
import type { CalendarEvent, CalendarEventInput } from '@/types/calendar-event.types'
import { assignEventColor } from '@/utils/calendar-colors'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
export const runtime = 'nodejs'

function log(level: 'info' | 'error', message: string, meta?: Record<string, any>) {
  const entry = { level, message, time: new Date().toISOString(), ...(meta || {}) }
  if (level === 'error') console.error(JSON.stringify(entry))
  else console.log(JSON.stringify(entry))
}
function getReqId(req: NextRequest) {
  return req.headers.get('x-request-id') || `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`
}
/**
 * Read events from JSON file
 */
function noop() {}

/**
 * Write events to JSON file
 */
function toCalEvent(row: any): CalendarEvent {
  return {
    id: row.id,
    type: row.type,
    productId: row.linked_id || undefined,
    productName: row.title || undefined,
    productType: row.resource || undefined,
    batch: undefined,
    weekStart: row.starts_at,
    weekEnd: row.ends_at || undefined,
    tank: undefined,
    notes: row.notes || undefined,
    color: row.color || assignEventColor(row.resource, row.type),
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined,
  }
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const CalendarEventInputSchema = z.object({
  type: z.enum(['production','bottling','admin','maintenance','barrel','npd','other']),
  productId: z.string().min(1).optional(),
  productName: z.string().min(1).optional(),
  productType: z.enum(['GIN','RUM','VODKA','CANE_SPIRIT','LIQUEUR','ADMIN']).optional(),
  batch: z.string().regex(/^\d+\/\d+$/).optional(),
  weekStart: z.string().min(1),
  weekEnd: z.string().min(1).optional(),
  tank: z.string().min(1).optional(),
  notes: z.string().optional(),
})

/**
 * GET /api/calendar-events
 * List all calendar events
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ events: [] }, { status: 200 })
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()
    const orgId = profile?.organization_id
    const { data: rows, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('organization_id', orgId)
      .order('starts_at')
    if (error) throw error
    const events: CalendarEvent[] = (rows || []).map(toCalEvent)
    log('info', 'calendar_events_list', { orgId, userId: user.id, count: events.length, reqId: getReqId(request) })
    return NextResponse.json({ events }, { status: 200 })
  } catch (error) {
    log('error', 'calendar_events_list_error', { error: (error as any)?.message, reqId: getReqId(request) })
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/calendar-events
 * Create new calendar event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = CalendarEventInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const input = parsed.data
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()
    const orgId = profile?.organization_id
    const color = assignEventColor(input.productType, input.type)
    let batch = input.batch
    if (input.type === 'production' && !batch) {
      const { data: rows } = await supabase
        .from('calendar_events')
        .select('id, type, title, linked_id')
        .eq('organization_id', orgId)
        .eq('type', 'production')
      const existing = (rows || []).filter((r: any) =>
        (input.productId && r.linked_id === input.productId) ||
        (!input.productId && input.productName && r.title === input.productName)
      )
      const count = existing.length
      batch = `${count + 1}/${count + 1}`
    }
    const id = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const title = input.productName || input.type
    log('info', 'calendar_event_create_attempt', { orgId, userId: user.id, id, type: input.type, productId: input.productId, productName: input.productName, reqId: getReqId(request) })
    const { error } = await supabase
      .from('calendar_events')
      .insert({
        id,
        organization_id: orgId,
        type: input.type,
        title,
        starts_at: input.weekStart,
        ends_at: input.weekEnd || input.weekStart,
        color,
        notes: input.notes || null,
        resource: input.productType || null,
        linked_id: input.productId || null,
        status: 'planned',
      })
    if (error) throw error
    log('info', 'calendar_event_created', { orgId, userId: user.id, id, type: input.type, reqId: getReqId(request) })
    const event: CalendarEvent = {
      id,
      type: input.type,
      productId: input.productId,
      productName: input.productName,
      productType: input.productType,
      batch,
      weekStart: input.weekStart,
      weekEnd: input.weekEnd,
      tank: input.tank,
      notes: input.notes,
      color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('POST /api/calendar-events error:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
