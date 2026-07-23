/** The 9 journey stages (`docs/backend/applicant-journeys/INTEGRATION.md` §5). */
export type JourneyStage =
  | "planning"
  | "profile_building"
  | "shortlisting"
  | "applying"
  | "offer_stage"
  | "visa_stage"
  | "completed"
  | "closed"
  | "deferred";

/**
 * The 6 stages a Select may offer. Narrower than `JourneyStage` on purpose —
 * `completed`/`closed`/`deferred` are reached only via their own dedicated
 * actions (close/close/defer), so no stage-bearing request payload should
 * even be able to hold them (compile-time, not just by convention) — same
 * pattern as `lead-management`'s `SelectableLeadStage`.
 */
export type SelectableJourneyStage = Exclude<
  JourneyStage,
  "completed" | "closed" | "deferred"
>;

export const SELECTABLE_STAGES: readonly SelectableJourneyStage[] = [
  "planning",
  "profile_building",
  "shortlisting",
  "applying",
  "offer_stage",
  "visa_stage",
] as const;

/** Blank until closed; `other` requires `closure_reason`. */
export type JourneyOutcome =
  | "successful"
  | "withdrawn"
  | "rejected"
  | "not_qualified"
  | "cancelled"
  | "other";

export type JourneyCreationSource = "lead_conversion" | "manual";

/**
 * Shared with `leads` via `core.constants.StudyLevel` on the backend
 * (INTEGRATION.md §2) — duplicated here as a local literal union rather than
 * imported from `lead-management`, since there is no shared types package yet
 * (`.claude/CLAUDE.md` — don't create `@peppermint/types` speculatively) and
 * apps don't cross-import between sibling modules for a single enum.
 */
export type StudyLevel =
  | "school"
  | "certificate"
  | "diploma"
  | "bachelors"
  | "postgraduate_diploma"
  | "masters"
  | "phd"
  | "other";

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

/**
 * Trimmed applicant reference embedded in every journey — a journey never
 * stores a name or phone number itself (`CONCEPT.md` "Relationship to the
 * applicant"). `status` is typed as `string`, not a local enum — the
 * `applicants` app owns `ApplicantStatus` and this module doesn't depend on
 * that sibling's types; re-narrow if/when a shared contract makes that safe.
 */
export interface ApplicantBrief {
  id: string;
  full_name_np: string;
  full_name_en: string;
  status: string;
}

/** Same shape as `leads`/`applicants` — backed by the central `audit` log. */
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

/** `GET /journeys/` row shape (INTEGRATION.md §4) — no closure/deferment/notes fields. */
export interface ApplicantJourney {
  id: string;
  applicant: ApplicantBrief;
  target_country: string;
  target_institution_name: string;
  target_program_name: string;
  study_level: StudyLevel | "";
  field_of_study: string;
  preferred_intake: string;
  /** Decimal string, not a number (INTEGRATION.md §4). */
  budget_amount: string | null;
  budget_currency: string;
  scholarship_interest: boolean;
  stage: JourneyStage;
  creation_source: JourneyCreationSource;
  created_by: UserBrief;
  created_at: string;
  updated_at: string;
}

/** Returned by retrieve, create, update, and every lifecycle action. */
export interface ApplicantJourneyDetail extends ApplicantJourney {
  notes: string;
  outcome: JourneyOutcome | "";
  closure_reason: string;
  closed_at: string | null;
  closed_at_bs: BsDate | null;
  closed_by: UserBrief | null;
  deferred_at: string | null;
  deferred_at_bs: BsDate | null;
  deferred_to_intake: string;
  deferment_reason: string;
  deferred_by: UserBrief | null;
  stage_before_terminal: JourneyStage | "";
}

// ── Write payloads ──────────────────────────────────────────────────────────

/** `applicant` required; `stage` never accepted — always starts `planning` (INTEGRATION.md §7). */
export interface JourneyCreatePayload {
  applicant: string;
  target_country?: string;
  target_institution_name?: string;
  target_program_name?: string;
  study_level?: StudyLevel | "";
  field_of_study?: string;
  preferred_intake?: string;
  /** Decimal string, not a number — matches the read model (INTEGRATION.md §4). */
  budget_amount?: string | null;
  budget_currency?: string;
  scholarship_interest?: boolean;
  notes?: string;
}

/** Same shape minus `applicant` — immutable, dropped by the serializer (INTEGRATION.md §7). */
export type JourneyUpdatePayload = Partial<
  Omit<JourneyCreatePayload, "applicant">
>;

export interface JourneyStageChangePayload {
  stage: SelectableJourneyStage;
}

export interface JourneyDeferPayload {
  to_intake: string;
  reason?: string;
}

/** Request field is `reason`; stored server-side as `closure_reason`. */
export interface JourneyClosePayload {
  outcome: JourneyOutcome;
  reason?: string;
}

export interface JourneyReopenPayload {
  stage?: SelectableJourneyStage;
}
