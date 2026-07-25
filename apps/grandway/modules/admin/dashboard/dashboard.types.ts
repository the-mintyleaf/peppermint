// DTOs for the eight read-only dashboard sections (`/api/v1/dashboard/`).
// Field-for-field from `docs/backend/dashboard/INTEGRATION.md` §4. This module
// owns no enum — every status/stage value below is owned by another app and
// re-declared here only because the dashboard has no import of its own for a
// bare string union (labels/colors are imported concretely from the owning
// module in `dashboard.labels.ts`, never redefined).
//
// Read entities are plain interfaces (`T extends object`) — nothing here is
// ever passed to `FormWrapper`, so no `*Values`/`Record<string, unknown>` shape
// is needed anywhere in this module.

// ── Shared shapes (§4 "Shared shapes") ────────────────────────────────────────

export interface BsDate {
  year: number;
  month: number;
  day: number;
  month_name: string;
  display: string;
}

export interface UserBrief {
  id: string;
  username: string;
  display_name: string;
}

/** The wrapper every worklist uses. `total` is the real count; `items` caps at 10, no paging. */
export interface Preview<TRow> {
  total: number;
  has_more: boolean;
  items: TRow[];
}

/** `percent` is `null` (never `0`) when `denominator` is `0`. */
export interface Rate {
  numerator: number;
  denominator: number;
  percent: number | null;
}

/** `owner_id` is `null` and `owner_display_name` reads `"Unassigned"` for unowned work. */
export interface OwnerRow {
  owner_id?: string | null;
  owner_username: string;
  owner_display_name: string;
}

/** Only sources with >=1 lead in the window appear. `in_progress = total - converted - lost`. */
export interface SourceConversionRow {
  source_id: string;
  source_code: string;
  source_name: string;
  total: number;
  converted: number;
  lost: number;
  in_progress: number;
}

// ── Row shapes (§4 "Row shapes") ──────────────────────────────────────────────

export interface ChecklistItemRow {
  id: string;
  label: string;
  status: "pending" | "completed" | "waived" | "blocked" | "not_applicable";
  item_type: "document" | "stage" | "task";
  is_required: boolean;
  due_at?: string | null;
  due_at_bs?: BsDate | null;
  status_note: string;
  checklist_id: string;
  checklist_title: string;
  journey_id: string;
  applicant_id: string;
  applicant_name: string;
  /** `""` for a checklist built by hand with no country. */
  country_name: string;
  assigned_to?: UserBrief | null;
}

/** Read `is_response_overdue` off the row — never re-derive it in browser tz. */
export interface OfferRow {
  id: string;
  status:
    | "draft"
    | "issued"
    | "accepted"
    | "rejected"
    | "withdrawn"
    | "deferred"
    | "expired";
  institution_name: string;
  program_title: string;
  intake_label: string;
  response_deadline?: string | null;
  response_deadline_bs?: BsDate | null;
  is_response_overdue: boolean;
  journey_id: string;
  applicant_id: string;
  applicant_name: string;
}

/** `applicant_id`/`journey_id` both `null` when the file belongs to an offer/document/snapshot. */
export interface FileRow {
  id: string;
  original_filename: string;
  category:
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
  verification_status: "pending" | "verified" | "rejected";
  rejection_reason: string;
  created_at: string;
  reviewed_at?: string | null;
  applicant_id?: string | null;
  journey_id?: string | null;
}

/** `applicant_id` is `null` and `applicant_name` is `""` for a standalone document. */
export interface DocumentRow {
  id: string;
  label: string;
  family:
    | "student"
    | "woda"
    | "lor"
    | "moi"
    | "bank_statement"
    | "bank_certificate";
  status: "draft" | "ready" | "archived";
  updated_at: string;
  applicant_id?: string | null;
  applicant_name: string;
}

/** `has_expired` is computed against today in Nepal. Already-expired rows are included. */
export interface PassportRow {
  applicant_id: string;
  applicant_name: string;
  passport_number: string;
  expiry_date: string;
  expiry_date_bs: BsDate;
  has_expired: boolean;
}

export interface LeadRow {
  id: string;
  full_name: string;
  stage:
    | "new"
    | "contact_attempted"
    | "contacted"
    | "counselling"
    | "follow_up"
    | "ready_for_conversion"
    | "converted"
    | "lost";
  last_followed_up_at?: string | null;
  created_at: string;
  owner_display_name: string;
}

/** `country_name` falls back to the journey's free-text destination with no catalogue link. */
export interface JourneyRow {
  id: string;
  stage:
    | "planning"
    | "profile_building"
    | "shortlisting"
    | "applying"
    | "offer_stage"
    | "visa_stage"
    | "completed"
    | "closed"
    | "deferred";
  applicant_id: string;
  applicant_name: string;
  country_id?: string | null;
  country_name: string;
}

/** `action` is not a fixed enum (every app contributes its own strings) — render `summary`. */
export interface ActivityRow {
  id: string;
  app_label: string;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  actor_type: "superadmin" | "admin" | "lead_manager" | "system" | "ai";
  actor_label: string;
  summary: string;
  success: boolean;
  created_at: string;
  created_at_bs: BsDate;
}

export type LeadWorkloadRow = OwnerRow & { open_leads: number };
export type ChecklistWorkloadRow = OwnerRow & {
  open_items: number;
  overdue_items: number;
  blocked_items: number;
};
export type OfferWorkloadRow = OwnerRow & { awaiting_response: number };

// ── Pipeline count-map key unions (zero-filled — every key always present) ───

export type LeadStageKey = LeadRow["stage"];
export type ApplicantStatusKey = "active" | "dormant" | "archived";
export type JourneyStageKey = JourneyRow["stage"];
export type OfferStatusKey = OfferRow["status"];
export type ChecklistStatusKey = "draft" | "active" | "completed" | "archived";
export type DocumentStatusKey = DocumentRow["status"];
export type FileVerificationStatusKey = FileRow["verification_status"];
export type JourneyOutcomeKey =
  | "successful"
  | "withdrawn"
  | "rejected"
  | "not_qualified"
  | "cancelled"
  | "other";
export type OfferDecisionKey =
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "deferred"
  | "expired";

// ── Section response shapes (§4 "Section response shapes") ───────────────────

export interface DashboardSummary {
  alerts: {
    overdue_checklist_items: number;
    due_soon_checklist_items: number;
    blocked_checklist_items: number;
    offers_awaiting_response: number;
    files_awaiting_verification: number;
    rejected_files: number;
    stale_leads: number;
    journeys_without_a_checklist: number;
  };
  volumes: {
    leads_total: number;
    applicants_active: number;
    journeys_total: number;
  };
  due_within_days: number;
}

export interface DashboardToday {
  overdue_checklist_items: Preview<ChecklistItemRow>;
  due_soon_checklist_items: Preview<ChecklistItemRow>;
  offers_awaiting_response: Preview<OfferRow>;
  files_awaiting_verification: Preview<FileRow>;
  documents_in_progress: Preview<DocumentRow>;
  stale_leads: Preview<LeadRow>;
  due_within_days: number;
}

export interface DashboardPipeline {
  leads_by_stage: Record<LeadStageKey, number>;
  applicants_by_status: Record<ApplicantStatusKey, number>;
  journeys_by_stage: Record<JourneyStageKey, number>;
  offers_by_status: Record<OfferStatusKey, number>;
  checklists_by_status: Record<ChecklistStatusKey, number>;
  documents_by_status: Record<DocumentStatusKey, number>;
  files_by_verification: Record<FileVerificationStatusKey, number>;
  /** Always `false` — exists so the panel can be labelled honestly, not a real filter flag. */
  documents_by_status_is_country_filtered: boolean;
}

export interface DashboardBlockers {
  blocked_checklist_items: Preview<ChecklistItemRow>;
  journeys_without_a_checklist: Preview<JourneyRow>;
  expiring_passports: Preview<PassportRow>;
  overdue_offers: Preview<OfferRow>;
  rejected_files: Preview<FileRow>;
  passport_within_days: number;
}

/** The three lists are NOT joinable into one row per person and must not be summed. */
export interface DashboardWorkload {
  is_scoped_to_caller: boolean;
  leads: LeadWorkloadRow[];
  checklist_items: ChecklistWorkloadRow[];
  offers: OfferWorkloadRow[];
}

/** Four independent rates — never draw a funnel, never multiply them together. */
export interface DashboardConversion {
  by_source: SourceConversionRow[];
  rates: {
    lead_to_applicant: Rate;
    applicant_to_journey: Rate;
    journey_to_offer: Rate;
    offer_acceptance: Rate;
  };
}

/**
 * `journey_outcomes` is windowed on when a journey ENDED; `journeys_completed`/
 * `journeys_closed` (like pipeline) on when it was CREATED. Never present as
 * parts of one total.
 */
export interface DashboardOutcomes {
  journey_outcomes: Record<JourneyOutcomeKey, number>;
  offer_decisions: Record<OfferDecisionKey, number>;
  journeys_completed: number;
  journeys_closed: number;
  applicants_archived: number;
  applicants_dormant: number;
  checklists_completed: number;
  checklists_archived: number;
}

export interface DashboardActivityMeta {
  count: number;
  page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
}

/** The only array `data` and the only paginated section. */
export interface DashboardActivityResponse {
  data: ActivityRow[];
  meta: DashboardActivityMeta;
}

// ── Shared filter shape (fiscal_year + country — the only two the UI exposes) ─

export interface DashboardFilters {
  /** `YYYY/YY` (e.g. `2082/83`). Empty string = unset. */
  fiscalYear: string;
  /** `institutions.Country` id, or `""` for "all countries". */
  country: string;
}
