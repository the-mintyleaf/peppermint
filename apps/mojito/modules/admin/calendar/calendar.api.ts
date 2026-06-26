import type { CalendarEntry } from "./Calendar.types";
import { fetchContentItems } from "@/modules/admin/content/content.api";
import type {
  ContentStatus,
  Platform,
} from "@/modules/admin/shared/domain.types";

export const STATUS_COLORS: Record<ContentStatus, string> = {
  draft: "gray",
  pending_review: "yellow",
  approved: "teal",
  scheduled: "blue",
  publishing: "orange",
  published: "green",
  failed: "red",
};

export async function fetchCalendarEntries(
  from: string,
  to: string,
  filters?: {
    platform?: Platform;
    status?: ContentStatus;
    source?: "manual" | "agent";
  },
): Promise<CalendarEntry[]> {
  const result = await fetchContentItems({
    range: { from: new Date(from), to: new Date(to) },
    status: filters?.status,
    platform: filters?.platform,
    source: filters?.source,
    pageSize: 200,
  });

  return result.data
    .filter((item) => item.schedule.scheduledAt)
    .map((item) => ({
      id: item.id,
      type: item.status as CalendarEntry["type"],
      automationId: "",
      automationName: item.source === "agent" ? "Agent Generated" : "Manual",
      contentId: item.id,
      platform: item.variants[0]?.platform ?? "instagram",
      scheduledAt: item.schedule.scheduledAt!.toISOString(),
      title: item.title,
      status: item.status,
    }));
}

export async function rescheduleCalendarEntry(
  contentId: string,
  newDate: Date,
  timezone: string,
): Promise<void> {
  const { scheduleContentItem } =
    await import("@/modules/admin/content/content.api");
  await scheduleContentItem(contentId, newDate, timezone);
}
