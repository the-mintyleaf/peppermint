"use client";

import { useState } from "react";
import { Button, Group, Modal, Select, Stack } from "@peppermint/ui";
import { useChangeLeadStage } from "../../../../leadManagement.hooks";
import {
  SELECTABLE_STAGES,
  type SelectableLeadStage,
} from "../../../../leadManagement.types";
import { STAGE_LABELS } from "../../../../leadCategory.utils";
import type { ChangeStageModalProps } from "./ChangeStageModal.types";

const STAGE_OPTIONS = SELECTABLE_STAGES.map((stage) => ({
  value: stage,
  label: STAGE_LABELS[stage],
}));

/**
 * The dropdown offers only the 6 selectable stages — `lost`/`converted` are
 * reached only via their own dedicated actions
 * (`docs/backend/lead-management/INTEGRATION.md` §5).
 */
export function ChangeStageModal({
  lead,
  opened,
  onClose,
}: ChangeStageModalProps) {
  const [stage, setStage] = useState<SelectableLeadStage | null>(null);
  const mutation = useChangeLeadStage(lead.id);

  const handleClose = () => {
    setStage(null);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Change stage" centered>
      <Stack gap="md" p="md">
        <Select
          label="New stage"
          placeholder={
            STAGE_LABELS[lead.stage as SelectableLeadStage] ?? lead.stage
          }
          data={STAGE_OPTIONS}
          required
          disabled={mutation.isPending}
          value={stage}
          onChange={(value) => setStage(value as SelectableLeadStage)}
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
                { stage: stage as SelectableLeadStage },
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
