"use client";

import { Group, Stack, Table, Text, ThemeIcon, dayjs } from "@peppermint/ui";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import type {
  HistoryTableEntry,
  HistoryTableProps,
} from "./HistoryTable.types";
import classes from "./HistoryTable.module.css";

function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function HistoryRow({
  entry,
  iconFor,
}: {
  entry: HistoryTableEntry;
  iconFor: HistoryTableProps["iconFor"];
}) {
  const resolved = iconFor?.(entry.action);
  const icon = resolved?.icon ?? (
    <ClockCounterClockwiseIcon size={14} aria-hidden />
  );
  const color = resolved?.color ?? "gray";
  const changeEntries = Object.entries(entry.changes ?? {});
  const timestamp = dayjs(entry.created_at);

  return (
    <Table.Tr>
      <Table.Td className={classes.whenCell}>
        <Stack gap={0}>
          <Text size="xs" fw={500}>
            {timestamp.format("MMM D, YYYY")}
          </Text>
          <Text size="xs" c="dimmed">
            {timestamp.format("h:mm A")}
          </Text>
        </Stack>
      </Table.Td>
      <Table.Td className={classes.cell}>
        <Group gap="xs" wrap="nowrap" align="flex-start">
          <ThemeIcon variant="light" color={color} size="sm" radius="xl">
            {icon}
          </ThemeIcon>
          <Text size="xs" fw={500}>
            {entry.summary || entry.action.replace(/_/g, " ")}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td className={classes.cell}>
        <Text size="xs" c={entry.actor_label ? undefined : "dimmed"}>
          {entry.actor_label || `(${entry.actor_type ?? "system"})`}
        </Text>
      </Table.Td>
      <Table.Td className={classes.cell}>
        {entry.reason || changeEntries.length > 0 ? (
          <Stack gap={2}>
            {entry.reason ? <Text size="xs">{entry.reason}</Text> : null}
            {changeEntries.map(([field, change]) => (
              <Text key={field} size="xs" c="dimmed">
                {field}: {renderValue(change.from)} → {renderValue(change.to)}
              </Text>
            ))}
          </Stack>
        ) : (
          <Text size="xs" c="dimmed">
            —
          </Text>
        )}
      </Table.Td>
    </Table.Tr>
  );
}

/**
 * The shared audit-history renderer for every profile. A log is a table: the
 * operator reads it down the time column looking for when something changed
 * and who changed it, and a card per entry buried both of those inside prose.
 * Read-only by construction — every row is server-written, so there is no
 * action column and no row selection.
 *
 * Loading, error, and empty states belong to the calling panel; this draws a
 * non-empty list only. The table scrolls inside its own container so a long
 * `field: from → to` line never widens the page.
 */
export function HistoryTable({
  entries,
  iconFor,
  truncatedNote,
}: HistoryTableProps) {
  return (
    <Stack gap="xs">
      <Table.ScrollContainer minWidth={560}>
        {/* No `stickyHeader`: vertical scrolling belongs to the profile's own
            scroll container, not to this wrapper, so a sticky header here would
            never actually stick. The container's job is horizontal overflow. */}
        <Table highlightOnHover verticalSpacing="xs" horizontalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <Text size="xs" fw={700} c="dimmed">
                  When
                </Text>
              </Table.Th>
              <Table.Th>
                <Text size="xs" fw={700} c="dimmed">
                  Event
                </Text>
              </Table.Th>
              <Table.Th>
                <Text size="xs" fw={700} c="dimmed">
                  By
                </Text>
              </Table.Th>
              <Table.Th>
                <Text size="xs" fw={700} c="dimmed">
                  Details
                </Text>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {entries.map((entry) => (
              <HistoryRow key={entry.id} entry={entry} iconFor={iconFor} />
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {truncatedNote ? (
        <Text size="xs" c="dimmed" ta="center">
          {truncatedNote}
        </Text>
      ) : null}
    </Stack>
  );
}
