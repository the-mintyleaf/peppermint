import type { ContentStatus } from "@/modules/admin/shared/domain.types";

export type CalendarEntryType = ContentStatus;

export interface CalendarEntry {
  id: string;
  type: CalendarEntryType;
  automationId: string;
  automationName: string;
  contentId?: string;
  platform: string;
  scheduledAt: string;
  title?: string;
  status?: ContentStatus;
}

export type CalendarViewMode = "week" | "month";
