"use client";

import { useState } from "react";
import { LockSimpleIcon } from "@phosphor-icons/react/dist/csr/LockSimple";
import { Alert, Modal, Stack, Text } from "@peppermint/ui";

import { NoteForm, toApiNotedAt } from "@/components/notes-panel";
import type { NoteFormValues } from "@/components/notes-panel";

import { useAddLeadVisitNote } from "../../../../leadManagement.hooks";
import { visitNoteBlockFor } from "./AddVisitNoteModal.utils";
import type {
  AddVisitNoteFormProps,
  AddVisitNoteModalProps,
  VisitNoteBlock,
} from "./AddVisitNoteModal.types";

const INITIAL_VALUES: NoteFormValues = {
  body: "",
  noted_at: null,
  category: "visit",
};

/**
 * Mounted only while the modal is open (Mantine unmounts closed content), so
 * every open starts from a blank draft and the per-row mutation hook exists
 * only for the one lead being written about.
 */
function AddVisitNoteForm({ lead, onDone }: AddVisitNoteFormProps) {
  const mutation = useAddLeadVisitNote(lead.id, lead.full_name);
  const [block, setBlock] = useState<VisitNoteBlock | null>(null);

  const handleSubmit = async (values: NoteFormValues) => {
    try {
      await mutation.mutateAsync({
        body: values.body.trim(),
        // `null` = "now": the server stamps it at save time.
        ...(values.noted_at ? { noted_at: toApiNotedAt(values.noted_at) } : {}),
      });
    } catch (error) {
      setBlock(visitNoteBlockFor(error));
      // Re-throw: `NoteForm` maps future-date / validation errors onto their
      // fields and keeps the draft open.
      throw error;
    }
    onDone();
  };

  return (
    <Stack gap="sm" p="md">
      {block ? (
        <Alert
          color="gray"
          variant="light"
          icon={<LockSimpleIcon size={18} aria-hidden />}
          title={block.title}
        >
          <Text size="sm">{block.message}</Text>
        </Alert>
      ) : (
        <Text size="xs" c="dimmed">
          Saved under Visit in this lead&apos;s notes.
        </Text>
      )}
      <NoteForm
        mode="create"
        initialValues={INITIAL_VALUES}
        submitLabel="Add visit note"
        bodyLabel="What happened at the visit?"
        showCategory={false}
        onSubmit={handleSubmit}
        onCancel={onDone}
      />
    </Stack>
  );
}

/**
 * The board's quick "Add visit note" — the drawer's note form, without
 * opening the drawer. Reuses the shared `NoteForm` (body + "When", defaulting
 * to now, backdatable, capped at now + 5 min) with the category fixed to
 * `visit`.
 *
 * The modal has no close button and ignores outside clicks and Escape: the
 * form's Cancel (and Escape inside the textarea) asks before discarding a
 * written visit, which a bare modal close could not. Body padding is restored
 * on the content `Stack` — the app theme zeroes `Modal` body padding.
 */
export function AddVisitNoteModal({
  lead,
  opened,
  onClose,
}: AddVisitNoteModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Add visit note — ${lead.full_name}`}
      centered
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <AddVisitNoteForm lead={lead} onDone={onClose} />
    </Modal>
  );
}
