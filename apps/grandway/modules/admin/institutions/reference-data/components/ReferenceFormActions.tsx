"use client";

import { Button, Group, modals } from "@peppermint/ui";
import { useFormControls } from "@peppermint/admin";

interface ReferenceFormActionsProps {
  mode: "create" | "edit";
  submitting: boolean;
  onCancel: () => void;
}

/**
 * Shared submit/cancel footer for the inline reference forms. A dirty draft is
 * confirmed before discarding (padding via `inner`, since the modal body is themed
 * to 0 — CLAUDE.md Modals rule).
 */
export function ReferenceFormActions({
  mode,
  submitting,
  onCancel,
}: ReferenceFormActionsProps) {
  const { handleSubmit, isLoading, isDirty } = useFormControls();

  const handleCancel = () => {
    if (!isDirty) {
      onCancel();
      return;
    }
    modals.openConfirmModal({
      title: "Discard changes?",
      children: "What you've entered here hasn't been saved.",
      labels: { confirm: "Discard", cancel: "Keep editing" },
      confirmProps: { color: "red" },
      styles: { inner: { padding: "var(--mantine-spacing-md)" } },
      onConfirm: onCancel,
    });
  };

  return (
    <Group justify="flex-end" gap="xs">
      <Button
        variant="default"
        size="xs"
        onClick={handleCancel}
        disabled={submitting}
      >
        Cancel
      </Button>
      <Button
        size="xs"
        onClick={handleSubmit}
        loading={submitting || isLoading}
      >
        {mode === "create" ? "Add" : "Save"}
      </Button>
    </Group>
  );
}
