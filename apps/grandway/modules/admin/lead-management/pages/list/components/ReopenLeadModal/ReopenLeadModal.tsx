"use client";

import { useState } from "react";
import { Alert, Button, Group, Modal, Select, Stack } from "@peppermint/ui";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { useReopenLead } from "../../../../leadManagement.hooks";
import {
  SELECTABLE_STAGES,
  type SelectableLeadStage,
} from "../../../../leadManagement.types";
import { STAGE_LABELS } from "../../../../leadCategory.utils";
import type { ReopenLeadModalProps } from "./ReopenLeadModal.types";

const STAGE_OPTIONS = SELECTABLE_STAGES.map((stage) => ({
  value: stage,
  label: STAGE_LABELS[stage],
}));

/**
 * The only way back from `lost` or `converted`. Defaults to `follow_up` when
 * no stage is picked, matching the backend's own default
 * (`docs/backend/lead-management/INTEGRATION.md` §7). Reopening a converted
 * lead never undoes the conversion — the applicant/journey it created stay
 * linked and visible on the Overview tab regardless of this lead's stage.
 */
export function ReopenLeadModal({
  lead,
  opened,
  onClose,
}: ReopenLeadModalProps) {
  const [stage, setStage] = useState<SelectableLeadStage | null>(null);
  const mutation = useReopenLead(lead.id);
  const wasConverted = lead.stage === "converted";

  const handleClose = () => {
    setStage(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={`Reopen — ${lead.full_name}`}
      centered
    >
      <Stack gap="md" p="md">
        <Alert
          variant="light"
          color="teal"
          icon={<InfoIcon size={16} aria-hidden />}
          title="Brings this lead back to active follow-up"
        >
          {wasConverted
            ? "This does not undo the conversion — the applicant and journey it created stay linked."
            : "Its loss reason and history are kept, not erased."}
        </Alert>

        <Select
          label="Reopen to stage"
          placeholder="Follow-up (default)"
          data={STAGE_OPTIONS}
          clearable
          disabled={mutation.isPending}
          value={stage}
          onChange={(value) => setStage(value as SelectableLeadStage | null)}
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
