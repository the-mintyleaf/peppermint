"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  Radio,
  Stack,
  Text,
  Textarea,
} from "@peppermint/ui";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { confirmDiscardChanges } from "../../confirmDiscardChanges";
import { useVerifyFile } from "../../../uploadedFiles.hooks";
import type { VerifyDecision } from "../../../uploadedFiles.types";
import type { VerifyFileModalProps } from "./VerifyFileModal.types";

/**
 * Verify — `POST /api/v1/files/<id>/verify/`, Admin only (§7). `pending` is
 * not a settable verdict, so the radio only offers verified/rejected (§5).
 * Reason is required only when rejecting (`UPLOADED_FILES_REJECTION_REASON_REQUIRED`,
 * mirroring `RecordDecisionModal`'s reason-required pattern). Verification
 * gates nothing else in the product and a verdict may be revised later —
 * this modal never disables based on the file's current status.
 */
export function VerifyFileModal({
  file,
  opened,
  onClose,
}: VerifyFileModalProps) {
  const [status, setStatus] = useState<VerifyDecision | null>(null);
  const [reason, setReason] = useState("");
  const mutation = useVerifyFile(file.id);

  const isDirty = status !== null || reason.trim().length > 0;

  const reset = () => {
    setStatus(null);
    setReason("");
  };

  const handleClose = () => {
    if (isDirty)
      confirmDiscardChanges(() => {
        reset();
        onClose();
      });
    else onClose();
  };

  const needsReason = status === "rejected";
  const canSubmit =
    status != null && (!needsReason || reason.trim().length > 0);

  const handleSubmit = () => {
    if (!status) return;
    mutation.mutate(
      { status, ...(reason.trim() ? { reason: reason.trim() } : {}) },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Verify file" centered>
      <Stack gap="md" p="md">
        <Alert
          variant="light"
          color="blue"
          icon={<InfoIcon size={16} aria-hidden />}
          title={file.original_filename}
        >
          <Text size="xs">
            Record whether this file is acceptable. This does not gate any other
            workflow — verification is recorded, not enforced.
          </Text>
        </Alert>
        <Radio.Group
          label="Decision"
          value={status}
          onChange={(value) => setStatus(value as VerifyDecision)}
        >
          <Group gap="md" mt={4}>
            <Radio
              value="verified"
              label="Verified"
              disabled={mutation.isPending}
            />
            <Radio
              value="rejected"
              label="Rejected"
              disabled={mutation.isPending}
            />
          </Group>
        </Radio.Group>
        <Textarea
          label={needsReason ? "Reason" : "Reason (optional)"}
          placeholder="Why is this file being rejected?"
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
            Record verification
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
