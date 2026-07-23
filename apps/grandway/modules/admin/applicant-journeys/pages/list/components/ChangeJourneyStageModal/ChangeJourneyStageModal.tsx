"use client";

import { useState } from "react";
import { Button, Group, Modal, Select, Stack } from "@peppermint/ui";
import { useChangeJourneyStage } from "../../../../applicantJourneys.hooks";
import {
  SELECTABLE_STAGES,
  type SelectableJourneyStage,
} from "../../../../applicantJourneys.types";
import { STAGE_LABELS } from "../../../../applicantJourneys.labels";
import type { ChangeJourneyStageModalProps } from "./ChangeJourneyStageModal.types";

const STAGE_OPTIONS = SELECTABLE_STAGES.map((stage) => ({
  value: stage,
  label: STAGE_LABELS[stage],
}));

/**
 * The dropdown offers only the 6 selectable stages — `completed`/`closed`/
 * `deferred` are reached only via their own dedicated actions
 * (`docs/backend/applicant-journeys/INTEGRATION.md` §5).
 */
export function ChangeJourneyStageModal({
  journey,
  opened,
  onClose,
}: ChangeJourneyStageModalProps) {
  const [stage, setStage] = useState<SelectableJourneyStage | null>(null);
  const mutation = useChangeJourneyStage(journey.id);

  const handleClose = () => {
    setStage(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={`Change stage — ${journey.applicant.full_name_en || journey.applicant.full_name_np}`}
      centered
    >
      <Stack gap="md" p="md">
        <Select
          label="New stage"
          placeholder={
            STAGE_LABELS[journey.stage as SelectableJourneyStage] ??
            journey.stage
          }
          data={STAGE_OPTIONS}
          required
          disabled={mutation.isPending}
          value={stage}
          onChange={(value) => setStage(value as SelectableJourneyStage)}
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
            disabled={!stage}
            onClick={() =>
              mutation.mutate(
                { stage: stage as SelectableJourneyStage },
                { onSuccess: handleClose },
              )
            }
          >
            Update stage
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
