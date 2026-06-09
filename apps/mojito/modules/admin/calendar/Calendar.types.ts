export type CalendarEntryType = "scheduled" | "generated" | "published" | "failed";

export interface CalendarEntry {
  id: string;
  type: CalendarEntryType;
  automationId: string;
  automationName: string;
  contentId?: string;
  platform: string;
  scheduledAt: string;
}

export type CalendarViewMode = "week" | "month";
