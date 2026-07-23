"use client";

import { useState } from "react";
import {
  Button,
  Group,
  Loader,
  Stack,
  Text,
  Textarea,
  dayjs,
} from "@peppermint/ui";
import {
  useCreateLeadNote,
  useLeadNotes,
} from "../../../../leadManagement.hooks";

/** Append-only — no edit/delete affordance, matching the backend contract exactly. */
export function LeadNotesPanel({ leadId }: { leadId: string }) {
  const { data, isLoading } = useLeadNotes(leadId);
  const mutation = useCreateLeadNote(leadId);
  const [body, setBody] = useState("");

  const notes = data?.data ?? [];
  const truncated = (data?.meta.total ?? 0) > notes.length;

  return (
    <Stack gap="md">
      <Stack gap="xs">
        <Textarea
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

      {isLoading ? (
        <Loader size="sm" />
      ) : notes.length === 0 ? (
        <Text size="xs" c="dimmed">
          No notes yet.
        </Text>
      ) : (
        <Stack gap="sm">
          {notes.map((note) => (
            <Stack key={note.id} gap={2}>
              <Group justify="space-between" gap="xs">
                <Text size="xs" fw={500}>
                  {note.author.display_name || note.author.username}
                </Text>
                <Text size="xs" c="dimmed">
                  {dayjs(note.created_at).format("MMM D, YYYY h:mm A")}
                </Text>
              </Group>
              <Text size="xs">{note.body}</Text>
            </Stack>
          ))}
          {truncated ? (
            <Text size="xs" c="dimmed">
              Showing the {notes.length} most recent notes.
            </Text>
          ) : null}
        </Stack>
      )}
    </Stack>
  );
}
