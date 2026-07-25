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
import { useUpdateChecklistItem } from "../../../../checklists.hooks";
import { ITEM_TYPE_OPTIONS } from "../../../../checklists.labels";
import type { ItemType, UpdateItemPayload } from "../../../../checklists.types";
import type { EditChecklistItemModalProps } from "./EditChecklistItemModal.types";

/**
 * Edits an item's descriptive fields (`PATCH /<id>/items/<item_id>/`) —
 * `status` is NOT accepted here (§7); that moves only through
 * `ItemStatusModal`. Only changed fields are sent.
 */
export function EditChecklistItemModal({
  checklistId,
  item,
  opened,
  onClose,
}: EditChecklistItemModalProps) {
  const [label, setLabel] = useState(item.label);
  const [description, setDescription] = useState(item.description);
  const [itemType, setItemType] = useState<ItemType>(item.item_type);
  const [isRequired, setIsRequired] = useState(item.is_required);
  const [displayOrder, setDisplayOrder] = useState<number | "">(
    item.display_order,
  );
  const [assignedTo, setAssignedTo] = useState(item.assigned_to?.id ?? "");
  const [dueAt, setDueAt] = useState<string | null>(item.due_at ?? null);
  const [evidenceNote, setEvidenceNote] = useState(item.evidence_note);
  const mutation = useUpdateChecklistItem(checklistId);

  const handleSubmit = () => {
    const body: UpdateItemPayload = {};
    if (label.trim() !== item.label) body.label = label.trim();
    if (description.trim() !== item.description)
      body.description = description.trim();
    if (itemType !== item.item_type) body.item_type = itemType;
    if (isRequired !== item.is_required) body.is_required = isRequired;
    if (displayOrder !== "" && displayOrder !== item.display_order)
      body.display_order = displayOrder;
    if (assignedTo.trim() !== (item.assigned_to?.id ?? ""))
      body.assigned_to = assignedTo.trim() || null;
    if ((dueAt || null) !== (item.due_at || null)) body.due_at = dueAt || null;
    if (evidenceNote.trim() !== item.evidence_note)
      body.evidence_note = evidenceNote.trim();

    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }

    mutation.mutate({ itemId: item.id, body }, { onSuccess: onClose });
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit item" centered>
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
        <Textarea
          label="Evidence note (optional)"
          autosize
          minRows={2}
          disabled={mutation.isPending}
          value={evidenceNote}
          onChange={(event) => setEvidenceNote(event.currentTarget.value)}
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
