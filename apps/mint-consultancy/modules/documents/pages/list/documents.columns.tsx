"use client";

import type { DataTableShellColumn } from "@zetsel/admin";
import type { DocumentWorkspaceSummary } from "../../documents.types";

export const documentsColumns: DataTableShellColumn<DocumentWorkspaceSummary>[] = [
  {
    accessor: "studentName",
    title: "Student",
    sortable: true,
    width: "30%",
  },
  {
    accessor: "documentCount",
    title: "Documents",
    sortable: true,
    width: "15%",
  },
  {
    accessor: "lastUpdated",
    title: "Last Updated",
    sortable: true,
    width: "25%",
    render: (record) =>
      record.lastUpdated
        ? new Date(record.lastUpdated).toLocaleString()
        : "—",
  },
  {
    accessor: "studentId",
    title: "Student ID",
    sortable: false,
    width: "15%",
  },
];
