"use client";

import { Badge, Group, Stack, Text, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";

import { LEAD_SOURCE_LABELS } from "../_shared";
import type { Lead } from "./leads.types";

function fmtDate(value?: string | null): string {
  if (!value) return "—";
  const d = dayjs(value);
  return d.isValid() ? d.format("MMM D, YYYY") : "—";
}

/**
 * Columns are the decision set for "who do I call back, and which of these is
 * ready to convert" — identity, how to reach them, where they came from, whether
 * they've already been converted, and how stale the enquiry is. Everything else
 * (guardian, passport, education level, payment preference, notes) lives in the
 * form and the read-only view; it doesn't drive the scan.
 */
export const leadColumns: DataTableShellColumn<Lead>[] = [
  {
    accessor: "lead_code",
    title: "Code",
    sortable: true,
    render: (l) => (
      <Text size="xs" fw={500} ff="monospace">
        {l.lead_code}
      </Text>
    ),
  },
  {
    accessor: "full_name",
    title: "Name",
    sortable: true,
    render: (l) => (
      <Stack gap={0}>
        <Text size="xs" fw={500}>
          {l.full_name || l.first_name}
        </Text>
        {l.name_native && (
          <Text size="xs" c="dimmed">
            {l.name_native}
          </Text>
        )}
      </Stack>
    ),
  },
  {
    accessor: "contact_number",
    title: "Contact",
    render: (l) => {
      if (!l.contact_number && !l.email) {
        return (
          <Text size="xs" c="dimmed">
            No contact captured
          </Text>
        );
      }
      return (
        <Stack gap={0}>
          {l.contact_number && <Text size="xs">{l.contact_number}</Text>}
          {l.email && (
            <Text size="xs" c="dimmed">
              {l.email}
            </Text>
          )}
        </Stack>
      );
    },
  },
  {
    accessor: "lead_source",
    title: "Source",
    render: (l) =>
      l.lead_source ? (
        <Text size="xs">{LEAD_SOURCE_LABELS[l.lead_source]}</Text>
      ) : (
        <Text size="xs" c="dimmed">
          —
        </Text>
      ),
  },
  {
    accessor: "is_converted",
    title: "Status",
    render: (l) => (
      // Word + colour, and the converted row carries the applicant code so the
      // operator can see *what* it became without opening anything.
      <Group gap={6} wrap="nowrap">
        <Badge
          size="xs"
          variant="light"
          color={l.is_converted ? "teal" : "blue"}
        >
          {l.is_converted ? "Converted" : "Open"}
        </Badge>
        {l.is_converted && l.converted_applicant_code && (
          <Text size="xs" c="dimmed" ff="monospace">
            {l.converted_applicant_code}
          </Text>
        )}
      </Group>
    ),
  },
  {
    accessor: "created_at",
    title: "Enquired",
    sortable: true,
    render: (l) => <Text size="xs">{fmtDate(l.created_at)}</Text>,
  },
];
