import { createResourceApi } from "@peppermint/admin";
import type { QueryParams, ResourceListResponse } from "@peppermint/admin";
import api from "@/lib/api";
import type {
  ArchiveFilePayload,
  RestoreFilePayload,
  UpdateFilePayload,
  UploadedFile,
  VerifyFilePayload,
} from "./uploadedFiles.types";

const FILES = "/api/v1/files";

/**
 * `create` is never called — upload/replace are `multipart/form-data` and
 * don't fit `createResourceApi`'s JSON `create`, so they're hand-rolled below
 * against `FormData` built by the caller (the modal already holds the file +
 * owner scope). `get`/`update`/`action` all fit the primitive as-is.
 */
const fileResource = createResourceApi<UploadedFile, never, UpdateFilePayload>({
  client: api,
  basePath: FILES,
});

/** `GET /api/v1/files/<id>/` — metadata only, never bytes (§3/§7). */
export const getFile = fileResource.get;

/**
 * `PATCH /api/v1/files/<id>/` — category and/or notes only (§7); anything else
 * is refused by name (`UPLOADED_FILES_FIELD_IMMUTABLE`). The payload type
 * already excludes every other field, so this can't be sent by construction.
 */
export const updateFile = fileResource.update;

/** `POST /api/v1/files/<id>/verify/` — Admin only. `status`: verified|rejected (§7). */
export function verifyFile(id: string, body: VerifyFilePayload) {
  return fileResource.action<UploadedFile>(id, "verify", body);
}

/** `POST /api/v1/files/<id>/archive/` — Admin only, reason required (§7). */
export function archiveFile(id: string, body: ArchiveFilePayload) {
  return fileResource.action<UploadedFile>(id, "archive", body);
}

/** `POST /api/v1/files/<id>/restore/` — Admin only, note optional and audit-only (§7). */
export function restoreFile(id: string, body: RestoreFilePayload = {}) {
  return fileResource.action<UploadedFile>(id, "restore", body);
}

/**
 * `GET /api/v1/files/` — every files panel in the product is this endpoint
 * with a filter (§7); callers always pass an owner filter (`FilesPanel`) or
 * `?verification_status=pending` (the review queue). Thin wrapper over
 * `fileResource.list` — no shape remap needed, list and detail share the same
 * `UploadedFile` read shape (§4), unlike e.g. `clients.fetchClients`.
 */
export async function listFiles(
  params?: QueryParams,
): Promise<ResourceListResponse<UploadedFile>> {
  return fileResource.list(params);
}

/**
 * `GET /api/v1/files/<id>/versions/` — hand-rolled: unpaginated and
 * oldest-first, the opposite of the list endpoint, because a chain reads as a
 * history (§3). `meta` carries only `count` (the chain length) — remapped to
 * `total` for the same shape every other list response uses. `page_size` is
 * sent defensively even though the endpoint ignores pagination.
 */
export async function fetchFileVersions(
  id: string,
): Promise<ResourceListResponse<UploadedFile>> {
  const { data } = await api.get<{
    data: UploadedFile[];
    meta: { count: number };
  }>(`${FILES}/${id}/versions/`, { params: { page_size: 100 } });
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}

/**
 * `POST /api/v1/files/` — 201, `multipart/form-data`. Takes a pre-built
 * `FormData` (owner key/id, `category`, `file`, optional `notes`) — see
 * `UploadFileModal`'s `finalSubmitFn`, which is where the owner scope is
 * resolved into the right form field name.
 */
export async function uploadFile(formData: FormData): Promise<UploadedFile> {
  const { data } = await api.post<UploadedFile>(`${FILES}/`, formData);
  return data;
}

/**
 * `POST /api/v1/files/<id>/replace/` — 201, `multipart/form-data`, returns a
 * **new** file id (the predecessor becomes `is_current: false` but keeps its
 * bytes/verdict/reason permanently, §3). No owner and no category in the
 * body — both inherited from the predecessor (§7).
 */
export async function replaceFile(
  id: string,
  formData: FormData,
): Promise<UploadedFile> {
  const { data } = await api.post<UploadedFile>(
    `${FILES}/${id}/replace/`,
    formData,
  );
  return data;
}

/**
 * `GET /api/v1/files/<id>/download/` — the ONLY way to obtain a file's bytes
 * (§3/§9); there is no `file` field and no URL anywhere in a JSON payload.
 * Requires the bearer token, so this must be fetched through the app's Axios
 * instance (which injects it) and handed to the browser as a blob — never a
 * plain `<img src>`/`<a href>`. Audited server-side on every call, the only
 * audited read in the API.
 */
export async function downloadFileBlob(id: string): Promise<Blob> {
  const { data } = await api.get<Blob>(`${FILES}/${id}/download/`, {
    responseType: "blob",
  });
  return data;
}
