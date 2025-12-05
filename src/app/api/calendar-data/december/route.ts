/**
 * Calendar Data API - December 2025 Production Calendar
 * 
 * Endpoints:
 * - GET /api/calendar-data/december - Get December 2025 production calendar data
 */

import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
export const runtime = 'nodejs'

const CALENDAR_FILE = join(process.cwd(), 'data', 'production_calendar_december_2025.json')

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
    console.error('GET /api/calendar-data/december error:', error)
    return NextResponse.json(
      { error: 'Failed to load calendar data' },
      { status: 500 }
    )
  }
}
