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
import { useCreateCondition } from "../../../../offers.hooks";
import { CONDITION_TYPE_OPTIONS } from "../../../../offers.labels";
import type { ConditionType } from "../../../../offers.types";
import type { AddConditionModalProps } from "./AddConditionModal.types";

/**
 * Adds one condition to an existing offer (`POST /<offer_id>/conditions/`).
 * Allowed even on a decided offer (§7) — never disabled by status. `type` and
 * `description` are required; `due_date` and `display_order` are optional.
 */
export function AddConditionModal({
  offerId,
  opened,
  onClose,
}: AddConditionModalProps) {
  const [conditionType, setConditionType] =
    useState<ConditionType>("academic_result");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [displayOrder, setDisplayOrder] = useState<number | "">("");
  const mutation = useCreateCondition(offerId);

  const handleClose = () => {
    setConditionType("academic_result");
    setDescription("");
    setDueDate(null);
    setDisplayOrder("");
    onClose();
  };

  const handleSubmit = () => {
    mutation.mutate(
      {
        condition_type: conditionType,
        description: description.trim(),
        ...(dueDate ? { due_date: dueDate } : {}),
        ...(displayOrder !== "" ? { display_order: displayOrder } : {}),
      },
      { onSuccess: handleClose },
    );
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Add condition" centered>
      <Stack gap="md" p="md">
        <Group grow align="flex-start">
          <Select
            label="Type"
            data={CONDITION_TYPE_OPTIONS}
            allowDeselect={false}
            disabled={mutation.isPending}
            value={conditionType}
            onChange={(value) =>
              setConditionType((value ?? "academic_result") as ConditionType)
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
          placeholder="e.g. Achieve IELTS 6.5 with no band below 6.0"
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
            onClick={handleClose}
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
            Add condition
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
