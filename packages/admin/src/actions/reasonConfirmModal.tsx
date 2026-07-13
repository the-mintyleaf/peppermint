"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Button, Group, Stack, Text, Textarea, modals } from "@peppermint/ui";

export interface ReasonConfirmOptions {
  title: string;
  description?: ReactNode;
  /** Label above the reason textarea. */
  reasonLabel?: string;
  reasonPlaceholder?: string;
  /** Require a non-empty reason before confirm is enabled. Defaults to true. */
  reasonRequired?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Mantine color for the confirm button (e.g. "red"). */
  confirmColor?: string;
  /** Runs on confirm; may be async. The modal closes when it resolves. */
  onConfirm: (reason: string) => void | Promise<void>;
}

const MODAL_ID = "reason-confirm-modal";

interface ReasonConfirmContentProps extends ReasonConfirmOptions {
  modalId: string;
}

function ReasonConfirmContent({
  description,
  reasonLabel = "Reason",
  reasonPlaceholder,
  reasonRequired = true,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmColor,
  onConfirm,
  modalId,
}: ReasonConfirmContentProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const disabled = reasonRequired && reason.trim().length === 0;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(reason.trim());
      modals.close(modalId);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack gap="sm">
      {description && <Text size="sm">{description}</Text>}
      <Textarea
        label={reasonLabel}
        placeholder={reasonPlaceholder}
        value={reason}
        onChange={(event) => setReason(event.currentTarget.value)}
        autosize
        minRows={2}
        required={reasonRequired}
        data-autofocus
      />
      <Group justify="flex-end" gap="xs">
        <Button
          size="xs"
          variant="default"
          onClick={() => modals.close(modalId)}
          disabled={submitting}
        >
          {cancelLabel}
        </Button>
        <Button
          size="xs"
          color={confirmColor}
          onClick={handleConfirm}
          loading={submitting}
          disabled={disabled}
        >
          {confirmLabel}
        </Button>
      </Group>
    </Stack>
  );
}

/**
 * Open a confirmation modal with a reason textarea — the bespoke
 * `*ModalContent` (reason + confirm button) pattern duplicated in ~4 row-action
 * menus, consolidated. Confirm stays disabled until a reason is entered (when
 * required) and shows a spinner while `onConfirm` runs.
 */
export function openReasonConfirmModal(options: ReasonConfirmOptions): void {
  modals.open({
    modalId: MODAL_ID,
    title: (
      <Text size="sm" fw={600}>
        {options.title}
      </Text>
    ),
    children: <ReasonConfirmContent {...options} modalId={MODAL_ID} />,
  });
}
