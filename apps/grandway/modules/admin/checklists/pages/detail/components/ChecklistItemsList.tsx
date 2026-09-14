"use client";

import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Paper,
  Stack,
  Text,
} from "@peppermint/ui";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import {
  ITEM_STATUS_COLORS,
  ITEM_STATUS_LABELS,
  ITEM_TYPE_LABELS,
} from "../../../checklists.labels";
import type {
  ChecklistDetail,
  ChecklistItem,
  ItemStatus,
} from "../../../checklists.types";
import { ChecklistItemStatusSwitch } from "./ChecklistItemStatusSwitch";
import { EditChecklistItemModal } from "./EditChecklistItemModal";
import { ItemStatusModal } from "./ItemStatusModal";

interface ChecklistItemsListProps {
  checklist: ChecklistDetail;
  /** Item ids named in a `CHECKLISTS_REQUIRED_ITEMS_PENDING` 409 — highlighted, not hidden. */
  outstandingIds?: Set<string>;
}

/** Outstanding work first — blocked, then pending — then the three resolved statuses. */
const STATUS_ORDER: ItemStatus[] = [
  "blocked",
  "pending",
  "completed",
  "waived",
  "not_applicable",
];

/** The status switch's column: one width for every row, so the labels line up. */
const SWITCH_WIDTH = 160;

/** `gap="sm"` in pixels — what the secondary lines indent past to clear the gutter. */
const GUTTER_GAP = 12;

interface StatusGroup {
  status: ItemStatus;
  items: ChecklistItem[];
}

/** Groups in `STATUS_ORDER`, each internally by `display_order`. Empty groups are dropped. */
function groupByStatus(items: ChecklistItem[]): StatusGroup[] {
  return STATUS_ORDER.map((status) => ({
    status,
    items: items
      .filter((item) => item.status === status)
      .sort((a, b) => a.display_order - b.display_order),
  })).filter((group) => group.items.length > 0);
}

/**
 * One item: its status switch in a fixed left gutter, the work itself beside
 * it, and the item's tags pushed to the right edge where they stack into a
 * column of their own down the list. Switch, label, tags and the edit control
 * share one centreline — a pill is taller than its label, and left-aligning
 * their tops makes every row look a few pixels out. Secondary lines (the
 * description, a status note, evidence) hang under the label, indented past
 * the gutter so the column edge holds.
 *
 * The switch *is* the item's status — there is no separate status badge, and
 * no "Update status" button, because the thing showing the state is the thing
 * that changes it.
 */
function ItemRow({
  checklist,
  item,
  isOutstanding,
  frozen,
  onOpenStatusModal,
  onEdit,
}: {
  checklist: ChecklistDetail;
  item: ChecklistItem;
  isOutstanding: boolean;
  frozen: boolean;
  onOpenStatusModal: (item: ChecklistItem, initialStatus: ItemStatus) => void;
  onEdit: (item: ChecklistItem) => void;
}) {
  const details = [
    item.description,
    item.status_note ? `Note: ${item.status_note}` : "",
    item.evidence_file ? "Evidence attached" : "",
  ].filter(Boolean);

  return (
    <Paper
      withBorder
      p="sm"
      radius="sm"
      style={
        isOutstanding
          ? { borderColor: "var(--mantine-color-red-5)" }
          : undefined
      }
    >
      <Stack gap={4}>
        <Group align="center" wrap="nowrap" gap="sm">
          <Box w={SWITCH_WIDTH} style={{ flexShrink: 0 }}>
            <ChecklistItemStatusSwitch
              checklistId={checklist.id}
              item={item}
              frozen={frozen}
              onOpenStatusModal={onOpenStatusModal}
            />
          </Box>

          <Text size="xs" fw={500} style={{ flex: 1, minWidth: 0 }}>
            {item.label}
          </Text>

          <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
            {isOutstanding ? (
              <Badge size="xs" variant="filled" color="red">
                Outstanding
              </Badge>
            ) : null}
            {item.is_required ? (
              <Badge size="xs" variant="outline" color="orange">
                Required
              </Badge>
            ) : null}
            <Badge size="xs" variant="light">
              {ITEM_TYPE_LABELS[item.item_type]}
            </Badge>
          </Group>

          <ActionIcon
            variant="subtle"
            color="gray"
            aria-label={`Edit ${item.label}`}
            onClick={() => onEdit(item)}
          >
            <PencilSimpleIcon size={16} aria-hidden />
          </ActionIcon>
        </Group>

        {details.length > 0 ? (
          <Stack gap={2} ml={SWITCH_WIDTH + GUTTER_GAP}>
            {details.map((line) => (
              <Text key={line} size="xs" c="dimmed">
                {line}
              </Text>
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}

/**
 * The checklist as a worklist: items banded under their status, outstanding
 * bands first, so "what is left" is read off the page instead of assembled
 * from a flat list. Only statuses actually in use get a band — a checklist
 * nobody has waived anything on never shows an empty "Waived" heading.
 */
export function ChecklistItemsList({
  checklist,
  outstandingIds,
}: ChecklistItemsListProps) {
  const [statusFor, setStatusFor] = useState<{
    item: ChecklistItem;
    initialStatus: ItemStatus;
  } | null>(null);
  const [editFor, setEditFor] = useState<ChecklistItem | null>(null);

  // Item status only moves while the checklist is open for work: the API 409s
  // an item change on a completed checklist (reopen first) and on an archived
  // one (`FLOWS.md` — "Work an applicant's list to completion", step 3).
  const frozen =
    checklist.status === "completed" || checklist.status === "archived";

  const groups = groupByStatus(checklist.items);

  if (groups.length === 0) {
    return (
      <Text size="xs" c="dimmed">
        No items on this checklist yet.
      </Text>
    );
  }

  return (
    <Stack gap="lg">
      {groups.map((group) => (
        <Stack key={group.status} gap="xs">
          <Group gap="xs">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">
              {ITEM_STATUS_LABELS[group.status]}
            </Text>
            <Badge
              size="xs"
              variant="light"
              color={ITEM_STATUS_COLORS[group.status]}
            >
              {group.items.length}
            </Badge>
          </Group>

          {group.items.map((item) => (
            <ItemRow
              key={item.id}
              checklist={checklist}
              item={item}
              isOutstanding={outstandingIds?.has(item.id) ?? false}
              frozen={frozen}
              onOpenStatusModal={(target, initialStatus) =>
                setStatusFor({ item: target, initialStatus })
              }
              onEdit={setEditFor}
            />
          ))}
        </Stack>
      ))}

      {statusFor ? (
        <ItemStatusModal
          checklistId={checklist.id}
          applicantId={checklist.applicant.id}
          item={statusFor.item}
          initialStatus={statusFor.initialStatus}
          opened
          onClose={() => setStatusFor(null)}
        />
      ) : null}
      {editFor ? (
        <EditChecklistItemModal
          checklistId={checklist.id}
          item={editFor}
          opened={editFor !== null}
          onClose={() => setEditFor(null)}
        />
      ) : null}
    </Stack>
  );
}
