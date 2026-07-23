"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  Stack,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { useDeferJourney } from "../../../../applicantJourneys.hooks";
import type { DeferJourneyModalProps } from "./DeferJourneyModal.types";

/**
 * "The applicant intends to continue, not on the current timeline"
 * (`CONCEPT.md` "Deferment") — not an outcome, closes nothing; `outcome`
 * stays empty. `to_intake` is the one required field
 * (`JOURNEYS_DEFER_INTAKE_REQUIRED`).
 */
export function DeferJourneyModal({
  journey,
  opened,
  onClose,
}: DeferJourneyModalProps) {
  const [toIntake, setToIntake] = useState("");
  const [reason, setReason] = useState("");
  const mutation = useDeferJourney(journey.id);

  const handleClose = () => {
    setToIntake("");
    setReason("");
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={`Defer — ${journey.applicant.full_name_en || journey.applicant.full_name_np}`}
      centered
    >
      <Stack gap="md" p="md">
        <Alert
          variant="light"
          color="orange"
          icon={<InfoIcon size={16} aria-hidden />}
          title="Pauses this journey, not closes it"
        >
          Work can resume any time via Reopen — history and this reason stay on
          record.
        </Alert>

        <TextInput
          label="Deferring to intake"
          placeholder="Spring 2027"
          required
          disabled={mutation.isPending}
          value={toIntake}
          onChange={(e) => setToIntake(e.currentTarget.value)}
        />

        <Textarea
          label="Reason"
          placeholder="Missed intake, delayed test result, family reason…"
          autosize
          minRows={2}
          disabled={mutation.isPending}
          value={reason}
          onChange={(e) => setReason(e.currentTarget.value)}
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
            color="orange"
            loading={mutation.isPending}
            disabled={!toIntake.trim()}
            onClick={() =>
              mutation.mutate(
                {
                  to_intake: toIntake.trim(),
                  ...(reason.trim() ? { reason: reason.trim() } : {}),
                },
                { onSuccess: handleClose },
              )
            }
          >
            Defer
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
