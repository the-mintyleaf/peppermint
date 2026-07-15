"use client";

import { Text, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";

import {
  INTERACTION_DIRECTION_LABELS,
  INTERACTION_TYPE_LABELS,
} from "../../_shared";
import type { Interaction } from "../../_shared";

function fmtDateTime(value?: string | null) {
  if (!value) return "—";
  const d = dayjs(value);
  return d.isValid() ? d.format("MMM D, YYYY h:mm A") : "—";
}

export const interactionColumns: DataTableShellColumn<Interaction>[] = [
  {
    accessor: "interaction_type",
    title: "Type",
    render: (i) => (
      <Text size="xs" fw={500}>
        {INTERACTION_TYPE_LABELS[i.interaction_type] ?? i.interaction_type}
      </Text>
    ),
  },
  {
    accessor: "direction",
    title: "Direction",
    render: (i) => (
      <Text size="xs">
        {i.direction ? (INTERACTION_DIRECTION_LABELS[i.direction] ?? "—") : "—"}
      </Text>
    ),
  },
  {
    accessor: "occurred_at",
    title: "Occurred",
    render: (i) => <Text size="xs">{fmtDateTime(i.occurred_at)}</Text>,
  },
  {
    accessor: "summary",
    title: "Summary",
    render: (i) => (
      <Text size="xs" lineClamp={2}>
        {i.summary || "—"}
      </Text>
    ),
  },
];
