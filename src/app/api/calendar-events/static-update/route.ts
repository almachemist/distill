/**
 * Static Calendar Events API - Update Production Calendar JSON
 *
 * Endpoints:
 * - PATCH /api/calendar-events/static-update - Update static event in production_calendar_2026_v4.json
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const CALENDAR_2026_FILE = join(process.cwd(), 'data', 'production_calendar_2026_v4.json')
const CALENDAR_DEC_FILE = join(process.cwd(), 'data', 'production_calendar_december_2025.json')

interface WeekPlan {
  week_number: number
  week_start: string
  week_end: string
  month: number
  month_name: string
  mode: string
  production_runs: Array<{
    product: string
    batch_number: number
    total_batches: number
    receiving_tank: string
  }>
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

/**
 * PATCH /api/calendar-events/static-update
 * Update static event in production calendar JSON
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, productName, batch, tank, notes, productType, clear } = body

    console.log('📝 Updating static event:', { id, productName, batch, tank, notes, productType, clear })

    // Extract week number from ID (format: "static-50" or "static-dec-50")
    const isDecember = id.startsWith('static-dec-')
    const weekNumber = parseInt(id.replace('static-dec-', '').replace('static-', ''))

    if (isNaN(weekNumber)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      )
    }

    // Read the appropriate calendar file
    const calendarFile = isDecember ? CALENDAR_DEC_FILE : CALENDAR_2026_FILE

    if (!existsSync(calendarFile)) {
      return NextResponse.json(
        { error: 'Calendar file not found' },
        { status: 404 }
      )
    }

    const data: CalendarData = JSON.parse(readFileSync(calendarFile, 'utf-8'))

    // Find the week
    const weekIndex = data.calendar.findIndex(w => w.week_number === weekNumber)

    if (weekIndex === -1) {
      return NextResponse.json(
        { error: 'Week not found' },
        { status: 404 }
      )
    }

    const week = data.calendar[weekIndex]

    // If request is to clear the card contents (keep mode and layout intact)
    if (clear === true) {
      if (week.production_runs.length > 0) {
        week.production_runs[0].product = ''
        // Keep batch numbers as-is to avoid visual glitches like "0/0"
        week.production_runs[0].receiving_tank = 'None'
      }
      if (week.bottling) {
        week.bottling_tasks = []
      }
      week.notes = []

      data.calendar[weekIndex] = week
      data.generated_at = new Date().toISOString()
      writeFileSync(calendarFile, JSON.stringify(data, null, 2), 'utf-8')

      console.log('✅ Static event cleared successfully')
      return NextResponse.json({ message: 'Static event cleared', week }, { status: 200 })
    }

    // If there are no production runs, create one
    if (week.production_runs.length === 0 && (productName || batch || tank)) {
      week.production_runs.push({
        product: productName || 'New Product',
        batch_number: 1,
        total_batches: 1,
        receiving_tank: tank || 'None'
      })
    }

    // Update the week data based on input
    if (productName && week.production_runs.length > 0) {
      week.production_runs[0].product = productName
    }

    if (batch) {
      const [current, total] = batch.split('/').map((n: string) => parseInt(n))
      if (!isNaN(current) && !isNaN(total) && week.production_runs.length > 0) {
        week.production_runs[0].batch_number = current
        week.production_runs[0].total_batches = total
      }
    }

    if (tank && week.production_runs.length > 0) {
      week.production_runs[0].receiving_tank = tank
    }

    if (notes) {
      week.notes = [notes]
    }

    if (productType) {
      week.mode = productType
    }

    // Update the calendar
    data.calendar[weekIndex] = week
    data.generated_at = new Date().toISOString()

    // Write back to file
    writeFileSync(calendarFile, JSON.stringify(data, null, 2), 'utf-8')

    console.log('✅ Static event updated successfully')

    return NextResponse.json({
      message: 'Static event updated',
      week
    }, { status: 200 })
  } catch (error) {
    console.error('PATCH /api/calendar-events/static-update error:', error)
    return NextResponse.json(
      { error: 'Failed to update static event' },
      { status: 500 }
    )
  }
}

