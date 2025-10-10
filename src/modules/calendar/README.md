# Production Calendar System

A comprehensive calendar system for tracking distillation, bottling, maintenance, and other production activities at Devil's Thumb Distillery.

## Features

- **Event Types**: Distillation, Bottling, Blending, Packaging, Maintenance, Delivery, Tasting, Other
- **Status Tracking**: Planned, In Progress, Done, Cancelled
- **Resource Management**: Track which still, equipment, or resource is being used
- **SKU Integration**: Link events to specific products
- **Data Linking**: Jump directly from calendar events to detailed session records
- **Timezone Support**: Configured for Australia/Brisbane
- **Export**: Download individual or multiple events as .ics files
- **Filtering**: Filter by type, status, resource, or SKU

## Quick Start

### 1. View Calendar
Navigate to `/dashboard/calendar` to see the production calendar with FullCalendar integration.

### 2. Create Quick Events
Click the "Quick Event" button to create planned events for:
- Maintenance schedules
- Planned bottling runs
- Delivery appointments
- Tasting sessions

### 3. Auto-Generated Events
Calendar events are automatically created when you save distillation sessions:

```typescript
import { CalendarIntegrationService } from '@/modules/calendar/services/calendar-integration.service';

// When saving a distillation session
await saveDistillationSession(session);
await CalendarIntegrationService.createDistillationEvent(session);
```

## Event Types & Colors

| Type | Color | Description |
|------|-------|-------------|
| Distillation | Blue (#0ea5e9) | Spirit distillation runs |
| Bottling | Green (#22c55e) | Bottling operations |
| Blending | Purple (#a78bfa) | Product blending |
| Packaging | Cyan (#06b6d4) | Packaging operations |
| Maintenance | Yellow (#f59e0b) | Equipment maintenance |
| Delivery | Red (#ef4444) | Deliveries and shipments |
| Tasting | Emerald (#10b981) | Product tastings |
| Other | Gray (#64748b) | Other activities |

## Calendar Views

- **Month View**: Overview of the month with color-coded events
- **Week View**: Detailed weekly schedule
- **Day View**: Hour-by-hour daily schedule

## Event Details

Each calendar event includes:
- **Title**: Descriptive name (e.g., "Merchant Mae Gin – Spirit Run 2 (Carrie)")
- **Type**: Event category for color coding
- **Status**: Current state (Planned, In Progress, Done, Cancelled)
- **Resource**: Equipment or resource used (e.g., "Carrie", "VC-400")
- **SKU**: Product identifier (e.g., "Merchant Mae Gin")
- **Linked Data**: Direct link to detailed session records
- **Time**: Start and end times in Australia/Brisbane timezone
- **Notes**: Additional information

## Data Integration

### Distillation Sessions
When you save a distillation session, a calendar event is automatically created with:
- Session details (LAL in/out, efficiency)
- Still information
- Product SKU
- Direct link back to the session

### Bottling Runs
Create planned bottling events, then update them when completed with:
- Actual bottling data
- Link to bottling records
- Status change to "Done"

## Export Functionality

### Individual Events
Click on any event to export it as an .ics file for external calendar applications.

### Bulk Export
Use the "Export Calendar" button to download all filtered events as a single .ics file.

## API Reference

### Calendar Repository

```typescript
import { 
  createCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent, 
  listCalendarEvents 
} from '@/modules/calendar/services/calendar.repository';

// Create a new event
const event = await createCalendarEvent({
  title: "Maintenance - Carrie Still",
  type: "MAINTENANCE",
  status: "PLANNED",
  resource: "Carrie",
  startsAt: "2025-01-15T09:00:00+10:00",
  endsAt: "2025-01-15T17:00:00+10:00",
  timezone: "Australia/Brisbane",
  notes: "Monthly maintenance check"
});

// Update an event
await updateCalendarEvent(event.id, {
  status: "DONE",
  notes: "Maintenance completed successfully"
});

// List events with filters
const events = await listCalendarEvents({
  type: "DISTILLATION",
  status: "DONE",
  from: "2025-01-01",
  to: "2025-01-31"
});
```

### Calendar Hooks

```typescript
import { 
  createEventFromDistillationSession,
  createEventFromBottlingSession,
  createPlannedEvent 
} from '@/modules/calendar/hooks/useCalendarEvents';

// Auto-create from distillation session
await createEventFromDistillationSession(distillationSession);

// Auto-create from bottling session
await createEventFromBottlingSession(bottlingSession);

// Create planned event
await createPlannedEvent({
  title: "Weekly Maintenance",
  type: "MAINTENANCE",
  resource: "Carrie",
  startsAt: "2025-01-20T09:00:00+10:00",
  endsAt: "2025-01-20T17:00:00+10:00"
});
```

## Customization

### Adding New Event Types
1. Update `CalendarEventType` in `calendar.types.ts`
2. Add color mapping in `CALENDAR_COLORS`
3. Update the calendar filters component

### Custom Event Creation
Create custom event creation functions for specific workflows:

```typescript
export const createMaintenanceEvent = async (equipment: string, date: string) => {
  return createPlannedEvent({
    title: `Maintenance - ${equipment}`,
    type: "MAINTENANCE",
    resource: equipment,
    startsAt: `${date}T09:00:00+10:00`,
    endsAt: `${date}T17:00:00+10:00`,
    notes: "Scheduled maintenance"
  });
};
```

## Troubleshooting

### Events Not Appearing
- Check Firestore permissions for the `calendarEvents` collection
- Verify timezone settings (should be Australia/Brisbane)
- Check browser console for errors

### Export Issues
- Ensure events have valid start/end times
- Check that .ics format is supported by your calendar application

### Performance
- Use filters to limit the number of events loaded
- Consider pagination for large date ranges
- Cache frequently accessed events

## Future Enhancements

- **Recurring Events**: Weekly maintenance, monthly tastings
- **Notifications**: Email/SMS reminders for upcoming events
- **Resource Scheduling**: Prevent double-booking of equipment
- **Production Planning**: Drag-and-drop event scheduling
- **Mobile App**: Native mobile calendar integration
- **Analytics**: Production efficiency tracking via calendar data
