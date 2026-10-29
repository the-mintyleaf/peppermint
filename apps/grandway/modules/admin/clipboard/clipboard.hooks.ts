"use client";

import { useCallback } from "react";
import {
  keepPreviousData,
  notifications,
  useMutation,
  useQuery,
  useQueryClient,
} from "@peppermint/ui";
import { useAppMutation } from "@peppermint/admin";
import {
  createClipboardCategory,
  createClipboardEntry,
  deleteClipboardCategory,
  deleteClipboardEntry,
  listClipboardCategories,
  listClipboardEntries,
  markClipboardEntryUsed,
  renameClipboardCategory,
  updateClipboardEntry,
} from "./clipboard.api";
import { CLIPBOARD_SUGGESTION_PAGE_SIZE } from "./clipboard.constants";
import { getClipboardErrorMessage } from "./clipboard.errors";
import {
  clipboardCategoryKeys,
  clipboardEntryKeys,
} from "./clipboard.queryKeys";
import type {
  ClipboardCategory,
  ClipboardDeleteResult,
  ClipboardEntry,
  ClipboardEntryCreate,
  ClipboardEntryUpdate,
  ClipboardListFilters,
} from "./clipboard.types";

/**
 * The drawer's list. Previous data is kept while a new search/filter loads so typing
 * doesn't flash the whole list to a spinner on every keystroke.
 */
export function useClipboardEntries(filters: ClipboardListFilters) {
  return useQuery({
    queryKey: clipboardEntryKeys.list(filters),
    queryFn: () => listClipboardEntries(filters),
    placeholderData: keepPreviousData,
  });
}

const TOTAL_FILTERS: ClipboardListFilters = { page: 1, page_size: 1 };

/**
 * How many snippets the clipboard holds in total, ignoring any search/filter — the
 * 200-entry cap is on the whole clipboard, which a filtered list's `meta.total` is not.
 * Reads one row of the unfiltered list; refreshed with every list invalidation.
 */
export function useClipboardTotal(enabled = true) {
  return useQuery({
    queryKey: clipboardEntryKeys.list(TOTAL_FILTERS),
    queryFn: () => listClipboardEntries(TOTAL_FILTERS),
    select: (result) => result.meta.total,
    enabled,
  });
}

/** Bare array, at most 50 — one request, no pager. */
export function useClipboardCategories(enabled = true) {
  return useQuery({
    queryKey: clipboardCategoryKeys.all,
    queryFn: listClipboardCategories,
    enabled,
  });
}

/**
 * Suggestions for ONE document field. `enabled` is the "on demand" switch — flip it on
 * when the field gains focus or the suggest control opens, never on every keystroke
 * (calls count against the 1,000/hour rate). One page of a handful of rows: the order
 * moves with every `use`, so paging a picker would shuffle under the user.
 */
export function useClipboardSuggestions(fieldKey: string, enabled: boolean) {
  const filters: ClipboardListFilters = {
    field_key: fieldKey,
    page: 1,
    page_size: CLIPBOARD_SUGGESTION_PAGE_SIZE,
  };
  return useQuery({
    queryKey: clipboardEntryKeys.list(filters),
    queryFn: () => listClipboardEntries(filters),
    enabled: enabled && fieldKey.length > 0,
  });
}

const ENTRY_INVALIDATION = () => [
  clipboardEntryKeys.lists(),
  clipboardCategoryKeys.all,
];

/** `POST /me/clipboard/` — `AUTH_CLIPBOARD_LIMIT_REACHED` / `…_CATEGORY_INVALID` get specific copy. */
export function useCreateClipboardEntry() {
  return useAppMutation<ClipboardEntry, ClipboardEntryCreate>({
    mutationFn: createClipboardEntry,
    successMessage: "Snippet saved to your clipboard.",
    errorTitle: "Couldn't save snippet",
    getErrorMessage: getClipboardErrorMessage,
    invalidateKeys: ENTRY_INVALIDATION(),
  });
}

export interface UpdateClipboardEntryVariables {
  id: string;
  body: ClipboardEntryUpdate;
}

/** `PATCH /me/clipboard/<id>/`. */
export function useUpdateClipboardEntry() {
  return useAppMutation<ClipboardEntry, UpdateClipboardEntryVariables>({
    mutationFn: ({ id, body }) => updateClipboardEntry(id, body),
    successMessage: "Snippet updated.",
    errorTitle: "Couldn't update snippet",
    getErrorMessage: getClipboardErrorMessage,
    invalidateKeys: ENTRY_INVALIDATION(),
  });
}

/** `DELETE /me/clipboard/<id>/` — permanent, no restore. */
export function useDeleteClipboardEntry() {
  return useAppMutation<void, string>({
    mutationFn: deleteClipboardEntry,
    successMessage: "Snippet deleted.",
    errorTitle: "Couldn't delete snippet",
    getErrorMessage: getClipboardErrorMessage,
    invalidateKeys: ENTRY_INVALIDATION(),
  });
}

/**
 * `POST /me/clipboard/<id>/use/` — a ranking signal only. Deliberately silent on both
 * outcomes: the contract says failing to call it "only affects ordering", so a toast
 * over a successful copy/insert would be noise. Refreshes the lists so the used entry
 * moves up.
 */
export function useMarkClipboardEntryUsed() {
  const queryClient = useQueryClient();
  return useMutation<ClipboardEntry, unknown, string>({
    mutationFn: markClipboardEntryUsed,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: clipboardEntryKeys.lists(),
      });
    },
  });
}

/**
 * Write the snippet to the system clipboard, THEN (only on success) bump its ranking.
 * Resolves `true` when the text reached the clipboard. A refused write
 * (permissions / insecure context) is reported, never swallowed.
 */
export function useCopyClipboardEntry() {
  const { mutate: markUsed } = useMarkClipboardEntryUsed();

  return useCallback(
    async (entry: ClipboardEntry): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(entry.text);
      } catch {
        notifications.show({
          color: "red",
          title: "Couldn't copy",
          message:
            "Your browser blocked access to the clipboard. Select the text and copy it manually.",
        });
        return false;
      }
      notifications.show({
        color: "green",
        title: "Copied",
        message: `"${entry.label}" is on your clipboard.`,
      });
      markUsed(entry.id);
      return true;
    },
    [markUsed],
  );
}

/** `POST /me/clipboard/categories/`. */
export function useCreateClipboardCategory() {
  return useAppMutation<ClipboardCategory, string>({
    mutationFn: (name) => createClipboardCategory({ name }),
    successMessage: "Category created.",
    errorTitle: "Couldn't create category",
    getErrorMessage: getClipboardErrorMessage,
    invalidateKeys: [clipboardCategoryKeys.all],
  });
}

export interface RenameClipboardCategoryVariables {
  id: string;
  name: string;
}

/** `PATCH /me/clipboard/categories/<id>/` — entries embed the name, so lists refresh too. */
export function useRenameClipboardCategory() {
  return useAppMutation<ClipboardCategory, RenameClipboardCategoryVariables>({
    mutationFn: ({ id, name }) => renameClipboardCategory(id, { name }),
    successMessage: "Category renamed.",
    errorTitle: "Couldn't rename category",
    getErrorMessage: getClipboardErrorMessage,
    invalidateKeys: ENTRY_INVALIDATION(),
  });
}

/** `DELETE /me/clipboard/categories/<id>/` — entries are kept and become uncategorised. */
export function useDeleteClipboardCategory() {
  return useAppMutation<ClipboardDeleteResult, string>({
    mutationFn: deleteClipboardCategory,
    successMessage: (result) => {
      const kept = result.entries_uncategorized ?? 0;
      return kept === 0
        ? "Category deleted."
        : `Category deleted. ${kept} snippet${kept === 1 ? " is" : "s are"} now uncategorised.`;
    },
    errorTitle: "Couldn't delete category",
    getErrorMessage: getClipboardErrorMessage,
    invalidateKeys: ENTRY_INVALIDATION(),
  });
}
