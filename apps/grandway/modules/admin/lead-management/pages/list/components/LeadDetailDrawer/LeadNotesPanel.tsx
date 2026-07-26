"use client";

import { useState } from "react";
import {
  Avatar,
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
import {
  useCreateLeadNote,
  useLeadNotes,
} from "../../../../leadManagement.hooks";
import type { LeadNote } from "../../../../leadManagement.types";

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

/** One appended note — a contained card, author and time in a quiet header. */
function NoteCard({ note }: { note: LeadNote }) {
  const author = note.author.display_name || note.author.username;
  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Group gap="xs" wrap="nowrap">
            <Avatar size="sm" radius="xl" color="blue">
              {initials(author)}
            </Avatar>
            <Text size="sm" fw={600}>
              {author}
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            {dayjs(note.created_at).format("MMM D, YYYY h:mm A")}
          </Text>
        </Group>
        <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
          {note.body}
        </Text>
      </Stack>
    </Paper>
  );
}

/** Append-only — no edit/delete affordance, matching the backend contract exactly. */
export function LeadNotesPanel({ leadId }: { leadId: string }) {
  const { data, isLoading } = useLeadNotes(leadId);
  const mutation = useCreateLeadNote(leadId);
  const [body, setBody] = useState("");

  const notes = data?.data ?? [];
  const truncated = (data?.meta.total ?? 0) > notes.length;

  return (
    <Stack gap="md">
      <Paper withBorder radius="md" p="md">
        <Stack gap="xs">
          <Textarea
            aria-label="Add a note about this lead"
            placeholder="Add a note about this lead"
            autosize
            minRows={2}
            disabled={mutation.isPending}
            value={body}
            onChange={(e) => setBody(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button
              size="xs"
              disabled={!body.trim()}
              loading={mutation.isPending}
              onClick={() =>
                mutation.mutate(
                  { body: body.trim() },
                  { onSuccess: () => setBody("") },
                )
              }
            >
              Add note
            </Button>
          </Group>
        </Stack>
      </Paper>

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
