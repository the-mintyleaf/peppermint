"use client";

import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
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
import type { ChecklistDetail, ChecklistItem } from "../../../checklists.types";
import { EditChecklistItemModal } from "./EditChecklistItemModal";
import { ItemStatusModal } from "./ItemStatusModal";

interface ChecklistItemsListProps {
  checklist: ChecklistDetail;
  /** Item ids named in a `CHECKLISTS_REQUIRED_ITEMS_PENDING` 409 — highlighted, not hidden. */
  outstandingIds?: Set<string>;
}

/** Blocked first (needs attention), then pending, then the three resolved statuses. */
const STATUS_ORDER: ChecklistItem["status"][] = [
  "blocked",
  "pending",
  "completed",
  "waived",
  "not_applicable",
];

export function ChecklistItemsList({
  checklist,
  outstandingIds,
}: ChecklistItemsListProps) {
  const [statusFor, setStatusFor] = useState<ChecklistItem | null>(null);
  const [editFor, setEditFor] = useState<ChecklistItem | null>(null);

  const items = [...checklist.items].sort(
    (a, b) =>
      STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
      a.display_order - b.display_order,
  );

  if (items.length === 0) {
    return (
      <Text size="xs" c="dimmed">
        No items on this checklist yet.
      </Text>
    );
  }

  return (
    <Stack gap="xs">
      {items.map((item) => {
        const isOutstanding = outstandingIds?.has(item.id) ?? false;
        return (
          <Paper
            key={item.id}
            withBorder
            p="sm"
            radius="sm"
            style={
              isOutstanding
                ? { borderColor: "var(--mantine-color-red-5)" }
                : undefined
            }
          >
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Stack gap={4} style={{ flex: 1 }}>
                <Group gap="xs">
                  <Text size="xs" fw={500}>
                    {item.label}
                  </Text>
                  <Badge size="xs" variant="light">
                    {ITEM_TYPE_LABELS[item.item_type]}
                  </Badge>
                  {item.is_required ? (
                    <Badge size="xs" variant="outline" color="orange">
                      Required
                    </Badge>
                  ) : null}
                  <Badge
                    size="xs"
                    variant="light"
                    color={ITEM_STATUS_COLORS[item.status]}
                  >
                    {ITEM_STATUS_LABELS[item.status]}
                  </Badge>
                  {isOutstanding ? (
                    <Badge size="xs" variant="filled" color="red">
                      Outstanding
                    </Badge>
                  ) : null}
                </Group>
                {item.description ? (
                  <Text size="xs" c="dimmed">
                    {item.description}
                  </Text>
                ) : null}
                {item.status_note ? (
                  <Text size="xs" c="dimmed">
                    Note: {item.status_note}
                  </Text>
                ) : null}
                {item.evidence_file ? (
                  <Text size="xs" c="dimmed">
                    Evidence attached
                  </Text>
                ) : null}
              </Stack>
              <Group gap="xs" wrap="nowrap">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  aria-label={`Edit ${item.label}`}
                  onClick={() => setEditFor(item)}
                >
                  <PencilSimpleIcon size={16} aria-hidden />
                </ActionIcon>
                <Button
                  size="xs"
                  variant="default"
                  onClick={() => setStatusFor(item)}
                >
                  Update status
                </Button>
              </Group>
            </Group>
          </Paper>
        );
      })}

      {statusFor ? (
        <ItemStatusModal
          checklistId={checklist.id}
          applicantId={checklist.applicant.id}
          item={statusFor}
          opened={statusFor !== null}
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
