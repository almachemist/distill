import type { CalendarEvent } from "../types/calendar.types";

export const toICS = (e: CalendarEvent): string => {
  const dt = (iso: string) => iso.replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
  const uid = `${e.id}@neurotemple-distillery`;
  
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Devil's Thumb Distillery//Calendar//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dt(new Date().toISOString())}`,
    `DTSTART:${dt(e.startsAt)}`,
    `DTEND:${dt(e.endsAt)}`,
    `SUMMARY:${e.title}`,
    `DESCRIPTION:${e.notes ?? ""}`,
    `LOCATION:${e.resource ?? ""}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
};

export const downloadICS = (event: CalendarEvent): void => {
  const icsContent = toICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadMultipleICS = (events: CalendarEvent[]): void => {
  const combinedICS = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Devil's Thumb Distillery//Calendar//EN",
    ...events.flatMap(e => {
      const dt = (iso: string) => iso.replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
      const uid = `${e.id}@neurotemple-distillery`;
      
      return [
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${dt(new Date().toISOString())}`,
        `DTSTART:${dt(e.startsAt)}`,
        `DTEND:${dt(e.endsAt)}`,
        `SUMMARY:${e.title}`,
        `DESCRIPTION:${e.notes ?? ""}`,
        `LOCATION:${e.resource ?? ""}`,
        "END:VEVENT"
      ];
    }),
    "END:VCALENDAR"
  ].join("\r\n");
  
  const blob = new Blob([combinedICS], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'distillery_calendar.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
