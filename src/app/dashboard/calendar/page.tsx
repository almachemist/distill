"use client";

import { useState } from "react";
import CalendarView, { CalendarFilters } from "@/modules/calendar/components/CalendarView";
import QuickEventForm from "@/modules/calendar/components/QuickEventForm";
import { downloadMultipleICS } from "@/modules/calendar/utils/ics";
import { listCalendarEvents } from "@/modules/calendar/services/calendar.repository";
import type { CalendarEvent } from "@/modules/calendar/types/calendar.types";

export default function CalendarPage() {
  const [filters, setFilters] = useState<{
    type?: string;
    status?: string;
    resource?: string;
    sku?: string;
  }>({});

  const handleExportCalendar = async () => {
    try {
      const events = await listCalendarEvents(filters);
      downloadMultipleICS(events);
    } catch (error) {
      console.error("Failed to export calendar:", error);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (event.linked) {
      const path = `/dashboard/${event.linked.collection}/${event.linked.id}`;
      window.location.href = path;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Calendar</h1>
          <p className="text-gray-600">
            Plan and track distillation, bottling, and maintenance activities
          </p>
        </div>
        <div className="flex gap-2">
          <QuickEventForm onEventCreated={() => window.location.reload()} />
          <button
            onClick={handleExportCalendar}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Export Calendar
          </button>
        </div>
      </div>

      <CalendarFilters 
        filters={filters} 
        onFiltersChange={setFilters} 
      />

      <CalendarView 
        onEventClick={handleEventClick}
        filters={filters}
      />

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Calendar Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Distillation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Bottling</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span>Blending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-cyan-500 rounded"></div>
            <span>Packaging</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Maintenance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded"></div>
            <span>Tasting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span>Other</span>
          </div>
        </div>
      </div>
    </div>
  );
}
