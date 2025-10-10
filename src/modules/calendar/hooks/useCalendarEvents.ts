import { createCalendarEvent } from "../services/calendar.repository";
import type { CalendarEvent } from "../types/calendar.types";

// Import your distillation session type - adjust the import path as needed
interface DistillationSession {
  id: string;
  date: string; // YYYY-MM-DD format
  boilerOn?: string; // HH:mm format
  sku: string;
  spiritRun: number;
  still: string;
  lalIn: number;
  lalOut?: number;
  lalEfficiency?: number;
}

export const createEventFromDistillationSession = async (s: DistillationSession): Promise<CalendarEvent> => {
  // Infer a reasonable end time: e.g., +10h from boilerOn
  const startISO = `${s.date}T${s.boilerOn?.length ? s.boilerOn.padStart(5,"0") : "06:00"}:00`;
  const start = new Date(startISO);
  const end = new Date(start.getTime() + 10 * 60 * 60 * 1000);

  return createCalendarEvent({
    title: `${s.sku} – Spirit Run ${s.spiritRun} (${s.still})`,
    type: "DISTILLATION",
    status: "DONE",
    resource: s.still,
    sku: s.sku,
    linked: { collection: "distillationSessions", id: s.id },
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    timezone: "Australia/Brisbane",
    notes: `LAL in: ${s.lalIn.toFixed(1)}; LAL out: ${(s.lalOut ?? 0).toFixed(1)}; Efficiency: ${(s.lalEfficiency ?? 0).toFixed(1)}%`,
  });
};

// Hook for bottling events
interface BottlingSession {
  id: string;
  date: string;
  sku: string;
  startTime?: string;
  endTime?: string;
  bottles?: number;
  volume?: number;
}

export const createEventFromBottlingSession = async (s: BottlingSession): Promise<CalendarEvent> => {
  const startISO = `${s.date}T${s.startTime?.length ? s.startTime.padStart(5,"0") : "09:00"}:00`;
  const start = new Date(startISO);
  const endISO = `${s.date}T${s.endTime?.length ? s.endTime.padStart(5,"0") : "17:00"}:00`;
  const end = new Date(endISO);

  return createCalendarEvent({
    title: `Bottling – ${s.sku}`,
    type: "BOTTLING",
    status: "DONE",
    resource: "Bottling line",
    sku: s.sku,
    linked: { collection: "bottlings", id: s.id },
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    timezone: "Australia/Brisbane",
    notes: s.bottles ? `Target ${s.bottles} bottles` : s.volume ? `Target ${s.volume}L` : undefined,
  });
};

// Hook for planned events
export const createPlannedEvent = async (params: {
  title: string;
  type: CalendarEventType;
  resource?: string;
  sku?: string;
  startsAt: string;
  endsAt: string;
  notes?: string;
}): Promise<CalendarEvent> => {
  return createCalendarEvent({
    ...params,
    status: "PLANNED",
    timezone: "Australia/Brisbane",
  });
};
