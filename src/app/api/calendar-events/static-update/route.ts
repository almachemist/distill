/**
 * Static Calendar Events API - Update Production Calendar JSON
 *
 * Endpoints:
 * - PATCH /api/calendar-events/static-update - Update static event in production_calendar_2026_v4.json
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { z } from 'zod'
export const runtime = 'nodejs'

const CALENDAR_2026_FILE = join(process.cwd(), 'data', 'production_calendar_2026_v4.json')
const CALENDAR_DEC_FILE = join(process.cwd(), 'data', 'production_calendar_december_2025.json')

function log(level: 'info' | 'error', message: string, meta?: Record<string, any>) {
  const entry = { level, message, time: new Date().toISOString(), ...(meta || {}) }
  if (level === 'error') console.error(JSON.stringify(entry))
  else console.log(JSON.stringify(entry))
}
function getReqId(req: NextRequest) {
  return req.headers.get('x-request-id') || `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`
}
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
    const UpdateSchema = z.object({
      id: z.string().min(1),
      productName: z.string().optional(),
      batch: z.string().regex(/^\d+\/\d+$/).optional(),
      tank: z.string().optional(),
      notes: z.string().optional(),
      productType: z.enum(['ADMIN','GIN','RUM','VODKA','CANE_SPIRIT','LIQUEUR']).optional(),
      clear: z.boolean().optional(),
      weekStart: z.string().optional(),
      remove: z.boolean().optional(),
      type: z.enum(['production','bottling','admin','maintenance','barrel','npd','other']).optional()
    })
    const raw = await request.json()
    const parsed = UpdateSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const { id, productName, batch, tank, notes, productType, clear, weekStart, remove, type: eventType } = parsed.data

    log('info', 'static_update_attempt', { id, productName, batch, tank, productType, clear, reqId: getReqId(request) })

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

      log('info', 'static_event_cleared', { id, week: week.week_number, reqId: getReqId(request) })
      return NextResponse.json({ message: 'Static event cleared', week }, { status: 200 })
    }

    // If request is to delete the card (remove content and demote week if empty)
    if (remove === true) {
      // Remove only the part the user clicked
      if (eventType === 'bottling') {
        week.bottling_tasks = []
        ;(week as any).bottling = false
      } else {
        week.production_runs = []
      }

      // Demote to ADMIN if no content remains
      const hasProd = week.production_runs.length > 0
      const hasBott = (Array.isArray((week as any).bottling_tasks) && (week as any).bottling_tasks.length > 0) || (week as any).bottling === true
      if (!hasProd && !hasBott) {
        ;(week as any).mode = 'ADMIN'
        week.notes = []
      }

      data.calendar[weekIndex] = week
      data.generated_at = new Date().toISOString()
      writeFileSync(calendarFile, JSON.stringify(data, null, 2), 'utf-8')

      log('info', 'static_event_deleted', { id, week: week.week_number, reqId: getReqId(request) })
      return NextResponse.json({ message: 'Static event deleted', week }, { status: 200 })
    }

    // If weekStart is provided and points to a different week, move the card there
    if (typeof weekStart === 'string' && weekStart.trim().length > 0) {
      const code = weekStart.trim()
      let targetYear: number | null = null
      let targetWeekNo: number | null = null
      const m = code.match(/^(\d{4})-W(\d{1,2})$/i)
      if (m) {
        targetYear = parseInt(m[1], 10)
        targetWeekNo = parseInt(m[2], 10)
      } else {
        // Support simple forms like "15" or "W15"; assume same calendar as source
        const m2 = code.match(/^W?(\d{1,2})$/i)
        if (m2) {
          targetWeekNo = parseInt(m2[1], 10)
          targetYear = isDecember ? 2025 : 2026
        }
      }

      if (targetYear && targetWeekNo) {
        if (targetYear !== 2025 && targetYear !== 2026) {
          return NextResponse.json({ error: 'Only 2025 (Dec) and 2026 are supported for static calendar moves' }, { status: 400 })
        }

        const targetIsDecember = targetYear === 2025
        if (targetIsDecember !== isDecember || targetWeekNo !== weekNumber) {
          // We are moving the card across weeks (and possibly across files)
          const targetFile = targetIsDecember ? CALENDAR_DEC_FILE : CALENDAR_2026_FILE
          if (!existsSync(targetFile)) {
            return NextResponse.json({ error: 'Target calendar file not found' }, { status: 404 })
          }

          const targetData: CalendarData = JSON.parse(readFileSync(targetFile, 'utf-8'))
          const targetIndex = targetData.calendar.findIndex(w => w.week_number === targetWeekNo)
          if (targetIndex === -1) {
            return NextResponse.json({ error: `Target week ${targetWeekNo} not found in ${targetIsDecember ? 'December 2025' : '2026'} calendar` }, { status: 404 })
          }

          const targetWeek = targetData.calendar[targetIndex]

          // If source is a Bottling week, move bottling tasks instead of production run
          const isSourceBottling = week.bottling === true || (Array.isArray(week.bottling_tasks) && week.bottling_tasks.length > 0) || week.mode === 'BOTTLING'
          if (isSourceBottling) {
            const tasksToMove = Array.isArray(week.bottling_tasks) ? week.bottling_tasks.slice() : []

            // Prepare target for bottling
            if (!Array.isArray((targetWeek as any).bottling_tasks)) {
              (targetWeek as any).bottling_tasks = []
            }
            const existingTasks: string[] = (targetWeek as any).bottling_tasks || []
            const merged = Array.from(new Set([...existingTasks, ...tasksToMove]))
            ;(targetWeek as any).bottling_tasks = merged
            ;(targetWeek as any).bottling = true

            if (productType) (targetWeek as any).mode = productType
            if (typeof notes === 'string') (targetWeek as any).notes = [notes]

            // Clear source bottling tasks and demote week if empty
            week.bottling_tasks = []
            if (week.production_runs.length === 0) {
              ;(week as any).bottling = false
              if (week.mode === 'BOTTLING') (week as any).mode = 'ADMIN'
              week.notes = []
            }

            // Persist both calendars and return
            targetData.calendar[targetIndex] = targetWeek
            targetData.generated_at = new Date().toISOString()
            writeFileSync(targetFile, JSON.stringify(targetData, null, 2), 'utf-8')

            data.calendar[weekIndex] = week
            data.generated_at = new Date().toISOString()
            writeFileSync(calendarFile, JSON.stringify(data, null, 2), 'utf-8')

            log('info', 'static_bottling_moved', { fromWeek: weekNumber, fromDec: isDecember, toWeek: targetWeekNo, toDec: targetIsDecember, reqId: getReqId(request) })
            return NextResponse.json({ message: 'Static bottling moved', from: { week_number: weekNumber }, to: { week_number: targetWeekNo } }, { status: 200 })
          }


          // Build the run to move (prefer incoming fields, fallback to existing)
          const existingRun = week.production_runs[0]
          let newBatchNumber = existingRun?.batch_number ?? 1
          let newTotalBatches = existingRun?.total_batches ?? 1
          if (batch) {
            const [cur, tot] = batch.split('/').map((n: string) => parseInt(n))
            if (!isNaN(cur)) newBatchNumber = cur
            if (!isNaN(tot)) newTotalBatches = tot
          }
          const newRun = {
            product: productName || existingRun?.product || 'Production',
            batch_number: newBatchNumber,
            total_batches: newTotalBatches,
            receiving_tank: tank || existingRun?.receiving_tank || 'None',
          }

          if (targetWeek.production_runs.length === 0) {
            targetWeek.production_runs.push(newRun)
          } else {
            targetWeek.production_runs[0] = newRun
          }
          if (productType) targetWeek.mode = productType
          if (typeof notes === 'string') targetWeek.notes = [notes]

          // Clear the source week card contents (keep the week itself)
          week.production_runs = []
          if (typeof notes === 'string') {
            week.notes = []
          }

          // Persist both calendars when crossing files; or one when same file
          targetData.calendar[targetIndex] = targetWeek
          targetData.generated_at = new Date().toISOString()
          writeFileSync(targetFile, JSON.stringify(targetData, null, 2), 'utf-8')

          data.calendar[weekIndex] = week
          data.generated_at = new Date().toISOString()
          writeFileSync(calendarFile, JSON.stringify(data, null, 2), 'utf-8')

          log('info', 'static_event_moved', { fromWeek: weekNumber, fromDec: isDecember, toWeek: targetWeekNo, toDec: targetIsDecember, reqId: getReqId(request) })
          return NextResponse.json({ message: 'Static event moved', from: { week_number: weekNumber }, to: { week_number: targetWeekNo } }, { status: 200 })
        }
      }
    }

    // Handle event type conversion (production ↔ bottling)
    if (typeof eventType === 'string') {
      const t = eventType.toLowerCase()
      if (t === 'bottling') {
        const baseName = productName || (week.production_runs[0]?.product ?? '')
        const task = baseName
          ? (/^bottle\s+/i.test(baseName) ? baseName : `Bottle ${baseName}`)
          : 'Bottling'
        week.bottling = true
        week.bottling_tasks = Array.from(new Set([...(week.bottling_tasks || []), task]))
        // Convert the selected card: remove production run
        week.production_runs = []
        if (productType) (week as any).mode = productType
        if (typeof notes === 'string') week.notes = [notes]
      } else if (t === 'production') {
        // Convert bottling to a production run
        let current = 1
        let total = 1
        if (typeof batch === 'string') {
          const [cur, tot] = batch.split('/').map((n: string) => parseInt(n))
          if (!isNaN(cur)) current = cur
          if (!isNaN(tot)) total = tot
        }
        const inferredFromBottling = Array.isArray(week.bottling_tasks) && week.bottling_tasks[0]
          ? week.bottling_tasks[0].replace(/^bottle\s+/i, '')
          : undefined
        const product = productName || inferredFromBottling || week.production_runs[0]?.product || 'Production'
        const receiving_tank = tank || week.production_runs[0]?.receiving_tank || 'None'
        week.production_runs = [{ product, batch_number: current, total_batches: total, receiving_tank }]
        week.bottling = false
        week.bottling_tasks = []
        if (productType) (week as any).mode = productType
        if (typeof notes === 'string') week.notes = [notes]
      }
    }

    // If there are no production runs, create one (unless converting to bottling)
    if (week.production_runs.length === 0 && (productName || batch || tank) && (eventType?.toLowerCase?.() !== 'bottling')) {
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

    // If bottling week and productName provided, replace bottling task with the new name
    if (week.bottling === true && typeof productName === 'string' && productName.trim().length > 0) {
      const task = /^bottle\s+/i.test(productName) ? productName : `Bottle ${productName}`
      ;(week as any).bottling_tasks = [task]
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

    log('info', 'static_event_updated', { id, week: week.week_number, reqId: getReqId(request) })

    return NextResponse.json({
      message: 'Static event updated',
      week
    }, { status: 200 })
  } catch (error) {
    log('error', 'static_update_error', { error: (error as any)?.message, reqId: getReqId(request) })
    return NextResponse.json(
      { error: 'Failed to update static event' },
      { status: 500 }
    )
  }
}
