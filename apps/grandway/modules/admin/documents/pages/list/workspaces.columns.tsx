"use client";

import Link from "next/link";
import { Button, Text, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { FilesIcon } from "@phosphor-icons/react/dist/csr/Files";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
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
      // Live documents only (draft + ready). A row can read 0 — every document
      // removed — and still opens: the editor's Archived group restores them.
      render: (row) => (
        <Text size="xs" c={row.documentCount === 0 ? "dimmed" : undefined}>
          {row.documentCount === 0 ? "None live" : row.documentCount}
        </Text>
      ),
    },
    {
      accessor: "archivedCount",
      title: "Archived",
      icon: ArchiveIcon,
      render: (row) =>
        row.archivedCount > 0 ? (
          <Text size="xs">{row.archivedCount}</Text>
        ) : (
          <Text size="xs" c="dimmed">
            —
          </Text>
        ),
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
          aria-label={
            row.documentCount === 0
              ? `Open ${row.applicantName}'s document workspace to restore archived documents`
              : `Open ${row.applicantName}'s document workspace`
          }
        >
          Open
        </Button>
      ),
    },
  ];
}
