"use client";

import { ActionIcon, Stack, Text, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { StatusBadge } from "@peppermint/admin";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";

import { CASE_STATUS_COLORS, CASE_STATUS_LABELS } from "../_shared";
import type { ApplicationCase, CaseStatus } from "../_shared";

function fmtDate(value?: string | null) {
  if (!value) return "—";
  const d = dayjs(value);
  return d.isValid() ? d.format("MMM D, YYYY") : "—";
}

export function getCaseColumns(
  onView: (row: ApplicationCase) => void,
): DataTableShellColumn<ApplicationCase>[] {
  return [
    {
      accessor: "case_code",
      title: "Case",
      render: (c) => (
        <Stack gap={0}>
          <Text size="xs" fw={500}>
            {c.case_code}
          </Text>
          <Text size="xs" c="dimmed">
            {c.destination_country || "—"}
          </Text>
        </Stack>
      ),
    },
    {
      accessor: "program",
      title: "Program",
      render: (c) => (
        <Stack gap={0}>
          <Text size="xs">{c.program || "—"}</Text>
          <Text size="xs" c="dimmed">
            {c.institution || ""}
          </Text>
        </Stack>
      ),
    },
    {
      accessor: "case_status",
      title: "Status",
      render: (c) => (
        <StatusBadge<CaseStatus>
          value={c.case_status}
          colorMap={CASE_STATUS_COLORS}
          labelMap={CASE_STATUS_LABELS}
        />
      ),
    },
    {
      accessor: "opened_at",
      title: "Opened",
      render: (c) => <Text size="xs">{fmtDate(c.opened_at)}</Text>,
    },
    {
      accessor: "actions",
      title: "",
      textAlign: "right",
      render: (c) => (
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label="Open case"
          onClick={() => onView(c)}
        >
          <ArrowRightIcon size={16} />
        </ActionIcon>
      ),
    },
  ];
}
