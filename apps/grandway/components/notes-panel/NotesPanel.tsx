"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  Alert,
  Badge,
  Center,
  Group,
  Loader,
  Pagination,
  Select,
  Stack,
  Tabs,
  Text,
} from "@peppermint/ui";
import { openReasonConfirmModal } from "@peppermint/admin";
import { LockSimpleIcon } from "@phosphor-icons/react/dist/csr/LockSimple";
import { NoteBlankIcon } from "@phosphor-icons/react/dist/csr/NoteBlank";

import { QueryErrorState } from "@/components/QueryErrorState";

import { NoteCard } from "./components/NoteCard";
import { NoteComposer } from "./components/NoteComposer";
import {
  useCreateNote,
  useDeleteNote,
  useNotesList,
  useUpdateNote,
} from "./NotesPanel.hooks";
import {
  NOTE_ORDERING_OPTIONS,
  NOTE_TABS,
  canModifyNote,
  changedNoteFields,
  getNoteErrorMessage,
  toApiNotedAt,
} from "./NotesPanel.utils";
import type {
  NoteFormValues,
  NoteOrdering,
  NotesPanelNote,
  NotesPanelProps,
  NoteTabCategory,
} from "./NotesPanel.types";

const EMPTY_COPY: Record<NoteTabCategory, string> = {
  general: "No general notes yet.",
  visit: "No visits logged yet. Log one when someone comes to the office.",
};

/**
 * The notes surface for one record (a lead drawer or an applicant file).
 * Domain-agnostic: every request goes through `adapter`, which the host
 * module builds from its own `api.ts`.
 *
 * Output-contract states: **loading** centred loader (first load of a tab) and
 * a dimmed list while a new page loads · **empty** per-tab copy ·
 * **request-failed** `QueryErrorState` with Retry · **pending mutation** the
 * form's loading button / the confirm modal's spinner · **permission-denied**
 * edit/delete only rendered for the author or an Admin; a 403 still toasts ·
 * **read-only / archived / deleted / converted** `readOnlyReason` swaps the
 * composer for an explanation and drops every lever · **conflicting edits** a
 * 404 (note gone) or 409 (record frozen since load) refetches the list and
 * calls `onWriteConflict` · **unsaved changes** the composer and editor ask
 * before discarding text.
 */
export function NotesPanel<TNote extends NotesPanelNote>({
  adapter,
  currentUserId,
  isAdmin,
  readOnlyReason,
  subjectLabel = "record",
  pageSize = 20,
  onWriteConflict,
  popoverZIndex,
}: NotesPanelProps<TNote>) {
  const [tab, setTab] = useState<NoteTabCategory>("general");
  const [ordering, setOrdering] = useState<NoteOrdering>("-noted_at");
  const [pages, setPages] = useState<Record<NoteTabCategory, number>>({
    general: 1,
    visit: 1,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const page = pages[tab];
  const query = useNotesList(adapter, {
    category: tab,
    ordering,
    page,
    pageSize,
  });
  const mutationContext = { adapter, onWriteConflict };
  const createNote = useCreateNote(mutationContext);
  const updateNote = useUpdateNote(mutationContext);
  const deleteNote = useDeleteNote(mutationContext);

  const result = query.data;
  // A placeholder carried over from the other tab still supplies the badge
  // counts, but its notes belong to that tab and must not render here.
  const sameTab = result !== undefined && result.category === tab;
  const notes: NotesPanelNote[] = result && sameTab ? result.data : [];
  const counts = result?.counts;
  const pageCount = result && sameTab ? Math.ceil(result.total / pageSize) : 0;
  const readOnly = Boolean(readOnlyReason);
  const bodyLabel = `Write a note about this ${subjectLabel}`;

  const setPage = (next: number) =>
    setPages((current) => ({ ...current, [tab]: next }));

  const selectTab = (value: string | null) => {
    if (value !== "general" && value !== "visit") return;
    setTab(value);
    setEditingId(null);
  };

  const changeOrdering = (value: string | null) => {
    if (!value) return;
    setOrdering(value as NoteOrdering);
    setPages({ general: 1, visit: 1 });
  };

  const handleCreate = async (values: NoteFormValues) => {
    await createNote.mutateAsync({
      category: tab,
      body: values.body.trim(),
      // Omitted = "now", stamped by the server at save time.
      ...(values.noted_at ? { noted_at: toApiNotedAt(values.noted_at) } : {}),
    });
    setPage(1);
  };

  const handleSave = async (note: NotesPanelNote, values: NoteFormValues) => {
    const payload = changedNoteFields(note, values);
    if (payload) await updateNote.mutateAsync({ noteId: note.id, payload });
    setEditingId(null);
  };

  const handleDelete = (note: NotesPanelNote) => {
    const lastOnPage = notes.length === 1 && page > 1;
    openReasonConfirmModal({
      title: "Delete note",
      parentLabel: "Notes",
      hideReason: true,
      tone: "danger",
      alertTitle: "This removes the note for everyone",
      description:
        "It can't be restored from here. The deletion stays in this record's history.",
      confirmLabel: "Delete note",
      confirmColor: "red",
      onConfirm: async () => {
        // Step back first: the delete invalidates the list, and refetching a
        // page that no longer exists would flash an error.
        if (lastOnPage) setPage(page - 1);
        await deleteNote.mutateAsync(note.id);
        if (editingId === note.id) setEditingId(null);
      },
    });
  };

  const renderBody = (): ReactNode => {
    if (query.isError && !sameTab) {
      return (
        <QueryErrorState
          message={getNoteErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      );
    }
    if (!sameTab) {
      return (
        <Center py="xl">
          <Loader size="sm" aria-label="Loading notes" />
        </Center>
      );
    }
    if (notes.length === 0) {
      return (
        <Stack align="center" gap="xs" py="xl">
          <NoteBlankIcon size={28} aria-hidden />
          <Text size="sm" c="dimmed" ta="center">
            {EMPTY_COPY[tab]}
          </Text>
        </Stack>
      );
    }
    const isPaging = query.isPlaceholderData;
    return (
      <Stack gap="sm">
        {query.isError ? (
          <QueryErrorState
            message={getNoteErrorMessage(query.error)}
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : null}
        <Stack
          gap="sm"
          aria-busy={isPaging}
          style={{ opacity: isPaging ? 0.6 : 1 }}
        >
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              canModify={
                !readOnly && canModifyNote(note, currentUserId, isAdmin)
              }
              isEditing={editingId === note.id}
              onEdit={(target) => setEditingId(target.id)}
              onCancelEdit={() => setEditingId(null)}
              onSave={handleSave}
              onDelete={handleDelete}
              bodyLabel="Edit the note"
              popoverZIndex={popoverZIndex}
            />
          ))}
        </Stack>
        {pageCount > 1 ? (
          <Group justify="center">
            <Pagination
              size="sm"
              total={pageCount}
              value={page}
              onChange={setPage}
            />
          </Group>
        ) : null}
      </Stack>
    );
  };

  const body = renderBody();

  return (
    <Stack gap="md">
      {readOnlyReason ? (
        <Alert
          color="gray"
          variant="light"
          icon={<LockSimpleIcon size={18} aria-hidden />}
          title="Notes are read-only"
        >
          <Text size="sm">{readOnlyReason}</Text>
        </Alert>
      ) : null}

      <Tabs
        value={tab}
        onChange={selectTab}
        keepMounted={false}
        variant="pills"
        radius="xl"
      >
        <Stack gap="sm">
          <Group justify="space-between" gap="xs" wrap="wrap">
            <Tabs.List>
              {NOTE_TABS.map((option) => (
                <Tabs.Tab
                  key={option.value}
                  value={option.value}
                  rightSection={
                    counts ? (
                      <Badge size="xs" variant="light">
                        {counts[option.value] ?? 0}
                      </Badge>
                    ) : null
                  }
                >
                  {option.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
            <Select
              size="xs"
              w={160}
              aria-label="Sort notes"
              data={NOTE_ORDERING_OPTIONS}
              value={ordering}
              onChange={changeOrdering}
              allowDeselect={false}
              comboboxProps={
                popoverZIndex !== undefined
                  ? { zIndex: popoverZIndex }
                  : undefined
              }
            />
          </Group>

          {readOnly ? null : (
            <NoteComposer
              category={tab}
              bodyLabel={bodyLabel}
              onCreate={handleCreate}
              popoverZIndex={popoverZIndex}
            />
          )}

          {NOTE_TABS.map((option) => (
            <Tabs.Panel key={option.value} value={option.value}>
              {body}
            </Tabs.Panel>
          ))}
        </Stack>
      </Tabs>
    </Stack>
  );
}
