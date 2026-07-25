"use client";

import Link from "next/link";
import { Badge, Button, Group, Text, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { StatusBadge } from "@peppermint/admin";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { StackIcon } from "@phosphor-icons/react/dist/csr/Stack";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import type { DocumentListItem, DocumentStatus } from "@/modules/documents";
import { documentEditorHref } from "../../documents.queries";
import {
  FAMILY_COLORS,
  FAMILY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "../../documents.labels";

export function getDocumentsColumns(): DataTableShellColumn<DocumentListItem>[] {
  return [
    {
      accessor: "label",
      title: "Document",
      icon: FileTextIcon,
      render: (row) => (
        <Text size="xs" fw={500}>
          {row.label}
        </Text>
      ),
    },
    {
      accessor: "family",
      title: "Type",
      icon: StackIcon,
      render: (row) => (
        <Badge size="xs" variant="light" color={FAMILY_COLORS[row.family]}>
          {FAMILY_LABELS[row.family]}
        </Badge>
      ),
    },
    {
      accessor: "applicantName",
      title: "Owner",
      icon: UserIcon,
      render: (row) =>
        row.isStandalone ? (
          <Text size="xs" c="dimmed">
            Standalone
          </Text>
        ) : (
          <Text size="xs">{row.applicantName ?? "—"}</Text>
        ),
    },
    {
      accessor: "status",
      title: "Status",
      icon: PulseIcon,
      render: (row) => (
        <StatusBadge<DocumentStatus>
          value={row.status}
          colorMap={STATUS_COLORS}
          labelMap={STATUS_LABELS}
        />
      ),
    },
    {
      accessor: "updatedAt",
      title: "Updated",
      icon: ClockIcon,
      render: (row) => {
        const d = row.updatedAt ? dayjs(row.updatedAt) : null;
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
        <Group justify="flex-end">
          <Button
            component={Link}
            href={documentEditorHref(row)}
            size="compact-xs"
            variant="light"
            rightSection={<ArrowRightIcon size={12} aria-hidden />}
            aria-label={`Open ${row.label}`}
          >
            Open
          </Button>
        </Group>
      ),
    },
  ];
}
