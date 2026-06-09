"use client";

import { Badge, Text } from "@zetsel/ui";
import type { CalendarEntryProps } from "./CalendarEntry.types";

const TYPE_COLORS: Record<string, string> = {
  scheduled: "gray",
  generated: "teal",
  published: "green",
  failed: "red",
};

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📷",
  twitter: "🐦",
  linkedin: "💼",
  tiktok: "🎵",
};

export function CalendarEntry({ entry, onClick }: CalendarEntryProps) {
  return (
    <Badge
      color={TYPE_COLORS[entry.type] ?? "gray"}
      variant="light"
      size="sm"
      style={{ cursor: "pointer", width: "100%", justifyContent: "flex-start", maxWidth: "100%" }}
      onClick={() => onClick(entry)}
    >
      <Text size="xs" truncate style={{ maxWidth: "100%" }}>
        {PLATFORM_ICONS[entry.platform] ?? "📌"} {entry.automationName}
      </Text>
    </Badge>
  );
}
