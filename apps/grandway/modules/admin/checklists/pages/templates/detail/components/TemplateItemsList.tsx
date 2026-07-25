"use client";

import { useState } from "react";
import { ActionIcon, Badge, Group, Paper, Stack, Text } from "@peppermint/ui";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { useUpdateTemplateItem } from "../../../../checklists.hooks";
import { ITEM_TYPE_LABELS } from "../../../../checklists.labels";
import type {
  ChecklistTemplate,
  ChecklistTemplateItem,
} from "../../../../checklists.types";
import { EditTemplateItemModal } from "./EditTemplateItemModal";

interface TemplateItemsListProps {
  template: ChecklistTemplate;
}

/**
 * Shows every requirement, INCLUDING retired ones (`is_active: false`) — the
 * contract requires these stay visible, greyed, never hidden (§7). Server
 * order already sorts active-first (§4), so this renders as-given. Retire /
 * restore is a quick row toggle (`is_active`), not a full modal — there is no
 * delete for template items, only this reversible flag.
 */
export function TemplateItemsList({ template }: TemplateItemsListProps) {
  const [editFor, setEditFor] = useState<ChecklistTemplateItem | null>(null);
  const updateItem = useUpdateTemplateItem(template.id);

  if (template.items.length === 0) {
    return (
      <Text size="xs" c="dimmed">
        No requirements defined yet.
      </Text>
    );
  }

  return (
    <Stack gap="xs">
      {template.items.map((item) => (
        <Paper
          key={item.id}
          withBorder
          p="sm"
          radius="sm"
          opacity={item.is_active ? 1 : 0.55}
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
                {!item.is_active ? (
                  <Badge size="xs" variant="outline" color="gray">
                    Retired
                  </Badge>
                ) : null}
              </Group>
              {item.description ? (
                <Text size="xs" c="dimmed">
                  {item.description}
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
              <ActionIcon
                variant="subtle"
                color={item.is_active ? "red" : "teal"}
                aria-label={
                  item.is_active
                    ? `Retire ${item.label}`
                    : `Restore ${item.label}`
                }
                disabled={updateItem.isPending}
                onClick={() =>
                  updateItem.mutate({
                    itemId: item.id,
                    body: { is_active: !item.is_active },
                  })
                }
              >
                {item.is_active ? (
                  <ProhibitIcon size={16} aria-hidden />
                ) : (
                  <ArrowCounterClockwiseIcon size={16} aria-hidden />
                )}
              </ActionIcon>
            </Group>
          </Group>
        </Paper>
      ))}

      {editFor ? (
        <EditTemplateItemModal
          templateId={template.id}
          item={editFor}
          opened={editFor !== null}
          onClose={() => setEditFor(null)}
        />
      ) : null}
    </Stack>
  );
}
