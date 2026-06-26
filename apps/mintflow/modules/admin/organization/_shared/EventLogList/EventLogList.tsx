"use client";

import {
  Box,
  Collapse,
  Group,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from "@peppermint/ui";
import { useState } from "react";
import { ORG_EVENT_TYPE_LABELS } from "../../organization.constants";
import type { OrganizationEventLog } from "../../organization.types";
import { StatusBadge } from "../StatusBadge";
import type { EventLogListProps } from "./EventLogList.types";

const EVENT_TYPE_OPTIONS = [
  { value: "", label: "All events" },
  ...Object.entries(ORG_EVENT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

function StateDiff({
  previousState,
  newState,
}: {
  previousState: Record<string, unknown> | null;
  newState: Record<string, unknown> | null;
}) {
  if (!previousState && !newState) return null;

  return (
    <Stack gap="xs">
      {previousState && (
        <Box>
          <Text size="xs" fw={600} c="red" mb={2}>
            Before
          </Text>
          <Paper
            p="xs"
            bg="red.0"
            style={{ fontFamily: "monospace", fontSize: 11 }}
          >
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {JSON.stringify(previousState, null, 2)}
            </pre>
          </Paper>
        </Box>
      )}
      {newState && (
        <Box>
          <Text size="xs" fw={600} c="green" mb={2}>
            After
          </Text>
          <Paper
            p="xs"
            bg="green.0"
            style={{ fontFamily: "monospace", fontSize: 11 }}
          >
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {JSON.stringify(newState, null, 2)}
            </pre>
          </Paper>
        </Box>
      )}
    </Stack>
  );
}

function EventRow({ event }: { event: OrganizationEventLog }) {
  const [expanded, setExpanded] = useState(false);
  const hasDiff = event.previousState !== null || event.newState !== null;

  return (
    <Paper
      withBorder
      p="sm"
      style={{ cursor: hasDiff ? "pointer" : "default" }}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <Group gap="xs">
            <StatusBadge status={event.eventType} size="xs" />
            <Text size="sm">{event.summary}</Text>
          </Group>
          <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
            {new Date(event.createdAt).toLocaleString()}
          </Text>
        </Group>

        {event.reason && (
          <Text size="xs" c="dimmed">
            Reason: {event.reason}
          </Text>
        )}

        {hasDiff && (
          <Text
            size="xs"
            c="blue"
            style={{ cursor: "pointer" }}
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? "Hide changes" : "Show changes"}
          </Text>
        )}

        <Collapse expanded={expanded}>
          <StateDiff
            previousState={event.previousState}
            newState={event.newState}
          />
        </Collapse>
      </Stack>
    </Paper>
  );
}

export function EventLogList({
  events,
  loading = false,
  total,
  page,
  pageSize = 20,
  onPageChange,
  filters,
  onFiltersChange,
}: EventLogListProps) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <Stack gap="md">
      <Group gap="sm">
        <Select
          placeholder="Filter by event type"
          data={EVENT_TYPE_OPTIONS}
          value={filters.eventType ?? ""}
          onChange={(value) =>
            onFiltersChange({
              ...filters,
              eventType: (value ?? "") as typeof filters.eventType,
            })
          }
          clearable
          style={{ minWidth: 220 }}
          size="sm"
        />
        <TextInput
          placeholder="Filter by actor"
          value={filters.actingAssignment ?? ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              actingAssignment: e.currentTarget.value,
            })
          }
          size="sm"
          style={{ minWidth: 180 }}
        />
      </Group>

      {loading ? (
        <Stack gap="sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={72} radius="sm" />
          ))}
        </Stack>
      ) : events.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          No events found
        </Text>
      ) : (
        <Stack gap="sm">
          {events.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </Stack>
      )}

      {totalPages > 1 && (
        <Group justify="center">
          <Pagination
            total={totalPages}
            value={page}
            onChange={onPageChange}
            size="sm"
          />
        </Group>
      )}
    </Stack>
  );
}
