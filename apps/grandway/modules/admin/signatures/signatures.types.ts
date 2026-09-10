// DTOs mirror `docs/backend/document-templates/INTEGRATION.md` §4 (models),
// §5 (enums) and §7 (request bodies), field-for-field.
//
// Three contract facts shape every type below, and all three are load-bearing:
//
// 1. `status`, `status_note`, `signature_file`, `is_active`, `signature_source`
//    and the timestamps are server-owned. A `PATCH` carrying `status`/
//    `status_note` is REJECTED with 400 `DOCUMENT_TEMPLATES_STATUS_IMMUTABLE`,
//    and one carrying `signature_file` with `..._SIGNATURE_FILE_IMMUTABLE` —
//    rejected, not ignored (§3). They are absent from every payload type.
// 2. **`signature_source` is the only field to branch rendering on.**
//    `signature_file` is `null` in three different situations — never
//    uploaded, archived, or superseded — and they are indistinguishable from
//    the payload. The server has already made that judgement; do not re-derive
//    it from `signature_file !== null`.
// 3. There is **no DELETE on any route**. Retirement is a status change, and
//    removing a signature is archiving its file through the `uploaded_files`
//    module. Nothing here should ever offer a delete.

/** Three values (§5). Every record is created `draft`; there is no way to create one `active`. */
export type SignatoryStatus = "draft" | "active" | "inactive";

/**
 * Which of the two possible signature sources is actually in force (§5).
 * Server-computed, read-only, never null.
 *
 * - `uploaded` — an uploaded file is in force (neither archived nor superseded).
 * - `url` — no such file, but `signature_image_url` is non-empty.
 * - `none` — nothing to render. The slot will be blank.
 *
 * An uploaded file always outranks the URL when both are present.
 */
export type SignatorySource = "uploaded" | "url" | "none";

/**
 * The nested `signature_file` object (§4). Carried on the list response too,
 * at no extra query cost, so a list never needs a follow-up detail fetch.
 */
export interface SignatureFile {
  id: string;
  /**
   * Relative path to the authenticated download route. **A `fetch` target, not
   * an `<img src>`** — it answers `Content-Disposition: attachment` and 401s an
   * unauthenticated image request (§3). Fetch it with the bearer token, then
   * `URL.createObjectURL` the blob, and hold that URL for the session: the
   * route forbids caching and writes an audit event on every call.
   */
  download_path: string;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  /** Counts replacements from 1 — a twice-replaced signature shows `3` (§4). */
  version_number: number;
  uploaded_at: string;
}

/**
 * One shape for both list and detail — there is no large column to withhold,
 * so a second shape would exist only to drift from this one (§4).
 */
export interface Signatory {
  id: string;
  name: string;
  /** May be `""`. Empty text fields are `""`, never `null` (§3). */
  title: string;
  /** **Free text, not an enum** (§4). A director may legitimately sign as the instructor — never filter a picker by it. */
  role: string;
  /** A plain external link, stored verbatim and never fetched by the API. The fallback; an uploaded file outranks it (§3). */
  signature_image_url: string;
  /** **The only nullable field in this module** (§3). Read `signature_source`, not this, to decide what renders. */
  signature_file: SignatureFile | null;
  signature_source: SignatorySource;
  status: SignatoryStatus;
  /** `status === "active"`. Server-shipped — read it rather than recomputing, so one row can never disagree with itself. **This is the boolean to gate a picker on**; a `draft` signatory is not active (§4). */
  is_active: boolean;
  status_note: string;
  /** A username string with no user id — cannot be joined to an account (§9). */
  created_by_username: string;
  created_at: string;
  updated_at: string;
}

/** `POST /signatories/` (§7). `status` is not a create field — the record is always `draft`. */
export interface SignatoryCreatePayload {
  name: string;
  title?: string;
  role?: string;
  signature_image_url?: string;
}

/** `PATCH /signatories/<id>/` — any subset of the create fields, and nothing else (§7). */
export type SignatoryUpdatePayload = Partial<SignatoryCreatePayload>;

/** `POST /signatories/<id>/status/` (§7). The note is optional on every transition. */
export interface SignatoryStatusPayload {
  status: SignatoryStatus;
  note?: string;
}

/** List filters (§7). `role` matches `iexact`; `search` is `icontains` on `name` only. */
export interface SignatoryListFilters {
  status?: SignatoryStatus;
  role?: string;
  search?: string;
}

/**
 * `FormWrapper` values for the create/edit form. Mirrors `SignatoryCreatePayload`
 * with no optionals — an untouched field submits `""`.
 *
 * The `Record<string, unknown>` base is `FormWrapper<T extends FormValues>`'s
 * bound, which a plain interface does not structurally satisfy. The `*Values`
 * suffix is what exempts it from the repo's no-index-signature rule; **domain
 * types above must never get one.**
 */
export interface SignatoryFormValues extends Record<string, unknown> {
  name: string;
  title: string;
  role: string;
  signature_image_url: string;
}

/**
 * `FormWrapper` values for the signature upload. `file` is `null` until the
 * picker is used; the schema refuses that, so the payload always has one.
 */
export interface SignatureUploadFormValues extends Record<string, unknown> {
  file: File | null;
  notes: string;
}
