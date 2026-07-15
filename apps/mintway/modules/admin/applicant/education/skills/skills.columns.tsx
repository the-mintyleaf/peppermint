"use client";

import { Badge, Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";

import { PROFICIENCY_LABELS } from "../../_shared";
import type { Skill } from "../../_shared";

export const skillColumns: DataTableShellColumn<Skill>[] = [
  {
    accessor: "name",
    title: "Name",
    render: (s) => (
      <Text size="xs" fw={500}>
        {s.name || "—"}
      </Text>
    ),
  },
  {
    accessor: "proficiency",
    title: "Proficiency",
    render: (s) =>
      s.proficiency ? (
        <Badge variant="light" color="blue">
          {PROFICIENCY_LABELS[s.proficiency] ?? s.proficiency}
        </Badge>
      ) : (
        <Text size="xs" c="dimmed">
          —
        </Text>
      ),
  },
];
