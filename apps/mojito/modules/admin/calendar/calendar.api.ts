import type { CalendarEntry } from "./Calendar.types";

const PLATFORMS = ["instagram", "twitter", "linkedin", "tiktok"];
const TYPES: CalendarEntry["type"][] = ["scheduled", "generated", "published", "failed"];
const AUTOMATIONS = [
  { id: "auto_1", name: "Weekly Instagram Post" },
  { id: "auto_2", name: "LinkedIn Article" },
  { id: "auto_3", name: "Twitter Daily" },
];

export async function fetchCalendarEntries(from: string, to: string): Promise<CalendarEntry[]> {
  await new Promise((r) => setTimeout(r, 300));

  const start = new Date(from);
  const end = new Date(to);
  const entries: CalendarEntry[] = [];
  let counter = 1;

  const current = new Date(start);
  while (current <= end) {
    const count = Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const auto = AUTOMATIONS[Math.floor(Math.random() * AUTOMATIONS.length)];
      const type = TYPES[Math.floor(Math.random() * TYPES.length)];
      const platform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
      const hour = 9 + Math.floor(Math.random() * 8);
      const date = new Date(current);
      date.setHours(hour, 0, 0, 0);

      entries.push({
        id: `entry_${counter++}`,
        type,
        automationId: auto.id,
        automationName: auto.name,
        contentId: type !== "scheduled" ? `content_${counter}` : undefined,
        platform,
        scheduledAt: date.toISOString(),
      });
    }
    current.setDate(current.getDate() + 1);
  }

  return entries;
}
