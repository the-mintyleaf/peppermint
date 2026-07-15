"use client";

import { Stack, Text } from "@peppermint/ui";
import { StatusBadge } from "@peppermint/admin";
import type { DataTableShellColumn } from "@peppermint/admin";

import { COMPLETION_STATUS_LABELS } from "../../_shared";
import type { CompletionStatus, Education } from "../../_shared";

const COMPLETION_STATUS_COLORS: Partial<Record<CompletionStatus, string>> = {
  completed: "teal",
  ongoing: "blue",
  incomplete: "gray",
};

export const educationColumns: DataTableShellColumn<Education>[] = [
  {
    accessor: "institution",
    title: "Institution",
    render: (e) => (
      <Stack gap={0}>
        <Text size="xs" fw={500}>
          {e.institution || "—"}
        </Text>
        <Text size="xs" c="dimmed">
          {e.degree || "—"}
        </Text>
      </Stack>
    ),
  },
  {
    accessor: "field_of_study",
    title: "Field / program",
    render: (e) => (
      <Stack gap={0}>
        <Text size="xs">{e.field_of_study || "—"}</Text>
        <Text size="xs" c="dimmed">
          {e.program || "—"}
        </Text>
      </Stack>
    ),
  },
  {
    accessor: "completion_status",
    title: "Completion status",
    render: (e) =>
      e.completion_status ? (
        <StatusBadge
          value={e.completion_status}
          colorMap={COMPLETION_STATUS_COLORS}
          labelMap={COMPLETION_STATUS_LABELS}
        />
      ) : (
        <Text size="xs" c="dimmed">
          —
        </Text>
      ),
  },
  {
    accessor: "country",
    title: "Country",
    render: (e) => <Text size="xs">{e.country || "—"}</Text>,
  },
];
