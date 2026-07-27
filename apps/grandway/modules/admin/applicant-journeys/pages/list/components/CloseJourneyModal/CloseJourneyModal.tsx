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
} from "@peppermint/ui";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { useCloseJourney } from "../../../../applicantJourneys.hooks";
import { OUTCOME_LABELS } from "../../../../applicantJourneys.labels";
import type { JourneyOutcome } from "../../../../applicantJourneys.types";
import type { CloseJourneyModalProps } from "./CloseJourneyModal.types";

const OUTCOME_OPTIONS = (
  Object.entries(OUTCOME_LABELS) as [JourneyOutcome, string][]
).map(([value, label]) => ({ value, label }));

/**
 * The outcome list is a fixed enum, not fetched from an endpoint (unlike
 * lead loss reasons) — `docs/backend/applicant-journeys/FLOWS.md` "End an
 * objective". `successful` → stage `completed`; anything else → `closed`.
 * `Other` reveals a required explanation
 * (`JOURNEYS_OUTCOME_DETAIL_REQUIRED`). Reversible via Reopen, but recorded —
 * the warning below says so rather than implying permanence it doesn't have.
 */
export function CloseJourneyModal({
  journey,
  opened,
  onClose,
}: CloseJourneyModalProps) {
  const [outcome, setOutcome] = useState<JourneyOutcome | null>(null);
  const [reason, setReason] = useState("");
  const mutation = useCloseJourney(journey.id);

  const reasonRequired = outcome === "other";
  const canSubmit =
    Boolean(outcome) && (!reasonRequired || reason.trim().length > 0);

  const handleClose = () => {
    setOutcome(null);
    setReason("");
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={`Close — ${journey.applicant.full_name}`}
      centered
    >
      <Stack gap="md" p="md">
        <Alert
          variant="light"
          color="red"
          icon={<WarningIcon size={16} aria-hidden />}
          title="This ends the journey"
        >
          Reopening later is possible and keeps this outcome visible in history
          — nothing is deleted.
        </Alert>

        <Select
          label="Outcome"
          placeholder="How did this end?"
          data={OUTCOME_OPTIONS}
          required
          disabled={mutation.isPending}
          value={outcome}
          onChange={(value) => {
            setOutcome(value as JourneyOutcome | null);
            setReason("");
          }}
        />

        {reasonRequired ? (
          <Textarea
            label="Explanation"
            placeholder="What happened?"
            autosize
            minRows={2}
            required
            disabled={mutation.isPending}
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
          />
        ) : null}

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
            color="red"
            loading={mutation.isPending}
            disabled={!canSubmit}
            onClick={() =>
              mutation.mutate(
                {
                  outcome: outcome as JourneyOutcome,
                  ...(reason.trim() ? { reason: reason.trim() } : {}),
                },
                { onSuccess: handleClose },
              )
            }
          >
            Close journey
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
