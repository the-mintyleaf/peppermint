import { createResourceApi } from "@peppermint/admin";
import type { QueryParams, ResourceListResponse } from "@peppermint/admin";
import api from "@/lib/api";
import type {
  Client,
  ClientDetail,
  ClientRow,
  CreateClientPayload,
  HistoryEntry,
  RetireClientPayload,
  UpdateClientPayload,
} from "./clients.types";

const clientResource = createResourceApi<
  ClientDetail,
  CreateClientPayload,
  UpdateClientPayload
>({
  client: api,
  basePath: "/api/v1/clients",
});

/** `GET /api/v1/clients/<id>/` — full detail shape. */
export const getClient = clientResource.get;

/** `POST /api/v1/clients/` — 201; `status` isn't part of the payload, so it can never be sent. */
export const createClient = clientResource.create;

/** `PATCH /api/v1/clients/<id>/` — only changed fields; `status`/retirement fields are rejected. */
export const updateClient = clientResource.update;

/**
 * `POST /api/v1/clients/<id>/retire/` — Admin only, mandatory non-empty reason.
 * This is what a "delete" button becomes here — the record is kept forever and
 * stays in unfiltered list results (§3/§7).
 */
export function retireClient(id: string, body: RetireClientPayload) {
  return clientResource.action<ClientDetail>(id, "retire", body);
}

/** `POST /api/v1/clients/<id>/restore/` — Admin only, empty body; requires an `inactive` client (§7). */
export function restoreClient(id: string) {
  return clientResource.action<ClientDetail>(id, "restore");
}

/**
 * Widen a trimmed list row to the shell's `ClientRow`. Detail-only fields get
 * safe empty defaults — nothing reads them until `onEditTrigger` re-fetches the
 * real detail, or the detail drawer runs its own fetch. `primary_contact_number`
 * (list-only) is preserved for the directory's phone column.
 */
function toClientRow(client: Client): ClientRow {
  return {
    ...client,
    spokesperson_designation: "",
    website: "",
    address: "",
    contact_numbers: [],
    status_note: "",
    retired_at: null,
    retired_at_bs: null,
    retired_by_username: null,
    notes: "",
    created_by_username: "",
    created_at: "",
  };
}

/**
 * `GET /api/v1/clients/` — hand-rolled (not `clientResource.list`) because the
 * list envelope returns the trimmed `Client` shape, which is widened to
 * `ClientRow` here. Ordering is server-fixed (alphabetical by `name`) so no
 * `sort`/`ordering` param is sent. Filters: `status`, `search`, `fiscal_year`.
 */
export async function fetchClients(
  params?: QueryParams,
): Promise<ResourceListResponse<ClientRow>> {
  const { data } = await api.get<{
    data: Client[];
    meta: { count: number } & Record<string, unknown>;
  }>("/api/v1/clients/", {
    params: params
      ? {
          ...params.filters,
          page: params.page,
          page_size: params.pageSize,
          ...(params.search ? { search: params.search } : {}),
        }
      : undefined,
  });
  return {
    data: data.data.map(toClientRow),
    meta: { ...data.meta, total: data.meta.count },
  };
}

/**
 * `GET /api/v1/clients/<id>/history/` — nested under the client id, so it
 * doesn't fit `createResourceApi`'s single-basePath shape. Paginated,
 * newest-first, backed by the central audit log; remaps `meta.count → total`.
 * Requests a generous single page rather than the backend's default of 20 (the
 * drawer shows recent activity, not a full paginated browser).
 */
export async function fetchClientHistory(
  id: string,
  pageSize = 100,
): Promise<ResourceListResponse<HistoryEntry>> {
  const { data } = await api.get<{
    data: HistoryEntry[];
    meta: { count: number } & Record<string, unknown>;
  }>(`/api/v1/clients/${id}/history/`, {
    params: { page: 1, page_size: pageSize },
  });
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}
