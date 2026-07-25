"use client";

import Link from "next/link";
import { dateColumn, statusColumn } from "@peppermint/admin";
import type { DataTableShellColumn } from "@peppermint/admin";
import { Progress, Stack, Text } from "@peppermint/ui";
import { ListChecksIcon } from "@phosphor-icons/react/dist/csr/ListChecks";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { GlobeIcon } from "@phosphor-icons/react/dist/csr/Globe";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { ChartBarIcon } from "@phosphor-icons/react/dist/csr/ChartBar";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import {
  CHECKLIST_STATUS_COLORS,
  CHECKLIST_STATUS_LABELS,
  CHECKLIST_STATUS_OPTIONS,
} from "../../checklists.labels";
import type { Checklist, ChecklistStatus } from "../../checklists.types";
import { ChecklistRowActionsMenu } from "./components/ChecklistRowActionsMenu";

interface ChecklistWorklistColumnsOptions {
  onViewDetails: (checklist: Checklist) => void;
}

/**
 * `progress` renders as a resolved/total bar — the same figure a detail page
 * shows in full, condensed for scanning a worklist. `resolved` counts
 * `completed`/`waived`/`not_applicable`; `blocked` is deliberately excluded
 * (§5), so a checklist with blocked items never reads 100% here.
 */
export function getChecklistWorklistColumns({
  onViewDetails,
}: ChecklistWorklistColumnsOptions): DataTableShellColumn<Checklist>[] {
  return [
    {
      accessor: "title",
      title: "Checklist",
      icon: ListChecksIcon,
      render: (row) => (
        <Text
          size="xs"
          fw={500}
          component={Link}
          href={`/admin/checklists/${row.id}`}
        >
          {row.title}
        </Text>
      ),
    },
    {
      accessor: "applicant",
      title: "Applicant",
      icon: UserIcon,
      render: (row) => (
        <Text
          size="xs"
          component={Link}
          href={`/admin/applicants/${row.applicant.id}`}
        >
          {row.applicant.full_name}
        </Text>
      ),
    },
    {
      accessor: "country",
      title: "Country",
      icon: GlobeIcon,
      render: (row) => (
        <Text size="xs" c={row.country ? undefined : "dimmed"}>
          {row.country ? row.country.name : "—"}
        </Text>
      ),
    },
    statusColumn<Checklist, ChecklistStatus>("status", {
      title: "Status",
      icon: PulseIcon,
      colorMap: CHECKLIST_STATUS_COLORS,
      labelMap: CHECKLIST_STATUS_LABELS,
      filter: { type: "select", options: CHECKLIST_STATUS_OPTIONS },
    }),
    {
      accessor: "progress",
      title: "Progress",
      icon: ChartBarIcon,
      width: 140,
      render: (row) => {
        const { resolved, total } = row.progress;
        const pct = total > 0 ? Math.round((resolved / total) * 100) : 0;
        return (
          <Stack gap={2} miw={100}>
            <Progress
              value={pct}
              size="sm"
              color={pct === 100 ? "green" : "blue"}
            />
            <Text size="xs" c="dimmed">
              {resolved}/{total} resolved
            </Text>
          </Stack>
        );
      },
    },
    // No column filter here — `GET /` supports `overdue` (boolean), not a
    // `due_at` comparison (§3); the Overdue tab on the worklist covers it
    // server-side instead of an unsupported date filter param.
    dateColumn<Checklist>("due_at", {
      title: "Due",
      icon: CalendarBlankIcon,
    }),
    {
      accessor: "actions",
      title: "",
      textAlign: "right",
      render: (row) => (
        <ChecklistRowActionsMenu
          checklist={row}
          onViewDetails={onViewDetails}
        />
      ),
    },
  ];
}
