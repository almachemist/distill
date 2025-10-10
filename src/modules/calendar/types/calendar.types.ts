export type CalendarEventType = "DISTILLATION" | "BOTTLING" | "BLENDING" | "PACKAGING" | "MAINTENANCE" | "DELIVERY" | "TASTING" | "OTHER";
export type CalendarStatus = "PLANNED" | "IN_PROGRESS" | "DONE" | "CANCELLED";

export interface LinkedDocRef {
  collection: "distillationSessions" | "bottlings" | "blends" | "workOrders";
  id: string;               // e.g., "SPIRIT-GIN-MM-002"
}

export interface CalendarEvent {
  id: string;               // Firestore doc id
  title: string;            // e.g., "Vodka – 4th redistillation (Carrie)"
  type: CalendarEventType;
  status: CalendarStatus;
  resource?: string;        // e.g., "Carrie" (still), "VC-400", "Bottling line"
  sku?: string;             // e.g., "Merchant Mae Gin"
  linked?: LinkedDocRef;    // jump back into the data
  startsAt: string;         // ISO (YYYY-MM-DDTHH:mm:ss)
  endsAt: string;           // ISO
  allDay?: boolean;
  timezone: "Australia/Brisbane";
  notes?: string;
  color?: string;           // UI hint (hex)
  createdAt: number;        // Date.now()
  updatedAt: number;
}

export const CALENDAR_COLORS: Record<CalendarEventType, string> = {
  DISTILLATION: "#0ea5e9",
  BOTTLING: "#22c55e",
  BLENDING: "#a78bfa",
  PACKAGING: "#06b6d4",
  MAINTENANCE: "#f59e0b",
  DELIVERY: "#ef4444",
  TASTING: "#10b981",
  OTHER: "#64748b",
};
