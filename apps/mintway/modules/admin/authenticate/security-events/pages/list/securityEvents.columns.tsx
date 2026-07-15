"use client";

import { Badge, Text, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import type { SecurityEvent } from "../../securityEvents.types";

/** Human label for an event type: replace underscores, sentence-case. */
function eventLabel(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ");
}

export function getSecurityEventsColumns(): DataTableShellColumn<SecurityEvent>[] {
  return [
    {
      accessor: "created_at",
      title: "When",
      render: (event: SecurityEvent) => {
        const d = event.created_at ? dayjs(event.created_at) : null;
        return d && d.isValid() ? (
          <Text size="xs">{d.format("MMM D, YYYY h:mm A")}</Text>
        ) : (
          <Text size="xs" c="dimmed">
            —
          </Text>
        );
      },
    },
    {
      accessor: "event_type",
      title: "Event",
      render: (event: SecurityEvent) => (
        <Text size="xs">{eventLabel(event.event_type)}</Text>
      ),
    },
    {
      accessor: "success",
      title: "Outcome",
      render: (event: SecurityEvent) => (
        <Badge size="xs" variant="light" color={event.success ? "teal" : "red"}>
          {event.success ? "Success" : "Failed"}
        </Badge>
      ),
    },
    {
      accessor: "actor_username",
      title: "Actor",
      render: (event: SecurityEvent) => (
        <Text size="xs" c={event.actor_username ? undefined : "dimmed"}>
          {event.actor_username || "—"}
        </Text>
      ),
    },
    {
      accessor: "target_username",
      title: "Target",
      render: (event: SecurityEvent) => (
        <Text size="xs" c={event.target_username ? undefined : "dimmed"}>
          {event.target_username || "—"}
        </Text>
      ),
    },
    {
      accessor: "ip",
      title: "IP",
      render: (event: SecurityEvent) => (
        <Text size="xs" c={event.ip ? undefined : "dimmed"}>
          {event.ip || "—"}
        </Text>
      ),
    },
    {
      accessor: "reason_code",
      title: "Reason",
      render: (event: SecurityEvent) => (
        <Text size="xs" c={event.reason_code ? undefined : "dimmed"}>
          {event.reason_code || "—"}
        </Text>
      ),
    },
  ];
}
