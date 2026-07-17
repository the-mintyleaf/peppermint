"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  Alert,
  Button,
  Group,
  Stack,
  Text,
  Textarea,
  modals,
} from "@peppermint/ui";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";

/** Visual severity of the confirmation's consequence message. */
export type ReasonConfirmTone = "danger" | "warning" | "info";

const TONE_CONFIG: Record<
  ReasonConfirmTone,
  { color: string; icon: ReactNode }
> = {
  danger: {
    color: "red",
    icon: <ProhibitIcon size={18} weight="fill" aria-hidden />,
  },
  warning: {
    color: "yellow",
    icon: <WarningIcon size={18} weight="fill" aria-hidden />,
  },
  info: {
    color: "blue",
    icon: <InfoIcon size={18} weight="fill" aria-hidden />,
  },
};

export interface ReasonConfirmOptions {
  title: string;
  /**
   * Bold heading for the consequence message (the Alert title when `tone` is set).
   * Pair with `description` as the supporting sub-heading.
   */
  alertTitle?: ReactNode;
  description?: ReactNode;
  /**
   * When set, render the message as an `<Alert>` (icon + color) instead of plain
   * text — for destructive/consequential confirmations. Omit for a neutral message.
   */
  tone?: ReasonConfirmTone;
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

// Unique id per open so two confirm modals in quick succession don't collide on
// the same id (Mantine ignores a second open with a duplicate id).
let modalCounter = 0;

interface ReasonConfirmContentProps extends ReasonConfirmOptions {
  modalId: string;
}

function ReasonConfirmContent({
  alertTitle,
  description,
  tone,
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
      // Success — close the modal (content unmounts; no setState afterward).
      modals.close(modalId);
    } catch {
      // Keep the modal open for retry; onConfirm is expected to surface its own
      // error toast. Catching here avoids an unhandled promise rejection.
      setSubmitting(false);
    }
  };

  const toneConfig = tone ? TONE_CONFIG[tone] : null;

  const hasMessage = Boolean(alertTitle || description);

  return (
    <Stack gap="sm">
      {hasMessage &&
        (toneConfig ? (
          <Alert
            color={toneConfig.color}
            icon={toneConfig.icon}
            title={alertTitle}
          >
            {description}
          </Alert>
        ) : (
          <Stack gap={2}>
            {alertTitle && (
              <Text size="sm" fw={600}>
                {alertTitle}
              </Text>
            )}
            {description && (
              <Text size="sm" c="dimmed">
                {description}
              </Text>
            )}
          </Stack>
        ))}
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
  const modalId = `reason-confirm-modal-${(modalCounter += 1)}`;
  modals.open({
    modalId,
    title: (
      <Text size="sm" fw={600}>
        {options.title}
      </Text>
    ),
    // Restore body padding per-instance: apps may zero Modal body padding
    // globally (e.g. for edge-to-edge shell modals), which would otherwise leave
    // this confirm content flush against the border.
    styles: { body: { padding: "var(--mantine-spacing-md)" } },
    children: <ReasonConfirmContent {...options} modalId={modalId} />,
  });
}
