"use client";

import { Badge, Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";

import { PROFICIENCY_LABELS } from "../../_shared";
import type { LanguageEntry } from "../../_shared";

export const languageColumns: DataTableShellColumn<LanguageEntry>[] = [
  {
    accessor: "language",
    title: "Language",
    render: (l) => (
      <Text size="xs" fw={500}>
        {l.language || "—"}
      </Text>
    ),
  },
  {
    accessor: "proficiency",
    title: "Proficiency",
    render: (l) =>
      l.proficiency ? (
        <Badge variant="light" color="blue">
          {PROFICIENCY_LABELS[l.proficiency] ?? l.proficiency}
        </Badge>
      ) : (
        <Text size="xs" c="dimmed">
          —
        </Text>
      ),
  },
  {
    accessor: "is_native",
    title: "Native",
    render: (l) =>
      l.is_native ? (
        <Badge variant="light" color="teal">
          Native
        </Badge>
      ) : (
        <Text size="xs" c="dimmed">
          —
        </Text>
      ),
  },
];
