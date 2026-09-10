"use client";

import { Text, modals } from "@peppermint/ui";

/**
 * Confirms discarding unsaved input before leaving a form sub-screen in the
 * signature manager. A local copy rather than an import of `uploaded-files`'
 * identical helper: that one is a module internal, not part of its barrel, and
 * reaching past a sibling's public surface for a nine-line modal is the wrong
 * trade — the same reasoning that file records for its own copy.
 *
 * The app theme zeroes `Modal` body padding globally, so a confirm modal has to
 * restore it through `styles` — there is no content wrapper of ours to hang a
 * `p` prop on, since Mantine renders the action buttons itself.
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
