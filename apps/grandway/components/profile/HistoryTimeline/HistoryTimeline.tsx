"use client";

import { Group, Stack, Text, ThemeIcon, dayjs } from "@peppermint/ui";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import { ProfileCard } from "../ProfileCard";
import type {
  HistoryTimelineEntry,
  HistoryTimelineProps,
} from "./HistoryTimeline.types";

function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function HistoryTimelineRow({
  entry,
  iconFor,
}: {
  entry: HistoryTimelineEntry;
  iconFor: HistoryTimelineProps["iconFor"];
}) {
  const resolved = iconFor?.(entry.action);
  const icon = resolved?.icon ?? (
    <ClockCounterClockwiseIcon size={14} aria-hidden />
  );
  const color = resolved?.color ?? "gray";
  const changeEntries = Object.entries(entry.changes ?? {});

  return (
    <ProfileCard>
      <Group align="flex-start" wrap="nowrap" gap="sm">
        <ThemeIcon variant="light" color={color} size="md" radius="xl">
          {icon}
        </ThemeIcon>
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={600}>
            {entry.summary || entry.action.replace(/_/g, " ")}
          </Text>
          <Text size="xs" c="dimmed">
            {dayjs(entry.created_at).format("MMM D, YYYY h:mm A")} ·{" "}
            {entry.actor_label || `(${entry.actor_type ?? "system"})`}
          </Text>
          {entry.reason ? <Text size="sm">Reason: {entry.reason}</Text> : null}
          {changeEntries.map(([field, change]) => (
            <Text key={field} size="xs" c="dimmed">
              {field}: {renderValue(change.from)} → {renderValue(change.to)}
            </Text>
          ))}
        </Stack>
      </Group>
    </ProfileCard>
  );
}

/**
 * The shared audit-history renderer for every profile — the same card-led
 * timeline for leads, applicants, and journeys. Loading, error, and empty
 * states belong to the calling panel; this draws a non-empty list only.
 */
export function HistoryTimeline({
  entries,
  iconFor,
  truncatedNote,
}: HistoryTimelineProps) {
  return (
    <Stack gap="sm">
      {entries.map((entry) => (
        <HistoryTimelineRow key={entry.id} entry={entry} iconFor={iconFor} />
      ))}
      {truncatedNote ? (
        <Text size="xs" c="dimmed" ta="center">
          {truncatedNote}
        </Text>
      ) : null}
    </Stack>
  );
}
