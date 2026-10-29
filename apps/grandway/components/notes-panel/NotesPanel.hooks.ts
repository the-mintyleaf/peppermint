"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@peppermint/ui";
import type { QueryKey } from "@peppermint/ui";
import { useAppMutation } from "@peppermint/admin";

import { getErrorStatus, getNoteErrorMessage } from "./NotesPanel.utils";
import type {
  NoteCreatePayload,
  NotesAdapter,
  NotesListParams,
  NotesPanelNote,
  NoteUpdatePayload,
} from "./NotesPanel.types";

export function notesListKey(base: QueryKey, params: NotesListParams) {
  return [...base, "list", params] as const;
}

/**
 * One request per (tab, ordering, page). `category` rides along on the result
 * so the panel can tell a placeholder carried over from the OTHER tab (kept
 * for its `counts`, which feed both badges) from this tab's own stale page.
 */
export function useNotesList<TNote extends NotesPanelNote>(
  adapter: NotesAdapter<TNote>,
  params: NotesListParams,
) {
  return useQuery({
    queryKey: notesListKey(adapter.queryKey, params),
    queryFn: async () => ({
      ...(await adapter.list(params)),
      category: params.category,
    }),
    placeholderData: keepPreviousData,
  });
}

interface NoteMutationContext<TNote extends NotesPanelNote> {
  adapter: NotesAdapter<TNote>;
  onWriteConflict?: (error: unknown) => void;
}

/**
 * Shared write plumbing: invalidate the notes base (prefix match, so every
 * tab/page refetches) plus the host's extra keys on success; on a 404 (note
 * gone) or 409 (record converted/deleted/archived) the list is stale, so it
 * refetches too, and a 409 tells the host to refetch the record.
 */
function useNoteWriteOptions<TNote extends NotesPanelNote>({
  adapter,
  onWriteConflict,
}: NoteMutationContext<TNote>) {
  const queryClient = useQueryClient();
  return {
    invalidateKeys: [adapter.queryKey, ...(adapter.invalidateKeys ?? [])],
    getErrorMessage: getNoteErrorMessage,
    onError: (error: unknown) => {
      const status = getErrorStatus(error);
      if (status === 404 || status === 409) {
        void queryClient.invalidateQueries({ queryKey: adapter.queryKey });
      }
      if (status === 409) onWriteConflict?.(error);
    },
  };
}

export function useCreateNote<TNote extends NotesPanelNote>(
  context: NoteMutationContext<TNote>,
) {
  const shared = useNoteWriteOptions(context);
  return useAppMutation<TNote, NoteCreatePayload>({
    ...shared,
    mutationFn: (payload) => context.adapter.create(payload),
    successTitle: "Note added",
    successMessage: "The note is saved.",
    errorTitle: "Couldn't add note",
  });
}

export function useUpdateNote<TNote extends NotesPanelNote>(
  context: NoteMutationContext<TNote>,
) {
  const shared = useNoteWriteOptions(context);
  return useAppMutation<TNote, { noteId: string; payload: NoteUpdatePayload }>({
    ...shared,
    mutationFn: ({ noteId, payload }) =>
      context.adapter.update(noteId, payload),
    successTitle: "Note updated",
    successMessage: "Your changes are saved.",
    errorTitle: "Couldn't update note",
  });
}

export function useDeleteNote<TNote extends NotesPanelNote>(
  context: NoteMutationContext<TNote>,
) {
  const shared = useNoteWriteOptions(context);
  return useAppMutation<void, string>({
    ...shared,
    mutationFn: (noteId) => context.adapter.remove(noteId),
    successTitle: "Note deleted",
    successMessage: "The note was removed.",
    errorTitle: "Couldn't delete note",
  });
}
