"use client";

import { Skeleton, Stack, Text, Timeline } from "@peppermint/ui";
import type { OrganizationEventLog } from "../../organization.types";
import { StatusBadge } from "../StatusBadge";
import type { EventTimelineListProps } from "./EventTimelineList.types";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EventEntry({ event }: { event: OrganizationEventLog }) {
  return (
    <Timeline.Item>
      <Stack gap={2}>
        <StatusBadge status={event.eventType} size="xs" />
        <Text size="sm">{event.summary}</Text>
        {event.reason && (
          <Text size="xs" c="dimmed">
            Reason: {event.reason}
          </Text>
        )}
        <Text size="xs" c="dimmed">
          {formatTimestamp(event.createdAt)}
        </Text>
      </Stack>
    </Timeline.Item>
  );
}

export function EventTimelineList({
  events,
  loading = false,
  emptyMessage = "No events recorded",
}: EventTimelineListProps) {
  if (loading) {
    return (
      <Stack gap="sm">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height={48} radius="sm" />
        ))}
      </Stack>
    );
  }

  if (events.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="xl">
        {emptyMessage}
      </Text>
    );
  }

  return (
    <Timeline active={events.length - 1} bulletSize={12} lineWidth={2}>
      {events.map((event) => (
        <EventEntry key={event.id} event={event} />
      ))}
    </Timeline>
  );
}
