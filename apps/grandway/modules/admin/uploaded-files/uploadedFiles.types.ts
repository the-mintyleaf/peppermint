/**
 * Uploaded Files — the platform's file ledger (`docs/backend/uploaded-files/INTEGRATION.md`).
 * Every stored file in Grandway lives here: what it is, which record it belongs to,
 * whether a reviewer accepted it, what it replaced, and whether it's still in active
 * use. This is the only module in the system where bytes are stored at all — there is
 * no `file` field and never will be; the download endpoint is the only way to get bytes.
 */

export type FileOwnerType =
  | "applicant"
  | "journey"
  | "offer"
  | "document"
  | "snapshot";

/** 11 values (§5). */
export type FileCategory =
  | "passport"
  | "photograph"
  | "academic_transcript"
  | "academic_certificate"
  | "test_score_report"
  | "offer_letter"
  | "financial"
  | "sponsorship"
  | "signature_image"
  | "generated_document"
  | "other";

/** Caller-asserted, not verified — a label, not provenance (§4). */
export type UploadSource = "staff_upload" | "system_generated";

/**
 * `pending` is a starting state, not a settable verdict — the verify action only
 * accepts `verified`/`rejected` (§5/§7). See `VerifyDecision`.
 */
export type VerificationStatus = "pending" | "verified" | "rejected";

/** The verify action's own accepted values (a strict subset of `VerificationStatus`). */
export type VerifyDecision = Extract<
  VerificationStatus,
  "verified" | "rejected"
>;

/** Accepted upload extensions — not a response enum (§5). */
export type AcceptedExtension =
  | "pdf"
  | "jpg"
  | "jpeg"
  | "png"
  | "webp"
  | "docx"
  | "xlsx";

/** `created_at_bs`/`reviewed_at_bs`/`archived_at_bs` shape — read-only, never sent (§3). */
export interface BsDate {
  year: number;
  month: number;
  day: number;
  month_name: string;
  display: string;
}

/**
 * The one shape — list, detail, upload, replace, and every lifecycle action all
 * return this (§4). `owner_type`/`owner_id` are derived from whichever of the five
 * owner FKs is set (exactly one, always — a database constraint). Empty text fields
 * are `""`, never `null`, except the nine explicitly-nullable fields below (§3).
 */
export interface UploadedFile {
  id: string;
  owner_type: FileOwnerType;
  owner_id: string;
  category: FileCategory;
  upload_source: UploadSource;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  checksum_sha256: string;
  version_number: number;
  /** Predecessor's id, or `null` for a v1. */
  replaces: string | null;
  /** Independent from `is_archived` — a file can be archived AND current, or superseded and NOT archived (§4). */
  is_current: boolean;
  superseded_at: string | null;
  superseded_by_username: string | null;
  verification_status: VerificationStatus;
  is_verified: boolean;
  rejection_reason: string;
  reviewed_at: string | null;
  reviewed_at_bs: BsDate | null;
  reviewed_by_username: string | null;
  is_archived: boolean;
  archive_reason: string;
  archived_at: string | null;
  archived_at_bs: BsDate | null;
  archived_by_username: string | null;
  notes: string;
  /** Actors are usernames, not ids (§4) — no profile link, no join. */
  uploaded_by_username: string;
  created_at: string;
  created_at_bs: BsDate;
  updated_at: string;
}

/**
 * The owner filter shared by every files panel and by `upload` (§7 — "every files
 * panel in the product is this endpoint with a filter"). Exactly one key is ever set,
 * enforced by a database constraint on the backend (§4). Limited to the four owner
 * types this phase's consumers embed a panel for; `document`/`snapshot`-owned panels
 * are Admin-only in every respect and are out of scope until the document stack wires
 * this module in (see this module's `docs/AI.md`).
 */
export interface FileOwnerScope {
  applicant?: string;
  journey?: string;
  offer?: string;
  document?: string;
}

// ── Write payloads ──────────────────────────────────────────────────────────

/**
 * `PATCH /api/v1/files/<id>/` body — category and/or notes ONLY (§7). Anything else
 * is refused by name (`UPLOADED_FILES_FIELD_IMMUTABLE`, each refused field named).
 */
export interface UpdateFilePayload {
  category?: FileCategory;
  notes?: string;
}

/** `POST /api/v1/files/<id>/verify/` body — Admin only (§7). */
export interface VerifyFilePayload {
  status: VerifyDecision;
  /** Required only when `status: "rejected"` (`UPLOADED_FILES_REJECTION_REASON_REQUIRED`). */
  reason?: string;
}

/** `POST /api/v1/files/<id>/archive/` body — Admin only, reason required non-blank (§7). */
export interface ArchiveFilePayload {
  reason: string;
}

/** `POST /api/v1/files/<id>/restore/` body — Admin only. Audit-only; never stored on the record, never in the response (§7). */
export interface RestoreFilePayload {
  note?: string;
}

// ── Form value shapes (the `Values` suffix is enforced by an anti-pattern hook) ─

/** `UploadFileModal`'s own value shape — owner comes from the panel's `scope` prop, not a field. */
export interface UploadFileFormValues extends Record<string, unknown> {
  category: FileCategory | "";
  file: File | null;
  notes: string;
}

/** `ReplaceFileModal`'s own value shape — no owner, no category, both inherited from the predecessor (§7). */
export interface ReplaceFileFormValues extends Record<string, unknown> {
  file: File | null;
  notes: string;
}

/** `EditFileModal`'s own value shape — category and/or notes only (§7). */
export interface EditFileFormValues extends Record<string, unknown> {
  category: FileCategory;
  notes: string;
}
