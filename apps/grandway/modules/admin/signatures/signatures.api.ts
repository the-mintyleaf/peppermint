import { createResourceApi } from "@peppermint/admin";
import type { QueryParams, ResourceListResponse } from "@peppermint/admin";
import api from "@/lib/api";
import type {
  Signatory,
  SignatoryCreatePayload,
  SignatoryListFilters,
  SignatoryStatusPayload,
  SignatoryUpdatePayload,
} from "./signatures.types";

const SIGNATORIES = "/api/v1/document-templates/signatories";

/**
 * **Ordering is fixed server-side and not client-controllable** — there is no
 * `sort`/`ordering` parameter, and rows always arrive by `name` alphabetically
 * (§3). The default `toServerParams` would append `ordering`, which this API
 * would silently ignore; dropping it keeps the request honest about what the
 * server will actually do. Every filter field name already matches its server
 * param 1:1.
 */
function toSignatoryServerParams(params: QueryParams): Record<string, unknown> {
  return {
    ...params.filters,
    page: params.page,
    page_size: params.pageSize,
    ...(params.search ? { search: params.search } : {}),
  };
}

/**
 * `TCreate`/`TUpdate` are the narrow payload types rather than
 * `Partial<Signatory>`: the default generics would let `status`, `status_note`
 * or `signature_file` through the type system, and this API **rejects** all
 * three with 400 rather than ignoring them (§3/§8).
 *
 * `remove` is never re-exported below — **there is no `DELETE` on any route in
 * this module** (§3). The resource still carries the method structurally, so
 * this file is the boundary that keeps it unreachable.
 */
const signatoryResource = createResourceApi<
  Signatory,
  SignatoryCreatePayload,
  SignatoryUpdatePayload
>({
  client: api,
  basePath: SIGNATORIES,
  toServerParams: toSignatoryServerParams,
});

/**
 * `GET /signatories/` — paginated, `name`-ordered. **Omitting `status` returns
 * draft and retired rows too**, which is what a management screen wants; the
 * picker passes `?status=active` (§7).
 */
export const listSignatories = signatoryResource.list;

/** `GET /signatories/<id>/` — a retired signatory is still retrievable by id, forever (§7). */
export const getSignatory = signatoryResource.get;

/** `POST /signatories/` — **201**. Always lands `draft`; activation is a separate call (§7). */
export const createSignatory = signatoryResource.create;

/** `PATCH /signatories/<id>/` — name/title/role/url only. Anything else is rejected by name (§7). */
export const updateSignatory = signatoryResource.update;

/** `POST /signatories/<id>/status/` — **the activate / retire button.** Any transition, any order (§7). */
export function changeSignatoryStatus(
  id: string,
  body: SignatoryStatusPayload,
) {
  return signatoryResource.action<Signatory>(id, "status", body);
}

/**
 * The app's Axios instance sets a default `Content-Type: application/json`
 * (`@peppermint/api-client`), and Axios's request transformer stringifies
 * `FormData` whenever a JSON content type is already present — which would
 * silently break the upload. Passing `undefined` removes that default for this
 * call only, so the browser sets the multipart boundary itself. Same trick, and
 * the same reason, as `uploaded-files`' upload/replace.
 */
const MULTIPART_HEADERS = { "Content-Type": undefined };

/**
 * `POST /signatories/<id>/signature/` — **`multipart/form-data`, 201, and it
 * returns the updated `Signatory`, not the file** (§7), so the caller
 * re-renders the whole row from one response. Sending JSON here returns a bare
 * **415** with no error code in the body, before any handler runs.
 *
 * The `FormData` carries one `file` part and an optional `notes` field and
 * **nothing else** — no `category`, no `upload_source`, no owner; the service
 * fixes all three, because accepting any of them would let a caller store
 * something other than a signature under a signer's name.
 *
 * Uploading again **replaces**: a signature currently in force is versioned
 * (predecessor superseded), while one already archived or superseded starts a
 * fresh chain at version 1. Any status may receive a signature — `draft` and
 * `inactive` included, so a retired signer's certificates stay reprintable.
 */
export async function uploadSignatorySignature(
  id: string,
  formData: FormData,
): Promise<Signatory> {
  const { data } = await api.post<Signatory>(
    `${SIGNATORIES}/${id}/signature/`,
    formData,
    { headers: MULTIPART_HEADERS },
  );
  return data;
}

/**
 * The signatory library as one page, for the management modal and the picker
 * alike. `page_size: 100` is the server maximum and **clamps silently** above
 * it (§3), so a library that outgrew one page would truncate with nothing
 * reporting it.
 *
 * `meta.total` is returned alongside the rows precisely so that is detectable:
 * `SignatoryListView` compares the two and says so. **The picker does not** —
 * it would be warning an operator about rows they cannot act on from there, and
 * the management screen is where the library is actually curated. If this ever
 * needs real paging, both callers change together.
 */
export function fetchSignatories(
  filters: SignatoryListFilters = {},
): Promise<ResourceListResponse<Signatory>> {
  return listSignatories({
    page: 1,
    pageSize: 100,
    search: "",
    sort: [],
    filters: { ...filters },
  });
}
