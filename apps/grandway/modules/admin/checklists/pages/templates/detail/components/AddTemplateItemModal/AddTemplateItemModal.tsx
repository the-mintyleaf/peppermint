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
import { useCreateTemplateItem } from "../../../../../checklists.hooks";
import { ITEM_TYPE_OPTIONS } from "../../../../../checklists.labels";
import type { ItemType } from "../../../../../checklists.types";
import type { AddTemplateItemModalProps } from "./AddTemplateItemModal.types";

/**
 * Adds one requirement to a template (`POST /templates/<id>/items/`). Allowed
 * even while the template is still a draft (§6 — requirements are normally
 * added before publishing). There is no delete for template items — a mistake
 * is retired with `is_active: false` from `TemplateItemsList`, not removed.
 */
export function AddTemplateItemModal({
  templateId,
  opened,
  onClose,
}: AddTemplateItemModalProps) {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [itemType, setItemType] = useState<ItemType>("document");
  const [isRequired, setIsRequired] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<number | "">("");
  const [dueOffsetDays, setDueOffsetDays] = useState<number | "">("");
  const mutation = useCreateTemplateItem(templateId);

  const reset = () => {
    setLabel("");
    setDescription("");
    setItemType("document");
    setIsRequired(true);
    setDisplayOrder("");
    setDueOffsetDays("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    mutation.mutate(
      {
        label: label.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        item_type: itemType,
        is_required: isRequired,
        ...(displayOrder !== "" ? { display_order: displayOrder } : {}),
        ...(dueOffsetDays !== ""
          ? { default_due_offset_days: dueOffsetDays }
          : {}),
      },
      { onSuccess: handleClose },
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Add requirement"
      centered
    >
      <Stack gap="md" p="md">
        <TextInput
          label="Label"
          placeholder="e.g. Valid passport scan"
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
            onChange={(value) => setItemType((value ?? "document") as ItemType)}
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
            onClick={handleClose}
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
            Add requirement
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
