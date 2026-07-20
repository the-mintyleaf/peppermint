"use client";

import { Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";

import {
  INTERACTION_DIRECTION_LABELS,
  INTERACTION_TYPE_LABELS,
  bsDateColumn,
} from "../../_shared";
import type { Interaction } from "../../_shared";

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
  bsDateColumn<Interaction>("occurred_at", "Occurred", { withTime: true }),
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
