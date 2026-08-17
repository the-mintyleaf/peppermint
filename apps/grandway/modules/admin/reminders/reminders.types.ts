// DTOs mirror `docs/backend/reminders/INTEGRATION.md` §4 (models), §5 (enums)
// and §7 (request bodies), field-for-field.
//
// Two contract facts shape every type below, and both are load-bearing:
//
// 1. `status`, `closed_at`, `closed_by`, `created_by` are server-set and are
//    **never accepted from a client** (§7). They are deliberately absent from
//    every payload type — a `PATCH` that carries one is REJECTED with 400
//    `REMINDERS_FIELD_IMMUTABLE`, not ignored (§3).
// 2. Exactly one of `applicant`/`client` is ever set, and both are **bare
//    UUID strings, not nested objects** — rendering an owner's name needs a
//    separate fetch, or the name the surrounding record screen already has.

/** `{year, month, day, month_name, display}` — an object, never a string (§3). */
export interface BsDate {
  year: number;
  month: number;
  day: number;
  month_name: string;
  display: string;
}

/** Which of the two owner FKs is set. Derived server-side, not a column (§4). */
export type ReminderOwnerType = "applicant" | "client";

/**
 * Three values, two of them terminal (§5). There is **no reopen** — a closed
 * reminder is closed forever, and "remind me again" is a new `POST /`.
 */
export type ReminderStatus = "active" | "completed" | "dismissed";

/**
 * The same shape from every endpoint — there is no list/detail split (§4).
 *
 * `is_active` is derived (`status === "active"`) and shipped by the server;
 * read it rather than recomputing, so one row can never disagree with itself.
 */
export interface Reminder {
  id: string;
  owner_type: ReminderOwnerType;
  /** Bare UUID. `null` when the reminder is client-owned. */
  applicant: string | null;
  /** Bare UUID. `null` when the reminder is applicant-owned. */
  client: string | null;
  /** `YYYY-MM-DD`, Gregorian. Due at the start of this day in Asia/Kathmandu. */
  due_date: string;
  due_date_bs: BsDate;
  /** ≤5000 chars, NFC-normalised. `""` never `null` — empty text is a string (§3). */
  note: string;
  status: ReminderStatus;
  is_active: boolean;
  /** ISO 8601 UTC. `null` while active. */
  closed_at: string | null;
  closed_at_bs: BsDate | null;
  /** No user UUID is exposed anywhere on this payload (§9). */
  closed_by_username: string | null;
  created_by_username: string;
  created_at: string;
  created_at_bs: BsDate;
  /** ISO 8601 UTC. **No `_bs` sibling** — deliberate (§3). */
  updated_at: string;
}

/** The five reminder actions the audit log records for this module (§5). */
export type ReminderHistoryAction =
  | "reminder_created"
  | "reminder_rescheduled"
  | "reminder_updated"
  | "reminder_completed"
  | "reminder_dismissed";

/** Owned by `audit`; shared by every module's `/history/` endpoint (§4). */
export type ReminderHistoryActorType =
  | "superadmin"
  | "admin"
  | "lead_manager"
  | "system"
  | "ai";

/**
 * One `GET /api/v1/reminders/<id>/history/` row. `changes` values are **both
 * stringified** by the server — render them as text, never coerce a `to` back
 * into a `Date` (§4).
 */
export interface ReminderHistoryEntry {
  id: string;
  action: ReminderHistoryAction;
  actor_type: ReminderHistoryActorType;
  actor_id: string | null;
  actor_label: string;
  summary: string;
  /** `""` when the actor gave no reason. */
  reason: string;
  changes: Record<string, { from: string; to: string }>;
  metadata: Record<string, unknown>;
  created_at: string;
  created_at_bs: BsDate;
}

// ── Write payloads (§7) ─────────────────────────────────────────────────────

/**
 * The owner half of a create body. Exactly **one** key, and the discriminated
 * union is what enforces it at compile time: sending zero or two owner
 * references is 400 `REMINDERS_OWNER_REQUIRED`.
 *
 * The same shape is the `owner` prop of `RecordRemindersPanel`, so a record
 * screen passes its identity once and it reaches both the list filter and the
 * create body unchanged.
 */
export type ReminderOwner = { applicant: string } | { client: string };

/** `POST /api/v1/reminders/` → 201. Owner + due date + note, nothing else. */
export type ReminderCreatePayload = ReminderOwner & {
  /** `YYYY-MM-DD`. Must be Nepal's today or later — see `nepalToday()`. */
  due_date: string;
  /** Required, non-blank, ≤5000 chars. */
  note: string;
};

/**
 * `PATCH /api/v1/reminders/<id>/`. **At least one key must be present** — an
 * empty `PATCH` is a 400 — and no other key may ever be added to this type.
 */
export interface ReminderUpdatePayload {
  due_date?: string;
  note?: string;
}

/**
 * The optional body of `complete/` and `dismiss/`. `reason` is recorded on the
 * **history event only** — it is not a column on the reminder and never comes
 * back on a read, so do not try to render it from the mutation's result.
 */
export interface ReminderActionPayload {
  reason?: string;
}

// ── List filters (§7) ───────────────────────────────────────────────────────

/**
 * Every field maps 1:1 to a server query param. There is **no `search` and no
 * `ordering`** in this API (§3) — rows are always newest-created first, so a
 * due-date reading order is a client-side sort of the page already fetched.
 */
export interface ReminderListFilters {
  /** A client id passed here matches nothing rather than erroring (§7). */
  applicant?: string;
  client?: string;
  /** **Omit to get open AND closed rows** — that is the contract's default (§7). */
  status?: ReminderStatus;
  /** `YYYY-MM-DD`, **inclusive**, on `due_date`. */
  due_before?: string;
  /** `YYYY-MM-DD`, **inclusive**, on `due_date`. */
  due_after?: string;
  /** `YYYY/YY` — a **Bikram Sambat** fiscal-year label (e.g. `2082/83`), not Gregorian. */
  fiscal_year?: string;
  page?: number;
  /** Default 20, max 100 — over-max is clamped server-side, not rejected. */
  page_size?: number;
}
