"use client";

import { Badge, Group } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import type { DocumentWorkspaceSummary } from "@/modules/documents";

export const documentsColumns: DataTableShellColumn<DocumentWorkspaceSummary>[] =
  [
    {
      accessor: "applicantName",
      title: "Applicant",
      sortable: true,
      width: "26%",
      render: (record) => record.applicantName || "—",
    },
    {
      accessor: "applicantCode",
      title: "Code",
      sortable: false,
      width: "14%",
      render: (record) => record.applicantCode || "—",
    },
    {
      accessor: "documentCount",
      title: "Documents",
      sortable: true,
      width: "10%",
    },
    {
      accessor: "status",
      title: "By status",
      sortable: false,
      width: "24%",
      render: (record) => (
        <Group gap={4} wrap="nowrap">
          <Badge size="xs" variant="light" color="gray">
            {record.draftCount} draft
          </Badge>
          <Badge size="xs" variant="light" color="blue">
            {record.finalizedCount} final
          </Badge>
          <Badge size="xs" variant="light" color="green">
            {record.submittedCount} sent
          </Badge>
        </Group>
      ),
    },
    {
      accessor: "lastUpdated",
      title: "Last Updated",
      sortable: true,
      width: "16%",
      render: (record) =>
        record.lastUpdated
          ? new Date(record.lastUpdated).toLocaleString()
          : "—",
    },
  ];
