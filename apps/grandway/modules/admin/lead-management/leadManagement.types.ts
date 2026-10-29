import type {
  AcademicScoreType,
  LanguageTestPayload,
  LanguageTestType,
  QualificationLevel,
  YearCalendar,
} from "@/components/academic";
import type { NoteCategory } from "@/components/notes-panel";

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

/** `INTEGRATION.md` §4 `BsDate` — never sent, only the value of a `<field>_bs` key. */
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

/**
 * Shared shape of `LeadSource` and `LossReason`.
 *
 * One name, in English. The bilingual `name_np`/`name_en`/`name_romanized`
 * triple this used to carry was dropped server-side by
 * `leads/migrations/0005_english_only_names.py` — the project is English-only.
 */
export interface ReferenceEntry {
  id: string;
  code: string;
  name: string;
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

/**
 * `highest_qualification` is the FREE-TEXT programme or stream ("BBS",
 * "Science"); `highest_qualification_level` is the enum level. The two pairs —
 * `academic_score` + `academic_score_type`, `pass_year` + `pass_year_calendar`
 * — always travel together (`LEADS_STUDY_INTEREST_INVALID` otherwise).
 */
export interface StudyInterest {
  interested_countries: string[];
  study_level: StudyLevel | "";
  field_of_study: string;
  preferred_intake: string;
  budget_amount: string | null;
  budget_currency: string;
  scholarship_interest: boolean;
  highest_qualification: string;
  highest_qualification_level: QualificationLevel | "";
  /** Decimal string (`"3.45"`) or `null`. */
  academic_score: string | null;
  academic_score_type: AcademicScoreType | "";
  pass_year: number | null;
  pass_year_calendar: YearCalendar | "";
  language_test_status: LanguageTestStatus | "";
  interest_notes: string;
}

/**
 * One of the lead's `language_certificates[]` (≤ `LEAD_CERTIFICATE_LIMIT`).
 * Becomes an applicant `LanguageTest` at conversion, field for field. Scores
 * are decimal strings with one place, or `null`.
 */
export interface LanguageCertificate {
  id: string;
  test_type: LanguageTestType;
  overall_score: string | null;
  listening_score: string | null;
  reading_score: string | null;
  writing_score: string | null;
  speaking_score: string | null;
  test_date: string | null;
  test_date_bs: BsDate | null;
  certificate_number: string;
  expiry_date: string | null;
  expiry_date_bs: BsDate | null;
  created_at: string;
  updated_at: string;
}

/** `GET /leads/` row shape — trimmed relative to detail (no `study_interest`/lifecycle fields). */
export interface Lead {
  id: string;
  /** One name, in English — see `ReferenceEntry` for why there is no `_np`/`_romanized` sibling. */
  full_name: string;
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
  language_certificates: LanguageCertificate[];
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
  /**
   * Soft delete (Admin only). `null` on every lead a Lead Manager can see —
   * only an Admin ever receives a lead with `deleted_at` set (`?deleted=true`,
   * a retrieve by id, or the delete response). Not the same as `lost`.
   */
  deleted_at: string | null;
  deleted_at_bs: BsDate | null;
  deleted_by: UserBrief | null;
  /** `""` unless deleted. */
  delete_reason: string;
}

/** `POST /leads/<id>/convert/` response — empty request body. */
export interface ConvertLeadResponse {
  lead: LeadDetail;
  applicant_id: string;
  journey_id: string;
}

/**
 * `noted_at` is when it happened (user-set, may be backdated); `created_at`
 * is when it was saved. Structurally satisfies `NotesPanelNote`, so the shared
 * `NotesPanel` renders it unmapped. `category` may gain values later (e.g.
 * `call`) — rendered as the raw string.
 */
export interface LeadNote {
  id: string;
  category: NoteCategory;
  body: string;
  noted_at: string;
  noted_at_bs: BsDate | null;
  is_backdated: boolean;
  author: UserBrief;
  updated_by: UserBrief | null;
  created_at: string;
  updated_at: string;
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
  | "lead_note_updated"
  | "lead_note_deleted"
  | "lead_deleted"
  | "lead_restored"
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
  highest_qualification_level?: QualificationLevel | "";
  /** Sent together with `academic_score_type` — both set, or both blank. */
  academic_score?: number | null;
  academic_score_type?: AcademicScoreType | "";
  /** Sent together with `pass_year_calendar` — both set, or both blank. */
  pass_year?: number | null;
  pass_year_calendar?: YearCalendar | "";
  language_test_status?: LanguageTestStatus | "";
  interest_notes?: string;
}

/**
 * `stage` is deliberately absent — not writable via create/update (INTEGRATION.md §7).
 * `language_certificates` REPLACES the whole set (`[]` clears it; omitting the
 * key leaves it untouched), like `contact_numbers`. At most 10.
 */
export interface LeadCreatePayload {
  full_name: string;
  email?: string;
  address?: string;
  source: string;
  source_detail?: string;
  contact_numbers: ContactNumberInput[];
  study_interest?: StudyInterestInput;
  language_certificates?: LanguageTestPayload[];
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

/**
 * The board's quick "Add visit note" — `POST /leads/<id>/notes/` with
 * `category: "visit"` fixed by the hook. `noted_at` omitted = now; when sent
 * it carries a UTC offset and is ≤ now + 5 min (`LEADS_NOTE_FUTURE_DATE`).
 */
export interface VisitNotePayload {
  body: string;
  noted_at?: string;
}

export interface MarkLostPayload {
  loss_reason: string;
  detail?: string;
}

export interface ReopenPayload {
  stage?: SelectableLeadStage;
}

/** `DELETE /leads/<id>/` JSON body — required, ≤ `LEAD_DELETE_REASON_MAX`. */
export interface DeleteLeadPayload {
  reason: string;
}

/** `POST /leads/<id>/restore/` — optional reason, ≤ `LEAD_RESTORE_REASON_MAX`. */
export interface RestoreLeadPayload {
  reason?: string;
}

export const LEAD_DELETE_REASON_MAX = 500;
export const LEAD_RESTORE_REASON_MAX = 2000;

/**
 * Server-side list filters (`GET /leads/`). The board's in-memory category
 * tabs can't apply these — the list shape carries neither the study interest
 * nor the certificates — so they scope the aggregate fetch instead.
 */
export interface LeadListFilters {
  highestQualificationLevel?: QualificationLevel;
  languageTestStatus?: LanguageTestStatus;
  languageTestType?: LanguageTestType;
}

/**
 * `code` is immutable after creation (INTEGRATION.md §8) — present here since
 * this is the *create* shape, but never rendered as an editable field once a
 * `ReferenceEntryUpdatePayload` is in play.
 */
export interface ReferenceEntryCreatePayload {
  code: string;
  name: string;
  requires_detail?: boolean;
  is_active?: boolean;
  display_order?: number;
}

/** Same shape minus `code` — omitted entirely, not just optional, since the backend rejects it on update. */
export type ReferenceEntryUpdatePayload = Partial<
  Omit<ReferenceEntryCreatePayload, "code">
>;
