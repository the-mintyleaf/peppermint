"use client";

import Link from "next/link";
import { Button, Text, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { FilesIcon } from "@phosphor-icons/react/dist/csr/Files";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import type { DocumentWorkspaceSummary } from "@/modules/documents";
import { workspaceEditorHref } from "../../documents.queries";

export function getWorkspacesColumns(): DataTableShellColumn<DocumentWorkspaceSummary>[] {
  return [
    {
      accessor: "applicantName",
      title: "Applicant",
      icon: UserIcon,
      render: (row) => (
        <Text size="xs" fw={500}>
          {row.applicantName}
        </Text>
      ),
    },
    {
      accessor: "documentCount",
      title: "Documents",
      icon: FilesIcon,
      render: (row) => <Text size="xs">{row.documentCount}</Text>,
    },
    {
      accessor: "lastUpdated",
      title: "Last updated",
      icon: ClockIcon,
      render: (row) => {
        const d = row.lastUpdated ? dayjs(row.lastUpdated) : null;
        return d && d.isValid() ? (
          <Text size="xs">{d.format("MMM D, YYYY")}</Text>
        ) : (
          <Text size="xs" c="dimmed">
            —
          </Text>
        );
      },
    },
    {
      accessor: "actions",
      title: "",
      textAlign: "right",
      render: (row) => (
        <Button
          component={Link}
          href={workspaceEditorHref(row.applicantId)}
          size="compact-xs"
          variant="light"
          rightSection={<ArrowRightIcon size={12} aria-hidden />}
          aria-label={`Open ${row.applicantName}'s document workspace`}
        >
          Open
        </Button>
      ),
    },
  ];
}
