"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Alert,
  Button,
  Group,
  Loader,
  Pagination,
  Select,
  Skeleton,
  Stack,
  Text,
  TextInput,
  modals,
  useDebouncedValue,
} from "@peppermint/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { QueryErrorState } from "@/components/QueryErrorState";
import {
  CATEGORY_FILTER_NONE,
  CLIPBOARD_CONFIRM_Z_INDEX,
  CLIPBOARD_ENTRY_LIMIT,
  CLIPBOARD_PAGE_SIZE,
  CLIPBOARD_SEARCH_MAX,
} from "../../clipboard.constants";
import {
  useClipboardEntries,
  useClipboardTotal,
  useCopyClipboardEntry,
  useDeleteClipboardEntry,
} from "../../clipboard.hooks";
import type {
  ClipboardEntry,
  ClipboardListFilters,
} from "../../clipboard.types";
import { ClipboardEntryRow } from "../ClipboardEntryRow";
import type {
  ClipboardBrowserProps,
  ClipboardCategoryFilter,
} from "./ClipboardBrowser.types";

const FILTER_ALL = "all";
const NEARLY_FULL_AT = CLIPBOARD_ENTRY_LIMIT - 20;

function toFilters(
  search: string,
  category: ClipboardCategoryFilter,
  page: number,
): ClipboardListFilters {
  return {
    page,
    page_size: CLIPBOARD_PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(category !== FILTER_ALL ? { category } : {}),
  };
}

/**
 * The drawer's list view: search, category filter, the entries (most-used first — the
 * API has no ordering parameter), and the capacity notice.
 *
 * States: loading → skeleton rows; request-failed → `QueryErrorState` + retry; empty
 * (nothing saved) → an invitation to save the first one; empty (filtered) → says so and
 * offers to clear; pending delete → the row's icon spins and the Copy button disables;
 * permission-denied N/A (owner-only for every authority); conflicting edits → a
 * stale-entry 404 toasts and the list refetches.
 */
export function ClipboardBrowser({
  categories,
  onNew,
  onEdit,
  onManageCategories,
  deletedCategoryId,
}: ClipboardBrowserProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search.trim(), 300);
  const [category, setCategory] = useState<ClipboardCategoryFilter>(FILTER_ALL);
  const [page, setPage] = useState(1);

  // A deleted category can't stay selected as a filter.
  const [handledDeletion, setHandledDeletion] = useState<string | null>(null);
  if (deletedCategoryId && deletedCategoryId !== handledDeletion) {
    setHandledDeletion(deletedCategoryId);
    if (category === deletedCategoryId) {
      setCategory(FILTER_ALL);
      setPage(1);
    }
  }

  const filters = toFilters(debouncedSearch, category, page);
  const entries = useClipboardEntries(filters);
  const total = useClipboardTotal().data ?? 0;
  const copyEntry = useCopyClipboardEntry();
  const deleteEntry = useDeleteClipboardEntry();

  const isFiltered = debouncedSearch !== "" || category !== FILTER_ALL;
  const rows = entries.data?.data ?? [];
  const matching = entries.data?.meta.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(matching / CLIPBOARD_PAGE_SIZE));
  const atLimit = total >= CLIPBOARD_ENTRY_LIMIT;

  const categoryOptions = useMemo(
    () => [
      { value: FILTER_ALL, label: "All categories" },
      { value: CATEGORY_FILTER_NONE, label: "Uncategorised" },
      ...categories.map((c) => ({
        value: c.id,
        label: `${c.name} (${c.entry_count})`,
      })),
    ],
    [categories],
  );

  const resetFilters = () => {
    setSearch("");
    setCategory(FILTER_ALL);
    setPage(1);
  };

  const confirmDelete = (entry: ClipboardEntry) =>
    modals.openConfirmModal({
      title: `Delete “${entry.label}”?`,
      children:
        "This snippet is removed permanently and can't be restored. Text you've already copied or pasted is not affected.",
      labels: { confirm: "Delete snippet", cancel: "Keep it" },
      confirmProps: { color: "red" },
      styles: { inner: { padding: "var(--mantine-spacing-md)" } },
      zIndex: CLIPBOARD_CONFIRM_Z_INDEX,
      onConfirm: () => deleteEntry.mutate(entry.id),
    });

  // The page can fall off the end after deletes; step back rather than show nothing.
  if (entries.data && page > pageCount) setPage(pageCount);

  function renderList(): ReactNode {
    if (entries.isError && !entries.data) {
      return (
        <QueryErrorState
          message="Couldn't load your clipboard."
          onRetry={() => entries.refetch()}
          isRetrying={entries.isRefetching}
        />
      );
    }
    if (entries.isPending) {
      return (
        <Stack gap="xs" aria-busy="true" aria-label="Loading snippets">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={84} radius="md" />
          ))}
        </Stack>
      );
    }
    if (rows.length === 0) {
      return (
        <Stack gap="xs" align="center" py="xl">
          <Text size="sm" fw={600}>
            {isFiltered ? "No snippets match" : "Nothing saved yet"}
          </Text>
          <Text size="sm" c="dimmed" ta="center" maw={320}>
            {isFiltered
              ? "Try a different search or category."
              : "Save the text you type often — a ward office name, a bank address — and copy it in one click."}
          </Text>
          {isFiltered ? (
            <Button variant="light" size="compact-sm" onClick={resetFilters}>
              Clear search and filter
            </Button>
          ) : null}
        </Stack>
      );
    }
    return (
      <Stack gap="xs">
        <Text size="xs" c="dimmed" aria-live="polite">
          {isFiltered
            ? `${matching} match${matching === 1 ? "" : "es"} of ${total}`
            : `${total} of ${CLIPBOARD_ENTRY_LIMIT} snippets, most used first`}
        </Text>
        {rows.map((entry) => (
          <ClipboardEntryRow
            key={entry.id}
            entry={entry}
            onCopy={copyEntry}
            onEdit={onEdit}
            onDelete={confirmDelete}
            isDeleting={
              deleteEntry.isPending && deleteEntry.variables === entry.id
            }
          />
        ))}
        {pageCount > 1 ? (
          <Group justify="center" pt="xs">
            <Pagination
              total={pageCount}
              value={page}
              onChange={setPage}
              size="sm"
            />
          </Group>
        ) : null}
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Group gap="xs">
        <Button
          leftSection={<PlusIcon size={14} aria-hidden />}
          onClick={onNew}
          disabled={atLimit}
        >
          Save snippet
        </Button>
        <Button
          variant="default"
          leftSection={<TagIcon size={14} aria-hidden />}
          onClick={onManageCategories}
        >
          Manage categories
        </Button>
      </Group>

      {atLimit || total >= NEARLY_FULL_AT ? (
        <Alert
          color={atLimit ? "red" : "yellow"}
          icon={<WarningIcon size={16} aria-hidden />}
          title={
            atLimit
              ? "Your clipboard is full"
              : `Nearly full — ${total} of ${CLIPBOARD_ENTRY_LIMIT} snippets`
          }
        >
          <Stack gap="xs" align="flex-start">
            <Text size="sm">
              {atLimit
                ? `A clipboard holds at most ${CLIPBOARD_ENTRY_LIMIT} snippets. Delete some you no longer use to save new ones.`
                : "Delete a few you no longer use so there's room to save more."}
            </Text>
            <Button
              size="compact-sm"
              variant="light"
              color={atLimit ? "red" : "yellow"}
              onClick={() => {
                // Most-used first, so the least-used snippets are on the last page.
                setSearch("");
                setCategory(FILTER_ALL);
                setPage(Math.max(1, Math.ceil(total / CLIPBOARD_PAGE_SIZE)));
              }}
            >
              Review least-used snippets
            </Button>
          </Stack>
        </Alert>
      ) : null}

      <Stack gap="xs">
        <TextInput
          aria-label="Search snippets"
          placeholder="Search name, text or category"
          leftSection={<MagnifyingGlassIcon size={16} aria-hidden />}
          rightSection={entries.isFetching ? <Loader size={14} /> : null}
          maxLength={CLIPBOARD_SEARCH_MAX}
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            setPage(1);
          }}
        />
        <Select
          aria-label="Filter by category"
          data={categoryOptions}
          value={category}
          allowDeselect={false}
          onChange={(value) => {
            setCategory(value ?? FILTER_ALL);
            setPage(1);
          }}
          comboboxProps={{ zIndex: CLIPBOARD_CONFIRM_Z_INDEX }}
        />
      </Stack>

      {renderList()}
    </Stack>
  );
}
