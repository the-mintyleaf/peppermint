"use client";

import {
  Badge,
  Divider,
  Drawer,
  Group,
  Stack,
  Table,
  Text,
} from "@peppermint/ui";
import type { EventDetailDrawerProps } from "./EventDetailDrawer.types";

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="md" align="flex-start">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="xs" ta="right" c={value ? undefined : "dimmed"}>
        {value || "—"}
      </Text>
    </Group>
  );
}

function renderJson(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

/**
 * Full audit event detail, including a before/after diff of `changes`
 * (`audit/docs/INTEGRATION.md` §4). Read-only — the log is append-only by design, so
 * there is no edit or delete control anywhere on this screen.
 */
export function EventDetailDrawer({
  event,
  opened,
  onClose,
}: EventDetailDrawerProps) {
  const changeEntries = event ? Object.entries(event.changes) : [];
  const metadataEntries = event ? Object.entries(event.metadata) : [];

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      title={event ? "Audit event" : "Event"}
    >
      {event ? (
        <Stack gap="sm">
          <Group gap="xs">
            <Badge
              size="xs"
              variant="light"
              color={event.success ? "teal" : "red"}
            >
              {event.success ? "Success" : "Failed"}
            </Badge>
          </Group>

          <Divider label="What happened" labelPosition="left" />
          <Field
            label="Time"
            value={new Date(event.created_at).toLocaleString()}
          />
          <Field label="Action" value={event.action} />
          <Field label="App" value={event.app_label} />
          <Field
            label="Entity"
            value={
              event.entity_type
                ? `${event.entity_type}${event.entity_id ? ` · ${event.entity_id}` : ""}`
                : null
            }
          />
          <Field label="Reason" value={event.reason} />
          <Field label="Source" value={event.source} />

          <Divider label="Who" labelPosition="left" />
          <Field
            label="Actor"
            value={event.actor_label || `(${event.actor_type})`}
          />
          <Field label="Authority" value={event.actor_type} />
          <Field label="IP address" value={event.ip_address} />

          {changeEntries.length > 0 ? (
            <>
              <Divider label="Changes" labelPosition="left" />
              <Table striped withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Field</Table.Th>
                    <Table.Th>Before</Table.Th>
                    <Table.Th>After</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {changeEntries.map(([field, change]) => (
                    <Table.Tr key={field}>
                      <Table.Td>
                        <Text size="xs" fw={500}>
                          {field}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" c="dimmed">
                          {renderJson(change.old)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs">{renderJson(change.new)}</Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </>
          ) : null}

          {metadataEntries.length > 0 ? (
            <>
              <Divider
                label={event.actor_type === "ai" ? "AI provenance" : "Metadata"}
                labelPosition="left"
              />
              {metadataEntries.map(([key, value]) => (
                <Field key={key} label={key} value={renderJson(value)} />
              ))}
            </>
          ) : null}
        </Stack>
      ) : null}
    </Drawer>
  );
}
