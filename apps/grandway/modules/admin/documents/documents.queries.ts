import type { QueryParams } from "@peppermint/admin";
import { documentsApi } from "@/modules/documents";
import type {
  DocumentFamily,
  DocumentListItem,
  DocumentStatus,
  DocumentWorkspaceSummary,
} from "@/modules/documents";

/** Server-query result shape the `DataTableShell` reads (`dataKey`/`paginationKey`). */
export interface PagedResult<T> {
  data: T[];
  meta: { total: number } & Record<string, unknown>;
}

/** `GET /api/v1/documents/workspaces/` — one row per applicant with live documents. */
export async function fetchWorkspaces(
  params?: QueryParams,
): Promise<PagedResult<DocumentWorkspaceSummary>> {
  const res = await documentsApi.listWorkspaces(
    params?.page ?? 1,
    params?.pageSize ?? 20,
  );
  return { data: res.data, meta: { total: res.total } };
}

/** `GET /api/v1/documents/` — the all-documents worklist (filters + standalone toggle). */
export async function fetchDocuments(
  params?: QueryParams,
): Promise<PagedResult<DocumentListItem>> {
  const filters = params?.filters ?? {};
  const standaloneRaw = filters.standalone;
  const res = await documentsApi.list({
    page: params?.page,
    pageSize: params?.pageSize,
    search: params?.search,
    status: (filters.status as DocumentStatus | undefined) || undefined,
    family: (filters.family as DocumentFamily | undefined) || undefined,
    templateKey: (filters.template_key as string | undefined) || undefined,
    standalone:
      standaloneRaw === "true"
        ? true
        : standaloneRaw === "false"
          ? false
          : undefined,
  });
  return { data: res.data, meta: { total: res.total } };
}

/**
 * The editor route for a document row: an applicant-owned document opens its applicant
 * workspace; a standalone document opens keyed by its own id.
 */
export function documentEditorHref(row: {
  applicantId: string | null;
  id: string;
}): string {
  return row.applicantId
    ? `/documents/workspace/${row.applicantId}`
    : `/documents/standalone/${row.id}`;
}

/** The applicant-workspace editor route. */
export function workspaceEditorHref(applicantId: string): string {
  return `/documents/workspace/${applicantId}`;
}
