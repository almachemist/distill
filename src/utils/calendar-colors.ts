/**
 * Calendar Color Assignment Utility
 * 
 * STRICT DESIGN SYSTEM - DO NOT MODIFY
 * 
 * These colors are the official distillery brand palette.
 * No green, blue, purple, yellow, or bright colors allowed.
 */

import type { ProductType, CalendarEventType } from '@/types/calendar-event.types'

// Official Distillery Color Palette
export const DISTILLERY_COLORS = {
  // Rum / Cane Spirit - Copper
  RUM: '#A65E2E',
  CANE_SPIRIT: '#A65E2E',
  
  // Gin - Strong Beige
  GIN: '#D7C4A2',
  
  // Vodka (neutral spirit) - Dark Gray
  VODKA: '#777777',
  
  // Coffee Liqueur / Other Liqueurs - Chocolate Muted
  LIQUEUR: '#9A6A4F',
  
  // Admin / Cleaning / Lab / Prep - Light Gray
  ADMIN: '#E5E5E5',
  
  // Empty weeks - White
  EMPTY: '#FFFFFF',
} as const

/**
 * Get color for a product type
 */
export function getProductColor(productType?: ProductType): string {
  if (!productType) return DISTILLERY_COLORS.EMPTY
  
  switch (productType) {
    case 'RUM':
      return DISTILLERY_COLORS.RUM
    case 'CANE_SPIRIT':
      return DISTILLERY_COLORS.CANE_SPIRIT
    case 'GIN':
      return DISTILLERY_COLORS.GIN
    case 'VODKA':
      return DISTILLERY_COLORS.VODKA
    case 'LIQUEUR':
      return DISTILLERY_COLORS.LIQUEUR
    case 'ADMIN':
      return DISTILLERY_COLORS.ADMIN
    default:
      return DISTILLERY_COLORS.EMPTY
  }
}

/**
 * Get color for an event type (fallback if no product type)
 */
export function getEventTypeColor(eventType: CalendarEventType): string {
  switch (eventType) {
    case 'production':
      return DISTILLERY_COLORS.EMPTY // Will be overridden by product type
    case 'bottling':
      return DISTILLERY_COLORS.ADMIN // Light gray for bottling
    case 'admin':
    case 'maintenance':
      return DISTILLERY_COLORS.ADMIN
    case 'barrel':
      return DISTILLERY_COLORS.RUM // Barrel aging is rum-related
    case 'npd':
    case 'other':
      return DISTILLERY_COLORS.ADMIN
    default:
      return DISTILLERY_COLORS.EMPTY
  }
}

/**
 * Auto-assign color based on product type or event type
 */
export function assignEventColor(
  productType?: ProductType,
  eventType?: CalendarEventType
): string {
  // Product type takes priority
  if (productType) {
    return getProductColor(productType)
  }
  
  // Fallback to event type
  if (eventType) {
    return getEventTypeColor(eventType)
  }
  
  // Default to empty
  return DISTILLERY_COLORS.EMPTY
}

/**
 * Get text color (white or dark) based on background color
 */
export function getTextColor(backgroundColor: string): string {
  // Light backgrounds get dark text
  if (backgroundColor === DISTILLERY_COLORS.ADMIN || 
      backgroundColor === DISTILLERY_COLORS.EMPTY ||
      backgroundColor === DISTILLERY_COLORS.GIN) {
    return '#1C1917' // stone-900
  }
  
  // Dark backgrounds get white text
  return '#FFFFFF'
}

/**
 * Get border color based on background color
 */
export function getBorderColor(backgroundColor: string): string {
  switch (backgroundColor) {
    case DISTILLERY_COLORS.RUM:
    case DISTILLERY_COLORS.CANE_SPIRIT:
      return '#8B4E25' // Darker copper
    case DISTILLERY_COLORS.GIN:
      return '#C4B190' // Darker beige
    case DISTILLERY_COLORS.VODKA:
      return '#666666' // Darker gray
    case DISTILLERY_COLORS.LIQUEUR:
      return '#7D5540' // Darker chocolate
    case DISTILLERY_COLORS.ADMIN:
      return '#D4D4D4' // Darker light gray
    default:
      return '#E5E7EB' // Default border
  }
}

/**
 * Detect product type from product name
 */
export function detectProductType(productName?: string): ProductType | undefined {
  if (!productName) return undefined
  
  const name = productName.toLowerCase()
  
  if (name.includes('gin')) return 'GIN'
  if (name.includes('rum')) return 'RUM'
  if (name.includes('vodka')) return 'VODKA'
  if (name.includes('cane spirit')) return 'CANE_SPIRIT'
  if (name.includes('liqueur') || name.includes('coffee')) return 'LIQUEUR'
  if (name.includes('admin') || name.includes('cleaning') || name.includes('maintenance')) return 'ADMIN'
  
  return undefined
}

