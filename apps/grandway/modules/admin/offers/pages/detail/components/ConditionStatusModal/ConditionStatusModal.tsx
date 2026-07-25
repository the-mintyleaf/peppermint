"use client";

import { useState } from "react";
import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
} from "@peppermint/ui";
import { useChangeConditionStatus } from "../../../../offers.hooks";
import {
  CONDITION_STATUS_OPTIONS,
  CONDITION_TYPE_LABELS,
} from "../../../../offers.labels";
import type { ConditionStatus } from "../../../../offers.types";
import type { ConditionStatusModalProps } from "./ConditionStatusModal.types";

const NOTE_REQUIRED = new Set<ConditionStatus>(["waived", "not_applicable"]);

/**
 * The tick/waive control — the ONLY way a condition's status changes (the
 * condition PATCH is wording-only, §7). `note` is required for
 * waived/not_applicable (`OFFERS_CONDITION_NOTE_REQUIRED`); satisfied needs
 * none. Moving back to `pending` is allowed and clears the resolution stamp.
 * Changing status flips the offer's `has_open_conditions`, which the endpoint
 * does not return — the hook refetches the offer detail on success.
 */
export function ConditionStatusModal({
  offerId,
  condition,
  opened,
  onClose,
}: ConditionStatusModalProps) {
  const [status, setStatus] = useState<ConditionStatus | null>(null);
  const [note, setNote] = useState("");
  const mutation = useChangeConditionStatus(offerId);

  const handleClose = () => {
    setStatus(null);
    setNote("");
    onClose();
  };

  const needsNote = status != null && NOTE_REQUIRED.has(status);
  const canSubmit = status != null && (!needsNote || note.trim().length > 0);

  const handleSubmit = () => {
    if (status == null) return;
    mutation.mutate(
      {
        conditionId: condition.id,
        body: {
          status,
          ...(note.trim() ? { note: note.trim() } : {}),
        },
      },
      { onSuccess: handleClose },
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Update condition status"
      centered
    >
      <Stack gap="md" p="md">
        <Text size="sm" c="dimmed">
          {CONDITION_TYPE_LABELS[condition.condition_type]} —{" "}
          {condition.description}
        </Text>

        <Select
          label="New status"
          placeholder="Choose a status"
          data={CONDITION_STATUS_OPTIONS}
          required
          disabled={mutation.isPending}
          value={status}
          onChange={(value) => setStatus(value as ConditionStatus | null)}
        />

        <Textarea
          label={needsNote ? "Note" : "Note (optional)"}
          placeholder="Why is this condition being waived or marked not applicable?"
          autosize
          minRows={2}
          required={needsNote}
          disabled={mutation.isPending}
          value={note}
          onChange={(event) => setNote(event.currentTarget.value)}
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
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            Update status
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
