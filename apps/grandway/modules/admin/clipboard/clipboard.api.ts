import { createResourceApi } from "@peppermint/admin";
import type { QueryParams } from "@peppermint/admin";
import api from "@/lib/api";
import type {
  ClipboardCategory,
  ClipboardCategoryInput,
  ClipboardDeleteResult,
  ClipboardEntry,
  ClipboardEntryCreate,
  ClipboardEntryUpdate,
  ClipboardListFilters,
} from "./clipboard.types";

const CLIPBOARD = "/api/v1/auth/me/clipboard";

/**
 * The list has no client-choosable ordering (most-used first, always) and `search` is a
 * plain filter, so the default `ordering` mapping is replaced: filters, `search`, `page`
 * and `page_size` go straight through under their server names.
 */
function toClipboardServerParams(params: QueryParams): Record<string, unknown> {
  return {
    ...params.filters,
    page: params.page,
    page_size: params.pageSize,
    ...(params.search ? { search: params.search } : {}),
  };
}

const entryResource = createResourceApi<
  ClipboardEntry,
  ClipboardEntryCreate,
  ClipboardEntryUpdate
>({
  client: api,
  basePath: CLIPBOARD,
  toServerParams: toClipboardServerParams,
});

/** Filters → the shell's `QueryParams` (a safe widen: every field is a string/number). */
function toQueryParams(filters: ClipboardListFilters): QueryParams {
  const { page, page_size, search, ...rest } = filters;
  return {
    page: page ?? 1,
    pageSize: page_size ?? 20,
    search: search ?? "",
    sort: [],
    filters: rest as Record<string, unknown>,
  };
}

/** `GET /me/clipboard/` — own entries only (any authority), paginated, most-used first. */
export function listClipboardEntries(filters: ClipboardListFilters) {
  return entryResource.list(toQueryParams(filters));
}

/** `POST /me/clipboard/` → 201 ClipboardEntry. */
export const createClipboardEntry = entryResource.create;

/** `PATCH /me/clipboard/<id>/` — any subset; there is no single-entry GET. */
export const updateClipboardEntry = entryResource.update;

/** `DELETE /me/clipboard/<id>/` — permanent; the `{ deleted: true }` body is not needed. */
export const deleteClipboardEntry = entryResource.remove;

/**
 * `POST /me/clipboard/<id>/use/` — bodyless ranking signal. Called after the copy
 * succeeds; failing only affects ordering.
 */
export async function markClipboardEntryUsed(
  id: string,
): Promise<ClipboardEntry> {
  const { data } = await api.post<ClipboardEntry>(`${CLIPBOARD}/${id}/use/`);
  return data;
}

/** `GET /me/clipboard/categories/` — a bare array (≤50), ordered by name. */
export async function listClipboardCategories(): Promise<ClipboardCategory[]> {
  const { data } = await api.get<ClipboardCategory[]>(
    `${CLIPBOARD}/categories/`,
  );
  return data;
}

/** `POST /me/clipboard/categories/` → 201 ClipboardCategory. */
export async function createClipboardCategory(
  body: ClipboardCategoryInput,
): Promise<ClipboardCategory> {
  const { data } = await api.post<ClipboardCategory>(
    `${CLIPBOARD}/categories/`,
    body,
  );
  return data;
}

/** `PATCH /me/clipboard/categories/<id>/` — rename takes the one required `name`. */
export async function renameClipboardCategory(
  id: string,
  body: ClipboardCategoryInput,
): Promise<ClipboardCategory> {
  const { data } = await api.patch<ClipboardCategory>(
    `${CLIPBOARD}/categories/${id}/`,
    body,
  );
  return data;
}

/** `DELETE /me/clipboard/categories/<id>/` → `{ deleted, entries_uncategorized }`. Entries are kept. */
export async function deleteClipboardCategory(
  id: string,
): Promise<ClipboardDeleteResult> {
  const { data } = await api.delete<ClipboardDeleteResult>(
    `${CLIPBOARD}/categories/${id}/`,
  );
  return data;
}
