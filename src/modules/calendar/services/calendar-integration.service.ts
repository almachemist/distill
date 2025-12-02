import { createEventFromDistillationSession } from "../hooks/useCalendarEvents";
import type { DistillationSession } from "../../production/types/distillation-session.types";

/**
 * Integration service to automatically create calendar events
 * when distillation sessions are saved
 */
export class CalendarIntegrationService {
  /**
   * Create a calendar event when a distillation session is completed
   */
  static async createDistillationEvent(session: DistillationSession): Promise<void> {
    try {
      await createEventFromDistillationSession({
        id: session.id,
        date: session.date,
        boilerOn: session.boilerOn,
        sku: session.sku,
        spiritRun: parseInt(session.spiritRun?.split('-').pop() || '1'),
        still: session.still,
        lalIn: session.lalIn ?? 0,
        lalOut: session.lalOut ?? undefined,
        lalEfficiency: session.lalEfficiency ?? undefined,
      });
      console.log(`Calendar event created for distillation session ${session.id}`);
    } catch (error) {
      console.error("Failed to create calendar event for distillation session:", error);
      // Don't throw - calendar event creation shouldn't break the main flow
    }
  }

  /**
   * Update calendar event when distillation session is modified
   */
  static async updateDistillationEvent(session: DistillationSession): Promise<void> {
    try {
      // First, we'd need to find the existing calendar event
      // This would require a query to find events linked to this session
      // For now, we'll create a new event (in practice, you'd update the existing one)
      await this.createDistillationEvent(session);
    } catch (error) {
      console.error("Failed to update calendar event for distillation session:", error);
    }
  }
}

/**
 * Example usage in your distillation session service:
 * 
 * ```typescript
 * import { CalendarIntegrationService } from '@/modules/calendar/services/calendar-integration.service';
 * 
 * export const saveDistillationSession = async (session: DistillationSession) => {
 *   // Save to your main database/firestore
 *   await saveToDatabase(session);
 *   
 *   // Automatically create calendar event
 *   await CalendarIntegrationService.createDistillationEvent(session);
 * };
 * ```
 */
