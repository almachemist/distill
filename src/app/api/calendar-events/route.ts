/**
 * Calendar Events API - Local JSON Storage
 * 
 * Endpoints:
 * - GET /api/calendar-events - List all events
 * - POST /api/calendar-events - Create new event
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import type { CalendarEvent, CalendarEventInput } from '@/types/calendar-event.types'
import { assignEventColor } from '@/utils/calendar-colors'
import { calculateNextBatch } from '@/utils/batch-numbering'

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
 * Generate unique ID
 */
function generateId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * GET /api/calendar-events
 * List all calendar events
 */
export async function GET(request: NextRequest) {
  try {
    const events = readEvents()
    return NextResponse.json({ events }, { status: 200 })
  } catch (error) {
    console.error('GET /api/calendar-events error:', error)
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
    const input: CalendarEventInput = await request.json()
    
    // Validate required fields
    if (!input.type || !input.weekStart) {
      return NextResponse.json(
        { error: 'Missing required fields: type, weekStart' },
        { status: 400 }
      )
    }
    
    const events = readEvents()
    
    // Auto-assign color
    const color = assignEventColor(input.productType, input.type)
    
    // Auto-calculate batch number if production event
    let batch = input.batch
    if (input.type === 'production' && !batch) {
      batch = calculateNextBatch(events, input.productId, input.productName)
    }
    
    // Create new event
    const newEvent: CalendarEvent = {
      id: generateId(),
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
    
    events.push(newEvent)
    writeEvents(events)
    
    return NextResponse.json({ event: newEvent }, { status: 201 })
  } catch (error) {
    console.error('POST /api/calendar-events error:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}

