"use client";

import { useRef, useState } from "react";
import { Button } from "@peppermint/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";

import { noteCategoryLabel } from "../../NotesPanel.utils";
import type { NoteFormValues } from "../../NotesPanel.types";
import { NoteForm } from "../NoteForm";
import type { NoteComposerProps } from "./NoteComposer.types";

/**
 * Collapsed to one "Add … note" button until clicked, so the composer only
 * takes space when someone means to write. It lives outside the tab panels:
 * a half-written draft survives a tab switch, and the note is filed under
 * whichever tab is active when it is saved — the button label says which.
 */
export function NoteComposer({
  category,
  bodyLabel,
  onCreate,
  popoverZIndex,
}: NoteComposerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const actionLabel = `Add ${noteCategoryLabel(category).toLowerCase()} note`;

  const collapse = () => {
    setOpen(false);
    // Return focus to the trigger, not the void the textarea left behind.
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const handleSubmit = async (values: NoteFormValues) => {
    await onCreate(values);
    collapse();
  };

  if (!open) {
    return (
      <Button
        ref={triggerRef}
        variant="light"
        size="xs"
        leftSection={<PlusIcon size={14} aria-hidden />}
        onClick={() => setOpen(true)}
        style={{ alignSelf: "flex-start" }}
      >
        {actionLabel}
      </Button>
    );
  }

  return (
    <NoteForm
      mode="create"
      initialValues={{ body: "", noted_at: null, category }}
      submitLabel={actionLabel}
      bodyLabel={bodyLabel}
      showCategory={false}
      onSubmit={handleSubmit}
      onCancel={collapse}
      popoverZIndex={popoverZIndex}
    />
  );
}
