"use client";

import { Badge, Stack, Text, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";

import type { WorkExperience } from "../../_shared";

/**
 * The contract keeps both a free-text period and a real date, and applicants
 * often give only the former — so show the period when there is one and fall
 * back to the date rather than leaving the cell empty.
 */
function fmtDate(value?: string | null): string {
  if (!value) return "";
  const d = dayjs(value);
  return d.isValid() ? d.format("MMM D, YYYY") : value;
}

function periodLabel(w: WorkExperience): string {
  const start = w.start_period || fmtDate(w.start_date);
  const end = w.is_current ? "Present" : w.end_period || fmtDate(w.end_date);
  if (!start && !end) return "—";
  return [start || "?", end || "?"].join(" – ");
}

/**
 * The BS siblings on `start_date`/`end_date` are not shown here: this cell is a
 * range that prefers the free-text period and collapses to "Present" for a
 * current role, so a single-date BS component can't express it. A BS-aware range
 * cell is a design question, not a swap — the dates at least format consistently
 * with every sibling table now.
 */

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
