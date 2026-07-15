"use client";

import { Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";

import type { AcademicGrading } from "../../_shared";

export const academicGradingColumns: DataTableShellColumn<AcademicGrading>[] = [
  {
    accessor: "context",
    title: "Context",
    render: (g) => (
      <Text size="xs" fw={500}>
        {g.context || "—"}
      </Text>
    ),
  },
  {
    accessor: "month_or_period",
    title: "Period",
    render: (g) => <Text size="xs">{g.month_or_period || "—"}</Text>,
  },
  {
    accessor: "attendance_percentage",
    title: "Attendance",
    render: (g) => (
      <Text size="xs">
        {g.attendance_percentage ? `${g.attendance_percentage}%` : "—"}
      </Text>
    ),
  },
];
