/**
 * Batch Numbering Logic
 * 
 * Automatically calculates batch numbers based on existing events
 * for the same product.
 */

import type { CalendarEvent } from '@/types/calendar-event.types'

/**
 * Parse batch string "1/3" into { current: 1, total: 3 }
 */
export function parseBatch(batch?: string): { current: number; total: number } | null {
  if (!batch) return null
  
  const match = batch.match(/^(\d+)\/(\d+)$/)
  if (!match) return null
  
  return {
    current: parseInt(match[1], 10),
    total: parseInt(match[2], 10),
  }
}

/**
 * Format batch object into string "1/3"
 */
export function formatBatch(current: number, total: number): string {
  return `${current}/${total}`
}

/**
 * Get all production events for a specific product
 */
export function getProductionEvents(
  events: CalendarEvent[],
  productId?: string,
  productName?: string
): CalendarEvent[] {
  return events.filter(event => {
    if (event.type !== 'production') return false
    
    // Match by productId or productName
    if (productId && event.productId === productId) return true
    if (productName && event.productName === productName) return true
    
    return false
  })
}

/**
 * Calculate next batch number for a product
 * 
 * Logic:
 * 1. Find all existing production events for this product
 * 2. Count how many batches exist
 * 3. Suggest next batch number
 * 
 * Example:
 * - If 2 batches exist (1/3, 2/3), suggest 3/3
 * - If no batches exist, suggest 1/1
 */
export function calculateNextBatch(
  events: CalendarEvent[],
  productId?: string,
  productName?: string,
  plannedTotal: number = 1
): string {
  const productionEvents = getProductionEvents(events, productId, productName)
  
  if (productionEvents.length === 0) {
    // First batch
    return formatBatch(1, plannedTotal)
  }
  
  // Find highest batch number
  let maxBatchNumber = 0
  let totalBatches = plannedTotal
  
  productionEvents.forEach(event => {
    const parsed = parseBatch(event.batch)
    if (parsed) {
      maxBatchNumber = Math.max(maxBatchNumber, parsed.current)
      totalBatches = Math.max(totalBatches, parsed.total)
    }
  })
  
  // Next batch number
  const nextBatchNumber = maxBatchNumber + 1
  
  return formatBatch(nextBatchNumber, totalBatches)
}

/**
 * Recalculate all batch numbers for a product
 * 
 * This is useful when:
 * - A batch is deleted
 * - Batches are reordered
 * - December 2025 events affect 2026 numbering
 */
export function recalculateBatchNumbers(
  events: CalendarEvent[],
  productId?: string,
  productName?: string
): Map<string, string> {
  const productionEvents = getProductionEvents(events, productId, productName)
  
  // Sort by week start
  const sortedEvents = [...productionEvents].sort((a, b) => {
    return a.weekStart.localeCompare(b.weekStart)
  })
  
  // Determine total batches
  const totalBatches = sortedEvents.length
  
  // Create map of event ID to new batch number
  const batchMap = new Map<string, string>()
  
  sortedEvents.forEach((event, index) => {
    const newBatch = formatBatch(index + 1, totalBatches)
    batchMap.set(event.id, newBatch)
  })
  
  return batchMap
}

/**
 * Parse week string "2025-W50" into { year: 2025, week: 50 }
 */
export function parseWeek(weekStr: string): { year: number; week: number } | null {
  const match = weekStr.match(/^(\d{4})-W(\d{1,2})$/)
  if (!match) return null
  
  return {
    year: parseInt(match[1], 10),
    week: parseInt(match[2], 10),
  }
}

/**
 * Format week object into string "2025-W50"
 */
export function formatWeek(year: number, week: number): string {
  return `${year}-W${week.toString().padStart(2, '0')}`
}

/**
 * Compare two week strings chronologically
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareWeeks(a: string, b: string): number {
  const parsedA = parseWeek(a)
  const parsedB = parseWeek(b)
  
  if (!parsedA || !parsedB) return 0
  
  if (parsedA.year !== parsedB.year) {
    return parsedA.year - parsedB.year
  }
  
  return parsedA.week - parsedB.week
}

