"use client";

import { Badge, Group, Text, Tooltip, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import type { DocumentWorkspaceSummary } from "@/modules/documents";

/** Compact "how long ago" — days+hours past a day, else hours+minutes. */
function timeAgo(value: string): string {
  const then = dayjs(value);
  const totalMinutes = dayjs().diff(then, "minute");
  if (totalMinutes < 1) return "just now";
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes && days === 0) parts.push(`${minutes}m`);
  return `${parts.join(" ")} ago`;
}

export const documentsColumns: DataTableShellColumn<DocumentWorkspaceSummary>[] =
  [
    {
      accessor: "applicantName",
      title: "Applicant",
      sortable: true,
      width: "24%",
      render: (record) => record.applicantName || "—",
    },
    {
      accessor: "status",
      title: "By status",
      sortable: false,
      width: "26%",
      render: (record) => (
        <Group gap={4} wrap="nowrap">
          <Badge size="sm" variant="light" color="gray">
            {record.draftCount} draft
          </Badge>
          <Badge size="sm" variant="light" color="blue">
            {record.finalizedCount} final
          </Badge>
          <Badge size="sm" variant="light" color="green">
            {record.submittedCount} sent
          </Badge>
        </Group>
      ),
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
      accessor: "lastUpdated",
      title: "Last Updated",
      sortable: true,
      width: "16%",
      render: (record) =>
        record.lastUpdated ? (
          <Tooltip
            label={dayjs(record.lastUpdated).format("MMM D, YYYY h:mm A")}
            withArrow
          >
            <Text size="xs">{timeAgo(record.lastUpdated)}</Text>
          </Tooltip>
        ) : (
          "—"
        ),
    },
  ];
