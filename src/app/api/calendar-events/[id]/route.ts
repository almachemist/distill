/**
 * Calendar Events API - Individual Event Operations
 * 
 * Endpoints:
 * - PATCH /api/calendar-events/[id] - Update event
 * - DELETE /api/calendar-events/[id] - Delete event
 */

import { NextRequest, NextResponse } from 'next/server'
import type { CalendarEvent, CalendarEventInput } from '@/types/calendar-event.types'
import { assignEventColor } from '@/utils/calendar-colors'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
export const runtime = 'nodejs'

type ContextWithIdParam = { params: { id: string } }

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

const CalendarEventUpdateSchema = z.object({
  type: z.enum(['production','bottling','admin','maintenance','barrel','npd','other']).optional(),
  productId: z.string().min(1).optional(),
  productName: z.string().min(1).optional(),
  productType: z.enum(['GIN','RUM','VODKA','CANE_SPIRIT','LIQUEUR','ADMIN']).optional(),
  batch: z.string().regex(/^\d+\/\d+$/).optional(),
  weekStart: z.string().min(1).optional(),
  weekEnd: z.string().min(1).optional(),
  tank: z.string().min(1).optional(),
  notes: z.string().optional(),
})

/**
 * PATCH /api/calendar-events/[id]
 * Update existing calendar event
 */
export async function PATCH(
  request: NextRequest,
  context: ContextWithIdParam
) {
  try {
    const { id } = context.params
    const body = await request.json()
    const parsed = CalendarEventUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const updates: Partial<CalendarEventInput> = parsed.data
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()
    const orgId = profile?.organization_id
    const { data: existing } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('organization_id', orgId)
      .eq('id', id)
      .maybeSingle()
    if (!existing) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    const color = (updates.productType || updates.type)
      ? assignEventColor(updates.productType || existing.resource, updates.type || existing.type)
      : existing.color
    log('info', 'calendar_event_update_attempt', { orgId, userId: user.id, id, reqId: getReqId(request) })
    const { error } = await supabase
      .from('calendar_events')
      .update({
        type: updates.type ?? existing.type,
        title: updates.productName ?? existing.title,
        starts_at: updates.weekStart ?? existing.starts_at,
        ends_at: (updates.weekEnd ?? existing.ends_at) || (updates.weekStart ?? existing.starts_at),
        color,
        notes: updates.notes ?? existing.notes,
        resource: updates.productType ?? existing.resource,
        linked_id: updates.productId ?? existing.linked_id,
        updated_at: new Date().toISOString(),
      })
      .eq('organization_id', orgId)
      .eq('id', id)
    if (error) throw error
    log('info', 'calendar_event_updated', { orgId, userId: user.id, id, reqId: getReqId(request) })
    const event: CalendarEvent = toCalEvent({
      ...existing,
      type: updates.type ?? existing.type,
      title: updates.productName ?? existing.title,
      starts_at: updates.weekStart ?? existing.starts_at,
      ends_at: (updates.weekEnd ?? existing.ends_at) || (updates.weekStart ?? existing.starts_at),
      color,
      notes: updates.notes ?? existing.notes,
      resource: updates.productType ?? existing.resource,
      linked_id: updates.productId ?? existing.linked_id,
      updated_at: new Date().toISOString(),
    })
    return NextResponse.json({ event }, { status: 200 })
  } catch (error) {
    log('error', 'calendar_event_update_error', { error: (error as any)?.message, reqId: getReqId(request) })
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/calendar-events/[id]
 * Delete calendar event
 */
export async function DELETE(
  request: NextRequest,
  context: ContextWithIdParam
) {
  try {
    const { id } = context.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()
    const orgId = profile?.organization_id
    const { data: existing } = await supabase
      .from('calendar_events')
      .select('id')
      .eq('organization_id', orgId)
      .eq('id', id)
      .maybeSingle()
    if (!existing) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    log('info', 'calendar_event_delete_attempt', { orgId, userId: user.id, id, reqId: getReqId(request) })
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('organization_id', orgId)
      .eq('id', id)
    if (error) throw error
    log('info', 'calendar_event_deleted', { orgId, userId: user.id, id, reqId: getReqId(request) })
    return NextResponse.json({ message: 'Event deleted' }, { status: 200 })
  } catch (error) {
    log('error', 'calendar_event_delete_error', { error: (error as any)?.message, reqId: getReqId(request) })
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
