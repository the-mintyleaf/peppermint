"use client";

import { Badge } from "@zetsel/ui";
import type { DataTableShellColumn } from "@zetsel/admin";
import type { Student } from "../../students.types";

const statusColorMap: Record<string, string> = {
  active: "green",
  "on-leave": "yellow",
  graduated: "blue",
  dropped: "red",
};

const statusLabelMap: Record<string, string> = {
  active: "Active",
  "on-leave": "On Leave",
  graduated: "Graduated",
  dropped: "Dropped",
};

export const studentsColumns: DataTableShellColumn<Student>[] = [
  {
    accessor: "fullName",
    title: "Full Name",
    sortable: true,
    width: "20%",
  },
  {
    accessor: "email",
    title: "Email",
    sortable: true,
    width: "20%",
  },
  {
    accessor: "phone",
    title: "Phone",
    sortable: false,
    width: "15%",
  },
  {
    accessor: "program",
    title: "Program",
    sortable: true,
    width: "18%",
  },
  {
    accessor: "nationality",
    title: "Nationality",
    sortable: true,
    width: "12%",
  },
  {
    accessor: "enrolledAt",
    title: "Enrolled At",
    sortable: true,
    width: "12%",
    render: (record) => new Date(record.enrolledAt).toLocaleDateString(),
  },
  {
    accessor: "status",
    title: "Status",
    sortable: true,
    width: "15%",
    render: (record) => (
      <Badge color={statusColorMap[record.status]} variant="light">
        {statusLabelMap[record.status]}
      </Badge>
    ),
  },
];
