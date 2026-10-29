"use client";

import { Badge, Group, Paper, Stack, Text } from "@peppermint/ui";
import { RowActionsMenu } from "@peppermint/admin";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";

import {
  formatNoteTime,
  toPickerValue,
  userLabel,
} from "../../NotesPanel.utils";
import type { NotesPanelNote } from "../../NotesPanel.types";
import { NoteForm } from "../NoteForm";
import type { NoteCardProps } from "./NoteCard.types";

/**
 * One note as its own card — a discrete thing someone wrote, not a log row.
 * The text leads; who and when follow as one quiet line, because attribution
 * only matters once you've read the note. Provenance markers (backdated,
 * edited, carried over from the lead) sit in that same footer as facts in
 * words — never colour alone — and the only levers (edit/delete) live behind
 * the card's menu, apart from the facts.
 */
export function NoteCard({
  note,
  canModify,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  bodyLabel,
  popoverZIndex,
}: NoteCardProps) {
  if (isEditing) {
    return (
      <NoteForm
        mode="edit"
        initialValues={{
          body: note.body,
          noted_at: toPickerValue(note.noted_at),
          category: note.category,
        }}
        submitLabel="Save changes"
        bodyLabel={bodyLabel}
        showCategory
        onSubmit={(values) => onSave(note, values)}
        onCancel={onCancelEdit}
        popoverZIndex={popoverZIndex}
      />
    );
  }

  const bsDate = note.noted_at_bs?.display;

  return (
    <Paper withBorder radius="md" p="sm" component="article">
      <Stack gap={6}>
        <Group
          justify="space-between"
          align="flex-start"
          wrap="nowrap"
          gap="xs"
        >
          <Text size="sm" style={{ whiteSpace: "pre-wrap", flex: 1 }}>
            {note.body}
          </Text>
          {canModify ? (
            <RowActionsMenu<NotesPanelNote>
              record={note}
              aria-label="Note actions"
              actions={[
                {
                  label: "Edit",
                  icon: <PencilSimpleIcon size={14} aria-hidden />,
                  onClick: onEdit,
                },
                {
                  label: "Delete",
                  icon: <TrashIcon size={14} aria-hidden />,
                  color: "red",
                  dividerBefore: true,
                  onClick: onDelete,
                },
              ]}
            />
          ) : null}
        </Group>

        <Text size="xs" c="dimmed">
          <Text span size="xs" fw={600} c="var(--mantine-color-text)">
            {userLabel(note.author)}
          </Text>{" "}
          ·{" "}
          <time dateTime={note.noted_at}>{formatNoteTime(note.noted_at)}</time>
          {bsDate ? ` · ${bsDate} BS` : null}
        </Text>

        {note.is_backdated || note.source_lead_id || note.updated_by ? (
          <Group gap={6} wrap="wrap">
            {note.source_lead_id ? (
              <Badge size="xs" variant="light" color="blue" radius="sm">
                From lead
              </Badge>
            ) : null}
            {note.is_backdated ? (
              <>
                <Badge size="xs" variant="light" color="gray" radius="sm">
                  Backdated
                </Badge>
                <Text size="xs" c="dimmed">
                  written{" "}
                  <time dateTime={note.created_at}>
                    {formatNoteTime(note.created_at)}
                  </time>
                </Text>
              </>
            ) : null}
            {note.updated_by ? (
              <Text size="xs" c="dimmed">
                {note.is_backdated || note.source_lead_id ? "· " : null}
                Edited by {userLabel(note.updated_by)} ·{" "}
                <time dateTime={note.updated_at}>
                  {formatNoteTime(note.updated_at)}
                </time>
              </Text>
            ) : null}
          </Group>
        ) : null}
      </Stack>
    </Paper>
  );
}
