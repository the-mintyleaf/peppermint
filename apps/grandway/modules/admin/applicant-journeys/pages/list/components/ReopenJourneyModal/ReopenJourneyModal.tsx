"use client";

import { useState } from "react";
import { Alert, Button, Group, Modal, Select, Stack } from "@peppermint/ui";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { useReopenJourney } from "../../../../applicantJourneys.hooks";
import {
  SELECTABLE_STAGES,
  type SelectableJourneyStage,
} from "../../../../applicantJourneys.types";
import { STAGE_LABELS } from "../../../../applicantJourneys.labels";
import type { ReopenJourneyModalProps } from "./ReopenJourneyModal.types";

const STAGE_OPTIONS = SELECTABLE_STAGES.map((stage) => ({
  value: stage,
  label: STAGE_LABELS[stage],
}));

/**
 * The only way back from any of the 3 terminal states. "Reopening a
 * completed journey doesn't undo that it was completed — the closure stays
 * visible in history" (`CONCEPT.md` "Reopening") — this dialog only picks
 * *where work resumes*, it never edits the record it's reopening from.
 * Defaults to `planning` when no stage is picked, matching the backend's own
 * default (INTEGRATION.md §7).
 */
export function ReopenJourneyModal({
  journey,
  opened,
  onClose,
}: ReopenJourneyModalProps) {
  const [stage, setStage] = useState<SelectableJourneyStage | null>(null);
  const mutation = useReopenJourney(journey.id);

  const handleClose = () => {
    setStage(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={`Reopen — ${journey.applicant.full_name_en || journey.applicant.full_name_np}`}
      centered
    >
      <Stack gap="md" p="md">
        <Alert
          variant="light"
          color="teal"
          icon={<InfoIcon size={16} aria-hidden />}
          title="Brings this journey back to active work"
        >
          Its closure or deferment details and history are kept, not erased.
        </Alert>

        <Select
          label="Reopen to stage"
          placeholder="Planning (default)"
          data={STAGE_OPTIONS}
          clearable
          disabled={mutation.isPending}
          value={stage}
          onChange={(value) => setStage(value as SelectableJourneyStage | null)}
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
            color="teal"
            loading={mutation.isPending}
            onClick={() =>
              mutation.mutate(stage ? { stage } : {}, {
                onSuccess: handleClose,
              })
            }
          >
            Reopen
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
