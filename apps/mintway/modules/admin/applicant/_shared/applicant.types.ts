/**
 * Applicant CRM domain shapes. Source of truth: `.todo/applications/`
 * (`INTEGRATION.md` §3–4, `DATA_CONTRACT.md` §1–14, `API.md`). Responses are
 * role-projected — a staff token and an admin token calling the same GET receive
 * different field sets — so admin-only fields are modelled as optional and the UI
 * gates on the signed-in role (never on field presence).
 */

// ── Enums ───────────────────────────────────────────────────────────────────

export type LifecycleStage = "interested" | "potential" | "applicant";

export type EngagementStatus =
  | "active"
  | "on_hold"
  | "lost"
  | "disqualified"
  | "withdrawn"
  | "archived";

export type Gender = "male" | "female" | "other" | "undisclosed";

export type LeadSource =
  | "walk_in"
  | "referral"
  | "online"
  | "phone"
  | "social_media"
  | "event"
  | "agent"
  | "other";

export type FollowUpPriority = "low" | "normal" | "high" | "urgent";

export type AddressType =
  | "current"
  | "permanent"
  | "mailing"
  | "foreign"
  | "other";

export type LockAction = "locked" | "unlocked";

export type IdentityDocumentType =
  | "passport"
  | "citizenship"
  | "national_id"
  | "birth_certificate"
  | "driving_licence"
  | "other";

export type VerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

export type LanguageTestType = "ielts" | "pte" | "toefl" | "duolingo" | "other";

export type Proficiency =
  | "beginner"
  | "elementary"
  | "intermediate"
  | "advanced"
  | "proficient"
  | "native";

export type CompletionStatus = "completed" | "ongoing" | "incomplete";

export type MediaCategory =
  | "profile_photo"
  | "passport_photo"
  | "passport_scan"
  | "citizenship_scan"
  | "national_id_scan"
  | "birth_certificate"
  | "academic_document"
  | "language_certificate"
  | "financial_evidence"
  | "visa_document"
  | "application_document"
  | "other";

/** Non-`profile_photo` categories (evidence media; §7). */
export type EvidenceMediaCategory = Exclude<MediaCategory, "profile_photo">;

export type InteractionType =
  | "inquiry"
  | "call"
  | "email"
  | "message"
  | "office_visit"
  | "counselling"
  | "document_request"
  | "follow_up"
  | "other";

export type InteractionDirection = "inbound" | "outbound" | "internal";

export type EligibilityResult =
  | "suitable"
  | "conditionally_suitable"
  | "unsuitable"
  | "pending";

export type SponsorType =
  | "self"
  | "family"
  | "person"
  | "employer"
  | "organization"
  | "other";

export type VisaDecision = "approved" | "refused" | "withdrawn" | "pending";

export type ConsentType =
  | "data_processing"
  | "document_preparation"
  | "information_sharing"
  | "marketing"
  | "other";

export type ConsentStatus = "granted" | "withdrawn" | "expired";

export type CaseStatus =
  | "planning"
  | "document_collection"
  | "application_preparation"
  | "submitted"
  | "offer_received"
  | "visa_preparation"
  | "visa_submitted"
  | "visa_approved"
  | "visa_refused"
  | "travel_preparation"
  | "completed"
  | "withdrawn"
  | "archived";

// ── Shared value objects ──────────────────────────────────────────────────────

/** Bikram Sambat sibling emitted alongside protected user-facing dates (§2). */
export interface BsDate {
  year: number;
  month: number;
  day: number;
  month_name_en: string;
  month_name_np: string;
  display_en: string;
  display_np: string;
}

/** Masked duplicate candidate returned in create `meta` (never a block, §11.2). */
export interface DuplicateMatch {
  applicant_code: string;
  display_name: string;
  phone_match: boolean;
  email_match: boolean;
  /** Present on identity-document dedupe (§5.2). */
  identity_match?: boolean;
}

/** Create/mutation `meta` carrying a non-blocking duplicate warning. */
export interface DuplicateMeta {
  possible_duplicate?: boolean;
  matches?: DuplicateMatch[];
}

// ── Applicant ─────────────────────────────────────────────────────────────────

/**
 * Applicant record (detail + list row). Staff receive the required fields only;
 * admin adds the protected fields, all optional here so one type serves both
 * projections. `record_version` is mandatory on every mutation.
 */
export interface Applicant {
  id: string;
  applicant_code: string;
  first_name: string;
  middle_name?: string;
  last_name?: string;
  full_name: string;
  name_native?: string;
  preferred_display_name?: string;
  nationality?: string;
  primary_email?: string;
  alternate_email?: string;
  primary_phone?: string;
  alternate_phone?: string;
  lead_source?: LeadSource;
  lead_source_detail?: string;
  initial_interest?: string;
  lifecycle_stage: LifecycleStage;
  engagement_status: EngagementStatus;
  is_locked: boolean;
  record_version: number;
  profile_image_url?: string | null;
  created_at: string;
  updated_at: string;

  // ── admin-only projection (absent on a staff token) ──
  date_of_birth?: string | null;
  date_of_birth_bs?: BsDate | null;
  gender?: Gender;
  religion?: string;
  full_name_romanized?: string;
  summary?: string;
  eligibility_summary?: string;
  counselling_notes?: string;
  last_contacted_at?: string | null;
  next_follow_up_at?: string | null;
  follow_up_priority?: FollowUpPriority;
  converted_at?: string | null;
  locked_at?: string | null;
  lock_reason?: string;
  archived_at?: string | null;
  merged_into?: string | null;
  merged_at?: string | null;
}

/** List row — same shape; the list projection simply omits admin fields for staff. */
export type ApplicantListRow = Applicant;

// ── Addresses ─────────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  address_type: AddressType;
  country?: string;
  province_or_state?: string;
  district?: string;
  municipality?: string;
  ward?: string;
  locality?: string;
  street?: string;
  postal_code?: string;
  address_text?: string;
  is_primary: boolean;
  valid_from?: string | null;
  valid_to?: string | null;
  created_at: string;
  updated_at: string;
}

// ── History feeds (read-only, append-only) ────────────────────────────────────

export interface LifecycleHistoryEntry {
  id: string;
  from_stage?: LifecycleStage | "";
  into_stage?: LifecycleStage | "";
  from_engagement_status?: EngagementStatus | "";
  into_engagement_status?: EngagementStatus | "";
  reason?: string;
  notes?: string;
  changed_by?: string | null;
  request_id?: string;
  created_at: string;
}

export interface LockHistoryEntry {
  id: string;
  action: LockAction;
  reason: string;
  performed_by?: string | null;
  previous_lock_actor?: string | null;
  request_id?: string;
  created_at: string;
}

export interface MergeRecord {
  id: string;
  source_applicant: string;
  surviving_applicant: string;
  field_resolutions?: Record<string, "duplicate">;
  transferred_counts?: Record<string, number>;
  reason: string;
  performed_by?: string | null;
  request_id?: string;
  created_at: string;
}

// ── Evidence media (§7) ───────────────────────────────────────────────────────

export interface MediaItem {
  id: string;
  category: MediaCategory;
  original_filename?: string;
  mime_type: string;
  size_bytes: number;
  checksum: string;
  confidentiality_level?: "basic" | "protected" | "highly_protected";
  is_current: boolean;
  archived_at?: string | null;
  created_at?: string;
}

// ── Profile children (§9) ─────────────────────────────────────────────────────

export interface EmergencyContact {
  id: string;
  name: string;
  relationship?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_primary?: boolean;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship?: string;
  date_of_birth?: string | null;
  date_of_birth_bs?: BsDate | null;
  age_snapshot?: number | null;
  occupation?: string;
  contact?: string;
  address?: string;
  is_financial_sponsor?: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface IdentityDocument {
  id: string;
  document_type: IdentityDocumentType;
  document_number?: string;
  issuing_country?: string;
  issued_at?: string | null;
  issued_at_bs?: BsDate | null;
  expires_at?: string | null;
  expires_at_bs?: BsDate | null;
  image_front?: string | null;
  image_back?: string | null;
  file?: string | null;
  verification_status?: VerificationStatus;
  verification_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Education {
  id: string;
  institution?: string;
  degree?: string;
  qualification?: string;
  field_of_study?: string;
  program?: string;
  country?: string;
  start_date?: string | null;
  end_date?: string | null;
  completion_status?: CompletionStatus;
  gpa?: string;
  grade?: string;
  grading_system?: string;
  registration_number?: string;
  graduation_year?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LanguageTest {
  id: string;
  test_type: LanguageTestType;
  test_date?: string | null;
  test_date_bs?: BsDate | null;
  overall?: string;
  listening?: string;
  reading?: string;
  writing?: string;
  speaking_score?: string;
  certificate_number?: string;
  expiry_date?: string | null;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkExperience {
  id: string;
  company?: string;
  role?: string;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean;
  country?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  proficiency?: Proficiency;
  notes?: string;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface Training {
  id: string;
  course_or_training: string;
  institution?: string;
  start_date?: string | null;
  end_date?: string | null;
  credential?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LanguageEntry {
  id: string;
  language: string;
  proficiency?: Proficiency;
  is_native?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reference {
  id: string;
  reference_order?: number;
  name: string;
  title?: string;
  institution?: string;
  address?: string;
  email?: string;
  contact?: string;
  relationship_to_applicant?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicGrading {
  id: string;
  context?: string;
  month_or_period?: string;
  grammar?: string;
  conversation?: string;
  composition?: string;
  listening?: string;
  reading?: string;
  total_days?: number | null;
  class_hours?: string;
  present?: number | null;
  absent?: number | null;
  attendance_percentage?: string;
  created_at: string;
  updated_at: string;
}

/** Interest profile — OneToOne (one per applicant, §6). */
export interface InterestProfile {
  id: string;
  preferred_countries?: string[];
  preferred_study_levels?: string[];
  preferred_fields?: string[];
  preferred_programs?: string[];
  preferred_cities?: string[];
  preferred_intake?: string;
  preferred_year?: string;
  estimated_budget?: string;
  budget_currency?: string;
  funding_method?: string;
  study_gap_summary?: string;
  travel_history_summary?: string;
  visa_refusal_history_summary?: string;
  interests?: string;
  qualification_summary?: string;
  target_program?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ── CRM / compliance children (§8) ────────────────────────────────────────────

export interface Interaction {
  id: string;
  interaction_type: InteractionType;
  direction?: InteractionDirection;
  occurred_at: string;
  summary?: string;
  outcome?: string;
  next_follow_up_at?: string | null;
  follow_up_priority?: FollowUpPriority;
  is_confidential?: boolean;
  application_case?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sponsor {
  id: string;
  sponsor_type: SponsorType;
  name?: string;
  relationship?: string;
  occupation?: string;
  organization?: string;
  address?: string;
  country?: string;
  phone?: string;
  email?: string;
  annual_income?: string;
  annual_income_currency?: string;
  funding_amount?: string;
  funding_amount_currency?: string;
  funding_source?: string;
  is_primary?: boolean;
  verification_status?: VerificationStatus;
  verification_notes?: string;
  application_case?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TravelHistory {
  id: string;
  country: string;
  purpose?: string;
  travelled_from?: string | null;
  travelled_to?: string | null;
  visa_type?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VisaHistory {
  id: string;
  country: string;
  visa_type?: string;
  application_date?: string | null;
  decision_date?: string | null;
  decision?: VisaDecision;
  reference_number?: string;
  refusal_reason?: string;
  notes?: string;
  evidence_media?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Consent {
  id: string;
  consent_type: ConsentType;
  status: ConsentStatus;
  consent_text_version?: string;
  captured_at?: string | null;
  expires_at?: string | null;
  withdrawn_at?: string | null;
  evidence_media?: string | null;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/** Qualification assessment — append-only/supersede (§9). No edit/delete. */
export interface QualificationAssessment {
  id: string;
  assessment_date?: string | null;
  assessment_date_bs?: BsDate | null;
  assessed_by?: string | null;
  preferred_destination?: string;
  preferred_program_or_field?: string;
  education_summary?: string;
  study_gap_summary?: string;
  language_summary?: string;
  financial_summary?: string;
  funding_summary?: string;
  visa_risk_summary?: string;
  eligibility_result?: EligibilityResult;
  conditions?: string;
  recommendation?: string;
  notes?: string;
  valid_until?: string | null;
  is_current: boolean;
  created_at: string;
}

// ── Application cases (§10) ────────────────────────────────────────────────────

export interface ApplicationCase {
  id: string;
  applicant: string;
  case_code: string;
  destination_country?: string;
  institution?: string;
  program?: string;
  study_level?: string;
  intake?: string;
  application_reference?: string;
  case_status: CaseStatus;
  assigned_counsellor?: string | null;
  opened_at?: string | null;
  closed_at?: string | null;
  outcome?: string;
  outcome_reason?: string;
  notes?: string;
  record_version: number;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationCaseStatusHistoryEntry {
  id: string;
  from_status?: CaseStatus | "";
  into_status?: CaseStatus | "";
  reason?: string;
  notes?: string;
  changed_by?: string | null;
  request_id?: string;
  created_at: string;
}

// ── Assignments (§11) ─────────────────────────────────────────────────────────

export interface Assignment {
  id: string;
  application_case?: string | null;
  assigned_to: string;
  assigned_by?: string | null;
  assigned_at: string;
  ended_at?: string | null;
  assignment_reason?: string;
  unassignment_reason?: string;
  is_current: boolean;
}
