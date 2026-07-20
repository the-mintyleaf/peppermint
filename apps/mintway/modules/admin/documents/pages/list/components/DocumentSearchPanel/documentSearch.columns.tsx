"use client";

import { Badge, Button, Stack, Text, Tooltip, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { getDocumentTypeConfig, STATUS_META } from "@/modules/documents";
import type { Document } from "@/modules/documents";
import type { DocumentSearchColumnsOptions } from "./DocumentSearchPanel.types";

function typeLabel(type: Document["type"]): string {
  return getDocumentTypeConfig(type)?.label ?? type;
}

/**
 * The search table answers "which document is this, whose is it, where is it in the
 * lifecycle, and how recent is it" — identity, applicant, status and date are the four
 * decision columns, in that order. Status is a badge (a fact); opening the editor is a
 * button in a separate trailing column (a lever), so state never reads as an action.
 */
export function getDocumentSearchColumns({
  applicantIndex,
  onOpenEditor,
}: DocumentSearchColumnsOptions): DataTableShellColumn<Document>[] {
  return [
    {
      accessor: "label",
      title: "Document",
      sortable: true,
      width: "30%",
      render: (record) => (
        <Stack gap={0}>
          <Text size="xs" fw={500}>
            {record.label || "Untitled document"}
          </Text>
          <Text size="xs" c="dimmed">
            {typeLabel(record.type)} · v{record.currentRevisionNumber}
          </Text>
        </Stack>
      ),
    },
    {
      accessor: "applicantId",
      title: "Applicant",
      sortable: false,
      width: "24%",
      render: (record) => {
        if (!record.applicantId) return "—";
        const known = applicantIndex.get(record.applicantId);
        if (!known) {
          // The name index is best-effort (see DocumentSearchPanel) — a document whose
          // applicant isn't in it still has to be identifiable, so fall back to the id.
          return (
            <Text size="xs" c="dimmed">
              {record.applicantId.slice(0, 8)}…
            </Text>
          );
        }
        return (
          <Stack gap={0}>
            <Text size="xs">{known.name || "Unnamed applicant"}</Text>
            {known.code && (
              <Text size="xs" c="dimmed">
                {known.code}
              </Text>
            )}
          </Stack>
        );
      },
    },
    {
      accessor: "status",
      title: "Status",
      sortable: true,
      width: "14%",
      render: (record) => {
        const meta = STATUS_META[record.status];
        return (
          <Badge size="sm" variant="light" color={meta?.color ?? "gray"}>
            {meta?.label ?? record.status}
          </Badge>
        );
      },
    },
    {
      accessor: "updatedAt",
      title: "Updated",
      sortable: true,
      width: "16%",
      render: (record) => (
        <Tooltip
          label={`Updated ${dayjs(record.updatedAt).format("MMM D, YYYY h:mm A")} · created ${dayjs(
            record.createdAt,
          ).format("MMM D, YYYY")}`}
          withArrow
        >
          {/* Absolute, not relative: `dayjs.extend(relativeTime)` is never called in this
              app, so `.fromNow()` is not guaranteed to be available at runtime. */}
          <Text size="xs">{dayjs(record.updatedAt).format("MMM D, YYYY")}</Text>
        </Tooltip>
      ),
    },
    {
      accessor: "actions",
      title: "Editor",
      sortable: false,
      width: "16%",
      render: (record) => (
        <Button
          size="xs"
          variant="subtle"
          disabled={!record.applicantId}
          rightSection={<ArrowUpRightIcon size={14} aria-hidden />}
          onClick={() => record.applicantId && onOpenEditor(record.applicantId)}
          aria-label={`Open editor for ${record.label || "untitled document"}`}
        >
          Open Editor
        </Button>
      ),
    },
  ];
}
