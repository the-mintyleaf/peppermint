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
import { useRecordLeadFollowUp } from "../../../../leadManagement.hooks";
import {
  SELECTABLE_STAGES,
  type SelectableLeadStage,
} from "../../../../leadManagement.types";
import { STAGE_LABELS } from "../../../../leadCategory.utils";
import type { RecordFollowUpModalProps } from "./RecordFollowUpModal.types";

const STAGE_OPTIONS = SELECTABLE_STAGES.map((stage) => ({
  value: stage,
  label: STAGE_LABELS[stage],
}));

/**
 * Records that contact already happened — Grandway doesn't schedule
 * follow-ups or send reminders (`docs/backend/lead-management/CONCEPT.md`
 * "Manual follow-up tracking"), so this has no due-date field. Both fields
 * are optional; an empty submission is valid and just stamps
 * `last_followed_up_at`/`_by`.
 */
export function RecordFollowUpModal({
  lead,
  opened,
  onClose,
}: RecordFollowUpModalProps) {
  const [note, setNote] = useState("");
  const [stage, setStage] = useState<SelectableLeadStage | null>(null);
  const mutation = useRecordLeadFollowUp(lead.id);

  const handleClose = () => {
    setNote("");
    setStage(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={`Record follow-up — ${lead.full_name || lead.full_name_en || lead.full_name_np}`}
      centered
    >
      <Stack gap="md" p="md">
        <Text size="xs" c="dimmed">
          Logs that you followed up just now. This doesn&apos;t schedule
          anything — Grandway doesn&apos;t send reminders.
        </Text>

        <Textarea
          label="Note"
          placeholder="What did you discuss?"
          autosize
          minRows={2}
          disabled={mutation.isPending}
          value={note}
          onChange={(e) => setNote(e.currentTarget.value)}
        />

        <Select
          label="Update stage"
          placeholder="Leave unchanged"
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
            loading={mutation.isPending}
            onClick={() =>
              mutation.mutate(
                {
                  ...(note.trim() ? { note: note.trim() } : {}),
                  ...(stage ? { stage } : {}),
                },
                { onSuccess: handleClose },
              )
            }
          >
            Record follow-up
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
