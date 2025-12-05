/**
 * Calendar Events API - Individual Event Operations
 * 
 * Endpoints:
 * - PATCH /api/calendar-events/[id] - Update event
 * - DELETE /api/calendar-events/[id] - Delete event
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import type { CalendarEvent, CalendarEventInput } from '@/types/calendar-event.types'
import { assignEventColor } from '@/utils/calendar-colors'
export const runtime = 'nodejs'

const EVENTS_FILE = join(process.cwd(), 'data', 'calendar_events.json')

/**
 * Read events from JSON file
 */
function readEvents(): CalendarEvent[] {
  try {
    if (!existsSync(EVENTS_FILE)) {
      return []
    }
    const data = readFileSync(EVENTS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading events:', error)
    return []
  }
}

/**
 * Write events to JSON file
 */
function writeEvents(events: CalendarEvent[]): void {
  try {
    writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing events:', error)
    throw new Error('Failed to save events')
  }
}

/**
 * PATCH /api/calendar-events/[id]
 * Update existing calendar event
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates: Partial<CalendarEventInput> = await request.json()
    
    const events = readEvents()
    const eventIndex = events.findIndex(e => e.id === id)
    
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }
    
    const existingEvent = events[eventIndex]
    
    // Merge updates
    const updatedEvent: CalendarEvent = {
      ...existingEvent,
      ...updates,
      id, // Preserve ID
      updatedAt: new Date().toISOString(),
    }
    
    // Re-assign color if product type changed
    if (updates.productType || updates.type) {
      updatedEvent.color = assignEventColor(
        updatedEvent.productType,
        updatedEvent.type
      )
    }
    
    events[eventIndex] = updatedEvent
    writeEvents(events)
    
    return NextResponse.json({ event: updatedEvent }, { status: 200 })
  } catch (error) {
    console.error('PATCH /api/calendar-events/[id] error:', error)
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const events = readEvents()
    const eventIndex = events.findIndex(e => e.id === id)
    
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }
    
    const deletedEvent = events[eventIndex]
    events.splice(eventIndex, 1)
    writeEvents(events)
    
    return NextResponse.json(
      { message: 'Event deleted', event: deletedEvent },
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE /api/calendar-events/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
