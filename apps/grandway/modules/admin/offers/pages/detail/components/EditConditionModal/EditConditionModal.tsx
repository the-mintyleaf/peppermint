"use client";

import { useState } from "react";
import {
  Button,
  DateInput,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Textarea,
} from "@peppermint/ui";
import { useUpdateCondition } from "../../../../offers.hooks";
import { CONDITION_TYPE_OPTIONS } from "../../../../offers.labels";
import type {
  ConditionType,
  ConditionUpdatePayload,
} from "../../../../offers.types";
import type { EditConditionModalProps } from "./EditConditionModal.types";

/**
 * Edits a condition's wording (`PATCH /conditions/<id>/`) — `condition_type`,
 * `description`, `due_date`, `display_order` only. Status is NOT editable here
 * (it moves through the dedicated status action). Only changed fields are sent.
 */
export function EditConditionModal({
  offerId,
  condition,
  opened,
  onClose,
}: EditConditionModalProps) {
  const [conditionType, setConditionType] = useState<ConditionType>(
    condition.condition_type,
  );
  const [description, setDescription] = useState(condition.description);
  const [dueDate, setDueDate] = useState<string | null>(
    condition.due_date ?? null,
  );
  const [displayOrder, setDisplayOrder] = useState<number | "">(
    condition.display_order,
  );
  const mutation = useUpdateCondition(offerId);

  const handleSubmit = () => {
    const body: ConditionUpdatePayload = {};
    if (conditionType !== condition.condition_type) {
      body.condition_type = conditionType;
    }
    if (description.trim() !== condition.description) {
      body.description = description.trim();
    }
    if ((dueDate ?? null) !== (condition.due_date ?? null)) {
      body.due_date = dueDate;
    }
    if (displayOrder !== "" && displayOrder !== condition.display_order) {
      body.display_order = displayOrder;
    }

    // Nothing changed — close without a no-op request.
    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }

    mutation.mutate(
      { conditionId: condition.id, body },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit condition" centered>
      <Stack gap="md" p="md">
        <Group grow align="flex-start">
          <Select
            label="Type"
            data={CONDITION_TYPE_OPTIONS}
            allowDeselect={false}
            disabled={mutation.isPending}
            value={conditionType}
            onChange={(value) =>
              setConditionType((value ?? conditionType) as ConditionType)
            }
          />
          <DateInput
            label="Due date"
            valueFormat="YYYY-MM-DD"
            clearable
            disabled={mutation.isPending}
            value={dueDate}
            onChange={(value) => setDueDate(value)}
          />
        </Group>

        <Textarea
          label="Description"
          autosize
          minRows={2}
          required
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
            disabled={!description.trim()}
            onClick={handleSubmit}
          >
            Save changes
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
