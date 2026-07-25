"use client";

import { Text, modals } from "@peppermint/ui";

/**
 * Confirms discarding unsaved input before closing one of this module's
 * FormWrapper-based modals (Upload/Replace/Edit) or the hand-rolled Verify
 * modal — mirrors `modules/documents/hooks/useUnsavedChangesGuard.tsx`'s
 * `confirmLeaveWithUnsavedChanges`, scoped to this module rather than
 * depending on a sibling module's internal (non-barrel) hook.
 */
export function confirmDiscardChanges(onConfirm: () => void): void {
  modals.openConfirmModal({
    title: <Text size="sm">Discard changes?</Text>,
    withCloseButton: false,
    children: (
      <Text size="sm">Unsaved changes will be lost. Are you sure?</Text>
    ),
    confirmProps: { size: "xs", color: "red" },
    cancelProps: { size: "xs" },
    labels: { confirm: "Discard", cancel: "Keep editing" },
    onConfirm,
    styles: { body: { padding: "var(--mantine-spacing-md)" } },
  });
}
