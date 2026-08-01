"use client";

import Link from "next/link";
import { Anchor, Badge, Group, Stack, Text } from "@peppermint/ui";
import {
  ITEM_STATUS_COLORS,
  ITEM_STATUS_LABELS,
} from "@/modules/admin/checklists/checklists.labels";
import { formatDate } from "../dashboard.utils";
import type { ChecklistItemRowViewProps } from "./ChecklistItemRowView.types";

/**
 * One checklist-item preview row — applicant, which item on which checklist, its
 * status badge and its due date. Shared by the Today tab's worklists and the
 * Overview's two checklist lists so the same row can't drift into two shapes.
 *
 * `due_at` is rendered through `formatDate` with the row's own `due_at_bs`; the
 * BS date is never recomputed in the browser, and overdue-ness is the server's
 * classification (which queue the row arrived in), not a client comparison.
 */
export function ChecklistItemRowView({ row }: ChecklistItemRowViewProps) {
  return (
    <Anchor
      component={Link}
      href={`/admin/checklists/${row.checklist_id}`}
      underline="never"
      c="inherit"
    >
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Stack gap={0}>
          <Text size="sm">{row.applicant_name}</Text>
          <Text size="xs" c="dimmed">
            {row.checklist_title} — {row.label}
          </Text>
        </Stack>
        <Stack gap={2} align="flex-end">
          <Badge size="sm" color={ITEM_STATUS_COLORS[row.status]}>
            {ITEM_STATUS_LABELS[row.status]}
          </Badge>
          <Text size="xs" c="dimmed">
            {formatDate(row.due_at, row.due_at_bs)}
          </Text>
        </Stack>
      </Group>
    </Anchor>
  );
}
