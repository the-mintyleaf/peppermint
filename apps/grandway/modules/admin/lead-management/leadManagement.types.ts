/** The 8 lead stages (`docs/backend/lead-management/INTEGRATION.md` §5). */
export type LeadStage =
  | "new"
  | "contact_attempted"
  | "contacted"
  | "counselling"
  | "follow_up"
  | "ready_for_conversion"
  | "converted"
  | "lost";

/**
 * The 6 stages a Select may offer. Narrower than `LeadStage` on purpose — `lost`/
 * `converted` are reached only via their own dedicated actions, so no stage-bearing
 * request payload should even be able to hold them (compile-time, not just by
 * convention).
 */
export type SelectableLeadStage = Exclude<LeadStage, "lost" | "converted">;

export const SELECTABLE_STAGES: readonly SelectableLeadStage[] = [
  "new",
  "contact_attempted",
  "contacted",
  "counselling",
  "follow_up",
  "ready_for_conversion",
] as const;

export type ContactNumberLabel =
  | "mobile"
  | "home"
  | "work"
  | "whatsapp"
  | "viber"
  | "other";

export type StudyLevel =
  | "school"
  | "certificate"
  | "diploma"
  | "bachelors"
  | "postgraduate_diploma"
  | "masters"
  | "phd"
  | "other";

export type LanguageTestStatus =
  | "not_taken"
  | "preparing"
  | "booked"
  | "taken"
  | "not_required";

export type HistoryActorType =
  | "superadmin"
  | "admin"
  | "lead_manager"
  | "system"
  | "ai";

export interface BsDate {
  year: number;
  month: number;
  day: number;
  month_name_en: string;
  month_name_np: string;
  display_en: string;
  display_np: string;
}

export interface UserBrief {
  id: string;
  username: string;
  display_name: string;
}

/** Shared shape of `LeadSource` and `LossReason`. */
export interface ReferenceEntry {
  id: string;
  code: string;
  name_np: string;
  name_en: string;
  name_romanized: string;
  requires_detail: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type LeadSource = ReferenceEntry;
export type LossReason = ReferenceEntry;

export interface ContactNumber {
  id?: string;
  number: string;
  label: ContactNumberLabel;
  is_primary: boolean;
}

export interface StudyInterest {
  interested_countries: string[];
  study_level: StudyLevel | "";
  field_of_study: string;
  preferred_intake: string;
  budget_amount: string | null;
  budget_currency: string;
  scholarship_interest: boolean;
  highest_qualification: string;
  language_test_status: LanguageTestStatus | "";
  interest_notes: string;
}

/** `GET /leads/` row shape — trimmed relative to detail (no `study_interest`/lifecycle fields). */
export interface Lead {
  id: string;
  full_name_np: string;
  full_name_en: string;
  full_name_romanized: string;
  email: string;
  address: string;
  source: LeadSource;
  source_detail: string;
  stage: LeadStage;
  created_by: UserBrief;
  contact_numbers: ContactNumber[];
  last_followed_up_at: string | null;
  last_followed_up_at_bs: BsDate | null;
  created_at: string;
  updated_at: string;
}

/** Returned by retrieve, create, update, and every lifecycle action. */
export interface LeadDetail extends Lead {
  study_interest: StudyInterest | null;
  last_followed_up_by: UserBrief | null;
  lost_reason: LossReason | null;
  lost_detail: string;
  lost_at: string | null;
  lost_at_bs: BsDate | null;
  lost_by: UserBrief | null;
  stage_before_loss: LeadStage | "";
  converted_at: string | null;
  converted_at_bs: BsDate | null;
  converted_by: UserBrief | null;
  /** Populated together with `converted_at`/`converted_by`; never cleared, not even by reopen. */
  converted_applicant_id: string | null;
  /** Populated together with `converted_at`/`converted_by`; never cleared, not even by reopen. */
  converted_journey_id: string | null;
}

/** `POST /leads/<id>/convert/` response — empty request body. */
export interface ConvertLeadResponse {
  lead: LeadDetail;
  applicant_id: string;
  journey_id: string;
}

export interface LeadNote {
  id: string;
  body: string;
  author: UserBrief;
  created_at: string;
}

export type HistoryAction =
  | "lead_created"
  | "lead_updated"
  | "lead_contact_changed"
  | "lead_source_changed"
  | "lead_interest_changed"
  | "lead_stage_changed"
  | "lead_followup_recorded"
  | "lead_marked_lost"
  | "lead_reopened"
  | "lead_note_added"
  | "lead_source_created"
  | "lead_source_updated"
  | "loss_reason_created"
  | "loss_reason_updated"
  | "lead_converted"
  | "lead_applicant_created";

export interface HistoryEntry {
  id: string;
  action: HistoryAction;
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

/** Board category — computed client-side, never sent to or received from the backend. */
export type LeadCategory = "active" | "needs_attention" | "upcoming" | "dead";

/**
 * Based on `LeadDetail`, not the trimmed `Lead` list shape, even though the
 * board's aggregate fetch only ever gets list-shape rows from the backend —
 * so `onEditTrigger` (which must return `Promise<TRow>` for whatever `TRow`
 * the table uses) can hand back the *real* full detail it just fetched,
 * simply adding `category`, instead of needing a second, incompatible row
 * type for the edit modal. List-shape rows fill the detail-only fields with
 * safe empty defaults (see `toLeadBoardRow` in `leadManagement.hooks.ts`) —
 * nothing reads them until a row has actually been through `onEditTrigger`
 * or the detail drawer's own fetch.
 */
export interface LeadBoardRow extends LeadDetail {
  category: LeadCategory;
}

// ── Write payloads ──────────────────────────────────────────────────────────

export interface ContactNumberInput {
  id?: string;
  number: string;
  label: ContactNumberLabel;
  is_primary: boolean;
}

export interface StudyInterestInput {
  interested_countries?: string[];
  study_level?: StudyLevel | "";
  field_of_study?: string;
  preferred_intake?: string;
  budget_amount?: number | null;
  budget_currency?: string;
  scholarship_interest?: boolean;
  highest_qualification?: string;
  language_test_status?: LanguageTestStatus | "";
  interest_notes?: string;
}

/** `stage` is deliberately absent — not writable via create/update (INTEGRATION.md §7). */
export interface LeadCreatePayload {
  full_name_np: string;
  full_name_en?: string;
  email?: string;
  address?: string;
  source: string;
  source_detail?: string;
  contact_numbers: ContactNumberInput[];
  study_interest?: StudyInterestInput;
}

export type LeadUpdatePayload = Partial<LeadCreatePayload>;

export interface StageChangePayload {
  stage: SelectableLeadStage;
}

export interface FollowUpPayload {
  note?: string;
  stage?: SelectableLeadStage;
  followed_up_at?: string;
}

export interface MarkLostPayload {
  loss_reason: string;
  detail?: string;
}

export interface ReopenPayload {
  stage?: SelectableLeadStage;
}

export interface LeadNoteCreatePayload {
  body: string;
}
