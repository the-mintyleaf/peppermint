"use client";

import {
  Button,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
  useForm,
} from "@peppermint/ui";
import type { ReasonConfirmDialogProps } from "./ReasonConfirmDialog.types";

export function ReasonConfirmDialog({
  opened,
  onClose,
  title,
  description,
  consequenceText,
  reasonLabel = "Reason",
  reasonPlaceholder = "Describe the reason for this action…",
  reasonRequired = true,
  confirmLabel = "Confirm",
  confirmColor = "red",
  onConfirm,
  loading = false,
}: ReasonConfirmDialogProps) {
  const form = useForm({
    initialValues: { reason: "" },
    validate: {
      reason: (value) =>
        reasonRequired && value.trim().length === 0
          ? "Reason is required"
          : null,
    },
  });

  function handleClose() {
    form.reset();
    onClose();
  }

  function handleSubmit(values: { reason: string }) {
    onConfirm(values.reason);
    form.reset();
  }

  return (
    <Modal opened={opened} onClose={handleClose} title={title} size="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {description}
          </Text>

          {consequenceText && (
            <Text size="sm" fw={500} c="orange">
              {consequenceText}
            </Text>
          )}

          <Textarea
            label={reasonLabel}
            placeholder={reasonPlaceholder}
            required={reasonRequired}
            autosize
            minRows={2}
            maxRows={5}
            {...form.getInputProps("reason")}
          />

          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              color="gray"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" color={confirmColor} loading={loading}>
              {confirmLabel}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
