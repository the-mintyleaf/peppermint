"use client";

import { useRef, useState } from "react";
import {
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Textarea,
  dayjs,
} from "@peppermint/ui";
import { NoteBlankIcon } from "@phosphor-icons/react/dist/csr/NoteBlank";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import {
  useCreateLeadNote,
  useLeadNotes,
} from "../../../../leadManagement.hooks";
import type { LeadNote } from "../../../../leadManagement.types";

/**
 * Collapsed to a single "Add note" button until clicked — the composer only
 * takes space when the user actually wants to write. Expanded, it's one
 * textbox with its submit and cancel actions docked to the bottom-right,
 * inside the same frame so the button reads as part of the field.
 */
function NoteComposer({ leadId }: { leadId: string }) {
  const mutation = useCreateLeadNote(leadId);
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  const collapse = () => {
    setBody("");
    setOpen(false);
    // Return focus to the trigger, not the void the textarea left behind.
    triggerRef.current?.focus();
  };

  const submit = () => {
    if (!body.trim()) return;
    mutation.mutate({ body: body.trim() }, { onSuccess: collapse });
  };

  if (!open) {
    return (
      <Button
        ref={triggerRef}
        variant="light"
        size="xs"
        leftSection={<PlusIcon size={14} aria-hidden />}
        onClick={() => setOpen(true)}
      >
        Add note
      </Button>
    );
  }

  return (
    <Paper withBorder radius="md" p="xs">
      <Textarea
        variant="unstyled"
        aria-label="Write a note about this lead"
        placeholder="Write a note about this lead"
        autosize
        minRows={2}
        px="xs"
        data-autofocus
        autoFocus
        disabled={mutation.isPending}
        value={body}
        onChange={(e) => setBody(e.currentTarget.value)}
        onKeyDown={(e) => {
          // Cmd/Ctrl+Enter submits; Escape backs out. Plain Enter stays a
          // newline — notes are free-form and multi-line.
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            submit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            collapse();
          }
        }}
      />
      <Group justify="flex-end" gap="xs" px="xs" pt={4}>
        <Button
          variant="subtle"
          color="gray"
          size="xs"
          onClick={collapse}
          disabled={mutation.isPending}
        >
          Cancel
        </Button>
        <Button
          size="xs"
          onClick={submit}
          disabled={!body.trim()}
          loading={mutation.isPending}
        >
          Add note
        </Button>
      </Group>
    </Paper>
  );
}

/**
 * One appended note, rendered as its own card — a note is a discrete object
 * someone wrote, not a row in a log, and the card's edge is what says so. The
 * note's text leads; who wrote it and when sit underneath as a quiet footer,
 * because the attribution only matters once you've read the note.
 */
function NoteCard({ note }: { note: LeadNote }) {
  const author = note.author.display_name || note.author.username;
  return (
    <Paper withBorder radius="md" p="sm">
      <Stack gap={6}>
        <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
          {note.body}
        </Text>
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Text size="xs" fw={600}>
            {author}
          </Text>
          <Text size="xs" c="dimmed">
            {dayjs(note.created_at).format("MMM D, YYYY h:mm A")}
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
}

/** Append-only — no edit/delete affordance, matching the backend contract exactly. */
export function LeadNotesPanel({ leadId }: { leadId: string }) {
  const { data, isLoading } = useLeadNotes(leadId);

  const notes = data?.data ?? [];
  const truncated = (data?.meta.total ?? 0) > notes.length;

  return (
    <Stack gap="md">
      <NoteComposer leadId={leadId} />

      {isLoading ? (
        <Center py="xl">
          <Loader size="sm" />
        </Center>
      ) : notes.length === 0 ? (
        <Stack align="center" gap="xs" py="xl">
          <NoteBlankIcon size={28} aria-hidden />
          <Text size="sm" c="dimmed">
            No notes yet. Add the first one above.
          </Text>
        </Stack>
      ) : (
        <Stack gap="sm">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
          {truncated ? (
            <Text size="xs" c="dimmed" ta="center">
              Showing the {notes.length} most recent notes.
            </Text>
          ) : null}
        </Stack>
      )}
    </Stack>
  );
}
