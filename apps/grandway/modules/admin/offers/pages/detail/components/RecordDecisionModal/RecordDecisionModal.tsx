"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { useRecordOfferDecision } from "../../../../offers.hooks";
import { DECISION_OUTCOME_OPTIONS } from "../../../../offers.labels";
import type { DecisionOutcome } from "../../../../offers.types";
import type { RecordDecisionModalProps } from "./RecordDecisionModal.types";

const REASON_REQUIRED = new Set<DecisionOutcome>(["rejected", "withdrawn"]);

/**
 * Records the applicant's response to an offer. A decision is FINAL — there is
 * no reopen (§3); to change position, record a new offer. `reason` is required
 * for rejected/withdrawn (`OFFERS_DECISION_REASON_REQUIRED`); `to_intake` is
 * required for deferred (`OFFERS_DEFER_INTAKE_REQUIRED`). A 409
 * `OFFERS_ACCEPTED_OFFER_EXISTS` (the journey already has an accepted offer)
 * surfaces through the mutation's error notification; the modal stays open so
 * the user can pick a different outcome.
 */
export function RecordDecisionModal({
  offer,
  opened,
  onClose,
}: RecordDecisionModalProps) {
  const [outcome, setOutcome] = useState<DecisionOutcome | null>(null);
  const [reason, setReason] = useState("");
  const [toIntake, setToIntake] = useState("");
  const mutation = useRecordOfferDecision(offer.id);

  const handleClose = () => {
    setOutcome(null);
    setReason("");
    setToIntake("");
    onClose();
  };

  const needsReason = outcome != null && REASON_REQUIRED.has(outcome);
  const needsIntake = outcome === "deferred";
  const canSubmit =
    outcome != null &&
    (!needsReason || reason.trim().length > 0) &&
    (!needsIntake || toIntake.trim().length > 0);

  const handleSubmit = () => {
    if (outcome == null) return;
    mutation.mutate(
      {
        outcome,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
        ...(needsIntake && toIntake.trim()
          ? { to_intake: toIntake.trim() }
          : {}),
      },
      { onSuccess: handleClose },
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Record decision"
      centered
    >
      <Stack gap="md" p="md">
        <Alert
          variant="light"
          color="orange"
          icon={<WarningIcon size={16} aria-hidden />}
          title="A decision is final"
        >
          There is no reopen. If the institution changes its position, record a
          new offer instead.
        </Alert>

        <Select
          label="Outcome"
          placeholder="How did the applicant respond?"
          data={DECISION_OUTCOME_OPTIONS}
          required
          disabled={mutation.isPending}
          value={outcome}
          onChange={(value) => setOutcome(value as DecisionOutcome | null)}
        />

        {needsIntake ? (
          <TextInput
            label="Deferring to intake"
            placeholder="Spring 2027"
            required
            disabled={mutation.isPending}
            value={toIntake}
            onChange={(event) => setToIntake(event.currentTarget.value)}
          />
        ) : null}

        <Textarea
          label={needsReason ? "Reason" : "Reason (optional)"}
          placeholder="Why did the applicant respond this way?"
          autosize
          minRows={2}
          required={needsReason}
          disabled={mutation.isPending}
          value={reason}
          onChange={(event) => setReason(event.currentTarget.value)}
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
            Record decision
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
