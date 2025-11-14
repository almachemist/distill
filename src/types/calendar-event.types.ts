/**
 * Calendar Event Types for Production Planning
 * 
 * This defines the data model for interactive calendar events
 * that can be created, edited, and deleted by users.
 */

export type CalendarEventType = 
  | 'production'
  | 'bottling'
  | 'admin'
  | 'maintenance'
  | 'barrel'
  | 'npd'
  | 'other'

export type ProductType = 
  | 'GIN'
  | 'RUM'
  | 'VODKA'
  | 'CANE_SPIRIT'
  | 'LIQUEUR'
  | 'ADMIN'

export interface CalendarEvent {
  id: string
  type: CalendarEventType
  productId?: string
  productName?: string
  productType?: ProductType
  batch?: string              // e.g. "1/3"
  weekStart: string           // e.g. "2025-W50" or "2026-W15"
  weekEnd?: string            // optional for multi-week events
  tank?: string               // e.g. "T-400", "T-330-A"
  notes?: string
  color: string               // auto-assigned based on product type
  createdAt?: string
  updatedAt?: string
}

export interface CalendarEventInput {
  type: CalendarEventType
  productId?: string
  productName?: string
  productType?: ProductType
  batch?: string
  weekStart: string
  weekEnd?: string
  tank?: string
  notes?: string
}

