import type {
  AcademicScoreType,
  LanguageTestPayload,
  LanguageTestType,
  QualificationLevel,
  YearCalendar,
} from "@/components/academic";
import type { NoteCategory } from "@/components/notes-panel";

/** `docs/backend/applicants/INTEGRATION.md` §5. */
export type ApplicantStatus = "active" | "dormant" | "archived";

/** Immutable, server-set — never accepted from a client on any endpoint. */
export type CreationSource = "lead_conversion" | "direct_admin";

export type Gender = "male" | "female" | "other" | "undisclosed";

/** Shared enum shape with `leads` (same underlying validator). */
export type ContactNumberLabel =
  | "mobile"
  | "home"
  | "work"
  | "whatsapp"
  | "viber"
  | "other";

export type AddressType = "permanent" | "current";

export type FamilyRelationship =
  | "father"
  | "mother"
  | "spouse"
  | "sibling"
  | "child"
  | "guardian"
  | "grandfather"
  | "grandmother"
  | "other";

/** `Education.completion_status` — an `ongoing` record carries no `completion_year`. */
export type EducationCompletionStatus = "completed" | "ongoing";

export type HistoryActorType =
  | "superadmin"
  | "admin"
  | "lead_manager"
  | "system"
  | "ai";

export type HistoryAction =
  | "applicant_created"
  | "applicant_updated"
  | "applicant_contact_changed"
  | "applicant_address_changed"
  | "applicant_passport_changed"
  | "applicant_family_changed"
  | "applicant_emergency_contact_changed"
  | "applicant_status_changed"
  | "applicant_restored"
  | "applicant_note_added"
  | "applicant_note_updated"
  | "applicant_note_deleted"
  | "applicant_notes_imported"
  | "applicant_education_changed"
  | "applicant_language_tests_changed"
  | "applicant_assigned"
  | "applicant_unassigned";

/** Never sent by a client. */
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

/** `(applicant, number)` unique; `number` regex shared with `leads`. */
export interface ApplicantContactNumber {
  id?: string;
  number: string;
  label: ContactNumberLabel;
  is_primary: boolean;
}

/** Every component optional; at most one row per `address_type`. */
export interface ApplicantAddress {
  id?: string;
  address_type: AddressType;
  country?: string;
  province?: string;
  district?: string;
  municipality?: string;
  ward?: string;
  street_address?: string;
  postal_code?: string;
}

/** One per applicant — a renewal overwrites it (upsert, not a delta). */
export interface PassportDetail {
  id?: string;
  passport_number: string;
  issuing_country?: string;
  place_of_issue?: string;
  issued_date?: string;
  issued_date_bs?: BsDate;
  expiry_date?: string;
  expiry_date_bs?: BsDate;
}

/** `full_name` may be blank — only `relationship` is required (DATA_CONTRACT §5). */
export interface FamilyMember {
  id?: string;
  relationship: FamilyRelationship;
  full_name?: string;
  occupation?: string;
  contact_number?: string;
  /** Free text, ≤50 — feeds the ward-office (WODA) letters. */
  citizenship_no?: string;
}

/**
 * One education record (INTEGRATION.md §4). Years are bare years **in
 * `year_calendar`** — a BS year spans two AD years, so the calendar is part of
 * the value. Returned newest `completion_year` first, `ongoing` records first.
 */
export interface Education {
  id: string;
  level: QualificationLevel;
  /** The programme or stream ("BBS", "Science"). */
  qualification: string;
  institution: string;
  country: string;
  completion_status: EducationCompletionStatus;
  /** Decimal string (`"3.45"`) or `null`. */
  score: string | null;
  score_type: AcademicScoreType | "";
  /** How the score reads ("GPA (4.0)", "First Division") — a label, not validated. */
  grading_system: string;
  start_year: number | null;
  completion_year: number | null;
  year_calendar: YearCalendar | "";
  /** Set on the record carried over from a converted lead. Read-only. */
  source_lead_id: string | null;
}

/** One language-test result — the same shape as a lead certificate. */
export interface ApplicantLanguageTest {
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
  /** Set on a test carried over from a converted lead's certificates. Read-only. */
  source_lead_id: string | null;
}

/** `relationship` here is free text — deliberately not the `FamilyRelationship` enum. */
export interface EmergencyContact {
  id?: string;
  full_name?: string;
  relationship: string;
  contact_number: string;
  email?: string;
  address?: string;
}

/**
 * Where a person is trying to go — a read model over `applicant_journeys`,
 * projected onto the list and detail responses (DATA_CONTRACT §8). An applicant
 * owns no country of its own: the destination belongs to the journey, and one
 * person may pursue several over the years, so this is an array and an empty one
 * simply means "no journey yet".
 *
 * A pre-catalogue journey has no `Country` row behind it — `country_id` is then
 * `null` and the three `country_*` fields are `""`, leaving the free-text
 * `target_country` as the only destination there is.
 */
export interface ApplicantDestination {
  journey_id: string;
  stage: string;
  country_id: string | null;
  country_code: string;
  country_name: string;
  target_country: string;
}

/**
 * `GET /applicants/` row shape — trimmed relative to detail: it carries
 * `contact_numbers`, but not the addresses/passport/family/emergency
 * collections.
 */
export interface Applicant {
  id: string;
  /**
   * The one name field. English-only since DATA_CONTRACT v1.3.0 dropped the
   * `_np`/`_romanized` columns and renamed `_en` to bare — "a Roman name, an
   * independent identity, not a translation".
   */
  full_name: string;
  date_of_birth: string | null;
  date_of_birth_bs: BsDate | null;
  gender: Gender;
  nationality: string;
  email: string;
  status: ApplicantStatus;
  creation_source: CreationSource;
  created_by: UserBrief;
  /**
   * The one staff member notified about this file, or `null`. **Routing only —
   * never access control**: every Admin and Lead Manager reads and edits every
   * applicant whoever it names. Set only through `POST /assign/`.
   */
  assigned_to: UserBrief | null;
  contact_numbers: ApplicantContactNumber[];
  /** Derived at read time from the person's journeys — never stored, never written. */
  destinations: ApplicantDestination[];
  created_at: string;
  updated_at: string;
}

/** Returned by retrieve, create, update, and the status/restore/assign actions. */
export interface ApplicantDetail extends Applicant {
  /** Free text, ≤50. Withheld from the audit log (`<changed>`). */
  citizenship_no: string;
  /** Free text, ≤100. */
  citizenship_issue_district: string;
  /** Free text, ≤50. Withheld from the audit log (`<changed>`). */
  national_id_no: string;
  addresses: ApplicantAddress[];
  passport: PassportDetail | null;
  family_members: FamilyMember[];
  emergency_contacts: EmergencyContact[];
  educations: Education[];
  language_tests: ApplicantLanguageTest[];
  /** Read through the reverse accessor — `null` for a directly created applicant. */
  originating_lead_id: string | null;
}

/**
 * Sourced from the central `audit` log — nested-collection events carry only a
 * **count** in `metadata`, never the replaced values.
 */
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

/**
 * `GET /applicants/<id>/notes/` row — a lead note's shape plus
 * `source_lead_id` (set on notes copied over from the converted lead).
 */
export interface ApplicantNote {
  id: string;
  category: NoteCategory;
  body: string;
  noted_at: string;
  noted_at_bs: BsDate | null;
  is_backdated: boolean;
  source_lead_id: string | null;
  author: UserBrief;
  updated_by: UserBrief | null;
  created_at: string;
  updated_at: string;
}

// ── Write payloads ──────────────────────────────────────────────────────────
//
// `status`/`creation_source`/`created_by`/`assigned_to` are never accepted by
// create/update (INTEGRATION.md §3/§7) — deliberately absent from those payload
// types, not just omitted by convention. Status and assignment move only through
// their own actions below.

export interface ContactNumberInput {
  id?: string;
  number: string;
  label: ContactNumberLabel;
  is_primary: boolean;
}

export interface AddressInput {
  address_type: AddressType;
  country?: string;
  province?: string;
  district?: string;
  municipality?: string;
  ward?: string;
  street_address?: string;
  postal_code?: string;
}

export interface PassportInput {
  passport_number: string;
  issuing_country?: string;
  place_of_issue?: string;
  /** `null` explicitly clears the field — `undefined`/omitted leaves it untouched (PATCH semantics). */
  issued_date?: string | null;
  /** `null` explicitly clears the field — `undefined`/omitted leaves it untouched (PATCH semantics). */
  expiry_date?: string | null;
}

export interface FamilyMemberInput {
  relationship: FamilyRelationship;
  full_name?: string;
  occupation?: string;
  contact_number?: string;
  citizenship_no?: string;
}

/**
 * One `educations[]` entry. `score` + `score_type` travel together (both set
 * or both blank); `year_calendar` is required whenever a year is given; an
 * `ongoing` record has no `completion_year`. `id`/`source_lead_id` are never
 * sent — the list replaces wholesale and `source_lead_id` is not writable.
 */
export interface EducationInput {
  level: QualificationLevel;
  qualification: string;
  institution: string;
  country: string;
  completion_status: EducationCompletionStatus;
  score: number | null;
  score_type: AcademicScoreType | "";
  grading_system: string;
  start_year: number | null;
  completion_year: number | null;
  year_calendar: YearCalendar | "";
}

export interface EmergencyContactInput {
  full_name?: string;
  relationship: string;
  contact_number: string;
  email?: string;
  address?: string;
}

/**
 * `contact_numbers`/`addresses`/`family_members`/`emergency_contacts` **replace
 * the whole set** on update (never a delta); `passport` **upserts** the single
 * record. `status` is deliberately absent — never writable here; it moves only
 * through the dedicated status-change action.
 */
export interface ApplicantCreatePayload {
  full_name: string;
  /** `null` explicitly clears the field — `undefined`/omitted leaves it untouched (PATCH semantics). */
  date_of_birth?: string | null;
  /** `""` explicitly clears to blank/undisclosed — matches the model's own blank-when-unknown state. */
  gender?: Gender | "";
  nationality?: string;
  email?: string;
  citizenship_no?: string;
  citizenship_issue_district?: string;
  national_id_no?: string;
  contact_numbers: ContactNumberInput[];
  addresses?: AddressInput[];
  passport?: PassportInput;
  family_members?: FamilyMemberInput[];
  emergency_contacts?: EmergencyContactInput[];
  /**
   * Replaced wholesale; `[]` clears; **omit to leave untouched**. Resending a
   * record carried over from a lead drops its `source_lead_id`, so the form
   * only sends this when the list actually changed.
   */
  educations?: EducationInput[];
  /** Same replace/omit rules as `educations`. */
  language_tests?: LanguageTestPayload[];
}

export type ApplicantUpdatePayload = Partial<ApplicantCreatePayload>;

/** `POST /status/` — can archive, but can no longer leave `archived` (409). */
export interface StatusChangePayload {
  status: ApplicantStatus;
}

/** `POST /restore/` — Admin only; returns the pre-archive status. */
export interface RestorePayload {
  /** Optional, ≤2000 characters. */
  reason?: string;
}

/** `POST /assign/` — the key is required; `null` clears. No `me` shorthand here. */
export interface AssignPayload {
  assigned_to: string | null;
}
