"use client";

import { Stack, Text, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { StatusBadge } from "@peppermint/admin";
import { STAGE_COLORS, STAGE_LABELS } from "../../leadCategory.utils";
import type { LeadBoardRow, LeadSource } from "../../leadManagement.types";

interface LeadManagementColumnsOptions {
  sources: LeadSource[];
}

export function getLeadManagementColumns({
  sources,
}: LeadManagementColumnsOptions): DataTableShellColumn<LeadBoardRow>[] {
  return [
    {
      accessor: "full_name_en",
      title: "Lead",
      render: (lead: LeadBoardRow) => (
        <Stack gap={0}>
          <Text size="xs" fw={500}>
            {lead.full_name_en || lead.full_name_np || lead.full_name_romanized}
          </Text>
          {lead.email ? (
            <Text size="xs" c="dimmed">
              {lead.email}
            </Text>
          ) : null}
        </Stack>
      ),
    },
    {
      accessor: "stage",
      title: "Stage",
      filter: {
        type: "select",
        options: Object.entries(STAGE_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
      },
      render: (lead: LeadBoardRow) => (
        <StatusBadge
          value={lead.stage}
          colorMap={STAGE_COLORS}
          labelMap={STAGE_LABELS}
        />
      ),
    },
    {
      accessor: "source.id",
      title: "Source",
      filter: {
        type: "select",
        options: sources.map((source) => ({
          value: source.id,
          label: source.name_en || source.name_np,
        })),
      },
      render: (lead: LeadBoardRow) => (
        <Text size="xs">{lead.source.name_en || lead.source.name_np}</Text>
      ),
    },
    {
      accessor: "contact_numbers",
      title: "Contact",
      render: (lead: LeadBoardRow) => {
        const primary =
          lead.contact_numbers.find((c) => c.is_primary) ??
          lead.contact_numbers[0];
        return (
          <Text size="xs" c={primary ? undefined : "dimmed"}>
            {primary?.number ?? "—"}
          </Text>
        );
      },
    },
    {
      accessor: "last_followed_up_at",
      title: "Last followed up",
      render: (lead: LeadBoardRow) => {
        const d = lead.last_followed_up_at
          ? dayjs(lead.last_followed_up_at)
          : null;
        return d && d.isValid() ? (
          <Text size="xs">{d.format("MMM D, YYYY h:mm A")}</Text>
        ) : (
          <Text size="xs" c="dimmed">
            Never contacted
          </Text>
        );
      },
    },
    {
      accessor: "created_at",
      title: "Created",
      defaultVisible: false,
      render: (lead: LeadBoardRow) => (
        <Text size="xs">{dayjs(lead.created_at).format("MMM D, YYYY")}</Text>
      ),
    },
  ];
}
