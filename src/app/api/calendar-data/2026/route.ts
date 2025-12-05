/**
 * Calendar Data API - 2026 Production Calendar
 * 
 * Endpoints:
 * - GET /api/calendar-data/2026 - Get 2026 production calendar data
 */

import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
export const runtime = 'nodejs'

const CALENDAR_FILE = join(process.cwd(), 'data', 'production_calendar_2026_v4.json')

export async function GET() {
  try {
    const data = readFileSync(CALENDAR_FILE, 'utf-8')
    const calendar = JSON.parse(data)
    
    return NextResponse.json(calendar, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    })
  } catch (error) {
    console.error('GET /api/calendar-data/2026 error:', error)
    return NextResponse.json(
      { error: 'Failed to load calendar data' },
      { status: 500 }
    )
  }
}
