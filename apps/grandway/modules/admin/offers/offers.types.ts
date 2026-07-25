// DTOs mirror `docs/backend/offers/INTEGRATION.md` §4 (models) and §7 (request
// bodies) field-for-field. Plain interfaces — the shells constrain `T extends
// object`, so no `extends Record<string, unknown>` on the read/payload types
// (only the `*Values` form types need it, see `form/*.types.ts`).

// `journey_stage` is `applicant_journeys`' own enum, read-only here — imported
// from that module's concrete type file (never its barrel) so the header can
// label it, without this module re-declaring the 9-stage union.
import type { JourneyStage } from "@/modules/admin/applicant-journeys/applicantJourneys.types";

export type { JourneyStage };

// ── Enums (INTEGRATION.md §5) ────────────────────────────────────────────────

/** 7 statuses; everything except `draft`/`issued` is terminal (`is_terminal`). */
export type OfferStatus =
  | "draft"
  | "issued"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "deferred"
  | "expired";

export type OfferType = "conditional" | "unconditional";

/** Read-only, derived at creation — `catalogue` when any FK resolved, else `manual`. Never sent. */
export type ReferenceSource = "catalogue" | "manual";

/** Same value set as `institutions.Program.qualification_level`, or `""`. */
export type QualificationLevel =
  | "school"
  | "certificate"
  | "diploma"
  | "bachelors"
  | "postgraduate_diploma"
  | "masters"
  | "phd"
  | "other";

/** Only tuition carries a period. Same set as `institutions.Program.tuition_fee_period`, or `""`. */
export type TuitionFeePeriod = "per_year" | "per_semester" | "total_program";

export type ConditionType =
  | "academic_result"
  | "english_test"
  | "document_submission"
  | "deposit_payment"
  | "interview"
  | "identity_confirmation"
  | "other";

/** `pending` is the only unresolved status (counts toward `has_open_conditions`). */
export type ConditionStatus =
  | "pending"
  | "satisfied"
  | "waived"
  | "not_applicable";

/** Decision request field — a strict subset of `OfferStatus` (no `draft`/`issued`). */
export type DecisionOutcome =
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "deferred"
  | "expired";

export type HistoryActorType =
  | "superadmin"
  | "admin"
  | "lead_manager"
  | "system"
  | "ai";

/**
 * Offers' Bikram Sambat sibling shape (§3) — `{ year, month, day, month_name,
 * display }`, deliberately flatter than `applicant_journeys`' BsDate. Every
 * user-facing date has one; `null` when the date is unset. Never a string.
 */
export interface BsDate {
  year: number;
  month: number;
  day: number;
  month_name: string;
  display: string;
}

// ── Read models (INTEGRATION.md §4) ──────────────────────────────────────────

/** `GET /api/v1/offers/` row shape. Snapshot fields are what the offer *means*. */
export interface Offer {
  id: string;
  journey: string;
  journey_stage: JourneyStage;
  applicant_id: string;
  applicant_name: string;
  institution_name: string;
  campus_name: string;
  program_title: string;
  qualification_level: QualificationLevel | "";
  intake_label: string;
  offer_type: OfferType;
  status: OfferStatus;
  issue_date: string | null;
  issue_date_bs: BsDate | null;
  response_deadline: string | null;
  response_deadline_bs: BsDate | null;
  /** True only when `status` is `issued` and the deadline has passed (Nepal time) — trust the flag. */
  is_response_overdue: boolean;
  /** True when any condition is not `satisfied`/`waived`/`not_applicable`. Independent of `offer_type`. */
  has_open_conditions: boolean;
  created_at: string;
}

/** Nested in the offer detail (`conditions`) and the row shape of `/conditions/` — identical. */
export interface Condition {
  id: string;
  condition_type: ConditionType;
  description: string;
  status: ConditionStatus;
  is_resolved: boolean;
  due_date: string | null;
  due_date_bs: BsDate | null;
  display_order: number;
  resolution_note: string;
  resolved_at: string | null;
  resolved_at_bs: BsDate | null;
  resolved_by_username: string | null;
  created_at: string;
  updated_at: string;
}

/** Returned by retrieve, create, update, issue, and decision (INTEGRATION.md §4). */
export interface OfferDetail extends Offer {
  /** Bare UUID strings or `null` (manual offer) — not nested catalogue objects. */
  institution: string | null;
  campus: string | null;
  program: string | null;
  reference_source: ReferenceSource;
  country_name: string;
  offer_reference: string;
  /** Money is a decimal string, never a number; `null` when unrecorded. Render currency on every figure. */
  tuition_amount: string | null;
  tuition_currency: string;
  tuition_fee_period: TuitionFeePeriod | "";
  scholarship_amount: string | null;
  scholarship_currency: string;
  scholarship_notes: string;
  deposit_amount: string | null;
  deposit_currency: string;
  deposit_due_date: string | null;
  deposit_due_date_bs: BsDate | null;
  deposit_notes: string;
  notes: string;
  is_terminal: boolean;
  decided_at: string | null;
  decided_at_bs: BsDate | null;
  decision_reason: string;
  decided_by_username: string | null;
  deferred_to_intake: string;
  created_by_username: string;
  conditions: Condition[];
  updated_at: string;
}

/** `GET /api/v1/offers/<id>/history/` row — owned by `audit`, rendered here. */
export interface HistoryEntry {
  id: string;
  action: string;
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

// ── Write payloads (INTEGRATION.md §7) ───────────────────────────────────────

/** Inline condition on create — `offer` is never sent (from the URL/parent). */
export interface ConditionInput {
  condition_type: ConditionType;
  description: string;
  due_date?: string | null;
  display_order?: number;
}

/**
 * `POST /api/v1/offers/` body. Journey required; reference is EITHER `program`
 * (UUID) OR snapshot `institution_name` + `program_title`. `reference_source`
 * is derived, never sent.
 */
export interface OfferCreatePayload {
  journey: string;
  program?: string | null;
  institution?: string | null;
  campus?: string | null;
  institution_name?: string;
  campus_name?: string;
  program_title?: string;
  country_name?: string;
  qualification_level?: QualificationLevel | "";
  intake_label?: string;
  offer_type?: OfferType;
  offer_reference?: string;
  issue_date?: string | null;
  response_deadline?: string | null;
  tuition_amount?: string | null;
  tuition_currency?: string;
  tuition_fee_period?: TuitionFeePeriod | "";
  scholarship_amount?: string | null;
  scholarship_currency?: string;
  scholarship_notes?: string;
  deposit_amount?: string | null;
  deposit_currency?: string;
  deposit_due_date?: string | null;
  deposit_notes?: string;
  notes?: string;
  conditions?: ConditionInput[];
}

/**
 * `PATCH /api/v1/offers/<id>/` — the MUTABLE subset only. Journey, catalogue
 * refs, all six snapshot fields, `reference_source`, `status`, and `conditions`
 * are REJECTED (`OFFERS_REFERENCE_IMMUTABLE`), so they are absent from this
 * type entirely — they can never be sent. Send only the fields that changed.
 */
export interface OfferUpdatePayload {
  offer_type?: OfferType;
  offer_reference?: string;
  issue_date?: string | null;
  response_deadline?: string | null;
  tuition_amount?: string | null;
  tuition_currency?: string;
  tuition_fee_period?: TuitionFeePeriod | "";
  scholarship_amount?: string | null;
  scholarship_currency?: string;
  scholarship_notes?: string;
  deposit_amount?: string | null;
  deposit_currency?: string;
  deposit_due_date?: string | null;
  deposit_notes?: string;
  notes?: string;
}

/** `POST /api/v1/offers/<id>/decision/` — `reason` required for reject/withdraw; `to_intake` for defer. */
export interface OfferDecisionPayload {
  outcome: DecisionOutcome;
  reason?: string;
  to_intake?: string;
}

/** `POST /api/v1/offers/<id>/conditions/` — `offer` never sent. */
export interface ConditionCreatePayload {
  condition_type: ConditionType;
  description: string;
  due_date?: string | null;
  display_order?: number;
}

/** `PATCH /api/v1/offers/conditions/<id>/` — wording only, NOT `status`. */
export type ConditionUpdatePayload = Partial<{
  condition_type: ConditionType;
  description: string;
  due_date: string | null;
  display_order: number;
}>;

/** `POST /api/v1/offers/conditions/<id>/status/` — `note` required for waive/not_applicable. */
export interface ConditionStatusPayload {
  status: ConditionStatus;
  note?: string;
}
