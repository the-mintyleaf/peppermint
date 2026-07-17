/**
 * Display metadata for the applicant enums — labels, badge colors, and `<Select>`
 * option arrays. Columns and forms import from here so a label/color is defined once.
 * Values mirror `INTEGRATION.md` §4.
 */

import type {
  AddressType,
  CaseStatus,
  CompletionStatus,
  ConsentStatus,
  ConsentType,
  EligibilityResult,
  EngagementStatus,
  EvidenceMediaCategory,
  FollowUpPriority,
  Gender,
  IdentityDocumentType,
  InteractionDirection,
  InteractionType,
  LanguageTestType,
  LeadSource,
  LifecycleStage,
  Proficiency,
  SponsorType,
  VerificationStatus,
  VisaDecision,
} from "./applicant.types";

export interface SelectOption {
  value: string;
  label: string;
}

/** Turn a `{ value: label }` map into a Mantine `<Select>` data array. */
export function toOptions(map: Record<string, string>): SelectOption[] {
  return Object.entries(map).map(([value, label]) => ({ value, label }));
}

// ── Lifecycle / engagement ────────────────────────────────────────────────────

export const LIFECYCLE_STAGE_LABELS: Record<LifecycleStage, string> = {
  interested: "Interested",
  potential: "Potential",
  applicant: "Applicant",
};

export const LIFECYCLE_STAGE_COLORS: Record<LifecycleStage, string> = {
  interested: "gray",
  potential: "blue",
  applicant: "teal",
};

export const ENGAGEMENT_STATUS_LABELS: Record<EngagementStatus, string> = {
  active: "Active",
  on_hold: "On hold",
  lost: "Lost",
  disqualified: "Disqualified",
  withdrawn: "Withdrawn",
  archived: "Archived",
};

export const ENGAGEMENT_STATUS_COLORS: Record<EngagementStatus, string> = {
  active: "teal",
  on_hold: "yellow",
  lost: "gray",
  disqualified: "red",
  withdrawn: "orange",
  archived: "dark",
};

/** Engagement statuses that require a reason on transition (§1.6). */
export const ENGAGEMENT_REASON_REQUIRED: EngagementStatus[] = [
  "lost",
  "disqualified",
  "withdrawn",
  "archived",
];

/** Forward-only stage targets reachable from the current stage (§1.6). */
export const FORWARD_STAGES: Record<LifecycleStage, LifecycleStage[]> = {
  interested: ["potential", "applicant"],
  potential: ["applicant"],
  applicant: [],
};

/**
 * Engagement statuses selectable as a transition target from `current`: every status
 * except the current one and `archived` (archiving is a distinct row action, not an
 * engagement switch). Mirrors the modal's own option filter.
 */
export function engagementTargets(
  current: EngagementStatus,
): EngagementStatus[] {
  return (Object.keys(ENGAGEMENT_STATUS_LABELS) as EngagementStatus[]).filter(
    (s) => s !== current && s !== "archived",
  );
}

export const GENDER_LABELS: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
  undisclosed: "Undisclosed",
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  walk_in: "Walk-in",
  referral: "Referral",
  online: "Online",
  phone: "Phone",
  social_media: "Social media",
  event: "Event",
  agent: "Agent",
  other: "Other",
};

export const FOLLOW_UP_PRIORITY_LABELS: Record<FollowUpPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export const FOLLOW_UP_PRIORITY_COLORS: Record<FollowUpPriority, string> = {
  low: "gray",
  normal: "blue",
  high: "orange",
  urgent: "red",
};

// ── Addresses ─────────────────────────────────────────────────────────────────

export const ADDRESS_TYPE_LABELS: Record<AddressType, string> = {
  current: "Current",
  permanent: "Permanent",
  mailing: "Mailing",
  foreign: "Foreign",
  other: "Other",
};

// ── Identity / verification ───────────────────────────────────────────────────

export const IDENTITY_DOCUMENT_TYPE_LABELS: Record<
  IdentityDocumentType,
  string
> = {
  passport: "Passport",
  citizenship: "Citizenship",
  national_id: "National ID",
  birth_certificate: "Birth certificate",
  driving_licence: "Driving licence",
  other: "Other",
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  unverified: "Unverified",
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
};

export const VERIFICATION_STATUS_COLORS: Record<VerificationStatus, string> = {
  unverified: "gray",
  pending: "yellow",
  verified: "teal",
  rejected: "red",
};

// ── Education / language / skills ─────────────────────────────────────────────

export const LANGUAGE_TEST_TYPE_LABELS: Record<LanguageTestType, string> = {
  ielts: "IELTS",
  pte: "PTE",
  toefl: "TOEFL",
  duolingo: "Duolingo",
  other: "Other",
};

export const COMPLETION_STATUS_LABELS: Record<CompletionStatus, string> = {
  completed: "Completed",
  ongoing: "Ongoing",
  incomplete: "Incomplete",
};

export const PROFICIENCY_LABELS: Record<Proficiency, string> = {
  beginner: "Beginner",
  elementary: "Elementary",
  intermediate: "Intermediate",
  advanced: "Advanced",
  proficient: "Proficient",
  native: "Native",
};

// ── Evidence media ────────────────────────────────────────────────────────────

export const EVIDENCE_MEDIA_CATEGORY_LABELS: Record<
  EvidenceMediaCategory,
  string
> = {
  passport_photo: "Passport photo",
  passport_scan: "Passport scan",
  citizenship_scan: "Citizenship scan",
  national_id_scan: "National ID scan",
  birth_certificate: "Birth certificate",
  academic_document: "Academic document",
  language_certificate: "Language certificate",
  financial_evidence: "Financial evidence",
  visa_document: "Visa document",
  application_document: "Application document",
  other: "Other",
};

// ── CRM / compliance ──────────────────────────────────────────────────────────

export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  inquiry: "Inquiry",
  call: "Call",
  email: "Email",
  message: "Message",
  office_visit: "Office visit",
  counselling: "Counselling",
  document_request: "Document request",
  follow_up: "Follow-up",
  other: "Other",
};

export const INTERACTION_DIRECTION_LABELS: Record<
  InteractionDirection,
  string
> = {
  inbound: "Inbound",
  outbound: "Outbound",
  internal: "Internal",
};

export const ELIGIBILITY_RESULT_LABELS: Record<EligibilityResult, string> = {
  suitable: "Suitable",
  conditionally_suitable: "Conditionally suitable",
  unsuitable: "Unsuitable",
  pending: "Pending",
};

export const ELIGIBILITY_RESULT_COLORS: Record<EligibilityResult, string> = {
  suitable: "teal",
  conditionally_suitable: "yellow",
  unsuitable: "red",
  pending: "gray",
};

export const SPONSOR_TYPE_LABELS: Record<SponsorType, string> = {
  self: "Self",
  family: "Family",
  person: "Person",
  employer: "Employer",
  organization: "Organization",
  other: "Other",
};

export const VISA_DECISION_LABELS: Record<VisaDecision, string> = {
  approved: "Approved",
  refused: "Refused",
  withdrawn: "Withdrawn",
  pending: "Pending",
};

export const VISA_DECISION_COLORS: Record<VisaDecision, string> = {
  approved: "teal",
  refused: "red",
  withdrawn: "orange",
  pending: "gray",
};

export const CONSENT_TYPE_LABELS: Record<ConsentType, string> = {
  data_processing: "Data processing",
  document_preparation: "Document preparation",
  information_sharing: "Information sharing",
  marketing: "Marketing",
  other: "Other",
};

export const CONSENT_STATUS_LABELS: Record<ConsentStatus, string> = {
  granted: "Granted",
  withdrawn: "Withdrawn",
  expired: "Expired",
};

export const CONSENT_STATUS_COLORS: Record<ConsentStatus, string> = {
  granted: "teal",
  withdrawn: "orange",
  expired: "gray",
};

// ── Application cases ──────────────────────────────────────────────────────────

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  planning: "Planning",
  document_collection: "Document collection",
  application_preparation: "Application preparation",
  submitted: "Submitted",
  offer_received: "Offer received",
  visa_preparation: "Visa preparation",
  visa_submitted: "Visa submitted",
  visa_approved: "Visa approved",
  visa_refused: "Visa refused",
  travel_preparation: "Travel preparation",
  completed: "Completed",
  withdrawn: "Withdrawn",
  archived: "Archived",
};

export const CASE_STATUS_COLORS: Record<CaseStatus, string> = {
  planning: "gray",
  document_collection: "blue",
  application_preparation: "blue",
  submitted: "indigo",
  offer_received: "grape",
  visa_preparation: "cyan",
  visa_submitted: "cyan",
  visa_approved: "teal",
  visa_refused: "red",
  travel_preparation: "lime",
  completed: "green",
  withdrawn: "orange",
  archived: "dark",
};

/** Case statuses that require a reason on transition (§10.3). */
export const CASE_REASON_REQUIRED: CaseStatus[] = [
  "visa_refused",
  "withdrawn",
  "archived",
];
