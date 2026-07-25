"use client";

import { useState } from "react";
import {
  Button,
  Checkbox,
  DateInput,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import { useCreateChecklistItem } from "../../../../checklists.hooks";
import { ITEM_TYPE_OPTIONS } from "../../../../checklists.labels";
import type { ItemType } from "../../../../checklists.types";
import type { AddChecklistItemModalProps } from "./AddChecklistItemModal.types";

/**
 * A one-off requirement for THIS applicant (`POST /<id>/items/`) — it never
 * travels back to the template (§7). There is no user-list endpoint here yet
 * (§9), so `assigned_to` is a plain id field rather than a picker.
 */
export function AddChecklistItemModal({
  checklistId,
  opened,
  onClose,
}: AddChecklistItemModalProps) {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [itemType, setItemType] = useState<ItemType>("document");
  const [isRequired, setIsRequired] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<number | "">("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueAt, setDueAt] = useState<string | null>(null);
  const mutation = useCreateChecklistItem(checklistId);

  const reset = () => {
    setLabel("");
    setDescription("");
    setItemType("document");
    setIsRequired(true);
    setDisplayOrder("");
    setAssignedTo("");
    setDueAt(null);
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
        ...(assignedTo.trim() ? { assigned_to: assignedTo.trim() } : {}),
        ...(dueAt ? { due_at: dueAt } : {}),
      },
      { onSuccess: handleClose },
    );
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Add item" centered>
      <Stack gap="md" p="md">
        <TextInput
          label="Label"
          placeholder="e.g. Submit bank statement"
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
          <DateInput
            label="Due date"
            valueFormat="YYYY-MM-DD"
            clearable
            disabled={mutation.isPending}
            value={dueAt}
            onChange={(value) => setDueAt(value)}
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
        <TextInput
          label="Assigned to (user ID, optional)"
          description="No user picker is available yet — paste the user's id"
          disabled={mutation.isPending}
          value={assignedTo}
          onChange={(event) => setAssignedTo(event.currentTarget.value)}
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
            Add item
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
