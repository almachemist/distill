import type { CalendarEvent } from '@/types/calendar-event.types'

/**
 * Convert week string (e.g., "2026-W15") to Date object
 */
function weekToDate(weekStr: string): Date {
  const [year, week] = weekStr.split('-W').map(Number)
  const jan4 = new Date(year, 0, 4)
  const weekStart = new Date(jan4)
  weekStart.setDate(jan4.getDate() - jan4.getDay() + 1 + (week - 1) * 7)
  return weekStart
}

/**
 * Format date for ICS file (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}T090000Z`
}

/**
 * Escape special characters for ICS format
 */
function escapeICS(text: string): string {
  return text.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n')
}

/**
 * Generate ICS file content from calendar events
 */
export function generateICS(events: CalendarEvent[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Devil\'s Thumb Distillery//Production Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Distillery Production Calendar 2026',
    'X-WR-TIMEZONE:Australia/Brisbane',
  ]

  events.forEach(event => {
    const startDate = weekToDate(event.weekStart)
    const endDate = event.weekEnd ? weekToDate(event.weekEnd) : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const summary = event.productName 
      ? `${event.productName}${event.batch ? ` (Batch ${event.batch})` : ''}`
      : event.type.toUpperCase()
    
    const description = [
      `Type: ${event.type}`,
      event.productType ? `Product Type: ${event.productType}` : '',
      event.tank ? `Tank: ${event.tank}` : '',
      event.notes ? `Notes: ${event.notes}` : '',
    ].filter(Boolean).join('\\n')

    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@distillery.local`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${escapeICS(summary)}`,
      `DESCRIPTION:${escapeICS(description)}`,
      event.color ? `COLOR:${event.color}` : '',
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT'
    )
  })

  lines.push('END:VCALENDAR')
  return lines.filter(Boolean).join('\r\n')
}

/**
 * Download ICS file
 */
export function downloadICS(events: CalendarEvent[], filename = 'distillery-calendar-2026.ics') {
  const icsContent = generateICS(events)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate HTML for PDF export
 */
export function generatePDFHTML(events: CalendarEvent[]): string {
  const eventsByWeek = events.reduce((acc, event) => {
    const week = event.weekStart
    if (!acc[week]) acc[week] = []
    acc[week].push(event)
    return acc
  }, {} as Record<string, CalendarEvent[]>)

  const sortedWeeks = Object.keys(eventsByWeek).sort()

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Distillery Production Calendar 2026</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: Arial, sans-serif; font-size: 10pt; }
    h1 { color: #1a1a1a; border-bottom: 3px solid #A65E2E; padding-bottom: 10px; }
    h2 { color: #4a4a4a; margin-top: 20px; font-size: 12pt; }
    .event { 
      margin: 10px 0; 
      padding: 10px; 
      border-left: 4px solid #ccc; 
      background: #f9f9f9;
      page-break-inside: avoid;
    }
    .event-header { font-weight: bold; font-size: 11pt; margin-bottom: 5px; }
    .event-details { color: #666; font-size: 9pt; }
    .batch { color: #A65E2E; font-weight: bold; }
    .tank { color: #555; }
    .notes { font-style: italic; margin-top: 5px; }
  </style>
</head>
<body>
  <h1>🥃 Devil's Thumb Distillery - Production Calendar 2026</h1>
  <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-AU', { dateStyle: 'full' })}</p>
  <p><strong>Total Events:</strong> ${events.length}</p>
  
  ${sortedWeeks.map(week => {
    const weekEvents = eventsByWeek[week]
    const weekDate = weekToDate(week)
    const weekLabel = weekDate.toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' })
    
    return `
      <h2>Week ${week.split('-W')[1]} (${weekLabel})</h2>
      ${weekEvents.map(event => `
        <div class="event" style="border-left-color: ${event.color}">
          <div class="event-header">
            ${event.productName || event.type.toUpperCase()}
            ${event.batch ? `<span class="batch">Batch ${event.batch}</span>` : ''}
          </div>
          <div class="event-details">
            Type: ${event.type}
            ${event.productType ? ` | Product: ${event.productType}` : ''}
            ${event.tank ? ` | <span class="tank">Tank: ${event.tank}</span>` : ''}
          </div>
          ${event.notes ? `<div class="notes">${event.notes}</div>` : ''}
        </div>
      `).join('')}
    `
  }).join('')}
</body>
</html>
  `
  return html
}

/**
 * Download PDF (opens print dialog)
 */
export function downloadPDF(events: CalendarEvent[]) {
  const html = generatePDFHTML(events)
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}

