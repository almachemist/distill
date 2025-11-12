"use client";

import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { listCalendarEvents } from "../services/calendar.repository";
import type { CalendarEvent, CalendarEventType, CalendarStatus } from "../types/calendar.types";
import { CALENDAR_COLORS } from "../types/calendar.types";

interface CalendarViewProps {
  onEventClick?: (event: CalendarEvent) => void;
  filters?: {
    type?: string;
    status?: string;
    resource?: string;
    sku?: string;
  };
}

export default function CalendarView({ onEventClick, filters }: CalendarViewProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await listCalendarEvents({
        type: (filters?.type as CalendarEventType | undefined),
        status: (filters?.status as CalendarStatus | undefined),
        resource: filters?.resource,
        sku: filters?.sku,
      });
      setEvents(
        data.map((e: CalendarEvent) => ({
          id: e.id,
          title: e.title,
          start: e.startsAt,
          end: e.endsAt,
          allDay: !!e.allDay,
          backgroundColor: e.color,
          borderColor: e.color,
          extendedProps: e,
        }))
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error || {});
      console.error("Failed to load calendar events:", message, error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (info: any) => {
    const ev = info.event.extendedProps as CalendarEvent;
    if (onEventClick) {
      onEventClick(ev);
    } else if (ev.linked) {
      // Default behavior: navigate to linked record
      const path = `/dashboard/${ev.linked.collection}/${ev.linked.id}`;
      window.location.href = path;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        eventClick={handleEventClick}
        slotMinTime="05:00:00"
        slotMaxTime="22:00:00"
        timeZone="Australia/Brisbane"
        eventDisplay="block"
        dayMaxEvents={3}
        moreLinkClick="popover"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
      />
    </div>
  );
}

// Calendar filters component
export function CalendarFilters({ 
  filters, 
  onFiltersChange 
}: { 
  filters: any; 
  onFiltersChange: (filters: any) => void; 
}) {
  const eventTypes = Object.keys(CALENDAR_COLORS) as Array<keyof typeof CALENDAR_COLORS>;
  const statuses = ["PLANNED", "IN_PROGRESS", "DONE", "CANCELLED"];

  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Type
          </label>
          <select
            value={filters.type || ""}
            onChange={(e) => onFiltersChange({ ...filters, type: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {eventTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || ""}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resource
          </label>
          <input
            type="text"
            value={filters.resource || ""}
            onChange={(e) => onFiltersChange({ ...filters, resource: e.target.value || undefined })}
            placeholder="e.g., Carrie, VC-400"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU
          </label>
          <input
            type="text"
            value={filters.sku || ""}
            onChange={(e) => onFiltersChange({ ...filters, sku: e.target.value || undefined })}
            placeholder="e.g., Merchant Mae Gin"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onFiltersChange({})}
          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
