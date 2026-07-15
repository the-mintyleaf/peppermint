"use client";

import { Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";

import type { Training } from "../../_shared";

export const trainingColumns: DataTableShellColumn<Training>[] = [
  {
    accessor: "course_or_training",
    title: "Course",
    render: (t) => (
      <Text size="xs" fw={500}>
        {t.course_or_training || "—"}
      </Text>
    ),
  },
  {
    accessor: "institution",
    title: "Institution",
    render: (t) => <Text size="xs">{t.institution || "—"}</Text>,
  },
  {
    accessor: "credential",
    title: "Credential",
    render: (t) => <Text size="xs">{t.credential || "—"}</Text>,
  },
];
