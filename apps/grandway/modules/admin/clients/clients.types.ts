/**
 * Clients — the consultancy's B2B partner directory
 * (`docs/backend/clients/INTEGRATION.md`). A reference directory, not a CRM:
 * no attribution back to leads/applicants, no delete (withdrawal is *retire*).
 */

export type ClientStatus = "active" | "inactive";

/** Same 6-value set as leads/applicants contact numbers, by design (§5). */
export type ContactNumberLabel =
  | "mobile"
  | "home"
  | "work"
  | "whatsapp"
  | "viber"
  | "other";

export type ClientHistoryAction =
  | "client_created"
  | "client_updated"
  | "client_retired"
  | "client_restored";

/** The `audit` actor enum (§5) — in practice only `admin` ever appears here. */
export type HistoryActorType =
  | "superadmin"
  | "admin"
  | "lead_manager"
  | "system"
  | "ai";

/** `retired_at_bs` shape (§3) — the only BS date `clients` exposes. */
export interface BsDate {
  year: number;
  month: number;
  day: number;
  month_name: string;
  display: string;
}

/**
 * Read shape of a nested contact number (§4). Read-only here — on write the
 * `id` is neither accepted nor needed (numbers are replaced as a set).
 */
export interface ContactNumber {
  id: string;
  number: string;
  label: ContactNumberLabel;
  is_primary: boolean;
}

/**
 * `GET /api/v1/clients/` row shape — trimmed relative to detail. Omits
 * `website`, `address`, `notes`, `spokesperson_designation`, and the full
 * number list; exposes a flat `primary_contact_number` string instead (§4).
 */
export interface Client {
  id: string;
  name: string;
  spokesperson_name: string;
  email: string;
  /** Flat string or null — the primary/first number, so the directory needs no per-row detail fetch. */
  primary_contact_number: string | null;
  status: ClientStatus;
  is_active: boolean;
  logo_url: string;
  updated_at: string;
}

/** Detail shape — returned by retrieve, create, update, retire, and restore (§4). */
export interface ClientDetail {
  id: string;
  name: string;
  spokesperson_name: string;
  spokesperson_designation: string;
  email: string;
  /** Plain URL string, unvalidated third-party link (§3). */
  website: string;
  /** Plain URL string, not an upload (§3/§9). */
  logo_url: string;
  /** One free-text field, not a structured object (§4). */
  address: string;
  /** Ordered primaries-first; may have zero or several primaries (§4). */
  contact_numbers: ContactNumber[];
  status: ClientStatus;
  /** Derived, read-only — `status === "active"`. */
  is_active: boolean;
  /** Non-empty only when `status` is `inactive`; restoring clears it. */
  status_note: string;
  retired_at: string | null;
  retired_at_bs: BsDate | null;
  retired_by_username: string | null;
  notes: string;
  created_by_username: string;
  created_at: string;
  updated_at: string;
}

/**
 * The single row type the `ModalTableShell` uses across list, edit prefill and
 * the shared form. It is `ClientDetail` widened with the list-only flat
 * `primary_contact_number` (needed for the directory's phone column, which the
 * detail shape doesn't carry). List rows are mapped up to this shape with empty
 * detail defaults (`toClientRow`); the real detail-only fields are only ever
 * read after `onEditTrigger` re-fetches them, so the defaults are never shown.
 */
export interface ClientRow extends ClientDetail {
  primary_contact_number: string | null;
}

/**
 * `GET /api/v1/clients/<id>/history/` rows — owned by the `audit` module (§4).
 * `changes` maps field → `{ from, to }` (both stringified); a contact-number
 * replacement appears only as `{ from: "replaced", to: "N number(s)" }`.
 */
export interface HistoryEntry {
  id: string;
  action: ClientHistoryAction;
  actor_type: HistoryActorType;
  actor_id: string | null;
  actor_label: string;
  summary: string;
  reason: string;
  changes: Record<string, { from: unknown; to: unknown }>;
  metadata: Record<string, unknown>;
  created_at: string;
  created_at_bs: BsDate;
}

// ── Write payloads ──────────────────────────────────────────────────────────

/** Per-entry write shape (§4) — never send the read-only `id`. */
export interface ContactNumberInput {
  number: string;
  label?: ContactNumberLabel;
  is_primary?: boolean;
}

/**
 * `POST /api/v1/clients/` body (§7). Only `name` is required; `status` is not
 * accepted (always starts `active`). `contact_numbers` is a replacement set —
 * omit to leave alone, `[]` to clear, full array to replace.
 */
export interface CreateClientPayload {
  name: string;
  spokesperson_name?: string;
  spokesperson_designation?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  address?: string;
  notes?: string;
  contact_numbers?: ContactNumberInput[];
}

/**
 * `PATCH /api/v1/clients/<id>/` body — any subset of the writable fields, and
 * **nothing else**. `status`/`status_note`/`retired_at`/`retired_by` are
 * rejected 400 `CLIENTS_STATUS_IMMUTABLE` (§3), so the update payload can never
 * carry them by construction.
 */
export type UpdateClientPayload = Partial<CreateClientPayload>;

/** `POST /api/v1/clients/<id>/retire/` — reason mandatory, non-empty (§7). */
export interface RetireClientPayload {
  reason: string;
}

// ── Form value shapes (the `Values` suffix is enforced by an anti-pattern hook) ─

/** One contact-number row as the form holds it — never carries an `id`. */
export interface ContactNumberValues {
  number: string;
  label: ContactNumberLabel;
  is_primary: boolean;
}

/**
 * The shared create/edit form's own value shape — a fully-populated object
 * (empty strings, not omitted keys). The create/update *payloads* are derived
 * from it at submit time (`toCreatePayload` / the changed-field diff in
 * `toUpdatePayload`).
 */
export interface CreateClientValues extends Record<string, unknown> {
  name: string;
  spokesperson_name: string;
  spokesperson_designation: string;
  email: string;
  website: string;
  logo_url: string;
  address: string;
  notes: string;
  contact_numbers: ContactNumberValues[];
}

/** Same fields on edit — the field-level diff to a partial payload happens in `toUpdatePayload`. */
export type UpdateClientValues = CreateClientValues;
