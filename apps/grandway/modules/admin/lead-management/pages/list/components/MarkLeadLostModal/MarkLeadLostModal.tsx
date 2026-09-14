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
import {
  useLossReasons,
  useMarkLeadLost,
} from "../../../../leadManagement.hooks";
import { referenceEntryLabel } from "../../../../referenceEntry.utils";
import type { MarkLeadLostModalProps } from "./MarkLeadLostModal.types";

/**
 * A reason is always mandatory — there's no way to close a lead without one
 * (`docs/backend/lead-management/INTEGRATION.md` §7). `detail` becomes
 * required, not just visible, the moment the selected reason itself
 * requires it.
 */
export function MarkLeadLostModal({
  lead,
  opened,
  onClose,
}: MarkLeadLostModalProps) {
  const { data: reasons = [] } = useLossReasons();
  const [reasonId, setReasonId] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const mutation = useMarkLeadLost(lead.id);

  const selectedReason = reasons.find((r) => r.id === reasonId);
  const detailRequired = Boolean(selectedReason?.requires_detail);
  const canSubmit =
    Boolean(reasonId) && (!detailRequired || detail.trim().length > 0);

  const handleClose = () => {
    setReasonId(null);
    setDetail("");
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={`Mark as lost — ${lead.full_name}`}
      centered
    >
      <Stack gap="md" p="md">
        <Alert
          variant="light"
          color="red"
          icon={<WarningIcon size={16} aria-hidden />}
          title="This lead will move to Dead / closed"
        >
          It stays in the system and can be reopened later — nothing is deleted.
        </Alert>

        <Select
          label="Reason"
          placeholder="Why isn't this proceeding?"
          data={reasons.map((r) => ({
            value: r.id,
            label: referenceEntryLabel(r),
          }))}
          required
          disabled={mutation.isPending}
          value={reasonId}
          onChange={(value) => {
            setReasonId(value);
            setDetail("");
          }}
        />

        {detailRequired ? (
          <Textarea
            label="Please specify"
            placeholder="What happened?"
            autosize
            minRows={2}
            required
            disabled={mutation.isPending}
            value={detail}
            onChange={(e) => setDetail(e.currentTarget.value)}
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
                  loss_reason: reasonId as string,
                  ...(detail.trim() ? { detail: detail.trim() } : {}),
                },
                { onSuccess: handleClose },
              )
            }
          >
            Mark as lost
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
