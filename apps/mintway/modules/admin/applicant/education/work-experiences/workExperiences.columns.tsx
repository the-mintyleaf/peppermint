"use client";

import { Badge, Stack, Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";

import type { WorkExperience } from "../../_shared";

/**
 * The contract keeps both a free-text period and a real date, and applicants
 * often give only the former — so show the period when there is one and fall
 * back to the date rather than leaving the cell empty.
 */
function periodLabel(w: WorkExperience): string {
  const start =
    w.start_period || (w.start_date ? w.start_date.slice(0, 10) : "");
  const end = w.is_current
    ? "Present"
    : w.end_period || (w.end_date ? w.end_date.slice(0, 10) : "");
  if (!start && !end) return "—";
  return [start || "?", end || "?"].join(" – ");
}

export const workExperienceColumns: DataTableShellColumn<WorkExperience>[] = [
  {
    accessor: "company",
    title: "Company",
    render: (w) => (
      <Stack gap={0}>
        <Text size="xs" fw={500}>
          {w.company || "—"}
        </Text>
        {w.country && (
          <Text size="xs" c="dimmed">
            {w.country}
          </Text>
        )}
      </Stack>
    ),
  },
  {
    accessor: "role",
    title: "Role",
    render: (w) => <Text size="xs">{w.role || "—"}</Text>,
  },
  {
    accessor: "start_date",
    title: "Period",
    render: (w) => <Text size="xs">{periodLabel(w)}</Text>,
  },
  {
    accessor: "is_current",
    title: "Status",
    render: (w) =>
      w.is_current ? (
        <Badge size="xs" variant="light" color="teal">
          Current
        </Badge>
      ) : (
        <Text size="xs" c="dimmed">
          Past
        </Text>
      ),
  },
];
