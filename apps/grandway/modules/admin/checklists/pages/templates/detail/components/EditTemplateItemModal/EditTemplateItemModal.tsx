"use client";

import { useState } from "react";
import {
  Button,
  Checkbox,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import { useUpdateTemplateItem } from "../../../../../checklists.hooks";
import { ITEM_TYPE_OPTIONS } from "../../../../../checklists.labels";
import type {
  ItemType,
  UpdateTemplateItemPayload,
} from "../../../../../checklists.types";
import type { EditTemplateItemModalProps } from "./EditTemplateItemModal.types";

/**
 * Edits a requirement's wording (`PATCH /templates/<id>/items/<item_id>/`) —
 * descriptive fields only. Retiring/restoring (`is_active`) is a quick action
 * on `TemplateItemsList`'s own row, not here. Only changed fields are sent.
 */
export function EditTemplateItemModal({
  templateId,
  item,
  opened,
  onClose,
}: EditTemplateItemModalProps) {
  const [label, setLabel] = useState(item.label);
  const [description, setDescription] = useState(item.description);
  const [itemType, setItemType] = useState<ItemType>(item.item_type);
  const [isRequired, setIsRequired] = useState(item.is_required);
  const [displayOrder, setDisplayOrder] = useState<number | "">(
    item.display_order,
  );
  const [dueOffsetDays, setDueOffsetDays] = useState<number | "">(
    item.default_due_offset_days ?? "",
  );
  const mutation = useUpdateTemplateItem(templateId);

  const handleSubmit = () => {
    const body: UpdateTemplateItemPayload = {};
    if (label.trim() !== item.label) body.label = label.trim();
    if (description.trim() !== item.description)
      body.description = description.trim();
    if (itemType !== item.item_type) body.item_type = itemType;
    if (isRequired !== item.is_required) body.is_required = isRequired;
    if (displayOrder !== "" && displayOrder !== item.display_order)
      body.display_order = displayOrder;
    if (
      dueOffsetDays !== "" &&
      dueOffsetDays !== (item.default_due_offset_days ?? "")
    )
      body.default_due_offset_days = dueOffsetDays;

    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }

    mutation.mutate({ itemId: item.id, body }, { onSuccess: onClose });
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit requirement" centered>
      <Stack gap="md" p="md">
        <TextInput
          label="Label"
          required
          disabled={mutation.isPending}
          value={label}
          onChange={(event) => setLabel(event.currentTarget.value)}
        />
        <Group grow align="flex-start">
          <Select
            label="Type"
            data={ITEM_TYPE_OPTIONS}
            allowDeselect={false}
            disabled={mutation.isPending}
            value={itemType}
            onChange={(value) =>
              setItemType((value ?? item.item_type) as ItemType)
            }
          />
          <NumberInput
            label="Due days after instantiation (optional)"
            min={0}
            allowDecimal={false}
            disabled={mutation.isPending}
            value={dueOffsetDays}
            onChange={(value) =>
              setDueOffsetDays(value === "" ? "" : Number(value))
            }
          />
        </Group>
        <Textarea
          label="Description (optional)"
          autosize
          minRows={2}
          disabled={mutation.isPending}
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
        />
        <NumberInput
          label="Display order (optional)"
          description="Lower numbers show first"
          min={0}
          allowDecimal={false}
          disabled={mutation.isPending}
          value={displayOrder}
          onChange={(value) =>
            setDisplayOrder(value === "" ? "" : Number(value))
          }
        />
        <Checkbox
          label="Required"
          description="Blocks checklist completion until resolved"
          checked={isRequired}
          disabled={mutation.isPending}
          onChange={(event) => setIsRequired(event.currentTarget.checked)}
        />
        <Group justify="flex-end" gap="xs">
          <Button
            variant="default"
            size="xs"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            size="xs"
            loading={mutation.isPending}
            disabled={!label.trim()}
            onClick={handleSubmit}
          >
            Save changes
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
